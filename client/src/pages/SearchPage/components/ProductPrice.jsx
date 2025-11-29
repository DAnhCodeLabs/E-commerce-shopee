import React, { useState } from "react";
import { InputNumber, Space } from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";

const ProductPrice = ({
  price = 0,
  sale_price = 0,
  discount_percentage = 0,
  stock = 0,
  currentModel = null,
  onQuantityChange,
}) => {
  const [quantity, setQuantity] = useState(1);

  // Sử dụng giá từ model nếu có, ngược lại dùng giá sản phẩm
  const displayPrice =
    currentModel?.sale_price || currentModel?.price || sale_price || price;
  const originalPrice = currentModel?.price || price;
  const displayDiscount =
    currentModel?.discount_percentage || discount_percentage;
  const availableStock = currentModel?.stock || stock;

  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(1, Math.min(value, availableStock));
    setQuantity(newQuantity);
    if (onQuantityChange) {
      onQuantityChange(newQuantity);
    }
  };

  const incrementQuantity = () => {
    handleQuantityChange(quantity + 1);
  };

  const decrementQuantity = () => {
    handleQuantityChange(quantity - 1);
  };

  return (
    <div className="product-price space-y-4">
      {/* Price Display */}
      <div className="price-section">
        {displayDiscount > 0 ? (
          <div className="flex items-center gap-3">
            <span className="text-3xl font-medium text-red-500">
              {displayPrice.toLocaleString("vi-VN")} ₫
            </span>
            <span className="text-lg text-gray-500 line-through">
              {originalPrice.toLocaleString("vi-VN")} ₫
            </span>
            <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
              -{displayDiscount}%
            </span>
          </div>
        ) : (
          <span className="text-3xl font-bold text-red-500">
            {displayPrice.toLocaleString("vi-VN")} ₫
          </span>
        )}
      </div>

      <div className="quantity-section">
        <div className="flex items-center gap-4">
          <span className="text-gray-700 font-medium">Số lượng:</span>

          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={decrementQuantity}
              disabled={quantity <= 1}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <MinusOutlined />
            </button>

            <InputNumber
              min={1}
              max={availableStock}
              value={quantity}
              onChange={handleQuantityChange}
              controls={false}
              className="!border-0 !shadow-none !w-16 !px-[12px] text-center [&_.ant-input-number-input]:text-center"
            />

            <button
              onClick={incrementQuantity}
              disabled={quantity >= availableStock}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <PlusOutlined />
            </button>
          </div>

          <span className="text-sm text-gray-500">
            {availableStock.toLocaleString()} sản phẩm có sẵn
          </span>
        </div>
      </div>

      {/* Stock Warning */}
      {availableStock < 10 && availableStock > 0 && (
        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          ⚠️ Chỉ còn {availableStock} sản phẩm
        </div>
      )}

      {availableStock === 0 && (
        <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
          ❌ Sản phẩm tạm thời hết hàng
        </div>
      )}
    </div>
  );
};

export default ProductPrice;
