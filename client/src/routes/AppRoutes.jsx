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

const AppRoutes = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
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
        </Route>
      </Routes>
    </div>
  );
};

export default AppRoutes;
