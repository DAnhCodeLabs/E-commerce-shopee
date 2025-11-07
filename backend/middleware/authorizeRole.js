// authorizeRole.js
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
    const token = extractTokenFromHeader(req);
    if (!token) {
      return res.status(401).json({ message: ERROR_MESSAGES.NO_TOKEN });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded._id || decoded.id;
      if (!userId) {
        console.error("Token không chứa _id hoặc id:", decoded);
        return res.status(401).json({ message: ERROR_MESSAGES.INVALID_TOKEN });
      }
      req.user = { ...decoded, _id: userId };

      if (req.user.role === "admin") {
        return next();
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          message: ERROR_MESSAGES.ACCESS_DENIED(roles),
        });
      }

      next();
    } catch (error) {
      console.error("Lỗi giải mã token:", error.message);
      return res.status(401).json({ message: ERROR_MESSAGES.INVALID_TOKEN });
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
