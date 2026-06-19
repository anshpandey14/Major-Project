import { body } from "express-validator";
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
