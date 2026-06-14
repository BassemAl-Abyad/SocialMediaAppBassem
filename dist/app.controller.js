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
const graphql_1 = require("graphql");
const express_2 = require("graphql-http/lib/use/express");
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
    const schema = new graphql_1.GraphQLSchema({
        query: new graphql_1.GraphQLObjectType({
            name: "RootQueryType",
            description: "First description optional",
            fields: {
                sayHi: {
                    type: graphql_1.GraphQLString,
                    resolve() {
                        return "Hello From GraphQL API";
                    },
                },
                hello: {
                    type: new graphql_1.GraphQLObjectType({
                        name: "Hello",
                        description: "Second description",
                        fields: {
                            sayHi2: {
                                type: graphql_1.GraphQLFloat,
                                resolve: () => {
                                    return 22.5;
                                },
                            },
                            sayHi3: {
                                type: graphql_1.GraphQLString,
                                resolve: () => {
                                    return "Hello From SayHi3";
                                },
                            },
                        },
                    }),
                    resolve() {
                        return { message: "Hello From Hello Object Type" };
                    },
                },
            },
        }),
        mutation: new graphql_1.GraphQLObjectType({
            name: "GraphQLMutation",
            description: "Mutation Description",
            fields: {
                welcome: {
                    type: new graphql_1.GraphQLObjectType({
                        name: "welcome",
                        description: "Welcome Mutation",
                        fields: {
                            message: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                        },
                    }),
                    resolve: () => {
                        return { message: "Welcome from mutation" };
                    },
                },
                welcome2: {
                    type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString),
                    args: {
                        searchKey: {
                            type: graphql_1.GraphQLString,
                            description: "Search Key",
                        },
                        name: {
                            type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString),
                            description: "Name Key",
                        },
                        data: {
                            type: new graphql_1.GraphQLInputObjectType({
                                name: "inputs",
                                fields: {
                                    match: { type: graphql_1.GraphQLBoolean },
                                },
                            }),
                            description: "Data Key",
                        },
                    },
                    resolve: (_parent, args) => {
                        return `Welcome from welcome 2 arguments: ${args.searchKey ?? ""} ${args.name ?? ""} ${args.data?.match ?? ""}`.trim();
                    },
                },
            },
        }),
    });
    app.all(`/graphql`, (0, express_2.createHandler)({ schema }));
    // Not found route
    app.use((req, res) => {
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
