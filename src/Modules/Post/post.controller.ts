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
  authorization({ accessRoles: [RoleEnum.USER, RoleEnum.ADMIN] }),
  validation(postValidation.createPostSchema),
  postService.createPost,
);

router.get(
  "/feed",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  postService.getFeed,
);

router.get(
  "/dashboard",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  postService.getDashboard,
);

router.get(
  "/profile",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  postService.getProfilePosts,
);

router.get(
  "/profile/:userId",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  postService.getProfilePosts,
);

router.get(
  "/:postId",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  postService.getPost,
);

router.patch(
  "/:postId",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [RoleEnum.USER, RoleEnum.ADMIN] }),
  validation(postValidation.createPostSchema),
  postService.updatePost,
);

router.delete(
  "/:postId",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [RoleEnum.USER, RoleEnum.ADMIN] }),
  postService.deletePost,
);

router.patch(
  "/:postId/restore",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [RoleEnum.USER, RoleEnum.ADMIN] }),
  postService.restorePost,
);

router.delete(
  "/:postId/hard",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [RoleEnum.ADMIN] }),
  postService.hardDeletePost,
);

router.patch(
  "/:postId/react",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [RoleEnum.USER, RoleEnum.ADMIN] }),
  validation(postValidation.reactPostSchema),
  postService.reactPost,
);

export default router;
