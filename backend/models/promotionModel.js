// file: models/promotionModel.js

import mongoose from "mongoose";

const PromotionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên chương trình khuyến mãi là bắt buộc"],
      trim: true,
    },
    description: { type: String, trim: true },
    type: {
      type: String,
      enum: ["PERCENTAGE", "FIXED_AMOUNT"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    applicable_products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

PromotionSchema.pre("save", function (next) {
  if (this.end_date <= this.start_date) {
    next(new Error("Ngày kết thúc phải sau ngày bắt đầu"));
  } else {
    next();
  }
});

const Promotion = mongoose.model("Promotion", PromotionSchema);
export default Promotion;
