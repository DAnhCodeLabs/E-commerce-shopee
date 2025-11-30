import asyncHandler from "express-async-handler";
import Product from "../../models/productModel.js";
import Account from "../../models/accountModel.js";

/**
 * @desc    Bật/Tắt yêu thích sản phẩm (Toggle)
 * @route   POST /api/user/wishlist/toggle
 * @access  Private (User)
 */
const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id;

  // Validate đầu vào
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Sản phẩm không tồn tại");
  }

  const user = await Account.findById(userId);

  // Kiểm tra xem đã like chưa
  const isLiked = user.wishlist.includes(productId);

  if (isLiked) {
    // TH1: Đã like -> Xóa khỏi wishlist (Unlike)
    await Account.findByIdAndUpdate(userId, {
      $pull: { wishlist: productId },
    });

    // Giảm số lượt like của sản phẩm
    await Product.findByIdAndUpdate(productId, {
      $inc: { liked_count: -1 },
    });

    res.json({ success: true, isLiked: false, message: "Đã bỏ yêu thích" });
  } else {
    // TH2: Chưa like -> Thêm vào wishlist (Like)
    await Account.findByIdAndUpdate(userId, {
      $addToSet: { wishlist: productId }, // addToSet tránh trùng lặp
    });

    // Tăng số lượt like của sản phẩm
    await Product.findByIdAndUpdate(productId, {
      $inc: { liked_count: 1 },
    });

    res.json({
      success: true,
      isLiked: true,
      message: "Đã thêm vào yêu thích",
    });
  }
});

/**
 * @desc    Lấy danh sách sản phẩm yêu thích
 * @route   GET /api/user/wishlist
 * @access  Private (User)
 */
const getWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Lấy user và populate chi tiết thông tin sản phẩm trong wishlist
  const user = await Account.findById(userId).populate({
    path: "wishlist",
    select: "name price sale_price images slug item_rating sold_count", // Chỉ lấy field cần thiết
  });

  res.json({
    success: true,
    data: user.wishlist || [],
  });
});

export const wishlistController = {
  toggleWishlist,
  getWishlist,
};
