import { Router } from "express";
import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createVisitValidator,
  getAllVisitsValidators,
  getVisitByIdValidator,
} from "../validators/visit.validators.js";
import {
  createVisit,
  getAllVisits,
  getVisitById,
} from "../controllers/visit.controllers.js";

const router = Router();

router
  .route("/:patientId")
  .post(verifyJWT, createVisitValidator(), validate, createVisit)
  .get(verifyJWT, getAllVisitsValidators(), validate, getAllVisits);
router
  .route("/:patientId/:visitId")
  .get(verifyJWT, getVisitByIdValidator(), validate, getVisitById);

export default router;
