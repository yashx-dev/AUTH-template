import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import validateRequest from "../utils/validateRequest.js";
import sendAuthResponse from "../utils/sendAuthResponse.js";
import handleServerError from "../utils/handleServerError.js";

const registerUser = async (req, res) => {
  try {
    if (!validateRequest(req, res)) return;

    const { name, email, password } = req.body;

    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }
    const user = await User.create({
      name,
      email,
      password,
    });
    const token = generateToken(user._id);
    sendAuthResponse(res, 201, "User created successfully", user, token);
  } catch (error) {
    handleServerError(res, error, "Server error while registering user");
  }
};

const loginUser = async (req, res) => {
  try {
    if (!validateRequest(req, res)) return;
    const { email, password } = req.body;
    const user = await findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const token = generateToken(user._id);
    user.password = undefined;
    sendAuthResponse(res, 200, "Login successful", user, token);
  } catch (error) {
    handleServerError(res, error, "Server error while login");
  }
};

const logout = async (req, res) => {
  res.cookie("token", "", {
    httponly: true,
    expires: new Date(0),
  });
  res.json({
    success: true,
    message: "Logout Successfully",
  });
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    handleServerError(res, error, "Server error while fetching profile");
  }
};

export { registerUser, loginUser, logout, getProfile };
