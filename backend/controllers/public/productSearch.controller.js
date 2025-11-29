// controllers/client/productSearchController.js
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import SearchHistory from "../../models/searchHistoryModel.js";
import Product from "../../models/productModel.js";

const getUserIdOptional = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded._id || decoded.id;
  } catch (error) {
    return null;
  }
};


export const searchProducts = asyncHandler(async (req, res) => {
  const {
    keyword,
    category_ids,
    price_min,
    price_max,
    sort,
    rating_min,
    locations,
    logistics,
    conditions
  } = req.query;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const matchQuery = {
    isActive: true,
    sellerStatus: "NORMAL",
  };

  if (keyword) {
    matchQuery.$text = { $search: keyword };
  }

  // Xử lý category_ids
  if (category_ids) {
    const categoryIdsArray = category_ids.split(",").map((id) => id.trim());
    const validCategoryIds = categoryIdsArray.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    if (validCategoryIds.length > 0) {
      matchQuery.category_id = {
        $in: validCategoryIds.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }
  }

  // Xử lý locations filter
  if (locations) {
    const locationsArray = locations.split(",").map(loc => loc.trim());
    if (locationsArray.length > 0) {
      matchQuery["location.city"] = { $in: locationsArray };
    }
  }

  // Xử lý logistics filter
  if (logistics) {
    const logisticsArray = logistics.split(",").map(log => parseInt(log.trim()));
    if (logisticsArray.length > 0) {
      matchQuery["logistic_info"] = {
        $elemMatch: {
          logistic_id: { $in: logisticsArray },
          enabled: true
        }
      };
    }
  }

  // Xử lý conditions filter
  if (conditions) {
    const conditionsArray = conditions.split(",").map(cond => cond.trim());
    if (conditionsArray.length > 0) {
      matchQuery.condition = { $in: conditionsArray };
    }
  }

  if (price_min || price_max) {
    matchQuery.price = {};
    if (price_min) matchQuery.price.$gte = Number(price_min);
    if (price_max) matchQuery.price.$lte = Number(price_max);
  }

  if (rating_min) {
    matchQuery["item_rating.rating_star"] = { $gte: Number(rating_min) };
  }

  let sortOptions = {};

  if (keyword && !sort) {
    sortOptions = { score: { $meta: "textScore" } };
  } else if (sort) {
    const [field, order] = sort.split("_");
    sortOptions[field] = order === "asc" ? 1 : -1;
  } else {
    sortOptions = { createdAt: -1 };
  }

  const projection = {
    name: 1,
    price: 1,
    sale_price: 1,
    images: 1,
    slug: 1,
    item_rating: 1,
    historical_sold: 1,
    discount_percentage: 1,
    category_id: 1,
    shop_id: 1,
    location: 1,
    condition: 1,
    logistic_info: 1
  };

  if (keyword) {
    projection.score = { $meta: "textScore" };
  }

  const [products, totalItems] = await Promise.all([
    Product.find(matchQuery)
      .select(projection)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(matchQuery),
  ]);

  const userId = getUserIdOptional(req);

  if (userId && keyword) {
    (async () => {
      try {
        await SearchHistory.create({
          user_id: userId,
          keyword: keyword,
          filters: { category_ids, price_min, price_max, locations, logistics, conditions },
          result_count: totalItems,
        });
      } catch (err) {
        console.error(
          "Lỗi lưu lịch sử tìm kiếm (không ảnh hưởng người dùng):",
          err.message
        );
      }
    })();
  }

  const totalPages = Math.ceil(totalItems / limit);

  res.status(200).json({
    success: true,
    message: "Tìm kiếm sản phẩm thành công!",
    data: products,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      limit,
      keyword,
    },
  });
});

export const productSearchController = {
  searchProducts,
};
