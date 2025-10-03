import { Router } from "express";
import {
  createUser,
  loginUser,
  logout,
  getUser,
} from "../controllers/users.controllers.js";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    status: "error",
    message: "Too many registration requests. Please try again later.",
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    status: "error",
    message: "Too many login attempts. Please try again later.",
  },
});

// Public routes
router.post("/register", registerLimiter, createUser);
router.post("/login", loginLimiter, loginUser);

// Protected routes
router.post("/logout", authMiddleware, logout);
router.get("/user/:Flat_no", authMiddleware, getUser);

export default router;
