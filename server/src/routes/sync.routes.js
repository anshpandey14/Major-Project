import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import { syncOperations } from "../controllers/sync.controllers.js";
import { syncValidator } from "../validators/sync.validators.js";
import { UserRolesEnum } from "../utils/constants.js";

const router = Router();

router.route("/").post(verifyJWT, syncValidator(), validate, syncOperations);

export const router;
