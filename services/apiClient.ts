import axios from 'axios';

// Tạo axios instance với base URL
const apiClient = axios.create({
  baseURL: 'http://192.168.2.225:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để log
apiClient.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    console.log('📦 Request data:', config.data);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor để log
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.statusText);
    console.log('📊 Response data:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default apiClient;

