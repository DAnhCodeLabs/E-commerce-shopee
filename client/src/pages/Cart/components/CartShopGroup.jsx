import React from "react";
import { Checkbox, Divider } from "antd";
import { ShopOutlined } from "@ant-design/icons";
import CartItem from "./CartItem";
import { Link } from "react-router-dom";

const CartShopGroup = ({
  shopInfo,
  items,
  selectedItems, // Set chứa các ID đã chọn
  onCheckItem,
  onCheckShop,
  onUpdateQuantity,
  onDelete,
}) => {
  // Logic: Kiểm tra xem tất cả item trong shop này đã được chọn chưa
  // Chỉ tính các item còn hàng (stock > 0)
  const availableItems = items.filter((item) => {
    // Check sơ bộ tồn kho (logic chi tiết hơn nằm trong CartItem nhưng ở đây cần check để tính select all)
    const product = item.product_id;
    return (
      product.stock > 0 ||
      (product.has_model && product.models.some((m) => m.stock > 0))
    );
  });

  const isAllShopSelected =
    availableItems.length > 0 &&
    availableItems.every((item) => selectedItems.has(item._id));
  const isIndeterminate =
    availableItems.some((item) => selectedItems.has(item._id)) &&
    !isAllShopSelected;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 overflow-hidden">
      {/* Header Shop */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
        <Checkbox
          checked={isAllShopSelected}
          indeterminate={isIndeterminate}
          onChange={(e) => onCheckShop(items, e.target.checked)}
        />

        <div className="flex items-center gap-2">
          <ShopOutlined className="text-gray-500" />
          <Link
            to={`/shop/${shopInfo?._id}`}
            className="font-medium text-gray-800 hover:text-blue-600"
          >
            {shopInfo?.shopName || "Cửa hàng không xác định"}
          </Link>
          {/* Nút Chat ngay có thể thêm ở đây */}
        </div>
      </div>

      {/* List Items */}
      <div className="px-4">
        {items.map((item, index) => (
          <CartItem
            key={item._id}
            item={item}
            isChecked={selectedItems.has(item._id)}
            onCheck={onCheckItem}
            onUpdateQuantity={onUpdateQuantity}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default CartShopGroup;
