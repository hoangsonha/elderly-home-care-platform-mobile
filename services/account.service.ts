import apiClient from "./apiClient";

export const AccountService = {
  register: async (payload: {
    email: string;
    password: string;
    role: string;
  }) => {
    const response = await apiClient.post(`/api/v1/accounts/register`, payload);
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
    const response = await apiClient.post(`/api/v1/accounts/login`, payload);
    return response.data;
  },
  forgotPassword: async (payload: { email: string }) => {
    const response = await apiClient.post(
      "/api/v1/accounts/forgot-password",
      payload
    );
    return response.data;
  },

  forgotPasswordVerifyCode: async (payload: {
    email: string;
    code: string;
  }) => {
    const response = await apiClient.post(
      "/api/v1/accounts/forgot-password/verify-code",
      payload
    );
    return response.data;
  },

  forgotPasswordReset: async (payload: {
    email: string;
    code: string;
    newPassword: string;
  }) => {
    const response = await apiClient.post(
      "/api/v1/accounts/forgot-password/reset",
      payload
    );
    return response.data;
  },
};
