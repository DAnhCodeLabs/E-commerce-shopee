import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI,
      console.log("Kết nối MONGODB thành công")
    );
  } catch (error) {
    console.error("MongoDB kết nối thất bại:", error.message);
    process.exit(1);
  }
};

export default connectDB;
