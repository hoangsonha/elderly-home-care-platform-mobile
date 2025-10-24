import { SimpleNavBar } from '@/components/navigation/SimpleNavBar';
import { useAuth } from '@/contexts/AuthContext';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

interface GlobalNavBarProps {
  children: React.ReactNode;
}

export function GlobalNavBar({ children }: GlobalNavBarProps) {
  const { isAuthenticated, user } = useAuth();
  const [showNavBar, setShowNavBar] = useState(false);

  // Chỉ hiển thị nav bar cho Care Seeker khi đã login VÀ đã hoàn thành profile
  const shouldShowNavBar = isAuthenticated && user?.hasCompletedProfile && user?.role === "Care Seeker";

  // Delay hiển thị nav bar để tránh hiển thị trên trang login
  useEffect(() => {
    if (shouldShowNavBar) {
      // Delay 2 giây để đảm bảo đã chuyển hướng xong
      const timer = setTimeout(() => {
        setShowNavBar(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    } else {
      setShowNavBar(false);
    }
  }, [shouldShowNavBar]);

  return (
    <View style={{ flex: 1 }}>
      {children}
      {showNavBar && <SimpleNavBar />}
    </View>
  );
}
