import { z } from "zod";
import { generalFields } from "../../Middleware/validation.middleware";
import { ReactionTypeEnum } from "../../Utils/enums/reaction.enum";

export const createCommentSchema = {
  params: z.strictObject({
    postId: generalFields.id,
  }),
  body: z
    .strictObject({
      content: z.string().optional(),
      tags: z.array(generalFields.id).optional(),
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

export const reactCommentSchema = {
  params: z.strictObject({
    commentId: generalFields.id,
  }),
  query: z.strictObject({
    reactionType: z.enum(
      Object.values(ReactionTypeEnum) as [string, ...string[]],
    ),
  }),
};