import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Product from "../../models/productModel.js";
import { deleteFromCloudinary } from "../../config/cloudinary.js";
import Category from "../../models/categoryModel.js";
import Account from "../../models/accountModel.js"; 
import {
  calculateSalePrice,
  findOrphanedImages,
} from "../../utils/helperProduct.js";

const sellerCreateProduct = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;
  const sellerAccount = await Account.findById(sellerId);

  if (!sellerAccount || sellerAccount.role !== "seller") {
    res.status(403);
    throw new Error("Tài khoản không phải là người bán.");
  }

  if (
    !sellerAccount.shop ||
    sellerAccount.shop.verificationStatus !== "approved" ||
    !sellerAccount.shop.isActive
  ) {
    res.status(403);
    throw new Error(
      "Cửa hàng của bạn chưa được duyệt hoặc đang bị khóa. Không thể đăng sản phẩm."
    );
  }

  const {
    name,
    description,
    category_id,
    has_model,
    price,
    stock,
    discount_percentage,
    attributes,
    tier_variations,
    models,
    logistic_info,
    pre_order,
    video_info_list,
    tags,
    status,
    ...otherFields
  } = req.body;

  if (!name || !description || !category_id) {
    res.status(400);
    throw new Error("Vui lòng cung cấp Tên, Mô tả, và Danh mục sản phẩm.");
  }

  const categoryExists = await Category.findById(category_id);
  if (!categoryExists) {
    res.status(404);
    throw new Error("Danh mục không tồn tại.");
  }

  let images = [];
  if (req.mainImages && req.mainImages.length > 0) {
    images = req.mainImages;
  } else {
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => file.path);
    } else if (req.file) {
      images = [req.file.path];
    }
  }

  if (images.length === 0) {
    res.status(400);
    throw new Error("Sản phẩm phải có ít nhất 1 hình ảnh.");
  }

  const productData = {
    ...otherFields,
    name,
    description,
    category_id,
    images: images,
    shop_id: sellerId,
    sellerStatus: status || "DRAFT",
  };

  try {
    if (attributes) productData.attributes = JSON.parse(attributes);
    if (tags) productData.tags = JSON.parse(tags);
    if (video_info_list)
      productData.video_info_list = JSON.parse(video_info_list);
    if (logistic_info) productData.logistic_info = JSON.parse(logistic_info);
    if (pre_order) productData.pre_order = JSON.parse(pre_order);
  } catch (error) {
    res.status(400);
    throw new Error(`Dữ liệu JSON không hợp lệ: ${error.message}`);
  }

  const isVariantProduct = has_model === "true" || has_model === true;
  productData.has_model = isVariantProduct;

  if (isVariantProduct) {
    if (!models || !tier_variations) {
      res.status(400);
      throw new Error(
        "Sản phẩm có biến thể yêu cầu 'models' và 'tier_variations'."
      );
    }

    let parsedModels = JSON.parse(models);
    let parsedTierVariations = JSON.parse(tier_variations);

    if (!Array.isArray(parsedModels) || parsedModels.length === 0) {
      res.status(400);
      throw new Error("'models' phải là một mảng và không được rỗng.");
    }

    if (
      !Array.isArray(parsedTierVariations) ||
      parsedTierVariations.length === 0
    ) {
      res.status(400);
      throw new Error("'tier_variations' phải là một mảng và không được rỗng.");
    }

    const modelsWithSalePrice = parsedModels.map((model) => {
      const modelPrice = Number(model.price);
      const modelPercent = Number(model.discount_percentage) || 0;

      return {
        ...model,
        price: modelPrice,
        discount_percentage: modelPercent,
        sale_price: calculateSalePrice(modelPrice, modelPercent),
        stock: Number(model.stock),
      };
    });

    parsedTierVariations.forEach((tier, tierIdx) => {
      if (tier.images && Array.isArray(tier.images)) {
        tier.images.forEach((imgUrl, optIdx) => {
          if (imgUrl && imgUrl.startsWith("TEMP_")) {
            const fieldKey = `variant_image_${tierIdx}_${optIdx}`;
            const realUrl = req.variantImageUrls?.[fieldKey];
            tier.images[optIdx] = realUrl || "";
          }
        });
      }
    });

    productData.models = modelsWithSalePrice;
    productData.tier_variations = parsedTierVariations;
    productData.price = Math.min(...modelsWithSalePrice.map((m) => m.price));
    productData.sale_price = Math.min(
      ...modelsWithSalePrice.map((m) => m.sale_price)
    );
    productData.stock = 0;
    productData.discount_percentage = 0;
  } else {
    if (price === undefined || stock === undefined) {
      res.status(400);
      throw new Error(
        "Sản phẩm không có biến thể bắt buộc phải có 'price' và 'stock'."
      );
    }
    const originalPrice = Number(price);
    const percent = Number(discount_percentage) || 0;

    productData.price = originalPrice;
    productData.stock = Number(stock);
    productData.discount_percentage = percent;
    productData.sale_price = calculateSalePrice(originalPrice, percent);
    productData.models = [];
    productData.tier_variations = [];
  }

  const newProduct = new Product(productData);
  newProduct._user = sellerAccount;
  const createdProduct = await newProduct.save();

  sellerAccount.shop.productsCount =
    (sellerAccount.shop.productsCount || 0) + 1;
  await sellerAccount.save();

  res.status(201).json({
    success: true,
    message: "Tạo sản phẩm mới thành công!",
    data: createdProduct,
  });
});

// ĐÃ ĐỔI TÊN: sellerGetMyProducts -> sellerGetProducts
const sellerGetProducts = asyncHandler(async (req, res) => {
  const sellerShopId = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const sortQuery = req.query.sort || "createdAt_desc";
  const [sortField, sortOrder] = sortQuery.split("_");
  const sortOptions = { [sortField]: sortOrder === "asc" ? 1 : -1 };

  const { search, sellerStatus, isActive, category, has_model } = req.query;
  const baseMatchQuery = {
    shop_id: new mongoose.Types.ObjectId(sellerShopId),
  };
  const filterQuery = {};

  if (search) {
    const searchRegex = { $regex: search, $options: "i" };
    filterQuery["$or"] = [{ name: searchRegex }];
  }

  if (sellerStatus) filterQuery.sellerStatus = sellerStatus;

  if (isActive !== undefined) filterQuery.isActive = isActive === "true";
  if (category && mongoose.Types.ObjectId.isValid(category)) {
    filterQuery.category_id = new mongoose.Types.ObjectId(category);
  }

  if (has_model !== undefined) filterQuery.has_model = has_model === "true";

  const aggregationPipeline = [
    { $match: baseMatchQuery },
    { $match: filterQuery },
    {
      $lookup: {
        from: "categories",
        localField: "category_id",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
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
        categoryName: "$categoryInfo.display_name",
        ...(sortField !== "createdAt" && sortOptions),
      },
    },
    { $sort: sortOptions },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        paginationInfo: [{ $count: "totalItems" }],
      },
    },
  ];

  const result = await Product.aggregate(aggregationPipeline);
  const data = result[0].data;
  const totalItems = result[0].paginationInfo[0]?.totalItems || 0;
  const totalPages = Math.ceil(totalItems / limit);

  res.status(200).json({
    success: true,
    message: "Lấy danh sách sản phẩm (Seller) thành công!",
    data,
    pagination: { currentPage: page, totalPages, totalItems, limit },
  });
});

const sellerGetProductDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const sellerShopId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("ID sản phẩm không hợp lệ.");
  }
  const product = await Product.findOne({
    _id: id,
    shop_id: sellerShopId,
  })
    .populate({
      path: "category_id",
      select: "display_name",
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

const sellerUpdateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const sellerShopId = req.user._id;
  const product = await Product.findOne({
    _id: id,
    shop_id: sellerShopId,
  });

  if (!product) {
    res.status(404);
    throw new Error("Không tìm thấy sản phẩm hoặc bạn không có quyền sửa.");
  }
  product._user = req.user;

  const newMainImageUrls = req.mainImages || [];
  const newVariantImageUrls = req.variantImageUrls || {};
  let newMainImageCounter = 0;

  const {
    name,
    description,
    category_id,
    has_model,
    price,
    stock,
    discount_percentage,
    attributes,
    tier_variations,
    models,
    logistic_info,
    pre_order,
    video_info_list,
    tags,
    status,
    images,
    ...otherFields
  } = req.body;

  const productData = {
    ...otherFields,
    name,
    description,
    category_id,
    sellerStatus: status || "DRAFT",
  };

  try {
    let parsedImages = JSON.parse(images || "[]");
    productData.images = parsedImages
      .map((img) => {
        if (img && img.startsWith("http")) return img;
        if (img && img.startsWith("TEMP_")) {
          const url = newMainImageUrls[newMainImageCounter];
          if (url) {
            newMainImageCounter++;
            return url;
          }
        }
        return null;
      })
      .filter(Boolean);

    if (attributes) productData.attributes = JSON.parse(attributes);
    if (tags) productData.tags = JSON.parse(tags);
    if (video_info_list)
      productData.video_info_list = JSON.parse(video_info_list);
    if (logistic_info) productData.logistic_info = JSON.parse(logistic_info);
    if (pre_order) productData.pre_order = JSON.parse(pre_order);

    const isVariantProduct = has_model === "true" || has_model === true;
    productData.has_model = isVariantProduct;

    if (isVariantProduct) {
      if (!models || !tier_variations) {
        throw new Error(
          "Sản phẩm có biến thể yêu cầu 'models' và 'tier_variations'."
        );
      }

      let parsedModels = JSON.parse(models);
      let parsedTiers = JSON.parse(tier_variations);

      parsedTiers.forEach((tier) => {
        if (tier.images && Array.isArray(tier.images)) {
          tier.images = tier.images
            .map((imgUrl) => {
              if (imgUrl && imgUrl.startsWith("http")) return imgUrl;
              if (imgUrl && imgUrl.startsWith("TEMP_")) {
                return newVariantImageUrls[imgUrl] || null;
              }
              return null;
            })
            .filter(Boolean);
        }
      });
      productData.tier_variations = parsedTiers;

      const modelsWithSalePrice = parsedModels.map((model) => {
        const modelPrice = Number(model.price);
        const modelPercent = Number(model.discount_percentage) || 0;
        return {
          ...model,
          price: modelPrice,
          discount_percentage: modelPercent,
          sale_price: calculateSalePrice(modelPrice, modelPercent),
          stock: Number(model.stock),
          model_sku: model.model_sku || "",
        };
      });
      productData.models = modelsWithSalePrice;

      productData.price = Math.min(...modelsWithSalePrice.map((m) => m.price));
      productData.sale_price = Math.min(
        ...modelsWithSalePrice.map((m) => m.sale_price)
      );
      productData.stock = 0;
      productData.discount_percentage = 0;
    } else {
      if (price === undefined || stock === undefined) {
        throw new Error(
          "Sản phẩm không có biến thể bắt buộc phải có 'price' và 'stock'."
        );
      }
      const originalPrice = Number(price);
      const percent = Number(discount_percentage) || 0;

      productData.price = originalPrice;
      productData.stock = Number(stock);
      productData.discount_percentage = percent;
      productData.sale_price = calculateSalePrice(originalPrice, percent);

      productData.models = [];
      productData.tier_variations = [];
    }
  } catch (error) {
    res.status(400);
    throw new Error(`Dữ liệu JSON không hợp lệ: ${error.message}`);
  }

  const orphanedUrls = findOrphanedImages(product, productData);
  if (orphanedUrls.length > 0) {
    Promise.all(orphanedUrls.map((url) => deleteFromCloudinary(url))).catch(
      (err) => console.error("Lỗi khi dọn dẹp ảnh Cloudinary:", err)
    );
  }

  delete productData.shop_id;
  delete productData.item_rating;
  delete productData.historical_sold;
  delete productData.liked_count;
  delete productData.slug;
  delete productData.moderationStatus;
  delete productData._id;

  Object.assign(product, productData);
  product.updatedAt = Date.now();

  const updatedProduct = await product.save();

  res.status(200).json({
    success: true,
    message: "Cập nhật sản phẩm thành công!",
    data: updatedProduct,
  });
});

const sellerDeleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const sellerShopId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("ID sản phẩm không hợp lệ.");
  }

  const productToDelete = await Product.findOneAndDelete({
    _id: id,
    shop_id: sellerShopId,
  });

  if (!productToDelete) {
    res.status(404);
    throw new Error("Không tìm thấy sản phẩm hoặc bạn không có quyền xóa.");
  }

  const urlsToDelete = [];
  if (productToDelete.images && productToDelete.images.length > 0) {
    urlsToDelete.push(...productToDelete.images);
  }
  if (
    productToDelete.tier_variations &&
    productToDelete.tier_variations.length > 0
  ) {
    productToDelete.tier_variations.forEach((tier) => {
      if (tier.images && tier.images.length > 0) {
        urlsToDelete.push(...tier.images.filter((url) => url));
      }
    });
  }

  if (urlsToDelete.length > 0) {
    Promise.all(urlsToDelete.map((url) => deleteFromCloudinary(url)))
      .then(() => {
        console.log(
          `Đã gửi yêu cầu xóa ${urlsToDelete.length} ảnh từ Cloudinary cho sản phẩm ${id}.`
        );
      })
      .catch((err) => {
        console.error(
          `Lỗi khi dọn dẹp ảnh Cloudinary cho sản phẩm ${id}:`,
          err
        );
      });
  }

  res.status(200).json({
    success: true,
    message: "Xóa sản phẩm thành công!",
  });
});

export const sellerProductController = {
  sellerCreateProduct,
  sellerGetProducts,
  sellerGetProductDetails,
  sellerUpdateProduct,
  sellerDeleteProduct,
};
