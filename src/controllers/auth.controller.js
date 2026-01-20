import ApiResponse from "../utils/api-response.js";
import ApiError from "../utils/api-error.js";
import asyncHandler from "../utils/async-handler.js";
import User from "../models/user.models.js";
import { Query } from "mongoose";
import { emailVerificationEmailContent, sendEmail } from "../utils/mail.js";

const generateAccessAndRefreshToken = async (user) => {
  try {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      `Something went wrong while generating Access/Refresh Token , ${error}`,
    );
  }
};
const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email,username already exsist", []);
  }

  const user = new User({
    email,
    password,
    username,
    isEmailVerified: false,
  });

  const { unhashedToken, hashedToken, tokenExpiry } =
    await user.generateTemporaryToken();
  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await generateAccessAndRefreshToken(user);

  await sendEmail({
    email: user.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationEmailContent(
      user.username,
      `${req.protocol}://${req.host}/api/v1/users/verify-email/${unhashedToken}`,
    ),
  });

  await user.save();
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry -forgotPasswordToken -forgotPasswordExpiry",
  );

  if (!createdUser)
    throw new ApiError(
      "500",
      "Something went wrong while registering the user",
    );
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: createdUser },
        "User Registered Successfully and verification email sent",
      ),
    );
});

export { registerUser };
