import asyncHandler from "express-async-handler";
import Review from "../../models/reviewModel.js";
import Product from "../../models/productModel.js";
import Order from "../../models/orderModel.js";

/**
 * @desc    Kiểm tra xem User có quyền đánh giá sản phẩm không
 * @route   GET /api/reviews/check-eligibility
 * @access  Private (User)
 */
const checkReviewEligibility = asyncHandler(async (req, res) => {
  const { product_id } = req.query;
  const user_id = req.user._id;

  if (!product_id) {
    res.status(400);
    throw new Error("Thiếu Product ID");
  }

  // 1. Kiểm tra: Đã đánh giá chưa? (Tránh spam)
  const existingReview = await Review.findOne({
    user_id: user_id,
    product_id: product_id,
  });

  if (existingReview) {
    return res.status(200).json({
      success: true,
      can_review: false,
      message: "Bạn đã đánh giá sản phẩm này rồi.",
    });
  }

  // 2. Kiểm tra: Đã mua và Nhận hàng chưa? (Logic Verified Purchase)
  const hasPurchased = await Order.findOne({
    user: user_id,
    "orderItems.product": product_id, // Tìm trong mảng orderItems xem có sp này không
    // Chỉ cho phép khi trạng thái là ĐÃ GIAO hoặc HOÀN THÀNH
    orderStatus: { $in: ["DELIVERED", "COMPLETED"] },
  });

  if (!hasPurchased) {
    return res.status(200).json({
      success: true,
      can_review: false,
      message: "Bạn cần mua và nhận hàng thành công để đánh giá sản phẩm này.",
    });
  }

  // Nếu qua được 2 cửa ải trên -> Cho phép
  res.status(200).json({
    success: true,
    can_review: true,
    message: "Bạn có thể đánh giá sản phẩm này.",
  });
});

/**
 * @desc    Tạo đánh giá mới
 * @route   POST /api/reviews
 * @access  Private (User)
 */
const createReview = asyncHandler(async (req, res) => {
  const { product_id, shop_id, rating, comment } = req.body;
  const user_id = req.user._id;

  // Xử lý ảnh từ Middleware upload (Nếu có)
  let images = [];
  if (req.files && req.files.length > 0) {
    images = req.files.map((file) => file.path);
  }

  // 1. Validate input
  if (!product_id || !shop_id || !rating) {
    res.status(400);
    throw new Error("Thiếu thông tin bắt buộc");
  }

  // 2. BẢO MẬT: Check lại quyền một lần nữa (Backend Check)
  // Ngăn chặn dùng Postman tấn công API
  const existingReview = await Review.findOne({ user_id, product_id });
  if (existingReview) {
    res.status(400);
    throw new Error("Bạn đã đánh giá sản phẩm này rồi");
  }

  const hasPurchased = await Order.findOne({
    user: user_id,
    "orderItems.product": product_id,
    orderStatus: { $in: ["DELIVERED", "COMPLETED"] },
  });

  if (!hasPurchased) {
    res.status(403); // Forbidden
    throw new Error("Bạn chưa mua hoặc chưa nhận hàng sản phẩm này.");
  }

  // 3. Tạo Review
  const newReview = await Review.create({
    product_id,
    user_id,
    shop_id,
    rating: Number(rating),
    comment,
    images: images,
    status: "APPROVED",
  });

  // 4. Tính toán lại Rating cho Product (Aggregation realtime)
  const product = await Product.findById(product_id);
  if (product) {
    const currentTotalReviews = product.item_rating.total_reviews || 0;
    const currentRatingStar = product.item_rating.rating_star || 0;
    const currentDistribution = product.item_rating.ratings_distribution || {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    // Công thức tính trung bình mới
    const newTotalReviews = currentTotalReviews + 1;
    const newRatingStar =
      (currentRatingStar * currentTotalReviews + Number(rating)) /
      newTotalReviews;

    // Update phân bố
    const starKey = Math.round(Number(rating));
    if (currentDistribution[starKey] !== undefined) {
      currentDistribution[starKey] += 1;
    }

    product.item_rating.total_reviews = newTotalReviews;
    product.item_rating.rating_star = parseFloat(newRatingStar.toFixed(1));
    product.item_rating.ratings_distribution = currentDistribution;

    await product.save();
  }

  res.status(201).json({
    success: true,
    message: "Đánh giá sản phẩm thành công!",
    data: newReview,
  });
});

/**
 * @desc    Lấy danh sách đánh giá (Public)
 * @route   GET /api/public/reviews/:productId
 */
const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  const { star, has_media } = req.query;
  const filter = {
    product_id: productId,
    status: "APPROVED",
  };

  if (star) filter.rating = parseInt(star);
  if (has_media === "true") filter.images = { $not: { $size: 0 } };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate("user_id", "username avatar fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments(filter),
  ]);

  // Che tên user
  const secureReviews = reviews.map((review) => {
    const user = review.user_id;
    let secureName = "Người dùng ẩn danh";
    if (user && user.username) {
      const name = user.username;
      secureName =
        name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : name;
    }
    return {
      ...review,
      user_name: secureName,
      user_avatar: user?.avatar || "",
    };
  });

  res.status(200).json({
    success: true,
    data: secureReviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const reviewController = {
  checkReviewEligibility,
  createReview,
  getProductReviews,
};
