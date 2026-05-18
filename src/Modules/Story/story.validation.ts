import z from "zod";
import { generalFields } from "../../Middleware/validation.middleware";
import { AvailabilityEnum } from "../../Utils/enums/auth.enum";

export const createStorySchema = {
  body: z
    .strictObject({
      content: z.string().optional(),
      attachments: z.array(z.string()).optional(),
      tags: z.array(generalFields.id).optional(),
      availability: z.coerce.number().default(AvailabilityEnum.PUBLIC),
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

export const feedStorySchema = {
  query: z.strictObject({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(20),
  }),
};

export const storyParamsSchema = {
  params: z.strictObject({
    userId: generalFields.id.optional(),
  }),
};
