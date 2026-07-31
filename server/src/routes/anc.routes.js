import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import { createANCValidator } from "../validators/anc.validators.js";
import { createAnc } from "../controllers/anc.controllers.js";

const router = Router();

router
  .route("/patientId")
  .post(verifyJWT, createANCValidator(), validate, createAnc);

export default router;
