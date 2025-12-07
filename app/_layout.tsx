import "react-native-reanimated";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NavigationProvider } from "@/contexts/NavigationContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useDatabase } from "@/hooks/useDatabase";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, router, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, View } from "react-native";

// 🔥 Import Firebase & Notifee
let messaging: any = null;
let notifee: any = null;
if (Platform.OS !== 'web') {
  try {
    messaging = require('@react-native-firebase/messaging').default;
    notifee = require('@notifee/react-native').default;
  } catch (e) {
    console.log('Firebase/Notifee not available:', e);
  }
}

// export const unstable_settings = {
//   anchor: "splash",
// };

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log('❌ RootNavigator Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>
            Lỗi: {this.state.error?.message || 'Unknown error'}
          </Text>
          <Text style={styles.errorText}>
            Vui lòng reload app (nhấn 'r' trong Metro)
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

function RootNavigator() {
  console.log('🔵 RootNavigator rendering...');
  const segments = useSegments();
  let user = null;
  try {
    const auth = useAuth();
    user = auth?.user || null;
    console.log('🔵 User from auth:', user ? 'exists' : 'null');
    console.log('🔵 Current segments:', segments);
  } catch (err: any) {
    console.log('⚠️ Auth context not ready yet:', err?.message);
    // Fallback: show login screen
    user = null;
  }

  // Navigate based on auth state
  useEffect(() => {
    // Chỉ redirect nếu user state thay đổi và route hiện tại không hợp lệ
    if (!user) {
      const currentRoute = segments[0];
      // Cho phép ở các route: splash, login, register, test-token
      if (currentRoute !== 'splash' && currentRoute !== 'login' && currentRoute !== 'register' && currentRoute !== 'test-token') {
        console.log('🔵 Redirecting to splash (no user), current route:', currentRoute);
        router.replace('/splash');
      }
    } else {
      // Có user - redirect dựa trên role
      const currentRoute = segments[0];
      if (user.role === "Caregiver") {
        // Cho phép ở caregiver routes
        if (currentRoute !== 'caregiver' && !currentRoute?.startsWith('caregiver/')) {
          console.log('🔵 Redirecting to caregiver, current route:', currentRoute);
          router.replace('/caregiver');
        }
      } else {
        // Care Seeker - cho phép ở tabs và careseeker routes
        if (currentRoute !== '(tabs)' && currentRoute !== 'careseeker' && !currentRoute?.startsWith('careseeker/')) {
          console.log('🔵 Redirecting to tabs, current route:', currentRoute);
          router.replace('/(tabs)');
        }
      }
    }
  }, [user, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="splash" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="test-token" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="careseeker" options={{ headerShown: false }} />
      <Stack.Screen name="caregiver" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  console.log('🟢 RootLayout rendering...');
  const colorScheme = useColorScheme();
  const { isReady, error } = useDatabase();
  console.log('🟢 Database ready:', isReady, 'Error:', error?.message || 'none');

  // 🔥 Initialize Firebase Messaging & Notification Channel
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupNotifications = async () => {
      if (Platform.OS === 'android' && notifee) {
        try {
          // Tạo notification channel (ID phải khớp với backend)
          await notifee.createChannel({
            id: 'care_service_channel',
            name: 'Care Service Notifications',
            sound: 'default',
            vibration: true,
            importance: 4, // AndroidImportance.HIGH
          });
          console.log('✅ Notification channel created');
        } catch (err) {
          console.log('❌ Error creating channel:', err);
        }

        // Request notification permission cho Android 13+
        try {
          await notifee.requestPermission();
          console.log('✅ Notification permission granted');
        } catch (err) {
          console.log('❌ Notification permission error:', err);
        }
      }

      if (messaging && Platform.OS !== 'web') {
        // Request permission (iOS only, Android auto-grants)
        messaging()
          .requestPermission()
          .then((authStatus: number) => {
            const enabled =
              authStatus === 1 || // messaging.AuthorizationStatus.AUTHORIZED
              authStatus === 2;   // messaging.AuthorizationStatus.PROVISIONAL

            if (enabled) {
              console.log('✅ Firebase Messaging Permission granted');
            }
          })
          .catch((err: any) => {
            console.log('❌ Firebase Messaging Permission error:', err);
          });

        // Handle foreground messages - hiển thị notification
        unsubscribe = messaging().onMessage(async (remoteMessage: any) => {
          console.log('📩 Received foreground message:', remoteMessage);

          // Hiển thị notification khi app đang mở (foreground)
          if (Platform.OS === 'android' && notifee && remoteMessage.notification) {
            try {
              await notifee.displayNotification({
                title: remoteMessage.notification.title || 'Thông báo',
                body: remoteMessage.notification.body || '',
                android: {
                  channelId: 'care_service_channel',
                  sound: 'default',
                  vibrationPattern: [300, 500],
                  pressAction: {
                    id: 'default',
                  },
                  // Thêm data nếu có
                  data: remoteMessage.data || {},
                },
                data: remoteMessage.data || {},
              });
              console.log('✅ Foreground notification displayed');
            } catch (err) {
              console.log('❌ Error displaying notification:', err);
            }
          }
        });
      }
    };

    setupNotifications();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  if (!isReady) {
    console.log('🟡 Database not ready, showing loading...');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2DC2D7" />
        <Text style={styles.loadingText}>Đang khởi tạo database...</Text>
      </View>
    );
  }

  if (error) {
    console.log('🔴 Database error:', error.message);
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Lỗi khởi tạo database: {error.message}</Text>
      </View>
    );
  }

  console.log('🟢 Rendering main app with providers...');
  return (
    <AuthProvider>
      <NavigationProvider>
        <NotificationProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <ErrorBoundary>
              <RootNavigator />
            </ErrorBoundary>
            <StatusBar style="auto" />
          </ThemeProvider>
        </NotificationProvider>
      </NavigationProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#ff0000",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
