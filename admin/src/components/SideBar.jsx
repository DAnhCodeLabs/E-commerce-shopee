import React from "react";
import { Link } from "react-router-dom";
import { Divider, Menu } from "antd";
import { MdDashboardCustomize } from "react-icons/md";
import { FaRegUser, FaProductHunt } from "react-icons/fa";
const SideBar = () => {
  const items = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <MdDashboardCustomize />,
      children: [
        {
          key: "dashboard",
          label: <Link to="/admin">Dashboard</Link>,
          icon: <MdDashboardCustomize />,
        },
        {
          key: "users",
          label: <Link to="/admin/users">Quản lý tài khoản</Link>,
          icon: <FaRegUser />,
        },
        {
          key: "products",
          label: <Link to="/admin/products">Quản lý sản phẩm</Link>,
          icon: <FaProductHunt />,
        },
        {
          key: "banners",
          label: <Link to="/admin/banners">Quản lý Banners</Link>,
          icon: <FaProductHunt />,
        },
        {
          key: "category",
          label: <Link to="/admin/category">Quản lý danh mục</Link>,
          icon: <FaProductHunt />,
        },
        {
          key: "attribute",
          label: <Link to="/admin/attribute">Quản lý thuộc tính</Link>,
          icon: <FaProductHunt />,
        },
        {
          key: "sellerIsActive",
          label: (
            <Link to="/admin/seller-is_active">
              Quản lý danh sách đăng ký người bán
            </Link>
          ),
          icon: <FaProductHunt />,
        },
      ],
    },
    {
      type: "divider",
    },
  ];
  return (
    <div className="flex flex-col items-center justify-start bg-white w-full h-full py-6">
      <div className="flex flex-col items-center justify-center gap-1">
        <h1 className="font-extrabold text-3xl text-gray-600 italic">
          Admin Panel
        </h1>
        <p className="text-md text-gray-500">Trang quản trị</p>
      </div>
      <Divider />
      <div className="w-full h-full flex flex-col items-start justify-start gap-2">
        <Menu
          defaultSelectedKeys={["dashboard"]}
          defaultOpenKeys={["dashboard"]}
          mode="inline"
          items={items}
        />
      </div>
    </div>
  );
};

export default SideBar;
