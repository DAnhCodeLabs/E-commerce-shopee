import React, { useState, useEffect, useCallback } from "react";
import { Button, Card, Image, Tag } from "antd";
import { httpDelete, httpGet, httpPatch } from "../../services/httpService";
import BreadcrumbHeader from "../../components/BreadcrumbHeader";
import FilterPanel from "../../components/FilterPanel";
import CommonTable from "../../components/common/CommonTable";
import TableActions from "../../components/common/TableActions";
import { Link } from "react-router-dom";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    is_active: null,
  });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      // Xây dựng query string từ state pagination và filters
      const params = new URLSearchParams({
        page: pagination.current,
        limit: pagination.pageSize,
        search: filters.search,
      });
      if (filters.is_active !== null) {
        params.append("is_active", filters.is_active);
      }

      const response = await httpGet(`/admin/categories?${params.toString()}`);

      setCategories(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination.totalItems,
      }));
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, filters]);
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
    setPagination((prev) => ({ ...prev, current: 1 }));
  };
  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const handleDelete = async (record) => {
    try {
      setLoading(true);
      await httpDelete(`/admin/category/${record._id}`);
      fetchCategories();
    } catch (error) {
      console.error("Lỗi khi xóa danh mục:", error);
      setLoading(false);
    }
  };

   const handleUpdateStatus = async (record) => {
     try {
       setLoading(true);
       const apiUrl = `/admin/category/${record._id}/status`;
       await httpPatch(apiUrl);
       fetchCategories();
     } catch (error) {
       console.error("Lỗi khi cập nhật trạng thái:", error);
       setLoading(false);
     }
   };

  const filterConfig = [
    {
      type: "search",
      key: "search",
      placeholder: "Tìm kiếm theo tên danh mục...",
    },
    {
      type: "select",
      key: "is_active",
      placeholder: "Lọc theo trạng thái",
      options: [
        { value: true, label: "Hoạt động" },
        { value: false, label: "Bị khóa" },
      ],
    },
  ];

  const columns = [
    {
      title: "Tên danh mục",
      dataIndex: "display_name",
      key: "display_name",
      render: (text, record) => (
        <span style={{ paddingLeft: record.parent_category_id ? 24 : 0 }}>
          {text}
        </span>
      ),
    },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      width: 200,
      align: "center",
      render: (image) =>
        image ? <Image width={50} height={50} src={image} /> : "N/A",
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      sorter: true,
      width: 120,
      align: "center",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hoạt động" : "Bị khóa"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 150,
      align: "center",
      render: (_, record) => (
        <TableActions
          record={record}
          onDelete={handleDelete}
          onUpdateStatus={handleUpdateStatus}
        />
      ),
    },
  ];

  return (
    <div>
      <BreadcrumbHeader
        title={"Quản lý danh mục"}
        breadcrumbItems={[{ title: "Quản lý danh mục" }]}
      />
      <Card title="Bộ lọc và tìm kiếm" style={{ marginBottom: 16 }}>
        <FilterPanel
          config={filterConfig}
          onFilterChange={handleFilterChange}
          addLink={{
            to: "/admin/create-parent-category",
            label: "Thêm Danh mục",
          }}
        />
      </Card>
      <Card title="Danh sách danh mục">
        <CommonTable
          columns={columns}
          data={categories}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          rowKey="_id"
        />
      </Card>
    </div>
  );
};

export default Category;
