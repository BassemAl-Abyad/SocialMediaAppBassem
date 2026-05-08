import { 
  confirmEmailSchema, 
  loginSchema, 
  signupSchema, 
  resetPasswordSchema, 
  resetPasswordConfirmSchema, 
  resendOTPSchema, 
  verifyAccountSchema, 
  logoutSchema
} from "./auth.validation";
import { z } from "zod";

export type signupDTO = z.infer<typeof signupSchema.body>;

export type loginDTO = z.infer<typeof loginSchema.body>;

export type ILogoutDTO = z.infer<typeof logoutSchema.body>;


export type confirmEmailDTO = z.infer<typeof confirmEmailSchema.body>;

export type resetPasswordDTO = z.infer<typeof resetPasswordSchema.body>;

export type resetPasswordConfirmDTO = z.infer<typeof resetPasswordConfirmSchema.body>;

export type resendOTPDTO = z.infer<typeof resendOTPSchema.body>;

export type verifyAccountDTO = z.infer<typeof verifyAccountSchema.body>;
