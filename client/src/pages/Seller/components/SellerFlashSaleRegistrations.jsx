// src/components/seller/SellerFlashSaleRegistrations.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Card, Tag, Image, message, Space } from "antd";
import { httpDelete, httpGet } from "../../../services/httpService";
import TableActions from "../../../components/common/TableActions";
import FilterPanel from "../../../components/common/FilterPanel";
import CommonTable from "../../../components/common/CommonTable";

const SellerFlashSaleRegistrations = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({});

  const fetchRegistrations = useCallback(
    async (page = 1, pageSize = 10, filterParams = {}) => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: pageSize,
          ...filterParams,
        };

        const response = await httpGet("/seller/flash-sale/myRegistrations", {
          params,
        });

        if (response.success) {
          setData(response.data);
          setPagination({
            current: response.pagination.currentPage,
            pageSize: response.pagination.limit,
            total: response.pagination.totalItems,
          });
        }
      } catch (error) {
        message.error("Lỗi khi tải danh sách đăng ký flash sale");
        console.error("Fetch registrations error:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleTableChange = (newPagination, filters, sorter) => {
    const sortField = sorter.field;
    const sortOrder = sorter.order === "ascend" ? "asc" : "desc";

    let sortQuery = "";
    if (sortField && sortOrder) {
      sortQuery = `${sortField}_${sortOrder}`;
    }

    fetchRegistrations(newPagination.current, newPagination.pageSize, {
      ...filters,
      sort: sortQuery,
    });
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchRegistrations(1, pagination.pageSize, newFilters);
  };

  const handleView = (record) => {
    message.info(`Xem chi tiết đăng ký: ${record._id}`);
    console.log("View record:", record);
  };

  const handleDelete = async (record) => {
    try {
      const response = await httpDelete(
        `/seller/flash-sale/register/${record._id}`
      );

      if (response.success) {
        message.success("Hủy đăng ký flash sale thành công");
        fetchRegistrations(pagination.current, pagination.pageSize, filters);
      }
    } catch (error) {
      console.error("Delete registration error:", error);
    }
  };

  const filterConfig = [
    {
      type: "search",
      key: "search",
      placeholder: "Tìm kiếm theo tên sản phẩm...",
      width: 250,
    },
    {
      type: "dateRange",
      key: "sale_date",
      placeholder: ["Ngày bắt đầu", "Ngày kết thúc"],
    },
  ];

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      width: 200,
      render: (productName, record) => (
        <Space>
          {record.productImage && (
            <Image
              width={50}
              height={50}
              src={record.productImage}
              alt={productName}
              style={{ objectFit: "cover" }}
              fallback="https://via.placeholder.com/50"
            />
          )}
          <div>
            <div style={{ fontWeight: 500 }}>{productName}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              SKU: {record.productSku || "N/A"}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Khung giờ",
      dataIndex: "timeSlotName",
      key: "timeSlotName",
      width: 150,
      render: (timeSlotName, record) => (
        <div>
          <div>{timeSlotName}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {record.startTime}
          </div>
        </div>
      ),
    },
    {
      title: "Ngày sale",
      dataIndex: "sale_date",
      key: "sale_date",
      width: 120,
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
      sorter: true,
    },
    {
      title: "Giá",
      key: "price",
      width: 150,
      render: (_, record) => (
        <div>
          <div
            style={{
              textDecoration: "line-through",
              color: "#999",
              fontSize: "12px",
            }}
          >
            {record.original_price?.toLocaleString("vi-VN")}₫
          </div>
          <div style={{ color: "#ff4d4f", fontWeight: "bold" }}>
            {record.flash_price?.toLocaleString("vi-VN")}₫
          </div>
          <Tag color="red">-{record.discount_percentage}%</Tag>
        </div>
      ),
    },
    {
      title: "Tồn kho",
      key: "stock",
      width: 120,
      render: (_, record) => (
        <div>
          <div>Flash: {record.flash_stock}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            Đã bán: {record.sold_count || 0}
          </div>
        </div>
      ),
    },
    {
      title: "Ngày đăng ký",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
      sorter: true,
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <TableActions
          record={record}
          onView={handleView}
          onDelete={handleDelete}
        />
      ),
    },
  ];

  // Load dữ liệu khi component mount
  useEffect(() => {
    fetchRegistrations(1, pagination.pageSize);
  }, [fetchRegistrations, pagination.pageSize]);

  return (
    <Card title="Danh sách sản phẩm đăng ký Flash Sale" bordered={false}>
      {/* Bộ lọc */}
      <FilterPanel
        config={filterConfig}
        onFilterChange={handleFilterChange}
        initialFilters={{}}
        addLink={{
          to: "/seller/flash-sale_registrations/new",
          label: "Đăng ký Flash Sale mới",
        }}
      />

      {/* Bảng dữ liệu */}
      <CommonTable
        columns={columns}
        data={data}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} bản ghi`,
        }}
        onChange={handleTableChange}
        rowKey="_id"
        scroll={{ x: 1500 }}
      />
    </Card>
  );
};

export default SellerFlashSaleRegistrations;
