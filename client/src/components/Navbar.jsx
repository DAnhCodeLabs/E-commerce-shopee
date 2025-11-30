import React, { useState } from "react";
import { Button, Dropdown, Input, QRCode, Space, Menu } from "antd";
import { Link, useNavigate } from "react-router-dom";
import {
  FaFacebook,
  FaInstagram,
  FaRegBell,
  FaRegUserCircle,
  FaSearch,
} from "react-icons/fa";
import { RxQuestionMarkCircled } from "react-icons/rx";
import { TbLogin2 } from "react-icons/tb";
import { FaCartShopping } from "react-icons/fa6";
import { assets } from "../assets/assets";
import CommonInput from "./common/CommonInput";
import CommonButton from "./common/CommonButton";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const [text, setText] = useState(
    `https://shopee.vn/download?pid=Organic&c=lp_home_qr`
  );
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");

  const handleSearch = () => {
    if (!keyword.trim()) return;
    navigate(`/search?keyword=${encodeURIComponent(keyword.trim())}`);
  };
  const { token, user, logout } = useAuth();

  // Sửa itemsLeft - sử dụng Menu component
  const qrCodeMenu = (
    <Menu
      items={[
        {
          key: "1",
          label: (
            <div className="p-2">
              <QRCode value={text || "-"} />
              <p className="text-center mt-2 text-sm">Quét để tải ứng dụng</p>
            </div>
          ),
        },
      ]}
    />
  );

  // Sửa itemsRight - sử dụng Menu component
  const userMenu = (
    <Menu
      items={[
        {
          key: "1",
          label: <Link to="/profile">Thông tin tài khoản</Link>,
        },
        {
          key: "2",
          label: <Link to="/user/purchase">Đơn mua</Link>,
        },
        {
          key: "3",
          label: <Link to="/settings">Cài đặt</Link>,
        },
        {
          key: "5",
          label: <Link to="/profile/wishlist">Sản phẩm yêu tích</Link>,
        },
        {
          type: "divider",
        },
        {
          key: "4",
          label: (
            <Link to="/logout" onClick={() => logout()}>
              Đăng xuất
            </Link>
          ),
          danger: true,
        },
      ]}
    />
  );

  return (
    <div className="w-full lg:h-[120px] bg-[linear-gradient(-180deg,#f53d2d,#ff6633)] p-2">
      <div className="w-[1400px] mx-auto flex flex-col items-center justify-between h-full text-white">
        <div className="lg:flex items-center justify-between w-full hidden">
          <div className="flex justify-center items-center">
            <Link
              to={"/seller"}
              className="hover:text-white/60 duration-300 transition-all ease-in-out"
            >
              <p>Kênh người bán</p>
            </Link>

            {/* Sửa Dropdown cho QR Code */}
            <Dropdown overlay={qrCodeMenu} placement="bottomLeft" arrow>
              <span className="relative before:content-['|'] after:content-['|'] before:mx-2 after:mx-2 before:text-gray-100/30 after:text-gray-100/30 cursor-pointer">
                Tải ứng dụng
              </span>
            </Dropdown>

            <div className="hover:text-white/60 duration-300 transition-all ease-in-out flex items-center justify-center gap-2">
              <p className="cursor-text">Kết nối</p>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/80"
              >
                <FaFacebook />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/80"
              >
                <FaInstagram />
              </a>
            </div>
          </div>

          <div className="flex justify-center items-center">
            <div className="flex items-center justify-center gap-1 hover:text-white/60 duration-300 transition-all ease-in-out cursor-pointer">
              <FaRegBell /> <p>Thông báo</p>
            </div>

            <Link
              to="/support"
              className="relative before:content-['|'] after:content-['|'] before:mx-2 after:mx-2 before:text-gray-100/30 after:text-gray-100/30 flex items-center justify-center gap-1 hover:text-white/60 duration-300 transition-all ease-in-out"
            >
              <RxQuestionMarkCircled />
              <span className="block">Hỗ trợ</span>
            </Link>

            {token ? (
              // Sửa Dropdown cho user menu
              <Dropdown overlay={userMenu} placement="bottomRight" arrow>
                <span className="flex items-center justify-center gap-2 cursor-pointer hover:text-white/60">
                  <FaRegUserCircle />
                  <p>{user?.username || "Người dùng"}</p>
                </span>
              </Dropdown>
            ) : (
              <Link
                to={"/login"}
                className="flex items-center justify-center gap-1 hover:text-white/60 duration-300 transition-all ease-in-out"
              >
                <TbLogin2 className="text-xl" />
                <p>Đăng nhập</p>
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between w-full gap-2 px-2 sm:gap-4 sm:px-4">
          <div className="w-[100px] sm:w-[150px] hidden md:block">
            <Link to={"/"}>
              {" "}
              <img
                src={assets.logoShopee}
                alt="Shopee Logo"
                className="w-full"
              />
            </Link>
          </div>

          <div className="flex-1">
            <CommonInput
              className="w-full text-sm sm:text-base"
              placeholder="Tìm kiếm sản phẩm..."
              allowClear
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={handleSearch}
              suffix={
                <CommonButton
                  className="!bg-primary hover:!outline-none p-2 sm:p-3"
                  onClick={handleSearch}
                >
                  <FaSearch className="text-white text-base sm:text-lg" />
                </CommonButton>
              }
            />
          </div>

          {/* Giỏ hàng */}
          <Link to={"/cart"}>
            <div className="ml-2 sm:ml-4 text-xl sm:text-2xl cursor-pointer hover:text-white/60 transition-all ease-in-out relative">
              <FaCartShopping />
              <div className="absolute -top-3 -right-7 min-w-[20px] h-5 bg-white text-black text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center px-1.5 sm:px-2 border-2 border-primary">
                +99
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
