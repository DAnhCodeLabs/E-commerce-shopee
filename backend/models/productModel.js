import mongoose from "mongoose";
import Account from "./accountModel.js";
const ProductSchema = new mongoose.Schema(
  {
    shop_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
      validate: {
        validator: async function (value) {
          if (!value) return true;
          const account = await Account.findById(value);
          return account && account.role === "seller";
        },
        message: "Shop ID phải thuộc về tài khoản có vai trò seller",
      },
    },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    tags: [{ type: String, trim: true }],
    meta_title: { type: String, trim: true },
    meta_description: { type: String, trim: true },
    description: { type: String },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    attributes: [
      {
        attribute_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Attribute",
          required: true,
        },
        value: { type: mongoose.Schema.Types.Mixed, required: true },
      },
    ],
    images: [{ type: String }], 
    video_info_list: [
      {
        duration: { type: Number },
        video_url: { type: String },
        thumb_url: { type: String },
      },
    ],
    sellerStatus: {
      type: String,
      enum: ["NORMAL", "UNLIST", "DRAFT", "DELETED"],
      default: "DRAFT",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    sku: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    discount_percentage: { type: Number, default: 0, min: 0, max: 100 },
    sale_price: { type: Number },
    low_stock_threshold: { type: Number, default: 5 },
    has_model: { type: Boolean, default: false },
    tier_variations: [
      {
        name: { type: String },
        options: [{ type: String }],
        images: [{ type: String }],
      },
    ],
    models: [
      {
        name: { type: String },
        price: { type: Number },
        discount_percentage: { type: Number, default: 0, min: 0, max: 100 },
        sale_price: { type: Number },
        stock: { type: Number },
        model_sku: { type: String },
        tier_index: [{ type: Number }],
      },
    ],
    logistic_info: [
      {
        logistic_id: { type: Number },
        enabled: { type: Boolean },
        shipping_fee: { type: Number },
        is_free: { type: Boolean },
      },
    ],
    pre_order: {
      is_pre_order: { type: Boolean, default: false },
      days_to_ship: { type: Number },
    },
    condition: { type: String, enum: ["NEW", "USED"], default: "NEW" },
    item_rating: {
      rating_star: { type: Number, default: 0, min: 0, max: 5 },
      total_reviews: { type: Number, default: 0 },
      ratings_distribution: {
        1: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        5: { type: Number, default: 0 },
      },
    },
    historical_sold: { type: Number, default: 0 },
    liked_count: { type: Number, default: 0 },
    promotions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Promotion",
      },
    ],
  },
  { timestamps: true }
);
ProductSchema.pre("validate", function (next) {
  if (this.isModified("name") && !this.slug) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    this.slug =
      this.name
        .toString()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "") +
      "-" +
      uniqueSuffix;
  }

  if (this.isModified("name") && !this.sku) {
    const namePrefix = this.name
      .toString()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 8);
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomCode = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.sku = `${namePrefix}-${timestamp}-${randomCode}`;
  }

  if (this.has_model && this.models && this.models.length > 0) {
    const mainSkuPrefix = this.sku;

    this.models.forEach((model) => {
      if (!model.model_sku) {
        const modelNamePrefix = (model.name || "")
          .toString()
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "")
          .slice(0, 6);

        const randomSuffix = Math.random()
          .toString(36)
          .substr(2, 3)
          .toUpperCase();

        model.model_sku = `${mainSkuPrefix}-${modelNamePrefix}-${randomSuffix}`;
      }
    });
  }

  next();
});
ProductSchema.pre("save", async function (next) {
  if (this.isNew) {
    const user = this._user;

    if (!user) {
      return next(new Error("Yêu cầu thông tin người dùng để tạo sản phẩm"));
    }

    if (user.role === "seller") {
      this.shop_id = user._id;
      return next();
    }

    if (user.role === "admin") {
      return next(
        new Error("Quản trị viên (Admin) không được phép tạo sản phẩm mới")
      );
    }

    return next(new Error("Chỉ người bán (Seller) mới được phép tạo sản phẩm"));
  }

  next();
});
ProductSchema.methods.getTotalStock = function () {
  if (this.has_model) {
    return this.models.reduce((total, model) => total + (model.stock || 0), 0);
  }
  return this.stock;
};
ProductSchema.index({ name: "text", description: "text", tags: "text" });
const Product = mongoose.model("Product", ProductSchema);
export default Product;
