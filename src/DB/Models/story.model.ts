import { model, Schema, Types } from "mongoose";
import { IUser } from "./user.model";
import { AvailabilityEnum } from "../../Utils/enums/auth.enum";

export interface IStory {
  content?: string;
  attachments?: string[];
  tags?: Types.ObjectId[] | IUser[];
  availability: AvailabilityEnum;
  createdBy: Types.ObjectId | IUser;
  expiresAt: Date;
  deletedAt?: Date;
  restoredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const storySchema = new Schema<IStory>(
  {
    content: String,
    attachments: [String],
    tags: [{ type: Schema.Types.ObjectId, ref: "User" }],
    availability: {
      type: Number,
      enum: AvailabilityEnum,
      default: AvailabilityEnum.PUBLIC,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      index: { expires: 0 },
    },
    deletedAt: Date,
    restoredAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

storySchema.pre(/^find/, function (this: any) {
  if (!this.getQuery()?.includeDeleted) {
    this.where({ deletedAt: { $exists: false } });
  }
});

storySchema.methods.softDelete = async function () {
  if (!this.deletedAt) {
    this.deletedAt = new Date();
    this.restoredAt = undefined;
    await this.save();
  }
  return this;
};

storySchema.methods.restore = async function () {
  if (this.deletedAt) {
    this.deletedAt = undefined;
    this.restoredAt = new Date();
    await this.save();
  }
  return this;
};

storySchema.methods.hardDelete = async function () {
  return await this.deleteOne();
};

export const StoryModel = model<IStory>("Story", storySchema);
