import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  shop_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true, // Cần thiết để gom nhóm đơn hàng theo Shop
  },
  // Nếu sản phẩm có biến thể (Màu/Size), lưu ID của biến thể đó
  model_id: {
    type: String, // ID của sub-document trong mảng 'models' của Product
    default: null,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  is_checked: {
    type: Boolean,
    default: false, // Để phục vụ chức năng "Chọn sản phẩm để thanh toán"
  },
  added_at: {
    type: Date,
    default: Date.now,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      unique: true, // Mỗi User chỉ có 1 giỏ hàng duy nhất
      index: true,
    },
    cart_items: [cartItemSchema],
  },
  { timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
