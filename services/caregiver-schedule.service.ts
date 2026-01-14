import apiClient from "./apiClient";

export const CaregiverScheduleService = {
  getFreeSchedule: async () => {
    const response = await apiClient.get(
      `/api/v1/caregiver-schedule/free-schedule`
    );
    return response.data;
  },
  updateFreeSchedule: async (payload: any) => {
    console.log("payload check", payload);
    const response = await apiClient.put(
      `/api/v1/caregiver-schedule/free-schedule`,
      payload
    );
    return response.data;
  },
};
