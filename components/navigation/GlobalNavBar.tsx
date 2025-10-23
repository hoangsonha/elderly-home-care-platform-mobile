import { SimpleNavBar } from '@/components/navigation/SimpleNavBar';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';
import { View } from 'react-native';

interface GlobalNavBarProps {
  children: React.ReactNode;
}

export function GlobalNavBar({ children }: GlobalNavBarProps) {
  const { isAuthenticated, user } = useAuth();

  // Chỉ hiển thị nav bar khi đã login VÀ đã hoàn thành profile
  const shouldShowNavBar = isAuthenticated && user?.hasCompletedProfile;

  return (
    <View style={{ flex: 1 }}>
      {children}
      {shouldShowNavBar && <SimpleNavBar />}
    </View>
  );
}
