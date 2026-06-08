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

export { userRegisterValidator, userLoginValidator };
