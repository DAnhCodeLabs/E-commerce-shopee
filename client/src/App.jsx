import React from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useEffect } from "react";
import { httpGet } from "./services/httpService";
import { useAuth } from "./contexts/AuthContext";

const App = () => {
  const { setUser, setToken, token: authToken } = useAuth();

  useEffect(() => {
    const fetchLatestUserData = async () => {
      if (!authToken) return;

      try {
        const response = await httpGet("/auth/user");
        const latestUser = response.data;

        localStorage.setItem("user", JSON.stringify(latestUser));
        setUser(latestUser);
        console.log("Đã sync latest user:", latestUser);
      } catch (error) {
        console.error("Lỗi khi cập nhật thông tin người dùng:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          setUser(null);
          setToken(null);
        }
      }
    };

    fetchLatestUserData();
  }, []);

  const location = useLocation();
  const hideLayout = [
    "/login",
    "/forgot-password",
    "/verify-email",
    "/seller",
  ].some((path) => location.pathname.startsWith(path));

  return (
    <div className="bg-background flex flex-col w-full min-h-screen">
      {!hideLayout && <Navbar />}
      <div className="flex-1">
        <AppRoutes />
      </div>
      <Footer />
    </div>
  );
};

export default App;
