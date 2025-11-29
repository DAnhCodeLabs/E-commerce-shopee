import React, { useState } from "react";
import { Input, Button, Upload } from "antd";
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;

const CommonInput = ({
  prefixIcon,
  suffixIcon,
  className = "",
  size = "middle",
  variant = "outlined",
  type = "text",
  value,
  onChange,
  maxFiles = 1,
  accept = "image/*",
  rows = 4,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const isPicturesWall = type === "pictures-wall";
  const isTextArea = type === "textarea";
  const inputType = isPassword && showPassword ? "text" : type;

  const passwordToggleIcon = showPassword ? (
    <EyeInvisibleOutlined />
  ) : (
    <EyeOutlined />
  );

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleUploadChange = ({ fileList }) => {
    const limitedFileList = fileList.slice(-maxFiles);
    if (onChange) {
      onChange(limitedFileList);
    }
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = URL.createObjectURL(file.originFileObj);
    }
    window.open(file.url || file.preview, "_blank");
  };

  const renderSuffix = () => {
    if (isPassword) {
      return (
        <Button
          type="text"
          icon={passwordToggleIcon}
          onClick={handleTogglePassword}
          className="flex items-center justify-center border-none shadow-none hover:bg-transparent"
          style={{ marginRight: -4 }}
        />
      );
    }

    if (suffixIcon && !isTextArea) {
      if (React.isValidElement(suffixIcon)) {
        return suffixIcon;
      }
      return <span className="text-blue-500 cursor-pointer">{suffixIcon}</span>;
    }

    return null;
  };

  if (isPicturesWall) {
    return (
      <Upload
        listType="picture-card"
        fileList={value || []}
        onChange={handleUploadChange}
        onPreview={handlePreview}
        beforeUpload={() => false}
        accept={accept}
        className={className}
        {...rest}
      >
        {(!value || value.length < maxFiles) && (
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
          </div>
        )}
      </Upload>
    );
  }

  if (isTextArea) {
    return (
      <TextArea
        className={`w-full ${className}`}
        rows={rows}
        value={value}
        onChange={onChange}
        {...rest}
      />
    );
  }

  return (
    <Input
      className={`w-full ${className}`}
      size={size}
      variant={variant}
      type={inputType}
      prefix={prefixIcon}
      suffix={renderSuffix()}
      value={value}
      onChange={onChange}
      {...rest}
    />
  );
};

export default CommonInput;
