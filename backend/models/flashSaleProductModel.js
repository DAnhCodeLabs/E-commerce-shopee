
import mongoose from "mongoose";

const flashSaleProductSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    shop_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },

    time_slot_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FlashSaleTimeSlot",
      required: true,
      index: true,
    },

    sale_date: {
      type: Date,
      required: true,
      index: true,
    },
    original_price: {
      type: Number,
      required: true,
      min: 0,
    },
    flash_price: {
      type: Number,
      required: true,
      min: 0,
    },
    discount_percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    flash_stock: {
      type: Number,
      required: true,
      min: 0,
    },
    sold_count: {
      type: Number,
      default: 0,
    },

    admin_status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    seller_status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "flash_sale_products",
  }
);

flashSaleProductSchema.pre("save", function (next) {
  if (this.original_price > 0 && this.flash_price > 0) {
    if (this.flash_price > this.original_price) {
      this.flash_price = this.original_price;
    }
    const discount = this.original_price - this.flash_price;
    const percentage = (discount / this.original_price) * 100;
    this.discount_percentage = Math.round(percentage);
  } else {
    this.discount_percentage = 0;
  }

  next();
});

flashSaleProductSchema.index({
  sale_date: 1,
  time_slot_id: 1,
  admin_status: 1,
});

const FlashSaleProduct = mongoose.model(
  "FlashSaleProduct",
  flashSaleProductSchema
);
export default FlashSaleProduct;
