"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentModel = void 0;
const mongoose_1 = require("mongoose");
const reaction_enum_1 = require("../../Utils/enums/reaction.enum");
const commentSchema = new mongoose_1.Schema({
    content: {
        type: String,
        required: function () {
            return !this.attachments?.length;
        },
    },
    attachments: [String],
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
    likes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    postId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Post" },
    commentId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Comment" },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    deletedAt: { type: Date },
    restoredAt: { type: Date },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
commentSchema.pre(/^find/, function () {
    const query = this.getQuery();
    const options = this.getOptions?.();
    if (query?.includeDeleted ||
        options?.includeDeleted ||
        Object.prototype.hasOwnProperty.call(query, "deletedAt")) {
        return;
    }
    this.where({ deletedAt: { $exists: false } });
});
commentSchema.methods.softDelete = async function () {
    if (!this.deletedAt) {
        this.deletedAt = new Date();
        await this.save();
        const Comment = this.model("Comment");
        await Comment.updateMany({ commentId: this._id, deletedAt: { $exists: false } }, { deletedAt: this.deletedAt });
    }
    return this;
};
commentSchema.methods.restore = async function () {
    if (this.deletedAt) {
        this.deletedAt = undefined;
        this.restoredAt = new Date();
        await this.save();
        const Comment = this.model("Comment");
        await Comment.updateMany({ commentId: this._id, deletedAt: { $exists: true } }, { $unset: { deletedAt: true }, restoredAt: new Date() });
    }
    return this;
};
commentSchema.methods.hardDelete = async function () {
    const Comment = this.model("Comment");
    await Comment.deleteMany({ commentId: this._id });
    return await this.deleteOne();
};
exports.CommentModel = (0, mongoose_1.model)("Comment", commentSchema);
