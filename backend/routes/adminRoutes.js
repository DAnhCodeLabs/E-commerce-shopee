import express from "express";
import authorizeRole from "../middleware/authorizeRole.js";
import {
  uploadSingleImage,
} from "../middleware/upload.js";

// Import tất cả các controller của Admin
import { adminAttributeController } from "../controllers/admin/adminAttribute.controller.js";
import { adminBannerController } from "../controllers/admin/adminBanner.controller.js";
import { adminCategoryController } from "../controllers/admin/adminCategory.controller.js";
import { adminDashboardController } from "../controllers/admin/adminDashboard.controller.js";
import { adminFlashSaleController } from "../controllers/admin/adminFlashSale.controller.js";
import { adminAccountController } from "../controllers/admin/adminAccount.controller.js";
import { adminProductController } from "../controllers/admin/adminProduct.controller.js";

const adminRouter = express.Router();

// Áp dụng middleware_bảo_vệ cho TẤT CẢ các route bên dưới
adminRouter.use(authorizeRole(["admin"]));

// --- Dashboard Routes ---
adminRouter.get(
  "/dashboard/stats",
  adminDashboardController.adminGetAccountStats
);

// --- Account (User) Routes ---
adminRouter.get("/accounts", adminAccountController.adminGetAccounts);
adminRouter.put(
  "/accounts/:id/status",
  adminAccountController.adminUpdateAccountStatus
);
adminRouter.delete("/accounts/:id", adminAccountController.adminDeleteAccount);

// --- Account (Seller) Routes ---
adminRouter.get("/sellers", adminAccountController.adminGetSellerAccounts);
adminRouter.put(
  "/sellers/:sellerId/verify",
  adminAccountController.adminVerifySellerApplication
);

// --- Attribute Routes ---
adminRouter.post("/attributes", adminAttributeController.adminCreateAttribute);
adminRouter.get("/attributes", adminAttributeController.adminGetAttributes);

// --- Banner Routes ---
adminRouter.post(
  "/banners",
  uploadSingleImage("banners"), // 'banners' là tên thư mục trên Cloudinary
  adminBannerController.adminCreateBanner
);
adminRouter.get("/banners", adminBannerController.adminGetBanners);
adminRouter.put(
  "/banners/:id",
  uploadSingleImage("banners"),
  adminBannerController.adminUpdateBanner
);
adminRouter.delete("/banners/:id", adminBannerController.adminDeleteBanner);

// --- Category Routes ---
adminRouter.post(
  "/categories",
  uploadSingleImage("categories"),
  adminCategoryController.adminCreateCategory
);
adminRouter.get("/categories", adminCategoryController.adminGetCategories);
adminRouter.delete(
  "/categories/:id",
  adminCategoryController.adminDeleteCategory
);
adminRouter.put(
  "/categories/:id/toggle",
  adminCategoryController.adminToggleCategoryStatus
);

// --- Flash Sale (Time Slot) Routes ---
adminRouter.post(
  "/flash-sale/slots",
  adminFlashSaleController.adminCreateFlashSaleTimeSlot
);
adminRouter.delete(
  "/flash-sale/slots/:id",
  adminFlashSaleController.adminDeleteFlashSaleTimeSlot
);
// (Lưu ý: Route duyệt sản phẩm flash sale của seller sẽ ở đây)

// --- Product Routes ---
adminRouter.get("/products", adminProductController.adminGetProducts);
adminRouter.get("/products/:id", adminProductController.adminGetProductDetails);
adminRouter.put(
  "/products/:id/toggle",
  adminProductController.adminToggleProductModeration
);

export default adminRouter;
