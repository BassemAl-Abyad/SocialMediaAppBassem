import express, { Request, Response, NextFunction } from "express";
import { Express } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";

// rate limiter
const limiter:RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message:{
    statusCode: 429,
    message: "Too many requests, please try again later."
  }
});

export const bootstrap = async () => {
  const app: Express = express();
  const PORT: number | string = 3000;

  app.use(express.json(), cors(), helmet(), limiter)

  app.get("/", (req: Request, res: Response, next: NextFunction): Response => {
    return res
      .status(200)
      .json({ message: "Welcome to Social Media App by Bassem." });
  });

  app.use("{/*dummy}", (req: Request, res: Response): Response => {
    return res
      .status(404)
      .json({ message: "Handler not found!" });
  });

  app.listen(PORT, (): void => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};
