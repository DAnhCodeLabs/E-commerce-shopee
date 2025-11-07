// src/services/httpService.js

import api from "./api";

const METHODS_WITHOUT_BODY = new Set(["get", "head", "delete", "options"]);

export const httpRequest = async (method, url, data = null, config = {}) => {
  const normalizedMethod = method.toLowerCase();
  const isFormData = data instanceof FormData;

  const headers = {
    ...(!isFormData && { "Content-Type": "application/json" }),
    ...(isFormData && data.getHeaders?.()),
    ...config.headers,
  };

  // config (bao gồm showMessage) được truyền nguyên vẹn vào api.request
  const requestConfig = {
    method: normalizedMethod,
    url,
    headers,
    ...config, // showMessage giữ nguyên từ tham số config
    ...(data !== null &&
      !METHODS_WITHOUT_BODY.has(normalizedMethod) && { data }),
  };

  try {
    const response = await api.request(requestConfig);
    return response.data; // Trả về response.data
  } catch (error) {
    throw error; // Lỗi ném lên để component xử lý
  }
};

export const httpGet = (url, config = {}) =>
  httpRequest("get", url, null, config);
export const httpPost = (url, data, config = {}) =>
  httpRequest("post", url, data, config);
export const httpPut = (url, data, config = {}) =>
  httpRequest("put", url, data, config);
export const httpDelete = (url, config = {}) =>
  httpRequest("delete", url, null, config);
export const httpPatch = (url, data, config = {}) =>
  httpRequest("patch", url, data, config);
