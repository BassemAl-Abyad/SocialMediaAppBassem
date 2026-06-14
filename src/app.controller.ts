import express, { Request, Response, NextFunction } from "express";
import { Express } from "express";
import helmet from "helmet";
import { corsMiddleware } from "./Utils/cors/cors.utils";
import { generalLimiter } from "./Utils/rateLimiter/rateLimiter";
import {
  AuthRouter,
  PostRouter,
  UserRouter,
  StoryRouter,
  NotificationRouter,
} from "./Modules";
import {
  globalErrorHandler,
  NotFoundException,
} from "./Utils/response/error.response";
import { PORT } from "./config/config.service";
import connectDB from "./DB/connection";
import { redisConnection } from "./DB/repositories/redis.connection";
import { notification } from "./Utils/services/notification.service";
import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";
import { createHandler } from "graphql-http/lib/use/express";

export const bootstrap = async () => {
  const app: Express = express();

  // Apply security middleware
  app.use(helmet());
  app.use(corsMiddleware);
  app.use(generalLimiter);

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Notification test
  notification;
  app.post("/send-notification", (req: Request, res: Response) => {
    notification.sendNotification({
      token: req.body.token,
      data: { title: "First Notification", body: "Body of notification!" },
    });
  });

  // DB connection
  await connectDB();
  await redisConnection();

  // All routes
  app.use(`/api/auth`, AuthRouter);
  app.use(`/api/user`, UserRouter);
  app.use(`/api/post`, PostRouter);
  app.use(`/api/story`, StoryRouter);
  app.use(`/api/notification`, NotificationRouter);

  // Graphql
  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: "RootQueryType",
      description: "First description optional",
      fields: {
        sayHi: {
          type: GraphQLString,
          resolve() {
            return "Hello From GraphQL API";
          },
        },
        hello: {
          type: new GraphQLObjectType({
            name: "Hello",
            description: "Second description",
            fields: {
              sayHi2: {
                type: GraphQLFloat,
                resolve: () => {
                  return 22.5;
                },
              },
              sayHi3: {
                type: GraphQLString,
                resolve: () => {
                  return "Hello From SayHi3";
                },
              },
            },
          }),
          resolve(): { message: string } {
            return { message: "Hello From Hello Object Type" };
          },
        },
      },
    }),
    mutation: new GraphQLObjectType({
      name: "GraphQLMutation",
      description: "Mutation Description",
      fields: {
        welcome: {
          type: new GraphQLObjectType({
            name: "welcome",
            description: "Welcome Mutation",
            fields: {
              message: { type: new GraphQLNonNull(GraphQLString) },
            },
          }),
          resolve: (): { message: string } => {
            return { message: "Welcome from mutation" };
          },
        },
        welcome2: {
          type: new GraphQLNonNull(GraphQLString),
          args: {
            searchKey: {
              type: GraphQLString,
              description: "Search Key",
            },
            name: {
              type: new GraphQLNonNull(GraphQLString),
              description: "Name Key",
            },
            data: {
              type: new GraphQLInputObjectType({
                name: "inputs",
                fields: {
                  match: { type: GraphQLBoolean },
                },
              }),
              description: "Data Key",
            },
          },
          resolve: (_parent, args): string => {
            return `Welcome from welcome 2 arguments: ${args.searchKey ?? ""} ${args.name ?? ""} ${args.data?.match ?? ""}`.trim();
          },
        },
      },
    }),
  });

  app.all(`/graphql`, createHandler({ schema }));

  // Not found route
  app.use((req: Request, res: Response) => {
    throw new NotFoundException("Handler not found!");
  });

  // Global Errors Handling
  app.use(globalErrorHandler);

  // App listen
  app.listen(PORT, (): void => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};
