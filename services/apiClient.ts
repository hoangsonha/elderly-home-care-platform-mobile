import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

// Base URL của API
// Lưu ý:
// - Trên thiết bị thật/emulator: dùng IP của máy tính (ví dụ: 192.168.1.3)
// - Trên Android emulator: có thể dùng 10.0.2.2 thay cho localhost
// - Trên iOS simulator: dùng localhost hoặc IP của máy Mac
// - Production: dùng domain/IP của server
// export const BASE_URL = 'http://157.245.155.77:8080'; // Server remote
// export const BASE_URL = "http://192.168.1.5:8080"; // IP máy tính local (thay đổi theo IP của bạn)
export const BASE_URL = "http://10.0.2.2:8080"; // Android emulator -> máy host
// export const BASE_URL = 'http://localhost:8080'; // Chỉ dùng khi test trên web

// Danh sách các public API không cần token
const PUBLIC_APIS = [
  "/api/v1/public/service-package/active",
  "/api/v1/public/service-package/",
  "/api/v1/public/caregivers",
  "/api/v1/public/qualification-types",
  "/api/v1/accounts/login",
  "/api/v1/accounts/register",
  "/api/v1/accounts/register/verification",
  "/api/v1/accounts/resend-code-verify",
];

/**
 * Kiểm tra xem API có phải là public API không
 */
const isPublicAPI = (url: string): boolean => {
  // Loại bỏ baseURL nếu có
  const cleanUrl = url.replace(BASE_URL, "");

  return PUBLIC_APIS.some((publicPath) => {
    // Kiểm tra exact match
    if (cleanUrl === publicPath) {
      return true;
    }

    // Kiểm tra prefix match cho các path có trailing slash
    // Ví dụ: /api/v1/public/service-package/ sẽ match /api/v1/public/service-package/123
    if (publicPath.endsWith("/") && cleanUrl.startsWith(publicPath)) {
      return true;
    }

    // Kiểm tra cho service-package/{id}
    if (
      publicPath === "/api/v1/public/service-package/" &&
      cleanUrl.startsWith("/api/v1/public/service-package/")
    ) {
      return true;
    }

    return false;
  });
};

/**
 * Tạo axios instance với cấu hình
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  // Cấu hình cho file upload
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

/**
 * Request interceptor: Tự động thêm token vào header
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const url = config.url || "";
    const fullUrl = config.baseURL ? `${config.baseURL}${url}` : url;

    // Nếu là FormData, xóa Content-Type để axios tự động set multipart/form-data với boundary
    // Theo hướng dẫn BE: Axios sẽ tự động thêm boundary khi set Content-Type: multipart/form-data
    // Nhưng tốt nhất là để axios tự set để đảm bảo boundary đúng
    if (config.data instanceof FormData) {
      // Xóa Content-Type để axios tự động set với boundary
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }

    // Nếu không phải public API, thêm token
    if (!isPublicAPI(fullUrl)) {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        // Silent error handling
      }
    }

    // Log request (optional, có thể tắt trong production)
    if (__DEV__) {
      console.log("API Request:", config.method?.toUpperCase(), fullUrl);
      if (config.data && !(config.data instanceof FormData)) {
        console.log("Request data:", config.data);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor: Xử lý response và errors
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log response (optional, có thể tắt trong production)
    if (__DEV__) {
      console.log("API Response:", response.status, response.statusText);
      console.log("Response data:", response.data);
    }
    return response;
  },
  async (error) => {
    // Xử lý token expired (401) - có thể thêm logic refresh token ở đây
    if (error.response?.status === 401) {
      // Token hết hạn, có thể thử refresh token hoặc logout
      // TODO: Implement refresh token logic nếu cần
    }

    return Promise.reject(error);
  }
);

/**
 * Helper function để lưu token sau khi login
 */
export const saveToken = async (
  token: string,
  refreshToken?: string
): Promise<void> => {
  try {
    await AsyncStorage.setItem("token", token);
    if (refreshToken) {
      await AsyncStorage.setItem("refreshToken", refreshToken);
    }
    console.log("Token saved to AsyncStorage");
  } catch (error) {
    throw error;
  }
};

/**
 * Helper function để xóa token khi logout
 */
export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("refreshToken");
    console.log("Token removed from AsyncStorage");
  } catch (error) {
    // Silent error handling
  }
};

/**
 * Helper function để lấy token hiện tại
 */
export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem("token");
  } catch (error) {
    return null;
  }
};

export default apiClient;
