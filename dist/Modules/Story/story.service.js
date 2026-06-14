"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const story_repo_1 = require("../../DB/repositories/story.repo");
const user_repo_1 = require("../../DB/repositories/user.repo");
const story_model_1 = require("../../DB/Models/story.model");
const user_model_1 = require("../../DB/Models/user.model");
const notification_service_1 = require("../../Utils/services/notification.service");
const error_response_1 = require("../../Utils/response/error.response");
const mongoose_1 = require("mongoose");
const redis_service_1 = require("../../DB/repositories/redis.service");
const auth_enum_1 = require("../../Utils/enums/auth.enum");
class StoryService {
    _storyRepo = new story_repo_1.StoryRepository(story_model_1.StoryModel);
    _userRepo = new user_repo_1.UserRepository(user_model_1.UserModel);
    _notificationService;
    constructor() {
        this._notificationService = new notification_service_1.NotificationService();
    }
    createStory = async (req, res) => {
        const { content, attachments = [], availability, tags = [] } = req.body;
        if (tags.length) {
            const taggedUsers = await this._userRepo.find({
                filter: { _id: { $in: tags } },
            });
            if (taggedUsers.length !== tags.length) {
                throw new error_response_1.NotFoundException("Some tagged users could not be found. Verify tag IDs and try again.");
            }
        }
        const story = await this._storyRepo.create({
            data: [
                {
                    content,
                    attachments,
                    availability,
                    tags: tags.map((tag) => new mongoose_1.Types.ObjectId(tag)),
                    createdBy: req.user._id,
                },
            ],
        });
        if (tags.length) {
            const tokens = await Promise.all(tags.map((tag) => (0, redis_service_1.getFCMs)(tag)));
            const uniqueTokens = [...new Set(tokens.flat().filter((token) => Boolean(token)))];
            if (uniqueTokens.length) {
                await this._notificationService.sendNotifications({
                    tokens: uniqueTokens,
                    data: {
                        title: "Story Mention",
                        body: JSON.stringify({
                            message: `${req.user.username} mentioned you in a story.`,
                            storyId: story?.[0]?._id,
                        }),
                    },
                });
            }
        }
        return res.status(201).json({
            message: "Story created successfully.",
            data: story?.[0],
        });
    };
    getFeed = async (req, res) => {
        const { page, limit } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const stories = await this._storyRepo.find({
            filter: {
                $or: [
                    { availability: auth_enum_1.AvailabilityEnum.PUBLIC },
                    { createdBy: req.user._id },
                    { tags: { $in: [req.user._id] } },
                ],
            },
            options: {
                populate: [{ path: "createdBy", select: "firstName lastName username ProfilePic" }],
                skip,
                limit: Number(limit),
            },
        });
        return res.status(200).json({ message: "Story feed fetched.", data: stories });
    };
    getUserStories = async (req, res) => {
        const { userId } = req.params;
        const targetUserId = userId || req.user._id.toString();
        const stories = await this._storyRepo.find({
            filter: {
                createdBy: targetUserId,
                $or: [
                    { availability: auth_enum_1.AvailabilityEnum.PUBLIC },
                    { createdBy: req.user._id },
                    { tags: { $in: [req.user._id] } },
                ],
            },
            options: {
                populate: [{ path: "createdBy", select: "firstName lastName username ProfilePic" }],
            },
        });
        return res.status(200).json({ message: "User stories fetched.", data: stories });
    };
    deleteStory = async (req, res) => {
        const { storyId } = req.params;
        const story = await this._storyRepo.findOne({ filter: { _id: storyId } });
        if (!story)
            throw new error_response_1.NotFoundException("Story not found.");
        if (story.createdBy.toString() !== req.user._id.toString()) {
            throw new error_response_1.NotFoundException("Only the story owner may delete this story.");
        }
        await story.softDelete();
        return res.status(200).json({ message: "Story deleted successfully." });
    };
    restoreStory = async (req, res) => {
        const { storyId } = req.params;
        const story = await story_model_1.StoryModel.findOne({ _id: storyId, deletedAt: { $exists: true } }).setQuery({ includeDeleted: true });
        if (!story)
            throw new error_response_1.NotFoundException("Story not found.");
        if (story.createdBy.toString() !== req.user._id.toString()) {
            throw new error_response_1.NotFoundException("Only the story owner may restore this story.");
        }
        await story.restore();
        return res.status(200).json({ message: "Story restored successfully.", data: story });
    };
    hardDeleteStory = async (req, res) => {
        const { storyId } = req.params;
        const story = await story_model_1.StoryModel.findOne({ _id: storyId }).setQuery({ includeDeleted: true });
        if (!story)
            throw new error_response_1.NotFoundException("Story not found.");
        await story.hardDelete();
        return res.status(200).json({ message: "Story permanently removed." });
    };
}
exports.default = new StoryService();
