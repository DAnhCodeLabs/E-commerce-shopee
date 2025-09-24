import jwt from "jsonwebtoken";

const ERROR_MESSAGES = {
  NO_TOKEN: "Không có mã người dùng, quyền hạn bị từ chối!",
  INVALID_TOKEN: "Mã người dùng không hợp lệ, quyền hạn bị từ chối",
  ACCESS_DENIED: (roles) =>
    `Truy cập bị từ chối: Yêu cầu một trong các vai trò sau: ${roles.join(
      ", "
    )}`,
};

const authorizeRole = (roles) => {
  if (!Array.isArray(roles)) {
    roles = [roles];
  }

  return (req, res, next) => {
    try {
      const token = extractTokenFromHeader(req);
      if (!token) {
        return res.json({ message: ERROR_MESSAGES.NO_TOKEN });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (req.user.role === "admin") {
        return next();
      }

      if (!roles.includes(req.user.role)) {
        return res.json({
          message: ERROR_MESSAGES.ACCESS_DENIED(roles),
        });
      }

      next();
    } catch (error) {
      return res.json({ message: ERROR_MESSAGES.INVALID_TOKEN });
    }
  };
};

const extractTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.split(" ")[1];
};

export default authorizeRole;
