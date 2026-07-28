import { body } from "express-validator";
import {
  dateValidator,
  mongoIdValidator,
  numberValidator,
  paginationValidator,
} from "../validators/common.validators.js";
import {
  AvailableVaccinationStatus,
  AvailableVaccines,
} from "../utils/constants.js";
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

export const getAllVaccinationsValidator = () => [
  mongoIdValidator("patientId"),
  ...paginationValidator(),
];

export const getVaccinationByIdValidator = () => [
  mongoIdValidator("patientId"),
  mongoIdValidator("vaccinationId"),
];

export const updateVaccinationValidator = () => [
  mongoIdValidator("patientId"),
  mongoIdValidator("vaccinationId"),

  body("vaccine")
    .optional()
    .isIn(AvailableVaccines)
    .withMessage("Invalid vaccine"),

  body("customVaccine")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Custom vaccine name cannot exceed 100 characters"),

  numberValidator("doseNumber", 0, 10, ""),

  dateValidator("vaccinationDate"),

  dateValidator("nextDueDate"),

  body("status")
    .optional()
    .isIn(AvailableVaccinationStatus)
    .withMessage("Invalid vaccination status"),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Notes cannot excedd 1000 characters"),

  body().custom((value) => {
    const hasVaccine = !!value.vaccine;
    const hasCustom = !!value.customVaccine?.trim();

    if (hasVaccine && hasCustom) {
      throw new Error("Provide either vaccine or customVaccine, not both");
    }
    return true;
  }),
];

export const deleteVaccinationValidator = () => [
  mongoIdValidator("patientId"),
  mongoIdValidator("vaccinationId"),
];
