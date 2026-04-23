"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = {
    body: zod_1.z.strictObject({
        email: zod_1.z.email({ error: "Email is required." }),
        password: zod_1.z.string({ error: "Password is required." }),
    }),
};
exports.signupSchema = {
    body: exports.loginSchema.body
        .extend({
        username: zod_1.z
            .string({ error: "Username is required." })
            .min(3, { error: "Username must be atleast 3 characters long." })
            .max(20, { error: "Username must be atmost 20 characters long." }),
        confirmPassword: zod_1.z.string({ error: "Confirm password is required." }),
        gender: zod_1.z
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
