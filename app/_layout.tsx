import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NavigationProvider } from "@/contexts/NavigationContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, Text, StyleSheet, LogBox } from "react-native";
import "react-native-reanimated";
import { useEffect } from "react";
import { NotificationService } from "@/services/notification.service";

// Ẩn tất cả các warning trên màn hình
LogBox.ignoreAllLogs(true);

// Ignore keep awake errors - expo-router tự động activate trong dev mode
LogBox.ignoreLogs([
  'Unable to activate keep awake',
  'Error: Unable to activate keep awake',
  'Uncaught (in promise',
  'Cannot read property',
  /Unable to activate keep awake/,
  /Error: Unable to activate keep awake/,
]);

// Suppress unhandled promise rejections for keep awake
if (typeof global !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const message = args.join(' ');
    if (message.includes('Unable to activate keep awake') || 
        message.includes('Error: Unable to activate keep awake')) {
      return; // Suppress keep awake errors
    }
    originalConsoleError.apply(console, args);
  };
}

export const unstable_settings = {
  anchor: "login",
};

function RootNavigator() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="splash" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
      </Stack>
    );
  }

  // Check role - support both "Caregiver"/"ROLE_CAREGIVER" formats
  const isCaregiver = 
    user.role === "Caregiver" || 
    user.role === "ROLE_CAREGIVER" ||
    user.role?.toUpperCase() === "ROLE_CAREGIVER";

  if (isCaregiver) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="caregiver" options={{ headerShown: false }} />
      </Stack>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="careseeker" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Initialize notification service when app starts
  useEffect(() => {
    const initNotifications = async () => {
      try {
        await NotificationService.initialize();
      } catch (error) {
        // Silent fail
      }
    };
    
    // Add small delay to ensure app is ready
    setTimeout(() => {
      initNotifications();
    }, 500);
  }, []);

  return (
    <AuthProvider>
      <NavigationProvider>
        <NotificationProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <RootNavigator />
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
