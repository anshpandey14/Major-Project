import { Router } from "express";
import { requirePHC, verifyJWT } from "../middlewares/auth.middleware.js";
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

router.route("/stats").get(verifyJWT, requirePasswordChange, validate, getANCStats);

router
  .route("/high-risk")
  .get(verifyJWT, requirePasswordChange, getHighRiskANCValidator(), validate, getHighRiskANC);

router
  .route("/:patientId")
  .post(verifyJWT, requirePasswordChange, createANCValidator(), validate, createAnc)
  .get(verifyJWT, requirePasswordChange, getAllANCValidator(), validate, getAllANC);

router
  .route("/:patientId/:ancId")
  .get(verifyJWT, requirePasswordChange, getANCByIdValidator(), validate, getANCById)
  .put(verifyJWT, requirePasswordChange, updateANCValidator(), validate, updateANC)
  .delete(verifyJWT, requirePasswordChange, requirePHC, deleteANCValidator(), validate, deleteANC);

export default router;
