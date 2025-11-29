import React from "react";
import { Button, Space, message } from "antd";
import {
  ShoppingCartOutlined,
  ThunderboltOutlined,
  HeartOutlined,
} from "@ant-design/icons";

const ProductActions = ({
  productId,
  currentModel,
  quantity = 1,
  availableStock = 0,
  onAddToCart,
  onBuyNow,
  loading = false,
}) => {
  const isOutOfStock = availableStock === 0;
  const isVariantNotSelected = currentModel === undefined;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      message.warning("Sản phẩm đã hết hàng");
      return;
    }

    if (isVariantNotSelected) {
      message.info("Vui lòng chọn phân loại hàng");
      return;
    }

    const cartItem = {
      productId,
      model: currentModel,
      quantity,
      price: currentModel?.sale_price || currentModel?.price,
    };

    if (onAddToCart) {
      onAddToCart(cartItem);
    }

    message.success("Đã thêm vào giỏ hàng");
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      message.warning("Sản phẩm đã hết hàng");
      return;
    }

    if (isVariantNotSelected) {
      message.info("Vui lòng chọn phân loại hàng");
      return;
    }

    const orderItem = {
      productId,
      model: currentModel,
      quantity,
      price: currentModel?.sale_price || currentModel?.price,
    };

    if (onBuyNow) {
      onBuyNow(orderItem);
    }
  };

  const handleAddToWishlist = () => {
    message.info("Đã thêm vào danh sách yêu thích");
  };

  return (
    <div className="product-actions space-y-4">
      {/* Main Action Buttons */}
      <div className="flex gap-2 justify-center items-center">
        <Button
          type="default"
          size="large"
          icon={<ShoppingCartOutlined />}
          onClick={onAddToCart}
          loading={loading}
          disabled={
            availableStock === 0 ||
            (currentModel === null && !productId) ||
            loading
          }
          className="w-1/2 h-12 text-base font-medium !border-primary !text-primary hover:!bg-red-50 hover:!border-red-600 hover:!text-red-600 transition-all duration-300 "
        >
          Thêm Vào Giỏ Hàng
        </Button>

        <Button
          type="primary"
          size="large"
          icon={<ThunderboltOutlined />}
          onClick={handleBuyNow}
          disabled={isOutOfStock || isVariantNotSelected}
          className="w-1/2 h-12 text-base font-medium !bg-primary !border-orange-500 hover:!bg-orange-600 hover:!border-orange-600 transition-all duration-300 "
        >
          Mua Ngay
        </Button>
      </div>

      {/* Secondary Actions */}
      <div className="flex gap-2">
        <Button
          icon={<HeartOutlined />}
          onClick={handleAddToWishlist}
          className="flex-1 border-gray-300 !text-gray-600 hover:!border-pink-500 hover:!text-pink-500"
        >
          Yêu thích
        </Button>

        <Button className="flex-1 !border-gray-300 !text-gray-600 hover:!border-blue-500 hover:!text-blue-500">
          Chia sẻ
        </Button>
      </div>
    </div>
  );
};

export default ProductActions;
