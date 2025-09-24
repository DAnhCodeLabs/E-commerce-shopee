import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Layout,
  Menu,
  Card,
  Form,
  Input,
  Button,
  Radio,
  Select,
  Upload,
  Avatar,
  Divider,
  Row,
  Col,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import { FaPencilAlt, FaRegUser } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";

const { Sider, Content } = Layout;
const { Option } = Select;

const Profile = () => {
  const location = useLocation();
  const [form] = Form.useForm();
  const [gender, setGender] = useState("");
  const { user } = useAuth();

  // Hàm này xác định key đang active dựa trên URL
  const getActiveKey = () => {
    const path = location.pathname;
    if (path.includes("/profile/address")) return "address";
    if (path.includes("/profile/password")) return "password";
    if (path === "/profile" || path.includes("/profile/info")) return "profile";
    return "profile"; // mặc định
  };

  // Menu items với cấu trúc cha-con
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
          key: "bank",
          label: "Ngân Hàng",
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
          key: "settings",
          label: "Cài Đặt Thông Báo",
        },
        {
          key: "privacy",
          label: "Những Thiết Lập Riêng Tư",
        },
        {
          key: "personal",
          label: "Thông Tin Cá Nhân",
        },
      ],
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
