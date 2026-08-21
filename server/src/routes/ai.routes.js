import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
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
  .post(verifyJWT, generateSummaryValidator(), validate, generateSummary);

router
  .route("/risk")
  .post(verifyJWT, generateRiskValidator(), validate, generateRiskAssessment);

export default router;
