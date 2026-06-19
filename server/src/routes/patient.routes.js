import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createPatient } from "../controllers/patient.controllers.js";
import { createPatientValidator } from "../validators/patient.validators.js";
import { validate } from "../middlewares/validator.middleware.js";

const router = Router();

router
  .route("/patients")
  .post(verifyJWT, createPatientValidator(), validate, createPatient);

export default Router;
