import { NextFunction, Request, Response } from "express";
import z, { ZodError, ZodType } from "zod";
import { BadRequestException } from "../Utils/response/error.response";

type KeyReqType = keyof Request;
type SchemaType = Partial<Record<KeyReqType, ZodType>>;

export const validation = (schema: SchemaType) => {
  return (req: Request, res: Response, next: NextFunction): NextFunction => {
    const validationError: Array<{
      key: KeyReqType;
      issues: Array<{
        message: string;
        path: (string | number | symbol)[];
        code: string;
      }>;
    }> = [];

    for (const key of Object.keys(schema) as KeyReqType[]) {
      if (!schema[key]) continue;
      const validationResults = schema[key].safeParse(req[key]);
      if (!validationResults.success) {
        const errors = validationResults.error as ZodError;
        validationError.push({
          key,
          issues: errors.issues.map((issue) => {
            return {
              message: issue.message,
              path: issue.path,
              code: issue.code,
            };
          }),
        });
      }
    }

    if (validationError.length > 0) {
      throw new BadRequestException("Validation error", {
        cause: validationError,
      });
    }

    return next() as unknown as NextFunction;
  };
};

export const generalFields = {
  username: z
    .string({ error: "Username is required." })
    .min(3, { error: "Username must be atleast 3 characters long." })
    .max(20, { error: "Username must be atmost 20 characters long." }),
  email: z.email({ error: "Email is required." }),
  password: z.string({ error: "Password is required." }),
  confirmPassword: z.string({ error: "Confirm password is required." }),
  gender: z
    .enum(["Male", "Female"], {
      error: "Gender is required Male or Female.",
    })
    .optional(),
  otp: z.string().regex(/^\d{6}$/),
};
