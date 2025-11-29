import React, { useState } from "react";
import { assets } from "../../assets/assets";
import CommonForm from "../../components/common/CommonForm";
import { Checkbox, Divider, Flex, message } from "antd";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Loader from "../../components/common/Loader";
import { httpPost } from "../../services/httpService";

const Login = () => {
  const [state, setState] = useState("login");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useAuth();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (state === "register") {
        const response = await httpPost("/auth/register", {
          username: values.username,
          email: values.email,
          password: values.password,
        });
        if (response.success) {
          message.success(response.message);
          navigate(`/verify-email?type=register&email=${values.email}`);
        } else {
          message.error(response.message);
        }
      } else if (state === "login") {
        const loginResponse = await httpPost("/auth/login", {
          identifier: values.identifier,
          password: values.password,
          type: "user",
        });

        if (loginResponse.success) {
          message.success(loginResponse.message);

          // Sửa: Extract user data, loại bỏ token trước khi lưu/set
          const fullData = loginResponse.data;
          const userData = { ...fullData };
          const token = userData.token;
          delete userData.token; // Loại bỏ token khỏi user object

          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("token", token);
          setUser(userData);
          setToken(token);

          setTimeout(() => {
            navigate("/");
          }, 1500);
        } else {
          message.error(loginResponse.message);
        }
      }
    } catch (error) {
      console.error("Lỗi khi thực hiện thao tác:", error.message);
      const errMsg =
        error.response?.data?.message || "Có lỗi xảy ra từ máy chủ!";
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const passwordField = {
    name: "password",
    label: "Mật khẩu",
    rules: [{ required: true, message: "Vui lòng nhập mật khẩu!" }],
    type: "password",
    placeholder: "Nhập mật khẩu",
    size: "large",
  };

  const loginFields = [
    {
      name: "identifier",
      label: "Email/Tên đăng nhập",
      rules: [
        {
          required: true,
          message: "Vui lòng nhập email hoặc Tên đăng nhập!",
        },
        {
          validator: (_, value) => {
            if (!value) return Promise.resolve();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const usernameRegex = /^[a-zA-Z0-9_]+$/;

            if (emailRegex.test(value) || usernameRegex.test(value)) {
              return Promise.resolve();
            }
            return Promise.reject(
              new Error("Vui lòng nhập email hoặc Tên đăng nhập hợp lệ!")
            );
          },
        },
      ],
      placeholder: "Nhập email hoặc Tên đăng nhập",
      size: "large",
    },
    passwordField,
  ];

  const registerFields = [
    {
      name: "username",
      label: "Tên đăng nhập",
      rules: [{ required: true, message: "Vui lòng nhập Tên đăng nhập!" }],
      placeholder: "Nhập Tên đăng nhập",
      size: "large",
    },
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
    passwordField,
  ];

  const formFields = state === "login" ? loginFields : registerFields;

  return (
    <>
      {loading && <Loader />}
      <div className="bg-primary w-full py-20 flex items-center justify-center mx-auto">
        <div className="flex justify-center items-center w-[1100px] gap-28">
          <div className="flex flex-col gap-10 items-center justify-center w-1/2">
            <img src={assets.logoShopee} alt="" className="w-[400px]" />
            <p className="text-white text-3xl text-center leading-relaxed">
              Nền tảng thương mại điện tử yêu thích ở Đông Nam Á & Đài Loan
            </p>
          </div>
          <div className="w-1/2">
            <div className="w-[500px] h-auto p-8 rounded-xl bg-white flex flex-col justify-center items-start">
              <h1 className="text-2xl font-semibold text-gray-700 mb-6">
                {state === "login" ? "Đăng nhập" : "Đăng ký"}
              </h1>
              <CommonForm
                fields={formFields}
                onSubmit={handleSubmit}
                submitButtonText={state === "login" ? "ĐĂNG NHẬP" : "ĐĂNG KÝ"}
                submitButtonProps={{
                  className: "w-full mt-6 !py-4.5 !bg-primary",
                }}
              />
              <Flex
                justify="space-between"
                align="center"
                className="w-full !mt-2"
              >
                <Checkbox>Nhớ tài khoản</Checkbox>
                <Link to={"/forgot-password"}>Quên mật khẩu</Link>
              </Flex>
              <Divider>Hoặc</Divider>
              <div className="flex justify-center space-x-4 w-full">
                <button
                  type="button"
                  className="py-2 px-4 w-full border border-gray-300 rounded-md flex justify-center items-center gap-4 text-gray-800 hover:bg-gray-50"
                >
                  <FaFacebook />
                  Facebook
                </button>
                <button
                  type="button"
                  className="py-2 w-full px-4 border border-gray-300 rounded-md flex justify-center items-center gap-4 text-gray-800 hover:bg-gray-50"
                >
                  <FaGoogle />
                  Google
                </button>
              </div>
              <div className="w-4/5 mx-auto text-center mt-8">
                {state === "login" ? (
                  ""
                ) : (
                  <p className="text-sm text-gray-600">
                    Bằng việc đăng kí, bạn đã đồng ý với Shopee về
                    <p>
                      <span className="text-primary">Điều khoản dịch vụ</span> &{" "}
                      <span className="text-primary">Chính sách bảo mật</span>
                    </p>
                  </p>
                )}
              </div>
              <div className="w-full mx-auto flex items-center justify-center gap-2 mt-6">
                <p className="text-gray-300">Bạn mới biết đến Shopee?</p>
                <p
                  onClick={() =>
                    setState(state === "login" ? "register" : "login")
                  }
                  className="text-primary cursor-pointer hover:text-primary/60 duration-150 transition-all ease-in"
                >
                  {state === "login" ? "Đăng ký" : "Đăng nhập"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
