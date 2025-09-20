import { NavigationHelper } from '@/components/navigation/NavigationHelper';
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
      // Fake API response - simulate checking if user has completed profile
      // For demo: 70% chance user needs to complete profile (new users)
      const hasProfile = Math.random() > 0.7;
      
      const newUser: User = {
        id: '1',
        email: email,
        hasCompletedProfile: hasProfile,
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
      setUser({ ...user, ...profile });
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
