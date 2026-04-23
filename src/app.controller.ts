import express, { Request, Response, NextFunction } from "express";
import { Express } from "express";
import helmet from "helmet";
import { corsMiddleware } from "./Utils/cors/cors.utils";
import { generalLimiter } from "./Utils/rateLimiter/rateLimiter";
import { AuthRouter, CommentRouter, PostRouter, UserRouter } from "./Modules";
import { globalErrorHandler, NotFoundException } from "./Utils/response/error.response";
import { PORT } from "./config/config.service";

export const bootstrap = async () => {
  const app: Express = express();
  
  // Apply security middleware
  app.use(helmet());
  app.use(corsMiddleware);
  app.use(generalLimiter);
  
  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Main route
  app.get("/", (req: Request, res: Response, next: NextFunction): Response => {
    return res
      .status(200)
      .json({ message: "Welcome to Social Media App by Bassem." });
  });

  // All routes
  app.use(`/api/auth`, AuthRouter);
  app.use(`/api/users`, UserRouter);
  app.use(`/api/posts`, PostRouter);
  app.use(`/api/comments`, CommentRouter);

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
