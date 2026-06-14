"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationParamsSchema = exports.notificationReadSchema = exports.updateNotificationSchema = exports.createNotificationSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const validation_middleware_1 = require("../../Middleware/validation.middleware");
exports.createNotificationSchema = {
    body: zod_1.default.strictObject({
        title: zod_1.default.string().min(1),
        body: zod_1.default.string().min(1),
        recipients: zod_1.default.array(validation_middleware_1.generalFields.id).min(1),
        data: zod_1.default.record(zod_1.default.string(), zod_1.default.any()).optional(),
    }),
};
exports.updateNotificationSchema = {
    params: zod_1.default.strictObject({
        notificationId: validation_middleware_1.generalFields.id,
    }),
    body: zod_1.default
        .strictObject({
        title: zod_1.default.string().min(1).optional(),
        body: zod_1.default.string().min(1).optional(),
        recipients: zod_1.default.array(validation_middleware_1.generalFields.id).optional(),
        data: zod_1.default.record(zod_1.default.string(), zod_1.default.any()).optional(),
    })
        .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided to update.",
    }),
};
exports.notificationReadSchema = {
    params: zod_1.default.strictObject({
        notificationId: validation_middleware_1.generalFields.id,
    }),
    query: zod_1.default.strictObject({
        markRead: zod_1.default.coerce.boolean().optional(),
    }),
};
exports.notificationParamsSchema = {
    params: zod_1.default.strictObject({
        notificationId: validation_middleware_1.generalFields.id,
    }),
};
