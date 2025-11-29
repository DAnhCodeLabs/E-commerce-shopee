import React, { useState, useEffect, useRef } from "react";
import { Input, Button, Spin, Empty, Tooltip } from "antd";
import {
  SendOutlined,
  CloseOutlined,
  PictureOutlined,
  SmileOutlined,
  ArrowLeftOutlined, 
} from "@ant-design/icons";
import { httpGet, httpPost } from "../../services/httpService";
import MessageBubble from "./MessageBubble";
import { useSocketContext } from "../../contexts/SocketContext";
import { useAuth } from "../../contexts/AuthContext";

const ChatWindow = ({
  receiverId,
  receiverName,
  productContext,
  onClose,
  onBack,
}) => {
  const { socket } = useSocketContext();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!receiverId) return;
      setLoading(true);
      try {
        const response = await httpGet(`/chat/${receiverId}`);
        const data = Array.isArray(response) ? response : response.data || [];
        setMessages(data);
      } catch (error) {
        console.error("Lỗi tải tin nhắn:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [receiverId]);

  useEffect(() => {
    if (productContext && messages.length === 0 && !loading) {
      handleSendMessage(null, "product", productContext);
    }
  }, [productContext, loading, messages.length]);

  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (newMessage) => {
      const isFromCurrentChat =
        newMessage.sender === receiverId || newMessage.sender === user._id;
      if (isFromCurrentChat) {
        setMessages((prev) => [...prev, newMessage]);
        scrollToBottom();
      }
    };
    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, receiverId, user._id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e, type = "text", data = null) => {
    if (e) e.preventDefault();
    if (type === "text" && !inputText.trim()) return;

    const messageData = {
      receiverId,
      text: type === "text" ? inputText : "",
      type: type,
      productData: type === "product" ? data : null,
    };

    try {
      const res = await httpPost("/chat/send", messageData);
      if (res && res._id) {
        setMessages((prev) => [...prev, res]);
      }
      setInputText("");
    } catch (error) {
      console.error("Gửi tin nhắn thất bại", error);
    }
  };
  // ------------------------------------

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 1. Header: Gradient Cam -> Đỏ (Shopee Premium) */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#ee4d2d] to-[#ff7337] text-white shadow-md z-10">
        <div className="flex items-center gap-3">
          {/* Nút Back - Chỉ hiện khi có hàm onBack (tức là mở từ list) */}
          {onBack && (
            <Button
              type="text"
              icon={<ArrowLeftOutlined className="text-white text-lg" />}
              className="hover:bg-white/20 -ml-2 rounded-full"
              onClick={onBack}
            />
          )}

          <div className="relative">
            {/* Avatar Shop */}
            <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 text-white font-bold">
              {receiverName?.charAt(0).toUpperCase()}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-[#ee4d2d] rounded-full"></span>
          </div>
          <div>
            <div className="font-bold text-sm leading-tight tracking-wide max-w-[150px] truncate">
              {receiverName}
            </div>
            <div className="text-[10px] text-white/80 font-medium">
              Đang hoạt động
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            className="text-white/80 hover:text-white hover:bg-white/20"
            onClick={onClose}
          />
        </div>
      </div>

      {/* 2. Message List: Nền xám nhạt hiện đại */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f5f7fa] chat-scrollbar">
        {/* Placeholder ngày tháng (Optional) */}
        <div className="text-center text-[10px] text-gray-400 my-2 uppercase tracking-wider font-semibold">
          Hôm nay
        </div>

        {loading ? (
          <div className="flex justify-center mt-10">
            <Spin />
          </div>
        ) : messages.length > 0 ? (
          messages.map((msg, idx) => (
            <MessageBubble
              key={idx}
              message={msg}
              isOwnMessage={msg.sender === user._id}
            />
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-60">
            <img
              src="https://cdn-icons-png.flaticon.com/512/1380/1380370.png"
              alt=""
              className="w-16 h-16 mb-2 grayscale opacity-50"
            />
            <span className="text-gray-400 text-sm">Chưa có tin nhắn nào</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Footer Input: Minimalist */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form
          className="flex items-center gap-2 bg-gray-100 rounded-3xl px-4 py-2 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-[#ee4d2d]/20 focus-within:shadow-sm"
          onSubmit={handleSendMessage}
        >
          {/* Action Icons */}
          <div className="flex gap-2 text-gray-400 mr-2">
            <PictureOutlined className="text-lg cursor-pointer hover:text-[#ee4d2d] transition-colors" />
            <SmileOutlined className="text-lg cursor-pointer hover:text-[#ee4d2d] transition-colors" />
          </div>

          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 bg-transparent border-none shadow-none focus:shadow-none px-0 text-gray-700 placeholder:text-gray-400"
            bordered={false}
          />

          <Button
            type="text"
            shape="circle"
            icon={
              <SendOutlined
                className={
                  inputText.trim() ? "text-[#ee4d2d]" : "text-gray-400"
                }
              />
            }
            htmlType="submit"
            className="flex-shrink-0 hover:bg-orange-50"
            disabled={!inputText.trim()}
          />
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
