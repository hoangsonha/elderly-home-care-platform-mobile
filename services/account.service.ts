import axiosInstance from "./axiosInstance";

export const AccountService = {
  register: async (payload: any) => {
    const response = await axiosInstance.post(
      `/api/v1/accounts/register`,
      payload
    );
    return response.data;
  },
  verifyEmail: async (payload: any) => {
    const response = await axiosInstance.post(
      `/api/v1/accounts/register/verification`,
      payload
    );
    return response.data;
  },
  login: async (payload: any) => {
    const response = await axiosInstance.post(
      `/api/v1/accounts/login`,
      payload
    );
    return response.data;
  },
};
