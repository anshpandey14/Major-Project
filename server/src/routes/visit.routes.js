import { Router } from "express";
import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
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
  .post(verifyJWT, createVisitValidator(), validate, createVisit)
  .get(verifyJWT, getAllVisitsValidators(), validate, getAllVisits);
router
  .route("/:patientId/:visitId")
  .get(verifyJWT, getVisitByIdValidator(), validate, getVisitById)
  .put(verifyJWT, updateVisitValidator(), validate, updateVisit)
  .delete(verifyJWT, deleteVisitValidator(), validate, deleteVisit);

export default router;
