import { ApiError } from "../utils/api-error.js";

export const requirePasswordChange = (req, res, next) => {
  if (!req.user?.mustChangePassword) {
    return next();
  }

  throw new ApiError(403, "You must change your password before continuing");
};
