import { Router } from "express";
import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createVisitValidator } from "../validators/visit.validators.js";
import { createVisit } from "../controllers/visit.controllers.js";

const router = Router();

router
  .route("/:patientId")
  .post(verifyJWT, createVisitValidator(), validate, createVisit);

export default router;
