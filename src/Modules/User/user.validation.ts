import z from "zod";
import { generalFields } from "../../Middleware/validation.middleware";
import { GenderEnum } from "../../Utils/enums/auth.enum";

export const updateProfileSchema = {
  body: z.strictObject({
    firstName: z.string().min(2).max(25).optional(),
    lastName: z.string().min(2).max(25).optional(),
    username: z.string().min(3).max(41).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    gender: z.enum(Object.values(GenderEnum) as [string, ...string[]]).optional(),
    ProfilePic: z.string().url().optional(),
  }),
};

export const getUserSchema = {
  params: z.strictObject({
    userId: generalFields.id,
  }),
};
