import { useAuth } from "@/contexts/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createDrawerNavigator } from "@react-navigation/drawer";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Availability from "./availability";
import Booking from "./booking";
import CaregiverHome from "./index";
import PaymentsScreen from "./payments";

const Drawer = createDrawerNavigator();

export default function CaregiverLayout() {
  const { logout } = useAuth();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer.Navigator
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: "#4ECDC4" },
          headerTintColor: "#fff",
          drawerType: "slide",
          drawerStyle: {
            backgroundColor: "#fff",
            width: 250,
          },
        }}
      >
        <Drawer.Screen
          name="Trang chủ"
          component={CaregiverHome}
          options={{
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="home-outline"
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="Quản lý lịch"
          component={Availability}
          options={{
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="calendar-clock"
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="Yêu cầu dịch vụ"
          component={Booking}
          options={{
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="clipboard-list"
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="Thanh toán"
          component={PaymentsScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="credit-card-outline"
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="Đăng xuất"
          component={() => null}
          listeners={{
            focus: () => logout(),
          }}
          options={{
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="logout" color={color} size={size} />
            ),
          }}
        />
      </Drawer.Navigator>
    </GestureHandlerRootView>
  );
}
