"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailability = void 0;
const user_repo_1 = require("../../DB/repositories/user.repo");
const post_repo_1 = require("../../DB/repositories/post.repo");
const comment_repo_1 = require("../../DB/repositories/comment.repo");
const notification_service_1 = require("../../Utils/services/notification.service");
const user_model_1 = require("../../DB/Models/user.model");
const post_model_1 = require("../../DB/Models/post.model");
const comment_model_1 = require("../../DB/Models/comment.model");
const error_response_1 = require("../../Utils/response/error.response");
const auth_enum_1 = require("../../Utils/enums/auth.enum");
const mongoose_1 = require("mongoose");
const redis_service_1 = require("../../DB/repositories/redis.service");
const getAvailability = (user) => {
    return [
        { availability: auth_enum_1.AvailabilityEnum.PUBLIC },
        { availability: auth_enum_1.AvailabilityEnum.ONLY_ME, createdBy: user._id },
        { tags: { $in: [user._id] } },
    ];
};
exports.getAvailability = getAvailability;
class PostService {
    _userRepo = new user_repo_1.UserRepository(user_model_1.UserModel);
    _postRepo = new post_repo_1.PostRepository(post_model_1.PostModel);
    _commentRepo = new comment_repo_1.CommentRepository(comment_model_1.CommentModel);
    _notificationService;
    constructor() {
        this._notificationService = new notification_service_1.NotificationService();
    }
    createPost = async (req, res) => {
        const body = req.body;
        const { content, availability, tags = [] } = body;
        const attachments = body.attachments ?? [];
        const taggedUsers = tags.length
            ? await this._userRepo.find({
                filter: { _id: { $in: tags } },
                select: "_id",
            })
            : [];
        if (taggedUsers.length !== tags.length) {
            throw new error_response_1.NotFoundException("Failed to find some or all tagged accounts. Please check the user IDs and try again.");
        }
        const tagged = taggedUsers.map((user) => user._id);
        const tokendResults = await Promise.all(tags.map((tag) => (0, redis_service_1.getFCMs)(tag)));
        const FCM_Tokens = [...new Set(tokendResults.flat().filter((token) => Boolean(token)))];
        const [post] = (await this._postRepo.create({
            data: [
                {
                    content,
                    attachments,
                    availability,
                    tags: tagged,
                    createdBy: req.user._id,
                },
            ],
        })) || [];
        if (FCM_Tokens.length && post) {
            await this._notificationService.sendNotifications({
                tokens: FCM_Tokens,
                data: {
                    title: "Post Mention",
                    body: JSON.stringify({
                        message: `${req.user.username} mentioned you in a post.`,
                        postId: post._id,
                    }),
                },
            });
        }
        return res.status(201).json({ message: "Post created successfully.", data: post });
    };
    getFeed = async (req, res) => {
        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 20);
        const skip = (page - 1) * limit;
        const posts = await this._postRepo.find({
            filter: {
                $or: [
                    { availability: auth_enum_1.AvailabilityEnum.PUBLIC },
                    { createdBy: req.user._id },
                    { tags: { $in: [req.user._id] } },
                ],
            },
            options: {
                populate: [
                    { path: "createdBy", select: "firstName lastName username ProfilePic" },
                    { path: "tags", select: "firstName lastName username ProfilePic" },
                ],
                skip,
                limit,
            },
        });
        return res
            .status(200)
            .json({ message: "Feed loaded successfully.", data: posts });
    };
    getDashboard = async (req, res) => {
        const totalPosts = await post_model_1.PostModel.countDocuments({ createdBy: req.user._id });
        const totalComments = await comment_model_1.CommentModel.countDocuments({ createdBy: req.user._id });
        const recentPosts = await this._postRepo.find({
            filter: { createdBy: req.user._id },
            options: {
                sort: { createdAt: -1 },
                limit: 5,
            },
        });
        const trending = await post_model_1.PostModel.aggregate([
            {
                $match: {
                    deletedAt: { $exists: false },
                    $or: [
                        { availability: auth_enum_1.AvailabilityEnum.PUBLIC },
                        { createdBy: req.user._id },
                        { tags: { $in: [req.user._id] } },
                    ],
                },
            },
            {
                $addFields: {
                    reactionsCount: { $size: { $ifNull: ["$reactions", []] } },
                },
            },
            { $sort: { reactionsCount: -1, createdAt: -1 } },
            { $limit: 5 },
        ]);
        return res.status(200).json({
            message: "Dashboard summary loaded.",
            data: { totalPosts, totalComments, recentPosts, trending },
        });
    };
    getProfilePosts = async (req, res) => {
        const { userId } = req.params;
        const authorId = userId || req.user._id.toString();
        const posts = await this._postRepo.find({
            filter: {
                createdBy: authorId,
                $or: [
                    { availability: auth_enum_1.AvailabilityEnum.PUBLIC },
                    { createdBy: req.user._id },
                    { tags: { $in: [req.user._id] } },
                ],
            },
            options: {
                populate: [
                    { path: "createdBy", select: "firstName lastName username ProfilePic" },
                    { path: "tags", select: "firstName lastName username ProfilePic" },
                ],
            },
        });
        return res.status(200).json({ message: "Profile posts fetched.", data: posts });
    };
    getPost = async (req, res) => {
        const { postId } = req.params;
        const post = await this._postRepo.findOne({
            filter: {
                _id: postId,
                $or: (0, exports.getAvailability)(req.user),
            },
            options: {
                populate: [
                    { path: "createdBy", select: "firstName lastName username ProfilePic" },
                    { path: "tags", select: "firstName lastName username ProfilePic" },
                ],
            },
        });
        if (!post)
            throw new error_response_1.NotFoundException("Post not found.");
        return res.status(200).json({ message: "Post fetched.", data: post });
    };
    updatePost = async (req, res) => {
        const { postId } = req.params;
        const body = req.body;
        const { content, availability, tags = [] } = body;
        const attachments = body.attachments ?? [];
        const post = await this._postRepo.findOne({ filter: { _id: postId } });
        if (!post)
            throw new error_response_1.NotFoundException("Post not found.");
        if (post.createdBy.toString() !== req.user._id.toString()) {
            throw new error_response_1.ForbiddenException("You may only update your own posts.");
        }
        const updatedPost = await this._postRepo.findOneAndUpdate({
            filter: { _id: postId },
            update: {
                content,
                attachments,
                availability,
                tags: tags.length ? tags.map((id) => new mongoose_1.Types.ObjectId(id)) : post.tags,
            },
            options: { new: true },
        });
        return res.status(200).json({ message: "Post updated.", data: updatedPost });
    };
    deletePost = async (req, res) => {
        const { postId } = req.params;
        const post = (await this._postRepo.findOne({ filter: { _id: postId } }));
        if (!post)
            throw new error_response_1.NotFoundException("Post not found.");
        if (post.createdBy.toString() !== req.user._id.toString() && req.user.role !== auth_enum_1.RoleEnum.ADMIN) {
            throw new error_response_1.ForbiddenException("You may only delete your own post.");
        }
        await post.softDelete();
        return res.status(200).json({ message: "Post deleted successfully." });
    };
    restorePost = async (req, res) => {
        const { postId } = req.params;
        const post = (await post_model_1.PostModel.findOne({
            _id: postId,
            deletedAt: { $exists: true },
        }));
        if (!post)
            throw new error_response_1.NotFoundException("Post not found.");
        if (post.createdBy.toString() !== req.user._id.toString() && req.user.role !== auth_enum_1.RoleEnum.ADMIN) {
            throw new error_response_1.ForbiddenException("You may only restore your own post.");
        }
        await post.restore();
        return res.status(200).json({ message: "Post restored.", data: post });
    };
    hardDeletePost = async (req, res) => {
        const { postId } = req.params;
        const post = (await post_model_1.PostModel.findOne({ _id: postId }).setOptions({ includeDeleted: true }));
        if (!post)
            throw new error_response_1.NotFoundException("Post not found.");
        await post.hardDelete();
        return res.status(200).json({ message: "Post permanently removed." });
    };
    reactPost = async (req, res) => {
        const { postId } = req.params;
        const { reactionType } = req.query;
        const post = await this._postRepo.findOne({
            filter: {
                _id: postId,
                $or: (0, exports.getAvailability)(req.user),
            },
        });
        if (!post)
            throw new error_response_1.NotFoundException("Post not found.");
        if (!post.reactions)
            post.reactions = [];
        const reactions = post.reactions;
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
        const updatedPost = await post.save();
        return res.status(200).json({ message: "Reaction updated successfully.", data: updatedPost });
    };
}
exports.default = new PostService();
