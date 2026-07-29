import { Router } from "express";
import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createVaccination,
  deleteVaccination,
  getAllVaccinations,
  getOverdueVaccinations,
  getVaccinationById,
  getVaccinationStats,
  updateVaccination,
} from "../controllers/vaccination.controllers.js";
import {
  createVaccinationValidator,
  deleteVaccinationValidator,
  getAllVaccinationsValidator,
  getOverdueVaccinationsValidator,
  getVaccinationByIdValidator,
  updateVaccinationValidator,
} from "../validators/vaccination.validators.js";

const router = Router();

router
  .route("/:patientId")
  .post(verifyJWT, createVaccinationValidator(), validate, createVaccination)
  .get(verifyJWT, getAllVaccinationsValidator(), validate, getAllVaccinations);

router
  .route(":/patientId:/vaccinationId")
  .get(verifyJWT, getVaccinationByIdValidator(), validate, getVaccinationById)
  .put(verifyJWT, updateVaccinationValidator(), validate, updateVaccination)
  .delete(verifyJWT, deleteVaccinationValidator(), validate, deleteVaccination);

router.route("/stats").get(verifyJWT, validate, getVaccinationStats);

router
  .route("/overdue")
  .get(
    verifyJWT,
    getOverdueVaccinationsValidator(),
    validate,
    getOverdueVaccinations,
  );

export default router;
