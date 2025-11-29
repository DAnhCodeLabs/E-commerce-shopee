// FlashSaleTimeSlotList.jsx
import React, { useState, useEffect } from "react";
import { Card, Tag, message } from "antd";
import { httpDelete, httpGet } from "../../services/httpService";
import TableActions from "../../components/common/TableActions";
import FilterPanel from "../../components/FilterPanel";
import CommonTable from "../../components/common/CommonTable";

const FlashSaleTimeSlotList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [sort, setSort] = useState({
    field: "start_time",
    order: "asc",
  });

  // Fetch data từ API
  const fetchTimeSlots = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
        sort: `${sort.field}_${sort.order}`,
      };

      const response = await httpGet("/admin/flash-sale/slots", { params });

      setData(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination.totalItems,
      }));
    } catch (error) {
      console.error("Fetch flash sale time slots error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeSlots();
  }, [filters, pagination.current, pagination.pageSize, sort]);

  // Xử lý filter change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, current: 1 })); // Reset về trang 1 khi filter
  };

  // Xử lý table change (phân trang, sắp xếp)
  const handleTableChange = (newPagination, newFilters, newSorter) => {
    const { current, pageSize } = newPagination;
    setPagination((prev) => ({ ...prev, current, pageSize }));

    if (newSorter && newSorter.field) {
      setSort({
        field: newSorter.field,
        order: newSorter.order === "ascend" ? "asc" : "desc",
      });
    }
  };

  // Xóa khung giờ
  const handleDelete = async (record) => {
    try {
      await httpDelete(`/admin/flash-sale/slots/${record._id}`);
      message.success("Xóa khung giờ thành công");
      fetchTimeSlots(); // Load lại dữ liệu
    } catch (error) {
      // Error đã được xử lý trong interceptor
    }
  };

  // Cấu hình filter panel
  const filterConfig = [
    {
      type: "search",
      key: "search",
      placeholder: "Tìm kiếm theo tên...",
      width: 250,
    },
    {
      type: "select",
      key: "is_active",
      placeholder: "Trạng thái",
      width: 150,
      options: [
        { value: "true", label: "Đang kích hoạt" },
        { value: "false", label: "Đã khóa" },
      ],
    },
  ];

  // Định nghĩa columns cho bảng
  const columns = [
    {
      title: "Tên khung giờ",
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortOrder:
        sort.field === "name" && (sort.order === "asc" ? "ascend" : "descend"),
    },
    {
      title: "Giờ bắt đầu",
      dataIndex: "start_time",
      key: "start_time",
      sorter: true,
      sortOrder:
        sort.field === "start_time" &&
        (sort.order === "asc" ? "ascend" : "descend"),
      render: (time) => <span className="font-mono">{time}</span>,
    },
    {
      title: "Giờ kết thúc",
      dataIndex: "end_time",
      key: "end_time",
      sorter: true,
      sortOrder:
        sort.field === "end_time" &&
        (sort.order === "asc" ? "ascend" : "descend"),
      render: (time) => <span className="font-mono">{time}</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Đang kích hoạt" : "Đã khóa"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <TableActions
          record={record}
          onDelete={handleDelete}
          // Có thể thêm onView, onEdit, onUpdateStatus khi có API tương ứng
        />
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card
        title="Quản lý khung giờ Flash Sale"
        bordered={false}
        className="shadow-lg"
      >
        {/* Filter Panel */}
        <FilterPanel
          config={filterConfig}
          onFilterChange={handleFilterChange}
          addLink={{
            to: "/admin/create-flashsaletimeslot",
            label: "Thêm khung giờ mới",
          }}
        />

        {/* Data Table */}
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
              `Hiển thị ${range[0]}-${range[1]} trong tổng ${total} khung giờ`,
            pageSizeOptions: ["10", "20", "50"],
          }}
          onChange={handleTableChange}
          rowKey="_id"
        />
      </Card>
    </div>
  );
};

export default FlashSaleTimeSlotList;
