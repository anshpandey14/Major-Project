import { Router } from "express";
import { validate } from "../middlewares/validator.middleware.js";
import { requirePasswordChange } from "../middlewares/password.middleware.js";
import { requirePHC, verifyJWT, requireClinicalUser } from "../middlewares/auth.middleware.js";
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
  .post(verifyJWT, requireClinicalUser, requirePasswordChange, createVisitValidator(), validate, createVisit)
  .get(verifyJWT, requireClinicalUser, requirePasswordChange, getAllVisitsValidators(), validate, getAllVisits);
router
  .route("/:patientId/:visitId")
  .get(verifyJWT, requireClinicalUser, requirePasswordChange, getVisitByIdValidator(), validate, getVisitById)
  .put(verifyJWT, requireClinicalUser, requirePasswordChange, updateVisitValidator(), validate, updateVisit)
  .delete(verifyJWT, requireClinicalUser, requirePasswordChange, requirePHC, deleteVisitValidator(), validate, deleteVisit);

export default router;
