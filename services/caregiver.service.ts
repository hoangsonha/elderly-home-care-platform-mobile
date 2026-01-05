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
  specializations?: string[];
  certifications?: string[];
}

export interface PublicCaregiver {
  caregiverProfileId: string;
  fullName: string;
  phoneNumber: string;
  location: PublicCaregiverLocation;
  bio: string;
  isVerified: boolean;
  birthDate: string;
  age: number;
  gender: string;
  avatarUrl: string;
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
}

// Export singleton instance
export const caregiverService = new CaregiverService();

