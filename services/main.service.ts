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

export interface Qualification {
  skills: string[];
  certificate_groups: string[][] | null;
}

export interface ServicePackageApiResponse {
  servicePackageId: string;
  packageName: string;
  description: string;
  durationHours: number;
  packageType: string;
  price: number;
  note: string;
  qualification: string | Qualification | null;
  status: string;
  serviceTasks: ServiceTask[];
  totalCareServices: number | null;
}

export interface ServicePackageWithEligibility extends ServicePackageApiResponse {
  isEligible: boolean;
}

export interface ServicePackagesApiResponse {
  status: string;
  message: string;
  data: ServicePackageApiResponse[];
}

export interface ServicePackagesWithEligibilityApiResponse {
  status: string;
  message: string;
  data: ServicePackageWithEligibility[];
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
   * Kiểm tra eligibility và lấy danh sách service packages với thông tin isEligible
   * @param caregiverId - ID của caregiver cần kiểm tra eligibility
   */
  getServicePackagesWithEligibility: async (caregiverId: string): Promise<ServicePackageWithEligibility[]> => {
    try {
      const response = await apiClient.get<ServicePackagesWithEligibilityApiResponse>('/api/v1/care-services/check-eligibility', {
        params: { caregiverId },
      });
      if (response.data.status === 'Success' && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch service packages with eligibility');
    } catch (error: any) {
      console.error('Error fetching service packages with eligibility:', error);
      throw new Error(`Failed to fetch service packages with eligibility: ${error.message}`);
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

      return response.data;
    } catch (axiosError: any) {

      // Nếu axios fail với Network Error, thử XMLHttpRequest (fallback)
      if (axiosError.code === 'ERR_NETWORK' || axiosError.message === 'Network Error') {

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
              resolve({
                status: 'Fail',
                message: 'Network error. Vui lòng kiểm tra kết nối và thử lại.',
                data: null,
              });
            };

            xhr.ontimeout = () => {
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

      return response.data;
    } catch (axiosError: any) {

      // Nếu axios fail với Network Error, thử XMLHttpRequest (fallback)
      if (axiosError.code === 'ERR_NETWORK' || axiosError.message === 'Network Error') {

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
              resolve({
                status: 'Fail',
                message: 'Network error. Vui lòng kiểm tra kết nối và thử lại.',
                data: null,
              });
            };

            xhr.ontimeout = () => {
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
      const response = await apiClient.get<FreeScheduleByDateApiResponse>(
        `/api/v1/caregiver-schedule/free-schedule/date`,
        {
          params: {
            date: date,
            caregiverId: caregiverId,
          },
        }
      );
      return response.data;
    } catch (error: any) {
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
   * Thêm chứng chỉ cho caregiver
   * POST /api/v1/caregivers/qualifications
   */
  addCaregiverQualification: async (
    qualificationData: {
      qualification_type_id: string;
      certificate_number?: string;
      issuing_organization?: string;
      issue_date?: string;
      expiry_date?: string;
      notes?: string;
    },
    credentialFile: { uri: string; type?: string; name?: string }
  ): Promise<{
    status: string;
    message: string;
    data: any;
  }> => {
    try {
      const formData = new FormData();

      // Append JSON data
      formData.append('data', JSON.stringify(qualificationData));

      // Append credential file
      // Xác định file extension từ URI hoặc name
      let fileExtension = 'pdf';
      if (credentialFile.name) {
        const nameParts = credentialFile.name.split('.');
        if (nameParts.length > 1) {
          fileExtension = nameParts.pop()?.toLowerCase() || 'pdf';
        }
      } else if (credentialFile.uri) {
        const uriParts = credentialFile.uri.split('.');
        if (uriParts.length > 1) {
          fileExtension = uriParts.pop()?.toLowerCase() || 'pdf';
        }
      }

      const fileName = credentialFile.name || `certificate_${Date.now()}.${fileExtension}`;

      // Xác định MIME type dựa trên extension hoặc type đã có
      let fileType = credentialFile.type;
      if (!fileType || fileType === 'image' || fileType === 'document') {
        // Nếu type là generic, xác định từ extension
        if (fileExtension === 'pdf') {
          fileType = 'application/pdf';
        } else if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
          fileType = 'image/jpeg';
        } else if (fileExtension === 'png') {
          fileType = 'image/png';
        } else {
          fileType = 'application/octet-stream';
        }
      }

      // Format URI correctly for React Native - giữ nguyên format gốc
      let fileUri = credentialFile.uri;
      // Không modify URI - React Native FormData xử lý file://, content://, etc.

      // Tạo file object cho React Native FormData
      const fileObject = {
        uri: fileUri,
        type: fileType,
        name: fileName,
      } as any;

      formData.append('credentialFile', fileObject);

      // Không set Content-Type header - để apiClient tự động xử lý
      const response = await apiClient.post('/api/v1/caregivers/qualifications', formData);

      return response.data;
    } catch (error: any) {
      console.error('Error adding qualification:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        status: 'Fail',
        message: error.message || 'Không thể thêm chứng chỉ',
        data: null,
      };
    }
  },

  /**
   * Xóa chứng chỉ của caregiver
   * DELETE /api/v1/caregivers/qualifications/{id}
   */
  deleteCaregiverQualification: async (
    qualificationId: string
  ): Promise<{
    status: string;
    message: string;
    data: any;
  }> => {
    try {
      const response = await apiClient.delete(`/api/v1/caregivers/qualifications/${qualificationId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting qualification:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        status: 'Fail',
        message: error.message || 'Không thể xóa chứng chỉ',
        data: null,
      };
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
    credentialFiles?: { uri: string; type?: string; name?: string }[],
    citizenIdFrontImage?: { uri: string; type?: string; name?: string },
    citizenIdBackImage?: { uri: string; type?: string; name?: string }
  ): Promise<CareServiceApiResponse> => {
    try {

      const formData = new FormData();

      // Append JSON data
      formData.append('data', JSON.stringify(profileData));

      // Append avatar file if provided
      if (avatarFile) {
        const fileExtension = avatarFile.uri.split('.').pop() || 'jpg';
        const fileName = avatarFile.name || `avatar_${Date.now()}.${fileExtension}`;
        const fileType = avatarFile.type || `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;

        // Format URI correctly for React Native
        let fileUri = avatarFile.uri;
        // Keep original URI format (file://, content://, etc.)
        // Don't modify it as React Native FormData handles it correctly

        formData.append('avatar', {
          uri: fileUri,
          type: fileType,
          name: fileName,
        } as any);
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

          formData.append('credentialFiles', {
            uri: fileUri,
            type: fileType,
            name: fileName,
          } as any);
        });
      }

      // Append citizen ID front image if provided
      if (citizenIdFrontImage) {
        const fileExtension = citizenIdFrontImage.uri.split('.').pop() || 'jpg';
        const fileName = citizenIdFrontImage.name || `citizenIdFront_${Date.now()}.${fileExtension}`;
        const fileType = citizenIdFrontImage.type || `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;

        let fileUri = citizenIdFrontImage.uri;

        formData.append('citizenIdFrontImage', {
          uri: fileUri,
          type: fileType,
          name: fileName,
        } as any);
      }

      // Append citizen ID back image if provided
      if (citizenIdBackImage) {
        const fileExtension = citizenIdBackImage.uri.split('.').pop() || 'jpg';
        const fileName = citizenIdBackImage.name || `citizenIdBack_${Date.now()}.${fileExtension}`;
        const fileType = citizenIdBackImage.type || `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;

        let fileUri = citizenIdBackImage.uri;

        formData.append('citizenIdBackImage', {
          uri: fileUri,
          type: fileType,
          name: fileName,
        } as any);
      }


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

        return response.data;
      } catch (axiosError: any) {
        // Silent fail

        // Throw error để xử lý ở nơi gọi
        throw axiosError;
      }
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }

      // Network error - có thể do FormData hoặc network issue
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
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
   * Lấy thu nhập của caregiver
   */
  getCaregiverIncome: async (): Promise<{
    status: string;
    message: string;
    data: {
      totalEarnings: number;
      incomeByMonth: Array<{
        year: number;
        month: number;
        totalEarnings: number;
        totalBookings: number;
        totalServiceAmount: number;
        status: string;
        batchCode: string;
        payoutBatchId: string;
        payoutDetails: Array<{
          payoutId: string;
          payoutCode: string;
          caregiverEarnings: number;
          totalAmount: number;
          systemRevenue: number;
          systemFeePercentage: number;
          serviceDate: string;
          status: string;
          includedAt: string;
          paidAt: string | null;
          careServiceId: string;
          bookingCode: string;
          workDate: string;
          payoutBatchId: string;
          batchCode: string;
        }>;
      }>;
    } | null;
  }> => {
    try {
      const response = await apiClient.get('/api/v1/statistics/caregiver/income');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching caregiver income:', error);
      return {
        status: 'Fail',
        message: error.response?.data?.message || error.message || 'Không thể lấy thông tin thu nhập. Vui lòng thử lại sau.',
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
      qualifications: {
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
      }[];
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
      elderlyProfiles: {
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
      }[];
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

  /**
   * Notification API
   */

  /**
   * Lấy danh sách thông báo
   */
  getNotifications: async (params?: {
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<{
    content: {
      notificationId: string;
      title: string;
      body: string;
      notificationType: string;
      relatedEntityType: string;
      relatedEntityId: string;
      data: any;
      imageUrl: string | null;
      isRead: boolean;
      readAt: string | null;
      sentAt: string;
      createdAt: string;
    }[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> => {
    try {
      const response = await apiClient.get('/api/v1/notifications', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error getting notifications:', error);
      throw new Error(`Failed to get notifications: ${error.message}`);
    }
  },

  /**
   * Lấy số lượng thông báo chưa đọc
   */
  getUnreadNotificationCount: async (): Promise<number> => {
    try {
      const response = await apiClient.get('/api/v1/notifications/unread-count');
      return response.data.count || 0;
    } catch (error: any) {
      console.error('Error getting unread notification count:', error);
      return 0;
    }
  },

  /**
   * Đánh dấu một thông báo đã đọc
   */
  markNotificationAsRead: async (notificationId: string): Promise<void> => {
    try {
      await apiClient.put(`/api/v1/notifications/${notificationId}/read`);
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  },

  /**
   * Đánh dấu tất cả thông báo đã đọc
   */
  markAllNotificationsAsRead: async (): Promise<void> => {
    try {
      await apiClient.put('/api/v1/notifications/mark-all-as-read');
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      throw new Error(`Failed to mark all notifications as read: ${error.message}`);
    }
  },

  /**
   * Tạo feedback cho care service
   * @param feedbackData - Dữ liệu feedback
   * @param images - Mảng các file ảnh (tối đa 5)
   */
  createFeedback: async (
    feedbackData: {
      targetType: string;
      targetId: string;
      rating: number;
      professionalism: number;
      attitude: number;
      punctuality: number;
      quality: number;
      comment?: string;
    },
    images?: { uri: string; type?: string; name?: string }[]
  ): Promise<any> => {
    try {
      const formData = new FormData();

      // Append JSON data as 'request'
      formData.append('request', JSON.stringify(feedbackData));

      // Append images if provided
      if (images && images.length > 0) {
        images.forEach((image) => {
          const fileExtension = image.uri.split('.').pop() || 'jpg';
          const fileName = image.name || `feedback_image_${Date.now()}.${fileExtension}`;
          const fileType = image.type || `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;

          let fileUri = image.uri;
          if (!fileUri.startsWith('file://') &&
            !fileUri.startsWith('content://') &&
            !fileUri.startsWith('http://') &&
            !fileUri.startsWith('https://')) {
            fileUri = `file://${fileUri}`;
          }

          formData.append('images', {
            uri: Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri,
            type: fileType,
            name: fileName,
          } as any);
        });
      }

      const response = await apiClient.post('/api/v1/feedbacks', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      });

      return response.data;
    } catch (error: any) {
      console.error('Error creating feedback:', error);
      throw error;
    }
  },
};
