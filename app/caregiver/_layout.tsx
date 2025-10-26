import { useAuth } from "@/contexts/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createDrawerNavigator } from "@react-navigation/drawer";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import Availability from "./availability";
import Booking from "./booking";
import CertificatesScreen from "./certificatesScreen";
import ChatScreen from "./chat";
import ExpertProfileScreen from "./expert-profile";
import CaregiverHome from "./index";
import PaymentScreen from "./payment";
import TrainingCourseDetail from "./training-course-detail";
import TrainingCoursesMobile from "./training-courses";
const Drawer = createDrawerNavigator();

const features = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: "check-circle-outline",
    component: CaregiverHome,
  },
  {
    id: "profile",
    title: "Hồ sơ chuyên gia",
    icon: "account-tie",
    component: ExpertProfileScreen, // Nếu có file riêng thì thay vào đây
  },
  {
    id: "availability",
    title: "Quản lý lịch",
    icon: "calendar-clock",
    component: Availability,
  },
  {
    id: "booking",
    title: "Yêu cầu dịch vụ",
    icon: "clipboard-list",
    component: Booking,
  },
  {
    id: "payments",
    title: "Thanh toán",
    icon: "credit-card-outline",
    component: PaymentScreen,
  },
  {
    id: "chat",
    title: "Tin nhắn",
    icon: "chat-outline",
    component: ChatScreen,
  },
  {
    id: "training",
    title: "Đào tạo liên tục",
    icon: "school",
    component: TrainingCoursesMobile,
  },
  {
    id: "certificates",
    title: "Chứng chỉ và kỹ năng",
    icon: "chart-line",
    component: CertificatesScreen,
  },
];

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
        {features.map((item) => (
          <Drawer.Screen
            key={item.id}
            name={item.title}
            component={item.component}
            options={{
              drawerIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name={item.icon as any}
                  color={color}
                  size={size}
                />
              ),
            }}
          />
        ))}
        <Drawer.Screen
          name="Chi tiết khóa học"
          component={TrainingCourseDetail}
          options={{
            drawerItemStyle: { height: 0 },
          }}
        />

        {/* Logout riêng */}
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
