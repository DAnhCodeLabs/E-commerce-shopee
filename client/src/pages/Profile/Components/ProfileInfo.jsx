import React, { useEffect, useState } from "react";
import { Divider, Row, Col, Radio, Select, message } from "antd";
import { useAuth } from "../../../contexts/AuthContext";
import CommonForm from "../../../components/common/CommonForm";
import { httpPatch } from "../../../services/httpService";

const ProfileInfo = () => {
  const { user, setUser } = useAuth();
  const [username, setUsername] = useState("");
  const [birthDay, setBirthDay] = useState({
    day: "",
    month: "",
    year: "",
  });

  useEffect(() => {
    const savedUsername =
      localStorage.getItem("username") || user?.username || "";
    setUsername(savedUsername);

    if (user?.birthDate) {
      const date = new Date(user.birthDate);
      setBirthDay({
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
      });
    }
  }, [user]);

  const initialValues = {
    username: username,
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phoneNumber || "",
    gender: user?.gender || "",
  };

  // Custom component cho giới tính
  const GenderRadio = ({ value, onChange }) => (
    <Radio.Group
      size="large"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <Radio value="male">Nam</Radio>
      <Radio value="female">Nữ</Radio>
      <Radio value="other">Khác</Radio>
    </Radio.Group>
  );

  const BirthdaySelect = () => (
    <Row gutter={8}>
      <Col span={8}>
        <Select
          size="large"
          placeholder="Ngày"
          className="w-full"
          value={birthDay.day || undefined}
          onChange={(value) => setBirthDay((prev) => ({ ...prev, day: value }))}
          options={Array.from({ length: 31 }, (_, i) => ({
            value: i + 1,
            label: i + 1,
          }))}
        />
      </Col>
      <Col span={8}>
        <Select
          size="large"
          placeholder="Tháng"
          className="w-full"
          value={birthDay.month || undefined}
          onChange={(value) =>
            setBirthDay((prev) => ({ ...prev, month: value }))
          }
          options={Array.from({ length: 12 }, (_, i) => ({
            value: i + 1,
            label: i + 1,
          }))}
        />
      </Col>
      <Col span={8}>
        <Select
          size="large"
          placeholder="Năm"
          className="w-full"
          value={birthDay.year || undefined}
          onChange={(value) =>
            setBirthDay((prev) => ({ ...prev, year: value }))
          }
          options={Array.from({ length: 100 }, (_, i) => ({
            value: new Date().getFullYear() - i,
            label: new Date().getFullYear() - i,
          }))}
        />
      </Col>
    </Row>
  );

  const formFields = [
    {
      name: "username",
      label: "Tên đăng nhập",
      placeholder: "Nhập tên đăng nhập",
      helpText: "Tên đăng nhập chỉ có thể thay đổi một lần",
      size: "large",
      rules: [{ required: true, message: "Vui lòng nhập tên đăng nhập" }],
    },
    {
      name: "fullName",
      label: "Họ tên đầy đủ",
      placeholder: "Nhập họ tên đầy đủ",
      size: "large",
    },
    {
      name: "email",
      label: "Email",
      placeholder: "Nhập Email",
      size: "large",
      rules: [
        { required: true, message: "Vui lòng nhập email" },
        { type: "email", message: "Email không hợp lệ" },
      ],
    },
    {
      name: "phone",
      label: "Số điện thoại",
      type: "number",
      placeholder: "Thêm số điện thoại",
      size: "large",
      className: "custom-input-width",
    },
    {
      name: "gender",
      label: "Giới tính",
      customComponent: <GenderRadio />,
    },
    {
      name: "birthday",
      label: "Ngày sinh",
      customComponent: <BirthdaySelect />,
    },
  ];

  const handleSubmit = async (values) => {
    try {
      const updateData = {
        username: values.username,
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phone,
        gender: values.gender,
      };

      if (birthDay.day && birthDay.month && birthDay.year) {
        const birthDate = new Date(
          birthDay.year,
          birthDay.month - 1,
          birthDay.day
        );
        updateData.birthDate = birthDate.toISOString();
      }

       const response = await httpPatch("/auth/update-profile", updateData);

      if (response.success && response.data) {
        setUser(response.data);
        const currentUserData = JSON.parse(
          localStorage.getItem("user") || "{}"
        );
        const updatedUserData = {
          ...currentUserData,
          ...response.data,
        };
        localStorage.setItem("user", JSON.stringify(updatedUserData));
        if (values.username !== username) {
          localStorage.setItem("username", values.username);
          setUsername(values.username);
        }
      }

      message.success(response.message || "Cập nhật thông tin thành công");
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);

      const errorMessage =
        error.response?.data?.message || "Cập nhật thông tin thất bại";
      message.error(errorMessage);
    }
  };

  return (
    <div className="w-full flex flex-col">
      <div className="flex flex-col justify-center items-start gap-1">
        <h1 className="text-lg font-medium text-gray-800">Hồ Sơ Của Tôi</h1>
        <p className="text-sm text-gray-500">
          Quản lý thông tin hồ sơ để bảo mật tài khoản
        </p>
      </div>
      <Divider />
      <div>
        <CommonForm
          fields={formFields}
          layout="horizontal"
          initialValues={initialValues}
          onSubmit={handleSubmit}
          submitButtonText="Lưu"
          submitButtonProps={{
            className: "w-[100px] mt-6 !py-4.5 !bg-primary",
          }}
        />
      </div>
    </div>
  );
};

export default ProfileInfo;
