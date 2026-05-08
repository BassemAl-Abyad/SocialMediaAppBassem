"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authentication_middleware_1 = require("../../Middleware/authentication.middleware");
const auth_enum_1 = require("../../Utils/enums/auth.enum");
const user_service_1 = __importDefault(require("./user.service"));
const router = (0, express_1.Router)();
router.get("/profile", (0, authentication_middleware_1.authentication)({ tokenType: auth_enum_1.TokenTypeEnum.ACCESS }), user_service_1.default.getProfile);
exports.default = router;
