import { Stack } from "expo-router";
import { EmergencyContactProvider } from "@/contexts/EmergencyContactContext";

export default function CareSeekerLayout() {
  return (
    <EmergencyContactProvider>
      <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="caregiver-search" options={{ headerShown: false }} />
      <Stack.Screen name="caregiver-detail" options={{ headerShown: false }} />
      <Stack.Screen name="elderly-list" options={{ headerShown: false }} />
      <Stack.Screen name="elderly-detail" options={{ headerShown: false }} />
      <Stack.Screen name="add-elderly" options={{ headerShown: false }} />
      <Stack.Screen name="requests" options={{ headerShown: false }} />
      <Stack.Screen name="request-detail" options={{ headerShown: false }} />
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
      <Stack.Screen name="system-info" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ headerShown: false }} />
      <Stack.Screen name="emergency-contacts" options={{ headerShown: false }} />
      <Stack.Screen name="in-progress" options={{ headerShown: false }} />
      <Stack.Screen name="video-call" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
    </Stack>
    </EmergencyContactProvider>
  );
}

