import asyncHandler from "express-async-handler";
import Attribute from "../../models/attributeModel.js";
import Category from "../../models/categoryModel.js";
import mongoose from "mongoose";

const adminCreateAttribute = asyncHandler(async (req, res) => {
  const { name, label, input_type, options } = req.body;

  const attributeExists = await Attribute.findOne({ name });
  if (attributeExists) {
    res.status(400);
    throw new Error("Tên thuộc tính đã tồn tại");
  }
  const attribute = await Attribute.create({
    name,
    label,
    input_type,
    options:
      input_type === "select" || input_type === "multiselect" ? options : [],
  });
  res.status(201).json({
    success: true,
    message: "Tạo thuộc tính thành công!",
    data: attribute,
  });
});

const adminGetAttributes = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const searchQuery = req.query.search || "";
  const inputTypeFilter = req.query.input_type || "";

  const skip = (page - 1) * limit;
  const filterConditions = {};

  if (searchQuery) {
    filterConditions.$or = [
      { name: { $regex: searchQuery, $options: "i" } },
      { label: { $regex: searchQuery, $options: "i" } },
    ];
  }

  if (inputTypeFilter) {
    filterConditions.input_type = inputTypeFilter;
  }
  const attributes = await Attribute.find(filterConditions)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalAttributes = await Attribute.countDocuments(filterConditions);

  res.status(200).json({
    success: true,
    message: "Lấy danh sách thuộc tính thành công!",
    data: attributes,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalAttributes / limit),
      totalItems: totalAttributes,
    },
  });
});

const getAttributesForCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    res.status(400);
    throw new Error("ID danh mục không hợp lệ.");
  }

  const category = await Category.findById(categoryId).populate({
    path: "attributes",
    select: "name label input_type options",
  });

  if (!category) {
    res.status(404);
    throw new Error("Không tìm thấy danh mục.");
  }

  res.status(200).json({
    success: true,
    message: "Lấy thuộc tính theo danh mục thành công!",
    data: category.attributes || [],
  });
});

export const adminAttributeController = {
  adminCreateAttribute,
  adminGetAttributes,
  getAttributesForCategory,
};
