import React from "react";
import { Button, Space, Tooltip, Popconfirm } from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons";

const TableActions = ({ record, onView, onEdit, onDelete, onUpdateStatus }) => {
  // Xác định trạng thái hiện tại
  const getCurrentStatus = () => {
    if (!record) return null;

    // Kiểm tra các trường status phổ biến
    if (record.isActive !== undefined) return record.isActive;
    if (record.status !== undefined)
      return record.status === "ACTIVE" || record.status === "APPROVED";
    if (record.moderationStatus !== undefined)
      return record.moderationStatus === "APPROVED";
    if (record.is_active !== undefined) return record.is_active;

    return null;
  };

  const isActive = getCurrentStatus();
  const isStatusActionAvailable = onUpdateStatus && isActive !== null;

  return (
    <Space size="small">
      {onView && (
        <Tooltip title="Xem chi tiết">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => onView(record)}
          />
        </Tooltip>
      )}

      {onEdit && (
        <Tooltip title="Chỉnh sửa">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: "#faad14" }} />}
            onClick={() => onEdit(record)}
          />
        </Tooltip>
      )}

      {isStatusActionAvailable && (
        <Popconfirm
          title={`Bạn có chắc chắn muốn ${
            isActive ? "khóa" : "mở khóa"
          } không?`}
          onConfirm={() => onUpdateStatus(record)}
          okText="Đồng ý"
          cancelText="Hủy"
        >
          <Tooltip title={isActive ? "Khóa" : "Mở khóa"}>
            <Button
              type="text"
              danger={isActive}
              icon={isActive ? <LockOutlined /> : <UnlockOutlined />}
            />
          </Tooltip>
        </Popconfirm>
      )}

      {onDelete && (
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa không?"
          onConfirm={() => onDelete(record)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Tooltip title="Xóa">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Tooltip>
        </Popconfirm>
      )}
    </Space>
  );
};

export default TableActions;
