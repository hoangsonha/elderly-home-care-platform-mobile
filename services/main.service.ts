import apiClient from "./apiClient";

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
      console.log('Fetching active service packages...');
      const response = await apiClient.get<ServicePackagesApiResponse>('/api/v1/public/service-package/active');
      console.log(`Found ${response.data.data.length} active service packages`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to fetch service packages: ${error.message}`);
    }
  },

  /**
   * Lấy danh sách care services của user hiện tại
   */
  getMyCareServices: async (): Promise<MyCareServicesApiResponse> => {
    try {
      console.log('Fetching my care services...');
      const response = await apiClient.get<MyCareServicesApiResponse>('/api/v1/care-services/my-care-services');
      console.log('My care services fetched:', response.data);
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
      console.log('Creating care service...', request);
      const response = await apiClient.post<CareServiceApiResponse>('/api/v1/care-services', request);
      console.log('Care service created:', response.data);
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
};
