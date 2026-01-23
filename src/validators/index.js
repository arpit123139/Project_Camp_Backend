import { body } from "express-validator";

export const userRegisterValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLowercase()
      .withMessage("Username must be in lower case")
      .isLength({ min: 3 })
      .withMessage("Username must be atleast 3 characters"),
    body("password").trim().notEmpty().withMessage("Password is required"),
    body("fullname")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Fullname is required"),
  ];
};
export const userLoginValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("password").trim().notEmpty().withMessage("Password is required"),
  ];
};

export const userChangeCurrentPasswordValidaotr = () => {
  return [
    body("oldPassword").notEmpty().withMessage("Old Password is required"),
  ];
};

export const userForgetPasswordValidaotr = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
  ];
};

export const ForgetResetPasswordValidaotr = () => {
  return [
    body("newPassword").notEmpty().withMessage("New Password is Required"),
  ];
};
