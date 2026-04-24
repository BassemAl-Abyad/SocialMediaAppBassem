import { Router } from "express";
import authService from "./auth.service";
import * as authValidation from "./auth.validation";
import { validation } from "../../Middleware/validation.middleware";
const router:Router = Router();

router.post("/signup", validation(authValidation.signupSchema), authService.signUp);
router.post("/login", authService.login);
router.post("/logout", authService.logout);

export default router;
