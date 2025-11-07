import React from "react";
import { FaBars, FaChevronDown, FaSearch, FaUserCircle } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import {  Dropdown, Space } from "antd";
import { TbLogout2 } from "react-icons/tb";
const Navbar = () => {
  const { token, logout } = useAuth();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const items = [
    {
      key: "profile",
      label: "Hồ sơ",
      icon: <FaUserCircle className="w-[20px] h-[20px]" />,
    },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <TbLogout2 className="w-[20px] h-[20px]" />,
      onClick: () => handleLogout({ key: "logout" }),
    },
  ];
  return (
    <div>
      <nav className="w-full bg-white">
        <div className="mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <button aria-label="Open menu" className="text-gray-500 text-xl">
              <FaBars />
            </button>
            <div className="flex items-center space-x-6">
              <button aria-label="Search" className="text-gray-500 text-lg">
                <FaSearch />
              </button>
              <div className="flex items-center space-x-2 cursor-pointer select-none">
                <img
                  alt="Profile picture of a man with beard and glasses wearing a cap"
                  className="w-8 h-8 rounded-full object-cover"
                  height="32"
                  src="https://storage.googleapis.com/a1aa/image/5e9c55f2-b0c5-4dc3-441d-eb683e4ad614.jpg"
                  width="32"
                />
                {token ? (
                  <div className="">
                    <Dropdown
                      menu={{ items }}
                      dropdownRender={(menu) => (
                        <div style={{ marginTop: 14, width: 200 }}>{menu}</div>
                      )}
                    >
                      <a>
                        <Space>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 text-sm">
                              Jamie D.
                            </span>
                            <FaChevronDown className="text-gray-600 text-xs" />
                          </div>
                        </Space>
                      </a>
                    </Dropdown>
                  </div>
                ) : (
                  <Link to="/login">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                      Đăng nhập
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
