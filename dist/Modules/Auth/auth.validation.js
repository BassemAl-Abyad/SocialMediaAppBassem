"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAccountSchema = exports.resendOTPSchema = exports.resetPasswordConfirmSchema = exports.resetPasswordSchema = exports.signupSchema = exports.confirmEmailSchema = exports.logoutSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
const validation_middleware_1 = require("../../Middleware/validation.middleware");
const auth_enum_1 = require("../../Utils/enums/auth.enum");
exports.loginSchema = {
    body: zod_1.z.strictObject({
        email: validation_middleware_1.generalFields.email,
        password: validation_middleware_1.generalFields.password,
    }),
};
exports.logoutSchema = {
    body: zod_1.z.strictObject({
        flag: zod_1.z.enum(auth_enum_1.LogoutTypeEnum),
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
exports.resetPasswordSchema = {
    body: zod_1.z.strictObject({
        email: validation_middleware_1.generalFields.email,
    }),
};
exports.resetPasswordConfirmSchema = {
    body: zod_1.z.strictObject({
        email: validation_middleware_1.generalFields.email,
        otp: validation_middleware_1.generalFields.otp,
        newPassword: validation_middleware_1.generalFields.password,
    }),
};
exports.resendOTPSchema = {
    body: zod_1.z.strictObject({
        email: validation_middleware_1.generalFields.email,
    }),
};
exports.verifyAccountSchema = {
    body: zod_1.z.strictObject({
        email: validation_middleware_1.generalFields.email,
        otp: validation_middleware_1.generalFields.otp,
    }),
};
