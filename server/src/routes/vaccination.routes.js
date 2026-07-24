import { Router } from "express";
import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createVaccination } from "../controllers/vaccination.controllers.js";
import { createVaccinationValidator } from "../validators/vaccination.validators.js";

const router = Router();

router
  .route("/:patientId")
  .post(verifyJWT, createVaccinationValidator(), validate, createVaccination);

export default router;
