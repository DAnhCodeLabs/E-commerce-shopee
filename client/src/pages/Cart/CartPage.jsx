import React, { useState, useEffect, useMemo } from "react";
import { Spin, Empty, message, Breadcrumb } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

import CartShopGroup from "./components/CartShopGroup";
import CartFooter from "./components/CartFooter";
import { httpDelete, httpGet, httpPut } from "../../services/httpService";
import Loader from "../../components/common/Loader";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const navigate = useNavigate();

  // 1. Fetch Cart Data (Gọi trực tiếp httpGet)
  const fetchCart = async () => {
    try {
      const response = await httpGet("/user/cart");
      if (response.success) {
        // Kiểm tra dữ liệu trả về có đúng cấu trúc không
        setCartItems(response.data.cart_items || []);
      }
    } catch (error) {
      console.error("Lỗi tải giỏ hàng:", error);
      // Tùy chọn: message.error("Không thể tải giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // 2. Hàm gom nhóm theo Shop (Logic giữ nguyên)
  const groupedItems = useMemo(() => {
    const groups = {};
    cartItems.forEach((item) => {
      // product_id đã populate shop_id (là Account), Account có field 'shop'
      const shopInfo = item.product_id?.shop_id?.shop || {};
      const shopId = item.product_id?.shop_id?._id || "unknown";

      if (!groups[shopId]) {
        groups[shopId] = {
          shopInfo: { ...shopInfo, _id: shopId },
          items: [],
        };
      }
      groups[shopId].items.push(item);
    });
    return Object.values(groups);
  }, [cartItems]);

  // 3. Tính toán tổng tiền (Logic giữ nguyên)
  const { totalPrice, totalCount } = useMemo(() => {
    let total = 0;
    let count = 0;

    cartItems.forEach((item) => {
      if (selectedItems.has(item._id)) {
        const product = item.product_id;
        let price = product.sale_price || product.price;

        if (product.has_model && item.model_id) {
          const variant = product.models.find(
            (m) => m._id.toString() === item.model_id.toString()
          );
          if (variant) {
            price = variant.sale_price || variant.price;
          }
        }

        total += price * item.quantity;
        count += item.quantity;
      }
    });

    return { totalPrice: total, totalCount: count };
  }, [cartItems, selectedItems]);

  // 4. Các hàm xử lý hành động

  // Chọn 1 item
  const handleCheckItem = (itemId, checked) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  // Chọn cả Shop
  const handleCheckShop = (shopItems, checked) => {
    const newSelected = new Set(selectedItems);
    shopItems.forEach((item) => {
      const product = item.product_id;
      // Logic check stock sơ bộ
      const isOutOfStock =
        product.stock <= 0 &&
        (!product.has_model || product.models.every((m) => m.stock <= 0));

      if (!isOutOfStock) {
        if (checked) newSelected.add(item._id);
        else newSelected.delete(item._id);
      }
    });
    setSelectedItems(newSelected);
  };

  // Chọn tất cả
  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = new Set();
      cartItems.forEach((item) => {
        const product = item.product_id;
        if (product.isActive) allIds.add(item._id);
      });
      setSelectedItems(allIds);
    } else {
      setSelectedItems(new Set());
    }
  };

  // Cập nhật số lượng (Gọi trực tiếp httpPut)
  const handleUpdateQuantity = async (item, newQuantity) => {
    // Optimistic UI update
    const oldItems = [...cartItems];
    const updatedItems = cartItems.map((i) =>
      i._id === item._id ? { ...i, quantity: newQuantity } : i
    );
    setCartItems(updatedItems);

    try {
      // Gọi API
      await httpPut("/user/update", {
        product_id: item.product_id._id,
        model_id: item.model_id,
        quantity: newQuantity,
      });
    } catch (error) {
      // Revert nếu lỗi
      setCartItems(oldItems);
      const errMsg = error.response?.data?.message || "Lỗi cập nhật số lượng";
      message.error(errMsg);
    }
  };

const handleDelete = async (item) => {
  try {
    // --- SỬA LỖI TẠI ĐÂY ---
    // Đối với DELETE, dữ liệu body phải nằm trong key 'data'
    await httpDelete("/user/remove", {
      data: {
        product_id: item.product_id._id,
        model_id: item.model_id,
      },
    });
    // -----------------------

    message.success("Đã xóa sản phẩm");

    // Update State
    setCartItems((prev) => prev.filter((i) => i._id !== item._id));
    const newSelected = new Set(selectedItems);
    newSelected.delete(item._id);
    setSelectedItems(newSelected);
  } catch (error) {
    console.error("Delete error:", error);
    message.error("Lỗi xóa sản phẩm");
  }
};
  // Checkout
  const handleCheckout = () => {
    if (selectedItems.size === 0) {
      message.warning("Vui lòng chọn sản phẩm để thanh toán");
      return;
    }

    const checkoutData = cartItems.filter((item) =>
      selectedItems.has(item._id)
    );
    console.log("Checkout Data:", checkoutData);
    message.info("Chuyển sang trang thanh toán...");
    navigate("/checkout", { state: { items: checkoutData } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <Loader size="large" tip="Đang tải giỏ hàng..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb
            items={[
              {
                title: (
                  <Link to="/">
                    <HomeOutlined /> Trang chủ
                  </Link>
                ),
              },
              { title: "Giỏ hàng" },
            ]}
          />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Giỏ Hàng Của Bạn
        </h1>

        {cartItems.length > 0 ? (
          <>
            {/* Header List (Desktop only) */}
            <div className="hidden md:grid grid-cols-12 gap-4 bg-white px-4 py-3 rounded-t-lg shadow-sm border-b border-gray-200 text-gray-500 font-medium text-sm">
              {/* Khớp với col-span-5 của CartItem */}
              <div className="col-span-5 flex items-center gap-3">
                <span className="pl-8">Sản phẩm</span>{" "}
                {/* pl-8 để né vị trí checkbox */}
              </div>

              {/* Khớp với col-span-2 */}
              <div className="col-span-2 text-center">Đơn giá</div>

              {/* Khớp với col-span-2 */}
              <div className="col-span-2 text-center">Số lượng</div>

              {/* Khớp với col-span-2 */}
              <div className="col-span-2 text-center">Số tiền</div>

              {/* Khớp với col-span-1 */}
              <div className="col-span-1 text-right pr-2">Thao tác</div>
            </div>

            {/* Groups */}
            <div className="space-y-4">
              {groupedItems.map((group) => (
                <CartShopGroup
                  key={group.shopInfo._id}
                  shopInfo={group.shopInfo}
                  items={group.items}
                  selectedItems={selectedItems}
                  onCheckItem={handleCheckItem}
                  onCheckShop={handleCheckShop}
                  onUpdateQuantity={handleUpdateQuantity}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Sticky Footer */}
            <CartFooter
              totalItems={cartItems.length}
              selectedCount={selectedItems.size}
              totalPrice={totalPrice}
              isAllSelected={
                cartItems.length > 0 && selectedItems.size === cartItems.length
              }
              onSelectAll={handleSelectAll}
              onCheckout={handleCheckout}
            />
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Empty description="Giỏ hàng của bạn đang trống" />
            <Link to="/">
              <button className="mt-6 bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition-colors">
                Mua sắm ngay
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
