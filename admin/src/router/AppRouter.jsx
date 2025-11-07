import React from "react";
import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AdminPages from "../pages/AdminPages";
import Login from "../pages/Login";
import Dashboard from "../features/Dashboard";
import User from "../features/User/User";
import Banner from "../features/banner/Banner";
import BannerAdd from "../features/banner/BannerAdd";
import EditBanner from "../features/banner/EditBanner";
import Category from "../features/Category/Category";
import AddParentCategory from "../features/Category/AddParentCategory";
import Attribute from "../features/attribute/Attribute";
import CreateAttribute from "../features/attribute/CreateAttribute";
import SellerIsActive from "../features/User/SellerIsActive";
import ProductManagement from "../features/Products/ProductManagement";
import ProductDetail from "../features/Products/ProductDetail";

const ProtectedRoute = ({ token, redirectPath = "/login" }) => {
  const storedToken = localStorage.getItem("token");

  if (!token && !storedToken) {
    return <Navigate to={redirectPath} replace />;
  }
  return <Outlet />;
};
const AppRouter = () => {
  const { token } = useAuth();
  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route element={<ProtectedRoute token={token} />}>
          <Route path="/admin" element={<AdminPages />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<User />} />
            <Route path="seller-is_active" element={<SellerIsActive />} />
            <Route path="banners" element={<Banner />} />
            <Route path="add-banner" element={<BannerAdd />} />
            <Route path="edit-banner/:id" element={<EditBanner />} />
            <Route
              path="create-parent-category"
              element={<AddParentCategory />}
            />
            <Route path="category" element={<Category />} />
            <Route path="attribute" element={<Attribute />} />
            <Route path="create-attribute" element={<CreateAttribute />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="product/:id" element={<ProductDetail />} />
          </Route>
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </div>
  );
};

export default AppRouter;
