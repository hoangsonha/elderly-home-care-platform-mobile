import { NavigationHelper } from "@/components/navigation/NavigationHelper";
import { AccountService } from "@/services/account.service";
import { saveToken, removeToken } from "@/services/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useState } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  avatar?: string;
  role: string;
  token: string;
  refreshToken: string;
  hasCompletedProfile?: boolean;
  status?: "pending" | "approved" | "rejected";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  updateProfile: (profile: Partial<User>) => void;
  setUserDirect: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (
    email: string,
    password: string
  ): Promise<User | null> => {
    console.log('🚀 AuthContext.login - Start');
    console.log('📧 Email:', email);
    console.log('🔐 Password length:', password.length);
    try {
      const res = await AccountService.login({ email, password });
      console.log('📦 AccountService response:', JSON.stringify(res));

      if (!res || !res.token) {
        console.warn('⚠️ No token in response');
        return null;
      }

      // Lưu token vào AsyncStorage
      console.log('💾 Saving token to AsyncStorage...');
      await saveToken(res.token, res.refreshToken);
      console.log('✅ Token saved successfully');

      const userData: User = {
        id: res.accountId || res.id,
        email: res.email,
        name: res.profile?.fullName || res.name,
        phone: res.profile?.phoneNumber || res.phone,
        avatar: res.avatarUrl || res.profile?.avatarUrl || res.avatar,
        role: (res.roleName || res.role) ?? "Care Seeker",
        token: res.token,
        refreshToken: res.refreshToken,
        hasCompletedProfile: res.hasProfile ?? res.hasCompletedProfile ?? false,
        status: res.status,
      };

      console.log('👤 User data created:', JSON.stringify(userData));
      setUser(userData);
      console.log('✅ AuthContext.login - Success');

      // Register device token for push notifications after login
      try {
        const { NotificationService } = await import("@/services/notification.service");
        await NotificationService.initialize();
        await NotificationService.registerToken(res.token);
      } catch (notificationError) {
        // Log error but don't block login
        console.error("Failed to register notification token:", notificationError);
      }

      return userData;
    } catch (error: any) {
      console.error('❌ AuthContext.login - Error:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      return null;
    }
  };

  // LOGOUT
  const logout = async () => {
    // Delete device token before logout
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        const { NotificationService } = await import("@/services/notification.service");
        await NotificationService.deleteToken(token);
      }
    } catch (notificationError) {
      // Log error but don't block logout
      console.error("Failed to delete notification token:", notificationError);
    }

    // Xóa token khỏi AsyncStorage
    await removeToken();
    setUser(null);
    NavigationHelper.goToLogin();
  };

  // UPDATE LOCAL PROFILE (không gọi API)
  const updateProfile = (profile: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...profile };
      setUser(updatedUser);
    }
  };

  // Dùng khi đăng ký xong và verify xong → set user thẳng
  const setUserDirect = (u: User | null) => {
    setUser(u);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateProfile,
        setUserDirect,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
