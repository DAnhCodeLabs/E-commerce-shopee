import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { httpPost } from "../services/httpService";
import { useAuth } from "../contexts/AuthContext";
import CommonForm from "../components/common/CommonForm";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setToken } = useAuth();

  const formItems = [
    {
      name: "identifier",
      label: "Email",
      type: "text",
      rules: [{ required: true, message: "Vui lòng nhập email của bạn!" }],
      placeholder: "Nhập email của bạn",
    },
    {
      name: "password",
      label: "Mật khẩu",
      type: "password",
      rules: [{ required: true, message: "Vui lòng nhập mật khẩu!" }],
      placeholder: "Nhập mật khẩu của bạn",
    },
  ];

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const response = await httpPost("/auth/login", {
        identifier: values.identifier,
        password: values.password,
        type: "admin",
      });

      if (response && response.data && response.data.token) {
        const userData = response.data;
        const userToken = response.data.token;
        localStorage.setItem("token", userToken);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        setToken(userToken);

        setTimeout(() => {
          navigate("/admin");
        }, 1500);
      } else {
        console.error("Định dạng phản hồi đăng nhập không hợp lệ.");
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f7fafc] min-h-screen flex items-center justify-center p-4 relative">
      <div
        className="bg-white rounded-md shadow-md w-full max-w-xs p-6"
        aria-label="Sign In Form"
      >
        <h2 className="text-center text-gray-900 font-semibold text-lg mb-1">
          Đăng Nhập
        </h2>
        <p className="text-center text-gray-500 text-xs mb-6">
          Nhập thông tin của bạn để tiếp tục
        </p>
        <CommonForm
          fields={formItems}
          submitButtonText={"Đăng nhập"}
          onSubmit={handleSubmit}
          loading={loading} // Truyền trạng thái loading vào CommonForm nếu có
          submitButtonProps={{
            className: "w-full mt-6 !py-4.5",
          }}
        />
      </div>
    </div>
  );
};

export default Login;
