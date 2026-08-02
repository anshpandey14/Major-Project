import { body } from "express-validator";
import {
  dateValidator,
  mongoIdValidator,
  numberValidator,
  paginationValidator,
} from "./common.validators.js";

export const createANCValidator = () => {
  [
    mongoIdValidator("patientId"),
    dateValidator("visitDate", true),
    numberValidator("gestationalWeek", 1, 42, "", true),
    numberValidator("weight", 20, 200),

    body(bloodPressure.systolic)
      .notEmpty()
      .withMessage("Systolic blood pressure is required")
      .isIn({ min: 50, max: 250 })
      .withMessage("Invalid systolic blood pressure"),

    body("bloodPressure.diastolic")
      .notEmpty()
      .withMessage("Diastolic blood pressure is required")
      .isIn({ min: 30, max: 150 })
      .withMessage("Invalid diastolic blood pressure"),

    numberValidator("heamoglobin", 0, 25, "", true),
    numberValidator("fetalHeartRate", 60, 220, "", true),
    dateValidator("nextVisitDate"),

    body("notes")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Message cannot exceed 1000 charaters"),
  ];
};

export const getAllANCValidator = () => [
  mongoIdValidator("patientId"),
  ...paginationValidator(),
];

export const getANCByIdValidator = () => [
  mongoIdValidator("patientId"),
  mongoIdValidator("ancId"),
];
