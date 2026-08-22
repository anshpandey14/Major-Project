import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
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

const router = Router();

router
  .route("/")
  .post(verifyJWT, createPatientValidator(), validate, createPatient)
  .get(verifyJWT, getAllPatientsValidator(), validate, getAllPatients);
router.route("/stats").get(verifyJWT, getStats);
router
  .route("/:patientId/timeline")
  .get(verifyJWT, getTimelineValidator(), validate, getTimeline);
router
  .route("/:patientId")
  .get(verifyJWT, getPatientByIdValidator(), validate, getPatientById)
  .patch(verifyJWT, updatePatientValidator(), validate, updatePatient)
  .delete(verifyJWT, deletePatientValidator(), validate, deletePatient);

export default router;
