import express from "express";
import { publicBannerController } from "../controllers/public/publicBanner.controller.js";
import { publicCategoryController } from "../controllers/public/publicCategory.controller.js";

const publicRouter = express.Router();

publicRouter.get(
  "/banners/active",
  publicBannerController.publicGetActiveBanners
);

publicRouter.get("/categories", publicCategoryController.publicGetCategories);

export default publicRouter;
