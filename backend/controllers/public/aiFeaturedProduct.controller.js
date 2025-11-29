import asyncHandler from "express-async-handler";
import AiFeaturedProduct from "../../models/aiFeaturedProductModel.js";

const getAiFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  const aggregationPipeline = [
    { $sort: { sort_order: 1 } },

    {
      $lookup: {
        from: "products",
        localField: "product_id",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    {
      $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: false },
    },

    {
      $match: {
        "productInfo.isActive": true,
        "productInfo.sellerStatus": "NORMAL",
      },
    },

    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        _id: "$productInfo._id",
        name: "$productInfo.name",
        slug: "$productInfo.slug",
        images: "$productInfo.images",
        price: "$productInfo.price",
        sale_price: "$productInfo.sale_price",
        discount_percentage: "$productInfo.discount_percentage",
        item_rating: "$productInfo.item_rating",
        historical_sold: "$productInfo.historical_sold",
        location: "$productInfo.location",
      },
    },
  ];

  const products = await AiFeaturedProduct.aggregate(aggregationPipeline);

  res.status(200).json({
    success: true,
    message: "Lấy danh sách sản phẩm nổi bật (AI) thành công!",
    data: products,
    pagination: {
      currentPage: page,
      limit: limit,
    },
  });
});

export const aiFeaturedProductController = {
  getAiFeaturedProducts,
};
