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

// Available Schedule API Types
export interface BookedSlot {
  date: string; // Format: "2025-12-01"
  start_time: string; // Format: "09:00"
  end_time: string; // Format: "12:00"
}

export interface AvailableScheduleData {
  available_all_time: boolean;
  booked_slots: BookedSlot[];
}

export interface AvailableScheduleApiResponse {
  status: string;
  message: string;
  data: AvailableScheduleData;
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
   * API: POST /api/v1/payments/order/{orderId}
   * Request body: { paymentId: UUID, careServiceId: UUID }
   */
  checkPaymentStatus: async (
    orderId: string,
    paymentId: string,
    careServiceId: string
  ): Promise<CareServiceApiResponse> => {
    try {
      if (!orderId) {
        console.error('checkPaymentStatus: orderId is missing');
        return {
          status: 'Fail',
          message: 'OrderId is required',
          data: null,
        };
      }
      
      if (!paymentId) {
        console.error('checkPaymentStatus: paymentId is missing');
        return {
          status: 'Fail',
          message: 'PaymentId is required',
          data: null,
        };
      }
      
      if (!careServiceId) {
        console.error('checkPaymentStatus: careServiceId is missing');
        return {
          status: 'Fail',
          message: 'CareServiceId is required',
          data: null,
        };
      }
      
      const url = `/api/v1/payments/order/${orderId}`;
      const requestBody = {
        paymentId: paymentId,
        careServiceId: careServiceId,
      };
      
      console.log('checkPaymentStatus: Calling API with URL:', url);
      console.log('checkPaymentStatus: orderId:', orderId);
      console.log('checkPaymentStatus: requestBody:', requestBody);
      
      const response = await apiClient.post<CareServiceApiResponse>(url, requestBody);
      console.log('checkPaymentStatus: Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('checkPaymentStatus: Error:', error);
      console.error('checkPaymentStatus: Error response:', error.response?.data);
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

  /**
   * Lấy lịch rảnh của caregiver
   * @param caregiverProfileId - ID của caregiver profile
   */
  getCaregiverAvailableSchedule: async (caregiverProfileId: string): Promise<AvailableScheduleApiResponse> => {
    try {
      const response = await apiClient.get<AvailableScheduleApiResponse>(
        `/api/v1/caregivers/${caregiverProfileId}/available-schedule`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        status: 'Fail',
        message: error.message || 'Không thể lấy lịch rảnh. Vui lòng thử lại sau.',
        data: {
          available_all_time: true,
          booked_slots: [],
        },
      };
    }
  },

  /**
   * Lấy lịch rảnh của caregiver cho một ngày cụ thể
   * @param date - Ngày cần kiểm tra (format: "yyyy-MM-dd")
   * @param caregiverId - ID của caregiver
   */
  getFreeScheduleByDate: async (date: string, caregiverId: string): Promise<FreeScheduleByDateApiResponse> => {
    try {
      console.log('📤 Calling getFreeScheduleByDate with date:', date, 'caregiverId:', caregiverId);
      const response = await apiClient.get<FreeScheduleByDateApiResponse>(
        `/api/v1/caregiver-schedule/free-schedule/date`,
        {
          params: {
            date: date,
            caregiverId: caregiverId,
          },
        }
      );
      console.log('✅ getFreeScheduleByDate response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching free schedule by date:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data || 'No response',
      });
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        status: 'Fail',
        message: error.message || 'Không thể lấy lịch rảnh. Vui lòng thử lại sau.',
        data: null,
      };
    }
  },

  /**
   * Lấy danh sách qualification types
   */
  getQualificationTypes: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/v1/public/qualification-types');
      return response.data.data || [];
    } catch (error: any) {
      console.error('Error fetching qualification types:', error);
      return [];
    }
  },

  /**
   * Tạo caregiver profile với multipart/form-data
   * @param profileData - Dữ liệu profile (JSON)
   * @param avatarFile - File avatar (optional)
   * @param credentialFiles - Danh sách file chứng chỉ (optional)
   */
  createCaregiverProfile: async (
    profileData: any,
    avatarFile?: { uri: string; type?: string; name?: string },
    credentialFiles?: Array<{ uri: string; type?: string; name?: string }>
  ): Promise<CareServiceApiResponse> => {
    try {
      console.log('📤 Creating caregiver profile...');
      console.log('📋 Profile data:', JSON.stringify(profileData, null, 2));
      console.log('🖼️ Avatar file:', avatarFile ? { uri: avatarFile.uri.substring(0, 50) + '...', type: avatarFile.type, name: avatarFile.name } : 'none');
      console.log('📄 Credential files:', credentialFiles?.length || 0);

      const formData = new FormData();
      
      // Append JSON data
      formData.append('data', JSON.stringify(profileData));
      console.log('✅ Appended data field');

      // Append avatar file if provided
      if (avatarFile) {
        const fileExtension = avatarFile.uri.split('.').pop() || 'jpg';
        const fileName = avatarFile.name || `avatar_${Date.now()}.${fileExtension}`;
        const fileType = avatarFile.type || `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
        
        // Format URI correctly for React Native
        let fileUri = avatarFile.uri;
        // Keep original URI format (file://, content://, etc.)
        // Don't modify it as React Native FormData handles it correctly

        console.log('📎 Appending avatar:', { uri: fileUri.substring(0, 50) + '...', type: fileType, name: fileName });
        formData.append('avatar', {
          uri: fileUri,
          type: fileType,
          name: fileName,
        } as any);
        console.log('✅ Appended avatar');
      }

      // Append credential files if provided
      if (credentialFiles && credentialFiles.length > 0) {
        credentialFiles.forEach((file, index) => {
          const fileExtension = file.uri.split('.').pop() || 'pdf';
          const fileName = file.name || `credential_${Date.now()}.${fileExtension}`;
          const fileType = file.type || (fileExtension === 'pdf' ? 'application/pdf' : 'image/jpeg');
          
          // Format URI correctly for React Native
          let fileUri = file.uri;
          // Keep original URI format (file://, content://, etc.)
          // Don't modify it as React Native FormData handles it correctly

          console.log(`📎 Appending credential file ${index + 1}:`, { uri: fileUri.substring(0, 50) + '...', type: fileType, name: fileName });
          formData.append('credentialFiles', {
            uri: fileUri,
            type: fileType,
            name: fileName,
          } as any);
        });
        console.log('✅ Appended credential files');
      }

      console.log('🚀 Sending request to /api/v1/caregivers/profile');
      
      // Try with axios first
      try {
        const response = await apiClient.post<CareServiceApiResponse>(
          '/api/v1/caregivers/profile',
          formData,
          {
            timeout: 120000,
            // Override transformRequest để axios không convert FormData thành string
            // React Native FormData cần được giữ nguyên để serialize đúng cách
            transformRequest: (data, headers) => {
              // Nếu là FormData, return trực tiếp (không transform)
              if (data instanceof FormData) {
                return data;
              }
              // Với data khác, dùng default transform
              return data;
            },
            // Don't set Content-Type header - let axios set it automatically with boundary
            // The interceptor in apiClient.ts already handles this
          }
        );

        console.log('✅ Response received:', response.status);
        return response.data;
      } catch (axiosError: any) {
        // Log chi tiết lỗi axios
        console.error('❌ Axios Error Details:');
        console.error('  - Code:', axiosError.code);
        console.error('  - Message:', axiosError.message);
        console.error('  - Name:', axiosError.name);
        console.error('  - Stack:', axiosError.stack);
        
        if (axiosError.request) {
          console.error('  - Request made:', true);
          console.error('  - Request method:', axiosError.config?.method);
          console.error('  - Request URL:', axiosError.config?.url);
          console.error('  - Request baseURL:', axiosError.config?.baseURL);
          console.error('  - Request headers:', JSON.stringify(axiosError.config?.headers, null, 2));
          console.error('  - Request data type:', axiosError.config?.data?.constructor?.name);
          console.error('  - Request data is FormData:', axiosError.config?.data instanceof FormData);
        } else {
          console.error('  - Request made: false (request was not sent)');
        }
        
        if (axiosError.response) {
          console.error('  - Response status:', axiosError.response.status);
          console.error('  - Response data:', axiosError.response.data);
          console.error('  - Response headers:', axiosError.response.headers);
        } else {
          console.error('  - Response: No response received');
        }
        
        // Throw error để xử lý ở nơi gọi
        throw axiosError;
      }
    } catch (error: any) {
      console.error('❌ Error creating caregiver profile:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
        } : 'No response',
        request: error.request ? 'Request made but no response' : 'No request made',
      });
      
      if (error.response?.data) {
        return error.response.data;
      }
      
      // Network error - có thể do FormData hoặc network issue
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        console.error('🌐 Network Error - Possible causes:');
        console.error('  1. FormData serialization issue');
        console.error('  2. File URI format issue');
        console.error('  3. Server not accessible');
        console.error('  4. Request timeout');
      }
      
      return {
        status: 'Fail',
        message: error.message || 'Không thể tạo hồ sơ. Vui lòng thử lại sau.',
        data: null,
      };
    }
  },

  /**
   * Lấy thống kê cá nhân của caregiver
   */
  getCaregiverPersonalStatistics: async (): Promise<{
    status: string;
    message: string;
    data: {
      totalCareServicesThisMonth: number;
      totalEarningsThisMonth: number;
      overallRating: number;
      taskCompletionRate: number;
    } | null;
  }> => {
    try {
      const response = await apiClient.get('/api/v1/statistics/caregiver/personal');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching caregiver statistics:', error);
      return {
        status: 'Fail',
        message: error.response?.data?.message || error.message || 'Không thể lấy thống kê. Vui lòng thử lại sau.',
        data: null,
      };
    }
  },

  /**
   * Lấy thông tin profile đầy đủ của caregiver hiện tại
   */
  getCaregiverProfile: async (): Promise<{
    status: string;
    message: string;
    data: {
      caregiverProfileId: string;
      fullName: string;
      phoneNumber: string;
      location: string; // JSON string
      bio: string;
      isVerified: boolean;
      status: string;
      rejectionReason: string | null;
      isNeededReviewCertificate: boolean;
      acceptedAt: string | null;
      declinedAt: string | null;
      reviewedBy: string | null;
      birthDate: string;
      age: number;
      gender: string;
      profileData: string; // JSON string
      accountId: string;
      email: string;
      avatarUrl: string;
      enabled: boolean;
      nonLocked: boolean;
      totalCompletedBookings: number;
      totalEarnings: number;
      taskCompletionRate: number;
      qualifications: Array<{
        qualificationId: string;
        qualificationTypeId: string;
        qualificationTypeName: string;
        certificateNumber: string;
        issuingOrganization: string;
        issueDate: string;
        expiryDate: string | null;
        certificateUrl: string;
        isVerified: boolean;
        status: string;
        rejectionReason: string | null;
        acceptedAt: string | null;
        declinedAt: string | null;
        reviewedBy: string | null;
        notes: string | null;
      }>;
    } | null;
  }> => {
    try {
      const response = await apiClient.get('/api/v1/caregivers/profile');
      return response.data;
    } catch (error: any) {
      console.error('Error getting caregiver profile:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        status: 'Fail',
        message: error.message || 'Failed to get caregiver profile',
        data: null,
      };
    }
  },

  /**
   * Lấy thông tin profile đầy đủ của care seeker hiện tại
   */
  getCareSeekerProfile: async (): Promise<{
    status: string;
    message: string;
    data: {
      careSeekerProfileId: string;
      fullName: string;
      phoneNumber: string;
      location: string; // JSON string
      birthDate: string;
      age: number;
      gender: string;
      profileData: string | object; // JSON string or parsed object
      accountId: string;
      email: string;
      avatarUrl: string;
      enabled: boolean;
      nonLocked: boolean;
      totalElderlyProfiles: number;
      totalCompletedBookings: number;
      elderlyProfiles: Array<{
        elderlyProfileId: string;
        fullName: string;
        phoneNumber: string;
        location: string;
        birthDate: string;
        age: number;
        gender: string;
        avatarUrl: string;
        profileData: string | object;
        careRequirement: string | object;
        note: string | null;
        healthStatus: string | null;
        healthNote: string | null;
        status: string;
      }>;
    } | null;
  }> => {
    try {
      const response = await apiClient.get('/api/v1/care-seekers/profile');
      return response.data;
    } catch (error: any) {
      console.error('Error getting care seeker profile:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        status: 'Fail',
        message: error.message || 'Failed to get care seeker profile',
        data: null,
      };
    }
  },
};
