import { Router } from "express";
import { verifyJWT, requireClinicalUser } from "../middlewares/auth.middleware.js";
import { requirePasswordChange } from "../middlewares/password.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  generateRiskAssessment,
  generateSummary,
} from "../controllers/ai.controller.js";
import {
  generateRiskValidator,
  generateSummaryValidator,
} from "../validators/ai.validator.js";

const router = Router();

router
  .route("/summary")
  .post(verifyJWT, requireClinicalUser, requirePasswordChange, generateSummaryValidator(), validate, generateSummary);

router
  .route("/risk")
  .post(verifyJWT, requireClinicalUser, requirePasswordChange, generateRiskValidator(), validate, generateRiskAssessment);

export default router;
