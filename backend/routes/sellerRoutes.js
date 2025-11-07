import express from "express";
import authorizeRole from "../middleware/authorizeRole.js";
import { uploadProductImages } from "../middleware/upload.js";
import { sellerProductController } from "../controllers/seller/sellerProduct.controller.js";
import { sellerFlashSaleController } from "../controllers/seller/sellerFlashSale.controller.js";

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
sellerRouter.delete(
  "/flash-sale/register/:id",
  sellerFlashSaleController.sellerDeleteFlashSaleRegistration
);

export default sellerRouter;
