import { Router } from "express";
import { authentication, authorization } from "../../Middleware/authentication.middleware";
import { RoleEnum, TokenTypeEnum } from "../../Utils/enums/auth.enum";
import storyService from "./story.service";
import { validation } from "../../Middleware/validation.middleware";
import { createStorySchema, feedStorySchema, storyParamsSchema } from "./story.validation";

const router: Router = Router();

router.post(
  "/create",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [RoleEnum.USER, RoleEnum.ADMIN] }),
  validation(createStorySchema),
  storyService.createStory,
);

router.get(
  "/feed",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  validation(feedStorySchema),
  storyService.getFeed,
);

router.get(
  "/profile",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  validation(storyParamsSchema),
  storyService.getUserStories,
);

router.get(
  "/profile/:userId",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  validation(storyParamsSchema),
  storyService.getUserStories,
);

router.delete(
  "/:storyId",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [RoleEnum.USER, RoleEnum.ADMIN] }),
  storyService.deleteStory,
);

router.patch(
  "/:storyId/restore",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [RoleEnum.USER, RoleEnum.ADMIN] }),
  storyService.restoreStory,
);

router.delete(
  "/:storyId/hard",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [RoleEnum.ADMIN] }),
  storyService.hardDeleteStory,
);

export default router;
