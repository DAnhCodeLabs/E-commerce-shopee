// ReviewItem.jsx
import React from "react";
import { Avatar, Image } from "antd";
import { UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const ReviewItem = ({ review }) => {
  const {
    user_name,
    user_avatar,
    rating,
    comment,
    images,
    createdAt,
    shop_reply,
  } = review;

  return (
    <div className="review-item p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      <div className="flex gap-3">
        {/* Avatar nhỏ gọn */}
        <Avatar
          src={user_avatar}
          icon={<UserOutlined />}
          size={32}
          className="flex-shrink-0 bg-blue-100"
        />

        <div className="flex-1 min-w-0">
          {/* Header - một dòng compact */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-gray-900 text-sm">
              {user_name}
            </span>
            <span className="text-yellow-500 font-medium text-sm">
              {rating}.0
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-xs text-gray-500">
              {dayjs(createdAt).format("DD/MM/YYYY")}
            </span>
          </div>

          {/* Images - hiển thị trước comment */}
          {images && images.length > 0 && (
            <div className="mb-2">
              <Image.PreviewGroup>
                <div className="flex gap-1">
                  {images.slice(0, 4).map((img, idx) => (
                    <div
                      key={idx}
                      className="w-14 h-14 border border-gray-200 rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <Image
                        src={img}
                        alt="Review image"
                        className="w-full h-full object-cover"
                        placeholder={
                          <div className="w-full h-full bg-gray-200" />
                        }
                      />
                    </div>
                  ))}
                  {images.length > 4 && (
                    <div className="w-14 h-14 bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                      +{images.length - 4}
                    </div>
                  )}
                </div>
              </Image.PreviewGroup>
            </div>
          )}

          {/* Comment - hiển thị sau ảnh, căn trái tự nhiên */}
          <div className="text-gray-700 text-sm !text-left leading-relaxed mb-2">
            {comment}
          </div>

          {/* Shop Reply - nhỏ gọn */}
          {shop_reply && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded text-sm">
              <div className="font-medium text-blue-700 text-xs mb-1">
                Phản hồi từ shop
              </div>
              <div className="text-gray-600">
                {typeof shop_reply === "string"
                  ? shop_reply
                  : shop_reply.comment}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewItem;
