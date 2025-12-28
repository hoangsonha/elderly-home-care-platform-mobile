import apiClient from "./apiClient";

export const UserService = {
  getAllUsers: async () => {
    const response = await apiClient.get(`/users`);
    return response.data;
  },
};
