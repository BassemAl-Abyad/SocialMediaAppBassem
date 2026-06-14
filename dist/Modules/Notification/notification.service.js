"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notification_repo_1 = require("../../DB/repositories/notification.repo");
const notification_model_1 = require("../../DB/Models/notification.model");
const user_repo_1 = require("../../DB/repositories/user.repo");
const user_model_1 = require("../../DB/Models/user.model");
const notification_service_1 = require("../../Utils/services/notification.service");
const error_response_1 = require("../../Utils/response/error.response");
const redis_service_1 = require("../../DB/repositories/redis.service");
const mongoose_1 = require("mongoose");
class NotificationCrudService {
    _notificationRepo = new notification_repo_1.NotificationRepository(notification_model_1.NotificationModel);
    _userRepo = new user_repo_1.UserRepository(user_model_1.UserModel);
    _notificationService;
    constructor() {
        this._notificationService = new notification_service_1.NotificationService();
    }
    createNotification = async (req, res) => {
        const { title, body, recipients, data } = req.body;
        const targetUsers = await this._userRepo.find({
            filter: { _id: { $in: recipients } },
            select: "_id",
        });
        if (targetUsers.length !== recipients.length) {
            throw new error_response_1.NotFoundException("Some recipients are invalid.");
        }
        const notification = await this._notificationRepo.create({
            data: [
                {
                    title,
                    body,
                    data,
                    recipients: recipients.map((id) => new mongoose_1.Types.ObjectId(id)),
                    createdBy: req.user._id,
                    sentAt: new Date(),
                },
            ],
        });
        const tokens = await Promise.all(recipients.map((recipient) => (0, redis_service_1.getFCMs)(recipient)));
        const uniqueTokens = [...new Set(tokens.flat().filter((token) => Boolean(token)))];
        if (uniqueTokens.length) {
            await this._notificationService.sendNotifications({
                tokens: uniqueTokens,
                data: { title, body: JSON.stringify(data || {}) },
            });
        }
        return res.status(201).json({
            message: "Notification created and delivered.",
            data: notification?.[0],
        });
    };
    getNotifications = async (req, res) => {
        const notifications = await this._notificationRepo.find({
            filter: {},
            options: {
                sort: { createdAt: -1 },
                populate: [{ path: "createdBy", select: "firstName lastName username" }],
            },
        });
        return res.status(200).json({ message: "Notifications list.", data: notifications });
    };
    getMyNotifications = async (req, res) => {
        const notifications = await this._notificationRepo.find({
            filter: { recipients: { $in: [req.user._id] } },
            options: {
                sort: { createdAt: -1 },
            },
        });
        return res.status(200).json({ message: "User notifications.", data: notifications });
    };
    updateNotification = async (req, res) => {
        const { notificationId } = req.params;
        const updatePayload = req.body;
        const notification = await this._notificationRepo.findOne({
            filter: { _id: notificationId },
        });
        if (!notification)
            throw new error_response_1.NotFoundException("Notification not found.");
        const updated = await this._notificationRepo.findOneAndUpdate({
            filter: { _id: notificationId },
            update: updatePayload,
            options: { new: true },
        });
        return res.status(200).json({ message: "Notification updated.", data: updated });
    };
    deleteNotification = async (req, res) => {
        const { notificationId } = req.params;
        const notification = await notification_model_1.NotificationModel.findOne({ _id: notificationId });
        if (!notification)
            throw new error_response_1.NotFoundException("Notification not found.");
        await notification.deleteOne();
        return res.status(200).json({ message: "Notification removed." });
    };
    markNotificationRead = async (req, res) => {
        const { notificationId } = req.params;
        const { markRead } = req.query;
        const notification = (await notification_model_1.NotificationModel.findOne({
            _id: notificationId,
            recipients: { $in: [req.user._id] },
        }));
        if (!notification)
            throw new error_response_1.NotFoundException("Notification not found.");
        if (markRead === "false") {
            await notification.markAsUnread(req.user._id);
            return res.status(200).json({ message: "Notification marked unread." });
        }
        await notification.markAsRead(req.user._id);
        return res.status(200).json({ message: "Notification marked read." });
    };
}
exports.default = new NotificationCrudService();
