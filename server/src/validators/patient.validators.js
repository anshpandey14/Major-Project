import { body } from "express-validator";
import {
  AvailableBloodGroups,
  AvailablePatientGender,
} from "../utils/constants.js";

import {
  fullNameValidator,
  phoneValidator,
  mongoIdValidator,
  paginationValidator,
  dateValidator,
  numberValidator,
  enumValidator,
} from "./common.validators.js";

export const createPatientValidator = () => [
  fullNameValidator(),

  phoneValidator(),

  body("village").trim().notEmpty().withMessage("Village is required"),

  enumValidator("gender", AvailablePatientGender, true),

  dateValidator("dob", true),

  numberValidator("weight", 0, 300, "kg"),

  numberValidator("height", 0, 300, "cm"),

  enumValidator("bloodGroup", AvailableBloodGroups),

  body("isPregnant")
    .optional()
    .isBoolean()
    .withMessage("isPregnant must be true or false"),

  dateValidator("lmpDate"),
];

export const updatePatientValidator = () => [
  mongoIdValidator("patientId"),

  fullNameValidator(false),

  phoneValidator(false),

  body("village")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Village cannot be empty"),

  enumValidator("gender", AvailablePatientGender),

  dateValidator("dob"),

  numberValidator("weight", 0, 300, "kg"),

  numberValidator("height", 0, 300, "cm"),

  enumValidator("bloodGroup", AvailableBloodGroups),

  body("isPregnant")
    .optional()
    .isBoolean()
    .withMessage("isPregnant must be true or false"),

  dateValidator("lmpDate"),
];

export const getPatientByIdValidator = () => [mongoIdValidator("patientId")];

export const deletePatientValidator = () => [mongoIdValidator("patientId")];

export const getAllPatientsValidator = paginationValidator;
