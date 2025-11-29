// src/pages/admin/CreateAttribute.jsx

import React, { useState } from "react";
import { Card, Form, Select } from "antd";
import { useNavigate } from "react-router-dom";
import BreadcrumbHeader from "../../components/BreadcrumbHeader";
import { httpPost } from "../../services/httpService";
import CommonForm from "../../components/common/CommonForm";

const { Option } = Select;

const CreateAttribute = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const [selectedInputType, setSelectedInputType] = useState("text");

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await httpPost("/admin/attributes", values);
      navigate("/admin/attribute");
    } catch (error) {
      console.error("Lỗi khi tạo thuộc tính:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/attribute");
  };

  const fields = [
    {
      label: "Nhãn Hiển Thị",
      name: "label",
      placeholder: "Ví dụ: Dung lượng RAM",
      rules: [{ required: true, message: "Vui lòng nhập nhãn hiển thị!" }],
      span: 12,
    },
    {
      label: "Tên Hệ Thống",
      name: "name",
      placeholder: "Ví dụ: ram_capacity (không dấu, không khoảng trắng)",
      rules: [{ required: true, message: "Vui lòng nhập tên hệ thống!" }],
      helpText: "Tên này sẽ là duy nhất và được dùng trong code.",
      span: 12,
    },
    {
      label: "Loại Nhập Liệu",
      name: "input_type",
      rules: [{ required: true, message: "Vui lòng chọn loại nhập liệu!" }],
      customComponent: (
        <Select
          placeholder="Chọn loại dữ liệu"
          onChange={(value) => setSelectedInputType(value)}
        >
          <Option value="text">Text (Văn bản)</Option>
          <Option value="number">Number (Số)</Option>
          <Option value="select">Select (Chọn một)</Option>
          <Option value="multiselect">Multi-select (Chọn nhiều)</Option>
        </Select>
      ),
      span: 24,
    },
  ];

  if (selectedInputType === "select" || selectedInputType === "multiselect") {
    fields.push({
      label: "Các Tùy Chọn",
      name: "options",
      rules: [
        { required: true, message: "Vui lòng nhập ít nhất một tùy chọn!" },
      ],
      helpText: "Nhập một giá trị rồi nhấn Enter để thêm.",
      customComponent: (
        <Select
          mode="tags"
          style={{ width: "100%" }}
          placeholder="Nhập các tùy chọn và nhấn Enter"
        />
      ),
      span: 24,
    });
  }

  return (
    <div>
      <BreadcrumbHeader
        title="Quản lý thuộc tính"
        breadcrumbItems={[
          { title: "Dashboard", href: "/admin/dashboard" },
          { title: "Quản lý thuộc tính", href: "/admin/attribute" },
          { title: "Thêm mới" },
        ]}
      />
      <Card title="Thêm Thuộc Tính Mới">
        <CommonForm
          form={form}
          fields={fields}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
          initialValues={{ input_type: "text" }}
          submitButtonText="Tạo Thuộc Tính"
          cancelButtonText="Hủy Bỏ"
        />
      </Card>
    </div>
  );
};

export default CreateAttribute;
