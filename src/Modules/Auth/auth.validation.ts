import { z } from "zod";

export const loginSchema = {
  body: z.strictObject({
    email: z.email({ error: "Email is required." }),
    password: z.string({ error: "Password is required." }),
  }),
};

export const signupSchema = {
  body: loginSchema.body
    .extend({
      username: z
        .string({ error: "Username is required." })
        .min(3, { error: "Username must be atleast 3 characters long." })
        .max(20, { error: "Username must be atmost 20 characters long." }),
      confirmPassword: z.string({ error: "Confirm password is required." }),
      gender: z
        .enum(["Male", "Female"], {
          error: "Gender is required Male or Female.",
        })
        .optional(),
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
