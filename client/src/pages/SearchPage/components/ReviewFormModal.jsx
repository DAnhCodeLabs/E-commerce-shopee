// ReviewFormModal.jsx - Cập nhật fields definition
import React, { useState, useRef } from "react";
import { Modal, message, Divider } from "antd";
import CommonForm from "../../../components/common/CommonForm";
import { httpPost } from "../../../services/httpService";

const ReviewFormModal = ({ visible, onCancel, onSuccess, productInfo }) => {
  const formRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("product_id", productInfo.productId);
      formData.append("shop_id", productInfo.shopId);
      formData.append("rating", values.rating);
      formData.append("comment", values.comment);

      // Xử lý ảnh từ fileList
      if (values.images && values.images.length > 0) {
        values.images.forEach((file) => {
          if (file.originFileObj) {
            formData.append("images", file.originFileObj);
          }
        });
      }

      const response = await httpPost("/user/review", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.success) {
        message.success("Gửi đánh giá thành công!");
        formRef.current?.resetFields();
        onSuccess?.();
        onCancel?.();
      }
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || "Lỗi khi gửi đánh giá");
    } finally {
      setSubmitting(false);
    }
  };

  const fields = [
    {
      name: "rating",
      label: "Chất lượng sản phẩm",
      type: "rate",
      rules: [{ required: true, message: "Vui lòng chọn số sao!" }],
      inputProps: {
        tooltips: ["Rất tệ", "Không tốt", "Bình thường", "Tốt", "Tuyệt vời"],
        className: "text-3xl",
      },
    },
    {
      name: "comment",
      label: "Chia sẻ cảm nhận của bạn",
      type: "textarea",
      placeholder:
        "Hãy chia sẻ những điều bạn thích về sản phẩm này với những người mua khác nhé.",
      rules: [
        { required: true, message: "Vui lòng viết ít nhất vài từ!" },
        { min: 5, message: "Đánh giá nên có ít nhất 5 ký tự!" },
      ],
      inputProps: {
        maxLength: 500,
        showCount: true,
        rows: 4,
        className: "resize-none",
      },
    },
    {
      name: "images",
      label: "Thêm hình ảnh thực tế",
      type: "upload",
      inputProps: {
        maxCount: 5,
        accept: "image/*",
        listType: "picture-card",
        className: "w-full",
      },
    },
  ];

  return (
    <Modal
      title="Đánh giá sản phẩm"
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      maskClosable={false}
      width={520}
    >
      {/* Thông tin sản phẩm tóm tắt */}
      <div className="flex items-center gap-3 mb-4 bg-gray-50 p-3 rounded-lg">
        <img
          src={productInfo.image}
          alt="product"
          className="w-12 h-12 object-cover rounded border border-gray-200"
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-800 truncate">
            {productInfo.name}
          </p>
          <p className="text-xs text-gray-500">
            Phân loại: {productInfo.variant || "Mặc định"}
          </p>
        </div>
      </div>

      <Divider className="my-2" />

      <CommonForm
        formInstance={(form) => {
          formRef.current = form;
        }}
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        submitButtonText="Hoàn thành"
        submitButtonProps={{
          className:
            "!bg-primary hover:bg-red-600 border-red-500 w-full h-10 font-medium",
        }}
        cancelButtonText="Trở lại"
        cancelButtonProps={{
          className:
            "w-full h-10 border-gray-300 text-gray-700 hover:border-gray-400",
        }}
        loading={submitting}
        layout="vertical"
        initialValues={{ images: [] }}
      />
    </Modal>
  );
};

export default ReviewFormModal;
