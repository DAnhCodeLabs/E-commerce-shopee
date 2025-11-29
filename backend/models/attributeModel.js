
import mongoose from "mongoose";

const AttributeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên thuộc tính (dùng nội bộ) là bắt buộc"],
      unique: true,
      trim: true,
    },
    label: {
      type: String,
      required: [true, "Nhãn thuộc tính (hiển thị cho người dùng) là bắt buộc"],
      trim: true,
    },
    input_type: {
      type: String,
      enum: ["text", "number", "select", "multiselect"],
      default: "text",
      required: true,
    },
    options: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

const Attribute = mongoose.model("Attribute", AttributeSchema);
export default Attribute;
