import { Router } from "express";
import { RoleEnum, TokenTypeEnum } from "../../Utils/enums/auth.enum";
import {
  authentication,
  authorization,
} from "../../Middleware/authentication.middleware";
import postService from "./post.service";
import * as postValidation from "./post.validation";

const router: Router = Router();

router.post(
  "/",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [RoleEnum.USER] }),
  postService.createPost,
);

export default router;
