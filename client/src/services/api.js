import axios from "axios";

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
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message || "Có lỗi xảy ra từ máy chủ!";
    const status = error?.response?.status;

    console.error("Lỗi API:", {
      message,
      status,
      url: error.config?.url,
    });

    const customError = new Error(message);
    customError.status = status;
    customError.response = error.response; // Giữ nguyên response để truy cập data
    return Promise.reject(customError);
  }
);

export default api;
