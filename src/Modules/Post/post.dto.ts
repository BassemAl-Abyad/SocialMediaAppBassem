import z from "zod";
import { createPostSchema, reactPostSchema } from "./post.validation";
import { ReactionTypeEnum } from "../../Utils/enums/reaction.enum";

export type createPostDTO = z.infer<typeof createPostSchema.body>;
export type reactParamPostDTO = z.infer<typeof reactPostSchema.params>;
export type reactQueryPostDTO = z.infer<typeof reactPostSchema.query>;

export interface IReactionDTO {
  reactionType: ReactionTypeEnum;
}

export const reactionTypeValues = Object.values(ReactionTypeEnum);