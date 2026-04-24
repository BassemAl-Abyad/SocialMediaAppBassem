"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalFields = exports.validation = void 0;
const zod_1 = __importDefault(require("zod"));
const error_response_1 = require("../Utils/response/error.response");
const validation = (schema) => {
    return (req, res, next) => {
        const validationError = [];
        for (const key of Object.keys(schema)) {
            if (!schema[key])
                continue;
            const validationResults = schema[key].safeParse(req[key]);
            if (!validationResults.success) {
                const errors = validationResults.error;
                validationError.push({
                    key,
                    issues: errors.issues.map((issue) => {
                        return {
                            message: issue.message,
                            path: issue.path,
                            code: issue.code,
                        };
                    }),
                });
            }
        }
        if (validationError.length > 0) {
            throw new error_response_1.BadRequestException("Validation error", {
                cause: validationError,
            });
        }
        return next();
    };
};
exports.validation = validation;
exports.generalFields = {
    username: zod_1.default
        .string({ error: "Username is required." })
        .min(3, { error: "Username must be atleast 3 characters long." })
        .max(20, { error: "Username must be atmost 20 characters long." }),
    email: zod_1.default.email({ error: "Email is required." }),
    password: zod_1.default.string({ error: "Password is required." }),
    confirmPassword: zod_1.default.string({ error: "Confirm password is required." }),
    gender: zod_1.default
        .enum(["Male", "Female"], {
        error: "Gender is required Male or Female.",
    })
        .optional(),
};
