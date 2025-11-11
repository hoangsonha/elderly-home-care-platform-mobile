import { NavigationHelper } from "@/components/navigation/NavigationHelper";
import { AuthService } from "@/services/auth.service";
import React, { createContext, ReactNode, useContext, useState } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  hasCompletedProfile?: boolean;
  role: "Caregiver" | "Care Seeker" | "Admin" | string;
  status?: "pending" | "approved" | "rejected";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  updateProfile: (profile: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (
    email: string,
    password: string
  ): Promise<User | null> => {
    try {
      const res = await AuthService.login(email, password);
      if (!res) return null;

      const userData: User = {
        id: res.id,
        email: res.email,
        name: res.name,
        dateOfBirth: res.dateOfBirth,
        phone: res.phone,
        address: res.address,
        avatar: res.avatar,
        hasCompletedProfile: res.hasCompletedProfile ?? false,
        role: res.role ?? "Care Seeker",
        status: res.status, // Load status from API
      };

      // If user is Caregiver and has status, load it into profileStore
      if (userData.role === "Caregiver" && userData.status) {
        const { setProfileStatus } = require("@/data/profileStore");
        // Map API status to profileStore status
        if (userData.status === "approved") {
          setProfileStatus(userData.id, "approved");
        } else if (userData.status === "rejected") {
          setProfileStatus(userData.id, "rejected", "Hồ sơ không đáp ứng yêu cầu");
        } else {
          setProfileStatus(userData.id, "pending");
        }
      }

      setUser(userData);
      return userData; // ✅ trả về luôn user
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  };

  const logout = () => {
    setUser(null);
    NavigationHelper.goToLogin();
  };

  const updateProfile = (profile: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...profile };
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
