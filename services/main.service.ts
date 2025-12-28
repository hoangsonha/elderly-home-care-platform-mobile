import apiClient from "./apiClient";

export const mainService = {
  get: (url: string, config = {}) => apiClient.get(url, config),
  post: (url: string, data: any, config = {}) =>
    apiClient.post(url, data, config),
  put: (url: string, data: any, config = {}) =>
    apiClient.put(url, data, config),
  patch: (url: string, data: any, config = {}) =>
    apiClient.patch(url, data, config),
  delete: (url: string, config = {}) => apiClient.delete(url, config),
};
