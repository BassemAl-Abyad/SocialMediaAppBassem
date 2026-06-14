"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_enum_1 = require("../../Utils/enums/auth.enum");
const authentication_middleware_1 = require("../../Middleware/authentication.middleware");
const post_service_1 = __importDefault(require("./post.service"));
const postValidation = __importStar(require("./post.validation"));
const validation_middleware_1 = require("../../Middleware/validation.middleware");
const index_1 = require("../index");
const router = (0, express_1.Router)();
router.use("/:postId/comment", index_1.CommentRouter);
router.post("/create", (0, authentication_middleware_1.authentication)({ tokenType: auth_enum_1.TokenTypeEnum.ACCESS }), (0, authentication_middleware_1.authorization)({ accessRoles: [auth_enum_1.RoleEnum.USER, auth_enum_1.RoleEnum.ADMIN] }), (0, validation_middleware_1.validation)(postValidation.createPostSchema), post_service_1.default.createPost);
router.get("/feed", (0, authentication_middleware_1.authentication)({ tokenType: auth_enum_1.TokenTypeEnum.ACCESS }), post_service_1.default.getFeed);
router.get("/dashboard", (0, authentication_middleware_1.authentication)({ tokenType: auth_enum_1.TokenTypeEnum.ACCESS }), post_service_1.default.getDashboard);
router.get("/profile", (0, authentication_middleware_1.authentication)({ tokenType: auth_enum_1.TokenTypeEnum.ACCESS }), post_service_1.default.getProfilePosts);
router.get("/profile/:userId", (0, authentication_middleware_1.authentication)({ tokenType: auth_enum_1.TokenTypeEnum.ACCESS }), post_service_1.default.getProfilePosts);
router.get("/:postId", (0, authentication_middleware_1.authentication)({ tokenType: auth_enum_1.TokenTypeEnum.ACCESS }), post_service_1.default.getPost);
router.patch("/:postId", (0, authentication_middleware_1.authentication)({ tokenType: auth_enum_1.TokenTypeEnum.ACCESS }), (0, authentication_middleware_1.authorization)({ accessRoles: [auth_enum_1.RoleEnum.USER, auth_enum_1.RoleEnum.ADMIN] }), (0, validation_middleware_1.validation)(postValidation.createPostSchema), post_service_1.default.updatePost);
router.delete("/:postId", (0, authentication_middleware_1.authentication)({ tokenType: auth_enum_1.TokenTypeEnum.ACCESS }), (0, authentication_middleware_1.authorization)({ accessRoles: [auth_enum_1.RoleEnum.USER, auth_enum_1.RoleEnum.ADMIN] }), post_service_1.default.deletePost);
router.patch("/:postId/restore", (0, authentication_middleware_1.authentication)({ tokenType: auth_enum_1.TokenTypeEnum.ACCESS }), (0, authentication_middleware_1.authorization)({ accessRoles: [auth_enum_1.RoleEnum.USER, auth_enum_1.RoleEnum.ADMIN] }), post_service_1.default.restorePost);
router.delete("/:postId/hard", (0, authentication_middleware_1.authentication)({ tokenType: auth_enum_1.TokenTypeEnum.ACCESS }), (0, authentication_middleware_1.authorization)({ accessRoles: [auth_enum_1.RoleEnum.ADMIN] }), post_service_1.default.hardDeletePost);
router.patch("/:postId/react", (0, authentication_middleware_1.authentication)({ tokenType: auth_enum_1.TokenTypeEnum.ACCESS }), (0, authentication_middleware_1.authorization)({ accessRoles: [auth_enum_1.RoleEnum.USER, auth_enum_1.RoleEnum.ADMIN] }), (0, validation_middleware_1.validation)(postValidation.reactPostSchema), post_service_1.default.reactPost);
exports.default = router;
