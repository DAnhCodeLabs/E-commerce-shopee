import express from "express";
import authorizeRole from "../middleware/authorizeRole.js";
import { uploadProductImages } from "../middleware/upload.js";
import { sellerProductController } from "../controllers/seller/sellerProduct.controller.js";
import { sellerFlashSaleController } from "../controllers/seller/sellerFlashSale.controller.js";
import { adminAttributeController } from "../controllers/admin/adminAttribute.controller.js";
import { sellerOrderController } from "../controllers/seller/sellerOrder.controller.js";

const sellerRouter = express.Router();

sellerRouter.use(authorizeRole(["seller"]));

// --- Product Routes (Seller) ---
sellerRouter.post(
  "/products",
  uploadProductImages("products"),
  sellerProductController.sellerCreateProduct
);
sellerRouter.get("/products", sellerProductController.sellerGetProducts);
sellerRouter.get(
  "/products/:id",
  sellerProductController.sellerGetProductDetails
);
sellerRouter.put(
  "/products/:id",
  uploadProductImages("products"),
  sellerProductController.sellerUpdateProduct
);
sellerRouter.delete(
  "/products/:id",
  sellerProductController.sellerDeleteProduct
);

// --- Flash Sale (Seller) ---
sellerRouter.post(
  "/flash-sale/register",
  sellerFlashSaleController.sellerRegisterFlashSaleProduct
);
sellerRouter.get(
  "/flash-sale/myRegistrations",
  sellerFlashSaleController.sellerGetMyRegistrations
);
sellerRouter.delete(
  "/flash-sale/register/:id",
  sellerFlashSaleController.sellerDeleteFlashSaleRegistration
);

// --- Attribute Routes ---
sellerRouter.get(
  "/attributes/category/:categoryId",
  adminAttributeController.getAttributesForCategory
);

// --- ORDER ROUTES (SELLER) ---
// Lấy danh sách đơn
sellerRouter.get("/orders", sellerOrderController.getSellerOrders);

// Lấy chi tiết đơn
sellerRouter.get("/orders/:id", sellerOrderController.getSellerOrderDetails);

// Cập nhật trạng thái (Duyệt/Giao)
sellerRouter.put("/orders/:id/status", sellerOrderController.updateOrderStatus);

// Hủy đơn
sellerRouter.put("/orders/:id/cancel", sellerOrderController.cancelOrder);
export default sellerRouter;
