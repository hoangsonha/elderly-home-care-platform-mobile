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
  setUserDirect?: (user: User | null) => void;
  switchRole: (role: "Caregiver" | "Care Seeker") => void; // 👈 NEW
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

      // Don't auto-set profileStore here - let complete-profile.tsx handle it
      // This prevents premature redirection to profile-status
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

  // Allow setting user object directly (used after register)
  const setUserDirect = (u: User | null) => {
    setUser(u);
  };

  // 🔥 NEW: Switch role for testing
  const switchRole = (role: "Caregiver" | "Care Seeker") => {
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      console.log(`🔄 Switched role to: ${role}`);
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
        setUserDirect,
        switchRole, // 👈 Add to context
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
