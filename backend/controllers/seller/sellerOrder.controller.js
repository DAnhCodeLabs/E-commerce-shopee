import asyncHandler from "express-async-handler";
import Order from "../../models/orderModel.js";
import Product from "../../models/productModel.js";

const getSellerOrders = asyncHandler(async (req, res) => {
  const shopId = req.user._id;
  const { status, page = 1, limit = 10 } = req.query;

  const filter = { shop: shopId };
  if (status && status !== "all") {
    filter.orderStatus = status;
  }

  // Phân trang
  const skip = (page - 1) * limit;

  const orders = await Order.find(filter)
    .populate("user", "fullName avatar") // Lấy info người mua
    .sort({ createdAt: -1 }) // Mới nhất lên đầu
    .skip(skip)
    .limit(Number(limit))
    .lean(); // Tối ưu hiệu năng đọc

  const total = await Order.countDocuments(filter);

  res.json({
    success: true,
    data: orders,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

const getSellerOrderDetails = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    shop: req.user._id, // Bảo mật: Chỉ xem đơn của mình
  }).populate("user", "fullName email phoneNumber address");

  if (!order) {
    res.status(404);
    throw new Error("Không tìm thấy đơn hàng hoặc bạn không có quyền");
  }

  res.json({ success: true, data: order });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body; // "CONFIRMED" hoặc "SHIPPING"
  const order = await Order.findOne({
    _id: req.params.id,
    shop: req.user._id,
  });

  if (!order) {
    res.status(404);
    throw new Error("Đơn hàng không tồn tại");
  }

  // Logic chuyển trạng thái tuần tự
  if (status === "CONFIRMED") {
    if (order.orderStatus !== "PENDING") {
      res.status(400);
      throw new Error("Chỉ đơn hàng PENDING mới được xác nhận");
    }
  } else if (status === "SHIPPING") {
    if (order.orderStatus !== "CONFIRMED") {
      res.status(400);
      throw new Error("Phải xác nhận đơn hàng trước khi giao");
    }
  } else {
    res.status(400);
    throw new Error("Trạng thái không hợp lệ");
  }

  order.orderStatus = status;
  // Nếu giao hàng, cập nhật log tracking ban đầu
  if (status === "SHIPPING") {
    order.trackingLogs.push({
      status: "Đã giao cho đơn vị vận chuyển",
      location: "Kho Người Bán",
      timestamp: new Date(),
    });
  }

  await order.save();
  res.json({ success: true, message: "Cập nhật trạng thái thành công" });
});


const cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const order = await Order.findOne({
    _id: req.params.id,
    shop: req.user._id,
  });

  if (!order) {
    res.status(404);
    throw new Error("Đơn hàng không tồn tại");
  }

  // Chỉ được hủy khi chưa giao
  if (["SHIPPING", "DELIVERED", "COMPLETED"].includes(order.orderStatus)) {
    res.status(400);
    throw new Error("Không thể hủy đơn đang giao hoặc đã giao");
  }

  // 1. Cập nhật trạng thái
  order.orderStatus = "CANCELLED";
  order.cancelledAt = Date.now();
  order.trackingLogs.push({
    status: "Đã hủy bởi người bán",
    note: reason || "Hết hàng/Lý do khác",
    timestamp: new Date(),
  });

  await order.save();

  // 2. HOÀN LẠI TỒN KHO (QUAN TRỌNG)
  for (const item of order.orderItems) {
    if (item.model_id) {
      // Hoàn kho biến thể
      await Product.updateOne(
        { _id: item.product, "models._id": item.model_id },
        { $inc: { "models.$.stock": +item.quantity } }
      );
    } else {
      // Hoàn kho sản phẩm thường
      await Product.updateOne(
        { _id: item.product },
        { $inc: { stock: +item.quantity } }
      );
    }
  }

  res.json({ success: true, message: "Đã hủy đơn hàng và hoàn kho" });
});

export const sellerOrderController = {
  getSellerOrders,
  getSellerOrderDetails,
  updateOrderStatus,
  cancelOrder,
};
