import { Router } from "express";
import commentService from "./comment.service";
import { validation } from "../../Middleware/validation.middleware";
import { authentication, authorization } from "../../Middleware/authentication.middleware";
import { RoleEnum, TokenTypeEnum } from "../../Utils/enums/auth.enum";
import * as commentValidation from "./comment.validation";

const router:Router = Router();

router.post(
  "/",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [RoleEnum.USER, RoleEnum.ADMIN] }),
  validation(commentValidation.createCommentSchema),
  commentService.createComment
);

router.patch(
  "/:commentId/react",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [RoleEnum.USER, RoleEnum.ADMIN] }),
  validation(commentValidation.reactCommentSchema),
  commentService.reactComment,
);

export default router;
