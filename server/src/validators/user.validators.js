import { body } from "express-validator";
import {
  emailValidator,
  passwordValidator,
  phoneValidator,
  fullNameValidator,
} from "./common.validators.js";

export const userRegisterValidator = () => [
  emailValidator(),
  passwordValidator(),
  fullNameValidator(),
];

export const userLoginValidator = () => [
  body().custom((value) => {
    if (!value.email && !value.username) {
      throw new Error("Email or username is required");
    }
    return true;
  }),

  emailValidator(false),

  body("username").optional().trim(),

  body("password").trim().notEmpty().withMessage("Password is required"),
];

export const userChangeCurrentPasswordValidator = () => [
  body("oldPassword").trim().notEmpty().withMessage("Old password is required"),

  passwordValidator("newPassword").custom((value, { req }) => {
    if (value === req.body.oldPassword) {
      throw new Error("New password must be different from old password");
    }
    return true;
  }),

  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

export const completeProfileValidator = () => [
  body("username")
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers and underscores"),

  phoneValidator(),
];
