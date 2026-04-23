import { signupSchema } from "./auth.validation";
import { z } from "zod";

export type signupDTOBody = z.infer<typeof signupSchema.body>;
