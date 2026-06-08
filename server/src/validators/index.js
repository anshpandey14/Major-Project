import { body } from "express-validator";

const userRegisterValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("password must be 6 characters"),
    body("fullName").notEmpty().withMessage("Name is required"),
  ];
};

const userLoginValidator = () => {
  return [
    body().custom((value) => {
      if (!value.email && !value.username) {
        throw new Error("Email or username is required");
      }

      return true;
    }),

    body("email").optional().trim().isEmail().withMessage("Email is invalid"),

    body("username").optional().trim(),

    body("password").trim().notEmpty().withMessage("Password is required"),
  ];
};

const userChangeCurrentPasswordValidator = () => {
  return [
    body("oldPassword")
      .trim()
      .notEmpty()
      .withMessage("Old password is required"),

    body("newPassword")
      .trim()
      .notEmpty()
      .withMessage("New password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
      .custom((value, { req }) => {
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
};

export {
  userRegisterValidator,
  userLoginValidator,
  userChangeCurrentPasswordValidator,
};
