import mongoose from "mongoose";

const aiFeaturedProductSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true,
    },

    sort_order: {
      type: Number,
      required: true,
      default: 0,
    },
    ai_run_id: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "ai_featured_products",
  }
);

aiFeaturedProductSchema.index({ sort_order: 1 });

const AiFeaturedProduct = mongoose.model(
  "AiFeaturedProduct",
  aiFeaturedProductSchema
);
export default AiFeaturedProduct;
