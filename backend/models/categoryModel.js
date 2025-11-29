// file: models/categoryModel.js

import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  display_name: { type: String, required: true },
  attributes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attribute",
    },
  ],
  image: { type: String },
  sort_order: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

CategorySchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

const Category = mongoose.model("Category", CategorySchema);
export default Category;
