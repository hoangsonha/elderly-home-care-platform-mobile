import apiClient from './apiClient';
import { MatchResponse, MobileMatchRequest } from './types';

/**
 * Match Service - Chuyên xử lý API matching với axios
 */
export class MatchService {
  /**
   * Match caregivers cho mobile app
   */
  async matchCaregivers(request: MobileMatchRequest): Promise<MatchResponse> {
    try {
      
      const response = await apiClient.post('/api/match-mobile', request);
      
      return response.data;
    } catch (error: any) {
      if (error.response) {
        // Server responded with error status
        throw new Error(`Server error: ${error.response.status} - ${error.response.data?.message || error.message}`);
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('Network error: No response from server');
      } else {
        // Something else happened
        throw new Error(`Request error: ${error.message}`);
      }
    }
  }

  /**
   * Match caregivers by request ID (legacy)
   */
  async matchCaregiversById(requestId: string): Promise<MatchResponse> {
    try {
      const response = await apiClient.post('/api/match', { request_id: requestId });
      return response.data;
    } catch (error: any) {
      throw new Error(`Match by ID failed: ${error.message}`);
    }
  }

  /**
   * Match caregivers với elderly profile và service package
   * POST /api/v1/public/match-caregivers
   */
  async matchCaregiversWithProfile(request: {
    elderly_profile_id: string;
    service_package_id: string;
    work_date: string; // YYYY-MM-DD
    start_hour: number; // 0-23
    start_minute: number; // 0-59
    top_n?: number; // Optional, default: 10
  }): Promise<MatchResponse> {
    try {
      const response = await apiClient.post('/api/v1/public/match-caregivers', request);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Server error: ${error.response.status} - ${error.response.data?.message || error.message}`);
      } else if (error.request) {
        throw new Error('Network error: No response from server');
      } else {
        throw new Error(`Request error: ${error.message}`);
      }
    }
  }
}

// Export singleton instance
export const matchService = new MatchService();

