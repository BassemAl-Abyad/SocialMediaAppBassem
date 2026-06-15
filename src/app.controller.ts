import express, { Request, Response, NextFunction } from "express";
import { Express } from "express";
import helmet from "helmet";
import { corsMiddleware, corsOptions } from "./Utils/cors/cors.utils";
import { generalLimiter } from "./Utils/rateLimiter/rateLimiter";
import {
  AuthRouter,
  PostRouter,
  UserRouter,
  StoryRouter,
  NotificationRouter,
  graphqlHandler,
} from "./Modules";
import {
  globalErrorHandler,
  NotFoundException,
} from "./Utils/response/error.response";
import { PORT } from "./config/config.service";
import connectDB from "./DB/connection";
import { redisConnection } from "./DB/repositories/redis.connection";
import { notification } from "./Utils/services/notification.service";
import { authentication } from "./Middleware/authentication.middleware";
import { createHandler } from "graphql-http/lib/use/express";
import { schema } from "./Modules/graphql/schema.gql";
import { TokenTypeEnum } from "./Utils/enums/auth.enum";
import { Server } from "socket.io";

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
  app.all(
    "/graphql",
    authentication({ tokenType: TokenTypeEnum.ACCESS }),
    createHandler({
      schema: schema,
      context: (req) => ({ user: req.raw.user, decoded: req.raw.decoded }),
    }),
  );

  // Not found route
  app.use((req: Request, res: Response) => {
    throw new NotFoundException("Handler not found!");
  });

  // Global Errors Handling
  app.use(globalErrorHandler);

  // App listen
  const httpServer = app.listen(PORT, (): void => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  // Socket.io setup
  const io = new Server(httpServer, { cors: {
    origin: "*",
  } });

  // http://localhost:3000/
  io.on("connection", (socket) => {
    console.log("(Main connection) User successfully connected: " + socket.id);

    socket.on("Hi", (data) => {
      console.log("(Main connection) Received 'Hi' event with data:", data);
    });

    // socket.emit("product", { id: 1, name: "Sample Product", price: 9.99 });

    socket.on("sayHi", (data, callback) => {
      console.log("(Main connection) Received 'sayHi' event with data:", data);
      if (callback) {
        callback({ message: "Hello from the server!" });
      }
    })

    socket.on("disconnect", () => {
      console.log("(Main connection) User disconnected: " + socket.id);
    });
  });

  // http://localhost:3000/admin/
  io.of("/admin").on("connection", (socket) => {
    console.log("(Admin connection) Admin successfully connected: " + socket.id);
});
};
