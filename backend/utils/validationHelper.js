import { validationResult } from "express-validator";
const validationRequest = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
     res.status(400).json({
      success: false,
      errors: errors.array(),
    });
    return false;
  }
  return true;
};

export default validationRequest