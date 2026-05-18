"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_enum_1 = require("../../Utils/enums/auth.enum");
const authentication_middleware_1 = require("../../Middleware/authentication.middleware");
const post_service_1 = __importDefault(require("./post.service"));
const router = (0, express_1.Router)();
router.post("/create", (0, authentication_middleware_1.authentication)({ tokenType: auth_enum_1.TokenTypeEnum.ACCESS }), (0, authentication_middleware_1.authorization)({ accessRoles: [auth_enum_1.RoleEnum.USER] }), post_service_1.default.createPost);
exports.default = router;
