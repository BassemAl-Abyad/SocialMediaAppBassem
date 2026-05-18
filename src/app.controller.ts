import express, { Request, Response, NextFunction } from "express";
import { Express } from "express";
import helmet from "helmet";
import { corsMiddleware } from "./Utils/cors/cors.utils";
import { generalLimiter } from "./Utils/rateLimiter/rateLimiter";
import { AuthRouter, PostRouter, UserRouter } from "./Modules";
import {
  globalErrorHandler,
  NotFoundException,
} from "./Utils/response/error.response";
import { PORT } from "./config/config.service";
import connectDB from "./DB/connection";
import { redisConnection } from "./DB/repositories/redis.connection";
import { notification } from "./Utils/services/notification.service";

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
  
  // Not found route
  app.use("{/*dummy}", (req: Request, res: Response): Response => {
    throw new NotFoundException("Handler not found!");
  });

  // Global Errors Handling
  app.use(globalErrorHandler);

  // App listen
  app.listen(PORT, (): void => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};
