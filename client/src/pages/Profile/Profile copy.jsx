import React, { useState } from "react";
import {
  Layout,
  Menu,
  Card,
  Form,
  Input,
  Button,
  Radio,
  Select,
  Upload,
  Avatar,
  Divider,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  BankOutlined,
  EnvironmentOutlined,
  LockOutlined,
  SettingOutlined,
  EyeInvisibleOutlined,
  ShoppingOutlined,
  GiftOutlined,
  StarOutlined,
  CameraOutlined,
} from "@ant-design/icons";

const { Sider, Content } = Layout;
const { Option } = Select;

const Profile1 = () => {
  const [form] = Form.useForm();
  const [gender, setGender] = useState("");

  const menuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Hồ Sơ",
    },
    {
      key: "bank",
      icon: <BankOutlined />,
      label: "Ngân Hàng",
    },
    {
      key: "address",
      icon: <EnvironmentOutlined />,
      label: "Địa Chỉ",
    },
    {
      key: "password",
      icon: <LockOutlined />,
      label: "Đổi Mật Khẩu",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài Đặt Thông Báo",
    },
    {
      key: "privacy",
      icon: <EyeInvisibleOutlined />,
      label: "Những Thiết Lập Riêng Tư",
    },
    {
      key: "personal",
      icon: <UserOutlined />,
      label: "Thông Tin Cá Nhân",
    },
  ];

  const purchaseItems = [
    {
      key: "voucher",
      icon: <GiftOutlined />,
      label: "Kho Voucher",
    },
    {
      key: "coins",
      icon: <StarOutlined />,
      label: "Shopee Xu",
    },
  ];

  const uploadProps = {
    beforeUpload: (file) => {
      const isJpgOrPng =
        file.type === "image/jpeg" || file.type === "image/png";
      if (!isJpgOrPng) {
        message.error("Chỉ có thể upload file JPEG/PNG!");
      }
      const isLt1M = file.size / 1024 / 1024 < 1;
      if (!isLt1M) {
        message.error("Ảnh phải nhỏ hơn 1MB!");
      }
      return isJpgOrPng && isLt1M;
    },
    showUploadList: false,
  };

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <Layout>
        <Sider
          width={250}
          style={{
            backgroundColor: "#fff",
            padding: "20px 0",
            marginRight: "20px",
          }}
        >
          <div style={{ padding: "0 20px 20px" }}>
            <h2 style={{ margin: 0 }}>Lnhanh</h2>
            <Button type="primary" style={{ width: "100%", marginTop: "10px" }}>
              Sửa Hồ Sơ
            </Button>
          </div>

          <Divider style={{ margin: "10px 0" }} />

          <div style={{ padding: "0 20px" }}>
            <h4 style={{ color: "#888" }}>Thông Báo</h4>
          </div>

          <Menu
            mode="vertical"
            defaultSelectedKeys={["profile"]}
            items={menuItems}
            style={{ border: "none" }}
          />

          <Divider style={{ margin: "10px 0" }} />

          <div style={{ padding: "0 20px" }}>
            <h4 style={{ color: "#888" }}>Đơn Mua</h4>
          </div>

          <Menu
            mode="vertical"
            items={purchaseItems}
            style={{ border: "none" }}
          />
        </Sider>

        <Content style={{ padding: "20px" }}>
          <Card
            title="Hồ Sơ Của Tôi"
            extra="Quản lý thông tin hồ sơ để bảo mật tài khoản"
            style={{ width: "100%" }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={6}>
                <div style={{ textAlign: "center" }}>
                  <Avatar size={100} icon={<UserOutlined />} />
                  <Upload {...uploadProps}>
                    <Button
                      icon={<CameraOutlined />}
                      style={{ marginTop: "10px" }}
                    >
                      Chọn Ảnh
                    </Button>
                  </Upload>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#888",
                      marginTop: "5px",
                    }}
                  >
                    Dung lượng tối đa 1 MB
                    <br />
                    Định dạng: JPEG, .PNG
                  </p>
                </div>
              </Col>

              <Col xs={24} md={18}>
                <Form form={form} layout="vertical">
                  <Form.Item label="Tên đăng nhập">
                    <Input
                      value="Lnhanh"
                      disabled
                      addonAfter={
                        <span style={{ fontSize: "12px", color: "#888" }}>
                          Tên đăng nhập chỉ có thể thay đổi một lần
                        </span>
                      }
                    />
                  </Form.Item>

                  <Form.Item label="Tên">
                    <Input value="L." />
                  </Form.Item>

                  <Form.Item label="Email">
                    <Input
                      value="le*******@gmail.com"
                      addonAfter={<Button type="link">Thay Đổi</Button>}
                    />
                  </Form.Item>

                  <Form.Item label="Số điện thoại">
                    <Input placeholder="Thêm" />
                  </Form.Item>

                  <Form.Item label="Giới tính">
                    <Radio.Group
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <Radio value="male">Nam</Radio>
                      <Radio value="female">Nữ</Radio>
                      <Radio value="other">Khác</Radio>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item label="Ngày sinh">
                    <Row gutter={8}>
                      <Col span={8}>
                        <Select placeholder="Ngày" style={{ width: "100%" }}>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(
                            (day) => (
                              <Option key={day} value={day}>
                                {day}
                              </Option>
                            )
                          )}
                        </Select>
                      </Col>
                      <Col span={8}>
                        <Select placeholder="Tháng" style={{ width: "100%" }}>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(
                            (month) => (
                              <Option key={month} value={month}>
                                {month}
                              </Option>
                            )
                          )}
                        </Select>
                      </Col>
                      <Col span={8}>
                        <Select placeholder="Năm" style={{ width: "100%" }}>
                          {Array.from(
                            { length: 100 },
                            (_, i) => new Date().getFullYear() - i
                          ).map((year) => (
                            <Option key={year} value={year}>
                              {year}
                            </Option>
                          ))}
                        </Select>
                      </Col>
                    </Row>
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Lưu Thay Đổi
                    </Button>
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Profile1;
