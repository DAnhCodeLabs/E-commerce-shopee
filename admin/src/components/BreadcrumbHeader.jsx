import React from "react";
import { Breadcrumb } from "antd";
import { HomeOutlined } from "@ant-design/icons";
const BreadcrumbHeader = ({ title, breadcrumbItems = [] }) => {
  const defaultBreadcrumbItems = [
    {
      href: "/admin",
      title: <HomeOutlined />,
    },
    ...breadcrumbItems,
  ];
  return (
    <div className="flex items-center justify-between !w-full bg-white p-4 rounded-2xl">
      <div>
        <h1 className="text-lg font-semibold text-gray-500">{title}</h1>
      </div>
      <div>
        <Breadcrumb  items={defaultBreadcrumbItems} />
      </div>
    </div>
  );
};

export default BreadcrumbHeader;
