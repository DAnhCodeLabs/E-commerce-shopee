import React from "react";
import { FaUserCircle } from "react-icons/fa"; // npm install react-icons
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

const StatsCard = ({
  title,
  value,
  percentageChange,
  icon,
  periodText = "so với tháng trước",
}) => {
  const isPositive = percentageChange >= 0;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold text-gray-400 uppercase">
            {title}
          </p>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">
            {value.toLocaleString("en-US")}
          </p>
        </div>
        {icon}
      </div>
      <div className="mt-4 flex items-center space-x-2">
        <span
          className={`text-sm font-semibold text-white rounded px-1.5 py-[1px] flex items-center ${
            isPositive ? "bg-green-600" : "bg-red-500"
          }`}
        >
          {isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          {Math.abs(percentageChange)}%
        </span>
        <p className="text-sm text-gray-400">{periodText}</p>
      </div>
    </div>
  );
};

export default StatsCard;
