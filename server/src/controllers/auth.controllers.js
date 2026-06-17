import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import jwt from "jsonwebtoken";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating accessToken",
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, password, fullName, village } = req.body;

  if (!fullName || !email || !password)
    return res
      .status(400)
      .json({ message: "name, email and password are required" });

  const existedUser = await User.findOne({
    $or: [{ email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const user = await User.create({
    fullName,
    email,
    password,
    role: "asha",
    village,
    isProfileComplete: false,
    mustChangePassword: true,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering a user");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { user: createdUser },
        "ASHA account created successfully",
      ),
    );
});

const login = asyncHandler(async (req, res) => {
  console.log("login started");

  const { email, username, password } = req.body;

  console.log(email, password);

  if (!email && !username) {
    throw new ApiError(400, "Email or username is required");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const user = await User.findOne({ $or: [{ email }, { username }] });

  if (!user) {
    throw new ApiError(400, "User does not exists");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid credentials");
  }

  if (!user.isActive)
    throw new ApiError(403, "Account deactivated. Contact PHC admin.");

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options) // only refresh token in cookie
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken, // access token in response body
        },
        "User logged in successfully",
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    },
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized access");
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
  } catch (error) {
    throw new ApiError(401, "Refresh token expired or invalid");
  }

  const user = await User.findById(decodedToken._id);

  if (!user) {
    throw new ApiError(401, "Invalid refresh token");
  }

  if (incomingRefreshToken !== user.refreshToken) {
    throw new ApiError(401, "Refresh token is expired or reused");
  }

  const { accessToken, refreshToken: newRefreshToken } =
    await generateAccessAndRefreshToken(user._id);

  user.refreshToken = newRefreshToken;
  await user.save();

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(new ApiResponse(200, { userId: user._id }, "Access token refreshed"));
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  const user = await User.findById(req.user?._id);

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid old password");
  }

  user.mustChangePassword = false;
  user.password = newPassword;
  user.refreshToken = null;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed Successfully"));
});

const uploadAvatar = asyncHandler(async (req, res) => {
  const localFilePath = req.file?.path;

  if (!localFilePath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(localFilePath);

  if (!avatar) {
    throw new ApiError(500, "Error while uploading avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: {
          url: avatar.secure_url,
          publicId: avatar.public_id,
        },
      },
    },
    { new: true },
  ).select("-password -refreshToken");

  if (req.user?.avatar?.publicId) {
    await deleteFromCloudinary(req.user.avatar.publicId);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Avatar uploaded successfully"));
});

const completeProfile = asyncHandler(async (req, res) => {
  const { username, phone } = req.body;

  if (!username || !phone) {
    throw new ApiError(400, "Username and phone are required");
  }

  const existingUser = await User.findOne({
    username,
    _id: { $ne: req.user._id }, // exclude current user
  });

  if (existingUser) {
    throw new ApiError(409, "Username already taken");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        username = username.toLowerCase(),
        phone,
        isProfileComplete: true,
      },
    },
    { new: true },
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Profile completed successfully"));
});

export {
  registerUser,
  login,
  logoutUser,
  getCurrentUser,
  refreshAccessToken,
  changePassword,
  uploadAvatar,
  completeProfile
};
