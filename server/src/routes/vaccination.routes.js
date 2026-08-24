import { Router } from "express";
import { validate } from "../middlewares/validator.middleware.js";
import { requirePasswordChange } from "../middlewares/password.middleware.js";
import { requirePHC, verifyJWT, requireClinicalUser } from "../middlewares/auth.middleware.js";
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

router.route("/stats").get(verifyJWT, requireClinicalUser, requirePasswordChange, validate, getVaccinationStats);

router
  .route("/overdue")
  .get(
    verifyJWT,
    requireClinicalUser,
    requirePasswordChange,
    getOverdueVaccinationsValidator(),
    validate,
    getOverdueVaccinations,
  );

router
  .route("/:patientId")
  .post(verifyJWT, requireClinicalUser, requirePasswordChange, createVaccinationValidator(), validate, createVaccination)
  .get(verifyJWT, requireClinicalUser, requirePasswordChange, getAllVaccinationsValidator(), validate, getAllVaccinations);

router
  .route("/:patientId/:vaccinationId")
  .get(verifyJWT, requireClinicalUser, requirePasswordChange, getVaccinationByIdValidator(), validate, getVaccinationById)
  .put(verifyJWT, requireClinicalUser, requirePasswordChange, updateVaccinationValidator(), validate, updateVaccination)
  .delete(
    verifyJWT,
    requireClinicalUser,
    requirePasswordChange,
    requirePHC,
    deleteVaccinationValidator(),
    validate,
    deleteVaccination,
  );

export default router;
