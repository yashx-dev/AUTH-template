import express from "express";
import { body } from "express-validator";
import protect from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import {
  sendError,
  validationError,
  serverError,
} from "../utils/errorHandler.js";
import { sendSuccess, sendAuthResponse } from "../utils/responseHandler.js";
import validateRequest from "../utils/validationHelper.js";
import generateToken from "../utils/generateToken.js";
const router = express.Router();

const registerValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be atleast 2 characters")
    .trim(),

  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

const updateProfileValidation = [
  body("name")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters")
    .trim(),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

router.post("/register", registerValidation, validateRequest, async (req, res) => {
  console.log("🔵 STEP 1: Register route hit");
  console.log("🔵 Request body:", req.body);
  
  try {
    const { name, email, password } = req.body;
    console.log("🔵 STEP 2: Destructured data:", { name, email, password: "***" });

    console.log("🔵 STEP 3: Checking if user exists with email:", email);
    const userExist = await User.findOne({ email });
    console.log("🔵 STEP 4: User exists?", userExist ? "YES" : "NO");
    
    if (userExist) {
      console.log("🔵 STEP 4a: User exists, returning error");
      return sendError(res, 400, "User already exists");
    }

    console.log("🔵 STEP 5: Creating new user...");
    const user = await User.create({
      name,
      email,
      password,
    });
    console.log("🔵 STEP 6: User created successfully:", user._id);
    console.log("🔵 STEP 7: User password after create:", user.password ? "HASHED" : "PLAIN TEXT");

    console.log("🔵 STEP 8: Generating token...");
    const token = generateToken(user._id);
    console.log("🔵 STEP 9: Token generated:", token ? "YES" : "NO");

    console.log("🔵 STEP 10: Setting cookie...");
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    console.log("🔵 STEP 11: Cookie set");

    console.log("🔵 STEP 12: Sending response...");
    sendAuthResponse(res, 201, "User registered successfully", user, token);
    console.log("🔵 STEP 13: Response sent");
    
  } catch (error) {
    console.log("❌ ERROR CAUGHT IN REGISTER:");
    console.log("❌ Error name:", error.name);
    console.log("❌ Error message:", error.message);
    console.log("❌ Error stack:", error.stack);
    console.log("❌ Error code:", error.code);
    
    serverError(res, error, "Registration failed");
  }
});
router.post("/login", loginValidation, validateRequest, async (req, res) => {
  try {
    const { name, email, password } = req.body;
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
      expires: new Date(0),
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

router.put(
  "/profile",
  protect,
  updateProfileValidation,
  validateRequest,
  async (req, res) => {
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

      sendAuthResponse(
        res,
        200,
        "Profile updated successfully",
        updateUser,
        token,
      );
    } catch (error) {
      serverError(res, error, "Error updating profile");
    }
  },
);



export default router;
