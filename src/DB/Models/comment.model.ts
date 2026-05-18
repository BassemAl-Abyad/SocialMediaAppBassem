import { model, Schema, Types } from "mongoose";
import { IUser } from "./user.model";
import { AvailabilityEnum } from "../../Utils/enums/auth.enum";
import { ReactionTypeEnum } from "../../Utils/enums/reaction.enum";
import { IPost } from "./post.model";

export interface IReaction {
  userId: Types.ObjectId | IUser;
  reactionType: ReactionTypeEnum;
  createdAt?: Date;
}

export interface IComment {
  content?: string;
  attachments?: string[];

  reactions?: IReaction[];
  likes?: Types.ObjectId[] | IUser[];
  tags?: Types.ObjectId[] | IUser[];

  postId: Types.ObjectId | IPost;

  createdBy: Types.ObjectId | IUser;
  updatedBy?: Types.ObjectId | IUser;

  deletedAt?: Date;
  restoredAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: function (this) {
        return !this.attachments?.length;
      },
    },
    attachments: [String],
    reactions: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        reactionType: {
          type: String,
          enum: ReactionTypeEnum,
          default: ReactionTypeEnum.LIKE,
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    tags: [{ type: Schema.Types.ObjectId, ref: "User" }],
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    postId: { type: Schema.Types.ObjectId, ref: "Post" },

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedAt: { type: Date },
    restoredAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export const CommentModel = model<IComment>("Comment", commentSchema);
