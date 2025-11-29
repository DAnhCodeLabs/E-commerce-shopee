import cron from "node-cron";
import asyncHandler from "express-async-handler";
import Banner from "../../models/bannerModel.js";
import { deleteFromCloudinary } from "../../config/cloudinary.js";

const adminCreateBanner = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.body;
  const imageUrl = req.file ? req.file.path : null;
  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: "Ngày bắt đầu và ngày kết thúc là bắt buộc",
    });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  if (isNaN(start) || isNaN(end)) {
    return res.status(400).json({
      success: false,
      message: "Định dạng ngày không hợp lệ",
    });
  }
  if (start >= end) {
    return res.status(400).json({
      success: false,
      message: "Ngày bắt đầu phải trước ngày kết thúc",
    });
  }

  const isActive = start <= now && now <= end;

  const banner = await Banner.create({
    startDate: start,
    endDate: end,
    isActive,
    imageUrl,
  });

  res.status(201).json({
    success: true,
    message: "Tạo banner thành công",
    data: banner,
  });
});

const adminGetBanners = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const queryOptions = {};

  if (req.query.isActive) {
    queryOptions.isActive = req.query.isActive === "true";
  }

  if (req.query.startDateFilter || req.query.endDateFilter) {
    queryOptions.$and = queryOptions.$and || [];

    if (req.query.startDateFilter) {
      const startOfDay = new Date(req.query.startDateFilter);
      startOfDay.setHours(0, 0, 0, 0);
      queryOptions.$and.push({ startDate: { $gte: startOfDay } });
    }

    if (req.query.endDateFilter) {
      const endOfDay = new Date(req.query.endDateFilter);
      endOfDay.setHours(23, 59, 59, 999);
      queryOptions.$and.push({ endDate: { $lte: endOfDay } });
    }
  }

  if (req.query.search) {
    const searchQuery = {
      $regex: req.query.search,
      $options: "i",
    };
    queryOptions.$or = [{ _id: req.query.search }];
  }

  const sortOptions = {};
  const sortBy = req.query.sortBy || "createdAt";
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
  sortOptions[sortBy] = sortOrder;

  const banners = await Banner.find(queryOptions)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);

  const totalBanners = await Banner.countDocuments(queryOptions);
  const totalPages = Math.ceil(totalBanners / limit);

  res.status(200).json({
    success: true,
    message: "Lấy danh sách banner thành công",
    data: banners,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: totalBanners,
      limit,
    },
  });
});

const adminUpdateBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate, isActive } = req.body;

  const banner = await Banner.findById(id);
  if (!banner) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy banner",
    });
  }

  const newStartDate = startDate ? new Date(startDate) : banner.startDate;
  const newEndDate = endDate ? new Date(endDate) : banner.endDate;

  if (isNaN(newStartDate) || isNaN(newEndDate)) {
    return res.status(400).json({
      success: false,
      message: "Định dạng ngày không hợp lệ",
    });
  }
  if (newStartDate >= newEndDate) {
    return res.status(400).json({
      success: false,
      message: "Ngày bắt đầu phải trước ngày kết thúc",
    });
  }
  banner.startDate = newStartDate;
  banner.endDate = newEndDate;

  if (isActive !== undefined) {
    banner.isActive = isActive;
  }
  if (req.file) {
    const oldImageUrl = banner.imageUrl;

    banner.imageUrl = req.file.path;
    if (oldImageUrl) {
      await deleteFromCloudinary(oldImageUrl);
    }
  }

  const updatedBanner = await banner.save();

  res.status(200).json({
    success: true,
    message: "Cập nhật banner thành công",
    data: updatedBanner,
  });
});

const adminDeleteBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const banner = await Banner.findById(id);

  if (!banner) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy banner",
    });
  }
  const imageUrl = banner.imageUrl;
  if (imageUrl) {
    await deleteFromCloudinary(imageUrl);
  }
  await Banner.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Xóa banner và ảnh liên quan thành công",
  });
});

const updateBannerStatusJob = () => {
  cron.schedule("* * * * *", async () => {
    console.log(
      "Running banner status update job at:",
      new Date().toISOString()
    );
    const now = new Date();

    try {
      const bannersToActivate = await Banner.updateMany(
        {
          isActive: false,
          startDate: { $lte: now },
          endDate: { $gte: now },
        },
        { $set: { isActive: true } }
      );

      if (bannersToActivate.modifiedCount > 0) {
        console.log(`Activated ${bannersToActivate.modifiedCount} banners.`);
      }
      const bannersToDeactivate = await Banner.updateMany(
        {
          isActive: true,
          endDate: { $lt: now },
        },
        { $set: { isActive: false } }
      );

      if (bannersToDeactivate.modifiedCount > 0) {
        console.log(
          `Deactivated ${bannersToDeactivate.modifiedCount} banners.`
        );
      }
    } catch (error) {
      console.error("Error running banner status update job:", error);
    }
  });
};

export const adminBannerController = {
  adminCreateBanner,
  adminGetBanners,
  adminUpdateBanner,
  adminDeleteBanner,
  updateBannerStatusJob,
};
