import React, { useState } from "react";
import { Card, Form, DatePicker, message } from "antd";
import BreadcrumbHeader from "../../components/BreadcrumbHeader";
import CommonForm from "../../components/common/CommonForm";
import { httpPost } from "../../services/httpService";
import { useNavigate } from "react-router-dom";

const { RangePicker } = DatePicker;

const BannerAdd = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Xử lý submit form
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      if (values.dates && values.dates.length === 2) {
        formData.append("startDate", values.dates[0].format("YYYY-MM-DD"));
        formData.append("endDate", values.dates[1].format("YYYY-MM-DD"));
      }
      if (
        values.image &&
        values.image.length > 0 &&
        values.image[0].originFileObj
      ) {
        formData.append("image", values.image[0].originFileObj);
      }

      await httpPost("/admin/banners", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Thêm banner thành công");
      form.resetFields();
      setFileList([]);
      navigate("/admin/banners");
    } catch (error) {
      console.error("Lỗi khi thêm banner:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    navigate("/admin/banners");
  };

  const fields = [
    {
      name: "dates",
      label: "Khoảng thời gian",
      span: 12,
      rules: [
        { required: true, message: "Vui lòng chọn ngày bắt đầu và kết thúc" },
      ],
      customComponent: (
        <RangePicker
          format="DD/MM/YYYY"
          placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      name: "image",
      label: "Ảnh Banner",
      rules: [{ required: true, message: "Vui lòng tải lên ảnh banner" }],
      type: "pictures-wall",
      maxFiles: 1,
      accept: "image/*",
      value: fileList,
      span: 12,
      onChange: setFileList,
    },
  ];

  return (
    <div>
      <BreadcrumbHeader
        title="Thêm Banner"
        breadcrumbItems={[
          { title: "Quản lý Banner", to: "/admin/banners" },
          { title: "Thêm Banner" },
        ]}
      />
      <Card title="Thêm Banner Mới" className="w-full !mt-10">
        <CommonForm
          fields={fields}
          onSubmit={handleSubmit}
          submitButtonText="Thêm Banner"
          cancelButtonText="Hủy"
          onCancel={handleCancel}
          loading={loading}
          layout="vertical"
        />
      </Card>
    </div>
  );
};

export default BannerAdd;
