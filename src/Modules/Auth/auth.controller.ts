import { Router } from "express";
import authService from "./auth.service";
import * as authValidation from "./auth.validation";
import { validation } from "../../Middleware/validation.middleware";
const router:Router = Router();

router.post("/signup", validation(authValidation.signupSchema), authService.signup);
router.patch("/confirm-email", validation(authValidation.confirmEmailSchema), authService.confirmEmail);
router.post("/reset-password", validation(authValidation.resetPasswordSchema), authService.resetPassword);
router.patch("/reset-password-confirm", validation(authValidation.resetPasswordConfirmSchema), authService.resetPasswordConfirm);
router.post("/resend-otp", validation(authValidation.resendOTPSchema), authService.resendOTP);
router.patch("/verify-account", validation(authValidation.verifyAccountSchema), authService.verifyAccount);
// router.post("/login", authService.login);
// router.post("/logout", authService.logout);

export default router;
