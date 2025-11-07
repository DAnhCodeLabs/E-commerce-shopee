import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongdb.js";
import { errorHandler } from "./middleware/errorHandler.js";
import adminRouter from "./routes/adminRoutes.js";
import publicRouter from "./routes/publicRoutes.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import sellerRouter from "./routes/sellerRoutes.js";
import { adminBannerController } from "./controllers/admin/adminBanner.controller.js";

const app = express();
const port = process.env.PORT || 5000;
connectDB();
app.use(express.json());
app.use(cors());
adminBannerController.updateBannerStatusJob();

app.use("/api", publicRouter);

// Authentication routes
app.use("/api/auth", authRouter);

// User management routes
app.use("/api/user", userRouter);

// Seller management routes
app.use("/api/seller", sellerRouter);

// Admin management routes
app.use("/api/admin", adminRouter);

app.get("/", (req, res) => {
  res.send("API Đang chạy...");
});

app.use(errorHandler);

app.listen(port, () => console.log("Server đang chạy dưới port: " + port));
