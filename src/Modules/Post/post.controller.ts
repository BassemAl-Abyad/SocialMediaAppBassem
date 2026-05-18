import { Router } from "express";
import { RoleEnum, TokenTypeEnum } from "../../Utils/enums/auth.enum";
import {
  authentication,
  authorization,
} from "../../Middleware/authentication.middleware";
import postService from "./post.service";
import * as postValidation from "./post.validation";
import { validation } from "../../Middleware/validation.middleware";
import { CommentRouter } from "../index";

const router: Router = Router();
router.use("/:postId/comment", CommentRouter);

router.post(
  "/create",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [RoleEnum.USER] }),
  validation(postValidation.createPostSchema),
  postService.createPost,
);

router.patch(
  "/:postId/react",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [RoleEnum.USER] }),
  validation(postValidation.reactPostSchema),
  postService.reactPost,
);

export default router;
