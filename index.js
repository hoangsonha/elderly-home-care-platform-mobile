// Background message handler for Firebase Cloud Messaging
// This must be registered at the top level, before any components
// For Expo Router, this file is imported automatically

import messaging from '@react-native-firebase/messaging';
import { getApps } from '@react-native-firebase/app';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Register background handler for Firebase Cloud Messaging
// This handles notifications when app is in background or terminated
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  const { notification, data } = remoteMessage;
  
  if (notification) {
    // Display notification using expo-notifications
    // Use the care_service_channel for Android
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title || 'Thông báo',
        body: notification.body || '',
        data: data || {},
        sound: true,
        ...(Platform.OS === 'android' && {
          channelId: 'care_service_channel',
        }),
      },
      trigger: null, // Show immediately
    });
  }
});

