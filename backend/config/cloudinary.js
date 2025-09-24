import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import "dotenv/config";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

const uploadToCloudinary = async (file, folder) => {
  try {
    const b64 = Buffer.from(file.buffer).toString("base64");
    const dataURI = "data:" + file.mimetype + ";base64," + b64;
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: folder,
      resource_type: "auto",
      transformation: [{ width: 1000, height: 1000, crop: "limit" }],
    });
    return result.secure_url;
  } catch (error) {
    throw new Error("Error uploading to Cloudinary");
  }
};

export { cloudinary, storage, uploadToCloudinary, multer };
