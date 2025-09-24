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

  const requestConfig = {
    method: normalizedMethod,
    url,
    headers,
    ...config,
    ...(data !== null &&
      !METHODS_WITHOUT_BODY.has(normalizedMethod) && { data }),
  };

  try {
    const response = await api.request(requestConfig);
    return response.data;
  } catch (error) {
    console.error(`HTTP Request failed: ${error.message}`, {
      method,
      url,
      status: error.status,
    });
    throw error; // Truyền lại lỗi nguyên vẹn với response
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
