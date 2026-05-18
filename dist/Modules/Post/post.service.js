"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_repo_1 = require("../../DB/repositories/user.repo");
const post_repo_1 = require("../../DB/repositories/post.repo");
const notification_service_1 = require("../../Utils/services/notification.service");
const user_model_1 = require("../../DB/Models/user.model");
const post_model_1 = require("../../DB/Models/post.model");
const error_response_1 = require("../../Utils/response/error.response");
const redis_service_1 = require("../../DB/repositories/redis.service");
class PostService {
    _userRepo = new user_repo_1.UserRepository(user_model_1.UserModel);
    _postRepo = new post_repo_1.PostRepository(post_model_1.PostModel);
    _notificationService;
    constructor() {
        this._notificationService = new notification_service_1.NotificationService();
    }
    createPost = async (req, res) => {
        const { content, availability, tags = [] } = req.body;
        // Validate tagged users
        const taggedUser = tags.length
            ? await this._userRepo.find({
                filter: {
                    _id: { $in: tags },
                },
                select: "firstName lastName email",
            })
            : [];
        if (taggedUser.length !== tags.length) {
            throw new error_response_1.NotFoundException("Failed to find some of or all tagged accounts. Please check the user IDs and try again.");
        }
        const tagged = taggedUser.map((user) => user._id);
        const tokendResults = await Promise.all(tags.map((tag) => (0, redis_service_1.getFCMs)(tag)));
        const FCM_Tokens = [
            ...new Set(tokendResults.flat().filter((token) => Boolean(token))),
        ];
        const posts = (await this._postRepo.create({
            data: [
                {
                    content,
                    availability,
                    tags: tagged,
                    createdBy: req.user._id,
                },
            ],
        })) || [];
        if (FCM_Tokens.length) {
            this._notificationService.sendNotifications({
                tokens: FCM_Tokens,
                data: {
                    title: "Post Mention",
                    body: JSON.stringify({
                        message: `${req.user.username} mentioned you in a post.`,
                        post: posts?.[0]?._id,
                    }),
                },
            });
        }
        const populatedPosts = await posts?.[0]?.populate([
            { path: "createdBy", select: "firstName lastName email" },
            { path: "tags", select: "firstName lastName email" },
        ]);
        return res.status(201).json({ message: "Post created." });
    };
}
exports.default = new PostService();
