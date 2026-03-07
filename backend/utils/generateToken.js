import jwt from "jsonwebtoken";
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT secret is not defined in environment variable");
  }
  const token = jwt.sign({ userId: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });

  return token;
};
export default generateToken;
