import { Router } from "express";
import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createVisitValidator,
  getAllVisitsValidators,
} from "../validators/visit.validators.js";
import { createVisit, getAllVisits } from "../controllers/visit.controllers.js";

const router = Router();

router
  .route("/:patientId")
  .post(verifyJWT, createVisitValidator(), validate, createVisit)
  .get(verifyJWT, getAllVisitsValidators(), validate, getAllVisits);

export default router;
