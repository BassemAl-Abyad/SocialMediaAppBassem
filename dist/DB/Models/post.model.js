"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = void 0;
const mongoose_1 = require("mongoose");
const auth_enum_1 = require("../../Utils/enums/auth.enum");
const reaction_enum_1 = require("../../Utils/enums/reaction.enum");
const postSchema = new mongoose_1.Schema({
    folderId: String,
    content: {
        type: String,
        required: function () {
            return !this.attachments?.length;
        },
    },
    attachments: [String],
    availability: {
        type: Number,
        enum: auth_enum_1.AvailabilityEnum,
        default: auth_enum_1.AvailabilityEnum.PUBLIC,
    },
    reactions: [
        {
            userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
            reactionType: {
                type: String,
                enum: reaction_enum_1.ReactionTypeEnum,
                default: reaction_enum_1.ReactionTypeEnum.LIKE,
            },
            createdAt: { type: Date, default: Date.now },
        },
    ],
    tags: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    deletedAt: { type: Date },
    restoredAt: { type: Date },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
postSchema.pre(/^find/, function () {
    const query = this.getQuery();
    const options = this.getOptions?.();
    if (query?.includeDeleted ||
        options?.includeDeleted ||
        Object.prototype.hasOwnProperty.call(query, "deletedAt")) {
        return;
    }
    this.where({ deletedAt: { $exists: false } });
});
postSchema.methods.softDelete = async function () {
    if (!this.deletedAt) {
        this.deletedAt = new Date();
        await this.save();
        const Comment = this.model("Comment");
        await Comment.updateMany({ postId: this._id, deletedAt: { $exists: false } }, { deletedAt: this.deletedAt });
    }
    return this;
};
postSchema.methods.restore = async function () {
    if (this.deletedAt) {
        this.deletedAt = undefined;
        this.restoredAt = new Date();
        await this.save();
        const Comment = this.model("Comment");
        await Comment.updateMany({ postId: this._id, deletedAt: { $exists: true } }, { $unset: { deletedAt: true }, restoredAt: new Date() });
    }
    return this;
};
postSchema.methods.hardDelete = async function () {
    const Comment = this.model("Comment");
    await Comment.deleteMany({ postId: this._id });
    return await this.deleteOne();
};
exports.PostModel = (0, mongoose_1.model)("Post", postSchema);
