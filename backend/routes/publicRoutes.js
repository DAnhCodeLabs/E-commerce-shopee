import express from "express";
import { publicBannerController } from "../controllers/public/publicBanner.controller.js";
import { publicCategoryController } from "../controllers/public/publicCategory.controller.js";
import { flashSaleClientController } from "../controllers/public/publicFlashSale.controller.js";
import { aiFeaturedProductController } from "../controllers/public/aiFeaturedProduct.controller.js";
import { productSearchController } from "../controllers/public/productSearch.controller.js";
import { productController } from "../controllers/public/product.controller.js";

const publicRouter = express.Router();

publicRouter.get(
  "/banners/active",
  publicBannerController.publicGetActiveBanners
);

publicRouter.get("/categories", publicCategoryController.publicGetCategories);
publicRouter.get(
  "/flash-sale/homepage",
  flashSaleClientController.publicGetHomepageFlashSale
);
publicRouter.get(
  "/ai/featured-products",
  aiFeaturedProductController.getAiFeaturedProducts
);

publicRouter.get("/search/products", productSearchController.searchProducts);
// publicRoutes.js hoặc productRoutes.js
publicRouter.get("/products/:slug", productController.getProductBySlug);
publicRouter.get("/shops/:id/info", productController.getShopInfo);

publicRouter.get(
  "/products/:id/related-ai",
  productController.getRelatedProductsAI
);

export default publicRouter;
