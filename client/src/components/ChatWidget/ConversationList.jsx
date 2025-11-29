import React, { useState, useEffect } from "react";
import { List, Avatar, Spin, Badge, Empty, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { httpGet } from "../../services/httpService";
import { useSocketContext } from "../../contexts/SocketContext";

const ConversationList = ({ onSelectChat }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { onlineUsers } = useSocketContext(); // Lấy danh sách online để hiện chấm xanh

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

  // Format thời gian ngắn gọn (VD: 10:30, Hôm qua)
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString([], { day: "numeric", month: "numeric" });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-10">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Tin nhắn</h3>
        <Input
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder="Tìm kiếm Shop..."
          className="rounded-full bg-gray-100 border-none text-sm"
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
              const otherUser = conv.otherUser;
              const isOnline = onlineUsers.includes(otherUser?._id);
              const isUnread =
                !conv.lastMessage?.isRead && conv.lastMessage?.sender !== "ME"; // Logic check unread tạm thời

              return (
                <List.Item
                  className="cursor-pointer hover:bg-gray-50 transition-colors !px-4 !py-3 border-b border-gray-50 last:border-0"
                  onClick={() =>
                    onSelectChat({
                      shopId: otherUser?._id,
                      shopName:
                        otherUser?.shop?.shopName ||
                        otherUser?.fullName ||
                        "Shop",
                      shopAvatar: otherUser?.avatar,
                    })
                  }
                >
                  <List.Item.Meta
                    avatar={
                      <Badge
                        dot
                        status="success"
                        offset={[-2, 28]}
                        style={{ display: isOnline ? "block" : "none" }}
                      >
                        <Avatar
                          src={otherUser?.shop?.shopLogo || otherUser?.avatar}
                          size={48}
                          className="border border-gray-100"
                        >
                          {otherUser?.username?.[0]?.toUpperCase()}
                        </Avatar>
                      </Badge>
                    }
                    title={
                      <div className="flex justify-between items-baseline">
                        <span className="font-semibold text-gray-800 truncate max-w-[140px]">
                          {otherUser?.shop?.shopName ||
                            otherUser?.fullName ||
                            "Người dùng"}
                        </span>
                        <span className="text-[10px] text-gray-400 font-normal ml-2">
                          {formatTime(conv.updatedAt)}
                        </span>
                      </div>
                    }
                    description={
                      <div className="flex justify-between items-center">
                        <span
                          className={`truncate text-xs max-w-[180px] ${
                            isUnread
                              ? "text-gray-800 font-bold"
                              : "text-gray-500"
                          }`}
                        >
                          {/* Hiển thị "Bạn: " nếu mình là người gửi cuối */}
                          {conv.lastMessage?.text || "Bắt đầu trò chuyện"}
                        </span>
                        {/* Badge số tin chưa đọc (Demo) */}
                        {/* {isUnread && <Badge count={1} size="small" />} */}
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 pb-10">
            <Empty
              description="Chưa có tin nhắn nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
