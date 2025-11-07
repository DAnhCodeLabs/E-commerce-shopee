// src/pages/admin/Attribute.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Card, Tag } from "antd";
import BreadcrumbHeader from "../../components/BreadcrumbHeader";
import FilterPanel from "../../components/FilterPanel";
import { httpGet } from "../../services/httpService";
import CommonTable from "../../components/common/CommonTable";
import TableActions from "../../components/common/TableActions";
import { useNavigate } from "react-router-dom";

const Attribute = () => {
  const navigate = useNavigate();
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });
  const [filters, setFilters] = useState({});

  // SỬA ĐỔI NẰM TRONG HÀM NÀY
  const fetchAttributes = useCallback(
    async (page, currentFilters) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page,
          limit: pagination.limit,
          ...currentFilters,
        });

        const response = await httpGet(
          `/admin/attributes?${params.toString()}`
        );

        setAttributes(response.data);

        // --- SỬA LỖI TẠI ĐÂY ---
        // Thay vì ghi đè state...
        // setPagination(response.pagination);

        // ...hãy kết hợp state cũ và dữ liệu mới để không làm mất 'limit'
        setPagination((prevPaginationState) => ({
          ...prevPaginationState,
          ...response.pagination,
        }));
        // --- KẾT THÚC SỬA LỖI ---
      } catch (error) {
        console.error("Lỗi khi lấy danh sách thuộc tính:", error);
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit]
  ); // Dependency vẫn giữ nguyên

  useEffect(() => {
    fetchAttributes(pagination.currentPage, filters);
  }, [pagination.currentPage, filters, fetchAttributes]);

  const handleFilterChange = (newFilters) => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    setFilters(newFilters);
  };

  const handleTableChange = (pagination) => {
    setPagination((prev) => ({ ...prev, currentPage: pagination.current }));
  };

  const handleEdit = (record) => {
    console.log("Chỉnh sửa:", record);
  };

  const handleDelete = (record) => {
    console.log("Xóa:", record);
  };

  const filterConfig = [
    {
      type: "search",
      key: "search",
      placeholder: "Tìm theo tên hoặc nhãn...",
      width: 250,
    },
    {
      type: "select",
      key: "input_type",
      placeholder: "Lọc theo loại",
      width: 180,
      options: [
        { value: "text", label: "Text" },
        { value: "number", label: "Number" },
        { value: "select", label: "Select" },
        { value: "multiselect", label: "Multi-select" },
      ],
    },
  ];

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",
      render: (_, record, index) =>
        (pagination.currentPage - 1) * pagination.limit + index + 1,
    },
    {
      title: "Nhãn Hiển Thị",
      dataIndex: "label",
      key: "label",
      sorter: (a, b) => a.label.localeCompare(b.label),
    },
    {
      title: "Tên Hệ Thống",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Loại Nhập Liệu",
      dataIndex: "input_type",
      key: "input_type",
      align: "center",
      render: (type) => {
        let color = "geekblue";
        if (type === "select" || type === "multiselect") color = "green";
        if (type === "number") color = "volcano";
        return <Tag color={color}>{type.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Hành Động",
      key: "action",
      align: "center",
      width: 120,
      render: (_, record) => (
        <TableActions
          record={record}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ),
    },
  ];

  return (
    <div>
      <BreadcrumbHeader
        title={"Quản lý thuộc tính"}
        breadcrumbItems={[{ title: "Quản lý thuộc tính" }]}
      />
      <Card title="Bộ lọc và tìm kiếm" style={{ marginBottom: 16 }}>
        <FilterPanel
          config={filterConfig}
          onFilterChange={handleFilterChange}
          addLink={{
            to: "/admin/create-attribute",
            label: "Thêm Thuộc Tính",
          }}
        />
      </Card>
      <Card title="Danh sách thuộc tính">
        <CommonTable
          columns={columns}
          data={attributes}
          loading={loading}
          onChange={handleTableChange}
          pagination={{
            current: pagination.currentPage,
            pageSize: pagination.limit,
            total: pagination.totalItems,
          }}
        />
      </Card>
    </div>
  );
};

export default Attribute;
