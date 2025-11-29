import React from "react";
import { Button } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const CommonButton = ({
  children,
  type = "default",
  htmlType = "button",
  size = "middle",
  icon,
  loading = false,
  disabled = false,
  danger = false,
  ghost = false,
  shape = "default",
  className = "",
  onClick,
  ...rest
}) => {
  const combinedClassName = `
    transition-all duration-200
    ${shape === "round" || shape === "circle" ? "" : "rounded-lg"}
    ${className}
  `.trim();

  return (
    <Button
      type={type}
      htmlType={htmlType}
      size={size}
      icon={loading ? <LoadingOutlined /> : icon}
      loading={loading}
      disabled={disabled || loading}
      danger={danger}
      ghost={ghost}
      shape={shape}
      className={`!flex items-center justify-center ${combinedClassName}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </Button>
  );
};

export default CommonButton;
