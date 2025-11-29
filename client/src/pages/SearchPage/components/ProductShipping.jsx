import React, { useState } from "react";
import { Tag, Button, Modal } from "antd";
import {
  RocketOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

const ProductShipping = ({ logistic_info = [], pre_order = {}, location }) => {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { is_pre_order = false, days_to_ship } = pre_order;
  const displayLocation =
    typeof location === "object" && location !== null
      ? location.city || location.country || "Không xác định"
      : location || "Không xác định";

  // Lọc các đơn vị vận chuyển được bật và lấy cái đầu tiên
  const enabledLogistics = logistic_info.filter((logistic) => logistic.enabled);
  const mainLogistic = enabledLogistics[0];

  // Tính toán thông tin vận chuyển chính
  const getMainShippingInfo = () => {
    if (is_pre_order && days_to_ship) {
      return {
        type: "pre_order",
        text: `Đặt trước - giao trong ${days_to_ship} ngày`,
        icon: <ClockCircleOutlined className="text-blue-500" />,
      };
    }

    if (mainLogistic) {
      return {
        type: "logistic",
        text: mainLogistic.is_free
          ? "Miễn phí vận chuyển"
          : `Phí: ${mainLogistic.shipping_fee?.toLocaleString("vi-VN")}₫`,
        icon: <CheckCircleOutlined className="text-green-500" />,
        details: mainLogistic.estimated_days
          ? `~${mainLogistic.estimated_days} ngày`
          : "3-5 ngày",
      };
    }

    return {
      type: "default",
      text: "Đang cập nhật thông tin vận chuyển",
      icon: <RocketOutlined className="text-gray-500" />,
    };
  };

  const mainShippingInfo = getMainShippingInfo();

  return (
    <>
      <div className="product-shipping space-y-3 text-sm">
        {/* Địa chỉ + nút chi tiết */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <EnvironmentOutlined className="text-gray-500 text-xs" />
            <span className="text-gray-600">Giao đến:</span>
            <span className="text-gray-900 font-medium">{displayLocation}</span>
          </div>
          <Button
            type="link"
            size="small"
            className="!p-0 !h-auto text-primary text-xs"
            onClick={() => setShowDetailModal(true)}
          >
            <InfoCircleOutlined className="mr-1" />
            Chi tiết
          </Button>
        </div>

        {/* Thông tin vận chuyển chính */}
        <div className="flex items-center justify-between px-3 py-2 rounded-md bg-gray-50 border border-gray-200">
          <div className="flex items-center gap-2">
            {mainShippingInfo.icon}
            <span className="font-medium text-gray-900">
              {mainShippingInfo.text}
            </span>
          </div>
          {mainShippingInfo.details && (
            <span className="text-xs text-gray-500">
              {mainShippingInfo.details}
            </span>
          )}
        </div>

        {/* Chính sách nhanh – dạng pill đơn giản */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-50 border border-gray-200">
            <span>🚚</span>
            <span className="text-xs text-gray-700">Miễn phí ship</span>
          </div>
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-50 border border-gray-200">
            <span>↩️</span>
            <span className="text-xs text-gray-700">7 ngày đổi trả</span>
          </div>
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-50 border border-gray-200">
            <span>🛡️</span>
            <span className="text-xs text-gray-700">Bảo vệ</span>
          </div>
        </div>
      </div>

      {/* Modal chi tiết */}
      <Modal
        title="Thông tin vận chuyển chi tiết"
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowDetailModal(false)}>
            Đóng
          </Button>,
        ]}
        width={480}
      >
        <div className="space-y-4 text-sm">
          {/* Pre-order Info */}
          {is_pre_order && days_to_ship && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <ClockCircleOutlined className="text-blue-500" />
                <span className="font-medium text-blue-800">
                  Sản phẩm đặt trước
                </span>
                <Tag color="blue">Đặt trước</Tag>
              </div>
              <p className="text-blue-700">
                Giao trong <strong>{days_to_ship} ngày</strong> kể từ khi đặt
                hàng.
              </p>
            </div>
          )}

          {/* Shipping Location */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <EnvironmentOutlined className="text-gray-500" />
              <span className="text-gray-700 font-medium">Giao đến</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-900 font-medium">
                {displayLocation}
              </span>
              <button className="text-primary text-xs hover:underline">
                Thay đổi
              </button>
            </div>
          </div>

          {/* Shipping Methods */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <RocketOutlined className="text-gray-500" />
              <span className="text-gray-700 font-medium">
                Phương thức vận chuyển
              </span>
            </div>

            {enabledLogistics.length > 0 ? (
              <div className="space-y-2">
                {enabledLogistics.map((logistic, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-3 py-2 border border-gray-200 rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircleOutlined className="text-green-500" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {logistic.name ||
                            `Đơn vị vận chuyển ${logistic.logistic_id}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {logistic.is_free ? (
                            <span className="text-green-600 font-medium">
                              Miễn phí vận chuyển
                            </span>
                          ) : (
                            `Phí: ${logistic.shipping_fee?.toLocaleString(
                              "vi-VN"
                            )} ₫`
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {logistic.estimated_days
                        ? `~${logistic.estimated_days} ngày`
                        : "3-5 ngày"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-sm px-3 py-2 border border-gray-200 rounded-md text-center">
                Thông tin vận chuyển đang được cập nhật
              </div>
            )}
          </div>

          {/* Return Policy */}
          <div className="bg-gray-50 px-3 py-2 rounded-md">
            <span className="text-gray-700">
              <strong>Trả hàng & hoàn tiền:</strong> trong 7 ngày nếu sản phẩm
              lỗi hoặc không đúng mô tả.
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ProductShipping;
