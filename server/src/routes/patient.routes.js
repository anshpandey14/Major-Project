import { Router } from "express";
import { requirePHC, verifyJWT, requireClinicalUser } from "../middlewares/auth.middleware.js";
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
  .post(verifyJWT, requireClinicalUser, requirePasswordChange, createPatientValidator(), validate, createPatient)
  .get(verifyJWT, requireClinicalUser, requirePasswordChange, getAllPatientsValidator(), validate, getAllPatients);
router.route("/stats").get(verifyJWT, requireClinicalUser, requirePasswordChange, getStats);
router
  .route("/:patientId/timeline")
  .get(verifyJWT, requireClinicalUser, requirePasswordChange, getTimelineValidator(), validate, getTimeline);
router
  .route("/:patientId")
  .get(verifyJWT, requireClinicalUser, requirePasswordChange, getPatientByIdValidator(), validate, getPatientById)
  .patch(verifyJWT, requireClinicalUser, requirePasswordChange, updatePatientValidator(), validate, updatePatient)
  .delete(
    verifyJWT,
    requireClinicalUser,
    requirePasswordChange,
    requirePHC,
    deletePatientValidator(),
    validate,
    deletePatient,
  );

export default router;
