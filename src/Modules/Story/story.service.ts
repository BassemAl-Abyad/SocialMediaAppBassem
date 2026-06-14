import { Request, Response } from "express";
import { StoryRepository } from "../../DB/repositories/story.repo";
import { UserRepository } from "../../DB/repositories/user.repo";
import { StoryModel } from "../../DB/Models/story.model";
import { UserModel } from "../../DB/Models/user.model";
import { NotificationService } from "../../Utils/services/notification.service";
import { NotFoundException } from "../../Utils/response/error.response";
import { Types } from "mongoose";
import { getFCMs } from "../../DB/repositories/redis.service";
import { AvailabilityEnum } from "../../Utils/enums/auth.enum";

class StoryService {
  private readonly _storyRepo = new StoryRepository(StoryModel);
  private readonly _userRepo = new UserRepository(UserModel);
  private readonly _notificationService: NotificationService;

  constructor() {
    this._notificationService = new NotificationService();
  }

  createStory = async (req: Request, res: Response) => {
    const { content, attachments = [], availability, tags = [] } = req.body;

    if (tags.length) {
      const taggedUsers = await this._userRepo.find({
        filter: { _id: { $in: tags } },
      });
      if (taggedUsers.length !== tags.length) {
        throw new NotFoundException(
          "Some tagged users could not be found. Verify tag IDs and try again.",
        );
      }
    }

    const story = await this._storyRepo.create({
      data: [
        {
          content,
          attachments,
          availability,
          tags: tags.map((tag: string) => new Types.ObjectId(tag)),
          createdBy: req.user._id,
        },
      ],
    });

    if (tags.length) {
      const tokens = await Promise.all(tags.map((tag: string) => getFCMs(tag)));
      const uniqueTokens = [...new Set(tokens.flat().filter((token): token is string => Boolean(token)))];
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

  getFeed = async (req: Request, res: Response) => {
    const { page, limit } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);
    const stories = await this._storyRepo.find({
      filter: {
        $or: [
          { availability: AvailabilityEnum.PUBLIC },
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

  getUserStories = async (req: Request, res: Response) => {
    const { userId } = req.params as { userId?: string };
    const targetUserId = userId || req.user._id.toString();

    const stories = await this._storyRepo.find({
      filter: {
        createdBy: targetUserId,
        $or: [
          { availability: AvailabilityEnum.PUBLIC },
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

  deleteStory = async (req: Request, res: Response) => {
    const { storyId } = req.params as { storyId: string };
    const story = (await this._storyRepo.findOne({ filter: { _id: storyId } })) as any;

    if (!story) throw new NotFoundException("Story not found.");
    if (story.createdBy.toString() !== req.user._id.toString()) {
      throw new NotFoundException("Only the story owner may delete this story.");
    }

    await story.softDelete();
    return res.status(200).json({ message: "Story deleted successfully." });
  };

  restoreStory = async (req: Request, res: Response) => {
    const { storyId } = req.params as { storyId: string };
    const story = (await StoryModel.findOne({ _id: storyId, deletedAt: { $exists: true } }).setOptions({ includeDeleted: true })) as any;
    if (!story) throw new NotFoundException("Story not found.");
    if (story.createdBy.toString() !== req.user._id.toString()) {
      throw new NotFoundException("Only the story owner may restore this story.");
    }
    await story.restore();
    return res.status(200).json({ message: "Story restored successfully.", data: story });
  };

  hardDeleteStory = async (req: Request, res: Response) => {
    const { storyId } = req.params as { storyId: string };
    const story = (await StoryModel.findOne({ _id: storyId }).setOptions({ includeDeleted: true })) as any;
    if (!story) throw new NotFoundException("Story not found.");
    await story.hardDelete();
    return res.status(200).json({ message: "Story permanently removed." });
  };
}

export default new StoryService();
