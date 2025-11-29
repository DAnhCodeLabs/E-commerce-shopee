// src/pages/admin/AddParentCategory.jsx

import React, { useState, useEffect } from "react";
import { Card, Form, Switch, Select, Spin } from "antd";
import CommonForm from "../../components/common/CommonForm";
import { httpGet, httpPost } from "../../services/httpService";
import { useNavigate } from "react-router-dom";
import BreadcrumbHeader from "../../components/BreadcrumbHeader";

const AddParentCategory = ({ onComplete }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [attributes, setAttributes] = useState([]);
  const [loadingAttributes, setLoadingAttributes] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        setLoadingAttributes(true);
        const response = await httpGet("/admin/attributes?limit=1000");
        setAttributes(response.data || []);
      } catch (err) {
        console.error("Không thể tải danh sách thuộc tính.", err);
      } finally {
        setLoadingAttributes(false);
      }
    };
    fetchAttributes();
  }, []);

  const fields = [
    {
      name: "display_name",
      label: "Tên danh mục",
      rules: [{ required: true, message: "Vui lòng nhập tên danh mục!" }],
      placeholder: "Ví dụ: Thời trang nam",
      span: 12,
    },
    {
      name: "sort_order",
      label: "Thứ tự sắp xếp",
      type: "number",
      placeholder: "Ví dụ: 0",
      inputProps: { min: 0, style: { width: "100%" } },
      span: 12,
    },
    {
      name: "image",
      label: "Hình ảnh",
      type: "pictures-wall",
      rules: [{ required: true, message: "Vui lòng tải lên một hình ảnh!" }],
      inputProps: { maxFiles: 1 },
      span: 12,
    },
    {
      name: "attributeIds",
      label: "Gán Thuộc Tính",
      helpText: "Chọn các thuộc tính sẽ được áp dụng cho danh mục này.",
      customComponent: loadingAttributes ? (
        <Spin />
      ) : (
        <Select
          mode="multiple"
          allowClear
          style={{ width: "100%" }}
          placeholder="-- Chọn thuộc tính --"
          options={attributes.map((attr) => ({
            label: attr.label,
            value: attr._id,
          }))}
        />
      ),
      span: 24,
    },
  ];

  const handleSubmit = async (values) => {
    setLoading(true);
    const formData = new FormData();

    formData.append("display_name", values.display_name);
    formData.append("sort_order", values.sort_order || 0);

    if (values.image && values.image.length > 0) {
      formData.append("image", values.image[0].originFileObj);
    }

    if (values.attributeIds && values.attributeIds.length > 0) {
      formData.append("attributeIds", JSON.stringify(values.attributeIds));
    }

    try {
      await httpPost("/admin/categories", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      form.resetFields();
      if (onComplete) onComplete();
      navigate("/admin/category");
    } catch (error) {
      console.error("Failed to create parent category:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <BreadcrumbHeader
        title="Thêm danh mục cha"
        breadcrumbItems={[
          { title: "Quản lý danh mục", link: "/admin/category" },
          { title: "Thêm danh mục cha" },
        ]}
      />
      <Card title="Thêm danh mục cha mới">
        <CommonForm
          form={form}
          fields={fields}
          onSubmit={handleSubmit}
          loading={loading}
          submitButtonText="Thêm mới"
          cancelButtonText="Làm lại"
          initialValues={{ sort_order: 0, has_children: false }}
        />
      </Card>
    </div>
  );
};

export default AddParentCategory;
