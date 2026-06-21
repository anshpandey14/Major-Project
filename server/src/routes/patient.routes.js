import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createPatient,
  getAllPatients,
} from "../controllers/patient.controllers.js";
import {
  createPatientValidator,
  getAllPatientsValidator,
} from "../validators/patient.validators.js";
import { validate } from "../middlewares/validator.middleware.js";

const router = Router();

router
  .route("/patients")
  .post(verifyJWT, createPatientValidator(), validate, createPatient);
router
  .route("/patients")
  .get(verifyJWT, getAllPatientsValidator(), validate, getAllPatients);
export default Router;
