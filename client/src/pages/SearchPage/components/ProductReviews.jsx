// ProductReviews.jsx
import React, { useState, useEffect } from "react";
import { Pagination, Empty, Button, Rate } from "antd";
import { EditOutlined, StarFilled } from "@ant-design/icons";
import ReviewItem from "./ReviewItem";
import { httpGet } from "../../../services/httpService";
import ReviewFormModal from "./ReviewFormModal";

const ProductReviews = ({ productId, itemRating, productInfo }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [showModal, setShowModal] = useState(false);
  const [canReview, setCanReview] = useState(false);

  // Fetch reviews - giữ nguyên logic
  const fetchReviews = async (page = 1, filter = "all") => {
    setLoading(true);
    try {
      let query = `page=${page}&limit=${pagination.pageSize}`;
      if (filter !== "all" && filter !== "has_media") {
        query += `&star=${filter}`;
      }
      if (filter === "has_media") {
        query += `&has_media=true`;
      }

      const response = await httpGet(
        `/user/review/product/${productId}?${query}`
      );
      if (response.success) {
        setReviews(response.data);
        setPagination({
          ...pagination,
          current: page,
          total: response.pagination?.total || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSuccess = () => {
    fetchReviews(1, "all");
    setCanReview(false);
  };

  const checkEligibility = async () => {
    try {
      const res = await httpGet(
        `/user/review/check-eligibility?product_id=${productId}`
      );
      if (res.success) {
        setCanReview(res.can_review);
      }
    } catch (err) {
      setCanReview(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews(1, activeFilter);
      checkEligibility();
    }
  }, [productId, activeFilter]);

  const handlePageChange = (page) => {
    fetchReviews(page, activeFilter);
  };

  const filters = [
    { key: "all", label: "Tất cả", count: itemRating?.total_reviews || 0 },
    {
      key: "5",
      label: "5 sao",
      count: itemRating?.ratings_distribution?.[5] || 0,
    },
    {
      key: "4",
      label: "4 sao",
      count: itemRating?.ratings_distribution?.[4] || 0,
    },
    {
      key: "3",
      label: "3 sao",
      count: itemRating?.ratings_distribution?.[3] || 0,
    },
    {
      key: "2",
      label: "2 sao",
      count: itemRating?.ratings_distribution?.[2] || 0,
    },
    {
      key: "1",
      label: "1 sao",
      count: itemRating?.ratings_distribution?.[1] || 0,
    },
    {
      key: "has_media",
      label: "Có ảnh",
      count: reviews.filter((r) => r.images?.length > 0).length,
    },
  ];

  return (
    <div className="product-reviews bg-white rounded-lg">
      {/* Header đơn giản */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Đánh giá sản phẩm
            </h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {itemRating?.total_reviews || 0} đánh giá
            </span>
          </div>

          {canReview && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="middle"
              className="!bg-primary"
              onClick={() => setShowModal(true)}
            >
              Viết đánh giá
            </Button>
          )}
        </div>
      </div>

      {/* Filter Section - Dạng horizontal compact */}
      <div className="p-3 border-b border-gray-100 bg-gray-50">
        <div className="flex flex-wrap gap-1">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`
                px-3 py-1 text-xs rounded-full border transition-colors
                ${
                  activeFilter === filter.key
                    ? "bg-primary text-white border-primary font-medium"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }
              `}
            >
              {filter.label}
              <span className="ml-1 opacity-80">({filter.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Review List - Gọn gàng */}
      <div className="review-list">
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : reviews.length > 0 ? (
          <>
            <div className="divide-y divide-gray-100">
              {reviews.map((review) => (
                <ReviewItem key={review._id} review={review} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.total > pagination.pageSize && (
              <div className="p-3 border-t border-gray-100">
                <Pagination
                  current={pagination.current}
                  total={pagination.total}
                  pageSize={pagination.pageSize}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  size="small"
                  simple
                />
              </div>
            )}
          </>
        ) : (
          <div className="p-6 text-center">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-gray-500">
                  {activeFilter !== "all"
                    ? "Không có đánh giá phù hợp"
                    : "Sản phẩm chưa có đánh giá"}
                </span>
              }
            />
          </div>
        )}
      </div>

      {/* Review Modal */}
      <ReviewFormModal
        visible={showModal}
        onCancel={() => setShowModal(false)}
        onSuccess={handleReviewSuccess}
        productInfo={{
          productId: productId,
          shopId: productInfo?.shopId,
          name: productInfo?.name,
          image: productInfo?.image,
          variant: productInfo?.variant, 
        }}
      />
    </div>
  );
};

export default ProductReviews;
