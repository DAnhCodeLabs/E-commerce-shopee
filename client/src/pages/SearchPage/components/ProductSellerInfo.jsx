import React, { useState, useEffect } from "react";
import { Button, Tooltip, Spin } from "antd";
import {
  ShopOutlined,
  HeartOutlined,
  CheckCircleOutlined,
  MessageOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { httpGet } from "../../../services/httpService";
import Loader from "../../../components/common/Loader";
import { useLocation, useNavigate } from "react-router-dom";

const ProductSellerInfo = ({ shop_id, productInfo }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Fetch real shop data from NEW API
  useEffect(() => {
    const fetchShopData = async () => {
      if (
        !shop_id ||
        shop_id === "undefined" ||
        shop_id === "null" ||
        (typeof shop_id === "string" && shop_id.trim() === "")
      ) {
        setError("Shop ID không hợp lệ");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await httpGet(`/shops/${shop_id}/info`);

        if (response.success && response.data) {
          setShopData(response.data);
          setError(null); // ✅ Clear error khi thành công
        } else {
          setError(response.message || "Không thể tải thông tin shop");
        }
      } catch (err) {
        setError("Lỗi khi tải thông tin shop");
        console.error("Error fetching shop data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [shop_id]);

  const handleFollowShop = () => {
    setIsFollowing(!isFollowing);
  };

  const handleChatNow = () => {
    // 1. Kiểm tra xem dữ liệu Shop đã tải xong chưa
    if (!shopData || !shopData._id) {
      message.error("Đang tải thông tin Shop, vui lòng thử lại sau giây lát.");
      return;
    }

    // 2. Kiểm tra đăng nhập (Tùy chọn: dùng token trong localStorage hoặc Context)
    const token = localStorage.getItem("token");
    if (!token) {
      message.warning("Vui lòng đăng nhập để chat với người bán!");
      // navigate("/login"); // Có thể chuyển hướng nếu muốn
      return;
    }

    // 3. Kích hoạt FloatingChat thông qua state của navigate
    // FloatingChat.jsx sẽ lắng nghe sự thay đổi này để bật lên
    navigate(location.pathname, {
      state: {
        openChat: true, // Cờ để bật khung chat
        shopId: shopData._id, // ID shop để load tin nhắn cũ
        shopName: shopData.shopName, // Tên shop hiển thị ở Header chat

        // Gửi kèm thông tin sản phẩm để tạo "Thẻ sản phẩm" (Product Card)
        productContext: productInfo
          ? {
              productId: productInfo._id,
              name: productInfo.name,
              image: productInfo.images?.[0] || "",
              price: productInfo.sale_price || productInfo.price,
            }
          : null,
      },
    });
  };

  // Format number (vd: 1200 -> 1.2k)
  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="product-seller-info bg-white p-4 border border-gray-200 rounded-lg">
        <div className="flex justify-center items-center h-20">
          <Loader size="small" />
        </div>
      </div>
    );
  }

  if (error || !shopData) {
    return null;
  }

  return (
    <div className="product-seller-info bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
      {/* --- PHẦN 1: HEADER (Avatar, Tên, Online status) --- */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar Shop */}
          <div className="shop-avatar flex-shrink-0 relative">
            <img
              src={shopData.avatar || "/default-shop.png"}
              alt={shopData.shopName}
              className="w-14 h-14 rounded-full object-cover border border-gray-200"
            />
            {/* Badge Online nếu cần thiết kế đè lên avatar */}
          </div>

          {/* Thông tin Shop */}
          <div>
            <div className="flex items-center gap-1">
              <h3 className="text-base font-bold text-gray-900 line-clamp-1">
                {shopData.shopName}
              </h3>
              {/* Giả định backend trả về verificationStatus (nếu có lưu trong account) */}
              <Tooltip title="Shop chính hãng">
                <CheckCircleOutlined className="text-blue-500 text-sm" />
              </Tooltip>
            </div>

            {/* Hiển thị trạng thái Online từ Backend */}
            <p
              className={`text-xs mt-1 ${
                shopData.onlineStatus === "Đang hoạt động"
                  ? "text-green-500"
                  : "text-gray-500"
              }`}
            >
              {shopData.onlineStatus}
            </p>
          </div>
        </div>

        {/* Nút theo dõi */}
        <Button
          size="small"
          type={isFollowing ? "primary" : "default"}
          icon={<HeartOutlined />}
          onClick={handleFollowShop}
          className={`${
            isFollowing
              ? "!bg-pink-500 !border-pink-500 hover:!bg-pink-600"
              : "!border-gray-300 !text-gray-700 hover:!border-pink-500 hover:!text-pink-500"
          }`}
        >
          {isFollowing ? "Đã theo dõi" : "Theo dõi"}
        </Button>
      </div>

      {/* --- PHẦN 2: THỐNG KÊ (Hàng ngang trên) --- */}
      <div className="grid grid-cols-3 gap-2 mb-4 p border-y border-gray-100">
        <div className="text-center border-r border-gray-100 last:border-0">
          <div className="text-gray-900 font-bold text-base">
            {formatNumber(shopData.totalProducts)}
          </div>
          <div className="text-gray-500 text-xs mt-1">Sản Phẩm</div>
        </div>
        <div className="text-center border-r border-gray-100 last:border-0">
          <div className=" font-bold text-base text-red-500">
            {shopData.avgRating || "0.0"} <StarOutlined className="text-xs" />
          </div>
          <div className="text-gray-500 text-xs mt-1">Đánh Giá TB</div>
        </div>
        <div className="text-center">
          <div className=" font-bold text-base text-red-500">
            {shopData.responseRate}
          </div>
          <div className="text-gray-500 text-xs mt-1">Phản Hồi</div>
        </div>
      </div>

      {/* --- PHẦN 3: THÔNG TIN CHI TIẾT & HÀNH ĐỘNG (Hàng dưới) --- */}
      <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
        {/* Người theo dõi */}
        <div className="col-span-1 flex justify-between items-center">
          <span className="text-gray-500 text-xs">Người Theo Dõi:</span>
          <span className="text-red-500 font-medium text-xs">
            {formatNumber(shopData.followers)}
          </span>
        </div>

        {/* Thời gian phản hồi */}
        <div className="col-span-1 flex justify-between items-center">
          <span className="text-gray-500 text-xs">Phản Hồi:</span>
          <span className="text-red-500 font-medium text-xs">
            {shopData.responseTime}
          </span>
        </div>

        {/* Tham gia */}
        <div className="col-span-1 flex justify-between items-center">
          <span className="text-gray-500 text-xs">Tham Gia:</span>
          <span className="text-red-500 font-medium text-xs">
            {shopData.joinDate}
          </span>
        </div>

        {/* Tổng đánh giá (Thay thế cho ô sản phẩm bị lặp) */}
        <div className="col-span-1 flex justify-between items-center">
          <span className="text-gray-500 text-xs">Đánh Giá:</span>
          <span className="text-red-500 font-medium text-xs">
            {formatNumber(shopData.totalReviews)}
          </span>
        </div>
      </div>

      {/* Nút Xem Shop & Chat */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button
          icon={<MessageOutlined />}
          onClick={handleChatNow}
          className="!bg-red-50 !text-red-500 !border-red-500 hover:!bg-red-100 hover:!text-red-600 hover:!border-red-600 text-xs font-medium"
        >
          Chat Ngay
        </Button>
        <Button
          icon={<ShopOutlined />}
          href={`/shop/${shopData._id}`} // Link đến trang shop
          className="!border-gray-300 !text-gray-700 hover:!bg-gray-50 text-xs font-medium"
        >
          Xem Shop
        </Button>
      </div>
    </div>
  );
};

export default ProductSellerInfo;
