import apiClient from "./apiClient";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { getApp } from "@react-native-firebase/app";
import messaging from "@react-native-firebase/messaging";
import { NavigationHelper } from "@/components/navigation/NavigationHelper";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Set up notification channel for Android
async function setupNotificationChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("care_service_channel", {
      name: "Care Service Notifications",
      description: "Notifications for care service updates",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
      sound: "default",
    });
  }
}

// Get Firebase FCM device token
async function getDeviceToken(): Promise<string | null> {
  try {
    // Request notification permissions (cần cho cả Android và iOS)
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== "granted") {
      return null;
    }

    // Check if Firebase is initialized
    try {
      getApp();
    } catch (error) {
      // Firebase not initialized
      return null;
    }

    // Request Firebase messaging permissions (Android 13+)
    if (Platform.OS === "android") {
      await messaging().requestPermission();
    }

    // Get Firebase FCM token
    const fcmToken = await messaging().getToken();
    
    if (!fcmToken) {
      return null;
    }

    return fcmToken;
  } catch (error) {
    return null;
  }
}

// Get device name
function getDeviceName(): string {
  try {
    if (Device.deviceName) {
      return Device.deviceName;
    }
    if (Device.modelName) {
      return Device.modelName;
    }
    return "Unknown Device";
  } catch (error) {
    return "Unknown Device";
  }
}

// Get device type
function getDeviceType(): "Android" | "IOS" | "Web" {
  if (Platform.OS === "android") {
    return "Android";
  } else if (Platform.OS === "ios") {
    return "IOS";
  } else {
    return "Web";
  }
}

export interface RegisterTokenRequest {
  fcmToken: string;
  deviceType: "Android" | "IOS" | "Web";
  deviceName: string;
}

export interface NotificationServiceResponse {
  status: string;
  message: string;
  data: any;
}

// Handle notification navigation based on notification data
function handleNotificationNavigation(data: any) {
  try {
    if (!data) {
      console.log('NotificationService: No data provided');
      return;
    }

    console.log('NotificationService: Raw notification data:', JSON.stringify(data, null, 2));

    // Extract notification type and IDs
    // Handle both string and object data formats
    // Backend format: { notificationId, notificationType, relatedEntityType, relatedEntityId, careServiceId, bookingCode }
    let notificationType = "";
    let careServiceId = "";
    let appointmentId = "";
    let relatedEntityId = "";
    
    if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data);
        notificationType = parsed.notificationType || parsed.type || parsed.notification_type || "";
        careServiceId = parsed.careServiceId || parsed.care_service_id || parsed.careService_id || "";
        relatedEntityId = parsed.relatedEntityId || parsed.related_entity_id || "";
        appointmentId = parsed.appointmentId || parsed.appointment_id || careServiceId || relatedEntityId;
        console.log('NotificationService: Parsed from string - type:', notificationType, 'careServiceId:', careServiceId);
      } catch (e) {
        console.error('NotificationService: Error parsing string data:', e);
      }
    } else if (typeof data === "object") {
      // Backend format - check multiple possible field names
      notificationType = data.notificationType || data.type || data.notification_type || "";
      careServiceId = data.careServiceId || data.care_service_id || data.careService_id || "";
      relatedEntityId = data.relatedEntityId || data.related_entity_id || "";
      appointmentId = data.appointmentId || data.appointment_id || careServiceId || relatedEntityId;
      console.log('NotificationService: Extracted from object - type:', notificationType, 'careServiceId:', careServiceId, 'appointmentId:', appointmentId);
    }

    console.log('NotificationService: Final values - notificationType:', notificationType.toUpperCase(), 'careServiceId:', careServiceId);

    // Navigate based on notification type
    switch (notificationType.toUpperCase()) {
      case "NEW_CARE_SERVICE_REQUEST":
        console.log('NotificationService: Navigating to Booking with tab "Mới" and careServiceId:', careServiceId);
        NavigationHelper.goToBooking("Mới", careServiceId);
        break;

      case "NEW_BOOKING":
      case "BOOKING_REQUEST":
      case "PENDING_CAREGIVER":
        if (appointmentId) {
          NavigationHelper.goToAppointmentDetail(appointmentId, "notification");
        } else {
          NavigationHelper.goToBooking("Mới");
        }
        break;

      case "BOOKING_ACCEPTED":
      case "BOOKING_CONFIRMED":
        if (appointmentId) {
          NavigationHelper.goToAppointmentDetail(appointmentId, "notification");
        } else {
          NavigationHelper.goToBooking("Đã xác nhận");
        }
        break;

      case "BOOKING_CANCELLED":
      case "BOOKING_REJECTED":
        NavigationHelper.goToBooking("Đã hủy");
        break;

      case "BOOKING_STARTED":
      case "WORK_STARTED":
        if (appointmentId) {
          NavigationHelper.goToAppointmentDetail(appointmentId, "notification");
        }
        break;

      case "BOOKING_COMPLETED":
      case "WORK_COMPLETED":
        if (appointmentId) {
          NavigationHelper.goToAppointmentDetail(appointmentId, "notification");
        }
        break;

      default:
        if (appointmentId) {
          NavigationHelper.goToAppointmentDetail(appointmentId, "notification");
        }
        break;
    }
  } catch (error) {
    // Silent fail
  }
}

// Setup notification tap listener (works independently of Firebase)
function setupNotificationTapListener() {
  try {
    // Check if listener is already set up to avoid duplicates
    if ((global as any).__notificationResponseSubscription) {
      console.log('NotificationService: Notification tap listener already set up, skipping');
      return;
    }
    
    // Handle notification taps (when user taps on notification)
    // This works for both foreground and background/terminated states
    const notificationResponseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('NotificationService: Notification tapped, response:', JSON.stringify(response, null, 2));
      const data = response.notification.request.content.data;
      
      console.log('NotificationService: Notification data:', JSON.stringify(data, null, 2));
      
      if (!data || (typeof data === "object" && Object.keys(data).length === 0)) {
        console.log('NotificationService: No data or empty data object');
        return;
      }
      
      // Add delay to ensure app is ready for navigation
      // Use longer delay if app was in background/terminated
      const delay = response.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER ? 1000 : 800;
      
      console.log('NotificationService: Will navigate after delay:', delay);
      setTimeout(() => {
        handleNotificationNavigation(data);
      }, delay);
    });
    
    // Store subscription to prevent cleanup issues and duplicate registrations
    (global as any).__notificationResponseSubscription = notificationResponseSubscription;

    // Handle notifications received while app is in foreground
    // Check if foreground listener is already set up to avoid duplicates
    if (!(global as any).__notificationReceivedListener) {
      const foregroundListener = Notifications.addNotificationReceivedListener(() => {
        // Silent
      });
      (global as any).__notificationReceivedListener = foregroundListener;
    }

    // Handle initial notification (when app opens from terminated state)
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        const data = response.notification.request.content.data;
        
        // Add delay to ensure app is fully initialized
        setTimeout(() => {
          handleNotificationNavigation(data);
        }, 1500);
      }
    }).catch(() => {
      // Silent
    });
  } catch (error) {
    // Silent fail
  }
}

// Setup Firebase messaging handlers
function setupFirebaseMessagingHandlers() {
  try {
    // Check if Firebase is initialized
    try {
      getApp();
    } catch (error) {
      // Firebase not initialized
      return;
    }

    // Check if onMessage handler is already set up to avoid duplicates
    if ((global as any).__onMessageHandlerSet) {
      console.log('NotificationService: onMessage handler already set up, skipping');
      return;
    }

    // Handle foreground messages (when app is open)
    // Track recent notifications to prevent duplicates
    const recentNotifications = new Set<string>();
    
    messaging().onMessage(async (remoteMessage) => {
      const { notification, data } = remoteMessage;
      
      if (notification) {
        // Create a unique key for this notification to prevent duplicates
        // Use messageId if available, otherwise use title + body + timestamp
        const messageId = remoteMessage.messageId || `${notification.title}_${notification.body}_${Date.now()}`;
        const notificationKey = `${messageId}_${notification.title}_${notification.body}`;
        
        // Check if we've already processed this notification recently (within last 2 seconds)
        if (recentNotifications.has(notificationKey)) {
          console.log('NotificationService: Duplicate notification detected, skipping:', notificationKey);
          return;
        }
        
        // Add to recent notifications set
        recentNotifications.add(notificationKey);
        
        // Remove from set after 2 seconds to allow same notification again if needed
        setTimeout(() => {
          recentNotifications.delete(notificationKey);
        }, 2000);
        
        // Display notification using expo-notifications
        await Notifications.scheduleNotificationAsync({
          content: {
            title: notification.title || "Thông báo",
            body: notification.body || "",
            data: data || {},
            sound: true,
            ...(Platform.OS === "android" && {
              channelId: "care_service_channel",
            }),
          },
          trigger: null, // Show immediately
        });
        
        console.log('NotificationService: Foreground notification scheduled:', notification.title);
      }
    });
    
    // Mark as set to prevent duplicate registrations
    (global as any).__onMessageHandlerSet = true;
    console.log('NotificationService: onMessage handler set');
  } catch (error) {
    // Silent fail
  }
}

export const NotificationService = {
  /**
   * Initialize notification service
   * Set up notification channel and request permissions
   */
  initialize: async (): Promise<void> => {
    await setupNotificationChannel();
    
    // Setup notification tap listener FIRST (works independently)
    setupNotificationTapListener();
    
    // Then setup Firebase handlers (if Firebase is available)
    setupFirebaseMessagingHandlers();
    
    // Ensure background message handler is set
    try {
      try {
        getApp();
        // Check if background handler is already set, if not, set it
        // Note: setBackgroundMessageHandler can only be called once
        if (!(global as any).__backgroundHandlerSet) {
          messaging().setBackgroundMessageHandler(async (remoteMessage) => {
            const { notification, data } = remoteMessage;
            
            if (notification) {
              // Display notification using expo-notifications
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: notification.title || "Thông báo",
                  body: notification.body || "",
                  data: data || {},
                  sound: true,
                  ...(Platform.OS === "android" && {
                    channelId: "care_service_channel",
                  }),
                },
                trigger: null, // Show immediately
              });
            }
          });
          (global as any).__backgroundHandlerSet = true;
          console.log('NotificationService: Background message handler set');
        }
      } catch (error) {
        // Firebase not initialized
        console.warn('NotificationService: Firebase not initialized, background handler not set');
      }
    } catch (error) {
      console.error('NotificationService: Error setting background handler:', error);
    }
  },

  /**
   * Register device token for push notifications
   * Called after login when accessToken is available
   */
  registerToken: async (
    accessToken: string
  ): Promise<NotificationServiceResponse> => {
    try {
      // Initialize notification channel
      await setupNotificationChannel();

      // Get device token
      const fcmToken = await getDeviceToken();
      if (!fcmToken) {
        return {
          status: "Fail",
          message: "Không thể lấy device token. Vui lòng cấp quyền thông báo.",
          data: null,
        };
      }

      // Get device info
      const deviceType = getDeviceType();
      const deviceName = getDeviceName();

      const payload: RegisterTokenRequest = {
        fcmToken,
        deviceType,
        deviceName,
      };

      // Call API to register token
      const response = await apiClient.post<NotificationServiceResponse>(
        "/api/v1/notifications/tokens",
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        status: "Fail",
        message:
          error.message || "Không thể đăng ký device token. Vui lòng thử lại.",
        data: null,
      };
    }
  },

  /**
   * Delete device token
   * Called when user logs out
   */
  deleteToken: async (
    accessToken: string
  ): Promise<NotificationServiceResponse> => {
    try {
      const response = await apiClient.delete<NotificationServiceResponse>(
        "/api/v1/notifications/tokens",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        status: "Fail",
        message:
          error.message || "Không thể xóa device token. Vui lòng thử lại.",
        data: null,
      };
    }
  },

  /**
   * Get device token (for testing/debugging)
   */
  getToken: async (): Promise<string | null> => {
    return await getDeviceToken();
  },

  /**
   * Test notification (for debugging)
   */
  testNotification: async (): Promise<void> => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test Notification",
          body: "Tap me to test navigation!",
          data: {
            notificationType: "NEW_CARE_SERVICE_REQUEST",
            careServiceId: "test-care-service-id",
            relatedEntityId: "test-entity-id",
          },
          sound: true,
          ...(Platform.OS === "android" && {
            channelId: "care_service_channel",
          }),
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      // Silent fail
    }
  },
};

