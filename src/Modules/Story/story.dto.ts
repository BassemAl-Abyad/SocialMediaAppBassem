import z from "zod";
import { createStorySchema, feedStorySchema, storyParamsSchema } from "./story.validation";

export type createStoryDTO = z.infer<typeof createStorySchema.body>;
export type feedStoryDTO = z.infer<typeof feedStorySchema.query>;
export type storyParamsDTO = z.infer<typeof storyParamsSchema.params>;
