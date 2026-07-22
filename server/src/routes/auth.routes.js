import { Router } from "express";
import {
  registerUser,
  login,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  changePassword,
  uploadAvatar,
  completeProfile,
} from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  userRegisterValidator,
  userLoginValidator,
  userChangeCurrentPasswordValidator,
  completeProfileValidator,
} from "../validators/user.validators.js";
import { verifyJWT, requirePHC } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// unsecured routes
router.route("/login").post(userLoginValidator(), validate, login);
router.route("/refresh-token").post(refreshAccessToken);

//secure routes
router
  .route("/register")
  .post(verifyJWT, requirePHC, userRegisterValidator(), validate, registerUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router
  .route("/change-password")
  .post(
    verifyJWT,
    userChangeCurrentPasswordValidator(),
    validate,
    changePassword,
  );
router
  .route("/upload-avatar")
  .put(verifyJWT, upload.single("avatar"), uploadAvatar);
router
  .route("/complete-profile")
  .put(verifyJWT, completeProfileValidator(), validate, completeProfile);

export default router;
