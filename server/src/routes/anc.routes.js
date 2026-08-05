import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  createANCValidator,
  deleteANCValidator,
  getAllANCValidator,
  getANCByIdValidator,
  updateANCValidator,
} from "../validators/anc.validators.js";
import {
  createAnc,
  deleteANC,
  getAllANC,
  getANCById,
  getANCStats,
  updateANC,
} from "../controllers/anc.controllers.js";

const router = Router();

router
  .route("/patientId")
  .post(verifyJWT, createANCValidator(), validate, createAnc)
  .get(verifyJWT, getAllANCValidator(), validate, getAllANC);

router
  .route("/:patientId/:ancId")
  .get(verifyJWT, getANCByIdValidator(), validate, getANCById)
  .put(verifyJWT, updateANCValidator(), validate, updateANC)
  .delete(verifyJWT, deleteANCValidator(), validate, deleteANC);

router.route("/stats").get(verifyJWT, validate, getANCStats);

export default router;
