import ApiError from "../utils/api-error.js";
import User from "../models/user.models.js";
import asyncHandler from "../utils/async-handler.js";
import jwt from "jsonwebtoken";

export const verifyJwt = async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    throw new ApiError(401, "Unauthorized Request");
  }

  try {
    const decoded_token = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, {
      ignoreExpiration: true,
    });

    if (decoded_token.exp * 1000 < Date.now()) {
      throw new ApiError(401, "AccessToken got expired");
    }
    const user = await User.findById(decoded_token?._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry -forgotPasswordToken -forgotPasswordExpiry",
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid Access token");
  }
};
