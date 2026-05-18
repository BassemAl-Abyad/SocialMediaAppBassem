import { Request, Response } from "express";
import { NotificationService } from "../../Utils/services/notification.service";
import { UserRepository } from "../../DB/repositories/user.repo";
import { PostRepository } from "../../DB/repositories/post.repo";
import { IPost, PostModel } from "../../DB/Models/post.model";
import { UserModel } from "../../DB/Models/user.model";
import { getAvailability } from "../Post/post.service";
import { NotFoundException } from "../../Utils/response/error.response";
import { HydratedDocument, Types } from "mongoose";
import { getFCMs } from "../../DB/repositories/redis.service";
import { CommentRepository } from "../../DB/repositories/comment.repo";
import { CommentModel } from "../../DB/Models/comment.model";
import { ReactionTypeEnum } from "../../Utils/enums/reaction.enum";

class CommentService {
  private readonly _userRepo = new UserRepository(UserModel);
  private readonly _postRepo = new PostRepository(PostModel);
  private readonly _commentRepo = new CommentRepository(CommentModel);
  private readonly _notificationService: NotificationService;

  constructor() {
    this._notificationService = new NotificationService();
  }

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
        mentions.push(tag);
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
            postId: post._id,
            tags: mentions,
          },
        ],
      })) || [];

    if (FCM_Tokens.length && comment) {
      this._notificationService.sendNotifications({
        tokens: FCM_Tokens,
        data: {
          title: "Post Mention",
          body: JSON.stringify({
            message: `${req.user.username} mentioned you in a post`,
            postId: post._id,
            commentId: comment._id,
          }),
        },
      });
    }

    return res
      .status(200)
      .json({ message: "Hello From Comment Service", comment });
  };

  reactComment = async (req: Request, res: Response) => {
    const { commentId } = req.params as { commentId: string };
    const { reactionType } = req.query as { reactionType: ReactionTypeEnum };

    const comment = await this._commentRepo.findOne({
      filter: { _id: commentId },
    });

    if (!comment) throw new NotFoundException("Comment not found!");

    if (!comment.reactions) {
      comment.reactions = [];
    }

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
      comment: updatedComment,
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
        mentions.push(tag);
        const tagged = await getFCMs(tag);
        tagged.map((token: string) => FCM_Tokens.push(token));
      }
    }

    const post = comment.postId as HydratedDocument<IPost>;
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
      this._notificationService.sendNotifications({
        tokens: FCM_Tokens,
        data: {
          title: "Post Mention",
          body: JSON.stringify({
            message: `${req.user.username} mentioned you in a post`,
            postId: post._id,
            commentId: comment._id,
            replyId: reply._id,
          }),
        },
      });
    }

    return res
      .status(200)
      .json({ message: "Hello From Comment Service", reply });
  };
}

export default new CommentService();
