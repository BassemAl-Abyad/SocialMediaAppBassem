import { Router } from "express";
import { authentication } from "../../Middleware/authentication.middleware";
import { TokenTypeEnum } from "../../Utils/enums/auth.enum";
import userService from "./user.service";
import { validation } from "../../Middleware/validation.middleware";
import * as userValidation from "./user.validation";

const router: Router = Router();

router.get(
  "/profile",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  userService.getProfile,
);

router.patch(
  "/profile",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  validation(userValidation.updateProfileSchema),
  userService.updateProfile,
);

router.get(
  "/:userId",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  validation(userValidation.getUserSchema),
  userService.getUserById,
);

export default router;
