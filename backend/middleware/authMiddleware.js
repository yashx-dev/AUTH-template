import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { sendError } from "../utils/sendError.js";

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headeres.authorization.startsWith("bearer")
  ) {
    try {
      token = req.headeres.authorization.split(" ")[1];
      console.log("Token found in header");
    } catch (error) {
      console.log("Error while extracting token from header", error);
    }
  }
  if (!token && req.cookies && req.cookies.token) {
    try {
      token = req.cookies.token;
      console.log("TOken found in cookies");
    } catch (error) {
      console.log("Error while extracting token from cookies", error);
    }
  }
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token is verified for user ID:", decoded.userId);
    req.user = await User.findById(decoded.userId).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }
    next();
  } catch (error) {
    console.error("Token verfication failed:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired, please login again",
      });
    }

    res.status(401).json({
      success: false,
      message: "Not authorized, Token failed",
    });
  }
};

export default protect