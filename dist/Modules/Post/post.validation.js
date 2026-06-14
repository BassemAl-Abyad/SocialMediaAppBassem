"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactPostSchema = exports.createPostSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const validation_middleware_1 = require("../../Middleware/validation.middleware");
const auth_enum_1 = require("../../Utils/enums/auth.enum");
const reaction_enum_1 = require("../../Utils/enums/reaction.enum");
const mongoose_1 = require("mongoose");
exports.createPostSchema = {
    body: zod_1.default
        .strictObject({
        content: zod_1.default.string().optional(),
        files: zod_1.default
            .array(validation_middleware_1.generalFields.file(["image/jpeg", "image/png", "image/gif"]))
            .optional(),
        tags: zod_1.default.array(zod_1.default.string()).optional(),
        availability: zod_1.default.coerce.number().default(auth_enum_1.AvailabilityEnum.PUBLIC),
    })
        .superRefine((args, ctx) => {
        if (!args.files?.length && !args.content) {
            ctx.addIssue({
                code: "custom",
                path: ["content", "files"],
                message: "Content or Attachment Required",
            });
        }
        if (args.tags?.length) {
            const uniqueTags = [...new Set(args.tags)];
            if (uniqueTags.length !== args.tags.length) {
                ctx.addIssue({
                    code: "custom",
                    path: ["tags"],
                    message: "Duplicate Tags",
                });
            }
        }
        for (const tag of args.tags || []) {
            if (!mongoose_1.Types.ObjectId.isValid(tag)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["tags"],
                    message: `Invalid tagged ObjectId ${tag}`,
                });
            }
        }
    }),
};
exports.reactPostSchema = {
    params: zod_1.default.strictObject({
        postId: validation_middleware_1.generalFields.id,
    }),
    query: zod_1.default.strictObject({
        reactionType: zod_1.default.enum(Object.values(reaction_enum_1.ReactionTypeEnum)),
    }),
};
