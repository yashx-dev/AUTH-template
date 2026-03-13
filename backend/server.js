import express, { urlencoded } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

if (process.env.ENV_NODE === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
  });
}
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

app.use("/auth", authRoutes);
app.use(notFound);
app.use(errorHandler);
const PORT = process.env.PORT || 5000;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    console.log("📊 Database:", mongoose.connection.name);

    // Start server after successful database connection
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 API URL: http://localhost:${PORT}`);
      console.log(`🔐 Auth routes mounted at: /api/auth`);
      console.log(`📝 Available endpoints:`);
      console.log(`   POST   /api/auth/register`);
      console.log(`   POST   /api/auth/login`);
      console.log(`   POST   /api/auth/logout`);
      console.log(`   GET    /api/auth/profile`);
      console.log(`   PUT    /api/auth/profile`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.error("Please check your MONGODB_URI in .env file");
    process.exit(1); // Exit process with failure
  });

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection", err.message);
  server.close(() => process.exit(1));
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception", err.message);
  process.exit(1);
});

export default app;
