import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // --- 1. ĐỊNH DANH ---
    // Người mua hàng
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    // Người bán (Shop) - Bắt buộc có để phục vụ tách đơn
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },

    // --- 2. DANH SÁCH SẢN PHẨM (SNAPSHOT) ---
    // Lưu cứng dữ liệu tại thời điểm đặt hàng
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true }, // Giá bán thực tế lúc mua (đã trừ khuyến mãi SP nếu có)

        // Thông tin biến thể (nếu có)
        model_name: { type: String }, // VD: "Màu Đỏ, Size L"
        model_id: { type: String }, // ID của biến thể trong Product.models
      },
    ],

    // --- 3. ĐỊA CHỈ GIAO HÀNG ---
    // Copy từ Account address sang
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true }, // Số nhà, tên đường
      city: { type: String, required: true },
      country: { type: String, required: true, default: "Việt Nam" },
      phone: { type: String, required: true },
    },

    // --- 4. THANH TOÁN ---
    paymentMethod: {
      type: String,
      enum: ["COD", "VNPAY", "MOMO"],
      default: "COD",
      required: true,
    },
    // Kết quả thanh toán (Dành cho thanh toán Online sau này)
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },

    // --- 5. CHI PHÍ ---
    itemsPrice: { type: Number, required: true, default: 0.0 }, // Tổng tiền hàng
    shippingPrice: { type: Number, required: true, default: 0.0 }, // Phí vận chuyển
    taxPrice: { type: Number, required: true, default: 0.0 }, // Thuế (nếu có)
    totalPrice: { type: Number, required: true, default: 0.0 }, // Tổng thanh toán (Hàng + Ship + Thuế - Voucher)

    // --- 6. TRẠNG THÁI ĐƠN HÀNG ---
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },

    // Quy trình: PENDING -> CONFIRMED -> SHIPPING -> DELIVERED -> COMPLETED (hoặc CANCELLED/RETURNED)
    orderStatus: {
      type: String,
      enum: [
        "PENDING", // Chờ xác nhận
        "CONFIRMED", // Shop đã xác nhận (Đang chuẩn bị hàng)
        "SHIPPING", // Đang giao hàng
        "DELIVERED", // Đã giao thành công (Khách đã nhận)
        "COMPLETED", // Hoàn thành (Hết thời hạn đổi trả/Khiếu nại)
        "CANCELLED", // Đã hủy
        "RETURNED", // Trả hàng/Hoàn tiền
      ],
      default: "PENDING",
    },

    // --- 7. THEO DÕI VẬN CHUYỂN (LOGS) ---
    trackingNumber: { type: String }, // Mã vận đơn (VD: GHN...)
    trackingLogs: [
      {
        status: { type: String }, // VD: "Đã lấy hàng", "Đến kho SOC"
        location: { type: String },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],

    // Mốc thời gian quan trọng
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;