import React from "react";
import { Checkbox, Button } from "antd";

const CartFooter = ({
  totalItems,
  selectedCount,
  totalPrice,
  isAllSelected,
  onSelectAll,
  onCheckout,
  loading,
}) => {
  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] p-4 z-50 mt-6">
      <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Left: Select All & Delete All */}
        <div className="flex items-center gap-6 w-full sm:w-auto">
          <Checkbox
            checked={isAllSelected}
            onChange={(e) => onSelectAll(e.target.checked)}
          >
            Chọn tất cả ({totalItems})
          </Checkbox>
          <button className="text-gray-500 hover:text-red-500 text-sm">
            Xóa mục đã chọn
          </button>
        </div>

        {/* Right: Total & Checkout */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
          <div className="text-right">
            <div className="text-sm text-gray-600">
              Tổng thanh toán ({selectedCount} sản phẩm):
            </div>
            <div className="text-xl sm:text-2xl font-bold text-red-500">
              {totalPrice.toLocaleString()}₫
            </div>
          </div>

          <Button
            type="primary"
            size="large"
            className="w-32 sm:w-48 h-10 sm:h-12 !bg-primary !border-red-500 hover:!bg-red-600"
            disabled={selectedCount === 0}
            onClick={onCheckout}
            loading={loading}
          >
            Mua Hàng
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartFooter;
