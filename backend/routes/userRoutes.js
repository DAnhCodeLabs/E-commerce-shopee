import express from "express";
import authorizeRole from "../middleware/authorizeRole.js";
import { authController } from "../controllers/user/auth.controller.js";
import { profileController } from "../controllers/user/profile.controller.js";
import { addressController } from "../controllers/user/address.controller.js";
import { reviewController } from "../controllers/user/review.controller.js";
import { uploadMultipleImages } from "../middleware/upload.js";
import { cartController } from "../controllers/user/cart.controller.js";
import { orderController } from "../controllers/user/order.controller.js";

const userRouter = express.Router();

// --- PUBLIC ROUTES (Ai cũng xem được) ---
// Lấy danh sách review của sản phẩm
userRouter.get("/review/product/:productId", reviewController.getProductReviews);

userRouter.use(authorizeRole(["user", "seller"]));

userRouter.get("/profile/me", profileController.userGetMyProfile);
userRouter.patch("/profile/me", profileController.userUpdateProfile);
userRouter.post(
  "/profile/register-seller",
  profileController.userRegisterSeller
);
userRouter.put("/profile/change-password", authController.userChangePassword);
userRouter.post("/address", addressController.userAddAddress);
userRouter.get("/address", addressController.userGetAddresses);
userRouter.put("/address/:addressId", addressController.userUpdateAddress);
userRouter.delete("/address/:addressId", addressController.userDeleteAddress);

// Review routes
userRouter.get(
  "/review/check-eligibility",
  reviewController.checkReviewEligibility
);
userRouter.post(
  "/review",
  uploadMultipleImages("reviews", 5),
  reviewController.createReview
);

//Cart routes
userRouter.get("/cart", cartController.getCart);
userRouter.post("/add", cartController.addToCart);
userRouter.put("/update", cartController.updateCartItem);
userRouter.delete("/remove", cartController.removeCartItem);

//Order routes
// 1. Tạo đơn hàng mới
userRouter.post("/orders", orderController.createOrder);

// 2. Lấy danh sách đơn hàng của tôi (User)
// LƯU Ý: Phải đặt route này TRƯỚC route /:id
userRouter.get("/my-orders", orderController.getMyOrders);

// 3. Lấy chi tiết đơn hàng theo ID
userRouter.get("/order/:id", orderController.getOrderById);

// 4. Xác nhận đã nhận hàng (User)
userRouter.put("/order/:id/received", orderController.confirmReceived);
userRouter.put("/order/:id/cancel", orderController.cancelOrder);
export default userRouter;
