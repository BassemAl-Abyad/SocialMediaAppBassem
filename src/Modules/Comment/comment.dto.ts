import { z } from "zod";
import { createCommentSchema, reactCommentSchema } from "./comment.validation";

export type CreateCommentDTO = z.infer<typeof createCommentSchema.body>;
export type ReactCommentQueryDTO = z.infer<typeof reactCommentSchema.query>;
export type ReactCommentParamDTO = z.infer<typeof reactCommentSchema.params>;