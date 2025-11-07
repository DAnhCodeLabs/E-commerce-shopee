// file: models/reviewModel.js

import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    shop_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: [true, "Đánh giá sao là bắt buộc"],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, "Bình luận không được vượt quá 1000 ký tự"],
    },
    images: [{ type: String }],
    shop_reply: {
      comment: { type: String, trim: true },
      replied_at: { type: Date },
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "APPROVED",
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ product_id: 1, user_id: 1 }, { unique: true });

const Review = mongoose.model("Review", ReviewSchema);
export default Review;
