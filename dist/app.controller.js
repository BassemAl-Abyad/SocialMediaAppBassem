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
const connection_1 = __importDefault(require("./DB/connection"));
const redis_connection_1 = require("./DB/repositories/redis.connection");
const notification_service_1 = require("./Utils/services/notification.service");
const authentication_middleware_1 = require("./Middleware/authentication.middleware");
const express_2 = require("graphql-http/lib/use/express");
const schema_gql_1 = require("./Modules/graphql/schema.gql");
const auth_enum_1 = require("./Utils/enums/auth.enum");
const socket_io_1 = require("socket.io");
const bootstrap = async () => {
    const app = (0, express_1.default)();
    // Apply security middleware
    app.use((0, helmet_1.default)());
    app.use(cors_utils_1.corsMiddleware);
    app.use(rateLimiter_1.generalLimiter);
    // Body parsing middleware
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    // Notification test
    notification_service_1.notification;
    app.post("/send-notification", (req, res) => {
        notification_service_1.notification.sendNotification({
            token: req.body.token,
            data: { title: "First Notification", body: "Body of notification!" },
        });
    });
    // DB connection
    await (0, connection_1.default)();
    await (0, redis_connection_1.redisConnection)();
    // All routes
    app.use(`/api/auth`, Modules_1.AuthRouter);
    app.use(`/api/user`, Modules_1.UserRouter);
    app.use(`/api/post`, Modules_1.PostRouter);
    app.use(`/api/story`, Modules_1.StoryRouter);
    app.use(`/api/notification`, Modules_1.NotificationRouter);
    // Graphql
    app.all("/graphql", (0, authentication_middleware_1.authentication)({ tokenType: auth_enum_1.TokenTypeEnum.ACCESS }), (0, express_2.createHandler)({
        schema: schema_gql_1.schema,
        context: (req) => ({ user: req.raw.user, decoded: req.raw.decoded }),
    }));
    // Not found route
    app.use((req, res) => {
        throw new error_response_1.NotFoundException("Handler not found!");
    });
    // Global Errors Handling
    app.use(error_response_1.globalErrorHandler);
    // App listen
    const httpServer = app.listen(config_service_1.PORT, () => {
        console.log(`Server is running on http://localhost:${config_service_1.PORT}`);
    });
    // Socket.io setup
    const io = new socket_io_1.Server(httpServer, { cors: {
            origin: "*",
        } });
    io.on("connection", (socket) => {
        console.log("User successfully connected: " + socket.id);
        socket.on("Hi", (data) => {
            console.log("Received 'Hi' event with data:", data);
        });
        socket.on("disconnect", () => {
            console.log("User disconnected: " + socket.id);
        });
    });
};
exports.bootstrap = bootstrap;
