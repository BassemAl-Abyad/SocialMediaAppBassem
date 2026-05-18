import { Router } from "express";
import { authentication, authorization } from "../../Middleware/authentication.middleware";
import { RoleEnum, TokenTypeEnum } from "../../Utils/enums/auth.enum";
import notificationService from "./notification.service";
import { validation } from "../../Middleware/validation.middleware";
import { createNotificationSchema, notificationReadSchema, notificationParamsSchema, updateNotificationSchema } from "./notification.validation";

const router: Router = Router();

router.post(
  "/create",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [RoleEnum.ADMIN] }),
  validation(createNotificationSchema),
  notificationService.createNotification,
);

router.get(
  "/",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [RoleEnum.ADMIN] }),
  notificationService.getNotifications,
);

router.get(
  "/me",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  notificationService.getMyNotifications,
);

router.patch(
  "/:notificationId",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [RoleEnum.ADMIN] }),
  validation(updateNotificationSchema),
  notificationService.updateNotification,
);

router.patch(
  "/:notificationId/read",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  validation(notificationReadSchema),
  notificationService.markNotificationRead,
);

router.delete(
  "/:notificationId",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [RoleEnum.ADMIN] }),
  validation(notificationParamsSchema),
  notificationService.deleteNotification,
);

export default router;
