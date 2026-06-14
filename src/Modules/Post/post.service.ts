import { Request, Response } from "express";
import { createPostDTO } from "./post.dto";
import { UserRepository } from "../../DB/repositories/user.repo";
import { PostRepository } from "../../DB/repositories/post.repo";
import { CommentRepository } from "../../DB/repositories/comment.repo";
import { NotificationService } from "../../Utils/services/notification.service";
import { HUserDocument, UserModel } from "../../DB/Models/user.model";
import { PostModel } from "../../DB/Models/post.model";
import { CommentModel } from "../../DB/Models/comment.model";
import {
  NotFoundException,
  ForbiddenException,
} from "../../Utils/response/error.response";
import { AvailabilityEnum, RoleEnum } from "../../Utils/enums/auth.enum";
import { Types } from "mongoose";
import { getFCMs } from "../../DB/repositories/redis.service";
import { ReactionTypeEnum } from "../../Utils/enums/reaction.enum";

export const getAvailability = (user: HUserDocument) => {
  return [
    { availability: AvailabilityEnum.PUBLIC },
    { availability: AvailabilityEnum.ONLY_ME, createdBy: user._id },
    { tags: { $in: [user._id] } },
  ];
};

class PostService {
  private readonly _userRepo = new UserRepository(UserModel);
  private readonly _postRepo = new PostRepository(PostModel);
  private readonly _commentRepo = new CommentRepository(CommentModel);
  private readonly _notificationService: NotificationService;

  constructor() {
    this._notificationService = new NotificationService();
  }

  createPost = async (req: Request, res: Response): Promise<Response> => {
    const body = req.body as any;
    const { content, availability, tags = [] }: createPostDTO = body;
    const attachments: string[] = body.attachments ?? [];

    const taggedUsers = tags.length
      ? await this._userRepo.find({
          filter: { _id: { $in: tags } },
          select: "_id",
        })
      : [];

    if (taggedUsers.length !== tags.length) {
      throw new NotFoundException(
        "Failed to find some or all tagged accounts. Please check the user IDs and try again.",
      );
    }

    const tagged = taggedUsers.map((user) => user._id as Types.ObjectId);

    const tokendResults = await Promise.all(
      tags.map((tag: string) => getFCMs(tag)),
    );
    const FCM_Tokens = [
      ...new Set(
        tokendResults.flat().filter((token): token is string => Boolean(token)),
      ),
    ];

    const [post] =
      (await this._postRepo.create({
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

    return res
      .status(201)
      .json({ message: "Post created successfully.", data: post });
  };

  getFeed = async (req: Request, res: Response): Promise<Response> => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const skip = (page - 1) * limit;

    const posts = await this._postRepo.find({
      filter: {
        $or: [
          { availability: AvailabilityEnum.PUBLIC },
          { createdBy: req.user._id },
          { tags: { $in: [req.user._id] } },
        ],
      },
      options: {
        populate: [
          {
            path: "createdBy",
            select: "firstName lastName username ProfilePic",
          },
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

  getDashboard = async (req: Request, res: Response): Promise<Response> => {
    const totalPosts = await PostModel.countDocuments({
      createdBy: req.user._id,
    });
    const totalComments = await CommentModel.countDocuments({
      createdBy: req.user._id,
    });
    const recentPosts = await this._postRepo.find({
      filter: { createdBy: req.user._id },
      options: {
        sort: { createdAt: -1 },
        limit: 5,
      },
    });
    const trending = await PostModel.aggregate([
      {
        $match: {
          deletedAt: { $exists: false },
          $or: [
            { availability: AvailabilityEnum.PUBLIC },
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

  getProfilePosts = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params as { userId?: string };
    const authorId = userId || req.user._id.toString();

    const posts = await this._postRepo.find({
      filter: {
        createdBy: authorId,
        $or: [
          { availability: AvailabilityEnum.PUBLIC },
          { createdBy: req.user._id },
          { tags: { $in: [req.user._id] } },
        ],
      },
      options: {
        populate: [
          {
            path: "createdBy",
            select: "firstName lastName username ProfilePic",
          },
          { path: "tags", select: "firstName lastName username ProfilePic" },
        ],
      },
    });

    return res
      .status(200)
      .json({ message: "Profile posts fetched.", data: posts });
  };

  getPost = async (req: Request, res: Response): Promise<Response> => {
    const { postId } = req.params as { postId: string };
    const post = await this._postRepo.findOne({
      filter: {
        _id: postId,
        $or: getAvailability(req.user),
      },
      options: {
        populate: [
          {
            path: "createdBy",
            select: "firstName lastName username ProfilePic",
          },
          { path: "tags", select: "firstName lastName username ProfilePic" },
        ],
      },
    });
    if (!post) throw new NotFoundException("Post not found.");
    return res.status(200).json({ message: "Post fetched.", data: post });
  };

  updatePost = async (req: Request, res: Response): Promise<Response> => {
    const { postId } = req.params as { postId: string };
    const body = req.body as any;
    const { content, availability, tags = [] }: createPostDTO = body;
    const attachments: string[] = body.attachments ?? [];

    const post = await this._postRepo.findOne({ filter: { _id: postId } });
    if (!post) throw new NotFoundException("Post not found.");
    if (post.createdBy.toString() !== req.user._id.toString()) {
      throw new ForbiddenException("You may only update your own posts.");
    }

    const updatedPost = await this._postRepo.findOneAndUpdate({
      filter: { _id: postId },
      update: {
        content,
        attachments,
        availability,
        tags: tags.length
          ? tags.map((id: string) => new Types.ObjectId(id))
          : post.tags,
      },
      options: { new: true },
    });

    return res
      .status(200)
      .json({ message: "Post updated.", data: updatedPost });
  };

  deletePost = async (req: Request, res: Response): Promise<Response> => {
    const { postId } = req.params as { postId: string };
    const post = (await this._postRepo.findOne({
      filter: { _id: postId },
    })) as any;
    if (!post) throw new NotFoundException("Post not found.");
    if (
      post.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== RoleEnum.ADMIN
    ) {
      throw new ForbiddenException("You may only delete your own post.");
    }
    await post.softDelete();
    return res.status(200).json({ message: "Post deleted successfully." });
  };

  restorePost = async (req: Request, res: Response): Promise<Response> => {
    const { postId } = req.params as { postId: string };
    const post = (await PostModel.findOne({
      _id: postId,
      deletedAt: { $exists: true },
    })) as any;
    if (!post) throw new NotFoundException("Post not found.");
    if (
      post.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== RoleEnum.ADMIN
    ) {
      throw new ForbiddenException("You may only restore your own post.");
    }
    await post.restore();
    return res.status(200).json({ message: "Post restored.", data: post });
  };

  hardDeletePost = async (req: Request, res: Response): Promise<Response> => {
    const { postId } = req.params as { postId: string };
    const post = (await PostModel.findOne({ _id: postId }).setOptions({
      includeDeleted: true,
    })) as any;
    if (!post) throw new NotFoundException("Post not found.");
    await post.hardDelete();
    return res.status(200).json({ message: "Post permanently removed." });
  };

  reactPost = async (req: Request, res: Response): Promise<Response> => {
    const { postId } = req.params as { postId: string };
    const { reactionType } = req.query as { reactionType: ReactionTypeEnum };

    const post = await this._postRepo.findOne({
      filter: {
        _id: postId,
        $or: getAvailability(req.user),
      },
    });
    if (!post) throw new NotFoundException("Post not found.");

    if (!post.reactions) post.reactions = [];
    const reactions = post.reactions;
    const existingReactionIndex = reactions.findIndex(
      (reaction) => reaction.userId.toString() === req.user._id.toString(),
    );

    if (existingReactionIndex >= 0) {
      const existingReaction = reactions[existingReactionIndex]!;
      if (existingReaction.reactionType === reactionType) {
        reactions.splice(existingReactionIndex, 1);
      } else {
        existingReaction.reactionType = reactionType;
      }
    } else {
      reactions.push({
        userId: req.user._id,
        reactionType,
        createdAt: new Date(),
      });
    }

    const updatedPost = await post.save();
    return res
      .status(200)
      .json({ message: "Reaction updated successfully.", data: updatedPost });
  };

  async getPosts(user: HUserDocument) {
    const posts = await this._postRepo.find({
      filter: {
        $or: getAvailability(user),
      },
      options: {
        populate: [{ path: "createdBy" }, {path: "comments"}],
      },
    });
    return posts;
  }
}

export default new PostService();
