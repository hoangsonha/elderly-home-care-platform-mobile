import axiosInstance from "./axiosInstance";

export const UserService = {
  getAllUsers: async () => {
    const response = await axiosInstance.get(`/users`);
    return response.data;
  },
};
