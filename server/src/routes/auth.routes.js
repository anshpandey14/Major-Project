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
  resetUserPassword,
  registerPHC,
} from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  userRegisterValidator,
  userLoginValidator,
  userChangeCurrentPasswordValidator,
  completeProfileValidator,
  resetUserPasswordValidator,
} from "../validators/user.validators.js";
import { verifyJWT, requirePHC, requireITAdmin, requirePHCOrITAdmin } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// ==================== PUBLIC ====================

router.route("/login").post(userLoginValidator(), validate, login);
router.route("/refresh-token").post(refreshAccessToken);

router
  .route("/register-phc")
  .post(verifyJWT, requireITAdmin, userRegisterValidator(), validate, registerPHC);

// ==================== AUTHENTICATED ====================

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

// ==================== PHC ONLY ====================

router
  .route("/reset-password")
  .post(
    verifyJWT,
    requirePHCOrITAdmin,
    resetUserPasswordValidator(),
    validate,
    resetUserPassword,
  );

export default router;
