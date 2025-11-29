import React, { useState } from "react";
import HeaderProfile from "./HeaderProfile";
import CommonForm from "../../../components/common/CommonForm";
import { httpPut } from "../../../services/httpService";
import { message } from "antd";
const ChangePassword = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(null);
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const response = await httpPut("/user/profile/change-password", {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      message.success(response.message);
      form?.resetFields();
    } catch (error) {
      console.error("Failed to delete address:", error);
    } finally {
      setLoading(false);
    }
  };
  const formFields = [
    {
      type: "password",
      name: "oldPassword",
      label: "Mật khẩu cũ",
      size: "large",
      placeholder: "Nhập mật khẩu cũ",
      rules: [{ required: true, message: "Vui lòng không bỏ trống ô này" }],
    },
    {
      type: "password",
      name: "newPassword",
      label: "Mật khẩu mới",
      size: "large",
      placeholder: "Nhập mật khẩu mới",
      rules: [
        { required: true, message: "Vui lòng không bỏ trống ô này" },
        ({ getFieldValue }) => ({
          validator(_, value) {
            if (!value || getFieldValue("oldPassword") !== value) {
              return Promise.resolve();
            }
            return Promise.reject(
              new Error("Mật khẩu mới phải khác với mật khẩu hiện tại!")
            );
          },
        }),
      ],
    },
    {
      type: "password",
      name: "confirmPassword",
      label: "Xác nhận mật khẩu mới",
      size: "large",
      placeholder: "Xác nhận mật khẩu mới",
      dependencies: ["newPassword"],
      rules: [
        { required: true, message: "Vui lòng không bỏ trống ô này!" },
        ({ getFieldValue }) => ({
          validator(_, value) {
            if (!value || getFieldValue("newPassword") === value) {
              return Promise.resolve();
            }
            return Promise.reject(new Error("Hai mật khẩu không khớp nhau!"));
          },
        }),
      ],
    },
  ];
  return (
    <div className="w-full flex flex-col">
      <HeaderProfile
        heading={"Thêm mật khẩu"}
        subHeading={
          "Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác"
        }
      />
      <CommonForm
        fields={formFields}
        layout="horizontal"
        onSubmit={handleSubmit}
        submitButtonText="Lưu"
        submitButtonProps={{
          className: "w-[100px] mt-6 !py-4.5 !bg-primary",
        }}
        loading={loading}
        formInstance={setForm}
      />
    </div>
  );
};

export default ChangePassword;
