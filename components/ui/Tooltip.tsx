import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

import { ThemedText } from '../themed-text';

const { width: screenWidth } = Dimensions.get('window');

export interface TooltipProps {
  visible: boolean;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  onClose: () => void;
  position?: 'top' | 'center' | 'bottom';
}

export const Tooltip: React.FC<TooltipProps> = ({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onClose,
  position = 'top',
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
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
    }
  }, [visible, duration]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 200,
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
          borderColor: '#4ECDC4',
          iconName: 'information-circle' as const,
          iconColor: '#4ECDC4',
          textColor: '#2c3e50',
        };
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'center':
        return {
          justifyContent: 'center' as const,
        };
      case 'bottom':
        return {
          justifyContent: 'flex-end' as const,
          paddingBottom: 50,
        };
      default:
        return {
          justifyContent: 'flex-start' as const,
          paddingTop: 80,
        };
    }
  };

  if (!visible) return null;

  const typeStyles = getTypeStyles();
  const positionStyles = getPositionStyles();

  return (
    <Modal transparent visible={visible} animationType="none">
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={[styles.overlay, positionStyles]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.tooltip,
                {
                  backgroundColor: typeStyles.backgroundColor,
                  borderColor: typeStyles.borderColor,
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.content}>
                <ThemedText
                  style={[styles.message, { color: typeStyles.textColor }]}
                >
                  {message}
                </ThemedText>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// Hook for easier usage
export const useTooltip = () => {
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    message: string;
    type: TooltipProps['type'];
    position: TooltipProps['position'];
  }>({
    visible: false,
    message: '',
    type: 'info',
    position: 'top',
  });

  const showTooltip = (
    message: string,
    type: TooltipProps['type'] = 'info',
    position: TooltipProps['position'] = 'top'
  ) => {
    setTooltip({
      visible: true,
      message,
      type,
      position,
    });
  };

  const hideTooltip = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  const TooltipComponent = (
    <Tooltip
      visible={tooltip.visible}
      message={tooltip.message}
      type={tooltip.type}
      position={tooltip.position}
      onClose={hideTooltip}
    />
  );

  return {
    showTooltip,
    hideTooltip,
    TooltipComponent,
  };
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tooltip: {
    borderRadius: 16,
    borderWidth: 0,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});
