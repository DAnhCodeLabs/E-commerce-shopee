// CommonInput.jsx - cập nhật phần suffix
import React, { useState } from "react";
import { Input, Button } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";

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

  // Xử lý suffix icon - hỗ trợ cả React element và string
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
      // Nếu là React element
      if (React.isValidElement(suffixIcon)) {
        return suffixIcon;
      }
      // Nếu là string
      return <span className="text-blue-500 cursor-pointer">{suffixIcon}</span>;
    }

    return null;
  };

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
};

export default CommonInput;
