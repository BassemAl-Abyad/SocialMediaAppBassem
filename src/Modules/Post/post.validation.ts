import z, { superRefine } from "zod";
import { generalFields } from "../../Middleware/validation.middleware";
import { AvailabilityEnum } from "../../Utils/enums/auth.enum";
import { ReactionTypeEnum } from "../../Utils/enums/reaction.enum";
import { Types } from "mongoose";

export const createPostSchema = {
  body: z
    .strictObject({
      content: z.string().optional(),
      files: z
        .array(generalFields.file(["image/jpeg", "image/png", "image/gif"]))
        .optional(),
      tags: z.array(z.string()).optional(),
      availability: z.coerce.number().default(AvailabilityEnum.PUBLIC),
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
        if (!Types.ObjectId.isValid(tag)) {
          ctx.addIssue({
            code: "custom",
            path: ["tags"],
            message: `Invalid tagged ObjectId ${tag}`,
          });
        }
      }
    }),
};

export const reactPostSchema = {
  params: z.strictObject({
    postId: generalFields.id,
  }),
  query: z.strictObject({
    reactionType: z.enum(
      Object.values(ReactionTypeEnum) as [string, ...string[]],
    ),
  }),
};
