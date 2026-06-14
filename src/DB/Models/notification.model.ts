import { HydratedDocument, model, Schema, Types, Model } from "mongoose";
import { IUser } from "./user.model";

export interface INotificationMethods {
  markAsRead(userId: Types.ObjectId | string): Promise<HydratedDocument<INotification, INotificationMethods>>;
  markAsUnread(userId: Types.ObjectId | string): Promise<HydratedDocument<INotification, INotificationMethods>>;
}

export interface INotification {
  title: string;
  body: string;
  data?: Record<string, any>;
  recipients: Types.ObjectId[] | IUser[];
  createdBy: Types.ObjectId | IUser;
  channel?: string;
  sentAt?: Date;
  isReadBy?: Types.ObjectId[];
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification, Model<INotification, {}, INotificationMethods>, INotificationMethods>(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: Schema.Types.Mixed, default: {} },
    recipients: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    channel: { type: String, default: "FCM" },
    sentAt: { type: Date, default: Date.now },
    isReadBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    deletedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

notificationSchema.pre(/^find/, function (this: any) {
  if (!this.getQuery()?.includeDeleted) {
    this.where({ deletedAt: { $exists: false } });
  }
});

notificationSchema.methods.markAsRead = async function (userId: Types.ObjectId | string) {
  const id = userId.toString();
  this.isReadBy = this.isReadBy || [];
  const existing = (this.isReadBy as Types.ObjectId[]).map((item) => item.toString());
  if (!existing.includes(id)) {
    this.isReadBy.push(new Types.ObjectId(id));
  }
  return await this.save();
};

notificationSchema.methods.markAsUnread = async function (userId: Types.ObjectId | string) {
  this.isReadBy = (this.isReadBy || []).filter(
    (item) => item.toString() !== userId.toString(),
  ) as Types.ObjectId[];
  return await this.save();
};

export const NotificationModel = model<INotification>(
  "Notification",
  notificationSchema,
);
