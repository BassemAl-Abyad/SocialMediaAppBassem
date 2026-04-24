import { loginSchema, signupSchema } from "./auth.validation";
import { z } from "zod";

export type signupDTO = z.infer<typeof signupSchema.body>;

export type loginDTO = z.infer<typeof loginSchema.body>;
