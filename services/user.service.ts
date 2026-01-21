import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { BASE_URL } from "./apiClient";
import apiClient from "./apiClient";

// API response types for elderly profiles
export interface ElderlyLocation {
  address: string;
  latitude: number;
  longitude: number;
}

export interface ElderlyProfileData {
  allergies?: string[];
  bloodType?: string;
}

export interface ElderlyCareRequirement {
  mobilityAid?: string;
  dailyMedication?: boolean;
  physicalTherapy?: boolean;
}

export interface ElderlyProfileApiResponse {
  elderlyProfileId: string;
  fullName: string;
  phoneNumber: string;
  birthDate: string;
  age: number;
  location: ElderlyLocation;
  gender: string;
  avatarUrl: string;
  profileData?: ElderlyProfileData;
  careRequirement?: ElderlyCareRequirement;
  note?: string;
  healthStatus: string | null;
  healthNote?: string;
  status: string;
}

export interface ElderlyProfilesApiResponse {
  status: string;
  message: string;
  data: ElderlyProfileApiResponse[];
}

export interface CreateElderlyProfileRequest {
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE';
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  weight?: number;
  height?: number;
  medical_conditions: {
    underlying_diseases: string[];
    special_conditions: string[];
    allergies: string[];
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
    }>;
  };
  independence_level: Array<{
    activity: string;
    level: string;
  }>;
  care_needs: {
    level_of_care: string;
    skills: {
      'kĩ năng bắt buộc': string[];
      'kĩ năng ưu tiên': string[];
    };
    service_package_id?: string | null;
    age: [number, number] | null;
    gender: 'MALE' | 'FEMALE' | null;
    experience: number | null;
    rating: [number, number] | null;
  };
  hobbies: string[];
  favorite_activities: string[];
  favorite_food: string[];
  emergency_contacts: Array<{
    name: string;
    relationship: string;
    phone: string;
  }>;
}

export interface CreateElderlyProfileResponse {
  status: 'Success' | 'Failed';
  message: string;
  data?: any;
}

export interface CreateCareSeekerProfileRequest {
  full_name: string;
  birth_year: number;
  gender: 'MALE' | 'FEMALE';
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  phone: string;
}

export interface CreateCareSeekerProfileResponse {
  status: 'Success' | 'Failed';
  message: string;
  data?: any;
}

/**
 * Helper function: Tạo care seeker profile với XMLHttpRequest (fallback khi Axios fail)
 */
const createCareSeekerProfileWithXHR = async (
  request: CreateCareSeekerProfileRequest,
  avatarFile: { uri: string; type?: string; name?: string },
  token: string
): Promise<CreateCareSeekerProfileResponse> => {
  return new Promise((resolve, reject) => {
    try {
      const formData = new FormData();
      
      // Append JSON data
      formData.append('data', JSON.stringify(request));

      // Append avatar file
      const fileExtension = avatarFile.uri.split('.').pop() || 'jpg';
      const fileName = avatarFile.name || `avatar_${Date.now()}.${fileExtension}`;
      const fileType = avatarFile.type || `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;

      let fileUri = avatarFile.uri;
      if (!fileUri.startsWith('file://') && 
          !fileUri.startsWith('content://') && 
          !fileUri.startsWith('http://') && 
          !fileUri.startsWith('https://')) {
        fileUri = `file://${fileUri}`;
      }

      formData.append('avatar', {
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
            reject(new Error('Failed to parse response'));
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.message || `Request failed with status ${xhr.status}`));
          } catch (error) {
            reject(new Error(`Request failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error'));
      };

      xhr.ontimeout = () => {
        reject(new Error('Request timeout'));
      };

      xhr.open('POST', `${BASE_URL}/api/v1/care-seekers/profile`);
      xhr.timeout = 120000;
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      
      xhr.send(formData);
    } catch (error: any) {
      reject(error);
    }
  });
};

/**
 * Helper function: Tạo elderly profile với XMLHttpRequest (fallback khi Axios fail)
 * XMLHttpRequest xử lý multipart/form-data tốt hơn Fetch API trong React Native
 */
const createElderlyProfileWithXHR = async (
  request: CreateElderlyProfileRequest,
  avatarFile: { uri: string; type?: string; name?: string } | undefined,
  token: string
): Promise<CreateElderlyProfileResponse> => {
  return new Promise((resolve, reject) => {
    try {
      const formData = new FormData();
      
      // Append JSON data
      formData.append('data', JSON.stringify(request));

      // Append avatar file nếu có
      if (avatarFile) {
        const fileExtension = avatarFile.uri.split('.').pop() || 'jpg';
        const fileName = avatarFile.name || `avatar_${Date.now()}.${fileExtension}`;
        const fileType = avatarFile.type || `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;

        let fileUri = avatarFile.uri;
        if (!fileUri.startsWith('file://') && 
            !fileUri.startsWith('content://') && 
            !fileUri.startsWith('http://') && 
            !fileUri.startsWith('https://')) {
          fileUri = `file://${fileUri}`;
        }

        formData.append('avatar', {
          uri: Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri,
          type: fileType,
          name: fileName,
        } as any);
      }

      const xhr = new XMLHttpRequest();
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve(result);
          } catch (error) {
            reject(new Error('Failed to parse response'));
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.message || `Request failed with status ${xhr.status}`));
          } catch (error) {
            reject(new Error(`Request failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error'));
      };

      xhr.ontimeout = () => {
        reject(new Error('Request timeout'));
      };

      xhr.open('POST', `${BASE_URL}/api/v1/care-seekers/elderly-profiles`);
      xhr.timeout = 120000; // 2 phút
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      // KHÔNG set Content-Type, XMLHttpRequest sẽ tự động set với boundary
      
      
      xhr.send(formData);
    } catch (error: any) {
      reject(error);
    }
  });
};

export const UserService = {
  getAllUsers: async () => {
    const response = await apiClient.get(`/users`);
    return response.data;
  },

  /**
   * Lấy danh sách elderly profiles của care-seeker
   * Cần token để gọi API này
   */
  getElderlyProfiles: async (): Promise<ElderlyProfileApiResponse[]> => {
    try {
      const response = await apiClient.get<ElderlyProfilesApiResponse>('/api/v1/care-seekers/elderly-profiles');
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to fetch elderly profiles: ${error.message}`);
    }
  },

  /**
   * Tạo elderly profile mới với avatar file
   * @param request - Dữ liệu hồ sơ người già
   * @param avatarFile - File ảnh avatar (optional)
   */
  createElderlyProfile: async (
    request: CreateElderlyProfileRequest,
    avatarFile?: { uri: string; type?: string; name?: string }
  ): Promise<CreateElderlyProfileResponse> => {
    // Remove undefined properties from request object
    const cleanedRequest = JSON.parse(JSON.stringify(request));

    try {
      // 1. Validate inputs
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Token is required');
      }

      // 2. Nếu KHÔNG có avatar, gọi endpoint JSON riêng
      if (!avatarFile) {
        const response = await apiClient.post<CreateElderlyProfileResponse>(
          '/api/v1/care-seekers/elderly-profiles/json',
          cleanedRequest,
          {
            timeout: 60000,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        return response.data;
      }

      // 4. Có avatar, gọi endpoint multipart/form-data
      const formData = new FormData();
      const jsonData = JSON.stringify(cleanedRequest);
      formData.append('data', jsonData);

      // 5. Append avatar file
      const fileExtension = avatarFile.uri.split('.').pop() || 'jpg';
      const fileName = avatarFile.name || `avatar_${Date.now()}.${fileExtension}`;
      const fileType = avatarFile.type || `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;

      // Format cho React Native FormData
      let fileUri = avatarFile.uri;
      if (!fileUri.startsWith('file://') && 
          !fileUri.startsWith('content://') && 
          !fileUri.startsWith('http://') && 
          !fileUri.startsWith('https://')) {
        fileUri = `file://${fileUri}`;
      }

      formData.append('avatar', {
        uri: fileUri,
        type: fileType,
        name: fileName,
      } as any);
      
      const response = await apiClient.post<CreateElderlyProfileResponse>(
        '/api/v1/care-seekers/elderly-profiles',
        formData,
        {
          timeout: 120000, // 2 phút
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
            }
          },
        }
      );

      return response.data;
    } catch (axiosError: any) {
      // Nếu axios fail với Network Error, thử XMLHttpRequest (chỉ cho multipart)
      if (axiosError.code === 'ERR_NETWORK' || axiosError.message === 'Network Error') {
        // XMLHttpRequest chỉ dùng cho multipart/form-data (có avatar)
        if (avatarFile) {
          const token = await AsyncStorage.getItem('token');
          if (!token) {
            throw new Error('Token is required');
          }
          return await createElderlyProfileWithXHR(cleanedRequest, avatarFile, token);
        }
        
        // Không có avatar, không thể retry với XMLHttpRequest
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      }

      // Nếu có response từ server, trả về response đó
      if (axiosError.response?.data) {
        return axiosError.response.data;
      }

      throw new Error(axiosError.message || 'Có lỗi xảy ra khi tạo hồ sơ');
    }
  },

  /**
   * Tạo profile cho care seeker với avatar file
   * @param request - Dữ liệu profile care seeker
   * @param avatarFile - File ảnh avatar (optional)
   */
  createCareSeekerProfile: async (
    request: CreateCareSeekerProfileRequest,
    avatarFile?: { uri: string; type?: string; name?: string }
  ): Promise<CreateCareSeekerProfileResponse> => {
    // Remove undefined properties from request object (define outside try-catch for scope)
    const cleanedRequest = JSON.parse(JSON.stringify(request));

    try {
      // Nếu KHÔNG có avatar, gọi endpoint JSON riêng
      if (!avatarFile) {
        const response = await apiClient.post<CreateCareSeekerProfileResponse>(
          '/api/v1/care-seekers/profile/json',
          cleanedRequest,
          {
            timeout: 60000,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        return response.data;
      }

      // Có avatar, gọi endpoint multipart/form-data
      const formData = new FormData();
      formData.append('data', JSON.stringify(cleanedRequest));

      // Handle avatar file with proper URI and type
      const fileExtension = avatarFile.uri.split('.').pop() || 'jpg';
      const fileName = avatarFile.name || `avatar_${Date.now()}.${fileExtension}`;
      const fileType = avatarFile.type || `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;

      // Handle URI prefix
      let fileUri = avatarFile.uri;
      if (!fileUri.startsWith('file://') && 
          !fileUri.startsWith('content://') && 
          !fileUri.startsWith('http://') && 
          !fileUri.startsWith('https://')) {
        fileUri = `file://${fileUri}`;
      }

      formData.append('avatar', {
        uri: Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri,
        type: fileType,
        name: fileName,
      } as any);


      const response = await apiClient.post<CreateCareSeekerProfileResponse>(
        '/api/v1/care-seekers/profile',
        formData,
        {
          timeout: 60000,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      return response.data;
    } catch (axiosError: any) {
      // Nếu axios fail với Network Error, thử XMLHttpRequest (chỉ cho multipart)
      if (axiosError.code === 'ERR_NETWORK' || axiosError.message === 'Network Error') {
        // XMLHttpRequest chỉ dùng cho multipart/form-data (có avatar)
        if (avatarFile) {
          const token = await AsyncStorage.getItem('token');
          if (!token) {
            throw new Error('Token is required');
          }
          return await createCareSeekerProfileWithXHR(cleanedRequest, avatarFile, token);
        }
        
        // Không có avatar, không thể retry với XMLHttpRequest
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      }

      // Nếu có response từ server, trả về response đó
      if (axiosError.response?.data) {
        return axiosError.response.data;
      }

      throw new Error(axiosError.message || 'Có lỗi xảy ra khi tạo hồ sơ');
    }
  },
};
