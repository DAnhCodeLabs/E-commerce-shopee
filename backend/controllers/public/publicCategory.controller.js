import asyncHandler from "express-async-handler";
import Product from "../../models/productModel.js";
import Category from "../../models/categoryModel.js"; 

const publicGetCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({
    is_active: true,
  })
    .sort({ sort_order: 1 })
    .lean();

  const categoriesWithProductCount = await Promise.all(
    categories.map(async (cat) => {
      const productCount = await Product.countDocuments({
        category_id: cat._id,
      });

      return {
        _id: cat._id,
        display_name: cat.display_name,
        image: cat.image,
        productCount: productCount,
      };
    })
  );

  res.status(200).json({
    success: true,
    data: categoriesWithProductCount,
  });
});

export const publicCategoryController = {
  publicGetCategories,
};
