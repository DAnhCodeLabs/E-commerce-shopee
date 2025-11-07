import React, { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { message } from "antd";
import CommonForm from "../../components/common/CommonForm";
import Loader from "../../components/common/Loader";
import { httpPost } from "../../../../../eCommerce/client/src/services/httpService";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const formField = [
    {
      name: "email",
      label: "Email",
      rules: [
        { required: true, message: "Vui lòng nhập email!" },
        { type: "email", message: "Email không hợp lệ!" },
      ],
      placeholder: "Nhập email",
      size: "large",
    },
  ];

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const response = await httpPost("/auth/forgot-password", {
        email: values.email,
      });
      message.success(response.message);
      navigate(`/verify-email?type=forgot&email=${values.email}`);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full py-20 flex items-center justify-center mx-auto">
      {loading && <Loader />}
      <div className="py-10 px-15 pb-20 shadow rounded h-auto w-[600px] bg-white">
        <div className="flex items-center mb-6">
          <Link to="/login" className="text-[#F3705A] text-lg">
            <FaArrowLeft />
          </Link>
          <h2 className="flex-1 text-center text-xl text-gray-600 font-medium">
            Đặt lại mật khẩu
          </h2>
        </div>
        <div>
          <CommonForm
            fields={formField}
            submitButtonText="TIẾP THEO"
            onSubmit={handleSubmit}
            submitButtonProps={{
              className: "w-full mt-6 !py-4.5 !bg-primary",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
