import apiClient from './apiClient';

export interface CaregiverProfile {
  id: string;
  personal_info: {
    full_name: string;
    age: number;
    gender: 'male' | 'female';
    phone: string;
    email: string;
    avatar_url: string;
  };
  location: {
    address: string;
    lat: number;
    lon: number;
    service_radius_km: number;
  };
  professional_info: {
    years_experience: number;
    total_hours_worked: number;
    completed_bookings: number;
    price_per_hour: number;
  };
  credentials: Array<{
    type: string;
    name: string;
    issue_date: string;
    expiry_date?: string;
    applicable_levels?: number[];
    tags?: string[];
    status: string;
    credential_id: string;
  }>;
  rating?: {
    average_score: number;
    total_reviews: number;
  };
  availability?: {
    is_available: boolean;
    next_available_date?: string;
  };
  specialties?: string[];
  skills?: string[];
}

export interface CaregiverApiResponse {
  total: number;
  caregivers: CaregiverProfile[];
}

// Public API response types
export interface PublicCaregiverLocation {
  address: string;
  latitude: number;
  longitude: number;
}

export interface PublicCaregiverProfileData {
  experience?: string;
  years_experience?: number;
  specializations?: string[];
  certifications?: string[];
  ratings_reviews?: {
    total_reviews: number;
    overall_rating: number;
    rating_breakdown?: {
      "1_star": number;
      "2_star": number;
      "3_star": number;
      "4_star": number;
      "5_star": number;
    };
  };
}

export interface PublicCaregiver {
  caregiverProfileId: string;
  accountId?: string; // Account ID để dùng cho chat
  fullName: string;
  phoneNumber: string;
  location: PublicCaregiverLocation;
  bio: string;
  isVerified: boolean;
  birthDate: string;
  age: number;
  gender: string;
  avatarUrl: string;
  years_experience?: number;
  profileData?: PublicCaregiverProfileData;
}

export interface PublicCaregiverApiResponse {
  status: string;
  message: string;
  data: PublicCaregiver[];
}

/**
 * Caregiver Service - Lấy thông tin caregivers từ API
 */
export class CaregiverService {
  /**
   * Lấy tất cả caregivers
   */
  async getAllCaregivers(): Promise<CaregiverProfile[]> {
    try {
      const response = await apiClient.get<CaregiverApiResponse>('/api/match/caregivers');
      return response.data.caregivers;
    } catch (error: any) {
      throw new Error(`Failed to fetch caregivers: ${error.message}`);
    }
  }

  /**
   * Lấy caregivers được đề xuất (top rated, available)
   * @param limit Số lượng caregivers cần lấy
   */
  async getRecommendedCaregivers(limit: number = 4): Promise<CaregiverProfile[]> {
    try {
      const allCaregivers = await this.getAllCaregivers();
      
      // Filter: chỉ lấy những người có rating và available
      const availableCaregivers = allCaregivers.filter(cg => 
        cg.rating && 
        cg.rating.average_score >= 4.5 &&
        (!cg.availability || cg.availability.is_available !== false)
      );

      // Sort by rating descending
      const sorted = availableCaregivers.sort((a, b) => {
        const ratingA = a.rating?.average_score || 0;
        const ratingB = b.rating?.average_score || 0;
        return ratingB - ratingA;
      });

      // Return top N
      return sorted.slice(0, limit);
    } catch (error: any) {
      // Fallback to mock data if API fails
      return [];
    }
  }

  /**
   * Transform caregiver data to format needed for UI
   */
  transformForUI(caregiver: CaregiverProfile) {
    // Extract specialties from credentials
    const specialties = caregiver.credentials
      .filter(cred => cred.status === 'verified')
      .map(cred => cred.name)
      .slice(0, 2); // Only take first 2

    return {
      id: caregiver.id,
      name: this.getFirstName(caregiver.personal_info.full_name),
      age: caregiver.personal_info.age,
      avatar: caregiver.personal_info.avatar_url,
      rating: caregiver.rating?.average_score || 0,
      gender: caregiver.personal_info.gender,
      specialties: specialties.length > 0 ? specialties : ['Chăm sóc chung'],
    };
  }

  /**
   * Get first name from full name
   */
  private getFirstName(fullName: string): string {
    const parts = fullName.split(' ');
    return parts[parts.length - 1]; // Vietnamese names: last part is first name
  }

  /**
   * Lấy danh sách caregivers từ public API
   */
  async getPublicCaregivers(): Promise<PublicCaregiver[]> {
    try {
      const response = await apiClient.get<PublicCaregiverApiResponse>('/api/v1/public/caregivers');
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to fetch public caregivers: ${error.message}`);
    }
  }

  /**
   * Lấy thông tin chi tiết của một caregiver từ public API
   * GET /api/v1/public/caregivers/{id}
   */
  async getPublicCaregiverById(id: string): Promise<PublicCaregiver> {
    try {
      const response = await apiClient.get<{
        status: string;
        message: string;
        data: {
          caregiverProfileId: string;
          accountId?: string; // Account ID để dùng cho chat
          fullName: string;
          phoneNumber: string;
          bio: string;
          isVerified: boolean;
          status: string;
          birthDate: string;
          age: number;
          gender: string;
          location: string; // JSON string
          profileData: string; // JSON string
          avatarUrl: string;
        } | null;
      }>(`/api/v1/public/caregivers/${id}`);
      
      if (response.data.status === 'Success' && response.data.data) {
        const data = response.data.data;
        
        // Parse location JSON
        let location: PublicCaregiverLocation = {
          address: '',
          latitude: 0,
          longitude: 0,
        };
        try {
          if (data.location) {
            const locationObj = typeof data.location === 'string' ? JSON.parse(data.location) : data.location;
            location = {
              address: locationObj.address || '',
              latitude: locationObj.latitude || 0,
              longitude: locationObj.longitude || 0,
            };
          }
        } catch (e) {
          console.error('Error parsing location:', e);
        }
        
        // Parse profileData JSON
        let profileData: PublicCaregiverProfileData | undefined;
        try {
          if (data.profileData) {
            const profileDataObj = typeof data.profileData === 'string' ? JSON.parse(data.profileData) : data.profileData;
            profileData = {
              years_experience: profileDataObj.years_experience,
              max_hours_per_week: profileDataObj.max_hours_per_week,
              preferences: profileDataObj.preferences,
              certifications: profileDataObj.certifications,
              ratings_reviews: profileDataObj.ratings_reviews,
            };
          }
        } catch (e) {
          console.error('Error parsing profileData:', e);
        }
        
        return {
          caregiverProfileId: data.caregiverProfileId,
          accountId: data.accountId, // Include accountId if available
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          location: location,
          bio: data.bio,
          isVerified: data.isVerified,
          birthDate: data.birthDate,
          age: data.age,
          gender: data.gender,
          avatarUrl: data.avatarUrl,
          years_experience: profileData?.years_experience,
          profileData: profileData,
        };
      } else {
        throw new Error(response.data.message || 'Failed to get caregiver');
      }
    } catch (error: any) {
      throw new Error(`Failed to fetch caregiver by ID: ${error.message}`);
    }
  }
}

// Export singleton instance
export const caregiverService = new CaregiverService();

