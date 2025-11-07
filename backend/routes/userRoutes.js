import express from "express";
import authorizeRole from "../middleware/authorizeRole.js";
import { authController } from "../controllers/user/auth.controller.js";
import { profileController } from "../controllers/user/profile.controller.js";
import { addressController } from "../controllers/user/address.controller.js";

const userRouter = express.Router();

userRouter.use(authorizeRole(["user", "seller"]));

userRouter.get("/profile/me", profileController.userGetMyProfile);
userRouter.put("/profile/me", profileController.userUpdateProfile);
userRouter.post(
  "/profile/register-seller",
  profileController.userRegisterSeller
);
userRouter.put("/profile/change-password", authController.userChangePassword);
userRouter.post("/address", addressController.userAddAddress);
userRouter.get("/address", addressController.userGetAddresses);
userRouter.put("/address/:addressId", addressController.userUpdateAddress);
userRouter.delete("/address/:addressId", addressController.userDeleteAddress);

export default userRouter;
