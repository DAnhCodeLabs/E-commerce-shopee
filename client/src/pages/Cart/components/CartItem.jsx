import React from "react";
import { Checkbox, Image, Popconfirm, Button } from "antd";
import { DeleteOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const CartItem = ({ item, isChecked, onCheck, onUpdateQuantity, onDelete }) => {
  const { product_id: product, model_id, quantity } = item;

  // 1. Xác định thông tin hiển thị
  let displayInfo = {
    image: product.images?.[0],
    name: product.name,
    variantName: null,
    price: product.price,
    sale_price: product.sale_price,
    stock: product.stock,
    slug: product.slug,
  };

  if (product.has_model && model_id) {
    const variant = product.models.find(
      (m) => m._id.toString() === model_id.toString()
    );

    if (variant) {
      displayInfo.name = product.name;
      displayInfo.variantName = variant.name;
      displayInfo.price = variant.price;
      displayInfo.sale_price = variant.sale_price;
      displayInfo.stock = variant.stock;
    }
  }

  const finalPrice = displayInfo.sale_price || displayInfo.price;
  const isSale = displayInfo.sale_price < displayInfo.price;
  const isOutOfStock = displayInfo.stock <= 0;

  // Xử lý tăng giảm số lượng
  const handleDecrease = () => {
    if (quantity > 1) onUpdateQuantity(item, quantity - 1);
  };

  const handleIncrease = () => {
    if (quantity < displayInfo.stock) onUpdateQuantity(item, quantity + 1);
  };

  const handleInputChange = (e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val >= 1 && val <= displayInfo.stock) {
      onUpdateQuantity(item, val);
    }
  };

  return (
    <div
      className={`cart-item py-4 px-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${
        isOutOfStock ? "opacity-60 bg-gray-50" : ""
      }`}
    >
      {/* Layout Grid cho Desktop */}
      <div className="hidden md:grid grid-cols-12 gap-4 items-center">
        {/* Cột 1: Checkbox & Sản phẩm (Chiếm 6 phần) */}
        <div className="col-span-5 flex items-center gap-4">
          <Checkbox
            checked={isChecked}
            onChange={(e) => onCheck(item._id, e.target.checked)}
            disabled={isOutOfStock}
          />

          <div className="w-20 h-20 flex-shrink-0 border border-gray-200 rounded-md overflow-hidden bg-white">
            <Image
              src={displayInfo.image}
              alt={displayInfo.name}
              className="w-full h-full object-contain"
              preview={false}
            />
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <Link
              to={`/products/${displayInfo.slug}`}
              className="text-gray-800 font-medium hover:text-blue-600 line-clamp-2 text-sm mb-1"
            >
              {displayInfo.name}
            </Link>
            {displayInfo.variantName && (
              <div className="text-xs text-gray-500 bg-gray-100 inline-block px-2 py-0.5 rounded border border-gray-200">
                Phân loại: {displayInfo.variantName}
              </div>
            )}
          </div>
        </div>

        {/* Cột 2: Đơn giá (Chiếm 2 phần) */}
        <div className="col-span-2 text-center">
          {isSale && (
            <div className="text-gray-400 line-through text-xs">
              {displayInfo.price?.toLocaleString()}₫
            </div>
          )}
          <div className="text-gray-900 font-medium">
            {finalPrice?.toLocaleString()}₫
          </div>
        </div>

        {/* Cột 3: Số lượng (Chiếm 2 phần) - CUSTOM INPUT */}
        <div className="col-span-2 flex flex-col items-center">
          <div className="flex items-center border border-gray-300 rounded">
            <button
              onClick={handleDecrease}
              disabled={quantity <= 1 || isOutOfStock}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border-r border-gray-300 transition-colors"
            >
              <MinusOutlined className="text-xs" />
            </button>
            <input
              type="text"
              value={quantity}
              onChange={handleInputChange}
              disabled={isOutOfStock}
              className="w-10 h-8 text-center text-sm font-medium text-gray-800 focus:outline-none"
            />
            <button
              onClick={handleIncrease}
              disabled={quantity >= displayInfo.stock || isOutOfStock}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border-l border-gray-300 transition-colors"
            >
              <PlusOutlined className="text-xs" />
            </button>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Còn {displayInfo.stock} sản phẩm
          </div>
        </div>

        {/* Cột 4: Thành tiền (Chiếm 2 phần) */}
        <div className="col-span-2 text-center font-bold text-red-500 text-base">
          {(finalPrice * quantity).toLocaleString()}₫
        </div>

        {/* Cột 5: Xóa (Chiếm 1 phần) */}
        <div className="col-span-1 text-right">
          <Popconfirm
            title="Xóa sản phẩm"
            description="Bạn có chắc muốn xóa?"
            onConfirm={() => onDelete(item)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              className="hover:bg-red-50"
            />
          </Popconfirm>
        </div>
      </div>

      {/* Layout Mobile (Giữ nguyên hoặc tùy chỉnh đơn giản hơn) */}
      <div className="flex md:hidden gap-3 items-start">
        <Checkbox
          checked={isChecked}
          onChange={(e) => onCheck(item._id, e.target.checked)}
          disabled={isOutOfStock}
          className="mt-1"
        />
        <div className="w-20 h-20 border border-gray-200 rounded flex-shrink-0">
          <img
            src={displayInfo.image}
            className="w-full h-full object-cover"
            alt=""
          />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium line-clamp-2 mb-1">
            {displayInfo.name}
          </div>
          {displayInfo.variantName && (
            <div className="text-xs text-gray-500 mb-1">
              PL: {displayInfo.variantName}
            </div>
          )}
          <div className="flex justify-between items-end mt-2">
            <div className="text-red-500 font-bold">
              {finalPrice?.toLocaleString()}₫
            </div>
            {/* Mobile Quantity Control */}
            <div className="flex items-center border border-gray-300 rounded h-7">
              <button
                onClick={handleDecrease}
                className="px-2 border-r border-gray-300 text-gray-500"
              >
                -
              </button>
              <span className="px-2 text-sm">{quantity}</span>
              <button
                onClick={handleIncrease}
                className="px-2 border-l border-gray-300 text-gray-500"
              >
                +
              </button>
            </div>
          </div>
        </div>
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onDelete(item)}
        />
      </div>
    </div>
  );
};

export default CartItem;
