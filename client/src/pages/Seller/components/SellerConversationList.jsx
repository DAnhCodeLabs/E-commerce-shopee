import React, { useState, useEffect } from "react";
import { List, Avatar, Input, Badge, Spin, Empty } from "antd";
import { SearchOutlined, UserOutlined } from "@ant-design/icons";
import { useSocketContext } from "../../../contexts/SocketContext";
import { httpGet } from "../../../services/httpService";

const SellerConversationList = ({ onSelectChat, selectedChatId }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { onlineUsers } = useSocketContext();

  // Fetch danh sách hội thoại
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await httpGet("/chat/conversations");
        setConversations(res || []);
      } catch (error) {
        console.error("Lỗi tải hội thoại:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  // Hàm format thời gian (VD: 10:30)
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-[350px] flex-shrink-0">
      {/* Header Search */}
      <div className="p-4 border-b border-gray-100">
        <Input
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder="Tìm tên khách hàng..."
          className="rounded-lg bg-gray-50 border-none py-2"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto chat-scrollbar">
        {loading ? (
          <div className="flex justify-center mt-10">
            <Spin />
          </div>
        ) : conversations.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={conversations}
            renderItem={(conv) => {
              const customer = conv.otherUser;
              const isOnline = onlineUsers.includes(customer?._id);
              const isActive = selectedChatId === customer?._id;

              return (
                <List.Item
                  className={`cursor-pointer transition-all !px-4 !py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50
                    ${
                      isActive
                        ? "bg-orange-50 border-r-4 border-r-[#ee4d2d]"
                        : ""
                    }`}
                  onClick={() => onSelectChat(customer)}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge
                        dot
                        status="success"
                        offset={[-2, 35]}
                        style={{ display: isOnline ? "block" : "none" }}
                      >
                        <Avatar
                          src={customer?.avatar}
                          icon={<UserOutlined />}
                          size={48}
                          className="bg-gray-200"
                        />
                      </Badge>
                    }
                    title={
                      <div className="flex justify-between items-baseline mb-1">
                        <span
                          className={`font-semibold truncate max-w-[160px] ${
                            isActive ? "text-[#ee4d2d]" : "text-gray-800"
                          }`}
                        >
                          {customer?.fullName ||
                            customer?.username ||
                            "Khách hàng"}
                        </span>
                        <span className="text-[10px] text-gray-400 font-normal">
                          {formatTime(conv.updatedAt)}
                        </span>
                      </div>
                    }
                    description={
                      <div className="text-xs text-gray-500 truncate max-w-[200px]">
                        {conv.lastMessage?.sender === "ME" ? "Bạn: " : ""}
                        {conv.lastMessage?.text || "Gửi tin nhắn..."}
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        ) : (
          <Empty
            description="Chưa có tin nhắn nào"
            className="mt-10 opacity-50"
          />
        )}
      </div>
    </div>
  );
};

export default SellerConversationList;
