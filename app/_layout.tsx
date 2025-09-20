import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: 'splash',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <NotificationProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
                <Stack.Screen name="splash" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="profile-setup" options={{ headerShown: false }} />
                <Stack.Screen name="register" options={{ headerShown: false }} />
                <Stack.Screen name="system-info" options={{ headerShown: false }} />
                <Stack.Screen name="dashboard" options={{ headerShown: false }} />
                <Stack.Screen name="caregiver-search" options={{ headerShown: false }} />
                <Stack.Screen name="caregiver-detail" options={{ headerShown: false }} />
                <Stack.Screen name="elderly-list" options={{ headerShown: false }} />
                <Stack.Screen name="elderly-detail" options={{ headerShown: false }} />
                <Stack.Screen name="elderly-profile-tabs" options={{ headerShown: false }} />
                <Stack.Screen name="add-elderly" options={{ headerShown: false }} />
                <Stack.Screen name="family-list" options={{ headerShown: false }} />
                <Stack.Screen name="family-detail" options={{ headerShown: false }} />
                <Stack.Screen name="chat-list" options={{ headerShown: false }} />
                <Stack.Screen name="chat" options={{ headerShown: false }} />
                <Stack.Screen name="alert-list" options={{ headerShown: false }} />
                <Stack.Screen name="alert-detail" options={{ headerShown: false }} />
                <Stack.Screen name="requests" options={{ headerShown: false }} />
                <Stack.Screen name="request-detail" options={{ headerShown: false }} />
                <Stack.Screen name="hired-caregivers" options={{ headerShown: false }} />
                <Stack.Screen name="hired-detail" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
