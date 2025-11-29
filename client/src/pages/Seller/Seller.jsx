import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import FormApplySeller from "./FormApplySeller";
import SellerManage from "./SellerManage";

const Seller = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Đang tải hoặc chưa đăng nhập...</div>;
  }

  return (
    <div>{user.role === "user" ? <FormApplySeller /> : <SellerManage />}</div>
  );
};

export default Seller;
