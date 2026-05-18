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
  commentId?: Types.ObjectId;

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
    commentId: { type: Schema.Types.ObjectId, ref: "Comment" },

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

commentSchema.pre(/^find/, function (this: any) {
  const query = this.getQuery();
  const options = this.getOptions?.();
  if (
    query?.includeDeleted ||
    options?.includeDeleted ||
    Object.prototype.hasOwnProperty.call(query, "deletedAt")
  ) {
    return;
  }
  this.where({ deletedAt: { $exists: false } });
});

commentSchema.methods.softDelete = async function () {
  if (!this.deletedAt) {
    this.deletedAt = new Date();
    await this.save();
    const Comment = this.model("Comment");
    await Comment.updateMany(
      { commentId: this._id, deletedAt: { $exists: false } },
      { deletedAt: this.deletedAt },
    );
  }
  return this;
};

commentSchema.methods.restore = async function () {
  if (this.deletedAt) {
    this.deletedAt = undefined;
    this.restoredAt = new Date();
    await this.save();
    const Comment = this.model("Comment");
    await Comment.updateMany(
      { commentId: this._id, deletedAt: { $exists: true } },
      { $unset: { deletedAt: true }, restoredAt: new Date() },
    );
  }
  return this;
};

commentSchema.methods.hardDelete = async function () {
  const Comment = this.model("Comment");
  await Comment.deleteMany({ commentId: this._id });
  return await this.deleteOne();
};

export const CommentModel = model<IComment>("Comment", commentSchema);
