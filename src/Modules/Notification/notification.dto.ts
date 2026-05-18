import z from "zod";
import { createNotificationSchema, updateNotificationSchema, notificationReadSchema, notificationParamsSchema } from "./notification.validation";

export type createNotificationDTO = z.infer<typeof createNotificationSchema.body>;
export type updateNotificationDTO = z.infer<typeof updateNotificationSchema.body>;
export type notificationReadDTO = z.infer<typeof notificationReadSchema.query>;
export type notificationParamsDTO = z.infer<typeof notificationParamsSchema.params>;
