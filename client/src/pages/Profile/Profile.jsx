import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {  Menu,  Divider } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { FaPencilAlt, FaRegUser, FaClipboardList } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";


const Profile = () => {
  const location = useLocation();
  const { user } = useAuth();

  const getActiveKey = () => {
    const path = location.pathname;
    if (path.includes("/profile/address")) return "address";
    if (path.includes("/profile/password")) return "password";
    if (path.includes("/profile/privacy-settings")) return "privacy";
    if (path === "/profile" || path.includes("/profile/info")) return "profile";
    return "profile";
  };

  const menuItems = [
    {
      key: "my-profile",
      icon: <UserOutlined />,
      label: "Hồ sơ của tôi",
      children: [
        {
          key: "profile",
          label: <Link to="/profile">Hồ sơ</Link>,
        },
        {
          key: "address",
          label: <Link to="/profile/address">Địa chỉ</Link>,
        },
        {
          key: "password",
          label: <Link to="/profile/password">Đổi Mật Khẩu</Link>,
        },
        {
          key: "privacy",
          label: (
            <Link to={"/profile/privacy-settings"}>
              Những Thiết Lập Riêng Tư
            </Link>
          ),
        },
        {
          key: "personal",
          label: "Thông Tin Cá Nhân",
        },
      ],
    },
    {
      key: "orders",
      icon: <FaClipboardList />,
      label: "Đơn mua",
    },
  ];

  return (
    <div className="w-full p-20 bg-gray-200/40">
      <div className="w-[1400px] mx-auto flex items-start justify-center gap-4">
        <div className="w-1/4 bg-white p-8 shadow rounded-lg min-h-[700px]">
          <div className="flex flex-col items-start justify-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-15 h-15 rounded-full p-2 border border-gray-300 flex items-center justify-center">
                <FaRegUser className="text-2xl text-gray-400" />
              </div>
              <div className="flex flex-col items-start justify-center">
                <h3 className="font-medium">{user.username}</h3>
                <p className="flex items-center justify-center gap-2">
                  <FaPencilAlt className="text-gray-400" />
                  Sửa hồ sơ
                </p>
              </div>
            </div>
            <Divider />
            <Menu
              selectedKeys={[getActiveKey()]}
              mode="inline"
              items={menuItems}
              style={{ border: "none" }}
              defaultOpenKeys={["my-profile"]} // Mở menu cha mặc định
            />
          </div>
        </div>
        <div className="w-3/4 bg-white p-8 shadow rounded-lg h-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Profile;
