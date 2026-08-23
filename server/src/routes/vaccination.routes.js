import { Router } from "express";
import { validate } from "../middlewares/validator.middleware.js";
import { requirePasswordChange } from "../middlewares/password.middleware.js";
import { requirePHC, verifyJWT } from "../middlewares/auth.middleware.js";
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

router.route("/stats").get(verifyJWT, requirePasswordChange, validate, getVaccinationStats);

router
  .route("/overdue")
  .get(
    verifyJWT,
    requirePasswordChange,
    getOverdueVaccinationsValidator(),
    validate,
    getOverdueVaccinations,
  );

router
  .route("/:patientId")
  .post(verifyJWT, requirePasswordChange, createVaccinationValidator(), validate, createVaccination)
  .get(verifyJWT, requirePasswordChange, getAllVaccinationsValidator(), validate, getAllVaccinations);

router
  .route("/:patientId/:vaccinationId")
  .get(verifyJWT, requirePasswordChange, getVaccinationByIdValidator(), validate, getVaccinationById)
  .put(verifyJWT, requirePasswordChange, updateVaccinationValidator(), validate, updateVaccination)
  .delete(
    verifyJWT,
    requirePasswordChange,
    requirePHC,
    deleteVaccinationValidator(),
    validate,
    deleteVaccination,
  );

export default router;
