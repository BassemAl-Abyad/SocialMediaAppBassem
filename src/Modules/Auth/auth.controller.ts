import { Router } from "express";
import authService from "./auth.service";
const router:Router = Router();

router.get("/signup", authService.signUp);
router.get("/login", authService.login);
router.get("/logout", authService.logout);

export default router;
