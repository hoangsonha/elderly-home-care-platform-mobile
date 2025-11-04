import { useAuth } from "@/contexts/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createDrawerNavigator } from "@react-navigation/drawer";
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import AppointmentDetailScreen from "@/app/caregiver/appointment-detail";
import Availability from "@/app/caregiver/availability";
import Booking from "@/app/caregiver/booking";
import CaregiverDashboardScreen from "@/app/caregiver/caregiver-dashboard";
import CertificatesScreen from "@/app/caregiver/certificatesScreen";
import ChatScreen from "@/app/caregiver/chat";
import ChatListScreen from "@/app/caregiver/chat-list";
import ComplaintScreen from "@/app/caregiver/complaint";
import ExpertProfileScreen from "@/app/caregiver/expert-profile";
import IncomingCallScreen from "@/app/caregiver/incoming-call";
import PaymentScreen from "@/app/caregiver/payment";
import PersonalScreen from "@/app/caregiver/personal";
import ReviewScreen from "@/app/caregiver/review";
import SettingsScreen from "@/app/caregiver/settings";
import TrainingCourseDetail from "@/app/caregiver/training-course-detail";
import TrainingCoursesMobile from "@/app/caregiver/training-courses";
import VideoCallScreen from "@/app/caregiver/video-call";
import ViewReviewScreen from "@/app/caregiver/view-review";
import CaregiverWithdrawScreen from "@/app/caregiver/withdraw";

const Drawer = createDrawerNavigator();

const features = [
  {
    id: "dashboard",
    title: "Trang chủ",
    icon: "check-circle-outline",
    component: CaregiverDashboardScreen,
  },
  {
    id: "profile",
    title: "Hồ sơ của bạn",
    icon: "account-tie",
    component: ExpertProfileScreen,
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
    id: "chatlist",
    title: "Danh sách tin nhắn",
    icon: "chat-outline",
    component: ChatListScreen,
  },
  {
    id: "training",
    title: "Đào tạo",
    icon: "school",
    component: TrainingCoursesMobile,
  },
  {
    id: "certificates",
    title: "Chứng chỉ và kỹ năng",
    icon: "chart-line",
    component: CertificatesScreen,
  },
  {
    id: "personal",
    title: "Cá nhân",
    icon: "account",
    component: PersonalScreen,
  },
];

export default function CaregiverSidebar() {
  const { logout } = useAuth();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer.Navigator
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: "#70C1F1" },
          headerTintColor: "#fff",
          headerLeft: () => null,
          drawerType: "slide",
          drawerStyle: {
            backgroundColor: "#fff",
            width: 250,
          },
        }}
      >
        {/* Dashboard với icon chat */}
        <Drawer.Screen
          name="Trang chủ"
          component={CaregiverDashboardScreen}
          options={({ navigation }) => ({
            headerShown: false,
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="check-circle-outline"
                color={color}
                size={size}
              />
            ),
          })}
        />

        {/* Các features còn lại (trừ Danh sách tin nhắn, Hồ sơ của bạn, Chứng chỉ và kỹ năng, và Đào tạo) */}
        {features.slice(1).filter(item => item.id !== "chatlist" && item.id !== "profile" && item.id !== "certificates" && item.id !== "training").map((item) => (
          <Drawer.Screen
            key={item.id}
            name={item.title}
            component={item.component}
            options={({ navigation }) => ({
              drawerIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name={item.icon as any}
                  color={color}
                  size={size}
                />
              ),
              // Add headerRight for "Quản lý lịch" screen
              ...(item.id === "availability" && {
                headerRight: () => (
                  <TouchableOpacity
                    onPress={() => console.log("Lịch rảnh pressed")}
                    style={{
                      marginRight: 15,
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "rgba(255, 255, 255, 0.25)",
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 6,
                      gap: 6,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="bell-outline"
                      size={20}
                      color="#fff"
                    />
                    <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
                      Lịch rảnh
                    </Text>
                  </TouchableOpacity>
                ),
              }),
            })}
          />
        ))}
        
        {/* Đào tạo với back button */}
        <Drawer.Screen
          name="Đào tạo"
          component={TrainingCoursesMobile}
          options={({ navigation }) => ({
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="school"
                color={color}
                size={size}
              />
            ),
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate("Cá nhân")}
                style={{ marginLeft: 15 }}
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={28}
                  color="#fff"
                />
              </TouchableOpacity>
            ),
          })}
        />
        
        {/* Chứng chỉ và kỹ năng với back button */}
        <Drawer.Screen
          name="Chứng chỉ và kỹ năng"
          component={CertificatesScreen}
          options={({ navigation }) => ({
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="chart-line"
                color={color}
                size={size}
              />
            ),
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate("Cá nhân")}
                style={{ marginLeft: 15 }}
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={28}
                  color="#fff"
                />
              </TouchableOpacity>
            ),
          })}
        />
        
        {/* Hồ sơ của bạn với back button */}
        <Drawer.Screen
          name="Hồ sơ của bạn"
          component={ExpertProfileScreen}
          options={({ navigation }) => ({
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="account-tie"
                color={color}
                size={size}
              />
            ),
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate("Cá nhân")}
                style={{ marginLeft: 15 }}
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={28}
                  color="#fff"
                />
              </TouchableOpacity>
            ),
          })}
        />
        
        {/* Danh sách tin nhắn */}
        <Drawer.Screen
          name="Danh sách tin nhắn"
          component={ChatListScreen}
          options={({ navigation }) => ({
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="chat-outline"
                color={color}
                size={size}
              />
            ),
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate("Trang chủ")}
                style={{ marginLeft: 15 }}
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={28}
                  color="#fff"
                />
              </TouchableOpacity>
            ),
          })}
        />
        
        {/* Tin nhắn với back button */}
        <Drawer.Screen
          name="Tin nhắn"
          component={ChatScreen}
          options={({ navigation }) => ({
            drawerItemStyle: { height: 0 },
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate("Danh sách tin nhắn")}
                style={{ marginLeft: 15 }}
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={28}
                  color="#fff"
                />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("Video Call");
                }}
                style={{ marginRight: 15 }}
              >
                <MaterialCommunityIcons
                  name="video-outline"
                  size={28}
                  color="#fff"
                />
              </TouchableOpacity>
            ),
          })}
        />
        
        {/* Video Call - hidden from drawer */}
        <Drawer.Screen
          name="Video Call"
          component={VideoCallScreen}
          options={{
            drawerItemStyle: { height: 0 },
            headerShown: false,
          }}
        />
        
        {/* Appointment Detail - hidden from drawer */}
        <Drawer.Screen
          name="Appointment Detail"
          component={AppointmentDetailScreen}
          options={({ navigation, route }) => {
            const params = route.params as { fromScreen?: string } | undefined;
            const fromScreen = params?.fromScreen;
            
            const handleBack = () => {
              if (fromScreen) {
                // Navigate to specific screen based on fromScreen param
                switch (fromScreen) {
                  case "dashboard":
                    navigation.navigate("Trang chủ");
                    break;
                  case "booking":
                    navigation.navigate("Yêu cầu dịch vụ");
                    break;
                  case "availability":
                    navigation.navigate("Quản lý lịch");
                    break;
                  default:
                    navigation.goBack();
                }
              } else {
                // Fallback to goBack if no fromScreen param
                navigation.goBack();
              }
            };

            return {
              drawerItemStyle: { height: 0 },
              headerShown: true,
              title: "Chi tiết lịch hẹn",
              headerStyle: {
                backgroundColor: "#70C1F1",
              },
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "bold",
              },
              headerLeft: () => (
                <TouchableOpacity
                  onPress={handleBack}
                  style={{ marginLeft: 15 }}
                >
                  <MaterialCommunityIcons
                    name="arrow-left"
                    size={28}
                    color="#fff"
                  />
                </TouchableOpacity>
              ),
            };
          }}
        />
        
        {/* Settings - hidden from drawer */}
        <Drawer.Screen
          name="Cài đặt"
          component={SettingsScreen}
          options={({ navigation }) => ({
            drawerItemStyle: { height: 0 },
            headerShown: true,
            headerStyle: {
              backgroundColor: "#70C1F1",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ marginLeft: 15 }}
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={28}
                  color="#fff"
                />
              </TouchableOpacity>
            ),
          })}
        />

        {/* Complaint - hidden from drawer */}
        <Drawer.Screen
          name="Complaint"
          component={ComplaintScreen}
          options={{
            drawerItemStyle: { height: 0 },
            headerShown: false,
          }}
        />

        {/* Review - hidden from drawer */}
        <Drawer.Screen
          name="Review"
          component={ReviewScreen}
          options={({ navigation, route }) => {
            const params = route.params as { fromScreen?: string } | undefined;
            const fromScreen = params?.fromScreen;
            
            const handleBack = () => {
              if (fromScreen) {
                switch (fromScreen) {
                  case "booking":
                    navigation.navigate("Yêu cầu dịch vụ");
                    break;
                  case "appointment-detail":
                    navigation.goBack();
                    break;
                  default:
                    navigation.goBack();
                }
              } else {
                navigation.goBack();
              }
            };

            return {
              drawerItemStyle: { height: 0 },
              headerShown: true,
              title: "Đánh giá dịch vụ",
              headerStyle: {
                backgroundColor: "#70C1F1",
              },
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "bold",
              },
              headerLeft: () => (
                <TouchableOpacity
                  onPress={handleBack}
                  style={{ marginLeft: 15 }}
                >
                  <MaterialCommunityIcons
                    name="arrow-left"
                    size={28}
                    color="#fff"
                  />
                </TouchableOpacity>
              ),
            };
          }}
        />

        {/* View Review - hidden from drawer */}
        <Drawer.Screen
          name="View Review"
          component={ViewReviewScreen}
          options={({ navigation, route }) => {
            const params = route.params as { fromScreen?: string } | undefined;
            const fromScreen = params?.fromScreen;
            
            const handleBack = () => {
              if (fromScreen) {
                switch (fromScreen) {
                  case "booking":
                    navigation.navigate("Yêu cầu dịch vụ");
                    break;
                  case "appointment-detail":
                    navigation.goBack();
                    break;
                  default:
                    navigation.goBack();
                }
              } else {
                navigation.goBack();
              }
            };

            return {
              drawerItemStyle: { height: 0 },
              headerShown: true,
              title: "Xem đánh giá",
              headerStyle: {
                backgroundColor: "#70C1F1",
              },
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "bold",
              },
              headerLeft: () => (
                <TouchableOpacity
                  onPress={handleBack}
                  style={{ marginLeft: 15 }}
                >
                  <MaterialCommunityIcons
                    name="arrow-left"
                    size={28}
                    color="#fff"
                  />
                </TouchableOpacity>
              ),
            };
          }}
        />
        
        <Drawer.Screen
          name="Chi tiết khóa học"
          component={TrainingCourseDetail}
          options={({ navigation }) => ({
            drawerItemStyle: { height: 0 },
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate("Đào tạo")}
                style={{ marginLeft: 15 }}
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={28}
                  color="#fff"
                />
              </TouchableOpacity>
            ),
          })}
        />

        {/* Rút tiền - hidden from drawer */}
        <Drawer.Screen
          name="Rút tiền"
          component={CaregiverWithdrawScreen}
          options={({ navigation }) => ({
            drawerItemStyle: { height: 0 },
            headerShown: true,
            headerStyle: {
              backgroundColor: "#70C1F1",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ marginLeft: 15 }}
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={28}
                  color="#fff"
                />
              </TouchableOpacity>
            ),
          })}
        />

        {/* Thanh toán - hidden from drawer */}
        <Drawer.Screen
          name="Thanh toán"
          component={PaymentScreen}
          options={{
            drawerItemStyle: { height: 0 },
            headerShown: true,
            headerStyle: {
              backgroundColor: "#70C1F1",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
            headerLeft: () => null,
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

        {/* Incoming Call Screen - Hidden from drawer */}
        <Drawer.Screen
          name="Incoming Call"
          component={IncomingCallScreen}
          options={{
            drawerItemStyle: { display: "none" },
            headerShown: false,
          }}
        />
      </Drawer.Navigator>
    </GestureHandlerRootView>
  );
}
