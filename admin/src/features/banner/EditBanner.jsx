import React, { useState, useEffect } from "react";
import { Card, DatePicker, Upload, Select } from "antd";
import dayjs from "dayjs";
import { useParams, useNavigate } from "react-router-dom";
import { httpGet, httpPatch } from "../../services/httpService";
import CommonForm from "../../components/common/CommonForm";
import BreadcrumbHeader from "../../components/BreadcrumbHeader";

const EditBanner = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bannerData, setBannerData] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [initialImage, setInitialImage] = useState([]);

  useEffect(() => {
    const fetchBanner = async () => {
      setLoading(true);
      try {
        const response = await httpGet("/admin/banners", {
          params: { search: id },
        });

        const data = response.data.find((b) => b._id === id);

        if (data) {
          setBannerData(data);
          setInitialImage([
            {
              uid: "-1",
              name: "banner_image.png",
              status: "done",
              url: data.imageUrl,
            },
          ]);
        } else {
          navigate("/admin/banners");
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin banner:", error);
        navigate("/admin/banners");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBanner();
    }
  }, [id, navigate]);

  const handleSubmit = async (values) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("startDate", values.startDate.toISOString());
    formData.append("endDate", values.endDate.toISOString());

    if (values.isActive !== bannerData.isActive) {
      formData.append("isActive", values.isActive);
    }

    if (imageFile) {
      formData.append("image", imageFile);
    }

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    try {
      await httpPatch(`/admin/banners/${id}`, formData, config);

      navigate("/admin/banners");
    } catch (error) {
      console.error("Lỗi khi cập nhật banner:", error);
    } finally {
      setLoading(false);
    }
  };
  const bannerFields = [
    {
      label: "Hình ảnh Banner",
      name: "imageUrl",
      span: 24,
      rules: [
        { required: !bannerData?.imageUrl, message: "Vui lòng chọn hình ảnh!" },
      ],
      customComponent: (
        <Upload
          fileList={initialImage}
          setFile={setImageFile}
          initialUrl={bannerData?.imageUrl}
          maxCount={1}
          listType="picture-card"
        />
      ),
    },
    {
      label: "Ngày bắt đầu",
      name: "startDate",
      span: 12,
      rules: [{ required: true, message: "Vui lòng chọn ngày bắt đầu!" }],
      customComponent: (
        <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
      ),
    },
    {
      label: "Ngày kết thúc",
      name: "endDate",
      span: 12,
      rules: [{ required: true, message: "Vui lòng chọn ngày kết thúc!" }],
      customComponent: (
        <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
      ),
    },
    // Trường isActive, có thể dùng Select/Switch tùy ý, tôi dùng Select cho rõ ràng
    {
      label: "Trạng thái hoạt động",
      name: "isActive",
      span: 24,
      rules: [{ required: true, message: "Vui lòng chọn trạng thái!" }],
      customComponent: (
        <Select>
          <Select.Option value={true}>Đang hoạt động</Select.Option>
          <Select.Option value={false}>Không hoạt động</Select.Option>
        </Select>
      ),
    },
  ];

  const initialValues = bannerData
    ? {
        startDate: dayjs(bannerData.startDate),
        endDate: dayjs(bannerData.endDate),
        isActive: bannerData.isActive,
      }
    : {};

  if (!bannerData) {
    return (
      <Card title="Cập nhật Banner">
        <p>Đang tải dữ liệu...</p>
      </Card>
    );
  }

  return (
    <div>
      <BreadcrumbHeader
        title={"Chỉnh sửa Banner"}
        breadcrumbItems={[
          { title: "Quản lý Banner", path: "/admin/banners" },
          { title: "Chỉnh sửa Banner" },
        ]}
      />

      <Card title={`Chỉnh sửa Banner: ${id}`} className="w-full !mt-10">
        <CommonForm
          fields={bannerFields}
          onSubmit={handleSubmit}
          submitButtonText="Cập nhật"
          cancelButtonText="Hủy bỏ"
          onCancel={() => navigate("/admin/banners")}
          loading={loading}
          layout="vertical"
          initialValues={initialValues}
        />
      </Card>
    </div>
  );
};

export default EditBanner;
