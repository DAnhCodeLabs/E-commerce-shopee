// file: src/pages/admin/SellerIsActive.jsx

import React, { useState, useEffect } from "react";
import { Tag, Card, Select, message } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

// Import các component chung
import BreadcrumbHeader from "../../components/BreadcrumbHeader";
import CommonTable from "../../components/common/CommonTable"; // Đã sửa đường dẫn

// Import service
import { httpGet, httpPut } from "../../services/httpService"; // Import service
import FilterPanel from "../../components/FilterPanel";

const { Option } = Select;

const SellerIsActive = () => {
  // --- State ---
  const [sellers, setSellers] = useState([]); // Dữ liệu cho bảng
  const [loading, setLoading] = useState(false); // Trạng thái loading
  const [isVerifying, setIsVerifying] = useState(null); // Trạng thái loading khi duyệt 1 seller
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // State tập trung cho tất cả tham số truy vấn
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    status: undefined, // Lọc theo 'pending', 'approved', 'rejected'
    search: undefined, // Tìm kiếm
  });

  // --- API Call Logic ---

  // Effect tự động gọi API khi queryParams thay đổi
  useEffect(() => {
    const fetchSellers = async () => {
      setLoading(true);
      try {
        // Gọi API getSellerAccounts với các tham số
        const response = await httpGet("/admin/sellers", {
          params: queryParams,
        });

        setSellers(response.data);
        setPagination({
          current: response.pagination.currentPage,
          pageSize: queryParams.limit, // Giữ pageSize từ state
          total: response.pagination.totalItems,
        });
      } catch (error) {
        // Lỗi đã được httpService xử lý và hiển thị thông báo
        console.error("Lỗi khi tải danh sách người bán:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellers();
  }, [queryParams]); // Chỉ chạy lại khi queryParams thay đổi

  // --- Handlers (Hàm xử lý sự kiện) ---

  // Xử lý khi FilterPanel thay đổi (lọc, tìm kiếm)
  const handleFilterChange = (newFilters) => {
    // newFilters là object dạng { search: 'abc', status: 'pending' }
    setQueryParams((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Luôn reset về trang 1 khi lọc
    }));
  };

  // Xử lý khi bảng thay đổi (chuyển trang)
  const handleTableChange = (newPagination) => {
    setQueryParams((prev) => ({
      ...prev,
      page: newPagination.current,
      limit: newPagination.pageSize,
    }));
  };

  // Xử lý khi Admin duyệt hoặc từ chối
 const handleVerify = async (sellerId, newStatus) => {
   setIsVerifying(sellerId);
   try {
     await httpPut(`/admin/sellers/${sellerId}/verify`, { status: newStatus });

     message.success("Cập nhật trạng thái thành công!");
     setSellers((prevSellers) =>
       prevSellers.map((seller) =>
         seller._id === sellerId
           ? {
               ...seller,
               shop: seller.shop
                 ? {
                     ...seller.shop,
                     verificationStatus: newStatus,
                     isActive: newStatus === "approved",
                   }
                 : null,
             }
           : seller
       )
     );
   } catch (error) {
     console.error("Lỗi khi cập nhật trạng thái:", error);
   } finally {
     setIsVerifying(null);
   }
 };

  // --- Configs (Cấu hình) ---

  // Cấu hình cho FilterPanel
  const filterConfig = [
    {
      type: "search",
      key: "search",
      placeholder: "Tìm tên shop, email, username...",
      width: 300,
    },
    {
      type: "select",
      key: "status",
      placeholder: "Lọc theo trạng thái",
      width: 180,
      options: [
        { value: "pending", label: "Chờ duyệt" },
        { value: "approved", label: "Đã duyệt" },
        { value: "rejected", label: "Đã từ chối" },
      ],
    },
  ];

  // Cấu hình cho các cột của CommonTable
  const columns = [
    {
      title: "Tên Shop",
      dataIndex: ["shop", "shopName"],
      key: "shopName",
      fixed: "left",
      width: 200,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 250,
    },
    {
      title: "Tên Người Dùng",
      dataIndex: "username",
      key: "username",
      width: 180,
    },
    {
      title: "Trạng thái",
      dataIndex: ["shop", "verificationStatus"],
      key: "status",
      width: 150,
      render: (status, record) => {
        // Kiểm tra nếu không có shop
        if (!record.shop) {
          return <Tag color="orange">CHƯA ĐĂNG KÝ</Tag>;
        }

        let color = "blue";
        let text = "Chờ duyệt";
        if (status === "approved") {
          color = "green";
          text = "Đã duyệt";
        } else if (status === "rejected") {
          color = "red";
          text = "Đã từ chối";
        }
        return <Tag color={color}>{text.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      fixed: "right",
      width: 150,
      render: (text, record) => {
        // Kiểm tra nếu không có shop
        if (!record.shop) {
          return <Tag color="orange">Không có thông tin</Tag>;
        }

        const { verificationStatus } = record.shop;

        // Nếu đang ở trạng thái 'pending', hiển thị Select
        if (verificationStatus === "pending") {
          return (
            <Select
              placeholder="Xử lý..."
              style={{ width: "100%" }}
              onChange={(value) => handleVerify(record._id, value)}
              loading={isVerifying === record._id}
              disabled={isVerifying === record._id}
            >
              <Option value="approved" style={{ color: "green" }}>
                Duyệt
              </Option>
              <Option value="rejected" style={{ color: "red" }}>
                Từ chối
              </Option>
            </Select>
          );
        }

        // Nếu đã duyệt hoặc từ chối, chỉ hiển thị Tag
        return (
          <Tag color={verificationStatus === "approved" ? "green" : "red"}>
            {verificationStatus === "approved" ? "Đã duyệt" : "Đã từ chối"}
          </Tag>
        );
      },
    },
  ];

  // --- Render ---
  return (
    <div>
      <BreadcrumbHeader
        title={"Quản lý đăng ký người bán"}
        breadcrumbItems={[{ title: "Quản lý đăng ký người bán" }]}
      />

      <Card
        title="Bộ lọc và tìm kiếm"
        className="w-full"
        style={{ marginBottom: 16 }}
      >
        <FilterPanel
          config={filterConfig}
          onFilterChange={handleFilterChange} // Gắn handler
          resetIcon={<ReloadOutlined />}
        />
      </Card>

      <Card title="Danh sách đăng ký">
        <CommonTable
          columns={columns}
          data={sellers}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange} // Gắn handler
          rowKey="_id"
        />
      </Card>
    </div>
  );
};

export default SellerIsActive;
