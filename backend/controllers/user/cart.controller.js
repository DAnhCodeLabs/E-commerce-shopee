import asyncHandler from "express-async-handler";
import Cart from "../../models/cartModel.js";
import Product from "../../models/productModel.js";


const getCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  let cart = await Cart.findOne({ user_id: userId }).populate({
    path: "cart_items.product_id",
    select:
      "name slug images price sale_price discount_percentage stock has_model models shop_id isActive sellerStatus",
    populate: {
      path: "shop_id",
      select: "shop.shopName shop.avatar", // Lấy tên Shop để hiển thị gom nhóm
    },
  });

  if (!cart) {
    // Nếu chưa có giỏ hàng, trả về rỗng thay vì lỗi
    return res.status(200).json({
      success: true,
      data: { cart_items: [] },
    });
  }

  // Lọc bỏ các sản phẩm đã bị xóa hoặc shop bị khóa (Cleanup dữ liệu rác)
  const validItems = cart.cart_items.filter((item) => {
    const product = item.product_id;
    return product && product.isActive && product.sellerStatus === "NORMAL";
  });

  // Nếu có item rác, cập nhật lại DB
  if (validItems.length !== cart.cart_items.length) {
    cart.cart_items = validItems;
    await cart.save();
  }

  res.status(200).json({
    success: true,
    data: cart,
  });
});


const addToCart = asyncHandler(async (req, res) => {
  const { product_id, model_id, quantity } = req.body;
  const userId = req.user._id;
  const qty = parseInt(quantity) || 1;

  // 1. Kiểm tra sản phẩm
  const product = await Product.findById(product_id); //
  if (!product || !product.isActive || product.sellerStatus !== "NORMAL") {
    res.status(404);
    throw new Error("Sản phẩm không tồn tại hoặc ngừng kinh doanh.");
  }

  // 2. Validate và Lấy Tồn kho
  let availableStock = 0;

  if (product.has_model) {
    if (!model_id) {
      res.status(400);
      throw new Error("Vui lòng chọn phân loại hàng (Backend Check).");
    }

    // TÌM KIẾM MODEL AN TOÀN HƠN
    // Convert hết sang String để so sánh
    const variant = product.models.find(
      (m) => m._id.toString() === String(model_id)
    );

    if (!variant) {
      console.log(
        "Debug Backend - Cannot find model:",
        model_id,
        "in product:",
        product._id
      );
      res.status(400);
      throw new Error("Phân loại hàng không hợp lệ (ID không khớp).");
    }

    availableStock = variant.stock;
  } else {
    availableStock = product.stock;
  }

  if (availableStock < qty) {
    // Sửa điều kiện: nếu mua nhiều hơn kho thì báo lỗi
    res.status(400);
    throw new Error(`Kho chỉ còn ${availableStock} sản phẩm.`);
  }

  // 3. Logic tìm và update giỏ hàng (Giữ nguyên hoặc cải thiện)
  let cart = await Cart.findOne({ user_id: userId }); //
  if (!cart) {
    cart = new Cart({ user_id: userId, cart_items: [] });
  }

  const itemIndex = cart.cart_items.findIndex((item) => {
    const isSameProduct = item.product_id.toString() === product_id;
    // So sánh model_id an toàn (xử lý null/undefined)
    const isSameModel = item.model_id
      ? item.model_id.toString() === (model_id ? String(model_id) : null)
      : model_id === null;

    return isSameProduct && isSameModel;
  });

  if (itemIndex > -1) {
    // Đã có -> Cộng dồn
    const newQuantity = cart.cart_items[itemIndex].quantity + qty;
    if (newQuantity > availableStock) {
      res.status(400);
      throw new Error(
        `Bạn đã có ${cart.cart_items[itemIndex].quantity} trong giỏ. Kho không đủ thêm ${qty}.`
      );
    }
    cart.cart_items[itemIndex].quantity = newQuantity;
  } else {
    // Chưa có -> Thêm mới
    cart.cart_items.push({
      product_id,
      shop_id: product.shop_id,
      model_id: model_id || null, // Lưu model_id nếu có
      quantity: qty,
      is_checked: true,
    });
  }

  await cart.save();

  const totalItems = cart.cart_items.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  res.status(200).json({
    success: true,
    message: "Đã thêm vào giỏ hàng thành công!",
    totalItems,
  });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { product_id, model_id, quantity } = req.body;
  const userId = req.user._id;
  const newQty = parseInt(quantity);

  if (newQty < 1) {
    res.status(400);
    throw new Error("Số lượng phải lớn hơn 0");
  }

  const cart = await Cart.findOne({ user_id: userId });
  if (!cart) {
    res.status(404);
    throw new Error("Giỏ hàng không tồn tại");
  }

  // Tìm item
  const itemIndex = cart.cart_items.findIndex((item) => {
    const isSameProduct = item.product_id.toString() === product_id;
    const isSameModel = item.model_id == model_id; // So sánh tương đối hoặc convert string
    return isSameProduct && isSameModel;
  });

  if (itemIndex === -1) {
    res.status(404);
    throw new Error("Sản phẩm không có trong giỏ hàng");
  }

  // CHECK TỒN KHO TRƯỚC KHI UPDATE
  const product = await Product.findById(product_id);
  let limitStock = 0;
  if (product.has_model && model_id) {
    const variant = product.models.find((m) => m._id.toString() === model_id);
    limitStock = variant ? variant.stock : 0;
  } else {
    limitStock = product.stock;
  }

  if (newQty > limitStock) {
    res.status(400);
    throw new Error(`Kho chỉ còn ${limitStock} sản phẩm.`);
  }

  // Update
  cart.cart_items[itemIndex].quantity = newQty;
  await cart.save();

  res.status(200).json({
    success: true,
    message: "Cập nhật giỏ hàng thành công",
    data: cart.cart_items[itemIndex],
  });
});


const removeCartItem = asyncHandler(async (req, res) => {
  const { product_id, model_id } = req.body; // Dùng req.body cho DELETE cũng được, hoặc params
  const userId = req.user._id;

  const cart = await Cart.findOne({ user_id: userId });
  if (!cart) {
    res.status(404);
    throw new Error("Giỏ hàng không tồn tại");
  }

  // Lọc bỏ item cần xóa
  cart.cart_items = cart.cart_items.filter((item) => {
    const isTarget =
      item.product_id.toString() === product_id && item.model_id == model_id; // check cả variant
    return !isTarget; // Giữ lại những cái KHÔNG phải target
  });

  await cart.save();

  // Tính lại tổng item
  const totalItems = cart.cart_items.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  res.status(200).json({
    success: true,
    message: "Đã xóa sản phẩm khỏi giỏ hàng",
    totalItems,
  });
});

export const cartController = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
};
