import { storage, multer, uploadToCloudinary } from "../config/cloudinary.js";

const uploadSingleImage = (folder) => {
  const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("Chỉ được phép upload file ảnh"), false);
      }
      cb(null, true);
    },
  }).single("image");

  return async (req, res, next) => {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "Lỗi khi upload ảnh",
        });
      }

      if (req.file) {
        try {
          const imageUrl = await uploadToCloudinary(req.file, folder);
          req.file.path = imageUrl;
          next();
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: error.message || "Lỗi khi upload ảnh lên Cloudinary",
          });
        }
      } else {
        next();
      }
    });
  };
};

const uploadMultipleImages = (folder, maxCount = 10) => {
  const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("Chỉ được phép upload file ảnh"), false);
      }
      cb(null, true);
    },
  }).array("images", maxCount);

  return async (req, res, next) => {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "Lỗi khi upload ảnh",
        });
      }

      if (req.files && req.files.length > 0) {
        try {
          const uploadPromises = req.files.map((file) =>
            uploadToCloudinary(file, folder)
          );
          const imageUrls = await Promise.all(uploadPromises);
          req.files = req.files.map((file, index) => {
            file.path = imageUrls[index];
            return file;
          });
          next();
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: error.message || "Lỗi khi upload ảnh lên Cloudinary",
          });
        }
      } else {
        next();
      }
    });
  };
};

export { uploadSingleImage, uploadMultipleImages };
