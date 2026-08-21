import { body } from "express-validator";

export const generateSummaryValidator = () => {
  return [
    body("patientId")
      .trim()
      .notEmpty()
      .withMessage("Patient Id is required")
      .isMongoId()
      .withMessage("Invalid patient ID"),
  ];
};

export const generateRiskValidator = () => {
    return [
      body("patientId")
        .trim()
        .notEmpty()
        .withMessage("Patient Id is required")
        .isMongoId()
        .withMessage("Invalid patient ID"),
    ];
}