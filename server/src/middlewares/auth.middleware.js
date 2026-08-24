import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import jwt from "jsonwebtoken";
import { UserRolesEnum } from "../utils/constants.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired access token");
  }
  const user = await User.findById(decodedToken?._id).select(
    "-password -refreshToken",
  );

  if (!user) {
    throw new ApiError(401, "Invalid access Token");
  }
  if (!user.isActive) {
    throw new ApiError(403, "Account deactivated");
  }

  req.user = user;
  next();
});

export const requirePHC = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }
  if (req.user.role !== UserRolesEnum.PHC) {
    throw new ApiError(403, "Only PHC staff can perform this action");
  }
  next();
});


export const requireITAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) throw new ApiError(401, "Unauthorized");
  if (req.user.role !== UserRolesEnum.IT_ADMIN) {
    throw new ApiError(403, "Only IT administrators can perform this action");
  }
  next();
});

export const requireClinicalUser = asyncHandler(async (req, res, next) => {
  if (!req.user) throw new ApiError(401, "Unauthorized");
  if (![UserRolesEnum.ASHA, UserRolesEnum.PHC].includes(req.user.role)) {
    throw new ApiError(403, "Clinical access is restricted to ASHA and PHC users");
  }
  next();
});


export const requirePHCOrITAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) throw new ApiError(401, "Unauthorized");
  if (![UserRolesEnum.PHC, UserRolesEnum.IT_ADMIN].includes(req.user.role)) {
    throw new ApiError(403, "Only PHC or IT administrators can perform this action");
  }
  next();
});
