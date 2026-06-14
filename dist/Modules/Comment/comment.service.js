"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notification_service_1 = require("../../Utils/services/notification.service");
const user_repo_1 = require("../../DB/repositories/user.repo");
const post_repo_1 = require("../../DB/repositories/post.repo");
const post_model_1 = require("../../DB/Models/post.model");
const user_model_1 = require("../../DB/Models/user.model");
const post_service_1 = require("../Post/post.service");
const error_response_1 = require("../../Utils/response/error.response");
const mongoose_1 = require("mongoose");
const redis_service_1 = require("../../DB/repositories/redis.service");
const comment_repo_1 = require("../../DB/repositories/comment.repo");
const comment_model_1 = require("../../DB/Models/comment.model");
const auth_enum_1 = require("../../Utils/enums/auth.enum");
class CommentService {
    _userRepo = new user_repo_1.UserRepository(user_model_1.UserModel);
    _postRepo = new post_repo_1.PostRepository(post_model_1.PostModel);
    _commentRepo = new comment_repo_1.CommentRepository(comment_model_1.CommentModel);
    _notificationService;
    constructor() {
        this._notificationService = new notification_service_1.NotificationService();
    }
    listComments = async (req, res) => {
        const { postId } = req.params;
        const comments = await this._commentRepo.find({
            filter: { postId, commentId: { $exists: false } },
            options: {
                populate: [
                    { path: "createdBy", select: "firstName lastName username ProfilePic" },
                    { path: "tags", select: "firstName lastName username ProfilePic" },
                ],
            },
        });
        return res.status(200).json({ message: "Comments loaded.", data: comments });
    };
    createComment = async (req, res) => {
        const { postId } = req.params;
        const { tags = [], content } = req.body;
        const post = await this._postRepo.findOne({
            filter: { _id: postId, $or: (0, post_service_1.getAvailability)(req.user) },
        });
        if (!post)
            throw new error_response_1.NotFoundException("Post not found!");
        const mentions = [];
        const FCM_Tokens = [];
        if (tags?.length) {
            const mentionedAccounts = await this._userRepo.find({
                filter: { _id: { $in: tags } },
            });
            if (mentionedAccounts.length !== tags.length) {
                throw new error_response_1.NotFoundException("Failed to find some of or all tagged accounts. Please check the user IDs and try again.");
            }
            for (const tag of tags) {
                mentions.push(new mongoose_1.Types.ObjectId(tag));
                const tagged = await (0, redis_service_1.getFCMs)(tag);
                tagged.map((token) => FCM_Tokens.push(token));
            }
        }
        const [comment] = (await this._commentRepo.create({
            data: [
                {
                    createdBy: req.user._id,
                    content: content,
                    postId: new mongoose_1.Types.ObjectId(post._id),
                    tags: mentions,
                },
            ],
        })) || [];
        if (FCM_Tokens.length && comment) {
            await this._notificationService.sendNotifications({
                tokens: FCM_Tokens,
                data: {
                    title: "Comment Mention",
                    body: JSON.stringify({
                        message: `${req.user.username} tagged you in a comment.`,
                        postId,
                        commentId: comment._id,
                    }),
                },
            });
        }
        return res.status(201).json({ message: "Comment created.", data: comment });
    };
    reactComment = async (req, res) => {
        const { commentId } = req.params;
        const { reactionType } = req.query;
        const comment = await this._commentRepo.findOne({ filter: { _id: commentId } });
        if (!comment)
            throw new error_response_1.NotFoundException("Comment not found!");
        if (!comment.reactions)
            comment.reactions = [];
        const reactions = comment.reactions;
        const existingReactionIndex = reactions.findIndex((reaction) => reaction.userId.toString() === req.user._id.toString());
        if (existingReactionIndex >= 0) {
            const existingReaction = reactions[existingReactionIndex];
            if (existingReaction.reactionType === reactionType) {
                reactions.splice(existingReactionIndex, 1);
            }
            else {
                existingReaction.reactionType = reactionType;
            }
        }
        else {
            reactions.push({
                userId: req.user._id,
                reactionType,
                createdAt: new Date(),
            });
        }
        const updatedComment = await comment.save();
        return res.status(200).json({
            message: "Reaction updated successfully",
            data: updatedComment,
        });
    };
    createReply = async (req, res) => {
        const { postId, commentId } = req.params;
        const { tags = [], content } = req.body;
        const comment = await this._commentRepo.findOne({
            filter: { _id: commentId, postId },
            options: {
                populate: [
                    {
                        path: "postId",
                        match: { $or: (0, post_service_1.getAvailability)(req.user) },
                    },
                ],
            },
        });
        if (!comment)
            throw new error_response_1.NotFoundException("Comment not found!");
        const mentions = [];
        const FCM_Tokens = [];
        if (tags?.length) {
            const mentionedAccounts = await this._userRepo.find({
                filter: { _id: { $in: tags } },
            });
            if (mentionedAccounts.length !== tags.length) {
                throw new error_response_1.NotFoundException("Failed to find some of or all tagged accounts. Please check the user IDs and try again.");
            }
            for (const tag of tags) {
                mentions.push(new mongoose_1.Types.ObjectId(tag));
                const tagged = await (0, redis_service_1.getFCMs)(tag);
                tagged.map((token) => FCM_Tokens.push(token));
            }
        }
        const post = comment.postId;
        const [reply] = (await this._commentRepo.create({
            data: [
                {
                    createdBy: req.user._id,
                    content: content,
                    postId: post._id,
                    commentId: comment._id,
                    tags: mentions,
                },
            ],
        })) || [];
        if (FCM_Tokens.length && reply) {
            await this._notificationService.sendNotifications({
                tokens: FCM_Tokens,
                data: {
                    title: "Comment Mention",
                    body: JSON.stringify({
                        message: `${req.user.username} replied to a comment and tagged you.`,
                        postId,
                        commentId,
                        replyId: reply._id,
                    }),
                },
            });
        }
        return res.status(201).json({ message: "Reply created.", data: reply });
    };
    deleteComment = async (req, res) => {
        const { commentId } = req.params;
        const comment = (await this._commentRepo.findOne({ filter: { _id: commentId } }));
        if (!comment)
            throw new error_response_1.NotFoundException("Comment not found.");
        if (comment.createdBy.toString() !== req.user._id.toString() && req.user.role !== auth_enum_1.RoleEnum.ADMIN) {
            throw new error_response_1.ForbiddenException("You may only delete your own comment.");
        }
        await comment.softDelete();
        return res.status(200).json({ message: "Comment deleted successfully." });
    };
    restoreComment = async (req, res) => {
        const { commentId } = req.params;
        const comment = (await comment_model_1.CommentModel.findOne({
            _id: commentId,
            deletedAt: { $exists: true },
        }));
        if (!comment)
            throw new error_response_1.NotFoundException("Comment not found.");
        if (comment.createdBy.toString() !== req.user._id.toString() && req.user.role !== auth_enum_1.RoleEnum.ADMIN) {
            throw new error_response_1.ForbiddenException("You may only restore your own comment.");
        }
        await comment.restore();
        return res.status(200).json({ message: "Comment restored.", data: comment });
    };
}
exports.default = new CommentService();
