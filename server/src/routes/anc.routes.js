import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  createANCValidator,
  getAllANCValidator,
  getANCByIdValidator,
  updateANCValidator,
} from "../validators/anc.validators.js";
import {
  createAnc,
  getAllANC,
  getANCById,
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
  .put(verifyJWT, updateANCValidator(), validate, updateANC);

export default router;
