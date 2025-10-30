import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import { ThemedText } from '../themed-text';

const { width: screenWidth } = Dimensions.get('window');

export interface NotificationBannerProps {
  visible: boolean;
  title: string;
  message?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  onClose: () => void;
  onPress?: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  visible,
  title,
  message,
  type = 'info',
  duration = 4000,
  onClose,
  onPress,
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto close after duration
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      // Reset animations when not visible
      slideAnim.setValue(-100);
      fadeAnim.setValue(0);
    }
  }, [visible, duration]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#d4edda',
          borderColor: '#28a745',
          iconName: 'checkmark-circle' as const,
          iconColor: '#28a745',
          textColor: '#155724',
        };
      case 'warning':
        return {
          backgroundColor: '#fff3cd',
          borderColor: '#ffc107',
          iconName: 'warning' as const,
          iconColor: '#ffc107',
          textColor: '#856404',
        };
      case 'error':
        return {
          backgroundColor: '#f8d7da',
          borderColor: '#dc3545',
          iconName: 'close-circle' as const,
          iconColor: '#dc3545',
          textColor: '#721c24',
        };
      default:
        return {
          backgroundColor: '#f8f9ff',
          borderColor: '#30A0E0',
          iconName: 'information-circle' as const,
          iconColor: '#30A0E0',
          textColor: '#2c3e50',
        };
    }
  };

  if (!visible) return null;

  const typeStyles = getTypeStyles();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: typeStyles.backgroundColor,
          borderColor: typeStyles.borderColor,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name={typeStyles.iconName}
            size={24}
            color={typeStyles.iconColor}
          />
        </View>
        
        <View style={styles.textContainer}>
          <ThemedText
            style={[styles.title, { color: typeStyles.textColor }]}
          >
            {title}
          </ThemedText>
          {message && (
            <ThemedText
              style={[styles.message, { color: typeStyles.textColor }]}
            >
              {message}
            </ThemedText>
          )}
        </View>

        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={20} color={typeStyles.textColor} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 80,
    left: 16,
    right: 16,
    borderRadius: 16,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 12,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 18,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    lineHeight: 18,
    opacity: 0.9,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
    marginTop: -2,
  },
});
