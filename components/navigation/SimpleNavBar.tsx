import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useNavigation } from '@/contexts/NavigationContext';
import { useNotification } from '@/contexts/NotificationContext';

export function SimpleNavBar() {
  const { activeTab, setActiveTab } = useNavigation();
  const { showEmergencyAlert, hideEmergencyAlert, emergencyAlertVisible } = useNotification();
  
  // Simulate có cảnh báo khẩn cấp (để test)
  const [hasEmergencyAlert, setHasEmergencyAlert] = React.useState(true);
  
  // Animation cho emergency icon
  const emergencyScale = React.useRef(new Animated.Value(1)).current;
  const emergencyOpacity = React.useRef(new Animated.Value(1)).current;
  
  // Effect để tạo animation khi có emergency alert
  React.useEffect(() => {
    if (hasEmergencyAlert) {
      // Tạo animation nháy màu đỏ liên tục
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(emergencyScale, {
              toValue: 1.3,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(emergencyOpacity, {
              toValue: 0.5,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(emergencyScale, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(emergencyOpacity, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      pulseAnimation.start();
      
      return () => pulseAnimation.stop();
    } else {
      // Reset về trạng thái bình thường
      Animated.parallel([
        Animated.timing(emergencyScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(emergencyOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [hasEmergencyAlert]);
  
  const navItems = [
    {
      id: 'home',
      icon: 'home-outline',
      route: '/dashboard',
    },
    {
      id: 'chat',
      icon: 'chatbubble-outline',
      route: '/chat-list',
    },
    {
      id: 'history',
      icon: 'list-outline',
      route: '/hiring-history',
    },
    {
      id: 'emergency',
      icon: 'warning-outline',
      route: '/dashboard',
    },
  ];

  const handleTabPress = (tabId: string, route: string) => {
    if (tabId === 'emergency') {
      // Trigger emergency alert và set active tab
      setActiveTab('emergency');
      showEmergencyAlert();
      router.push('/dashboard');
      // Test: Toggle emergency alert state
      setHasEmergencyAlert(false);
    } else if (tabId !== activeTab) {
      setActiveTab(tabId);
      router.push(route as any);
      // Ẩn emergency alert khi chuyển sang tab khác
      hideEmergencyAlert();
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4ECDC4', '#27AE60']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.navBar}
      >
        {navItems.map((item, index) => {
          const isActive = item.id === activeTab;
          const isLast = index === navItems.length - 1;
          const isEmergency = item.id === 'emergency';
          
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.navItem,
                isLast && styles.lastNavItem,
              ]}
              onPress={() => handleTabPress(item.id, item.route)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconContainer,
                // Emergency icon có thể có active background khi được bấm
                isActive && styles.activeIconContainer,
              ]}>
                {isEmergency ? (
                  <Animated.View style={{
                    transform: [{ scale: emergencyScale }],
                    opacity: emergencyOpacity,
                  }}>
                    <Ionicons
                      name={item.icon as any}
                      size={isActive ? 28 : 24}
                      color={hasEmergencyAlert ? '#FF4444' : 'white'}
                    />
                  </Animated.View>
                ) : (
                  <Ionicons
                    name={item.icon as any}
                    size={isActive ? 28 : 24}
                    color="white"
                  />
                )}
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
  lastNavItem: {
    // Special styling for emergency button
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
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});
