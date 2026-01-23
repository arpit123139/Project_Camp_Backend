import { validationResult } from "express-validator";
import ApiError from "../utils/api-error.js";

export const validate = (req, res, next) => {
  const erros = validationResult(req);
  if (erros.isEmpty()) {
    return next();
  }
  const extractedErrors = [];

  erros.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));
  console.error(extractedErrors);

  throw new ApiError(422, "Recieved Data is not valid", extractedErrors);
};
