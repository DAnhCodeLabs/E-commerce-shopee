import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Product from "../../models/productModel.js";

const adminGetProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const sortQuery = req.query.sort || "createdAt_desc";
  const [sortField, sortOrder] = sortQuery.split("_");
  const sortOptions = {};
  sortOptions[sortField] = sortOrder === "asc" ? 1 : -1;

  const { search, isActive, category, shop, has_model } = req.query;
  const matchQuery = {};

  if (search) {
    const searchRegex = { $regex: search, $options: "i" };
    matchQuery["$or"] = [
      { name: searchRegex },
      { "shopInfo.shop.shopName": searchRegex },
    ];
  }

  if (isActive !== undefined) {
    matchQuery.isActive = isActive === "true";
  }

  if (category && mongoose.Types.ObjectId.isValid(category)) {
    matchQuery.category_id = new mongoose.Types.ObjectId(category);
  }

  if (shop && mongoose.Types.ObjectId.isValid(shop)) {
    matchQuery.shop_id = new mongoose.Types.ObjectId(shop);
  }

  if (has_model !== undefined) {
    matchQuery.has_model = has_model === "true";
  }

  const aggregationPipeline = [
    {
      $lookup: {
        from: "accounts",
        localField: "shop_id",
        foreignField: "_id",
        as: "shopInfo",
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "category_id",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    {
      $unwind: { path: "$shopInfo", preserveNullAndEmptyArrays: true },
    },
    {
      $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true },
    },
    {
      $match: matchQuery,
    },
    {
      $addFields: {
        totalStock: {
          $cond: {
            if: "$has_model",
            then: { $sum: "$models.stock" },
            else: "$stock",
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        price: 1,
        sale_price: 1,
        discount_percentage: 1,
        totalStock: 1,
        has_model: 1,
        sellerStatus: 1,
        isActive: 1,
        createdAt: 1,
        shopName: "$shopInfo.shop.shopName",
        categoryName: "$categoryInfo.display_name",
        ...(sortField !== "createdAt" && sortOptions),
      },
    },
    {
      $sort: sortOptions,
    },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        paginationInfo: [{ $count: "totalItems" }],
      },
    },
  ];

  const result = await Product.aggregate(aggregationPipeline);
  const data = result[0].data;
  const totalItems = result[0].paginationInfo[0]
    ? result[0].paginationInfo[0].totalItems
    : 0;
  const totalPages = Math.ceil(totalItems / limit);

  res.status(200).json({
    success: true,
    message: "Lấy danh sách sản phẩm thành công!",
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      limit,
    },
  });
});

const adminGetProductDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("ID sản phẩm không hợp lệ.");
  }
  const product = await Product.findById(id)
    .populate({
      path: "category_id",
      select: "display_name",
    })
    .populate({
      path: "shop_id",
      select: "username email avatar shop",
    })
    .populate({
      path: "attributes.attribute_id",
      select: "label name input_type options",
    });

  if (product) {
    res.status(200).json({
      success: true,
      data: product,
    });
  } else {
    res.status(404);
    throw new Error("Không tìm thấy sản phẩm.");
  }
});

const adminToggleProductModeration = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("ID sản phẩm không hợp lệ.");
  }
  const product = await Product.findById(id);

  if (!product) {
    res.status(404);
    throw new Error("Không tìm thấy sản phẩm.");
  }

  product.isActive = !product.isActive;

  const updatedProduct = await product.save();

  res.status(200).json({
    success: true,
    message: `Đã ${updatedProduct.isActive ? "Mở khóa" : "Khóa"} sản phẩm!`,
    data: updatedProduct,
  });
});

export const adminProductController = {
  adminGetProducts,
  adminGetProductDetails,
  adminToggleProductModeration,
};
