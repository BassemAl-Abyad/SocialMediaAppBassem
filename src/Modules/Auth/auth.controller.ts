import { Router } from "express";
import authService from "./auth.service";
import * as authValidation from "./auth.validation";
import { validation } from "../../Middleware/validation.middleware";
import { authentication } from "../../Middleware/authentication.middleware";
import { TokenTypeEnum } from "../../Utils/enums/auth.enum";
const router: Router = Router();

router.post(
  "/signup",
  validation(authValidation.signupSchema),
  authService.signup,
);
router.post(
  "/login",
  validation(authValidation.loginSchema),
  authService.login,
);
router.patch(
  "/confirm-email",
  validation(authValidation.confirmEmailSchema),
  authService.confirmEmail,
);
router.post(
  "/reset-password",
  validation(authValidation.resetPasswordSchema),
  authService.resetPassword,
);
router.patch(
  "/reset-password-confirm",
  validation(authValidation.resetPasswordConfirmSchema),
  authService.resetPasswordConfirm,
);
router.post(
  "/resend-otp",
  validation(authValidation.resendOTPSchema),
  authService.resendOTP,
);
router.patch(
  "/verify-account",
  validation(authValidation.verifyAccountSchema),
  authService.verifyAccount,
);
router.patch(
  "/logout",
  authentication({tokenType: TokenTypeEnum.ACCESS}),
  validation(authValidation.logoutSchema),
  authService.logoutWithRedis,
);

export default router;
