import React, { useState, useEffect, useMemo } from "react";
import {
  Steps,
  Card,
  Radio,
  Button,
  message,
  Divider,
  Modal,
  Tag,
  Spin,
  Empty,
} from "antd";
import {
  EnvironmentOutlined,
  ShopOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { httpGet, httpPost } from "../../services/httpService";
import Loader from "../../components/common/Loader";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Nhận dữ liệu từ Giỏ hàng gửi sang
  const checkoutItems = location.state?.items || [];

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(true);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // Redirect nếu không có sản phẩm (chặn truy cập trực tiếp)
  useEffect(() => {
    if (checkoutItems.length === 0) {
      message.warning("Vui lòng chọn sản phẩm từ giỏ hàng trước!");
      navigate("/cart");
    }
  }, [checkoutItems, navigate]);

  // 2. Fetch danh sách địa chỉ của User
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await httpGet("/user/address");
        if (response.success) {
          setAddresses(response.addresses || []);
          // Tự động chọn địa chỉ mặc định hoặc cái đầu tiên
          if (response.addresses.length > 0) {
            // Logic tìm default nếu có, tạm thời lấy cái đầu
            setSelectedAddress(response.addresses[0]);
          }
        }
      } catch (error) {
        console.error("Lỗi tải địa chỉ:", error);
      } finally {
        setAddressLoading(false);
      }
    };
    fetchAddresses();
  }, []);

  // 3. Gom nhóm sản phẩm theo Shop (Logic hiển thị)
  const groupedItems = useMemo(() => {
    const groups = {};
    checkoutItems.forEach((item) => {
      const shopId = item.product_id?.shop_id?._id || "unknown";
      const shopName = item.product_id?.shop_id?.shop?.shopName || "Cửa hàng";

      if (!groups[shopId]) {
        groups[shopId] = { shopName, items: [] };
      }
      groups[shopId].items.push(item);
    });
    return Object.values(groups);
  }, [checkoutItems]);

  // 4. Tính toán tổng tiền
  const { merchandiseSubtotal, shippingTotal, totalPayment } = useMemo(() => {
    const subtotal = checkoutItems.reduce((acc, item) => {
      const product = item.product_id;
      let price = product.sale_price || product.price;

      // Nếu là biến thể
      if (product.has_model && item.model_id) {
        const variant = product.models.find((m) => m._id === item.model_id);
        if (variant) price = variant.sale_price || variant.price;
      }
      return acc + price * item.quantity;
    }, 0);

    // Phí ship giả định (30k cho mỗi Shop) - Sau này thay bằng API GHN
    const shipping = groupedItems.length * 30000;

    return {
      merchandiseSubtotal: subtotal,
      shippingTotal: shipping,
      totalPayment: subtotal + shipping,
    };
  }, [checkoutItems, groupedItems]);

  // 5. Xử lý Đặt hàng (Core Logic)
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      message.error("Vui lòng chọn địa chỉ giao hàng!");
      return;
    }

    setLoading(true);
    try {
      // Chuẩn bị Payload đúng chuẩn order.controller.js yêu cầu
      const payload = {
        orderItems: checkoutItems.map((item) => ({
          product_id: item.product_id._id,
          quantity: item.quantity,
          model_id: item.model_id,
          image: item.product_id.images?.[0] || item.product_id.image || "",
        })),
        shippingAddress: {
          fullName: selectedAddress.name,
          phone: selectedAddress.phone,
          address: selectedAddress.street,
          city: selectedAddress.city,
          country: selectedAddress.country || "Việt Nam",
        },
        paymentMethod: paymentMethod,
        // shippingPrice: shippingTotal, // Có thể gửi hoặc để backend tự tính
      };

      const response = await httpPost("/user/orders", payload);

      if (response.success) {
        message.success("Đặt hàng thành công!");
        // Chuyển hướng đến trang danh sách đơn hàng hoặc trang thành công
        navigate("/user/purchase"); // Giả định route đơn mua
      }
    } catch (error) {
      console.error("Lỗi đặt hàng:", error);
      const msg =
        error.response?.data?.message || "Đặt hàng thất bại, vui lòng thử lại.";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // UI chọn địa chỉ trong Modal
  const renderAddressSelection = () => (
    <Modal
      title="Chọn Địa Chỉ Giao Hàng"
      open={isAddressModalOpen}
      onCancel={() => setIsAddressModalOpen(false)}
      footer={null}
    >
      <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
        {addresses.map((addr) => (
          <div
            key={addr._id}
            onClick={() => {
              setSelectedAddress(addr);
              setIsAddressModalOpen(false);
            }}
            className={`p-3 border rounded cursor-pointer hover:border-blue-500 transition-colors ${
              selectedAddress?._id === addr._id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200"
            }`}
          >
            <div className="font-bold text-gray-800">
              {addr.name}{" "}
              <span className="font-normal text-gray-500">| {addr.phone}</span>
            </div>
            <div className="text-sm text-gray-600">{addr.street}</div>
            <div className="text-xs text-gray-500">
              {addr.city}, {addr.country}
            </div>
            {selectedAddress?._id === addr._id && (
              <Tag color="blue" className="mt-2">
                Đang chọn
              </Tag>
            )}
          </div>
        ))}
        <Button
          type="dashed"
          block
          icon={<EnvironmentOutlined />}
          onClick={() => navigate("/profile/address")}
        >
          Thêm địa chỉ mới
        </Button>
      </div>
    </Modal>
  );

  if (checkoutItems.length === 0) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 pb-20">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Step Progress */}
        <div className="mb-8">
          <Steps
            current={1}
            items={[
              { title: "Giỏ hàng" },
              { title: "Thanh toán" },
              { title: "Hoàn tất" },
            ]}
          />
        </div>

        {/* --- PHẦN 1: ĐỊA CHỈ NHẬN HÀNG --- */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-t-orange-500 mb-4">
          <div className="flex items-center gap-2 text-primary text-lg font-bold mb-4">
            <EnvironmentOutlined /> Địa Chỉ Nhận Hàng
          </div>

          {addressLoading ? (
            <Loader />
          ) : selectedAddress ? (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-gray-800">
                <span className="font-bold">
                  {selectedAddress.name} ({selectedAddress.phone})
                </span>
                <span className="mx-2 text-gray-300">|</span>
                <span>
                  {selectedAddress.street}, {selectedAddress.city},{" "}
                  {selectedAddress.country}
                </span>
                {/* <Tag color="red" className="ml-3">Mặc định</Tag> */}
              </div>
              <Button type="link" onClick={() => setIsAddressModalOpen(true)}>
                Thay đổi
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-gray-500">
                Bạn chưa có địa chỉ nhận hàng.
              </span>
              <Button
                type="primary"
                onClick={() => navigate("/profile/address")}
              >
                Thêm địa chỉ ngay
              </Button>
            </div>
          )}
        </div>

        {/* --- PHẦN 2: DANH SÁCH SẢN PHẨM (Gom nhóm theo Shop) --- */}
        <div className="space-y-4 mb-4">
          {groupedItems.map((group, idx) => (
            <div key={idx} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-3">
                <ShopOutlined />
                <span className="font-medium">{group.shopName}</span>
              </div>

              {group.items.map((item) => {
                const product = item.product_id;
                let displayPrice = product.sale_price || product.price;
                let variantName = "";

                // Logic hiển thị biến thể
                if (product.has_model && item.model_id) {
                  const variant = product.models.find(
                    (m) => m._id === item.model_id
                  );
                  if (variant) {
                    displayPrice = variant.sale_price || variant.price;
                    variantName = variant.name;
                  }
                }

                return (
                  <div
                    key={item._id}
                    className="flex justify-between items-start py-2"
                  >
                    <div className="flex gap-3">
                      <img
                        src={product.images?.[0]}
                        alt=""
                        className="w-16 h-16 object-cover rounded border"
                      />
                      <div>
                        <div className="line-clamp-1 font-medium text-gray-800">
                          {product.name}
                        </div>
                        {variantName && (
                          <div className="text-xs text-gray-500 bg-gray-100 px-1 rounded inline-block">
                            PL: {variantName}
                          </div>
                        )}
                        <div className="text-sm text-gray-500">
                          x{item.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="font-medium text-gray-700">
                      {(displayPrice * item.quantity).toLocaleString()}₫
                    </div>
                  </div>
                );
              })}

              <div className="border-t border-dashed border-gray-200 mt-3 pt-3 flex justify-between items-center text-sm">
                <span className="text-gray-500">Đơn vị vận chuyển:</span>
                <div className="text-right">
                  <div className="text-green-600 font-medium">Nhanh</div>
                  <div className="text-xs text-gray-400">
                    Nhận hàng vào 3-5 ngày tới
                  </div>
                </div>
                <div className="text-gray-800 font-medium ml-4">30.000₫</div>
              </div>
            </div>
          ))}
        </div>

        {/* --- PHẦN 3: PHƯƠNG THỨC THANH TOÁN --- */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-4">
          <div className="flex items-center gap-2 text-gray-800 text-lg font-bold mb-4">
            <CreditCardOutlined /> Phương Thức Thanh Toán
          </div>

          <Radio.Group
            onChange={(e) => setPaymentMethod(e.target.value)}
            value={paymentMethod}
            className="flex flex-col gap-3"
          >
            <Radio value="COD" className="items-start">
              <span className="font-medium ml-2">
                Thanh toán khi nhận hàng (COD)
              </span>
              <div className="text-xs text-gray-500 ml-2 pl-4">
                Thanh toán bằng tiền mặt khi nhận hàng
              </div>
            </Radio>
            <Radio value="VNPAY" disabled className="items-start opacity-60">
              <span className="font-medium ml-2">Ví VNPAY (Sắp ra mắt)</span>
            </Radio>
          </Radio.Group>
        </div>

        {/* --- PHẦN 4: TỔNG KẾT & ĐẶT HÀNG (Sticky Bottom) --- */}
        <div className="bg-white p-6 rounded-lg shadow-sm sticky bottom-0 border-t border-gray-200 z-50">
          <div className="flex justify-end items-center gap-8 mb-4">
            <div className="text-gray-500">Tổng tiền hàng:</div>
            <div className="text-gray-800 font-medium">
              {merchandiseSubtotal.toLocaleString()}₫
            </div>
          </div>
          <div className="flex justify-end items-center gap-8 mb-4">
            <div className="text-gray-500">Phí vận chuyển:</div>
            <div className="text-gray-800 font-medium">
              {shippingTotal.toLocaleString()}₫
            </div>
          </div>
          <div className="flex justify-end items-center gap-8 mb-6">
            <div className="text-gray-500 text-lg">Tổng thanh toán:</div>
            <div className="text-2xl text-red-500 font-bold">
              {totalPayment.toLocaleString()}₫
            </div>
          </div>

          <Divider />

          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500 w-1/2">
              Nhấn "Đặt hàng" đồng nghĩa với việc bạn đồng ý tuân theo{" "}
              <a href="#" className="text-blue-500">
                Điều khoản Shopee
              </a>
            </div>
            <Button
              type="primary"
              size="large"
              className="w-48 h-12 !bg-red-500 hover:!bg-red-600 !border-red-500 text-lg font-medium shadow-lg"
              onClick={handlePlaceOrder}
              loading={loading}
            >
              Đặt Hàng
            </Button>
          </div>
        </div>
        {renderAddressSelection()}
      </div>
    </div>
  );
};

export default CheckoutPage;
