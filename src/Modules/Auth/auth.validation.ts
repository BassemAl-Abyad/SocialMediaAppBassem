import { z } from "zod";
import { generalFields } from "../../Middleware/validation.middleware";
import { LogoutTypeEnum } from "../../Utils/enums/auth.enum";

export const loginSchema = {
  body: z.strictObject({
    email: generalFields.email,
    password: generalFields.password,
    FCM: z.string().optional(), 
  }),
};

export const logoutSchema = {
  body: z.strictObject({
    flag: z.enum(LogoutTypeEnum),
  }),
};

export const confirmEmailSchema = {
  body: z.strictObject({
    email: generalFields.email,
    otp: generalFields.otp,
  }),
};

export const signupSchema = {
  body: loginSchema.body
    .extend({
      username: generalFields.username,
      confirmPassword: generalFields.confirmPassword,
      gender: generalFields.gender.optional(),
      phone: z.string(),
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: "confirmPassword must match password.",
        });
      }

      if (data.username?.split(" ").length !== 2) {
        ctx.addIssue({
          code: "custom",
          path: ["username"],
          message: "Username must contain exactly two words.",
        });
      }
    }),
};

export const resetPasswordSchema = {
  body: z.strictObject({
    email: generalFields.email,
  }),
};

export const resetPasswordConfirmSchema = {
  body: z.strictObject({
    email: generalFields.email,
    otp: generalFields.otp,
    newPassword: generalFields.password,
  }),
};

export const resendOTPSchema = {
  body: z.strictObject({
    email: generalFields.email,
  }),
};

export const verifyAccountSchema = {
  body: z.strictObject({
    email: generalFields.email,
    otp: generalFields.otp,
  }),
};
