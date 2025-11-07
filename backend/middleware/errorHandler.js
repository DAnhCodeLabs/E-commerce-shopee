export const errorHandler = (err, req, res, next) => {
  // Lấy status code từ response nếu đã có, nếu không thì là 500 (Internal Server Error)
  const statusCode = res.statusCode ? res.statusCode : 500;

  res.status(statusCode);

  // Trả về lỗi dưới dạng JSON
  res.json({
    message: err.message,
    // Chỉ hiển thị stack trace khi ở môi trường development cho mục đích debug
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

