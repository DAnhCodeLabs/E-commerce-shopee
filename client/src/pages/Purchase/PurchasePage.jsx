import React, { useState, useEffect } from "react";
import { Tabs, Spin, Empty, Input, Breadcrumb } from "antd";
import { SearchOutlined, HomeOutlined } from "@ant-design/icons";
import OrderCard from "./components/OrderCard";
import { Link } from "react-router-dom";
import { httpGet } from "../../services/httpService";
import Loader from "../../components/common/Loader";

const { TabPane } = Tabs;

const PurchasePage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchText, setSearchText] = useState("");

  // 1. Fetch Orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      // API này đã được viết ở bước trước: getMyOrders
      const response = await httpGet("/user/my-orders");
      if (response.success) {
        setOrders(response.data || []);
      }
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 2. Logic Lọc Đơn hàng theo Tab
  // Vì số lượng đơn hàng cá nhân thường không quá lớn (vài trăm),
  // ta có thể filter phía Client cho mượt thay vì gọi API liên tục.
  const getFilteredOrders = () => {
    let filtered = orders;

    // Lọc theo Tab Status
    if (activeTab !== "all") {
      filtered = filtered.filter((order) => order.orderStatus === activeTab);
    }

    // Lọc theo Tìm kiếm (Tên Shop hoặc Tên Sản phẩm)
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      filtered = filtered.filter((order) => {
        const shopName = order.shop?.shop?.shopName?.toLowerCase() || "";
        const hasProduct = order.orderItems.some((item) =>
          item.name.toLowerCase().includes(lowerSearch)
        );
        return shopName.includes(lowerSearch) || hasProduct;
      });
    }

    return filtered;
  };

  const filteredOrders = getFilteredOrders();

  // Định nghĩa các Tabs
  const tabs = [
    { key: "all", label: "Tất cả" },
    { key: "PENDING", label: "Chờ xác nhận" },
    { key: "CONFIRMED", label: "Vận chuyển" }, // Gộp Confirmed và Shipping vào UI "Vận chuyển" hoặc tách ra tùy ý
    { key: "SHIPPING", label: "Đang giao" },
    { key: "DELIVERED", label: "Hoàn thành" },
    { key: "CANCELLED", label: "Đã hủy" },
  ];

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
              { title: "Đơn mua" },
            ]}
          />
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Đơn Hàng Của Tôi</h1>
        </div>

        {/* Search & Tabs Container */}
        <div className="bg-white rounded-lg shadow-sm mb-6 sticky top-0 z-40">
          {/* Search Bar */}
          {/* <div className="p-4 border-b border-gray-100 bg-gray-50">
               <Input
                  prefix={<SearchOutlined className="text-gray-400" />}
                  placeholder="Tìm kiếm theo Tên Shop, ID đơn hàng hoặc Tên Sản phẩm"
                  size="large"
                  allowClear
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="max-w-3xl w-full"
               />
           </div> */}

          {/* Tabs */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            size="large"
            className="px-4"
            items={tabs.map((tab) => ({
              label: tab.label,
              key: tab.key,
            }))}
          />
        </div>

        {/* Order List */}
        <div className="order-list">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader size="large" />
            </div>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onRefresh={fetchOrders} // Truyền hàm refresh để gọi lại API khi có thay đổi
              />
            ))
          ) : (
            <div className="bg-white rounded-lg p-12 text-center shadow-sm h-[400px] flex flex-col items-center justify-center">
              <Empty description="Chưa có đơn hàng nào" />
              <Link to="/">
                <button className="mt-4 bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600">
                  Mua sắm ngay
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchasePage;
