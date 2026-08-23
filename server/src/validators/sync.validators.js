import { body } from "express-validator";
import { AvailableSyncOperations } from "../utils/constants.js";

export const syncValidator = () => {
  return [
    body("operations")
      .isArray({ min: 1, max: 100 })
      .withMessage("Operations must be a non-empty array"),

    body("operations.*.id")
      .isString()
      .withMessage("Operation id must be a string")
      .trim()
      .notEmpty()
      .withMessage("Operation id is required")
      .isLength({ max: 100 })
      .withMessage("Operation id is too long"),

    body("operations.*.operation")
      .isString()
      .withMessage("Operation must be a string")
      .trim()
      .notEmpty()
      .withMessage("Operation is required")
      .isIn(AvailableSyncOperations)
      .withMessage("Invalid sync operation"),

    body("operations.*.payload")
      .isObject()
      .withMessage("Payload must be an object"),

    body("operations.*.timestamp")
      .notEmpty()
      .withMessage("Timestamp is required")
      .custom((value) => {
        const date = new Date(value);

        if (isNaN(date.getTime())) {
          throw new Error("Invalid timestamp");
        }

        return true;
      }),
  ];
};
