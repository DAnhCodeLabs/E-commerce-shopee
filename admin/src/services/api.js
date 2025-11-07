import axios from "axios";
import { message as antdMessage } from "antd"; // Import message từ antd

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
  (response) => {
    return response;
  },
  (error) => {
    let errorMessage;
    const responseData = error?.response?.data;

    if (typeof responseData === "string" && responseData) {
      errorMessage = responseData;
    } else {
      errorMessage =
        responseData?.message || "Có lỗi không xác định từ máy chủ!";
    }

    antdMessage.error(errorMessage);

    const status = error?.response?.status;

    const customError = new Error(errorMessage);
    customError.status = status;
    customError.response = error.response;

    return Promise.reject(customError);
  }
);

export default api;
