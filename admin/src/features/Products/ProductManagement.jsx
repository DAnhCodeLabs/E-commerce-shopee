
import React, { useState, useEffect, useCallback } from "react";
import { Card, Tag, message, Tooltip } from "antd";
import { httpGet, httpDelete, httpPatch } from "../../services/httpService";
import TableActions from "../../components/common/TableActions";
import FilterPanel from "../../components/FilterPanel";
import CommonTable from "../../components/common/CommonTable";
import { useNavigate } from "react-router-dom";

const ProductManagement = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({});
  const [categoryOptions, setCategoryOptions] = useState([]);
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await httpGet("/admin/categories");
        if (response.success) {
          setCategoryOptions(
            response.data.map((cat) => ({
              value: cat._id,
              label: cat.display_name,
            }))
          );
        } else {
          setCategoryOptions([]);
        }
      } catch (error) {
        console.error("Load categories error:", error);
        setCategoryOptions([]);
      }
    };
    loadCategories();
  }, []);

  const filterConfig = [
    {
      type: "search",
      key: "search",
      placeholder: "Tìm theo tên, Tên shop...",
      width: 250,
    },
    {
      type: "select",
      key: "isActive",
      placeholder: "Trạng thái",
      options: [
        { value: "true", label: "Mở khóa" },
        { value: "false", label: "Khóa" },
      ],
    },
    {
      type: "select",
      key: "has_model",
      placeholder: "Loại sản phẩm",
      options: [
        { value: "true", label: "Có biến thể" },
        { value: "false", label: "Không biến thể" },
      ],
    },
    {
      type: "select",
      key: "category",
      placeholder: "Danh mục",
      options: categoryOptions,
    },
  ];

  const fetchProducts = useCallback(
    async (params = {}) => {
      try {
        setLoading(true);

        const queryParams = {
          page: params.current || pagination.current,
          limit: params.pageSize || pagination.pageSize,
          ...filters,
          ...params,
        };

        const apiEndpoint = "/admin/products";
        const response = await httpGet(apiEndpoint, {
          params: queryParams,
        });

        if (response.success) {
          setProducts(response.data);
          setPagination({
            current: response.pagination.currentPage,
            pageSize: response.pagination.limit,
            total: response.pagination.totalItems,
          });
        }
      } catch (error) {
        message.error("Lỗi khi tải danh sách sản phẩm");
        console.error("Fetch products error:", error);
      } finally {
        setLoading(false);
      }
    },
    [pagination.current, pagination.pageSize, filters, categoryOptions]
  );

  useEffect(() => {
    fetchProducts({ current: 1, ...filters });
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleTableChange = (newPagination, filters, sorter) => {
    const params = {
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      sort: sorter.field
        ? `${sorter.field}_${sorter.order === "ascend" ? "asc" : "desc"}`
        : undefined,
    };
    fetchProducts(params);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const columns = [
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      width: 250,
      sorter: true,
      render: (name) => {
        const productName = name || "";
        const isLong = productName.length > 50;
        const truncatedName = isLong
          ? `${productName.substring(0, 50)}...`
          : productName;
        return (
          <Tooltip title={productName}>
            <span>{truncatedName}</span>
          </Tooltip>
        );
      },
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: 150,
      sorter: true,
      render: (price, record) => {
        const originalPrice = price;
        const discount = record.discount_percentage || 0;
        const salePrice = record.sale_price;
        if (discount === 0 || record.has_model) {
          return <span>{originalPrice?.toLocaleString()}₫</span>;
        }
        return (
          <div style={{ lineHeight: 1.4 }}>
            <span
              style={{
                textDecoration: "line-through",
                color: "#888",
                fontSize: "12px",
              }}
            >
              {originalPrice?.toLocaleString()}₫
            </span>

            <div
              style={{
                color: "#d0011b",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              {salePrice?.toLocaleString()}₫
            </div>
            <Tag
              color="red"
              style={{
                fontSize: "10px",
                lineHeight: "14px",
                padding: "0 4px",
                margin: 0,
              }}
            >
              -{discount}%
            </Tag>
          </div>
        );
      },
    },
    {
      title: "Tồn kho",
      dataIndex: "totalStock",
      key: "totalStock",
      width: 100,
      render: (stock) => <Tag color={stock > 0 ? "green" : "red"}>{stock}</Tag>,
    },
    {
      title: "Cửa hàng",
      dataIndex: "shopName",
      key: "shopName",
      width: 150,
      ellipsis: true,
    },
    {
      title: "Danh mục",
      dataIndex: "categoryName",
      key: "categoryName",
      width: 120,
    },
    {
      title: "Loại",
      dataIndex: "has_model",
      key: "has_model",
      width: 100,
      render: (hasModel) => (
        <Tag color={hasModel ? "blue" : "default"}>
          {hasModel ? "Có biến thể" : "Đơn giản"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái (Admin)",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      render: (isActive) => {
        const config = isActive
          ? { color: "green", text: "Mở khóa" }
          : { color: "red", text: "Đã khóa" };

        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
      sorter: true,
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <TableActions
          record={record}
          onView={handleView}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDelete}
        />
      ),
    },
  ];

  const handleView = (record) => {
    navigate(`/admin/product/${record._id}`);
  };

  const handleUpdateStatus = async (record) => {
    try {
      const response = await httpPatch(
        `/admin/products/${record._id}/toggle`
      );

      if (response.success) {
        message.success(response.message);
        fetchProducts();
      } else {
        message.error(response.message || "Cập nhật trạng thái thất bại");
      }
    } catch (error) {
      console.error("Toggle status error:", error);
      message.error("Lỗi khi cập nhật trạng thái sản phẩm");
    }
  };

  const handleDelete = async (record) => {
    try {
      await httpDelete(`/product/admin-product/${record._id}`);
      message.success("Xóa sản phẩm thành công");
      fetchProducts();
    } catch (error) {
      message.error("Lỗi khi xóa sản phẩm");
    }
  };

  return (
    <Card
      title="Quản lý sản phẩm (Toàn hệ thống)"
      bordered={false}
    >
      <FilterPanel
        config={filterConfig}
        onFilterChange={handleFilterChange}
        addLink={null}
      />

      <CommonTable
        columns={columns}
        data={products}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} sản phẩm`,
        }}
        onChange={handleTableChange}
        scroll={{ x: 1200 }}
      />
    </Card>
  );
};

export default ProductManagement;
