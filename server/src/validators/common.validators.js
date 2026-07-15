import { body, param, query } from "express-validator";

export const emailValidator = (required = true) => {
  let validator = body("email").trim();

  if (required) {
    validator = validator.notEmpty().withMessage("Email is required");
  } else {
    validator = validator.optional();
  }

  return validator.isEmail().withMessage("Invalid email");
};

export const passwordValidator = (
  field = "password",
  required = true,
  min = 6,
) => {
  let validator = body(field).trim();

  if (required) {
    validator = validator.notEmpty().withMessage(`${field} is required`);
  } else {
    validator = validator.optional();
  }

  return validator
    .isLength({ min })
    .withMessage(`Password must be at least ${min} characters long`);
};

export const phoneValidator = (required = true) => {
  let validator = body("phone").trim();

  if (required) {
    validator = validator.notEmpty().withMessage("Phone number is required");
  } else {
    validator = validator.optional();
  }

  return validator
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Enter a valid 10-digit Indian mobile number");
};

export const fullNameValidator = (required = true) => {
  let validator = body("fullName").trim();

  if (required) {
    validator = validator.notEmpty().withMessage("Full name is required");
  } else {
    validator = validator.optional();
  }

  return validator
    .isLength({ min: 3, max: 50 })
    .withMessage("Full name must be between 3 and 50 characters");
};

export const mongoIdValidator = (field) =>
  param(field).isMongoId().withMessage(`Invalid ${field}`);

export const dateValidator = (field, required = false) => {
  let validator = body(field);

  if (required) {
    validator = validator.notEmpty().withMessage(`${field} is required`);
  } else {
    validator = validator.optional();
  }

  return validator.isISO8601().withMessage(`Invalid ${field}`);
};

export const numberValidator = (field, min, max, unit) =>
  body(field)
    .optional()
    .isFloat({ min, max })
    .withMessage(`${field} must be between ${min} and ${max} ${unit}`);

export const enumValidator = (field, values, required = false) => {
  let validator = body(field);

  if (required) {
    validator = validator.notEmpty().withMessage(`${field} is required`);
  } else {
    validator = validator.optional();
  }

  return validator.isIn(values).withMessage(`Invalid ${field}`);
};

export const paginationValidator = () => [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("search")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Search query is too long"),
];
