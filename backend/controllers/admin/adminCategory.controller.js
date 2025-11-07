import asyncHandler from "express-async-handler";
import Category from "../../models/categoryModel.js";
import mongoose from "mongoose";
import { deleteFromCloudinary } from "../../config/cloudinary.js";

const adminCreateCategory = asyncHandler(async (req, res) => {
  const { display_name, sort_order, attributeIds } = req.body;

  if (!display_name) {
    res.status(400);
    throw new Error("Vui lòng cung cấp 'display_name' cho danh mục.");
  }

  if (!req.file) {
    res.status(400);
    throw new Error("Danh mục bắt buộc phải có hình ảnh.");
  }

  const newCategoryData = {
    display_name,
    sort_order: sort_order || 0,
    image: req.file.path,
  };

  if (attributeIds) {
    try {
      newCategoryData.attributes = JSON.parse(attributeIds);
    } catch (e) {
      res.status(400);
      throw new Error("Định dạng attributeIds không hợp lệ.");
    }
  }

  const newCategory = await Category.create(newCategoryData);

  res.status(201).json({
    success: true,
    message: "Tạo danh mục thành công!",
    data: newCategory,
  });
});

const adminGetCategories = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const searchQuery = req.query.search || "";
  const isActiveFilter = req.query.is_active;

  const skip = (page - 1) * limit;

  const matchConditions = {};

  if (searchQuery) {
    matchConditions.display_name = { $regex: searchQuery, $options: "i" };
  }

  if (isActiveFilter) {
    matchConditions.is_active = isActiveFilter === "true";
  }

  const categories = await Category.find(matchConditions)
    .sort({ sort_order: 1, created_at: -1 })
    .skip(skip)
    .limit(limit)
    .select("_id display_name image sort_order is_active created_at");

  const totalCategories = await Category.countDocuments(matchConditions);

  res.status(200).json({
    success: true,
    message: "Lấy danh sách danh mục thành công!",
    data: categories,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCategories / limit),
      totalItems: totalCategories,
    },
  });
});

const adminDeleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("ID danh mục không hợp lệ.");
  }

  const categoryToDelete = await Category.findById(id);

  if (!categoryToDelete) {
    res.status(404);
    throw new Error("Không tìm thấy danh mục để xóa.");
  }

  if (categoryToDelete.image) {
    await deleteFromCloudinary(categoryToDelete.image);
  }

  await Category.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Xóa danh mục thành công!",
  });
});

const adminToggleCategoryStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("ID danh mục không hợp lệ.");
  }

  const category = await Category.findById(id);

  if (!category) {
    res.status(404);
    throw new Error("Không tìm thấy danh mục.");
  }

  category.is_active = !category.is_active;
  await category.save();

  const statusMessage = category.is_active ? "mở khóa" : "khóa";

  res.status(200).json({
    success: true,
    message: `Đã ${statusMessage} danh mục '${category.display_name}' thành công.`,
    data: category,
  });
});

export const adminCategoryController = {
  adminCreateCategory,
  adminGetCategories,
  adminDeleteCategory,
  adminToggleCategoryStatus,
};
