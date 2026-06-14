"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserSchema = exports.updateProfileSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const validation_middleware_1 = require("../../Middleware/validation.middleware");
const auth_enum_1 = require("../../Utils/enums/auth.enum");
exports.updateProfileSchema = {
    body: zod_1.default.strictObject({
        firstName: zod_1.default.string().min(2).max(25).optional(),
        lastName: zod_1.default.string().min(2).max(25).optional(),
        username: zod_1.default.string().min(3).max(41).optional(),
        email: zod_1.default.string().email().optional(),
        phone: zod_1.default.string().optional(),
        address: zod_1.default.string().optional(),
        gender: zod_1.default.enum(Object.values(auth_enum_1.GenderEnum)).optional(),
        ProfilePic: zod_1.default.string().url().optional(),
    }),
};
exports.getUserSchema = {
    params: zod_1.default.strictObject({
        userId: validation_middleware_1.generalFields.id,
    }),
};
