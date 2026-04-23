"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = void 0;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_utils_1 = require("./Utils/cors/cors.utils");
const rateLimiter_1 = require("./Utils/rateLimiter/rateLimiter");
const Modules_1 = require("./Modules");
const error_response_1 = require("./Utils/response/error.response");
const config_service_1 = require("./config/config.service");
const bootstrap = async () => {
    const app = (0, express_1.default)();
    // Apply security middleware
    app.use((0, helmet_1.default)());
    app.use(cors_utils_1.corsMiddleware);
    app.use(rateLimiter_1.generalLimiter);
    // Body parsing middleware
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    // Main route
    app.get("/", (req, res, next) => {
        return res
            .status(200)
            .json({ message: "Welcome to Social Media App by Bassem." });
    });
    // All routes
    app.use(`/api/auth`, Modules_1.AuthRouter);
    app.use(`/api/users`, Modules_1.UserRouter);
    app.use(`/api/posts`, Modules_1.PostRouter);
    app.use(`/api/comments`, Modules_1.CommentRouter);
    // Not found route
    app.use("{/*dummy}", (req, res) => {
        throw new error_response_1.NotFoundException("Handler not found!");
    });
    // Global Errors Handling
    app.use(error_response_1.globalErrorHandler);
    // App listen
    app.listen(config_service_1.PORT, () => {
        console.log(`Server is running on http://localhost:${config_service_1.PORT}`);
    });
};
exports.bootstrap = bootstrap;
