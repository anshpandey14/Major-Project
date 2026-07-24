import { body } from "express-validator";
import {
  dateValidator,
  mongoIdValidator,
  numberValidator,
} from "../validators/common.validators.js";
import { AvailableVaccines } from "../utils/constants.js";
import { ApiError } from "../utils/api-error.js";

export const createVaccinationValidator = () => [
  mongoIdValidator("patientId"),

  body.custom((value) => {
    if (!value.vaccine && !value.customVaccine?.trim()) {
      throw new Error("Either vaccine or customVaccine is required");
    }
    return true;
  }),

  body("vaccine")
    .optional()
    .isIn(AvailableVaccines)
    .withMessage("Invalid vaccine"),

  body("customVaccine")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Custom vaccine name cannot excedd 100 characters"),

  numberValidator(
    "doseNumber",
    0,
    10,
    "",
    dateValidator("vaccinationDate", true),
    dateValidator("nextDueDate"),
    body("notes")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Notes cannot excedd 1000 characters"),
  ),
];
