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
    console.log('🔑 AccountService.login - Start');
    console.log('📤 Login payload:', JSON.stringify(payload));
    try {
      const response = await apiClient.post(`/api/v1/accounts/login`, payload);
      console.log('✅ Login response status:', response.status);
      console.log('📥 Login response data:', JSON.stringify(response.data));
      return response.data;
    } catch (error: any) {
      console.error('❌ Login error:', error.message);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw error;
    }
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
