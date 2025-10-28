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
import "react-native-reanimated";

export const unstable_settings = {
  anchor: "splash",
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

  if (user.role === "Caregiver") {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="caregiver" options={{ headerShown: false }} />
      </Stack>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="caregiver-search" options={{ headerShown: false }} />
      <Stack.Screen name="caregiver-detail" options={{ headerShown: false }} />
      <Stack.Screen name="elderly-list" options={{ headerShown: false }} />
      <Stack.Screen name="elderly-detail" options={{ headerShown: false }} />
      <Stack.Screen name="add-elderly" options={{ headerShown: false }} />
      <Stack.Screen name="requests" options={{ headerShown: false }} />
      <Stack.Screen name="request-detail" options={{ headerShown: false }} />
      <Stack.Screen name="payments" options={{ headerShown: false }} />
      <Stack.Screen name="payment" options={{ headerShown: false }} />
      <Stack.Screen name="hiring-history" options={{ headerShown: false }} />
      <Stack.Screen name="hired-caregivers" options={{ headerShown: false }} />
      <Stack.Screen name="hired-detail" options={{ headerShown: false }} />
      <Stack.Screen name="chat-list" options={{ headerShown: false }} />
      <Stack.Screen name="chat" options={{ headerShown: false }} />
      <Stack.Screen name="complaints" options={{ headerShown: false }} />
      <Stack.Screen name="complaint-detail" options={{ headerShown: false }} />
      <Stack.Screen name="create-complaint" options={{ headerShown: false }} />
      <Stack.Screen name="reviews" options={{ headerShown: false }} />
      <Stack.Screen name="appointments" options={{ headerShown: false }} />
      <Stack.Screen name="appointment-detail" options={{ headerShown: false }} />
      <Stack.Screen name="alert-list" options={{ headerShown: false }} />
      <Stack.Screen name="alert-detail" options={{ headerShown: false }} />
      <Stack.Screen name="family-list" options={{ headerShown: false }} />
      <Stack.Screen name="family-detail" options={{ headerShown: false }} />
      <Stack.Screen name="elderly-profile-tabs" options={{ headerShown: false }} />
      <Stack.Screen name="system-info" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ headerShown: false }} />
      <Stack.Screen name="top-up" options={{ headerShown: false }} />
      <Stack.Screen name="withdraw" options={{ headerShown: false }} />
      <Stack.Screen name="transaction-history" options={{ headerShown: false }} />
      <Stack.Screen name="transaction-detail" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

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
