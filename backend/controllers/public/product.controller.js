import mongoose from "mongoose";
import Product from "../../models/productModel.js";
import asyncHandler from "express-async-handler";
import Account from "../../models/accountModel.js";

const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  // 1. Validation
  if (!slug || typeof slug !== "string" || slug.trim() === "") {
    res.status(400);
    throw new Error("Slug sản phẩm không hợp lệ");
  }

  try {
    // 2. Query với điều kiện đầy đủ
    const product = await Product.findOne({
      slug: slug.trim(),
      isActive: true,
      sellerStatus: "NORMAL",
    })
      .populate("category_id", "display_name image")
      .populate({
        path: "shop_id",
        select:
          "username avatar shop.shopName shop.addressShop shop.shopLogo shop.isActive shop.verificationStatus shop.joinDate shop.productsCount",
        match: {
          "shop.isActive": true,
          "shop.verificationStatus": "approved",
        },
      })
      .populate("attributes.attribute_id", "label name input_type options")
      .lean();

    // 3. Kiểm tra kết quả
    if (!product) {
      res.status(404);
      throw new Error("Không tìm thấy sản phẩm");
    }

    // 4. Kiểm tra shop có active không
    if (!product.shop_id) {
      res.status(404);
      throw new Error("Shop không tồn tại hoặc đã bị vô hiệu hóa");
    }

    // 5. Tính toán thông tin bổ sung
    const totalStock = product.has_model
      ? product.models.reduce((sum, model) => sum + (model.stock || 0), 0)
      : product.stock;

    // 6. Format response data
    const responseData = {
      ...product,
      totalStock,
      // Có thể thêm các trường tính toán khác
    };

    // 7. Log cho monitoring (tuỳ chọn)
    console.log(`Product accessed: ${product.name} (${product._id})`);

    res.status(200).json({
      success: true,
      message: "Lấy thông tin sản phẩm thành công",
      data: responseData,
    });
  } catch (error) {
    // 8. Error handling chi tiết
    if (error.name === "CastError") {
      res.status(400);
      throw new Error("Dữ liệu không hợp lệ");
    }

    // Log lỗi cho debugging
    console.error("Error in getProductBySlug:", error);
    throw error;
  }
});

const getShopInfo = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 1. Validate ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID Shop không hợp lệ" });
  }

  // 2. Query Song Song: Lấy Account và Thống kê Product
  const [shopAccount, productStats] = await Promise.all([
    // Query 1: Lấy Account theo ID (ID gốc 691fdf08...)
    Account.findById(id).select(
      "username email avatar shop createdAt lastLogin role"
    ),

    // Query 2: Tính toán số liệu thực tế từ bảng Product
    Product.aggregate([
      {
        $match: {
          shop_id: new mongoose.Types.ObjectId(id),
          isActive: true, //
          sellerStatus: "NORMAL", //
        },
      },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalReviews: { $sum: "$item_rating.total_reviews" }, //
          avgRating: { $avg: "$item_rating.rating_star" }, //
        },
      },
    ]),
  ]);

  // 3. Kiểm tra sự tồn tại
  if (!shopAccount) {
    res.status(404);
    throw new Error("Không tìm thấy Shop này.");
  }

  // Lấy dữ liệu thống kê (nếu chưa có sản phẩm thì mặc định 0)
  const stats = productStats[0] || {
    totalProducts: 0,
    totalReviews: 0,
    avgRating: 0,
  };

  // 4. Xử lý Object Shop (Fallback an toàn)
  // Dựa trên JSON của bạn, shop là một object con
  const shopData = shopAccount.shop || {};

  // --- XỬ LÝ LOGIC HIỂN THỊ ---

  // A. Avatar: Ưu tiên shopLogo, nếu không có thì dùng avatar User, cuối cùng là rỗng
  const displayAvatar = shopData.shopLogo || shopAccount.avatar || "";

  // B. Tên Shop: Ưu tiên shopName, nếu không có dùng fullName hoặc username
  const displayName =
    shopData.shopName || shopAccount.fullName || shopAccount.username;

  // C. Thời gian tham gia: Ưu tiên shop.joinDate, nếu không có dùng account.createdAt
  const joinDateSource = shopData.joinDate
    ? new Date(shopData.joinDate)
    : new Date(shopAccount.createdAt);
  const now = new Date();
  const diffTime = Math.abs(now - joinDateSource);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let joinText = "";
  if (diffDays > 365) joinText = `${Math.floor(diffDays / 365)} năm trước`;
  else if (diffDays > 30) joinText = `${Math.floor(diffDays / 30)} tháng trước`;
  else joinText = `${diffDays} ngày trước`;

  // D. Trạng thái Online (Dựa trên lastLogin trong JSON của bạn)
  const lastLogin = shopAccount.lastLogin
    ? new Date(shopAccount.lastLogin)
    : new Date();
  const diffMinutes = Math.floor((now - lastLogin) / 60000);

  let onlineStatus = "Offline";
  if (diffMinutes < 5) onlineStatus = "Đang hoạt động";
  else if (diffMinutes < 60) onlineStatus = `Online ${diffMinutes} phút trước`;
  else if (diffMinutes < 1440)
    onlineStatus = `Online ${Math.floor(diffMinutes / 60)} giờ trước`;
  else onlineStatus = `Online ${Math.floor(diffMinutes / 1440)} ngày trước`;

  // 5. Trả về kết quả
  res.status(200).json({
    success: true,
    data: {
      _id: shopAccount._id, // Trả về Account ID (691fdf08...)

      shopName: displayName,
      avatar: displayAvatar,
      description: shopData.shopDescription || "",
      address: shopData.addressShop || "",

      // Số liệu thống kê từ Product Aggregation (Chính xác hơn số liệu cứng trong Account)
      totalProducts: stats.totalProducts,
      totalReviews: stats.totalReviews,
      avgRating: stats.avgRating ? stats.avgRating.toFixed(1) : "0.0",

      // Các chỉ số khác (Lấy từ Account hoặc mặc định)
      followers: shopData.followers || 0,
      responseRate: (shopData.response_rate || 100) + "%", // Nếu DB chưa có thì mặc định 100%
      responseTime: shopData.response_time || "trong vài giờ", // Nếu DB chưa có thì mặc định

      joinDate: joinText,
      onlineStatus: onlineStatus,
      isOfficial: shopData.verificationStatus === "approved", // Check tick xanh
    },
  });
});

export const productController = {
  getProductBySlug,
  getShopInfo,
};
