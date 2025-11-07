import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: [true, "URL hình ảnh là bắt buộc."],
    },

    isActive: {
      type: Boolean,
      default: false,
    },

    startDate: {
      type: Date,
      required: [true, "Ngày bắt đầu là bắt buộc."],
    },

    endDate: {
      type: Date,
      required: [true, "Ngày kết thúc là bắt buộc."],
    },
  },
  {
    timestamps: true,
  }
);

bannerSchema.index({ startDate: 1, endDate: 1, isActive: 1 });

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner
