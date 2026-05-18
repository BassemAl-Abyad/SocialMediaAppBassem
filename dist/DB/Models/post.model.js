"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = void 0;
const mongoose_1 = require("mongoose");
const auth_enum_1 = require("../../Utils/enums/auth.enum");
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
    likes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
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
exports.PostModel = (0, mongoose_1.model)("Post", postSchema);
