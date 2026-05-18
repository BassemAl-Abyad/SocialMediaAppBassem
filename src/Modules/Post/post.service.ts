import { Request, Response } from "express";
import { createPostDTO, reactParamPostDTO, reactQueryPostDTO } from "./post.dto";
import { UserRepository } from "../../DB/repositories/user.repo";
import { PostRepository } from "../../DB/repositories/post.repo";
import { NotificationService } from "../../Utils/services/notification.service";
import { HUserDocument, UserModel } from "../../DB/Models/user.model";
import { PostModel } from "../../DB/Models/post.model";
import { NotFoundException } from "../../Utils/response/error.response";
import { Types } from "mongoose";
import { getFCMs } from "../../DB/repositories/redis.service";
import { AvailabilityEnum } from "../../Utils/enums/auth.enum";
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
  private readonly _notificationService: NotificationService;

  constructor() {
    this._notificationService = new NotificationService();
  }

  createPost = async (req: Request, res: Response): Promise<Response> => {
    const { content, availability, tags = [] }: createPostDTO = req.body;

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
      throw new NotFoundException(
        "Failed to find some of or all tagged accounts. Please check the user IDs and try again.",
      );
    }

    const tagged = taggedUser.map((user) => user._id as Types.ObjectId);

    const tokendResults = await Promise.all(
      tags.map((tag: string) => getFCMs(tag)),
    );

    const FCM_Tokens = [
      ...new Set(
        tokendResults.flat().filter((token): token is string => Boolean(token)),
      ),
    ];

    const posts =
      (await this._postRepo.create({
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

  reactPost = async (req: Request, res: Response): Promise<Response> => {
    const { postId } = req.params as reactParamPostDTO;
    const { reactionType } = req.query as any;

    const post = await this._postRepo.findOne({
      filter: {
        _id: postId,
        $or: getAvailability(req.user),
      },
    });

    if (!post) throw new NotFoundException("Post not found!");

    // Initialize reactions array if it doesn't exist
    if (!post.reactions) {
      post.reactions = [];
    }

    const reactions = post.reactions;

    // Check if user already has a reaction to this post
    const existingReactionIndex = reactions.findIndex(
      (reaction) => reaction.userId.toString() === req.user._id.toString(),
    );

    if (existingReactionIndex >= 0) {
      // If the same reaction type, remove it; otherwise update it
      const existingReaction = reactions[existingReactionIndex]!;
      if (existingReaction.reactionType === reactionType) {
        // Remove the reaction
        reactions.splice(existingReactionIndex, 1);
      } else {
        // Update the reaction type
        existingReaction.reactionType = reactionType as ReactionTypeEnum;
      }
    } else {
      // Add new reaction
      reactions.push({
        userId: req.user._id,
        reactionType: reactionType as ReactionTypeEnum,
        createdAt: new Date(),
      });
    }

    const updatedPost = await post.save();

    return res.status(200).json({ 
      message: "Reaction updated successfully", 
      post: updatedPost 
    });
  };
}

export default new PostService();
