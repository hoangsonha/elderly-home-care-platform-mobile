import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import apiClient, { BASE_URL } from "./apiClient";

// Service Package API Types
export interface ServiceTask {
  serviceTaskId: string;
  taskName: string;
  description: string;
  status: string;
}

export interface ServicePackageApiResponse {
  servicePackageId: string;
  packageName: string;
  description: string;
  durationHours: number;
  packageType: string;
  price: number;
  note: string;
  qualification: string | null;
  status: string;
  serviceTasks: ServiceTask[];
  totalCareServices: number | null;
}

export interface ServicePackagesApiResponse {
  status: string;
  message: string;
  data: ServicePackageApiResponse[];
}

// Care Service API Types
export interface CreateCareServiceRequest {
  elderlyProfileId: string;
  caregiverProfileId: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  workDate: string; // Format: "2025-12-29"
  startHour: number;
  startMinute: number;
  servicePackageId: string;
  note?: string;
}

export interface CareServiceApiResponse {
  status: string;
  message: string;
  data: any;
}

// My Care Services API Types
export interface MyCareServiceData {
  careServiceId: string;
  careServiceSnapshot: string; // JSON string
  bookingCode: string;
  workDate: string;
  startTime: string;
  endTime: string;
  caregiverResponseDeadline: string;
  completedAt: string | null;
  status: string;
  note: string | null;
  work_note?: string | null;
  systemFeePercentage: number;
  totalPrice: number;
  caregiverEarnings: number;
  location: string; // JSON string
  configVersion: string; // JSON string
  careSeekerProfile: {
    careSeekerProfileId: string;
    fullName: string;
    phoneNumber: string;
    location: {
      address: string;
      latitude: number;
      longitude: number;
    };
    birthDate: string;
    age: number;
    gender: string;
    avatarUrl: string | null;
    profileData?: any;
  };
  elderlyProfile: {
    elderlyProfileId: string;
    fullName: string;
    phoneNumber: string;
    birthDate: string;
    age: number;
    location: {
      address: string;
      latitude: number;
      longitude: number;
    };
    gender: string;
    avatarUrl: string;
    profileData?: any;
    careRequirement?: any;
    note?: string;
    healthStatus: string | null;
    healthNote?: string;
    status: string;
  };
  caregiverProfile: {
    caregiverProfileId: string;
    fullName: string;
    phoneNumber: string;
    location: {
      address: string;
      latitude: number;
      longitude: number;
    };
    bio: string;
    isVerified: boolean;
    birthDate: string;
    age: number;
    gender: string;
    avatarUrl: string;
    profileData?: any;
  };
  servicePackage: {
    servicePackageId: string;
    packageName: string;
    description: string;
    durationHours: number;
    packageType: string;
    price: number;
    note: string;
    qualification: string | null;
    status: string;
    serviceTasks: ServiceTask[];
    totalCareServices: number | null;
  };
  workSchedule?: {
    workScheduleId: string;
    status: string;
    workDate: string;
    startTime: string | null;
    endTime: string | null;
    completedAt: string | null;
    totalTasks: number;
    completedTasks: number;
    checkInImageUrl: string | null;
    checkOutImageUrl: string | null;
    workTasks: {
      workTaskId: string;
      name: string;
      description: string;
      status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'NOT_COMPLETED';
      completedAt: string | null;
    }[];
  };
}

export interface MyCareServicesApiResponse {
  status: string;
  message: string;
  data: MyCareServiceData[];
}

export const mainService = {
  get: (url: string, config = {}) => apiClient.get(url, config),
  post: (url: string, data: any, config = {}) =>
    apiClient.post(url, data, config),
  put: (url: string, data: any, config = {}) =>
    apiClient.put(url, data, config),
  patch: (url: string, data: any, config = {}) =>
    apiClient.patch(url, data, config),
  delete: (url: string, config = {}) => apiClient.delete(url, config),

  /**
   * Lấy danh sách service packages đang active
   */
  getActiveServicePackages: async (): Promise<ServicePackageApiResponse[]> => {
    try {
      // console.log('Fetching active service packages...');
      const response = await apiClient.get<ServicePackagesApiResponse>('/api/v1/public/service-package/active');
      // console.log(`Found ${response.data.data.length} active service packages`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to fetch service packages: ${error.message}`);
    }
  },

  /**
   * Lấy danh sách care services của user hiện tại
   * @param workDate - Optional: Lọc theo ngày làm việc (format: YYYY-MM-DD)
   */
  getMyCareServices: async (workDate?: string, status?: string): Promise<MyCareServicesApiResponse> => {
    try {
      // console.log('Fetching my care services...', workDate ? `for date: ${workDate}` : '', status ? `with status: ${status}` : '');
      
      // Build query parameters
      const params = new URLSearchParams();
      if (workDate) params.append('workDate', workDate);
      if (status) params.append('status', status);
      
      const queryString = params.toString();
      const url = queryString 
        ? `/api/v1/care-services/my-care-services?${queryString}`
        : '/api/v1/care-services/my-care-services';
      
      const response = await apiClient.get<MyCareServicesApiResponse>(url);
      // console.log('My care services fetched:', response.data);
      return response.data;
    } catch (error: any) {
      // Return error response if available from API
      if (error.response?.data) {
        return error.response.data;
      }
      // Return a generic error response if no API error data
      return {
        status: 'Fail',
        message: 'Không thể kết nối đến server. Vui lòng thử lại sau.',
        data: [],
      };
    }
  },

  /**
   * Tạo care service (đặt lịch)
   */
  createCareService: async (request: CreateCareServiceRequest): Promise<CareServiceApiResponse> => {
    try {
      // console.log('Creating care service...', request);
      const response = await apiClient.post<CareServiceApiResponse>('/api/v1/care-services', request);
      // console.log('Care service created:', response.data);
      return response.data;
    } catch (error: any) {
      // Return error response if available from API
      if (error.response?.data) {
        return error.response.data;
      }
      // Return a generic error response if no API error data
      return {
        status: 'Fail',
        message: 'Không thể kết nối đến server. Vui lòng thử lại sau.',
        data: null,
      };
    }
  },

  /**
   * Hủy care service
   */
  declineCareService: async (careServiceId: string, note?: string): Promise<CareServiceApiResponse> => {
    try {
      const requestBody: { careServiceId: string; note?: string } = {
        careServiceId: careServiceId,
      };
      if (note) {
        requestBody.note = note;
      }
      const response = await apiClient.post<CareServiceApiResponse>('/api/v1/care-services/decline-care-service', requestBody);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        status: 'Fail',
        message: 'Không thể kết nối đến server. Vui lòng thử lại sau.',
        data: null,
      };
    }
  },

  /**
   * Chấp nhận care service (Caregiver)
   */
  acceptCareService: async (careServiceId: string, note?: string): Promise<CareServiceApiResponse> => {
    try {
      const requestBody: { careServiceId: string; note?: string } = {
        careServiceId: careServiceId,
      };
      if (note) {
        requestBody.note = note;
      }
      const response = await apiClient.post<CareServiceApiResponse>('/api/v1/care-services/accept-care-service-from-caregiver', requestBody);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        status: 'Fail',
        message: 'Không thể kết nối đến server. Vui lòng thử lại sau.',
        data: null,
      };
    }
  },

  /**
   * Lấy chi tiết một care service
   */
  getCareServiceDetail: async (careServiceId: string): Promise<CareServiceApiResponse> => {
    try {
      const response = await apiClient.get<CareServiceApiResponse>(
        `/api/v1/care-services/${careServiceId}`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        status: 'Fail',
        message: 'Không thể kết nối đến server. Vui lòng thử lại sau.',
        data: null,
      };
    }
  },

  /**
   * Bắt đầu làm việc (Check In) - Upload ảnh CI
   */
  startWork: async (
    careServiceId: string,
    checkInImage: { uri: string; type?: string; name?: string }
  ): Promise<CareServiceApiResponse> => {
    try {
      console.log('📤 Starting work...');
      const formData = new FormData();
      
      // Append JSON request
      const request = { careServiceId };
      formData.append('request', JSON.stringify(request));
      
      // Append check-in image
      const fileExtension = checkInImage.uri.split('.').pop() || 'jpg';
      const fileName = checkInImage.name || `checkIn_${Date.now()}.${fileExtension}`;
      const fileType = checkInImage.type || `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;

      let fileUri = checkInImage.uri;
      if (!fileUri.startsWith('file://') && 
          !fileUri.startsWith('content://') && 
          !fileUri.startsWith('http://') && 
          !fileUri.startsWith('https://')) {
        fileUri = `file://${fileUri}`;
      }

      formData.append('checkInImage', {
        uri: Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri,
        type: fileType,
        name: fileName,
      } as any);

      // Thử dùng apiClient.post trước
      const response = await apiClient.post<CareServiceApiResponse>(
        '/api/v1/work-schedules/start-work',
        formData,
        {
          timeout: 120000,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      console.log('✅ Success! Start work completed');
      return response.data;
    } catch (axiosError: any) {
      console.log('❌ Axios error starting work:', axiosError.code, axiosError.message);

      // Nếu axios fail với Network Error, thử XMLHttpRequest (fallback)
      if (axiosError.code === 'ERR_NETWORK' || axiosError.message === 'Network Error') {
        console.log('⚠️ Axios failed with Network Error, trying XMLHttpRequest...');
        
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          return {
            status: 'Fail',
            message: 'Token is required',
            data: null,
          };
        }

        // Fallback: dùng XMLHttpRequest
        return new Promise((resolve) => {
          try {
            const formData = new FormData();
            const request = { careServiceId };
            formData.append('request', JSON.stringify(request));
            
            const fileExtension = checkInImage.uri.split('.').pop() || 'jpg';
            const fileName = checkInImage.name || `checkIn_${Date.now()}.${fileExtension}`;
            const fileType = checkInImage.type || `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;

            let fileUri = checkInImage.uri;
            if (!fileUri.startsWith('file://') && 
                !fileUri.startsWith('content://') && 
                !fileUri.startsWith('http://') && 
                !fileUri.startsWith('https://')) {
              fileUri = `file://${fileUri}`;
            }

            formData.append('checkInImage', {
              uri: Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri,
              type: fileType,
              name: fileName,
            } as any);

            const xhr = new XMLHttpRequest();
            
            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  const result = JSON.parse(xhr.responseText);
                  console.log('✅ XMLHttpRequest success!');
                  resolve(result);
                } catch (error) {
                  resolve({
                    status: 'Fail',
                    message: 'Failed to parse response',
                    data: null,
                  });
                }
              } else {
                try {
                  const errorData = JSON.parse(xhr.responseText);
                  resolve({
                    status: 'Fail',
                    message: errorData.message || `Request failed with status ${xhr.status}`,
                    data: null,
                  });
                } catch (error) {
                  resolve({
                    status: 'Fail',
                    message: `Request failed with status ${xhr.status}`,
                    data: null,
                  });
                }
              }
            };

            xhr.onerror = () => {
              console.error('❌ XMLHttpRequest network error');
              resolve({
                status: 'Fail',
                message: 'Network error. Vui lòng kiểm tra kết nối và thử lại.',
                data: null,
              });
            };

            xhr.ontimeout = () => {
              console.error('❌ XMLHttpRequest timeout');
              resolve({
                status: 'Fail',
                message: 'Request timeout. Vui lòng thử lại.',
                data: null,
              });
            };

            xhr.open('POST', `${BASE_URL}/api/v1/work-schedules/start-work`);
            xhr.timeout = 120000;
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            xhr.send(formData);
          } catch (error: any) {
            resolve({
              status: 'Fail',
              message: error.message || 'Không thể kết nối đến server. Vui lòng thử lại sau.',
              data: null,
            });
          }
        });
      }

      // Nếu có response từ server, trả về response đó
      if (axiosError.response?.data) {
        console.log('❌ Server responded with error:', axiosError.response.status);
        return axiosError.response.data;
      }

      return {
        status: 'Fail',
        message: axiosError.message || 'Không thể kết nối đến server. Vui lòng thử lại sau.',
        data: null,
      };
    }
  },

  /**
   * Kết thúc làm việc (Check Out) - Upload ảnh CO
   */
  endWork: async (
    careServiceId: string,
    checkOutImage: { uri: string; type?: string; name?: string }
  ): Promise<CareServiceApiResponse> => {
    try {
      console.log('📤 Ending work...');
      const formData = new FormData();
      
      // Append JSON request
      const request = { careServiceId };
      formData.append('request', JSON.stringify(request));
      
      // Append check-out image
      const fileExtension = checkOutImage.uri.split('.').pop() || 'jpg';
      const fileName = checkOutImage.name || `checkOut_${Date.now()}.${fileExtension}`;
      const fileType = checkOutImage.type || `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;

      let fileUri = checkOutImage.uri;
      if (!fileUri.startsWith('file://') && 
          !fileUri.startsWith('content://') && 
          !fileUri.startsWith('http://') && 
          !fileUri.startsWith('https://')) {
        fileUri = `file://${fileUri}`;
      }

      formData.append('checkOutImage', {
        uri: Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri,
        type: fileType,
        name: fileName,
      } as any);

      // Thử dùng apiClient.post trước
      const response = await apiClient.post<CareServiceApiResponse>(
        '/api/v1/work-schedules/end-work',
        formData,
        {
          timeout: 120000,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      console.log('✅ Success! End work completed');
      return response.data;
    } catch (axiosError: any) {
      console.log('❌ Axios error ending work:', axiosError.code, axiosError.message);

      // Nếu axios fail với Network Error, thử XMLHttpRequest (fallback)
      if (axiosError.code === 'ERR_NETWORK' || axiosError.message === 'Network Error') {
        console.log('⚠️ Axios failed with Network Error, trying XMLHttpRequest...');
        
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          return {
            status: 'Fail',
            message: 'Token is required',
            data: null,
          };
        }

        // Fallback: dùng XMLHttpRequest
        return new Promise((resolve) => {
          try {
            const formData = new FormData();
            const request = { careServiceId };
            formData.append('request', JSON.stringify(request));
            
            const fileExtension = checkOutImage.uri.split('.').pop() || 'jpg';
            const fileName = checkOutImage.name || `checkOut_${Date.now()}.${fileExtension}`;
            const fileType = checkOutImage.type || `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;

            let fileUri = checkOutImage.uri;
            if (!fileUri.startsWith('file://') && 
                !fileUri.startsWith('content://') && 
                !fileUri.startsWith('http://') && 
                !fileUri.startsWith('https://')) {
              fileUri = `file://${fileUri}`;
            }

            formData.append('checkOutImage', {
              uri: Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri,
              type: fileType,
              name: fileName,
            } as any);

            const xhr = new XMLHttpRequest();
            
            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  const result = JSON.parse(xhr.responseText);
                  console.log('✅ XMLHttpRequest success!');
                  resolve(result);
                } catch (error) {
                  resolve({
                    status: 'Fail',
                    message: 'Failed to parse response',
                    data: null,
                  });
                }
              } else {
                try {
                  const errorData = JSON.parse(xhr.responseText);
                  resolve({
                    status: 'Fail',
                    message: errorData.message || `Request failed with status ${xhr.status}`,
                    data: null,
                  });
                } catch (error) {
                  resolve({
                    status: 'Fail',
                    message: `Request failed with status ${xhr.status}`,
                    data: null,
                  });
                }
              }
            };

            xhr.onerror = () => {
              console.error('❌ XMLHttpRequest network error');
              resolve({
                status: 'Fail',
                message: 'Network error. Vui lòng kiểm tra kết nối và thử lại.',
                data: null,
              });
            };

            xhr.ontimeout = () => {
              console.error('❌ XMLHttpRequest timeout');
              resolve({
                status: 'Fail',
                message: 'Request timeout. Vui lòng thử lại.',
                data: null,
              });
            };

            xhr.open('POST', `${BASE_URL}/api/v1/work-schedules/end-work`);
            xhr.timeout = 120000;
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            xhr.send(formData);
          } catch (error: any) {
            resolve({
              status: 'Fail',
              message: error.message || 'Không thể kết nối đến server. Vui lòng thử lại sau.',
              data: null,
            });
          }
        });
      }

      // Nếu có response từ server, trả về response đó
      if (axiosError.response?.data) {
        console.log('❌ Server responded with error:', axiosError.response.status);
        return axiosError.response.data;
      }

      return {
        status: 'Fail',
        message: axiosError.message || 'Không thể kết nối đến server. Vui lòng thử lại sau.',
        data: null,
      };
    }
  },

  /**
   * Toggle work task status (IN_PROGRESS <-> DONE)
   */
  toggleWorkTask: async (workTaskId: string): Promise<CareServiceApiResponse> => {
    try {
      const response = await apiClient.post<CareServiceApiResponse>(
        '/api/v1/work-schedules/toggle-task',
        { workTaskId }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        status: 'Fail',
        message: error.message || 'Không thể thay đổi trạng thái task',
        data: null,
      };
    }
  },

  /**
   * Kiểm tra trạng thái thanh toán
   */
  checkPaymentStatus: async (orderId: string): Promise<CareServiceApiResponse> => {
    try {
      const response = await apiClient.get<CareServiceApiResponse>(
        `/api/v1/payments/order/${orderId}`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        status: 'Fail',
        message: error.message || 'Không thể kiểm tra trạng thái thanh toán',
        data: null,
      };
    }
  },
};
