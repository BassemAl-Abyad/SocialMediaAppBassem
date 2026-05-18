import { Request, Response } from "express";
import { NotificationService } from "../../Utils/services/notification.service";
import { UserRepository } from "../../DB/repositories/user.repo";
import { PostRepository } from "../../DB/repositories/post.repo";
import { PostModel } from "../../DB/Models/post.model";
import { UserModel } from "../../DB/Models/user.model";
import { getAvailability } from "../Post/post.service";
import { NotFoundException, ForbiddenException } from "../../Utils/response/error.response";
import { HydratedDocument, Types } from "mongoose";
import { getFCMs } from "../../DB/repositories/redis.service";
import { CommentRepository } from "../../DB/repositories/comment.repo";
import { CommentModel, IComment } from "../../DB/Models/comment.model";
import { ReactionTypeEnum } from "../../Utils/enums/reaction.enum";
import { RoleEnum } from "../../Utils/enums/auth.enum";

class CommentService {
  private readonly _userRepo = new UserRepository(UserModel);
  private readonly _postRepo = new PostRepository(PostModel);
  private readonly _commentRepo = new CommentRepository(CommentModel);
  private readonly _notificationService: NotificationService;

  constructor() {
    this._notificationService = new NotificationService();
  }

  listComments = async (req: Request, res: Response) => {
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

  createComment = async (req: Request, res: Response) => {
    const { postId } = req.params;
    const { tags = [], content } = req.body;

    const post = await this._postRepo.findOne({
      filter: { _id: postId, $or: getAvailability(req.user) },
    });

    if (!post) throw new NotFoundException("Post not found!");

    const mentions: Types.ObjectId[] = [];
    const FCM_Tokens: string[] = [];

    if (tags?.length) {
      const mentionedAccounts = await this._userRepo.find({
        filter: { _id: { $in: tags } },
      });
      if (mentionedAccounts.length !== tags.length) {
        throw new NotFoundException(
          "Failed to find some of or all tagged accounts. Please check the user IDs and try again.",
        );
      }
      for (const tag of tags) {
        mentions.push(new Types.ObjectId(tag));
        const tagged = await getFCMs(tag);
        tagged.map((token: string) => FCM_Tokens.push(token));
      }
    }

    const [comment] =
      (await this._commentRepo.create({
        data: [
          {
            createdBy: req.user._id,
            content: content as string,
            postId: new Types.ObjectId(post._id),
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

  reactComment = async (req: Request, res: Response) => {
    const { commentId } = req.params as { commentId: string };
    const { reactionType } = req.query as { reactionType: ReactionTypeEnum };

    const comment = await this._commentRepo.findOne({ filter: { _id: commentId } });
    if (!comment) throw new NotFoundException("Comment not found!");

    if (!comment.reactions) comment.reactions = [];
    const reactions = comment.reactions as {
      userId: Types.ObjectId;
      reactionType: ReactionTypeEnum;
      createdAt?: Date;
    }[];

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

    const updatedComment = await comment.save();
    return res.status(200).json({
      message: "Reaction updated successfully",
      data: updatedComment,
    });
  };

  createReply = async (req: Request, res: Response) => {
    const { postId, commentId } = req.params;
    const { tags = [], content } = req.body;

    const comment = await this._commentRepo.findOne({
      filter: { _id: commentId, postId },
      options: {
        populate: [
          {
            path: "postId",
            match: { $or: getAvailability(req.user) },
          },
        ],
      },
    });

    if (!comment) throw new NotFoundException("Comment not found!");

    const mentions: Types.ObjectId[] = [];
    const FCM_Tokens: string[] = [];

    if (tags?.length) {
      const mentionedAccounts = await this._userRepo.find({
        filter: { _id: { $in: tags } },
      });
      if (mentionedAccounts.length !== tags.length) {
        throw new NotFoundException(
          "Failed to find some of or all tagged accounts. Please check the user IDs and try again.",
        );
      }
      for (const tag of tags) {
        mentions.push(new Types.ObjectId(tag));
        const tagged = await getFCMs(tag);
        tagged.map((token: string) => FCM_Tokens.push(token));
      }
    }

    const post = comment.postId as HydratedDocument<any>;
    const [reply] =
      (await this._commentRepo.create({
        data: [
          {
            createdBy: req.user._id,
            content: content as string,
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

  deleteComment = async (req: Request, res: Response) => {
    const { commentId } = req.params as { commentId: string };
    const comment = (await this._commentRepo.findOne({ filter: { _id: commentId } })) as any;
    if (!comment) throw new NotFoundException("Comment not found.");
    if (comment.createdBy.toString() !== req.user._id.toString() && req.user.role !== RoleEnum.ADMIN) {
      throw new ForbiddenException("You may only delete your own comment.");
    }
    await comment.softDelete();
    return res.status(200).json({ message: "Comment deleted successfully." });
  };

  restoreComment = async (req: Request, res: Response) => {
    const { commentId } = req.params as { commentId: string };
    const comment = (await CommentModel.findOne({
      _id: commentId,
      deletedAt: { $exists: true },
    })) as any;
    if (!comment) throw new NotFoundException("Comment not found.");
    if (comment.createdBy.toString() !== req.user._id.toString() && req.user.role !== RoleEnum.ADMIN) {
      throw new ForbiddenException("You may only restore your own comment.");
    }
    await comment.restore();
    return res.status(200).json({ message: "Comment restored.", data: comment });
  };
}

export default new CommentService();
