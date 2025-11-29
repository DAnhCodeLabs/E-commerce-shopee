import React, { useState, useEffect } from "react";
import {
  Steps,
  Button,
  message,
  Spin,
  Timeline,
  Popconfirm,
  Tag,
  Divider,
} from "antd";
import {
  LeftOutlined,
  EnvironmentOutlined,
  ShopOutlined,
  MessageOutlined,
  CarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate, Link } from "react-router-dom";
import { httpGet, httpPut } from "../../services/httpService";
import Loader from "../../components/common/Loader";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // 1. Fetch chi tiết đơn hàng
  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await httpGet(`/user/order/${id}`);
      if (response.success) {
        setOrder(response.data);
      }
    } catch (error) {
      console.error(error);
      message.error("Không thể tải thông tin đơn hàng");
      navigate("/user/purchase"); // Quay lại nếu lỗi
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrderDetail();
  }, [id]);

  // 2. Logic Trạng thái & Stepper (Shopee Style)
  const getStepStatus = (status) => {
    // Mapping trạng thái DB sang thứ tự Step (0-4)
    switch (status) {
      case "PENDING":
        return 0;
      case "CONFIRMED":
        return 1;
      case "SHIPPING":
        return 2;
      case "DELIVERED":
        return 3;
      case "COMPLETED":
        return 3; // Chung bước với Delivered
      case "CANCELLED":
        return -1; // Case đặc biệt
      case "RETURNED":
        return -1;
      default:
        return 0;
    }
  };

  const currentStep = order ? getStepStatus(order.orderStatus) : 0;

  // 3. Xử lý nhận hàng
  const handleConfirmReceived = async () => {
    setActionLoading(true);
    try {
      const response = await httpPut(`/user/order/${id}/received`);
      if (response.success) {
        message.success("Đã xác nhận nhận hàng!");
        fetchOrderDetail(); // Reload lại trang để cập nhật trạng thái
      }
    } catch (error) {
      message.error("Lỗi khi xác nhận.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <Loader size="large" />
      </div>
    );
  }

  if (!order) return null;

  // Header màu cam/xanh tùy trạng thái (Giống Shopee)
  const isCompleted = ["DELIVERED", "COMPLETED"].includes(order.orderStatus);
  const isCancelled = ["CANCELLED", "RETURNED"].includes(order.orderStatus);
  const headerBgColor = isCompleted
    ? "bg-green-500"
    : isCancelled
    ? "bg-gray-500"
    : "bg-orange-500";

  const statusText = {
    PENDING: "CHỜ NGƯỜI BÁN XÁC NHẬN",
    CONFIRMED: "NGƯỜI BÁN ĐANG CHUẨN BỊ HÀNG",
    SHIPPING: "ĐƠN HÀNG ĐANG ĐƯỢC VẬN CHUYỂN",
    DELIVERED: "GIAO HÀNG THÀNH CÔNG",
    CANCELLED: "ĐƠN HÀNG ĐÃ HỦY",
    RETURNED: "ĐANG TRẢ HÀNG/HOÀN TIỀN",
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 1. Header Navigation */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-4 h-14 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-red-500"
            onClick={() => navigate("/user/purchase")}
          >
            <LeftOutlined /> <span className="uppercase text-sm">Trở lại</span>
          </div>
          <div className="text-sm text-gray-600 uppercase">
            ID ĐƠN HÀNG. {order._id.toUpperCase().slice(-10)}
            <span className="mx-2">|</span>
            <span className="text-red-500 font-bold">{order.orderStatus}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-6 space-y-4">
        {/* 2. Status Banner & Stepper */}
        {!isCancelled && (
          <div className="bg-white rounded shadow-sm overflow-hidden">
            {/* Banner màu */}
            <div
              className={`${headerBgColor} text-white px-8 py-6 flex justify-between items-center`}
            >
              <div>
                <h2 className="text-xl font-bold mb-1">
                  {statusText[order.orderStatus]}
                </h2>
                <p className="opacity-90 text-sm">
                  {isCompleted
                    ? "Cảm ơn bạn đã mua sắm tại Shopee Clone!"
                    : "Vui lòng chú ý điện thoại để nhận hàng."}
                </p>
              </div>
              {isCompleted ? (
                <CheckCircleOutlined className="text-5xl opacity-80" />
              ) : (
                <CarOutlined className="text-5xl opacity-80" />
              )}
            </div>

            {/* Stepper Process */}
            <div className="px-8 py-8 bg-white border-b border-gray-100">
              <Steps
                current={currentStep}
                labelPlacement="vertical"
                items={[
                  {
                    title: "Đơn Hàng Đã Đặt",
                    description: new Date(order.createdAt).toLocaleString(
                      "vi-VN"
                    ),
                  },
                  { title: "Đã Xác Nhận", icon: <FileTextOutlined /> },
                  { title: "Đang Giao Hàng", icon: <CarOutlined /> },
                  { title: "Đã Nhận Được Hàng", icon: <CheckCircleOutlined /> },
                ]}
              />
            </div>
          </div>
        )}

        {/* 3. Address Section (Giả lập viền phong bì Shopee) */}
        <div className="bg-white rounded shadow-sm overflow-hidden relative">
          {/* Viền trang trí */}
          <div className="h-1 w-full bg-gradient-to-r from-red-500 via-blue-500 to-red-500 bg-[length:40px_40px]"></div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Cột 1: Địa chỉ */}
            <div className="md:col-span-1">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <EnvironmentOutlined /> Địa Chỉ Nhận Hàng
              </h3>
              <div className="text-gray-800 font-bold mb-1">
                {order.shippingAddress.fullName}
              </div>
              <div className="text-gray-600 text-sm mb-1">
                (+84) {order.shippingAddress.phone}
              </div>
              <div className="text-gray-600 text-sm">
                {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
                {order.shippingAddress.country}
              </div>
            </div>

            {/* Cột 2 & 3: Tracking Timeline (Nếu có) */}
            <div className="md:col-span-2 border-l border-gray-100 pl-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CarOutlined /> Thông Tin Vận Chuyển
              </h3>
              <div className="max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {order.trackingLogs && order.trackingLogs.length > 0 ? (
                  <Timeline
                    items={order.trackingLogs
                      .map((log) => ({
                        color: "green",
                        children: (
                          <>
                            <div className="font-medium text-gray-800">
                              {log.status}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(log.timestamp).toLocaleString("vi-VN")}{" "}
                              - {log.location}
                            </div>
                          </>
                        ),
                      }))
                      .reverse()}
                  />
                ) : (
                  <div className="text-gray-400 text-sm italic">
                    {order.orderStatus === "PENDING"
                      ? "Chưa có thông tin vận chuyển (Đơn chưa xác nhận)"
                      : "Đang cập nhật thông tin vận chuyển..."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Product List Section */}
        <div className="bg-white rounded shadow-sm">
          {/* Header Shop */}
          <div className="px-6 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div className="flex items-center gap-2">
              <ShopOutlined className="text-gray-500" />
              <span className="font-bold text-gray-800">
                {order.shop?.shop?.shopName || "Cửa hàng"}
              </span>
              <Button
                size="small"
                icon={<MessageOutlined />}
                className="text-xs ml-2 text-red-500 border-red-500"
              >
                Chat ngay
              </Button>
              <Link to={`/shop/${order.shop._id}`}>
                <Button size="small" className="text-xs">
                  Xem Shop
                </Button>
              </Link>
            </div>
          </div>

          {/* Items */}
          <div className="px-6 py-2">
            {order.orderItems.map((item, index) => (
              <div
                key={index}
                className="flex gap-4 py-4 border-b border-gray-100 last:border-0 items-center"
              >
                <div className="w-20 h-20 border border-gray-200 rounded flex-shrink-0">
                  <img
                    src={item.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-medium text-gray-800 line-clamp-2 mb-1">
                    {item.name}
                  </div>
                  {item.model_name && (
                    <div className="text-xs text-gray-500">
                      Phân loại hàng: {item.model_name}
                    </div>
                  )}
                  <div className="text-sm text-gray-800 mt-1">
                    x{item.quantity}
                  </div>
                </div>
                <div className="text-right">
                  {/* Giá hiển thị (Shopee style: Giá cũ gạch ngang nếu có, Giá mới màu cam) */}
                  <div className="text-red-500 font-medium">
                    {item.price.toLocaleString()}₫
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 5. Payment Info Section (Bottom) */}
          <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-100">
            <div className="flex justify-end text-sm text-gray-500 mb-2 gap-8">
              <span>Tổng tiền hàng</span>
              <span className="font-medium text-gray-800">
                {order.itemsPrice.toLocaleString()}₫
              </span>
            </div>
            <div className="flex justify-end text-sm text-gray-500 mb-2 gap-8">
              <span>Phí vận chuyển</span>
              <span className="font-medium text-gray-800">
                {order.shippingPrice.toLocaleString()}₫
              </span>
            </div>
            <div className="flex justify-end text-sm text-gray-500 mb-2 gap-8">
              <span>Voucher từ Shop</span>
              <span className="font-medium text-gray-800">-0₫</span>
            </div>

            <Divider className="my-3" />

            <div className="flex justify-end items-center gap-4">
              <span className="text-gray-800 font-medium">Tổng số tiền:</span>
              <span className="text-2xl font-bold text-red-500">
                {order.totalPrice.toLocaleString()}₫
              </span>
            </div>

            <div className="flex justify-end mt-2">
              <div className="flex items-center gap-2 text-xs text-blue-500 border border-blue-500 px-2 py-0.5 rounded bg-blue-50">
                <FileTextOutlined />
                Phương thức thanh toán:{" "}
                {order.paymentMethod === "COD"
                  ? "Thanh toán khi nhận hàng"
                  : "Thanh toán Online"}
              </div>
            </div>
          </div>
        </div>

        {/* 6. Footer Actions (Sticky Bottom on Mobile, or Static) */}
        {order.orderStatus === "SHIPPING" && (
          <div className="bg-white p-4 shadow-up sticky bottom-0 z-50 flex justify-end gap-3 border-t border-gray-100">
            <div className="text-sm text-gray-500 flex items-center mr-auto">
              Đơn hàng đang được giao. Hãy xác nhận khi bạn đã nhận được hàng
              nhé.
            </div>
            <Popconfirm
              title="Đã nhận được hàng?"
              description="Bạn xác nhận đã nhận đủ hàng và sản phẩm không có vấn đề gì chứ?"
              onConfirm={handleConfirmReceived}
              okText="Đồng ý"
              cancelText="Hủy"
            >
              <Button
                type="primary"
                size="large"
                className="bg-red-500 hover:bg-red-600 border-red-500 w-48 shadow-lg"
                loading={actionLoading}
              >
                Đã Nhận Được Hàng
              </Button>
            </Popconfirm>
          </div>
        )}

        {/* Nút đánh giá khi đã giao */}
        {order.orderStatus === "DELIVERED" && (
          <div className="bg-white p-4 shadow-up sticky bottom-0 z-50 flex justify-end gap-3 border-t border-gray-100">
            <Button
              size="large"
              onClick={() =>
                navigate(`/products/${order.orderItems[0].product}`)
              }
            >
              Mua Lại
            </Button>
            <Button
              type="primary"
              size="large"
              className="bg-red-500 hover:bg-red-600 border-red-500"
            >
              Đánh Giá
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsPage;
