// src/pages/Banner.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Card, Image, Tag, Button } from "antd";
import BreadcrumbHeader from "../../components/BreadcrumbHeader";
import { TfiReload } from "react-icons/tfi";
import CommonTable from "../../components/common/CommonTable";
import TableActions from "../../components/common/TableActions";
import { httpGet, httpDelete } from "../../services/httpService";
import { Link, useNavigate } from "react-router-dom";
import FilterPanel from "../../components/FilterPanel";

const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    isActive: undefined,
    dateRange: [],
  });
  const [sorter, setSorter] = useState({
    // Thêm sorter giống User.jsx
    field: "createdAt",
    order: "descend",
  });
  const navigate = useNavigate();

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const [startDate, endDate] = filters.dateRange || [];
      const startDateFilter = startDate ? startDate.toISOString() : undefined;
      const endDateFilter = endDate ? endDate.toISOString() : undefined;

      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...(filters.search && { search: filters.search }),
        ...(filters.isActive !== undefined && { isActive: filters.isActive }),
        ...(startDateFilter && { startDateFilter }),
        ...(endDateFilter && { endDateFilter }),
        sortBy: sorter.field,
        sortOrder: sorter.order === "ascend" ? "asc" : "desc",
      };
      const response = await httpGet("/admin/banners", { params });
      setBanners(response.data);
      setPagination({
        current: response.pagination.currentPage,
        pageSize: response.pagination.limit,
        total: response.pagination.totalItems,
      });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách banner:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, filters, sorter]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleTableChange = (pagination, filters, sorter) => {
    setPagination({
      current: pagination.current,
      pageSize: pagination.pageSize,
      total: pagination.total,
    });
    setSorter({
      field: sorter.field || "createdAt",
      order: sorter.order || "descend",
    });
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      isActive: undefined,
      dateRange: [],
    });
    setPagination((prev) => ({ ...prev, current: 1 }));
    setSorter({ field: "createdAt", order: "descend" }); // Reset sorter giống User.jsx
  };

  const handleEdit = (record) => {
    navigate(`/admin/edit-banner/${record._id}`);
  };

  const handleDelete = async (record) => {
    try {
      const response = await httpDelete(`/admin/banners/${record._id}`);
      fetchBanners();
      message.success(response.message);
    } catch (error) {
      console.error("Lỗi khi xóa banner:", error);
    }
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",
      render: (text, record, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      width: 150,
      align: "center",
      render: (imageUrl) => <Image width={100} src={imageUrl} />,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      align: "center",
      sorter: true,
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Đang hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      sorter: true,
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      sorter: true,
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Hành động",
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

  const filterConfig = [
    {
      type: "search",
      key: "search",
      placeholder: "Tìm kiếm banner",
      width: 200,
    },
    {
      type: "select",
      key: "isActive",
      placeholder: "Lọc theo trạng thái",
      width: 150,
      options: [
        { value: true, label: "Đang hoạt động" },
        { value: false, label: "Không hoạt động" },
      ],
    },
    {
      type: "dateRange",
      key: "dateRange",
      placeholder: ["Ngày bắt đầu", "Ngày kết thúc"],
      width: 280,
    },
  ];

  return (
    <div>
      <BreadcrumbHeader
        title={"Quản lý Banner"}
        breadcrumbItems={[{ title: "Quản lý Banner" }]}
      />
      <Card title="Danh sách Banner" className="w-full !mt-10">
        <FilterPanel
          config={filterConfig}
          onFilterChange={(newFilters) => {
            setFilters(newFilters);
            setPagination((prev) => ({ ...prev, current: 1 }));
          }}
          initialFilters={filters}
          resetIcon={<TfiReload />}
          addLink={{ to: "/admin/add-banner", label: "Thêm banner" }}
        />
        <CommonTable
          columns={columns}
          data={banners}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          rowKey="_id"
        />
      </Card>
    </div>
  );
};

export default Banner;
