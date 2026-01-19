import ApiResponse from "../utils/api-response.js";
import asyncHandler from "../utils/async-handler.js";
// const healCheck = (req, res) => {
//   try {
//     res
//       .status(200)
//       .json(new ApiResponse(200, { message: "Server is Running" }));
//   } catch (error) {}
// };

const healthCheck = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, { message: "Server is Running" }));
});

// From Express5 one more way to pass error to express Starting with Express 5, route handlers and middleware that return a Promise will call next(value) automatically when they reject or throw an error

// const healthCheck = async (req, res, next) => {
//   res.status(200).json(new ApiResponse(200, { message: "Server is Running" }));
// };
export { healthCheck };
