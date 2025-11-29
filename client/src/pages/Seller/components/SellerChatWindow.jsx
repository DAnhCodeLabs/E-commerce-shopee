import React, { useState, useEffect, useRef } from "react";
import { Input, Button, Spin, Avatar, Tooltip } from "antd";
import {
  SendOutlined,
  PictureOutlined,
  UserOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../contexts/AuthContext";
import { useSocketContext } from "../../../contexts/SocketContext";
import { httpGet, httpPost } from "../../../services/httpService";
import MessageBubble from "../../../components/ChatWidget/MessageBubble";

const SellerChatWindow = ({ customer }) => {
  const { socket } = useSocketContext();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!customer) return;
      setLoading(true);
      try {
        const response = await httpGet(`/chat/${customer._id}`);
        setMessages(Array.isArray(response) ? response : response.data || []);
      } catch (error) {
        console.error("Lỗi tải tin nhắn:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [customer]);

  useEffect(() => {
    if (!socket || !customer) return;
    const handleNewMessage = (newMessage) => {
      if (
        newMessage.sender === customer._id ||
        newMessage.sender === user._id
      ) {
        setMessages((prev) => [...prev, newMessage]);
        scrollToBottom();
      }
    };
    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, customer, user._id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    try {
      const res = await httpPost("/chat/send", {
        receiverId: customer._id,
        text: inputText,
        type: "text",
      });
      if (res && res._id) {
        setMessages((prev) => [...prev, res]);
      }
      setInputText("");
    } catch (error) {
      console.error("Lỗi gửi tin:", error);
    }
  };

  if (!customer) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f5f7fa] flex-col text-gray-400 h-full">
        <UserOutlined className="text-6xl mb-4 opacity-20" />
        <p>Chọn một khách hàng để bắt đầu trò chuyện</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f5f7fa]">
      {/* Header */}
      <div className="h-16 px-6 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <Avatar src={customer.avatar} icon={<UserOutlined />} size="large" />
          <div>
            <div className="font-bold text-gray-800 text-base">
              {customer.fullName || customer.username}
            </div>
            <div className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>{" "}
              Online
            </div>
          </div>
        </div>
        <Button icon={<MoreOutlined />} type="text" />
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3 chat-scrollbar">
        {loading ? (
          <div className="flex justify-center mt-20">
            <Spin />
          </div>
        ) : (
          messages.map((msg, idx) => (
            <MessageBubble
              key={idx}
              message={msg}
              isOwnMessage={msg.sender === user._id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200 shrink-0">
        <form
          className="flex gap-3 bg-gray-50 p-2 rounded-xl border border-gray-200 focus-within:bg-white focus-within:border-[#ee4d2d] focus-within:ring-1 focus-within:ring-[#ee4d2d] transition-all"
          onSubmit={handleSendMessage}
        >
          <div className="flex items-center gap-2 px-2 text-gray-400 border-r border-gray-200 pr-3">
            <Tooltip title="Gửi ảnh">
              <PictureOutlined className="text-xl cursor-pointer hover:text-[#ee4d2d]" />
            </Tooltip>
          </div>

          <Input.TextArea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Nhập tin nhắn..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            bordered={false}
            className="flex-1 bg-transparent text-gray-700"
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />

          <Button
            type="primary"
            htmlType="submit"
            icon={<SendOutlined />}
            className="self-end bg-[#ee4d2d] border-[#ee4d2d] h-9 px-6"
          >
            Gửi
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SellerChatWindow;
