import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNavigation } from '@/contexts/NavigationContext';
import { useNotification } from '@/contexts/NotificationContext';

export function SimpleNavBar() {
  const { activeTab, setActiveTab } = useNavigation();
  const { hideEmergencyAlert } = useNotification();
  const insets = useSafeAreaInsets();
  
  const navItems = [
    {
      id: 'home',
      icon: 'home',
      label: 'Trang chủ',
      route: '/careseeker/dashboard',
    },
    {
      id: 'schedule',
      icon: 'calendar',
      label: 'Lịch hẹn',
      route: '/careseeker/appointments',
    },
    {
      id: 'elderly',
      icon: 'people',
      label: 'Người già',
      route: '/careseeker/elderly-list',
    },
    {
      id: 'profile',
      icon: 'person',
      label: 'Cá nhân',
      route: '/careseeker/profile',
    },
  ];

  const handleTabPress = (tabId: string, route: string) => {
    if (tabId !== activeTab) {
      setActiveTab(tabId);
      router.push(route as any);
      // Ẩn emergency alert khi chuyển sang tab khác
      hideEmergencyAlert();
    }
  };

  return (
    <View style={styles.container}>
      <View style={[
        styles.navBar,
        { paddingBottom: Math.max(insets.bottom, 8) + 12 } // Tự động điều chỉnh theo safe area
      ]}>
        {navItems.map((item) => {
          const isActive = item.id === activeTab;
          
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => handleTabPress(item.id, item.route)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconContainer,
                isActive && styles.iconContainerActive,
              ]}>
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color={isActive ? '#68C2E8' : '#78909C'}
                />
              </View>
              <Text style={isActive ? styles.navLabelActive : styles.navLabel}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0F2FE',
    paddingVertical: 8,
    paddingHorizontal: 4,
    // paddingBottom will be set dynamically based on safe area insets
    shadowColor: '#68C2E8',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  navItemActive: {
    transform: [{ scale: 1.05 }],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -2,
  },
  iconContainerActive: {
    backgroundColor: '#E0F2FE',
  },
  navLabel: {
    fontSize: 11,
    color: '#78909C',
    fontWeight: '500',
  },
  navLabelActive: {
    fontSize: 11,
    color: '#68C2E8',
    fontWeight: '700',
  },
});
