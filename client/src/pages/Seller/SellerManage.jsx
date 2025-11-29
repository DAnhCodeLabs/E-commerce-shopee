import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Alert } from "antd";
import { CiLogout } from "react-icons/ci";
import { MailOutlined, SettingOutlined } from "@ant-design/icons";
import { Menu } from "antd";

const items = [
  {
    key: "sub1",
    label: "Quản Lý Đơn Hàng",
    icon: <MailOutlined />,
    children: [
      { key: "1", label: <Link to={"/seller/dashboard"}>Tất cả</Link> },
      { key: "2", label: "Giao Hàng Lỗi" },
      { key: "3", label: "Bàn Giao Đơn Hàng" },
      { key: "4", label: "Đơn Trả hàng/Hoàn tiền hoàn đơn hủy" },
      { key: "5", label: "Cài đặt Vận Chuyển" },
    ],
  },
  {
    key: "sub2",
    label: "Quản Lý Sản Phẩm",
    icon: <SettingOutlined />,
    children: [
      { key: "6", label: <Link to={"/seller/products"}>Tất cả sản phẩm</Link> },
      {
        key: "7",
        label: (
          <Link to={"/seller/flash-sale_registrations"}>
            Quản lý sản phẩm flash sale
          </Link>
        ),
      },
      {
        key: "8",
        label: <Link to={"/seller/orders"}>Quản lý đơn hàng</Link>,
      },
    ],
  },
  {
    key: "grp",
    label: "Hệ thống",
    type: "group",
    children: [
      { key: "9", label: <Link to={"/seller/chat"}>Chăm sóc khách hàng</Link> },
    ],
  },
];

const SellerManage = () => {
  const { user } = useAuth();
  const verificationStatus = user?.shop?.verificationStatus;

  return (
    <>
      <div>
        {verificationStatus === "pending" && (
          <Alert
            message="Tài khoản của bạn đang được xác minh..."
            type="warning"
          />
        )}
        {verificationStatus === "rejected" && (
          <Alert
            message="Yêu cầu đăng ký bán hàng của bạn đã bị từ chối."
            type="error"
          />
        )}
        {verificationStatus === "approved" && (
          <div className="w-full p-2 flex justify-between items-center shadow">
            <div>
              <Link to={"/"} className="flex justify-center items-center gap-2">
                <CiLogout />
                Quay về Shopee
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="flex min-h-screen">
        <aside className="">
          <h2 className="text-xl text-center pt-2 font-semibold mb-6">
            Seller Dashboard
          </h2>
          <Menu
            style={{ width: 256 }}
            defaultSelectedKeys={["1"]}
            defaultOpenKeys={["sub1"]}
            mode="inline"
            items={items}
          />
        </aside>
        <main className="flex-1 p-2 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default SellerManage;
