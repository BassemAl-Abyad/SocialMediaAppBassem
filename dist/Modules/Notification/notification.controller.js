"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authentication_middleware_1 = require("../../Middleware/authentication.middleware");
const auth_enum_1 = require("../../Utils/enums/auth.enum");
const notification_service_1 = __importDefault(require("./notification.service"));
const validation_middleware_1 = require("../../Middleware/validation.middleware");
const notification_validation_1 = require("./notification.validation");
const router = (0, express_1.Router)();
router.post("/create", (0, authentication_middleware_1.authentication)({ tokenType: auth_enum_1.TokenTypeEnum.ACCESS }), (0, authentication_middleware_1.authorization)({ accessRoles: [auth_enum_1.RoleEnum.ADMIN] }), (0, validation_middleware_1.validation)(notification_validation_1.createNotificationSchema), notification_service_1.default.createNotification);
router.get("/", (0, authentication_middleware_1.authentication)({ tokenType: auth_enum_1.TokenTypeEnum.ACCESS }), (0, authentication_middleware_1.authorization)({ accessRoles: [auth_enum_1.RoleEnum.ADMIN] }), notification_service_1.default.getNotifications);
router.get("/me", (0, authentication_middleware_1.authentication)({ tokenType: auth_enum_1.TokenTypeEnum.ACCESS }), notification_service_1.default.getMyNotifications);
router.patch("/:notificationId", (0, authentication_middleware_1.authentication)({ tokenType: auth_enum_1.TokenTypeEnum.ACCESS }), (0, authentication_middleware_1.authorization)({ accessRoles: [auth_enum_1.RoleEnum.ADMIN] }), (0, validation_middleware_1.validation)(notification_validation_1.updateNotificationSchema), notification_service_1.default.updateNotification);
router.patch("/:notificationId/read", (0, authentication_middleware_1.authentication)({ tokenType: auth_enum_1.TokenTypeEnum.ACCESS }), (0, validation_middleware_1.validation)(notification_validation_1.notificationReadSchema), notification_service_1.default.markNotificationRead);
router.delete("/:notificationId", (0, authentication_middleware_1.authentication)({ tokenType: auth_enum_1.TokenTypeEnum.ACCESS }), (0, authentication_middleware_1.authorization)({ accessRoles: [auth_enum_1.RoleEnum.ADMIN] }), (0, validation_middleware_1.validation)(notification_validation_1.notificationParamsSchema), notification_service_1.default.deleteNotification);
exports.default = router;
