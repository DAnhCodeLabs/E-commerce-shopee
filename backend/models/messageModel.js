import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
    text: { type: String },

    // Loại tin nhắn: text thường, ảnh, hoặc thẻ sản phẩm/đơn hàng
    type: {
      type: String,
      enum: ["text", "image", "product", "order"],
      default: "text",
    },

    // Lưu thông tin snapshot nếu gửi thẻ Sản phẩm/Đơn hàng
    productData: {
      productId: String,
      name: String,
      image: String,
      price: Number,
    },
    orderData: {
      orderId: String,
      status: String,
      total: Number,
    },

    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
