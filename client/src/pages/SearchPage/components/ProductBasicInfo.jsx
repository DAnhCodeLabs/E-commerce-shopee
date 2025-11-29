import React from "react";
import { Rate, Tag, Progress, Popover } from "antd"; // Thêm Progress, Popover
import {
  HeartOutlined,
  ShoppingOutlined,
  StarFilled,
  InfoCircleOutlined,
} from "@ant-design/icons";

const ProductBasicInfo = ({
  name,
  item_rating = {},
  historical_sold = 0,
  liked_count = 0,
  condition = "NEW",
  location,
}) => {
  const {
    rating_star = 0,
    total_reviews = 0,
    ratings_distribution = {},
  } = item_rating;
  const displayLocation =
    typeof location === "object" && location !== null
      ? location.city || location.country || "Không xác định"
      : location || "Không xác định";

  // Hàm tính % cho thanh progress
  const getPercent = (count) => {
    if (total_reviews === 0) return 0;
    return (count / total_reviews) * 100;
  };

  // Content hiển thị chi tiết phân bố sao (khi hover hoặc hiển thị luôn)
  const renderRatingDistribution = () => (
    <div className="w-64">
      {[5, 4, 3, 2, 1].map((star) => (
        <div key={star} className="flex items-center gap-2 text-xs mb-1">
          <span className="w-8 font-medium text-gray-600 flex items-center">
            {star} <StarFilled className="text-yellow-400 text-[10px] ml-0.5" />
          </span>
          <div className="flex-1">
            <Progress
              percent={getPercent(ratings_distribution[star] || 5)}
              showInfo={false}
              strokeColor="#fca5a5"
              trailColor="#f3f4f6"
              size="small"
              steps={5}
              strokeWidth={6}
            />
          </div>
          <span className="w-6 text-right text-gray-400">
            {ratings_distribution[star] || 0}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="product-basic-info">
      <div className="mb-3">
        <Tag
          color={condition === "NEW" ? "green" : "orange"}
          className="text-sm px-2 py-1 border-0"
        >
          {condition === "NEW" ? "Hàng mới" : "Đã sử dụng"}
        </Tag>
      </div>
      <h1 className="text-xl lg:text-2xl font-medium text-gray-800 mb-4 leading-tight">
        {name}
      </h1>
      <div className="flex flex-wrap items-center gap-4 mb-4 select-none">
        <Popover
          content={renderRatingDistribution}
          title="Chi tiết đánh giá"
          trigger="hover"
          placement="bottomLeft"
        >
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="flex items-center gap-1 bg-gray-50 group-hover:bg-gray-100 px-2 py-1 rounded transition-colors">
              <span className="text-red-500 font-bold text-lg border-b border-dashed border-red-300">
                {rating_star.toFixed(1)}
              </span>
              <Rate
                disabled
                allowHalf
                value={rating_star}
                className="!text-sm !text-red-500"
              />
            </div>
            <span className="text-gray-500 text-sm group-hover:text-red-500 transition-colors">
              ({total_reviews.toLocaleString()} đánh giá)
            </span>
          </div>
        </Popover>

        {/* Separator */}
        <div className="w-px h-5 bg-gray-300 hidden sm:block"></div>

        {/* Sold Count */}
        <div className="flex items-center gap-2">
          <ShoppingOutlined className="text-gray-500" />
          <span className="text-gray-600 text-sm">
            Đã bán{" "}
            {historical_sold > 1000
              ? `${(historical_sold / 1000).toFixed(1)}k`
              : historical_sold.toLocaleString()}
          </span>
        </div>

        {/* Likes */}
        <div className="flex items-center gap-2">
          <HeartOutlined className="text-gray-500" />
          <span className="text-gray-600 text-sm">
            {liked_count > 1000
              ? `${(liked_count / 1000).toFixed(1)}k`
              : liked_count.toLocaleString()}{" "}
            thích
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-gray-600 mb-2 text-sm">
        <span className="text-gray-500">Giao từ:</span>
        <span className="font-medium text-gray-900">{displayLocation}</span>
      </div>

      {/* Hiển thị luôn phân bố sao ở mobile hoặc nếu muốn hiển thị trực tiếp (Optional) */}
      {/* Nếu bạn muốn hiển thị luôn thanh progress bar ở đây thay vì Popover, bỏ comment đoạn dưới */}
      {/* <div className="mt-3 p-3 bg-gray-50 rounded-lg max-w-sm">
         {renderRatingDistribution()}
      </div> */}
    </div>
  );
};

export default ProductBasicInfo;
