// CommonInput.jsx
import React, { useState } from "react";
import { Input, Button, Rate, Upload } from "antd";
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  UploadOutlined,
} from "@ant-design/icons";

const CommonInput = ({
  prefixIcon,
  suffixIcon,
  className = "",
  size = "middle",
  variant = "outlined",
  type = "text",
  value,
  onChange,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  const passwordToggleIcon = showPassword ? (
    <EyeInvisibleOutlined />
  ) : (
    <EyeOutlined />
  );

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const combinedClassName = `w-full ${className}`;

  // Render suffix for password
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

    if (suffixIcon) {
      if (React.isValidElement(suffixIcon)) {
        return suffixIcon;
      }
      return <span className="text-blue-500 cursor-pointer">{suffixIcon}</span>;
    }

    return null;
  };

  // Handle different input types
  switch (type) {
    case "textarea":
      return (
        <Input.TextArea
          className={combinedClassName}
          size={size}
          value={value}
          onChange={onChange}
          {...rest}
        />
      );
    case "rate":
      return (
        <Rate
          value={value}
          onChange={onChange}
          tooltips={rest.tooltips}
          className={`${combinedClassName} text-2xl`}
          {...rest}
        />
      );
    case "upload":
      return (
        <Upload
          fileList={value}
          onChange={onChange}
          beforeUpload={() => false}
          listType="picture-card"
          className="w-full"
          {...rest}
        >
          {(!value || value.length < (rest.maxCount || 5)) && (
            <div className="flex flex-col items-center justify-center">
              <UploadOutlined className="text-2xl mb-1" />
              <span>Tải ảnh lên</span>
            </div>
          )}
        </Upload>
      );
    default:
      return (
        <Input
          className={combinedClassName}
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
  }
};

export default CommonInput;
