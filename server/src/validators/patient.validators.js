import { body, param ,query} from "express-validator";
import {
  AvailablePatientGender,
  AvailableBloodGroups,
} from "../utils/constants.js";

export const createPatientValidator = () => {
  return [
    body("fullName")
      .trim()
      .notEmpty()
      .withMessage("Full name is required")
      .isLength({ min: 3, max: 50 })
      .withMessage("Full name nust be between 3 ans 50 characters"),

    body("Phone")
      .trim()
      .notEmpty()
      .withMessage("Phone number is required")
      .matches(/^[6-9]\d{9}$/)
      .withMessage("Enter a valid 10-digit Indian mobile number"),

    body("village").trim().notEmpty().withMessage("Village is required"),

    body("gender")
      .notEmpty()
      .withMessage("Gender is required")
      .isIn(AvailablePatientGender)
      .withMessage("Invalid gender"),

    body("dob")
      .notEmpty()
      .withMessage("Date of birth is required")
      .isISO8601()
      .withMessage("Invalid date of birth"),

    body("weight")
      .optional()
      .isFloat({ min: 0, max: 300 })
      .withMessage("weight must be between 0 and 300 kg"),

    body("height")
      .optional()
      .isFloat({ min: 0, max: 300 })
      .withMessage("height must be between 0 and 300 cm"),

    body("bloodGroup")
      .optional()
      .isIn(AvailableBloodGroups)
      .withMessage("Invalid blood group"),

    body("isPregnant")
      .optional()
      .isBoolean()
      .withMessage("isPregnant must be true or false"),

    body("lmpDate").optional().isISO8601().withMessage("Invalid LMP date"),
  ];
};

export const getAllPatientsValidator = () => {
  return [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive number"),

    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),

    query("search")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("search too long"),
  ];
};

export const getPatientByIdValidator = () => {
  return [param("patientId").isMongoId().withMessage("Invalid patient Id")];
};

export const updatePatientValidator = () => {
  return [
    param("patientId").isMongoId().withMessage("Invalid patient id"),

    body("fullName")
      .optional()
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage("Full name must be between 3 and 50 characters"),

    body("phone")
      .optional()
      .trim()
      .matches(/^[6-9]\d{9}$/)
      .withMessage("Enter a valid 10-digit Indian mobile number"),

    body("village")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Village cannot be empty"),

    body("gender")
      .optional()
      .isIn(AvailablePatientGender)
      .withMessage("Invalid gender"),

    body("dob").optional().isISO8601().withMessage("Invalid date of birth"),

    body("weight")
      .optional()
      .isFloat({ min: 0, max: 300 })
      .withMessage("Weight must be between 0 and 300 kg"),

    body("height")
      .optional()
      .isFloat({ min: 0, max: 300 })
      .withMessage("Height must be between 0 and 300 cm"),

    body("bloodGroup")
      .optional()
      .isIn(AvailableBloodGroups)
      .withMessage("Invalid blood group"),

    body("isPregnant")
      .optional()
      .isBoolean()
      .withMessage("isPregnant must be true or false"),

    body("lmpDate").optional().isISO8601().withMessage("Invalid LMP date"),
  ];
};

export const deletePatientValidator = () => {
  return [param("patientId").isMongoId().withMessage("Invalid patient id")];
};
