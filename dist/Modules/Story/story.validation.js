"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storyParamsSchema = exports.feedStorySchema = exports.createStorySchema = void 0;
const zod_1 = __importDefault(require("zod"));
const validation_middleware_1 = require("../../Middleware/validation.middleware");
const auth_enum_1 = require("../../Utils/enums/auth.enum");
exports.createStorySchema = {
    body: zod_1.default
        .strictObject({
        content: zod_1.default.string().optional(),
        attachments: zod_1.default.array(zod_1.default.string()).optional(),
        tags: zod_1.default.array(validation_middleware_1.generalFields.id).optional(),
        availability: zod_1.default.coerce.number().default(auth_enum_1.AvailabilityEnum.PUBLIC),
    })
        .superRefine((args, ctx) => {
        if (!args.content && !args.attachments?.length) {
            ctx.addIssue({
                code: "custom",
                message: "Story content or attachments are required.",
            });
        }
        if (args.tags?.length) {
            const uniqueTags = [...new Set(args.tags)];
            if (uniqueTags.length !== args.tags.length) {
                ctx.addIssue({
                    code: "custom",
                    path: ["tags"],
                    message: "Duplicate tags are not allowed.",
                });
            }
        }
    }),
};
exports.feedStorySchema = {
    query: zod_1.default.strictObject({
        page: zod_1.default.coerce.number().min(1).default(1),
        limit: zod_1.default.coerce.number().min(1).max(50).default(20),
    }),
};
exports.storyParamsSchema = {
    params: zod_1.default.strictObject({
        userId: validation_middleware_1.generalFields.id.optional(),
    }),
};
