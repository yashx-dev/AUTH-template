import express from "express";
import { body } from "express-validator";
import protect from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import {
  sendError,
  serverError,
} from "../utils/errorHandler.js";
import { sendSuccess, sendAuthResponse } from "../utils/responseHandler.js";
import validateRequest from "../utils/validationHelper.js";
import generateToken from "../utils/generateToken.js";

const router = express.Router();

const registerValidation = [
  body("name")
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2 }).withMessage("Name must be atleast 2 characters")
    .trim(),
  body("email")
    .isEmail().withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

const loginValidation = [
  body("email")
    .isEmail().withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

const updateProfileValidation = [
  body("name")
    .optional()
    .isLength({ min: 2 }).withMessage("Name must be at least 2 characters")
    .trim(),
  body("email")
    .optional()
    .isEmail().withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password")
    .optional()
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

router.post("/register", registerValidation, validateRequest, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExist = await User.findOne({ email });
    if (userExist) {
      return sendError(res, 400, "User already exists");
    }

    const user = await User.create({ name, email, password });

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    sendAuthResponse(res, 201, "User registered successfully", user, token);
    
  } catch (error) {
    serverError(res, error, "Registration failed");
  }
});

router.post("/login", loginValidation, validateRequest, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).select("+password");
    
    if (!user) {
      return sendError(res, 401, "Invalid email or password");
    }
    
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return sendError(res, 401, "Invalid email or password");
    }
    
    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    sendAuthResponse(res, 200, "Login successful", user, token);
    
  } catch (error) {
    serverError(res, error, "Login failed");
  }
});

router.post("/logout", protect, async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
      path: "/",
    });
    
    sendSuccess(res, 200, "Logged out successfully");
    
  } catch (error) {
    serverError(res, error, "Logout failed");
  }
});

router.get("/profile", protect, async (req, res) => {
  try {
    sendSuccess(res, 200, "Profile fetched successfully", {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt,
      },
    });
    
  } catch (error) {
    serverError(res, error, "Error while fetching profile");
  }
});

router.put("/profile", protect, updateProfileValidation, validateRequest, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return sendError(res, 404, "User not found");
    }
    
    if (name) user.name = name;
    
    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: user._id },
      });
      if (existingUser) {
        return sendError(res, 400, "Email already in use");
      }
      user.email = email;
    }
    
    if (password) {
      user.password = password;
    }
    
    const updateUser = await user.save();
    const token = generateToken(updateUser._id);

    sendAuthResponse(res, 200, "Profile updated successfully", updateUser, token);
    
  } catch (error) {
    serverError(res, error, "Error updating profile");
  }
});

export default router;