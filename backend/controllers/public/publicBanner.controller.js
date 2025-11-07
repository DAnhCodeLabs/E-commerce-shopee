import asyncHandler from "express-async-handler";
import Banner from "../../models/bannerModel.js";

const publicGetActiveBanners = asyncHandler(async (req, res) => {
  const now = new Date();

  const activeBanners = await Banner.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: activeBanners,
  });
});

export const publicBannerController = {
  publicGetActiveBanners,
};
