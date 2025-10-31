import { ThemedText } from '@/components/themed-text';
import { useNavigation } from '@/contexts/NavigationContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  route: string;
}

interface AnimatedNavBarProps {
  onTabPress: (tabId: string) => void;
}

const navItems: NavItem[] = [
  {
    id: 'home',
    label: 'Trang chủ',
    icon: 'home',
    route: '/careseeker/dashboard',
  },
  {
    id: 'services',
    label: 'Dịch vụ',
    icon: 'medical',
    route: '/careseeker/caregiver-search',
  },
  {
    id: 'requests',
    label: 'Yêu cầu',
    icon: 'document-text',
    route: '/careseeker/requests',
  },
];

const { width: screenWidth } = Dimensions.get('window');

export function AnimatedNavBar({ onTabPress }: AnimatedNavBarProps) {
  const { activeTab, setActiveTab } = useNavigation();
  const animatedValues = navItems.map(() => useSharedValue(0));

  useEffect(() => {
    // Reset all animations
    animatedValues.forEach((value, index) => {
      value.value = 0;
    });

    // Animate active tab
    const activeIndex = navItems.findIndex(item => item.id === activeTab);
    if (activeIndex !== -1) {
      animatedValues[activeIndex].value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
    }
  }, [activeTab]);

  const renderNavItem = (item: NavItem, index: number) => {
    const isActive = item.id === activeTab;
    const animatedValue = animatedValues[index];

    const animatedStyle = useAnimatedStyle(() => {
      const width = interpolate(
        animatedValue.value,
        [0, 1],
        [50, 120],
        Extrapolate.CLAMP
      );

      const opacity = interpolate(
        animatedValue.value,
        [0, 1],
        [0, 1],
        Extrapolate.CLAMP
      );

      return {
        width: width,
        opacity: opacity,
      };
    });

    const iconAnimatedStyle = useAnimatedStyle(() => {
      // Simple animation - no opacity changes for now
      return {
        transform: [{ scale: 1 }],
        opacity: 1,
      };
    });

    const textAnimatedStyle = useAnimatedStyle(() => {
      // Simple animation - only show text for active tab
      return {
        opacity: isActive ? 1 : 0,
      };
    });

    const bubbleAnimatedStyle = useAnimatedStyle(() => {
      const scale = interpolate(
        animatedValue.value,
        [0, 1],
        [0, 1],
        Extrapolate.CLAMP
      );

      const translateY = interpolate(
        animatedValue.value,
        [0, 1],
        [10, -15],
        Extrapolate.CLAMP
      );

      return {
        transform: [{ scale }, { translateY }],
        opacity: scale,
      };
    });

    return (
        <TouchableOpacity
          key={item.id}
          style={styles.navItem}
          onPress={() => {
            setActiveTab(item.id);
            onTabPress(item.id);
          }}
          activeOpacity={0.8}
        >
        {/* Speech Bubble for Active Tab */}
        {isActive && (
          <Animated.View style={[styles.speechBubble, bubbleAnimatedStyle]}>
            <View style={styles.bubbleTail} />
          </Animated.View>
        )}

        <Animated.View
          style={[
            styles.navItemContent,
            isActive ? styles.activeNavItem : styles.inactiveNavItem,
            // Remove animation to test
            // animatedStyle,
          ]}
        >
          {/* Simple: Always show icon */}
          <Ionicons
            name={item.icon as any}
            size={24}
            color={isActive ? '#2c3e50' : 'white'}
          />
          
          {/* Simple: Always show text */}
          <ThemedText style={styles.activeLabel}>
            {item.label}
          </ThemedText>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#87CEEB', '#98FB98']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.navBar}
      >
        {navItems.map((item, index) => renderNavItem(item, index))}
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
    borderRadius: 25,
    padding: 8,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    alignItems: 'center',
    height: 60,
    justifyContent: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    position: 'relative',
    flex: 1,
  },
  navItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    minHeight: 44,
    width: 50,
    position: 'relative',
  },
  activeNavItem: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#4ECDC4',
    elevation: 2,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  inactiveNavItem: {
    backgroundColor: 'transparent',
  },
  activeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  speechBubble: {
    position: 'absolute',
    top: -20,
    left: '50%',
    marginLeft: -15,
    width: 30,
    height: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubbleTail: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white',
  },
});