import React, { useState, useEffect, useCallback } from "react";
import { Tag, Input, Select, Space, Button, Card } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import BreadcrumbHeader from "../../components/BreadcrumbHeader";
import dayjs from "dayjs";
import CommonTable from "../../components/common/CommonTable";
import { httpDelete, httpGet, httpPatch } from "../../services/httpService";
import TableActions from "../../components/common/TableActions";
import UserDetailsModal from "./components/UserDetailsModal";
import FilterPanel from "../../components/FilterPanel";

const { Search } = Input;
const { Option } = Select;

const User = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    role: null,
    isActive: null,
  });
  const [sorter, setSorter] = useState({
    field: "createdAt",
    order: "descend",
  });

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: filters.search || undefined,
        role: filters.role || undefined,
        isActive: filters.isActive !== null ? filters.isActive : undefined,
        sortBy: sorter.field,
        sortOrder: sorter.order === "ascend" ? "asc" : "desc",
      };
      const response = await httpGet("/admin/accounts", { params });
      setAccounts(response.data.accounts);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination.totalAccounts,
      }));
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, filters, sorter]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleTableChange = (newPagination, filters, newSorter) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
    if (newSorter.field && newSorter.order) {
      setSorter({
        field: newSorter.field,
        order: newSorter.order,
      });
    } else {
      setSorter({
        field: "createdAt",
        order: "descend",
      });
    }
  };

  const handleViewDetails = (record) => {
    setSelectedUser(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      await httpDelete(`/admin/accounts/${record._id}`);
      if (accounts.length === 1 && pagination.current > 1) {
        setPagination((prev) => ({ ...prev, current: prev.current - 1 }));
      } else {
        fetchAccounts();
      }
    } catch (error) {
      console.error("Failed to delete account:", error);
    }
  };

  const handleUpdateStatus = async (record) => {
    try {
      await httpPatch(`/admin/accounts/${record._id}/status`, {
        isActive: !record.isActive,
      });
      fetchAccounts();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  // Thêm 'sorter: true' vào các cột muốn cho phép sắp xếp
  const columns = [
    {
      title: "Tên người dùng",
      dataIndex: "username",
      key: "username",
      width: 150,
      sorter: true, // Cho phép sắp xếp
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
      sorter: true, // Cho phép sắp xếp
    },
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      width: 180,
      sorter: true, // Cho phép sắp xếp
    },
    {
      title: "Vai trò",
      align: "center",
      fixed: "right",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        const color = role === "seller" ? "blue" : "default";
        return <Tag color={color}>{role.toUpperCase()}</Tag>;
      },
      width: 100,
      // Có thể thêm sorter: true nếu backend hỗ trợ
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      align: "center",
      fixed: "right",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? (
            <>
              <CheckCircleOutlined />
            </>
          ) : (
            <>
              <CloseCircleOutlined />
            </>
          )}
        </Tag>
      ),
      width: 100,
      // Có thể thêm sorter: true nếu backend hỗ trợ
    },
    {
      title: "Ngày tham gia",
      align: "center",
      fixed: "right",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => dayjs(text).format("DD/MM/YYYY"),
      width: 100,
      sorter: true, // Cho phép sắp xếp
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <TableActions
          record={record}
          onView={handleViewDetails}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDelete}
        />
      ),
    },
  ];

  const filterConfig = [
    {
      type: "search",
      key: "search",
      placeholder: "Tìm kiếm theo tên, email...",
      width: 240,
    },
    {
      type: "select",
      key: "role",
      placeholder: "Lọc theo vai trò",
      width: 150,
      options: [
        { value: "user", label: "User" },
        { value: "seller", label: "Seller" },
      ],
    },
    {
      type: "select",
      key: "isActive",
      placeholder: "Lọc theo trạng thái",
      width: 180,
      options: [
        { value: true, label: "Hoạt động" },
        { value: false, label: "Bị khóa" },
      ],
    },
  ];

  return (
    <div className="flex flex-col items-start justify-start gap-4 w-full">
      <BreadcrumbHeader
        title={"Quản lý tài khoản"}
        breadcrumbItems={[{ title: "Quản lý tài khoản" }]}
      />
      <Card title="Bộ lọc và tìm kiếm" className="w-full">
        <FilterPanel
          config={filterConfig}
          onFilterChange={(newFilters) => {
            setFilters(newFilters);
            setPagination((prev) => ({ ...prev, current: 1 }));
          }}
          initialFilters={filters}
          resetIcon={<ReloadOutlined />}
        />
      </Card>

      <Card title="Danh sách tài khoản" className="w-full">
        <CommonTable
          columns={columns}
          data={accounts}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          rowKey="_id"
        />
      </Card>
      <UserDetailsModal
        user={selectedUser}
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </div>
  );
};

export default User;
