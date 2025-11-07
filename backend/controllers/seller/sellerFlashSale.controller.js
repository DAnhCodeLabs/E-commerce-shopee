import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Product from "../../models/productModel.js";
import FlashSaleTimeSlot from "../../models/flashSaleTimeSlotModel.js";
import FlashSaleProduct from "../../models/flashSaleProductModel.js";

const sellerRegisterFlashSaleProduct = asyncHandler(async (req, res) => {
  const { product_id, time_slot_id, sale_date, flash_price, flash_stock } =
    req.body;
  const sellerShopId = req.user._id;

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

  const timeSlot = await FlashSaleTimeSlot.findOne({
    _id: time_slot_id,
    is_active: true,
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
    message: "Đăng ký sản phẩm vào Flash Sale thành công! Chờ Admin duyệt.",
    data: createdRegistration,
  });
});

const sellerDeleteFlashSaleRegistration = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const sellerShopId = req.user._id;

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
  sellerDeleteFlashSaleRegistration,
};
