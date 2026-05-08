import { Router } from "express";
import { authentication } from "../../Middleware/authentication.middleware";
import { TokenTypeEnum } from "../../Utils/enums/auth.enum";
import userService from "./user.service";

const router: Router = Router();

router.get(
  "/profile",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  userService.getProfile,
);

export default router;
