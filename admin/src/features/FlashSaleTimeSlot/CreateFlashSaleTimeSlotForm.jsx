// CreateFlashSaleTimeSlotForm.jsx
import React, { useState } from "react";
import { Card, message } from "antd";
import { httpPost } from "../../services/httpService";
import CommonForm from "../../components/common/CommonForm";
import { useNavigate } from "react-router-dom";

const CreateFlashSaleTimeSlotForm = () => {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigate()
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
    const response =  await httpPost("/admin/flash-sale/slots", values);
      message.success(response.message);
      navigation("/admin/flashsaletimeslot-list");
    } catch (error) {
      console.error("Create flash sale time slot error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    message.info("Đã hủy thao tác thêm mới");
  };

  const formFields = [
    {
      name: "name",
      label: "Tên khung giờ",
      type: "text",
      placeholder: "Nhập tên khung giờ (VD: Sáng sớm, Trưa, Chiều tối...)",
      rules: [
        {
          required: true,
          message: "Vui lòng nhập tên khung giờ",
        },
        {
          min: 2,
          message: "Tên khung giờ phải có ít nhất 2 ký tự",
        },
      ],
      span: 24,
    },
    {
      name: "start_time",
      label: "Giờ bắt đầu",
      type: "text",
      placeholder: "HH:MM (VD: 08:00, 14:30)",
      rules: [
        {
          required: true,
          message: "Vui lòng nhập giờ bắt đầu",
        },
        {
          pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
          message: "Định dạng giờ phải là HH:MM (24h)",
        },
      ],
      span: 12,
    },
    {
      name: "end_time",
      label: "Giờ kết thúc",
      type: "text",
      placeholder: "HH:MM (VD: 10:00, 16:30)",
      rules: [
        {
          required: true,
          message: "Vui lòng nhập giờ kết thúc",
        },
        {
          pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
          message: "Định dạng giờ phải là HH:MM (24h)",
        },
      ],
      span: 12,
    },
  ];

  return (
    <div className="">
      <Card
        title="Thêm mới khung giờ Flash Sale"
        bordered={false}
        className="mx-auto shadow-lg"
      >
        <div className="mb-4 text-gray-600">
          <p>Thêm khung giờ mới cho chương trình Flash Sale. Lưu ý:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Giờ kết thúc phải sau giờ bắt đầu</li>
            <li>Định dạng thời gian: HH:MM (24 giờ)</li>
            <li>Không được trùng khung giờ bắt đầu với khung giờ đã có</li>
          </ul>
        </div>

        <CommonForm
          fields={formFields}
          onSubmit={handleSubmit}
          submitButtonText="Tạo khung giờ"
          cancelButtonText="Hủy bỏ"
          onCancel={handleCancel}
          loading={loading}
          layout="vertical"
          submitButtonProps={{
            className: "bg-blue-600 hover:bg-blue-700 text-white",
          }}
          cancelButtonProps={{
            className: "hover:border-gray-400 hover:text-gray-600",
          }}
        />
      </Card>
    </div>
  );
};

export default CreateFlashSaleTimeSlotForm;
