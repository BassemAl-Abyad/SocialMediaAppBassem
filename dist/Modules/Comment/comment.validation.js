"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replyCommentSchema = exports.reactCommentSchema = exports.createCommentSchema = void 0;
const zod_1 = require("zod");
const validation_middleware_1 = require("../../Middleware/validation.middleware");
const reaction_enum_1 = require("../../Utils/enums/reaction.enum");
exports.createCommentSchema = {
    params: zod_1.z.strictObject({
        postId: validation_middleware_1.generalFields.id,
    }),
    body: zod_1.z
        .strictObject({
        content: zod_1.z.string().optional(),
        tags: zod_1.z.array(validation_middleware_1.generalFields.id).optional(),
    })
        .superRefine((args, ctx) => {
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
    }),
};
exports.reactCommentSchema = {
    params: zod_1.z.strictObject({
        commentId: validation_middleware_1.generalFields.id,
    }),
    query: zod_1.z.strictObject({
        reactionType: zod_1.z.enum(Object.values(reaction_enum_1.ReactionTypeEnum)),
    }),
};
exports.replyCommentSchema = {
    params: zod_1.z.strictObject({
        postId: validation_middleware_1.generalFields.id,
        commentId: validation_middleware_1.generalFields.id,
    }),
    body: exports.createCommentSchema.body,
};
