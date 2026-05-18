import { Request, Response } from "express";
import { createPostDTO } from "./post.dto";
import { UserRepository } from "../../DB/repositories/user.repo";
import { PostRepository } from "../../DB/repositories/post.repo";
import { NotificationService } from "../../Utils/services/notification.service";
import { UserModel } from "../../DB/Models/user.model";
import { PostModel } from "../../DB/Models/post.model";
import { NotFoundException } from "../../Utils/response/error.response";
import { Types } from "mongoose";
import { getFCMs } from "../../DB/repositories/redis.service";

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
  }
}

export default new PostService();
