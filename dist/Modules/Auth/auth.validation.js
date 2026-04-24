"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupSchema = exports.confirmEmailSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
const validation_middleware_1 = require("../../Middleware/validation.middleware");
exports.loginSchema = {
    body: zod_1.z.strictObject({
        email: validation_middleware_1.generalFields.email,
        password: validation_middleware_1.generalFields.password,
    }),
};
exports.confirmEmailSchema = {
    body: zod_1.z.strictObject({
        email: validation_middleware_1.generalFields.email,
        otp: validation_middleware_1.generalFields.otp,
    }),
};
exports.signupSchema = {
    body: exports.loginSchema.body
        .extend({
        username: validation_middleware_1.generalFields.username,
        confirmPassword: validation_middleware_1.generalFields.confirmPassword,
        gender: validation_middleware_1.generalFields.gender.optional(),
        phone: zod_1.z.string(),
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
