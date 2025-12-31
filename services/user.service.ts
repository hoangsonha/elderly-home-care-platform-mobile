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
    age: [number, number] | null;
    gender: 'MALE' | 'FEMALE' | null;
    experience: number | null;
    rating: number | null;
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
      console.log('📤 Trying XMLHttpRequest for care seeker profile...');
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
            console.log('✅ XMLHttpRequest success for care seeker profile!');
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
      console.log('📤 Trying XMLHttpRequest...');
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
            console.log('✅ XMLHttpRequest success!');
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
      
      console.log('📤 Sending XMLHttpRequest to:', `${BASE_URL}/api/v1/care-seekers/elderly-profiles`);
      console.log('📤 FormData has avatar:', !!avatarFile);
      
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
      console.log('Fetching elderly profiles...');
      const response = await apiClient.get<ElderlyProfilesApiResponse>('/api/v1/care-seekers/elderly-profiles');
      console.log(`Found ${response.data.data.length} elderly profiles`);
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
    try {
      // 1. Validate inputs
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Token is required');
      }

      // 2. Log thông tin request
      console.log('📋 Creating elderly profile...');
      console.log('📋 Request data:', JSON.stringify(request, null, 2));
      const jsonData = JSON.stringify(request);
      console.log('✅ JSON data length:', jsonData.length, 'bytes');

      // 3. Create FormData
      const formData = new FormData();

      // 4. Append JSON data (QUAN TRỌNG: phải stringify)
      formData.append('data', jsonData);
      console.log('✅ JSON data appended to FormData');

      // 5. Append avatar file nếu có
      if (avatarFile) {
        console.log('📷 Processing avatar file...');
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
        
        console.log('✅ Avatar appended:', {
          fileName,
          fileType,
          uri: fileUri.substring(0, 50) + '...',
        });
      } else {
        console.log('ℹ️ No avatar file, sending JSON only');
      }

      // 6. Log API URL và token info
      const apiUrl = `${BASE_URL}/api/v1/care-seekers/elderly-profiles`;
      console.log('📤 API URL:', apiUrl);
      console.log('🔑 Token exists:', !!token);
      console.log('🔑 Token length:', token.length);

      // 7. Nếu KHÔNG có avatar, gửi JSON trực tiếp (không dùng FormData)
      if (!avatarFile) {
        console.log('📤 Sending JSON request (no avatar)...');
        
        // Remove undefined fields (Backend không accept undefined)
        const cleanRequest = JSON.parse(JSON.stringify(request));
        
        try {
          const response = await apiClient.post<CreateElderlyProfileResponse>(
            '/api/v1/care-seekers/elderly-profiles',
            cleanRequest, // Gửi clean request (không có undefined)
            {
              timeout: 60000,
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          console.log('✅ Success! Status:', response.status);
          console.log('✅ Response data:', response.data);
          return response.data;
        } catch (error: any) {
          console.error('❌ JSON request failed:', error);
          if (error.response?.data) {
            return error.response.data;
          }
          throw error;
        }
      }

      // 8. Có avatar - Gửi với FormData
      console.log('📤 Sending FormData request (with avatar)...');
      try {
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
                console.log(`📊 Upload progress: ${percentCompleted}%`);
              }
            },
          }
        );

        console.log('✅ Success! Status:', response.status);
        console.log('✅ Response data:', response.data);
        return response.data;
      } catch (axiosError: any) {
        // Nếu axios fail với Network Error, thử XMLHttpRequest
        if (axiosError.code === 'ERR_NETWORK' || axiosError.message === 'Network Error') {
          console.log('⚠️ Axios failed with Network Error, trying XMLHttpRequest...');
          return await createElderlyProfileWithXHR(request, avatarFile, token);
        }
        // Nếu có response từ server, trả về response đó
        if (axiosError.response?.data) {
          console.log('⚠️ Server responded with error:', axiosError.response.status);
          return axiosError.response.data;
        }
        // Re-throw để xử lý ở catch block bên ngoài
        throw axiosError;
      }
    } catch (error: any) {
      console.log('❌ Error creating elderly profile:', error.code, error.message);
      
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và đảm bảo backend đang chạy.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. File có thể quá lớn, vui lòng thử lại với ảnh nhỏ hơn.');
      } else if (error.response) {
        console.log('❌ Server error response:', error.response.status, error.response.data);
        const errorMessage = error.response.data?.message || 'Có lỗi xảy ra từ server';
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error('Server không phản hồi. Vui lòng kiểm tra backend có đang chạy không.');
      } else {
        throw new Error(error.message || 'Có lỗi không xác định');
      }
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
      console.log('📋 Creating care seeker profile...');
      console.log('📋 Request data:', JSON.stringify(cleanedRequest, null, 2));

      // Nếu KHÔNG có avatar, gọi endpoint JSON riêng
      if (!avatarFile) {
        console.log('ℹ️ No avatar file, calling JSON endpoint');
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
        console.log('✅ Success! Care seeker profile created (no avatar)');
        return response.data;
      }

      // Có avatar, gọi endpoint multipart/form-data
      console.log('📷 Processing avatar file...');
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

      console.log('✅ Avatar appended:', { fileName, fileType, uri: fileUri.substring(0, 50) + '...' });
      console.log('📤 Sending multipart/form-data request...');

      const response = await apiClient.post<CreateCareSeekerProfileResponse>(
        '/api/v1/care-seekers/profile',
        formData,
        {
          timeout: 60000,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      console.log('✅ Success! Care seeker profile created with avatar');
      return response.data;
    } catch (axiosError: any) {
      console.log('❌ Axios error creating care seeker profile:', axiosError.code, axiosError.message);

      // Nếu axios fail với Network Error, thử XMLHttpRequest (chỉ cho multipart)
      if (axiosError.code === 'ERR_NETWORK' || axiosError.message === 'Network Error') {
        console.log('⚠️ Axios failed with Network Error');
        
        // XMLHttpRequest chỉ dùng cho multipart/form-data (có avatar)
        if (avatarFile) {
          console.log('⚠️ Trying XMLHttpRequest with avatar...');
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
        console.log('❌ Server responded with error:', axiosError.response.status);
        return axiosError.response.data;
      }

      throw new Error(axiosError.message || 'Có lỗi xảy ra khi tạo hồ sơ');
    }
  },
};
