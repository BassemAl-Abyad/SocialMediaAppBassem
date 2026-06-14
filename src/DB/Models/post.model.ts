import { model, Schema, Types } from "mongoose";
import { IUser } from "./user.model";
import { AvailabilityEnum } from "../../Utils/enums/auth.enum";
import { ReactionTypeEnum } from "../../Utils/enums/reaction.enum";

export interface IReaction {
  userId: Types.ObjectId | IUser;
  reactionType: ReactionTypeEnum;
  createdAt?: Date;
}

export interface IPost {
  folderId?: string;
  content?: string;
  attachments?: string[];

  reactions?: IReaction[];
  tags?: Types.ObjectId[] | IUser[];
  availability: AvailabilityEnum;

  createdBy: Types.ObjectId | IUser;
  updatedBy?: Types.ObjectId | IUser;

  deletedAt?: Date;
  restoredAt?: Date;

  createdAt: Date;
  updatedAt?: Date;
}

const postSchema = new Schema<IPost>(
  {
    folderId: String,
    content: {
      type: String,
      required: function (this) {
        return !this.attachments?.length;
      },
    },
    attachments: [String],
    availability: {
      type: Number,
      enum: AvailabilityEnum,
      default: AvailabilityEnum.PUBLIC,
    },
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

postSchema.pre(/^find/, function (this: any) {
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

postSchema.methods.softDelete = async function () {
  if (!this.deletedAt) {
    this.deletedAt = new Date();
    await this.save();
    const Comment = this.model("Comment");
    await Comment.updateMany(
      { postId: this._id, deletedAt: { $exists: false } },
      { deletedAt: this.deletedAt },
    );
  }
  return this;
};

postSchema.methods.restore = async function () {
  if (this.deletedAt) {
    this.deletedAt = undefined;
    this.restoredAt = new Date();
    await this.save();
    const Comment = this.model("Comment");
    await Comment.updateMany(
      { postId: this._id, deletedAt: { $exists: true } },
      { $unset: { deletedAt: true }, restoredAt: new Date() },
    );
  }
  return this;
};

postSchema.methods.hardDelete = async function () {
  const Comment = this.model("Comment");
  await Comment.deleteMany({ postId: this._id });
  return await this.deleteOne();
};

postSchema.virtual("comments", {
    localField: "_id",
    foreignField: "postId",
    ref: "Comment",
});

export const PostModel = model<IPost>("Post", postSchema);