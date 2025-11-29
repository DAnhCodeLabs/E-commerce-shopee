import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import VerifyEmail from "../pages/VerifyEmail/VerifyEmail";
import PrivateRoute from "./PrivateRoute";
import Profile from "../pages/Profile/Profile";
import ProfileInfo from "../pages/Profile/Components/ProfileInfo";
import Address from "../pages/Profile/Components/Address";
import ChangePassword from "../pages/Profile/Components/ChangePassword";
import PrivacySettings from "../pages/Profile/Components/PrivacySettings";
import Seller from "../pages/Seller/Seller";
import Dashboard from "../pages/Seller/components/Dashboard";
import AddProduct from "../pages/Seller/components/AddProduct";
import ProductDetail from "../pages/Seller/components/ProductDetail";
import ProductManagement from "../pages/Seller/components/ProductManagement";
import EditProduct from "../pages/Seller/components/EditProduct";
import SellerFlashSaleRegistrations from "../pages/Seller/components/SellerFlashSaleRegistrations";
import FlashSaleRegistrationForm from "../pages/Seller/components/FlashSaleRegistrationForm";
import SearchPage from "../pages/SearchPage/SearchPage";
import ProductDetailPage from "../pages/SearchPage/ProductDetailPage";
import CartPage from "../pages/Cart/CartPage";
import CheckoutPage from "../pages/CheckoutPage/CheckoutPage";
import PurchasePage from "../pages/Purchase/PurchasePage";
import OrderDetailsPage from "../pages/Purchase/OrderDetailsPage";
import SellerOrderPage from "../pages/Seller/Order/SellerOrderPage";
import SellerChatPage from "../pages/Seller/Chat/SellerChatPage";

const AppRoutes = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route
          path="/cart"
          element={
            <PrivateRoute>
              <CartPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <PrivateRoute>
              <CheckoutPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/user/purchase"
          element={
            <PrivateRoute>
              <PurchasePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/user/purchase/order/:id"
          element={
            <PrivateRoute>
              <OrderDetailsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        >
          <Route index element={<ProfileInfo />} />
          <Route path="info" element={<ProfileInfo />} />
          <Route path="address" element={<Address />} />
          <Route path="password" element={<ChangePassword />} />
          <Route path="privacy-settings" element={<PrivacySettings />} />
        </Route>
        <Route
          path="/seller"
          element={
            <PrivateRoute>
              <Seller />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="create-product" element={<AddProduct />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="edit-product/:id" element={<EditProduct />} />
          <Route path="edit-product/:id" element={<EditProduct />} />
          <Route path="orders" element={<SellerOrderPage />} />
          <Route
            path="flash-sale_registrations"
            element={<SellerFlashSaleRegistrations />}
          />
          <Route
            path="flash-sale_registrations/new"
            element={<FlashSaleRegistrationForm />}
          />
          <Route path="chat" element={<SellerChatPage />} />
        </Route>
      </Routes>
    </div>
  );
};

export default AppRoutes;
