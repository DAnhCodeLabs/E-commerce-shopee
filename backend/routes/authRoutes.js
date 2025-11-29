import express from "express";
import { authController } from "../controllers/user/auth.controller.js";

const authRouter = express.Router();

// --- Auth Routes ---
authRouter.post("/register", authController.authRegister);
authRouter.post("/login", authController.authLogin);
authRouter.post("/verify-otp", authController.authVerifyOtp);
authRouter.post("/forgot-password", authController.authForgotPassword);
authRouter.post("/reset-password", authController.authResetPassword);

export default authRouter;
