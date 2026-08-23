import { Router } from "express";
import { validate } from "../middlewares/validator.middleware.js";
import { requirePasswordChange } from "../middlewares/password.middleware.js";
import { requirePHC, verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createVisitValidator,
  deleteVisitValidator,
  getAllVisitsValidators,
  getVisitByIdValidator,
  updateVisitValidator,
} from "../validators/visit.validators.js";
import {
  createVisit,
  getAllVisits,
  getVisitById,
  updateVisit,
  deleteVisit,
} from "../controllers/visit.controllers.js";

const router = Router();

router
  .route("/:patientId")
  .post(verifyJWT, requirePasswordChange, createVisitValidator(), validate, createVisit)
  .get(verifyJWT, requirePasswordChange, getAllVisitsValidators(), validate, getAllVisits);
router
  .route("/:patientId/:visitId")
  .get(verifyJWT, requirePasswordChange, getVisitByIdValidator(), validate, getVisitById)
  .put(verifyJWT, requirePasswordChange, updateVisitValidator(), validate, updateVisit)
  .delete(verifyJWT, requirePasswordChange, requirePHC, deleteVisitValidator(), validate, deleteVisit);

export default router;
