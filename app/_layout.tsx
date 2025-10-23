import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { GlobalNavBar } from '@/components/navigation/GlobalNavBar';
import { AuthProvider } from '@/contexts/AuthContext';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: 'splash',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NavigationProvider>
          <NotificationProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <GlobalNavBar>
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
                  <Stack.Screen name="reviews" options={{ headerShown: false }} />
                  <Stack.Screen name="appointments" options={{ headerShown: false }} />
                  <Stack.Screen name="payments" options={{ headerShown: false }} />
                  <Stack.Screen name="hiring-history" options={{ headerShown: false }} />
                  <Stack.Screen name="availability" options={{ headerShown: false }} />
                  <Stack.Screen name="booking" options={{ headerShown: false }} />
                  <Stack.Screen name="caregiver-home" options={{ headerShown: false }} />
                  <Stack.Screen name="expert-profile" options={{ headerShown: false }} />
                  <Stack.Screen name="payment" options={{ headerShown: false }} />
                  <Stack.Screen name="complaints" options={{ headerShown: false, title: 'Khiếu nại' }} />
                  <Stack.Screen name="complaint-detail" options={{ headerShown: false, title: 'Chi tiết khiếu nại' }} />
                  <Stack.Screen name="create-complaint" options={{ headerShown: false, title: 'Tạo khiếu nại' }} />
                  <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                </Stack>
              </GlobalNavBar>
              <StatusBar style="auto" />
            </ThemeProvider>
          </NotificationProvider>
        </NavigationProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
