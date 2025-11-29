import React, { useState } from "react";
import { Button, Tag, Image, Divider, Modal, message, Popconfirm } from "antd";
import { ShopOutlined, CarOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { httpPut } from "../../../services/httpService";

const OrderCard = ({ order, onRefresh }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // 1. Helper: Map trạng thái sang Text và Màu sắc
  const getStatusTag = (status) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="text-orange-500 font-medium uppercase">
            Chờ xác nhận
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="text-blue-500 font-medium uppercase">
            Đang chuẩn bị hàng
          </span>
        );
      case "SHIPPING":
        return (
          <span className="text-blue-600 font-medium uppercase">
            Đang giao hàng
          </span>
        );
      case "DELIVERED":
        return (
          <span className="text-green-500 font-medium uppercase">
            Giao hàng thành công
          </span>
        );
      case "CANCELLED":
        return (
          <span className="text-red-500 font-medium uppercase">Đã hủy</span>
        );
      case "RETURNED":
        return (
          <span className="text-red-500 font-medium uppercase">
            Trả hàng/Hoàn tiền
          </span>
        );
      default:
        return (
          <span className="text-gray-500 font-medium uppercase">{status}</span>
        );
    }
  };

  // 2. Xử lý: Xác nhận đã nhận hàng
  const handleConfirmReceived = async () => {
    setLoading(true);
    try {
      const response = await httpPut(`/user/${order._id}/received`);
      if (response.success) {
        message.success("Xác nhận đã nhận hàng thành công!");
        onRefresh(); // Load lại danh sách ở trang cha
      }
    } catch (error) {
      console.error(error);
      message.error("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Xử lý: Mua lại (Điều hướng về trang sản phẩm đầu tiên)
  // Thực tế: Cần logic add to cart hàng loạt, nhưng tạm thời navigate về sản phẩm
  const handleBuyAgain = () => {
    const firstItemSlug = order.orderItems[0]?.product?.slug || ""; // Cần backend trả slug trong orderItem (nếu chưa có thì dùng ID)
    // Nếu trong orderItems chưa lưu slug (theo model hiện tại), ta dùng ID
    const productId =
      order.orderItems[0]?.product?._id || order.orderItems[0]?.product;
    navigate(`/products/${productId}`); // Hoặc slug nếu bạn đã lưu snapshot slug
  };

  const handleCancelOrder = async () => {
    setLoading(true);
    try {
      // Gọi API vừa tạo
      const response = await httpPut(`/user/order/${order._id}/cancel`);
      if (response.success) {
        message.success("Đã hủy đơn hàng");
        onRefresh(); // Load lại danh sách để cập nhật trạng thái
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi hủy đơn");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-4 overflow-hidden">
      {/* HEADER: Shop & Status */}
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-2">
          <ShopOutlined className="text-gray-500" />
          <span className="font-bold text-gray-800">
            {order.shop?.shop?.shopName || "Cửa hàng"}
          </span>
          <Button size="small" className="text-xs ml-2">
            Chat
          </Button>
          <Button size="small" className="text-xs">
            Xem Shop
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {order.paymentMethod === "COD"
            ? "Thanh toán khi nhận hàng"
            : "Đã thanh toán Online"}
          <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>
          {getStatusTag(order.orderStatus)}
        </div>
      </div>

      {/* BODY: Danh sách sản phẩm */}
      <div className="px-6 py-2">
        {order.orderItems.map((item, index) => (
          <div
            key={index}
            className="flex gap-4 py-4 border-b border-gray-100 last:border-0"
          >
            {/* Ảnh */}
            <div className="w-20 h-20 border border-gray-200 rounded flex-shrink-0">
              <Image
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
                preview={false}
              />
            </div>

            {/* Thông tin */}
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-medium text-gray-800 line-clamp-2 mb-1">
                {item.name}
              </h4>
              {item.model_name && (
                <div className="text-xs text-gray-500 mb-1">
                  Phân loại: {item.model_name}
                </div>
              )}
              <div className="text-sm text-gray-600">x{item.quantity}</div>
            </div>

            {/* Giá */}
            <div className="flex items-center">
              <span className="text-red-500 font-medium">
                {item.price.toLocaleString()}₫
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER: Tổng tiền & Hành động */}
      <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-100">
        <div className="flex justify-end items-center gap-2 mb-4">
          <span className="text-gray-600">Thành tiền:</span>
          <span className="text-xl font-bold text-red-500">
            {order.totalPrice.toLocaleString()}₫
          </span>
        </div>

        <div className="flex justify-end items-center gap-3">
          {/* Nút theo trạng thái */}

          {order.orderStatus === "PENDING" && (
            <Popconfirm
              title="Hủy đơn hàng?"
              description="Bạn có chắc chắn muốn hủy đơn hàng này không?"
              onConfirm={handleCancelOrder}
              okText="Đồng ý"
              cancelText="Không"
            >
              <Button danger loading={loading}>
                Hủy Đơn Hàng
              </Button>
            </Popconfirm>
          )}

          {order.orderStatus === "SHIPPING" && (
            <div className="flex flex-col items-end gap-2">
              {/* Logic xác nhận nhận hàng */}
              <Popconfirm
                title="Đã nhận được hàng?"
                description="Xác nhận bạn đã nhận đủ hàng và không có khiếu nại?"
                onConfirm={handleConfirmReceived}
                okText="Đồng ý"
                cancelText="Hủy"
              >
                <Button
                  type="primary"
                  className="bg-red-500 hover:bg-red-600 border-red-500"
                  loading={loading}
                >
                  Đã nhận được hàng
                </Button>
              </Popconfirm>
              <span className="text-xs text-gray-400">
                Vui lòng kiểm tra kỹ hàng trước khi xác nhận
              </span>
            </div>
          )}

          {order.orderStatus === "DELIVERED" && (
            <>
              <Button
                type="primary"
                ghost
                className="border-red-500 text-red-500 hover:bg-red-50"
              >
                Đánh giá
              </Button>
              <Button onClick={handleBuyAgain}>Mua lại</Button>
            </>
          )}

          <Button
            href={`/user/purchase/order/${order._id}`}
            type="link"
            className="!text-primary"
          >
            Xem chi tiết đơn hàng
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
