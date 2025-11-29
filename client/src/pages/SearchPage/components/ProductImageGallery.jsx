import React, { useState } from "react";
import { Image, Row, Col } from "antd";
import { PlayCircleOutlined } from "@ant-design/icons";

const ProductImageGallery = ({ images = [], video_info_list = [] }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Xử lý dữ liệu thực từ database
  const validImages = Array.isArray(images)
    ? images.filter((img) => img && img.trim() !== "")
    : [];

  const allImages =
    validImages.length > 0
      ? validImages
      : [
          "https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mgktdzq4r8jv81.webp",
        ];

  // Lấy video đầu tiên hợp lệ
  const mainVideo = Array.isArray(video_info_list)
    ? video_info_list.find(
        (video) => video?.video_url && video.video_url.trim() !== ""
      )
    : null;

  const handleThumbnailClick = (index) => {
    setSelectedImageIndex(index);
    setIsVideoPlaying(false);
  };

  const handleVideoThumbnailClick = () => {
    setIsVideoPlaying(true);
  };

  return (
    <div className="product-image-gallery">
      <Row gutter={[16, 16]}>
        {/* Thumbnails Column */}
        <Col xs={24} md={4}>
          <div className="thumbnails-vertical md:flex flex-col gap-2 hidden">
            {/* Video thumbnail nếu có video hợp lệ */}
            {mainVideo && (
              <div
                className={`thumbnail-item w-16 h-16 border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                  isVideoPlaying
                    ? "border-primary"
                    : "border-transparent hover:border-gray-300"
                }`}
                onClick={handleVideoThumbnailClick}
              >
                <div className="relative w-full h-full bg-gray-100 flex items-center justify-center">
                  {mainVideo.thumb_url ? (
                    <img
                      src={mainVideo.thumb_url}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <PlayCircleOutlined className="text-2xl text-gray-600" />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-1">
                    Video
                  </div>
                </div>
              </div>
            )}

            {/* Image thumbnails */}
            {allImages.map((image, index) => (
              <div
                key={index}
                className={`thumbnail-item w-16 h-16 border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                  selectedImageIndex === index && !isVideoPlaying
                    ? "border-primary"
                    : "border-transparent hover:border-gray-300"
                }`}
                onClick={() => handleThumbnailClick(index)}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mgktdzq4r8jv81.webp";
                  }}
                />
              </div>
            ))}
          </div>

          {/* Thumbnails horizontal cho mobile */}
          <div className="thumbnails-horizontal flex md:hidden gap-2 overflow-x-auto pb-2">
            {mainVideo && (
              <div
                className={`thumbnail-item flex-shrink-0 w-16 h-16 border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                  isVideoPlaying
                    ? "border-primary"
                    : "border-transparent hover:border-gray-300"
                }`}
                onClick={handleVideoThumbnailClick}
              >
                <div className="relative w-full h-full bg-gray-100 flex items-center justify-center">
                  {mainVideo.thumb_url ? (
                    <img
                      src={mainVideo.thumb_url}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <PlayCircleOutlined className="text-2xl text-gray-600" />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-1">
                    Video
                  </div>
                </div>
              </div>
            )}

            {allImages.map((image, index) => (
              <div
                key={index}
                className={`thumbnail-item flex-shrink-0 w-16 h-16 border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                  selectedImageIndex === index && !isVideoPlaying
                    ? "border-primary"
                    : "border-transparent hover:border-gray-300"
                }`}
                onClick={() => handleThumbnailClick(index)}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mgktdzq4r8jv81.webp";
                  }}
                />
              </div>
            ))}
          </div>
        </Col>

        {/* Main Image/Video Display */}
        <Col xs={24} md={20}>
          <div className="main-image-container bg-white rounded-lg border border-gray-200 p-4">
            {isVideoPlaying && mainVideo ? (
              <div className="video-container relative w-full h-96 md:h-[500px] bg-black rounded-lg flex items-center justify-center">
                <video
                  controls
                  autoPlay
                  className="max-w-full max-h-full"
                  poster={mainVideo.thumb_url}
                >
                  <source src={mainVideo.video_url} type="video/mp4" />
                  Trình duyệt của bạn không hỗ trợ video.
                </video>
                <button
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-70 transition-all"
                  onClick={() => setIsVideoPlaying(false)}
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="image-container flex justify-center items-center h-96 md:h-[500px]">
                <Image
                  src={allImages[selectedImageIndex]}
                  alt={`Product image ${selectedImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                  preview={{
                    mask: null,
                  }}
                  fallback="https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mgktdzq4r8jv81.webp"
                />
              </div>
            )}
          </div>

          {/* Image counter */}
          <div className="image-counter text-center mt-2 text-gray-500 text-sm">
            {isVideoPlaying
              ? "Video sản phẩm"
              : `${selectedImageIndex + 1} / ${allImages.length}`}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ProductImageGallery;
