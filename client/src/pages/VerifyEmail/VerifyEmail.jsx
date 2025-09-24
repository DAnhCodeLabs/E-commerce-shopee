import React, { useState } from "react";
import { Steps, Button, Card, Form, Input, message } from "antd";
import {
  MailOutlined,
  LockOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { httpPost } from "../../../../../eCommerce/client/src/services/httpService";
import Loader from "../../components/common/Loader";

const { Step } = Steps;

const VerifyEmail = () => {
  const [current, setCurrent] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get("type");
  const email = queryParams.get("email");
  const [otpForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const next = () => setCurrent(current + 1);
  const prev = () => setCurrent(current - 1);

  const onOtpFinish = async (values) => {
    try {
      setLoading(true);
      const response = await httpPost("/auth/verifi-email", {
        email: email,
        otp: values.otp,
      });
      if (response.success) {
        message.success(response.message);
        next();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      const errMsg =
        error?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!";
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const onPasswordFinish = async (values) => {
    try {
      const respone = await httpPost("/auth/reset-password", {
        email,
        newPassword: values.password,
      });
      if (respone.success) {
        message.success(respone.message);
        next();
      } else {
        message.error(respone.message);
      }
    } catch (error) {
      const errMsg =
        error?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!";
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Tùy chỉnh Steps component
  const CustomStep = ({ number, title, isActive, isFinished }) => (
    <div className="custom-step">
      <div
        className={`step-number ${isActive ? "active" : ""} ${
          isFinished ? "finished" : ""
        }`}
      >
        {isFinished ? <CheckCircleOutlined /> : number}
      </div>
      <div className="step-title">{title}</div>
    </div>
  );

  const steps = [
    {
      title: "Xác minh email",
      icon: <MailOutlined />,
      content: (
        <div>
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                <ArrowLeftOutlined
                  style={{ marginRight: "8px", cursor: "pointer" }}
                  onClick={() => navigate(-1)}
                />
                <span className="flex-1 text-center">Nhập mã xác nhận</span>
              </div>
            }
            style={{ marginTop: 16 }}
            className="shadow text-center"
          >
            <div className="mb-6 py-6 w-full text-center mx-auto flex flex-col items-center justify-center leading-loose">
              <p className="tracking-wide">
                Mã xác minh được gửi đến email. Vui lòng kiểm tra hộp thư!
              </p>
              <p className="tracking-wider font-medium">{email}</p>
            </div>

            <Form form={otpForm} layout="vertical" onFinish={onOtpFinish}>
              <Form.Item
                name="otp"
                rules={[{ required: true, message: "Vui lòng nhập mã OTP!" }]}
              >
                <Input.OTP size="large" />
              </Form.Item>

              <Form.Item className="!py-4 !mt-6">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="!py-4 !bg-primary w-full duration-200 transition-all ease-in hover:!bg-primary/80"
                >
                  XÁC MINH
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      ),
    },
    ...(type === "forgot"
      ? [
          {
            title: "Nhập mật khẩu mới",
            icon: <LockOutlined />,
            content: (
              <Card
                title="Nhập mật khẩu mới"
                style={{ marginTop: 16 }}
                className="w-full text-center"
              >
                <Form
                  form={passwordForm}
                  layout="vertical"
                  onFinish={onPasswordFinish}
                >
                  <Form.Item
                    label="Mật khẩu mới"
                    name="password"
                    rules={[
                      { required: true, message: "Vui lòng nhập mật khẩu!" },
                      { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                    ]}
                  >
                    <Input.Password
                      size="large"
                      placeholder="Nhập mật khẩu mới"
                    />
                  </Form.Item>
                  <Form.Item
                    label="Xác nhận mật khẩu"
                    name="confirmPassword"
                    dependencies={["password"]}
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng xác nhận mật khẩu!",
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("password") === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Mật khẩu xác nhận không khớp!")
                          );
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      size="large"
                      placeholder="Xác nhận mật khẩu"
                    />
                  </Form.Item>
                  <Form.Item className="!py-4 !mt-6">
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="!py-4 !bg-primary w-full duration-200 transition-all ease-in hover:!bg-primary/80"
                    >
                      TIẾP THEO
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            ),
          },
        ]
      : []),
    {
      title: "Hoàn thành",
      icon: <CheckCircleOutlined />,
      content: (
        <Card title="Hoàn thành" style={{ marginTop: 16, textAlign: "center" }}>
          <CheckCircleOutlined style={{ fontSize: "48px", color: "#52c41a" }} />
          <p style={{ marginTop: 16, fontSize: "16px" }}>
            Bạn đã hoàn thành{" "}
            {type === "register" ? "đăng ký" : "đặt lại mật khẩu"}!
          </p>
          <Button
            type="primary"
            htmlType="submit"
            className="!py-4 !bg-primary w-full !mt-10 !mb-6 duration-200 transition-all ease-in hover:!bg-primary/80"
          >
            <Link className="w-full " to={"/login"}>
              Quay về trang đăng nhập
            </Link>
          </Button>
        </Card>
      ),
    },
  ];

  return (
    <>
      {loading && <Loader />}
      <div style={{ padding: 24 }} className="w-[600px] mx-auto !py-25">
        <div className="custom-steps-container">
          <div className="custom-steps">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <CustomStep
                  number={index + 1}
                  title={step.title}
                  isActive={current === index}
                  isFinished={current > index}
                />
                {index < steps.length - 1 && (
                  <div className="step-connector">
                    <div className="step-line"></div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="steps-content">{steps[current].content}</div>
        <div className="steps-action" style={{ marginTop: 24 }}>
          {current > 0 && (
            <Button style={{ margin: "0 8px" }} onClick={prev}>
              Quay lại
            </Button>
          )}
        </div>

        <style jsx>{`
          .custom-steps-container {
            margin-bottom: 32px;
          }

          .custom-steps {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .custom-step {
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .step-number {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #f0f0f0;
            color: #000;
            font-weight: bold;
            margin-bottom: 8px;
          }

          .step-number.active {
            background-color: #24cb06;
            color: white;
          }

          .step-number.finished {
            background-color: #52c41a;
            color: white;
          }

          .step-title {
            font-size: 14px;
            color: #000;
            text-align: center;
          }

          .step-connector {
            display: flex;
            align-items: center;
            margin: 0 16px;
            position: relative;
          }

          .step-line {
            width: 60px;
            height: 2px;
            background-color: #d9d9d9;
            margin: 0 4px;
          }
        `}</style>
      </div>
    </>
  );
};

export default VerifyEmail;
