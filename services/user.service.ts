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
};
