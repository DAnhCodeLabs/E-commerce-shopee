import axios from "axios";
import { message as antdMessage, message } from "antd";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("[DEBUG] Request error:", error); // Debug lỗi request
    return Promise.reject(error);
  }
);
message.config({
  duration: 5,
  maxCount: 3,
});

api.interceptors.response.use(
  // Xử lý response thành công (status 2xx)
  (response) => {
    const responseData = response.data;
    const config = response.config || {};

    // Debug: Log để kiểm tra response
    console.log("[DEBUG] Response success - responseData:", responseData);

    // Không tự động hiển thị message.success, để component tự xử lý
    return response;
  },
  // Xử lý response thất bại (non-2xx)
  (error) => {
    const config = error.config || {};
    const showMessage = config.showMessage !== false; // Mặc định true nếu undefined
    let errorMessage;
    const responseData = error?.response?.data;

    // Debug: Log để kiểm tra lỗi
    console.log(
      "[DEBUG] Response error - showMessage:",
      showMessage,
      "responseData:",
      responseData
    );

    if (typeof responseData === "string" && responseData) {
      errorMessage = responseData;
    } else {
      errorMessage =
        responseData?.message || "Có lỗi không xác định từ máy chủ!";
    }

    if (showMessage) {
      antdMessage.error(errorMessage);
    }

    const status = error?.response?.status;

    const customError = new Error(errorMessage);
    customError.status = status;
    customError.response = error.response;

    return Promise.reject(customError);
  }
);

export default api;
