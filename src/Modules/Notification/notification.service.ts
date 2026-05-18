import { Request, Response } from "express";
import { NotificationRepository } from "../../DB/repositories/notification.repo";
import { NotificationModel } from "../../DB/Models/notification.model";
import { UserRepository } from "../../DB/repositories/user.repo";
import { UserModel } from "../../DB/Models/user.model";
import { NotificationService } from "../../Utils/services/notification.service";
import { NotFoundException } from "../../Utils/response/error.response";
import { getFCMs } from "../../DB/repositories/redis.service";
import { Types } from "mongoose";

class NotificationCrudService {
  private readonly _notificationRepo = new NotificationRepository(NotificationModel);
  private readonly _userRepo = new UserRepository(UserModel);
  private readonly _notificationService: NotificationService;

  constructor() {
    this._notificationService = new NotificationService();
  }

  createNotification = async (req: Request, res: Response) => {
    const { title, body, recipients, data } = req.body;
    const targetUsers = await this._userRepo.find({
      filter: { _id: { $in: recipients } },
      select: "_id",
    });
    if (targetUsers.length !== recipients.length) {
      throw new NotFoundException("Some recipients are invalid.");
    }

    const notification = await this._notificationRepo.create({
      data: [
        {
          title,
          body,
          data,
          recipients: recipients.map((id: string) => new Types.ObjectId(id)),
          createdBy: req.user._id,
          sentAt: new Date(),
        },
      ],
    });

    const tokens = await Promise.all(recipients.map((recipient: string) => getFCMs(recipient)));
    const uniqueTokens = [...new Set(tokens.flat().filter((token): token is string => Boolean(token)))];
    if (uniqueTokens.length) {
      await this._notificationService.sendNotifications({
        tokens: uniqueTokens,
        data: { title, body: JSON.stringify(data || {} ) },
      });
    }

    return res.status(201).json({
      message: "Notification created and delivered.",
      data: notification?.[0],
    });
  };

  getNotifications = async (req: Request, res: Response) => {
    const notifications = await this._notificationRepo.find({
      filter: {},
      options: {
        sort: { createdAt: -1 },
        populate: [{ path: "createdBy", select: "firstName lastName username" }],
      },
    });
    return res.status(200).json({ message: "Notifications list.", data: notifications });
  };

  getMyNotifications = async (req: Request, res: Response) => {
    const notifications = await this._notificationRepo.find({
      filter: { recipients: { $in: [req.user._id] } },
      options: {
        sort: { createdAt: -1 },
      },
    });
    return res.status(200).json({ message: "User notifications.", data: notifications });
  };

  updateNotification = async (req: Request, res: Response) => {
    const { notificationId } = req.params as { notificationId: string };
    const updatePayload = req.body;
    const notification = await this._notificationRepo.findOne({
      filter: { _id: notificationId },
    });
    if (!notification) throw new NotFoundException("Notification not found.");

    const updated = await this._notificationRepo.findOneAndUpdate({
      filter: { _id: notificationId },
      update: updatePayload,
      options: { new: true },
    });

    return res.status(200).json({ message: "Notification updated.", data: updated });
  };

  deleteNotification = async (req: Request, res: Response) => {
    const { notificationId } = req.params as { notificationId: string };
    const notification = await NotificationModel.findOne({ _id: notificationId });
    if (!notification) throw new NotFoundException("Notification not found.");
    await notification.deleteOne();
    return res.status(200).json({ message: "Notification removed." });
  };

  markNotificationRead = async (req: Request, res: Response) => {
    const { notificationId } = req.params as { notificationId: string };
    const { markRead } = req.query as { markRead?: string };
    const notification = await NotificationModel.findOne({
      _id: notificationId,
      recipients: { $in: [req.user._id] },
    });
    if (!notification) throw new NotFoundException("Notification not found.");

    if (markRead === "false") {
      await notification.markAsUnread(req.user._id);
      return res.status(200).json({ message: "Notification marked unread." });
    }
    await notification.markAsRead(req.user._id);
    return res.status(200).json({ message: "Notification marked read." });
  };
}

export default new NotificationCrudService();
