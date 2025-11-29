
import mongoose from "mongoose";

const flashSaleTimeSlotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    start_time: {
      type: String,
      required: true,
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Giờ bắt đầu phải có định dạng HH:MM",
      ],
    },

    end_time: {
      type: String,
      required: true,
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Giờ kết thúc phải có định dạng HH:MM",
      ],
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "flash_sale_time_slots",
  }
);

flashSaleTimeSlotSchema.pre("save", function (next) {
  if (this.start_time >= this.end_time) {
    next(new Error("Giờ kết thúc phải sau giờ bắt đầu"));
  } else {
    next();
  }
});

const FlashSaleTimeSlot = mongoose.model(
  "FlashSaleTimeSlot",
  flashSaleTimeSlotSchema
);
export default FlashSaleTimeSlot;
