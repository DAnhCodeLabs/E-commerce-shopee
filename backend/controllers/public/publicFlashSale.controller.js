import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import FlashSaleTimeSlot from "../../models/flashSaleTimeSlotModel.js";
import FlashSaleProduct from "../../models/flashSaleProductModel.js";


const publicGetHomepageFlashSale = asyncHandler(async (req, res) => {
  // --- Bước 1: Lấy thời gian (NOW) và các Mốc Giờ (Slots) ---
  const now = new Date();
  const nowMs = now.getTime();

  const allSlots = await FlashSaleTimeSlot.find({ is_active: true }) //
    .sort({ start_time: "asc" }) // Sắp xếp 12:00, 14:00, 19:00
    .lean();

  // Nếu không có mốc giờ nào, trả về rỗng
  if (allSlots.length === 0) {
    return res.status(200).json({
      success: true,
      message: "Không có chương trình Flash Sale nào đang hoạt động.",
      data: { slotInfo: null, products: [] },
    });
  }

  // --- Bước 2 & 3: Tìm Mốc Giờ "Mục Tiêu" (Target Slot) và Ngày "Mục Tiêu" (Target Date) ---

  let targetSlot = null;
  let targetDate = new Date(now); // Mặc định là HÔM NAY
  let status = ""; // Trạng thái của mốc giờ mục tiêu

  // Hàm hỗ trợ: tạo đối tượng Date cho mốc giờ vào 1 ngày cụ thể
  const getSlotTime = (date, timeString) => {
    const [hour, minute] = timeString.split(":").map(Number);
    // Cẩn thận: setHours trả về timestamp (number), không phải Date
    const d = new Date(date);
    d.setHours(hour, minute, 0, 0);
    return d.getTime();
  };

  // Ưu tiên 1: Tìm mốc "Đang diễn ra"
  for (const slot of allSlots) {
    const startTimeMs = getSlotTime(now, slot.start_time);
    const endTimeMs = getSlotTime(now, slot.end_time);

    if (nowMs >= startTimeMs && nowMs < endTimeMs) {
      targetSlot = slot;
      status = "đang diễn ra";
      break;
    }
  }

  // Ưu tiên 2: Tìm mốc "Sắp diễn ra" (nếu không có mốc đang diễn ra)
  if (!targetSlot) {
    for (const slot of allSlots) {
      const startTimeMs = getSlotTime(now, slot.start_time);
      if (nowMs < startTimeMs) {
        targetSlot = slot;
        status = "sắp diễn ra";
        break;
      }
    }
  }

  // Ưu tiên 3: Đã qua tất cả (ví dụ: 23:00 đêm) -> Lấy mốc đầu tiên của NGÀY MAI
  if (!targetSlot) {
    targetSlot = allSlots[0]; // Mốc đầu tiên (ví dụ 12:00)
    status = "sắp diễn ra"; // Coi như "sắp diễn ra" cho ngày mai
    targetDate.setDate(targetDate.getDate() + 1); // Đặt ngày mục tiêu là NGÀY MAI
  }

  // --- Bước 4: Lấy Sản Phẩm Dựa Trên Mục Tiêu ---

  // Đặt ngày mục tiêu về 00:00:00 và 23:59:59
  const startDate = new Date(targetDate);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(targetDate);
  endDate.setHours(23, 59, 59, 999);

  // Giới hạn số lượng cho trang chủ
  const limit = parseInt(req.query.limit) || 10;

  // Tái sử dụng logic lọc từ Nghiệp vụ 2
  const filterQuery = {
    time_slot_id: new mongoose.Types.ObjectId(targetSlot._id),
    sale_date: { $gte: startDate, $lte: endDate },
    seller_status: true, //
    $expr: { $gt: ["$flash_stock", "$sold_count"] }, //
  };

  const aggregationPipeline = [
    { $match: filterQuery },
    {
      $lookup: {
        from: "products", //
        localField: "product_id",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
    {
      $match: {
        "productInfo.isActive": true, //
        "productInfo.sellerStatus": "NORMAL", //
      },
    },
    { $sort: { sold_count: -1 } }, // Ưu tiên hiển thị sản phẩm bán chạy
    { $limit: limit }, // Chỉ lấy số lượng giới hạn cho trang chủ
    {
      $project: {
        _id: 1,
        original_price: 1,
        flash_price: 1,
        discount_percentage: 1,
        flash_stock: 1,
        sold_count: 1,
        productName: "$productInfo.name",
        productImage: { $arrayElemAt: ["$productInfo.images", 0] },
        productSlug: "$productInfo.slug",
        product_id: "$productInfo._id",
      },
    },
  ];

  const products = await FlashSaleProduct.aggregate(aggregationPipeline); //

  // --- Bước 5: Trả về Dữ Liệu ---
  res.status(200).json({
    success: true,
    message: "Lấy dữ liệu Flash Sale trang chủ thành công.",
    data: {
      // Gửi thông tin mốc giờ để T.chủ biết (ví dụ: dùng cho countdown)
      slotInfo: {
        ...targetSlot,
        status: status, // Gửi trạng thái đã tính toán
        target_date: targetDate.toISOString().split("T")[0], // Gửi ngày mục tiêu
      },
      products: products,
    },
  });
});
const publicGetTimeSlots = asyncHandler(async (req, res) => {
  const now = new Date();
  const timeSlots = await FlashSaleTimeSlot.find({ is_active: true })
    .sort({
      start_time: "asc",
    })
    .lean();

  const timeSlotsWithStatus = timeSlots.map((slot) => {
    const [startHour, startMinute] = slot.start_time.split(":").map(Number);
    const [endHour, endMinute] = slot.end_time.split(":").map(Number);

    const startTime = new Date(now).setHours(startHour, startMinute, 0, 0);
    const endTime = new Date(now).setHours(endHour, endMinute, 0, 0);

    let status = "";
    if (now.getTime() < startTime) {
      status = "sắp diễn ra";
    } else if (now.getTime() >= startTime && now.getTime() < endTime) {
      status = "đang diễn ra";
    } else {
      status = "đã kết thúc";
    }

    return {
      ...slot,
      status: status,
    };
  });

  res.status(200).json({
    success: true,
    message: "Lấy các mốc thời gian thành công!",
    data: timeSlotsWithStatus,
  });
});

const publicGetProductsBySlot = asyncHandler(async (req, res) => {
  const { time_slot_id, sale_date } = req.query;

  if (!time_slot_id || !sale_date) {
    res.status(400);
    throw new Error("Vui lòng cung cấp time_slot_id và sale_date.");
  }
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const startDate = new Date(sale_date);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(sale_date);
  endDate.setHours(23, 59, 59, 999);

  const filterQuery = {
    time_slot_id: new mongoose.Types.ObjectId(time_slot_id),
    sale_date: { $gte: startDate, $lte: endDate },
    seller_status: true,
    $expr: { $gt: ["$flash_stock", "$sold_count"] },
  };

  const aggregationPipeline = [
    { $match: filterQuery },

    {
      $lookup: {
        from: "products",
        localField: "product_id",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },

    {
      $match: {
        "productInfo.isActive": true,
        "productInfo.sellerStatus": "NORMAL",
      },
    },

    { $sort: { sold_count: -1 } },

    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              original_price: 1,
              flash_price: 1,
              discount_percentage: 1,
              flash_stock: 1,
              sold_count: 1,
              productName: "$productInfo.name",
              productImage: { $arrayElemAt: ["$productInfo.images", 0] },
              productSlug: "$productInfo.slug",
              product_id: "$productInfo._id",
            },
          },
        ],
        paginationInfo: [{ $count: "totalItems" }],
      },
    },
  ];

  const result = await FlashSaleProduct.aggregate(aggregationPipeline);

  const data = result[0].data;
  const totalItems = result[0].paginationInfo[0]
    ? result[0].paginationInfo[0].totalItems
    : 0;
  const totalPages = Math.ceil(totalItems / limit);

  res.status(200).json({
    success: true,
    message: "Lấy danh sách sản phẩm Flash Sale thành công!",
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      limit,
    },
  });
});

export const flashSaleClientController = {
  publicGetHomepageFlashSale,
  publicGetTimeSlots,
  publicGetProductsBySlot,
};
