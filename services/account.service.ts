import apiClient from "./apiClient";

export const AccountService = {
  register: async (payload: { email: string; password: string; role: string }) => {
    const response = await apiClient.post(
      `/api/v1/accounts/register`,
      payload
    );
    return response.data;
  },
  verifyEmail: async (payload: { email: string; verificationCode: string }) => {
    const response = await apiClient.post(
      `/api/v1/accounts/register/verification`,
      payload
    );
    return response.data;
  },
  resendCode: async (payload: { email: string }) => {
    const response = await apiClient.post(
      `/api/v1/accounts/resend-code-verify`,
      payload
    );
    return response.data;
  },
  login: async (payload: any) => {
    const response = await apiClient.post(
      `/api/v1/accounts/login`,
      payload
    );
    return response.data;
  },
};
