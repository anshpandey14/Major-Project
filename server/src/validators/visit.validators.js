import { body } from "express-validator";
import { AvailableVisitSymptoms } from "../utils/constants.js";
import {
  mongoIdValidator,
  dateValidator,
  numberValidator,
  paginationValidator,
} from "../validators/common.validators.js";

export const createVisitValidator = () => [
  mongoIdValidator("patientId"),
  dateValidator("visitDate", true),
  numberValidator("weight", 0, 300, "kg"),

  body("symptoms")
    .optional()
    .isArray()
    .withMessage("Symptoms must be an array"),

  body("symptoms.*")
    .optional()
    .isIn(AvailableVisitSymptoms)
    .withMessage("Invalid symptom"),

  body("additionalSymptoms")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Additional symptoms cannot exceed 500 characters"),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Notes cannot exceed 1000 characters"),

  dateValidator("followUpDate"),
];

export const getAllVisitsValidators = () => [
  mongoIdValidator("patientId"),
  ...paginationValidator(),
];

export const getVisitByIdValidator = () => [
  mongoIdValidator("patientId"),
  mongoIdValidator("visitId"),
];

export const updateVisitValidator = () => {
  mongoIdValidator("patientId");
  mongoIdValidator("visitId");

  dateValidator("visitDate");
  numberValidator("weight", 0, 300, "kg");

  body("symptoms")
    .optional()
    .isArray()
    .withMessage("Symptoms must be an array");

  body("symptoms.*")
    .optional()
    .isIn(AvailableVisitSymptoms)
    .withMessage("Invalid symptom");

  body("additionalSymptoms")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Additional symptoms cannot exceed 500 characters");

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Notes cannot exceed 1000 characters");

  dateValidator("followUpDate");
};
