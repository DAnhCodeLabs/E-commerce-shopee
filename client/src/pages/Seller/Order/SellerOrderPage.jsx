import React, { useState, useEffect, useMemo } from "react";
import { Tag, message, Space, Button, Popconfirm, Tooltip } from "antd";
import {
  CheckCircleOutlined,
  CarOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";


// Import API
import { httpGet, httpPut } from "../../../services/httpService";
import CommonTable from "../../../components/common/CommonTable";
import FilterPanel from "../../../components/common/FilterPanel";
import TableActions from "../../../components/common/TableActions";

const SellerOrderPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // State cho bộ lọc
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
  });

  // 1. Cấu hình FilterPanel
  const filterConfig = [
    {
      type: "search",
      key: "search",
      placeholder: "Mã đơn, Tên khách...",
      width: 300,
    },
    {
      type: "select",
      key: "status",
      placeholder: "Trạng thái",
      options: [
        { label: "Tất cả", value: "all" },
        { label: "Chờ xác nhận", value: "PENDING" },
        { label: "Đã xác nhận", value: "CONFIRMED" },
        { label: "Đang giao", value: "SHIPPING" },
        { label: "Đã giao", value: "DELIVERED" },
        { label: "Đã hủy", value: "CANCELLED" },
      ],
    },
    // Có thể thêm dateRange nếu API hỗ trợ lọc theo ngày
  ];

  // 2. Gọi API lấy danh sách
  const fetchOrders = async (params = {}) => {
    setLoading(true);
    try {
      const query = {
        page: params.current || pagination.current,
        limit: params.pageSize || pagination.pageSize,
        status: filters.status,
        // search: filters.search, // Nếu API hỗ trợ search
      };

      // Gọi API getSellerOrders đã viết ở backend
      const response = await httpGet("/seller/orders", query);

      if (response.success) {
        setData(response.data);
        setPagination({
          ...pagination,
          current: response.pagination.page,
          total: response.pagination.total,
        });
      }
    } catch (error) {
      console.error(error);
      message.error("Lỗi tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders({ current: 1 }); // Reset về trang 1 khi filter thay đổi
  }, [filters]);

  const handleTableChange = (newPagination) => {
    fetchOrders(newPagination);
  };

  // 3. Xử lý Hành động (Duyệt / Giao / Hủy)
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await httpPut(`/seller/orders/${orderId}/status`, {
        status: newStatus,
      });
      if (response.success) {
        message.success("Cập nhật trạng thái thành công");
        fetchOrders(); // Reload lại bảng
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi cập nhật");
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const response = await httpPut(`/seller/orders/${orderId}/cancel`, {
        reason: "Shop hủy",
      });
      if (response.success) {
        message.success("Đã hủy đơn hàng");
        fetchOrders();
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi hủy đơn");
    }
  };

  // 4. Cấu hình Cột cho CommonTable
  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "_id",
      key: "_id",
      width: 120,
      render: (id) => (
        <span className="font-mono text-xs">#{id.slice(-6).toUpperCase()}</span>
      ),
    },
    {
      title: "Sản phẩm",
      key: "products",
      width: 300,
      render: (_, record) => (
        <div className="flex flex-col gap-2">
          {record.orderItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <img
                src={item.image}
                alt=""
                className="w-8 h-8 object-cover rounded border"
              />
              <div className="flex-1 min-w-0">
                <div className="truncate font-medium">{item.name}</div>
                <div className="text-xs text-gray-500">
                  {item.model_name ? `${item.model_name} x` : "SL: "}
                  {item.quantity}
                </div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      width: 120,
      render: (price) => (
        <span className="font-bold text-red-500">
          {price.toLocaleString()}₫
        </span>
      ),
    },
    {
      title: "Người mua",
      dataIndex: "user",
      key: "user",
      width: 150,
      render: (user) => (
        <div>
          <div>{user?.fullName || "Khách lẻ"}</div>
          {/* <div className="text-xs text-gray-400">{user?.email}</div> */}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "orderStatus",
      key: "status",
      width: 120,
      render: (status) => {
        let color = "default";
        let text = status;
        if (status === "PENDING") {
          color = "orange";
          text = "Chờ xác nhận";
        }
        if (status === "CONFIRMED") {
          color = "blue";
          text = "Chờ lấy hàng";
        }
        if (status === "SHIPPING") {
          color = "cyan";
          text = "Đang giao";
        }
        if (status === "DELIVERED") {
          color = "green";
          text = "Đã giao";
        }
        if (status === "CANCELLED") {
          color = "red";
          text = "Đã hủy";
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 180,
      fixed: "right",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          {/* A. Nút Xem Chi Tiết (Dùng TableActions) */}
          <TableActions
            record={record}
            onView={(r) => navigate(`/seller/orders/${r._id}`)} // Link tới trang chi tiết (sẽ làm sau)
            // Không truyền onEdit, onDelete, onUpdateStatus vì logic đó không khớp
          />

          {/* B. Các nút hành động riêng biệt theo trạng thái */}

          {/* 1. Nút Duyệt đơn (Cho PENDING) */}
          {record.orderStatus === "PENDING" && (
            <Tooltip title="Chuẩn bị hàng">
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleUpdateStatus(record._id, "CONFIRMED")}
              />
            </Tooltip>
          )}

          {/* 2. Nút Giao hàng (Cho CONFIRMED) */}
          {record.orderStatus === "CONFIRMED" && (
            <Tooltip title="Giao cho vận chuyển">
              <Button
                type="primary"
                ghost
                size="small"
                icon={<CarOutlined />}
                onClick={() => handleUpdateStatus(record._id, "SHIPPING")}
              />
            </Tooltip>
          )}

          {/* 3. Nút Hủy đơn (Cho PENDING/CONFIRMED) */}
          {["PENDING", "CONFIRMED"].includes(record.orderStatus) && (
            <Popconfirm
              title="Hủy đơn hàng này?"
              description="Hành động này sẽ hoàn lại tồn kho."
              onConfirm={() => handleCancelOrder(record._id)}
              okText="Hủy đơn"
              cancelText="Không"
            >
              <Tooltip title="Hủy đơn">
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<CloseCircleOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">Quản lý Đơn hàng</h2>

      {/* Tích hợp FilterPanel */}
      <FilterPanel
        config={filterConfig}
        onFilterChange={(newFilters) =>
          setFilters((prev) => ({ ...prev, ...newFilters }))
        }
        // Không cần nút Thêm mới đơn hàng
      />

      {/* Tích hợp CommonTable */}
      <CommonTable
        columns={columns}
        data={data}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        rowKey="_id"
      />
    </div>
  );
};

export default SellerOrderPage;
