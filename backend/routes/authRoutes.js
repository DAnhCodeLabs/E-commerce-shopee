import express from "express";
import {
  forgotPassword,
  login,
  registerUser,
  resetPassword,
  updateProfile,
  verifyOtp,
} from "../controllers/account/accountController.js";
import authorizeRole from "../middleware/authorizeRole.js";
const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/verifi-email", verifyOtp);
authRouter.post("/login", login);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.patch("/update-profile", authorizeRole(["user", "seller", "admin"]), updateProfile);
export default authRouter;
