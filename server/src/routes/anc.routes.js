import { Router } from "express";
import { requirePHC, verifyJWT, requireClinicalUser } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import { requirePasswordChange } from "../middlewares/password.middleware.js";
import {
  createANCValidator,
  deleteANCValidator,
  getAllANCValidator,
  getANCByIdValidator,
  getHighRiskANCValidator,
  updateANCValidator,
} from "../validators/anc.validators.js";
import {
  createAnc,
  deleteANC,
  getAllANC,
  getANCById,
  getANCStats,
  getHighRiskANC,
  updateANC,
} from "../controllers/anc.controllers.js";

const router = Router();

router.route("/stats").get(verifyJWT, requireClinicalUser, requirePasswordChange, validate, getANCStats);

router
  .route("/high-risk")
  .get(verifyJWT, requireClinicalUser, requirePasswordChange, getHighRiskANCValidator(), validate, getHighRiskANC);

router
  .route("/:patientId")
  .post(verifyJWT, requireClinicalUser, requirePasswordChange, createANCValidator(), validate, createAnc)
  .get(verifyJWT, requireClinicalUser, requirePasswordChange, getAllANCValidator(), validate, getAllANC);

router
  .route("/:patientId/:ancId")
  .get(verifyJWT, requireClinicalUser, requirePasswordChange, getANCByIdValidator(), validate, getANCById)
  .put(verifyJWT, requireClinicalUser, requirePasswordChange, updateANCValidator(), validate, updateANC)
  .delete(verifyJWT, requireClinicalUser, requirePasswordChange, requirePHC, deleteANCValidator(), validate, deleteANC);

export default router;
