import React, { useState, useRef, useEffect } from "react";
import { Button, Typography } from "antd";
import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";

const { Title } = Typography;

const ProductDescription = ({ description }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const contentRef = useRef(null);

  // Chiều cao tối đa khi thu gọn (px)
  const MAX_HEIGHT = 500;

  useEffect(() => {
    // Kiểm tra chiều cao thực tế để hiện nút Xem thêm
    if (contentRef.current && contentRef.current.scrollHeight > MAX_HEIGHT) {
      setShowButton(true);
    } else {
      setShowButton(false);
    }
  }, [description]);

  if (!description || description.trim() === "") {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <span className="text-gray-500">Mô tả sản phẩm đang được cập nhật...</span>
      </div>
    );
  }

  return (
    <div className="product-description">
      <Title level={4} className="!mb-4 !text-base uppercase text-gray-800 border-l-4 border-blue-500 pl-3">
        Mô tả sản phẩm
      </Title>

      <div
        className={`relative overflow-hidden transition-all duration-500 ease-in-out`}
        style={{ maxHeight: isExpanded ? "none" : `${MAX_HEIGHT}px` }}
      >
        <div
          ref={contentRef}
          // Sử dụng Tailwind typography plugin (prose) hoặc CSS thường để format HTML từ editor
          className="prose max-w-none text-gray-800 leading-relaxed
            [&_img]:max-w-full [&_img]:h-auto [&_img]:mx-auto [&_img]:rounded-lg [&_img]:my-4
            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3
            [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1"
          dangerouslySetInnerHTML={{ __html: description }}
        />

        {/* Lớp phủ mờ khi chưa mở rộng */}
        {!isExpanded && showButton && (
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        )}
      </div>

      {showButton && (
        <div className="text-center mt-6">
          <Button
            type="primary"
            ghost // Style nút viền của Antd
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-40"
            icon={isExpanded ? <CaretUpOutlined /> : <CaretDownOutlined />}
          >
            {isExpanded ? "Thu gọn" : "Xem thêm"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductDescription;