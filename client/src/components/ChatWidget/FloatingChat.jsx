import React, { useState, useEffect } from "react";
import { Badge, Button, Tooltip } from "antd";
import { MessageFilled, CloseOutlined } from "@ant-design/icons"; // Dùng icon Filled cho đẹp
import ChatWindow from "./ChatWindow";
import { useLocation } from "react-router-dom";
import ConversationList from "./ConversationList";

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false); // State để kiểm soát unmount
  const [activeChat, setActiveChat] = useState(null);
  const location = useLocation();


  // Logic nhận dữ liệu từ trang khác (Giữ nguyên)
  useEffect(() => {
    if (location.state?.openChat && location.state?.shopId) {
      handleOpen();
      // Set thẳng vào activeChat để bỏ qua màn hình List
      setActiveChat({
        shopId: location.state.shopId,
        shopName: location.state.shopName || "Cửa hàng",
        productContext: location.state.productContext,
      });
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleOpen = () => {
    setIsRendered(true);
    setTimeout(() => setIsOpen(true), 10);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => setIsRendered(false), 300);
  };

  // Tạm thời cho hiện nút demo (Trong thực tế dùng logic activeChat)
  // if (!activeChat) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-sans">
      {/* Main Container */}
      {isRendered && (
        <div
          className={`mb-4 w-[380px] h-[550px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col origin-bottom-right transition-all duration-300 ease-out
          ${
            isOpen
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-4 scale-95 pointer-events-none"
          }`}
        >
          {activeChat ? (
            // Màn hình 2: Chat Window
            <ChatWindow
              receiverId={activeChat.shopId}
              receiverName={activeChat.shopName}
              productContext={activeChat.productContext}
              onClose={handleClose}
              onBack={() => setActiveChat(null)} // Nút Back: Set activeChat về null để hiện List
            />
          ) : (
            // Màn hình 1: Conversation List
            <ConversationList
              onSelectChat={(shopInfo) => setActiveChat(shopInfo)} // Chọn shop -> Vào Chat Window
            />
          )}
        </div>
      )}

      {/* Floating Button */}
      <Tooltip title={isOpen ? "Đóng chat" : "Tin nhắn"} placement="left">
        <div
          className={`w-14 h-14 rounded-full shadow-lg cursor-pointer flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 group
            ${
              isOpen
                ? "bg-white text-gray-600 border border-gray-200"
                : "bg-gradient-to-tr from-[#ee4d2d] to-[#ff7337] text-white"
            }`}
          onClick={isOpen ? handleClose : handleOpen}
        >
          {isOpen ? (
            <CloseOutlined className="text-xl transition-transform duration-300 rotate-0" />
          ) : (
            <Badge count={2} dot offset={[-8, 5]}>
              {" "}
              {/* Hardcode count demo, sau này lấy từ context */}
              <MessageFilled className="text-2xl transition-transform duration-300 group-hover:-rotate-12" />
            </Badge>
          )}
        </div>
      </Tooltip>
    </div>
  );
};

export default FloatingChat;