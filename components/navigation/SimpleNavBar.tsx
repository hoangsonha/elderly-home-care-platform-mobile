import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useNavigation } from '@/contexts/NavigationContext';
import { useNotification } from '@/contexts/NotificationContext';

export function SimpleNavBar() {
  const { activeTab, setActiveTab } = useNavigation();
  const { hideEmergencyAlert } = useNotification();
  
  const navItems = [
    {
      id: 'home',
      icon: 'home-outline',
      route: '/careseeker/dashboard',
    },
    {
      id: 'chat',
      icon: 'chatbubble-outline',
      route: '/careseeker/chat-list',
    },
    {
      id: 'history',
      icon: 'list-outline',
      route: '/careseeker/in-progress',
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
      <LinearGradient
        colors={['#68C2E8', '#5AB9E0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.navBar}
      >
        {navItems.map((item) => {
          const isActive = item.id === activeTab;
          
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.navItem}
              onPress={() => handleTabPress(item.id, item.route)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconContainer,
                isActive && styles.activeIconContainer,
              ]}>
                <Ionicons
                  name={item.icon as any}
                  size={isActive ? 28 : 24}
                  color="white"
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  navBar: {
    flexDirection: 'row',
    borderRadius: 30,
    padding: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 60,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    flex: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  activeIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#68C2E8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});
