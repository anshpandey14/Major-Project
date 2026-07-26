import { Router } from "express";
import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createVaccination,
  getAllVaccinations,
  getVaccinationById,
} from "../controllers/vaccination.controllers.js";
import {
  createVaccinationValidator,
  getAllVaccinationsValidator,
  getVaccinationByIdValidator,
} from "../validators/vaccination.validators.js";

const router = Router();

router
  .route("/:patientId")
  .post(verifyJWT, createVaccinationValidator(), validate, createVaccination)
  .get(verifyJWT, getAllVaccinationsValidator(), validate, getAllVaccinations);

router
  .route(":/patientId:/vaccinationId")
  .get(verifyJWT, getVaccinationByIdValidator(), validate, getVaccinationById);

export default router;
