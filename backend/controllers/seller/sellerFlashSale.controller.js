import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Product from "../../models/productModel.js";
import FlashSaleTimeSlot from "../../models/flashSaleTimeSlotModel.js";
import FlashSaleProduct from "../../models/flashSaleProductModel.js";
import Account from "../../models/accountModel.js";

const sellerRegisterFlashSaleProduct = asyncHandler(async (req, res) => {
  const { product_id, time_slot_id, sale_date, flash_price, flash_stock } =
    req.body;
  const sellerShopId = req.user._id;

  const sellerAccount = await Account.findById(sellerShopId).select(
    "isActive shop.isActive"
  );

  if (!sellerAccount) {
    res.status(404);
    throw new Error("Không tìm thấy tài khoản người bán.");
  }

  if (!sellerAccount.isActive) {
    res.status(403);
    throw new Error(
      "Tài khoản của bạn đã bị khóa. Không thể thực hiện hành động này."
    );
  }

  if (!sellerAccount.shop || !sellerAccount.shop.isActive) {
    res.status(403);
    throw new Error(
      "Cửa hàng của bạn đang bị khóa. Không thể đăng ký Flash Sale."
    );
  }

  if (
    !product_id ||
    !time_slot_id ||
    !sale_date ||
    flash_price === undefined ||
    flash_stock === undefined
  ) {
    res.status(400);
    throw new Error("Vui lòng cung cấp đầy đủ thông tin đăng ký.");
  }

  if (
    !mongoose.Types.ObjectId.isValid(product_id) ||
    !mongoose.Types.ObjectId.isValid(time_slot_id)
  ) {
    res.status(400);
    throw new Error("ID Sản phẩm hoặc ID Mốc thời gian không hợp lệ.");
  }

  const product = await Product.findOne({
    _id: product_id,
    shop_id: sellerShopId,
  });
  if (!product) {
    res.status(404);
    throw new Error(
      "Không tìm thấy sản phẩm hoặc sản phẩm không thuộc về bạn."
    );
  }

  if (!product.isActive) {
    res.status(400);
    throw new Error(
      "Sản phẩm này đang bị ẩn hoặc khóa, không thể đăng ký Flash Sale."
    );
  }

  if (product.sellerStatus !== "NORMAL") {
    res.status(400);
    throw new Error(
      "Sản phẩm này không ở trạng thái 'NORMAL' (Đang bán). Vui lòng kiểm tra lại."
    );
  }

  const timeSlot = await FlashSaleTimeSlot.findOne({
    _id: time_slot_id,
  });
  if (!timeSlot) {
    res.status(404);
    throw new Error("Mốc thời gian không tồn tại hoặc đã bị Admin khóa.");
  }
  const original_price = product.price;
  const original_stock = product.getTotalStock();

  if (Number(flash_price) >= original_price) {
    res.status(400);
    throw new Error("Giá Flash Sale phải thấp hơn giá gốc của sản phẩm.");
  }

  if (Number(flash_stock) > original_stock) {
    res.status(400);
    throw new Error(
      "Số lượng Flash Sale không được vượt quá tồn kho hiện tại."
    );
  }

  if (Number(flash_stock) <= 0) {
    res.status(400);
    throw new Error("Số lượng Flash Sale phải lớn hơn 0.");
  }

  const [startHour, startMinute] = timeSlot.start_time.split(":").map(Number);
  const saleStartDateTime = new Date(sale_date);
  saleStartDateTime.setHours(startHour, startMinute, 0, 0);

  const now = new Date();

  if (saleStartDateTime <= now) {
    res.status(400);
    throw new Error("Không thể đăng ký cho mốc thời gian trong quá khứ.");
  }
  const existingRegistration = await FlashSaleProduct.findOne({
    product_id,
    time_slot_id,
    sale_date: saleStartDateTime.toISOString().split("T")[0],
  });

  if (existingRegistration) {
    res.status(400);
    throw new Error("Sản phẩm này đã được đăng ký cho mốc thời gian này rồi.");
  }

  const newRegistration = new FlashSaleProduct({
    product_id,
    shop_id: sellerShopId,
    time_slot_id,
    sale_date: saleStartDateTime,
    original_price: original_price,
    flash_price: Number(flash_price),
    flash_stock: Number(flash_stock),
  });

  const createdRegistration = await newRegistration.save();

  res.status(201).json({
    success: true,
    message: "Đăng ký sản phẩm vào Flash Sale thành công.",
    data: createdRegistration,
  });
});

const sellerGetMyRegistrations = asyncHandler(async (req, res) => {
  const sellerShopId = req.user._id;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const sortQuery = req.query.sort || "sale_date_desc";
  const [sortField, sortOrder] = sortQuery.split("_");
  const sortOptions = { [sortField]: sortOrder === "asc" ? 1 : -1 };

  const { search, admin_status, seller_status, time_slot_id, sale_date } =
    req.query;

  const baseMatchQuery = {
    shop_id: new mongoose.Types.ObjectId(sellerShopId),
  };

  const filterQuery = {};

  if (search) {
    filterQuery["productInfo.name"] = { $regex: search, $options: "i" };
  }
  if (admin_status) {
    filterQuery.admin_status = admin_status;
  }
  if (seller_status !== undefined) {
    filterQuery.seller_status = seller_status === "true";
  }
  if (time_slot_id && mongoose.Types.ObjectId.isValid(time_slot_id)) {
    filterQuery.time_slot_id = new mongoose.Types.ObjectId(time_slot_id);
  }
  if (sale_date) {
    const startDate = new Date(sale_date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(sale_date);
    endDate.setHours(23, 59, 59, 999);
    filterQuery.sale_date = { $gte: startDate, $lte: endDate };
  }

  const aggregationPipeline = [
    { $match: baseMatchQuery },

    {
      $lookup: {
        from: "products",
        localField: "product_id",
        foreignField: "_id",
        as: "productInfo",
      },
    },

    {
      $lookup: {
        from: "flash_sale_time_slots",
        localField: "time_slot_id",
        foreignField: "_id",
        as: "timeSlotInfo",
      },
    },
    { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$timeSlotInfo", preserveNullAndEmptyArrays: true } },
    { $match: filterQuery },
    {
      $project: {
        _id: 1,
        sale_date: 1,
        original_price: 1,
        flash_price: 1,
        discount_percentage: 1,
        flash_stock: 1,
        sold_count: 1,
        admin_status: 1,
        seller_status: 1,
        createdAt: 1,
        productName: "$productInfo.name",
        productImage: { $arrayElemAt: ["$productInfo.images", 0] },
        timeSlotName: "$timeSlotInfo.name",
        startTime: "$timeSlotInfo.start_time",
      },
    },

    { $sort: sortOptions },

    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
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
    message: "Lấy danh sách đăng ký Flash Sale thành công!",
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      limit,
    },
  });
});

const sellerDeleteFlashSaleRegistration = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const sellerShopId = req.user._id;

  const sellerAccount = await Account.findById(sellerShopId).select(
    "isActive shop.isActive"
  );

  if (!sellerAccount) {
    res.status(404);
    throw new Error("Không tìm thấy tài khoản người bán.");
  }

  if (!sellerAccount.isActive) {
    res.status(403);
    throw new Error(
      "Tài khoản của bạn đã bị khóa. Không thể thực hiện hành động này."
    );
  }

  if (!sellerAccount.shop || !sellerAccount.shop.isActive) {
    res.status(403);
    throw new Error(
      "Cửa hàng của bạn đang bị khóa. Không thể thực hiện hành động này."
    );
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("ID đăng ký không hợp lệ.");
  }

  const registration = await FlashSaleProduct.findOne({
    _id: id,
    shop_id: sellerShopId,
  });

  if (!registration) {
    res.status(404);
    throw new Error("Không tìm thấy bản đăng ký hoặc bạn không có quyền xóa.");
  }
  const timeSlot = await FlashSaleTimeSlot.findById(registration.time_slot_id);
  if (timeSlot) {
    const [startHour, startMinute] = timeSlot.start_time.split(":").map(Number);
    const [endHour, endMinute] = timeSlot.end_time.split(":").map(Number);

    const saleDate = new Date(registration.sale_date);
    const startTime = new Date(saleDate.getTime()).setHours(
      startHour,
      startMinute,
      0,
      0
    );
    const endTime = new Date(saleDate.getTime()).setHours(
      endHour,
      endMinute,
      0,
      0
    );
    const now = new Date().getTime();

    if (now >= startTime && now < endTime) {
      res.status(400);
      throw new Error("Không thể hủy khi Flash Sale đang diễn ra.");
    }
  }
  await registration.deleteOne();

  res.status(200).json({
    success: true,
    message: "Hủy đăng ký Flash Sale thành công.",
  });
});

export const sellerFlashSaleController = {
  sellerRegisterFlashSaleProduct,
  sellerGetMyRegistrations,
  sellerDeleteFlashSaleRegistration,
};
