import asyncHandler from "express-async-handler";
import FlashSaleTimeSlot from "../../models/flashSaleTimeSlotModel.js";
import FlashSaleProduct from "../../models/flashSaleProductModel.js"; // <-- ĐÃ THÊM IMPORT
import mongoose from "mongoose";

const adminCreateFlashSaleTimeSlot = asyncHandler(async (req, res) => {
  const { name, start_time, end_time } = req.body;

  if (!name || !start_time || !end_time) {
    res.status(400);
    throw new Error("Vui lòng cung cấp Tên, Giờ bắt đầu, và Giờ kết thúc.");
  }

  if (start_time >= end_time) {
    res.status(400);
    throw new Error("Giờ kết thúc phải sau giờ bắt đầu.");
  }
  const existingSlot = await FlashSaleTimeSlot.findOne({ start_time });
  if (existingSlot) {
    res.status(400);
    throw new Error(`Mốc thời gian bắt đầu lúc ${start_time} đã tồn tại.`);
  }

  const newTimeSlot = new FlashSaleTimeSlot({
    name,
    start_time,
    end_time,
  });

  const createdSlot = await newTimeSlot.save();

  res.status(201).json({
    success: true,
    message: "Tạo mốc thời gian Flash Sale thành công!",
    data: createdSlot,
  });
});
const adminGetFlashSaleTimeSlots = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const sortQuery = req.query.sort || "start_time_asc";
  const [sortField, sortOrder] = sortQuery.split("_");
  const sortOptions = { [sortField]: sortOrder === "asc" ? 1 : -1 };
  const { search, is_active } = req.query;
  const matchQuery = {};

  if (search) {
    matchQuery.name = { $regex: search, $options: "i" };
  }

  if (is_active !== undefined) {
    matchQuery.is_active = is_active === "true";   
  }

  const [timeSlots, totalItems] = await Promise.all([
    FlashSaleTimeSlot.find(matchQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean(),

    FlashSaleTimeSlot.countDocuments(matchQuery),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  res.status(200).json({
    success: true,
    message: "Lấy danh sách mốc thời gian thành công!",
    data: timeSlots,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      limit,
    },
  });
});

const adminDeleteFlashSaleTimeSlot = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("ID mốc thời gian không hợp lệ.");
  }

  const timeSlotToDelete = await FlashSaleTimeSlot.findById(id);
  if (!timeSlotToDelete) {
    res.status(404);
    throw new Error("Không tìm thấy mốc thời gian này.");
  }

  const productCount = await FlashSaleProduct.countDocuments({
    time_slot_id: id,
  });

  if (productCount > 0) {
    res.status(400);
    throw new Error(
      `Không thể xóa mốc thời gian này. Đang có ${productCount} sản phẩm đã đăng ký (hoặc từng đăng ký) vào mốc này.`
    );
  }

  await timeSlotToDelete.deleteOne();

  res.status(200).json({
    success: true,
    message: "Xóa mốc thời gian thành công.",
  });
});

export const adminFlashSaleController = {
  adminCreateFlashSaleTimeSlot,
  adminGetFlashSaleTimeSlots,
  adminDeleteFlashSaleTimeSlot,
};
