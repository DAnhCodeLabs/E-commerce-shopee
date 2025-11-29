import asyncHandler from "express-async-handler";
import Order from "../../models/orderModel.js"; //
import Product from "../../models/productModel.js"; //
import Cart from "../../models/cartModel.js"; //

const createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems, // Danh sách items từ giỏ hàng gửi lên
    shippingAddress,
    paymentMethod,
    // shippingPrice có thể nhận từ Frontend (nếu đã tính qua API GHN)
    // hoặc tạm tính ở Backend. Tạm thời ta để backend tính hoặc mặc định.
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error("Không có sản phẩm nào trong đơn hàng");
  }

  // --- BƯỚC 1: GOM NHÓM SẢN PHẨM THEO SHOP ---
  // Mục đích: Tách 1 giỏ hàng to thành nhiều đơn hàng nhỏ cho từng Shop
  const itemsByShop = {};

  // Chúng ta cần query lại DB để lấy thông tin gốc (Giá, Shop ID, Tồn kho)
  // thay vì tin tưởng hoàn toàn dữ liệu từ Frontend gửi lên.

  // Tạo danh sách Promise để xử lý song song các item
  const processedItemsPromises = orderItems.map(async (item) => {
    const product = await Product.findById(item.product_id).select(
      "name image price sale_price stock shop_id has_model models isActive sellerStatus"
    );

    if (!product || !product.isActive || product.sellerStatus !== "NORMAL") {
      throw new Error(
        `Sản phẩm ${item.name || "nào đó"} không tồn tại hoặc ngừng kinh doanh.`
      );
    }

    // Xử lý biến thể (Variant)
    let finalPrice = product.sale_price || product.price;
    let finalStock = product.stock;
    let finalName = product.name;
    let variantName = "";
    let finalImage = product.images?.[0] || ""; // Mặc định ảnh gốc

    if (product.has_model && item.model_id) {
      const variant = product.models.find(
        (m) => m._id.toString() === item.model_id.toString()
      );
      if (!variant) {
        throw new Error(
          `Phân loại hàng của sản phẩm ${product.name} không hợp lệ.`
        );
      }

      finalPrice = variant.sale_price || variant.price;
      finalStock = variant.stock;
      variantName = variant.name; // VD: "Đỏ, L"
      // Nếu biến thể có ảnh riêng thì lấy ảnh biến thể (logic nâng cao), tạm thời lấy ảnh gốc
    }

    // KIỂM TRA TỒN KHO LẦN CUỐI
    if (finalStock < item.quantity) {
      throw new Error(
        `Sản phẩm ${product.name} (${variantName}) không đủ hàng (Còn: ${finalStock}).`
      );
    }

    // Trả về object đã chuẩn hóa dữ liệu từ DB
    return {
      product: product._id, // ID để ref
      shop: product.shop_id, // Quan trọng: ID của Shop bán
      name: finalName,
      image: item.image || product.images?.[0] || product.image || "",
      price: finalPrice,
      quantity: item.quantity,
      model_name: variantName,
      model_id: item.model_id || null,
    };
  });

  const processedItems = await Promise.all(processedItemsPromises);

  // Gom nhóm vào object itemsByShop
  processedItems.forEach((item) => {
    const shopId = item.shop.toString();
    if (!itemsByShop[shopId]) {
      itemsByShop[shopId] = [];
    }
    itemsByShop[shopId].push(item);
  });

  // --- BƯỚC 2: TẠO ĐƠN HÀNG (VÒNG LẶP QUA CÁC SHOP) ---
  const createdOrders = [];

  // Sử dụng Promise.all để tạo đơn hàng song song cho các Shop
  const orderPromises = Object.keys(itemsByShop).map(async (shopId) => {
    const shopItems = itemsByShop[shopId];

    // Tính toán tổng tiền hàng cho Shop này
    const itemsPrice = shopItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // Phí ship: Tạm thời set cứng hoặc lấy từ req.body nếu có logic tính riêng
    // Trong thực tế: Cần gọi API GHN để tính ship cho từng Shop từ kho Shop -> địa chỉ User
    const shippingPrice = 30000; // Hardcode tạm thời cho MVP
    const taxPrice = 0;
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    // 1. Tạo bản ghi Order
    const order = new Order({
      user: req.user._id,
      shop: shopId,
      orderItems: shopItems, // Mảng item đã chuẩn hóa snapshot
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      isPaid: false, // Mặc định chưa thanh toán (kể cả online cũng cần IPN confirm sau)
      orderStatus: "PENDING",
    });

    const savedOrder = await order.save();

    // 2. Trừ tồn kho (Inventory Deduction)
    // Cần lặp qua từng item trong đơn này để trừ
    for (const item of shopItems) {
      if (item.model_id) {
        // Trừ kho biến thể
        await Product.updateOne(
          { _id: item.product, "models._id": item.model_id },
          {
            $inc: {
              "models.$.stock": -item.quantity,
              // "models.$.sold": +item.quantity // Nếu có trường sold
            },
            $inc: { historical_sold: item.quantity }, // Tăng đã bán tổng
          }
        );
      } else {
        // Trừ kho sản phẩm thường
        await Product.updateOne(
          { _id: item.product },
          {
            $inc: { stock: -item.quantity, historical_sold: item.quantity },
          }
        );
      }
    }

    createdOrders.push(savedOrder);
  });

  await Promise.all(orderPromises);

  // --- BƯỚC 3: DỌN DẸP GIỎ HÀNG ---
  // Xóa những sản phẩm vừa mua khỏi giỏ hàng
  // Logic: Lọc cart_items, giữ lại những cái KHÔNG nằm trong danh sách vừa mua
  // Để đơn giản và nhanh: Xóa các item có product_id và model_id trùng khớp
  if (createdOrders.length > 0) {
    const userCart = await Cart.findOne({ user_id: req.user._id });
    if (userCart) {
      // Tạo một Set các ID item đã mua để tra cứu cho nhanh
      // Format key: "productId_modelId"
      const purchasedKeys = new Set();
      processedItems.forEach((item) => {
        const key = `${item.product.toString()}_${
          item.model_id ? item.model_id.toString() : "null"
        }`;
        purchasedKeys.add(key);
      });

      // Lọc giỏ hàng: Chỉ giữ lại item nào KHÔNG có trong purchasedKeys
      userCart.cart_items = userCart.cart_items.filter((item) => {
        const key = `${item.product_id.toString()}_${
          item.model_id ? item.model_id.toString() : "null"
        }`;
        return !purchasedKeys.has(key);
      });

      await userCart.save();
    }
  }

  res.status(201).json({
    success: true,
    message: `Đã đặt hàng thành công! (${createdOrders.length} đơn hàng được tạo)`,
    orders: createdOrders,
  });
});


const getMyOrders = asyncHandler(async (req, res) => {
  // Populate thông tin Shop để hiển thị tên Shop
  const orders = await Order.find({ user: req.user._id })
    .populate("shop", "shop.shopName shop.shopLogo")
    .sort({ createdAt: -1 }); // Mới nhất lên đầu

  res.status(200).json({
    success: true,
    data: orders,
  });
});


const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "fullName email")
    .populate("shop", "shop.shopName shop.addressShop shop.phone");

  if (!order) {
    res.status(404);
    throw new Error("Đơn hàng không tồn tại");
  }

  // Bảo mật: Chỉ người mua HOẶC người bán mới xem được đơn này
  const isOwner = order.user._id.toString() === req.user._id.toString();
  const isSeller = order.shop._id.toString() === req.user._id.toString(); // Shop là Account
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isSeller && !isAdmin) {
    res.status(403);
    throw new Error("Bạn không có quyền xem đơn hàng này");
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

const confirmReceived = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Đơn hàng không tồn tại");
  }

  // Check quyền sở hữu
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Bạn không có quyền thao tác trên đơn hàng này");
  }

  // Check luồng trạng thái
  if (order.orderStatus !== "SHIPPING") {
    res.status(400);
    throw new Error(
      "Đơn hàng chưa ở trạng thái đang giao, không thể xác nhận nhận hàng."
    );
  }

  // Cập nhật
  order.orderStatus = "DELIVERED";
  order.deliveredAt = Date.now();

  // Nếu là COD, xác nhận đã thanh toán tiền mặt lúc này
  if (order.paymentMethod === "COD") {
    order.isPaid = true;
    order.paidAt = Date.now();
  }

  const updatedOrder = await order.save();

  res.json({
    success: true,
    message: "Xác nhận nhận hàng thành công!",
    data: updatedOrder,
  });
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user._id, // Chỉ chủ đơn mới được hủy
  });

  if (!order) {
    res.status(404);
    throw new Error("Đơn hàng không tồn tại");
  }

  // Chỉ cho phép hủy khi đơn còn ở trạng thái PENDING (Chưa được Shop xác nhận)
  if (order.orderStatus !== "PENDING") {
    res.status(400);
    throw new Error(
      "Đơn hàng đã được Shop xác nhận hoặc đang giao, không thể hủy."
    );
  }

  // 1. Cập nhật trạng thái
  order.orderStatus = "CANCELLED";
  order.cancelledAt = Date.now();
  order.trackingLogs.push({
    status: "Đã hủy bởi người mua",
    timestamp: new Date(),
    note: "Khách chủ động hủy",
  });

  await order.save();

  // 2. HOÀN LẠI TỒN KHO (RESTOCK) - Logic giống bên Seller
  // Vì lúc đặt hàng đã trừ kho, giờ hủy phải cộng lại
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

  res.json({ success: true, message: "Hủy đơn hàng thành công" });
});

export const orderController = {
  createOrder,
  getMyOrders,
  getOrderById,
  confirmReceived,
  cancelOrder
};
