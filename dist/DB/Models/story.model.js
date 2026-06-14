"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoryModel = void 0;
const mongoose_1 = require("mongoose");
const auth_enum_1 = require("../../Utils/enums/auth.enum");
const storySchema = new mongoose_1.Schema({
    content: String,
    attachments: [String],
    tags: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    availability: {
        type: Number,
        enum: auth_enum_1.AvailabilityEnum,
        default: auth_enum_1.AvailabilityEnum.PUBLIC,
    },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
        index: { expires: 0 },
    },
    deletedAt: Date,
    restoredAt: Date,
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
storySchema.pre(/^find/, function () {
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
exports.StoryModel = (0, mongoose_1.model)("Story", storySchema);
