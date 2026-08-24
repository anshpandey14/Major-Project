import { Router } from "express";
import { verifyJWT, requireClinicalUser } from "../middlewares/auth.middleware.js";
import { requirePasswordChange } from "../middlewares/password.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import { syncOperations } from "../controllers/sync.controllers.js";
import { syncValidator } from "../validators/sync.validators.js";

const router = Router();

router.route("/").post(verifyJWT, requireClinicalUser, requirePasswordChange, syncValidator(), validate, syncOperations);

export default router;
