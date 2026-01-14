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
}

// Export singleton instance
export const matchService = new MatchService();

