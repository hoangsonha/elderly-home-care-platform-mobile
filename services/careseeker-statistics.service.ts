import apiClient from "./apiClient";

export interface CareSeekerStatistics {
  totalElderlyProfiles: number;
  totalCareServicesThisMonth: number;
  totalSpendingThisMonth: number;
  totalCompletedBookings: number;
  totalInProgressServices: number;
}

export const CareSeekerStatisticsService = {
  getCaregiverPersonalStatistics: async (): Promise<{
    status: string;
    message: string;
    data: CareSeekerStatistics;
  }> => {
    const response = await apiClient.get(
      "/api/v1/statistics/care-seeker/personal"
    );
    return response.data;
  },
};
