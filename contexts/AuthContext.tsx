import { NavigationHelper } from "@/components/navigation/NavigationHelper";
import { AccountService } from "@/services/account.service";
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
    try {
      const res = await AccountService.login({ email, password });

      if (!res || !res.token) return null;

      const userData: User = {
        id: res.id,
        email: res.email,
        name: res.name,
        phone: res.phone,
        avatar: res.avatar,
        role: res.role ?? "Care Seeker",
        token: res.token,
        refreshToken: res.refreshToken,
        hasCompletedProfile: res.hasCompletedProfile ?? false,
        status: res.status,
      };

      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  };

  // LOGOUT
  const logout = () => {
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
