import React from "react";
import { Modal, Descriptions, Tag, Avatar, Card, List, Empty } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ShopOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const UserDetailsModal = ({ user, visible, onClose }) => {
  if (!user) {
    return null;
  }

  const getRoleTag = (role) => {
    switch (role) {
      case "admin":
        return <Tag color="gold">Quản trị viên</Tag>;
      case "seller":
        return <Tag color="blue">Người bán</Tag>;
      default:
        return <Tag color="default">Người dùng</Tag>;
    }
  };

  const renderAddress = (address, index) => {
    const fullAddress = `${address.street}, ${address.city}, ${
      address.state || ""
    }, ${address.country}`.replace(/, ,/g, ",");
    return (
      <List.Item>
        <List.Item.Meta
          title={`Địa chỉ ${index + 1}`}
          description={
            <>
              <p style={{ margin: 0 }}>
                <strong>Tên người nhận:</strong> {address.name}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Số điện thoại:</strong> {address.phone}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Địa chỉ:</strong> {fullAddress}
              </p>
            </>
          }
        />
      </List.Item>
    );
  };

  return (
    <Modal
      title="Chi tiết tài khoản"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Card bordered={false}>
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: 24 }}
        >
          <Avatar size={64} icon={<UserOutlined />} src={user.avatar} />
          <div style={{ marginLeft: 16 }}>
            <h2 style={{ marginBottom: 0 }}>
              {user.fullName || user.username}
            </h2>
            <p style={{ color: "gray", margin: 0 }}>{user.email}</p>
          </div>
        </div>

        <Descriptions bordered column={2} layout="vertical">
          {/* ... Các Descriptions.Item khác không đổi */}
          <Descriptions.Item label="Tên người dùng">
            {user.username}
          </Descriptions.Item>
          <Descriptions.Item label="Họ và tên">
            {user.fullName || "Chưa cập nhật"}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            <MailOutlined style={{ marginRight: 8 }} />
            {user.email}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            <PhoneOutlined style={{ marginRight: 8 }} />
            {user.phoneNumber || "Chưa cập nhật"}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày sinh">
            <CalendarOutlined style={{ marginRight: 8 }} />
            {user.birthDate
              ? dayjs(user.birthDate).format("DD/MM/YYYY")
              : "Chưa cập nhật"}
          </Descriptions.Item>
          <Descriptions.Item label="Giới tính">
            {user.gender || "Chưa cập nhật"}
          </Descriptions.Item>
          <Descriptions.Item label="Vai trò">
            {getRoleTag(user.role)}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái tài khoản">
            {user.isActive ? (
              <Tag icon={<CheckCircleOutlined />} color="success">
                Hoạt động
              </Tag>
            ) : (
              <Tag icon={<CloseCircleOutlined />} color="error">
                Bị khóa
              </Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Email đã xác thực">
            {user.emailVerified ? (
              <Tag icon={<CheckCircleOutlined />} color="success">
                Đã xác thực
              </Tag>
            ) : (
              <Tag icon={<CloseCircleOutlined />} color="error">
                Chưa xác thực
              </Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tham gia">
            {dayjs(user.createdAt).format("DD/MM/YYYY HH:mm")}
          </Descriptions.Item>
        </Descriptions>

        {/* --- PHẦN MÃ MỚI ĐỂ HIỂN THỊ ĐỊA CHỈ --- */}
        <Card
          title={
            <>
              <HomeOutlined /> Danh sách địa chỉ giao hàng
            </>
          }
          style={{ marginTop: 24 }}
          bordered
          type="inner"
        >
          {user.address && user.address.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={user.address}
              renderItem={renderAddress}
            />
          ) : (
            <Empty description="Người dùng chưa thêm địa chỉ nào." />
          )}
        </Card>
        {/* --- KẾT THÚC PHẦN MÃ MỚI --- */}

        {user.role === "seller" && user.shop && (
          <Card
            title={
              <>
                <ShopOutlined /> Thông tin cửa hàng
              </>
            }
            style={{ marginTop: 24 }}
            bordered
            type="inner"
          >
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Tên cửa hàng">
                {user.shop.shopName}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                {user.shop.shopDescription || "Không có mô tả"}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái xác thực">
                <Tag
                  color={
                    user.shop.verificationStatus === "approved"
                      ? "success"
                      : "warning"
                  }
                >
                  {user.shop.verificationStatus?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tham gia bán hàng">
                {dayjs(user.shop.joinDate).format("DD/MM/YYYY")}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}
      </Card>
    </Modal>
  );
};

export default UserDetailsModal;
