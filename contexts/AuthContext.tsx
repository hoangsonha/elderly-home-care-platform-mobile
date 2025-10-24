import { NavigationHelper } from '@/components/navigation/NavigationHelper';
import { AuthService } from '@/services/auth.service';
import React, { createContext, ReactNode, useContext, useState } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  hasCompletedProfile?: boolean;
  role?: string; // Add role field
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    if (email && password) {
      // Get user data from AuthService to get role
      const authUser = await AuthService.login(email, password);
      if (!authUser) return false;

      // Random chance for hasCompletedProfile (like before)
      const hasProfile = Math.random() > 0.7;

      const newUser: User = {
        id: '1',
        email: email,
        hasCompletedProfile: hasProfile,
        role: authUser.role,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        // If has profile, include sample data
        ...(hasProfile && {
          name: 'Nguyễn Văn A',
          dateOfBirth: '1990-01-01',
          phone: '0901234567',
          address: 'Hà Nội, Việt Nam'
        })
      };
      setUser(newUser);
      return true;
    }
    return false;
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
