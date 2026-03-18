import ApiError from "../utils/api-error.js";
import User from "../models/user.models.js";
import asyncHandler from "../utils/async-handler.js";
import jwt from "jsonwebtoken";
import { ProjectMember } from "../models/projectmember.models.js";
import mongoose from "mongoose";

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

export const validateProjectPermission = (roles = []) => {
  return async (req, res, next) => {
    const { projectId } = req.params;

    if (!projectId) throw new ApiError(400, "ProjectId is missing");

    const project = await ProjectMember.findOne({
      project: new mongoose.Types.ObjectId(projectId),
      user: new mongoose.Types.ObjectId(req.user._id),
    });

    if (!project)
      throw new ApiError(
        400,
        "Project is missing or the User is not Associated to the Project and not Authorized to perform any opetaion on the Project ",
      );

    const givenRole = project.role;

    if (!roles.includes(givenRole))
      throw new ApiError(
        403,
        "User is not authorized to perform the Operation",
      );

    next();
  };
};
