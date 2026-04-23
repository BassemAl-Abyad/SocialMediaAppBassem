import { Router } from "express";
import authService from "./auth.service";
const router:Router = Router();

router.post("/signup", authService.signUp);
router.post("/login", authService.login);
router.post("/logout", authService.logout);

export default router;
