import z from "zod";
import { generalFields } from "../../Middleware/validation.middleware";

export const createNotificationSchema = {
  body: z.strictObject({
    title: z.string().min(1),
    body: z.string().min(1),
    recipients: z.array(generalFields.id).min(1),
    data: z.record(z.any()).optional(),
  }),
};

export const updateNotificationSchema = {
  params: z.strictObject({
    notificationId: generalFields.id,
  }),
  body: z
    .strictObject({
      title: z.string().min(1).optional(),
      body: z.string().min(1).optional(),
      recipients: z.array(generalFields.id).optional(),
      data: z.record(z.any()).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided to update.",
    }),
};

export const notificationReadSchema = {
  params: z.strictObject({
    notificationId: generalFields.id,
  }),
  query: z.strictObject({
    markRead: z.coerce.boolean().optional(),
  }),
};

export const notificationParamsSchema = {
  params: z.strictObject({
    notificationId: generalFields.id,
  }),
};
