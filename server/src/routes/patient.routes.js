import { Router } from "express";
import { requirePHC, verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createPatient,
  deletePatient,
  getAllPatients,
  getPatientById,
  getStats,
  updatePatient,
  getTimeline,
} from "../controllers/patient.controllers.js";
import {
  createPatientValidator,
  deletePatientValidator,
  getAllPatientsValidator,
  getPatientByIdValidator,
  getTimelineValidator,
  updatePatientValidator,
} from "../validators/patient.validators.js";
import { validate } from "../middlewares/validator.middleware.js";
import { requirePasswordChange } from "../middlewares/password.middleware.js";

const router = Router();

router
  .route("/")
  .post(verifyJWT, requirePasswordChange, createPatientValidator(), validate, createPatient)
  .get(verifyJWT, requirePasswordChange, getAllPatientsValidator(), validate, getAllPatients);
router.route("/stats").get(verifyJWT, requirePasswordChange, getStats);
router
  .route("/:patientId/timeline")
  .get(verifyJWT, requirePasswordChange, getTimelineValidator(), validate, getTimeline);
router
  .route("/:patientId")
  .get(verifyJWT, requirePasswordChange, getPatientByIdValidator(), validate, getPatientById)
  .patch(verifyJWT, requirePasswordChange, updatePatientValidator(), validate, updatePatient)
  .delete(
    verifyJWT,
    requirePasswordChange,
    requirePHC,
    deletePatientValidator(),
    validate,
    deletePatient,
  );

export default router;
