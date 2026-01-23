import { Router } from "express";
import {
  changeCurrentPassword,
  forgotPassword,
  getCurrentUser,
  login,
  logout,
  registerUser,
  resendEmailVerification,
  resetPassword,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { validate } from "../middlewared/validator.middleware.js";
import {
  userLoginValidator,
  userRegisterValidator,
  userForgetPasswordValidaotr,
  ForgetResetPasswordValidaotr,
  userChangeCurrentPasswordValidaotr,
} from "../validators/index.js";
import { verifyJwt } from "../middlewared/auth.middleware.js";

const router = Router();

// Unsecure Routes
router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, login);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router
  .route("/forgot-password")
  .post(userForgetPasswordValidaotr(), validate, forgotPassword);
router
  .route("/reset-password/:token")
  .post(ForgetResetPasswordValidaotr(), validate, resetPassword);

//secure Routes
router.route("/logout").post(verifyJwt, logout);
router.route("/current-user").get(verifyJwt, getCurrentUser);
router
  .route("/change-password")
  .post(
    verifyJwt,
    userChangeCurrentPasswordValidaotr(),
    validate,
    changeCurrentPassword,
  );
router
  .route("/resend-email-verification")
  .get(verifyJwt, resendEmailVerification);

export default router;
