import React from "react";
import { Avatar, Image } from "antd";
import { UserOutlined, ShopOutlined } from "@ant-design/icons";

const MessageBubble = ({ message, isOwnMessage }) => {
  // Format thời gian: 10:30
  const timeString = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const renderContent = () => {
    switch (message.type) {
      case "image":
        return (
          <div className="overflow-hidden rounded-lg">
            <Image
              src={message.text}
              alt="sent image"
              width={150}
              className="object-cover"
            />
          </div>
        );

      case "product":
        const product = message.productData;
        if (!product)
          return (
            <span className="text-xs italic opacity-70">
              Sản phẩm không tồn tại
            </span>
          );

        return (
          <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm w-[220px] cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden group">
            {/* Dải màu trang trí bên trái */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>

            <div className="flex gap-3 pl-2">
              <img
                src={product.image}
                alt=""
                className="w-14 h-14 object-cover rounded border border-gray-100 flex-shrink-0"
              />
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div className="text-xs font-medium text-gray-800 line-clamp-2 leading-tight mb-1">
                  {product.name}
                </div>
                <div className="text-red-500 font-bold text-sm">
                  {product.price?.toLocaleString()}₫
                </div>
              </div>
            </div>
            <div className="mt-2 text-[10px] text-blue-500 text-right font-medium group-hover:underline">
              Nhấn để xem chi tiết &gt;
            </div>
          </div>
        );

      case "text":
      default:
        return (
          <span className="break-words whitespace-pre-wrap leading-relaxed">
            {message.text}
          </span>
        );
    }
  };

  if (message.type === "product") {
    const product = message.productData;
    return (
      <div
        className={`flex mb-4 ${
          isOwnMessage ? "justify-end" : "justify-start"
        }`}
      >
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm w-[240px] relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#ee4d2d]"></div>
          <div className="flex gap-3 pl-2">
            <img
              src={product?.image}
              className="w-16 h-16 object-cover rounded-md border border-gray-100"
              alt=""
            />
            <div className="flex-1 flex flex-col justify-between">
              <div className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">
                {product?.name}
              </div>
              <div className="text-[#ee4d2d] font-bold">
                {product?.price?.toLocaleString()}₫
              </div>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-center text-blue-500 font-medium cursor-pointer">
            Bấm để xem chi tiết
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex gap-3 mb-2 items-end ${
        isOwnMessage ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar Shop */}
      {!isOwnMessage && (
        <Avatar
          size={32}
          icon={<ShopOutlined />}
          className="flex-shrink-0 bg-white text-orange-500 border border-gray-200 shadow-sm"
        />
      )}

      <div
        className={`flex flex-col ${
          isOwnMessage ? "items-end" : "items-start"
        } max-w-[70%]`}
      >
        {/* Bubble */}
        <div
          className={`px-4 py-2.5 text-[14px] shadow-sm leading-relaxed ${
            isOwnMessage
              ? "bg-gradient-to-br from-[#ee4d2d] to-[#ff7337] text-white rounded-2xl rounded-br-sm"
              : "bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-sm"
          }`}
        >
          {message.type === "text" && message.text}
          {message.type === "image" && (
            <Image src={message.text} width={150} className="rounded-lg" />
          )}
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-gray-400 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {timeString}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
