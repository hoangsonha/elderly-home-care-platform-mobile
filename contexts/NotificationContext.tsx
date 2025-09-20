import { NotificationBannerProps } from '@/components/ui/NotificationBanner';
import { SafeNotification } from '@/components/ui/SafeNotification';
import { Tooltip, TooltipProps } from '@/components/ui/Tooltip';
import React, { createContext, ReactNode, useContext, useState } from 'react';

interface NotificationContextType {
  showNotification: (
    title: string,
    message?: string,
    type?: NotificationBannerProps['type'],
    duration?: number,
    onPress?: () => void
  ) => void;
  showTooltip: (
    message: string,
    type?: TooltipProps['type'],
    position?: TooltipProps['position'],
    duration?: number
  ) => void;
  hideNotification: () => void;
  hideTooltip: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notification, setNotification] = useState<{
    visible: boolean;
    title: string;
    message?: string;
    type: NotificationBannerProps['type'];
    duration: number;
    onPress?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    duration: 4000,
  });

  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    message: string;
    type: TooltipProps['type'];
    position: TooltipProps['position'];
    duration: number;
  }>({
    visible: false,
    message: '',
    type: 'info',
    position: 'top',
    duration: 3000,
  });

  const showNotification = (
    title: string,
    message?: string,
    type: NotificationBannerProps['type'] = 'info',
    duration: number = 4000,
    onPress?: () => void
  ) => {
    setNotification({
      visible: true,
      title,
      message,
      type,
      duration,
      onPress,
    });
  };

  const showTooltip = (
    message: string,
    type: TooltipProps['type'] = 'info',
    position: TooltipProps['position'] = 'top',
    duration: number = 3000
  ) => {
    setTooltip({
      visible: true,
      message,
      type,
      position,
      duration,
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, visible: false }));
  };

  const hideTooltip = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  const contextValue: NotificationContextType = {
    showNotification,
    showTooltip,
    hideNotification,
    hideTooltip,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <SafeNotification
        visible={notification.visible}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        duration={notification.duration}
        onClose={hideNotification}
        onPress={notification.onPress}
      />
      <Tooltip
        visible={tooltip.visible}
        message={tooltip.message}
        type={tooltip.type}
        position={tooltip.position}
        duration={tooltip.duration}
        onClose={hideTooltip}
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Convenience hooks for specific types
export const useSuccessNotification = () => {
  const { showNotification, showTooltip } = useNotification();
  
  return {
    showSuccess: (title: string, message?: string, duration?: number) => 
      showNotification(title, message, 'success', duration),
    showSuccessTooltip: (message: string, duration?: number) => 
      showTooltip(message, 'success', 'top', duration),
  };
};

export const useErrorNotification = () => {
  const { showNotification, showTooltip } = useNotification();
  
  return {
    showError: (title: string, message?: string, duration?: number) => 
      showNotification(title, message, 'error', duration),
    showErrorTooltip: (message: string, duration?: number) => 
      showTooltip(message, 'error', 'top', duration),
  };
};

export const useWarningNotification = () => {
  const { showNotification, showTooltip } = useNotification();
  
  return {
    showWarning: (title: string, message?: string, duration?: number) => 
      showNotification(title, message, 'warning', duration),
    showWarningTooltip: (message: string, duration?: number) => 
      showTooltip(message, 'warning', 'top', duration),
  };
};

export const useInfoNotification = () => {
  const { showNotification, showTooltip } = useNotification();
  
  return {
    showInfo: (title: string, message?: string, duration?: number) => 
      showNotification(title, message, 'info', duration),
    showInfoTooltip: (message: string, duration?: number) => 
      showTooltip(message, 'info', 'top', duration),
  };
};
