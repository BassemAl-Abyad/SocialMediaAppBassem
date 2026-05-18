import z from "zod";
import { createPostSchema, reactPostSchema } from "./post.validation";

export type createPostDTO = z.infer<typeof createPostSchema.body>;
export type reactParamPostDTO = z.infer<typeof reactPostSchema.params>;
export type reactQueryPostDTO = z.infer<typeof reactPostSchema.query>;