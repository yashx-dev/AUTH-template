import { validationResult } from "express-validator";
const sendError = (res, statusCode, message, error = null) => {
  console.error(`${message}:`, error || "");

  res.status(statusCode).json({
    success: false,
    message,
    ...(error && { error: error.message }),
  });
};
const validationError = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendError(res, 400, "Validation error", { message: errors.array() });
    return true;
  }
  return false;
};

const serverError = (res, error, customMessage = "Server Error") => {
  res.status(500).json({
    success: false,
    message: customMessage,
    ...(process.env.NODE_ENV === "development" && { error: error.message }),
  });
};

export { sendError, validationError, serverError };
