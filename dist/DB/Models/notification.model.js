"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModel = void 0;
const mongoose_1 = require("mongoose");
const notificationSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    recipients: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true }],
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    channel: { type: String, default: "FCM" },
    sentAt: { type: Date, default: Date.now },
    isReadBy: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    deletedAt: Date,
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
notificationSchema.pre(/^find/, function () {
    if (!this.getQuery()?.includeDeleted) {
        this.where({ deletedAt: { $exists: false } });
    }
});
notificationSchema.methods.markAsRead = async function (userId) {
    const id = userId.toString();
    this.isReadBy = this.isReadBy || [];
    const existing = this.isReadBy.map((item) => item.toString());
    if (!existing.includes(id)) {
        this.isReadBy.push(new mongoose_1.Types.ObjectId(id));
    }
    return await this.save();
};
notificationSchema.methods.markAsUnread = async function (userId) {
    this.isReadBy = (this.isReadBy || []).filter((item) => item.toString() !== userId.toString());
    return await this.save();
};
exports.NotificationModel = (0, mongoose_1.model)("Notification", notificationSchema);
