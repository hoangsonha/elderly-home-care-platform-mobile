// API Configuration
// 🔧 Để test trên emulator: dùng 'http://10.0.2.2:8080'
// 🔧 Để test trên điện thoại thật: dùng IP máy (chạy ipconfig để lấy)

export const API_CONFIG = {
  // Base URL cho backend Spring Boot
  // BASE_URL: 'http://10.0.2.2:8080', // Emulator
  // BASE_URL: 'http://192.168.1.3:8080', // Physical device - WiFi
  BASE_URL: 'http://localhost:8080', // Physical device - USB (cần chạy: adb reverse tcp:8080 tcp:8080)
  
  // Base URL cho AI backend (nếu cần)
  AI_BASE_URL: 'http://localhost:8000',
};

// Helper function để build full URL
export const buildApiUrl = (endpoint: string) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_CONFIG.BASE_URL}/${cleanEndpoint}`;
};

