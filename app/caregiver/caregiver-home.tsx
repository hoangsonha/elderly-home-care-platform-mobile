"use client";

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationPanel } from "@/components/ui/NotificationPanel";

const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#FFD93D",
  "#6A4C93",
  "#FFA07A",
  "#20B2AA",
  "#FF69B4",
  "#87CEFA",
  "#F08080",
];

const features = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: "check-circle-outline",
    route: "/caregiver-dashboard",
  },
  {
    id: "profile",
    title: "Hồ sơ chuyên gia",
    icon: "account-tie",
    route: "/expert-profile",
  },

  {
    id: "availability",
    title: "Quản lý lịch",
    icon: "calendar-clock",
    route: "/availability",
  },
  {
    id: "booking",
    title: "Yêu cầu dịch vụ",
    icon: "clipboard-list",
    route: "/booking",
  },
  {
    id: "payments",
    title: "Thanh toán",
    icon: "credit-card-outline",
    route: "/payment",
  },

  { id: "chat", title: "Tin nhắn", icon: "chat-outline", route: "/chat" },
  {
    id: "training",
    title: "Đào tạo",
    icon: "school",
    route: "/training-courses",
  },
  { id: "analytics", title: "Hiệu suất", icon: "chart-line" },
];

const PlaceholderScreen = ({ title }: { title: string }) => (
  <SafeAreaView
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#F7F9FC",
    }}
  >
    <Text style={{ fontSize: 20, fontWeight: "700" }}>{title}</Text>
    <Text style={{ marginTop: 8, color: "#8A94A6" }}>Chưa có nội dung</Text>
  </SafeAreaView>
);

export default function CaregiverHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  
  // Mock notifications - TODO: Fetch from API
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Yêu cầu mới',
      message: 'Bạn có yêu cầu chăm sóc mới từ gia đình Nguyễn',
      time: '5 phút trước',
      type: 'info' as const,
      isRead: false,
    },
    {
      id: '2',
      title: 'Lịch hẹn sắp tới',
      message: 'Bạn có lịch hẹn vào lúc 14:00 hôm nay',
      time: '1 giờ trước',
      type: 'info' as const,
      isRead: false,
    },
  ]);

  const handlePress = (feature: (typeof features)[number]) => {
    if (feature.route) {
      router.push(feature.route);
    } else {
      alert(`${feature.title} đang phát triển`);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F9FC", paddingBottom: 100 }}>
      {/* Header - giống Careseeker */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.avatarButton}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.userAvatarImage} />
              ) : (
                <View style={styles.userAvatar}>
                  <Ionicons name="person" size={20} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>Xin chào!</Text>
              <Text style={styles.userName}>{user?.name || user?.email?.split('@')[0] || 'Caregiver'}</Text>
            </View>
          </View>
          
          {/* Chat & Notification buttons */}
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => router.push('/caregiver/chat-list')}
            >
              <Ionicons name="chatbubble-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => setShowNotificationModal(true)}
            >
              <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <Text style={styles.title}>Caregiver App</Text>

        <View style={styles.grid}>
          {features.map((f, index) => (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.card,
                { backgroundColor: COLORS[index % COLORS.length] },
              ]}
              onPress={() => handlePress(f)}
            >
              <Icon
                name={f.icon}
                size={28}
                color="#fff"
                style={{ marginBottom: 8 }}
              />
              <Text style={styles.cardTitle}>{f.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      {/* Notification Dropdown */}
      {showNotificationModal && (
        <TouchableOpacity 
          style={styles.notificationOverlay}
          activeOpacity={1}
          onPress={() => setShowNotificationModal(false)}
        >
          <View style={styles.notificationDropdown}>
            <View style={styles.notificationArrow} />
            <NotificationPanel 
              notifications={notifications}
              onNotificationPress={(notification) => {
                console.log('Notification pressed:', notification);
                setNotifications(prev => 
                  prev.map(notif => 
                    notif.id === notification.id 
                      ? { ...notif, isRead: true }
                      : notif
                  )
                );
              }}
              onMarkAsRead={(notificationId) => {
                setNotifications(prev => 
                  prev.map(notif => 
                    notif.id === notificationId 
                      ? { ...notif, isRead: true }
                      : notif
                  )
                );
              }}
              onMarkAllAsRead={() => {
                setNotifications(prev => 
                  prev.map(notif => ({ ...notif, isRead: true }))
                );
              }}
            />
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Header styles - giống Careseeker
  header: {
    backgroundColor: '#68C2E8',
    paddingTop: 45,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 56,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarButton: {
    marginRight: 14,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  userAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  greetingContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 3,
  },
  userName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#68C2E8',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  notificationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  notificationDropdown: {
    position: 'absolute',
    top: 100,
    right: 20,
    width: '75%',
    maxHeight: '80%',
    zIndex: 1001,
  },
  notificationArrow: {
    position: 'absolute',
    top: -8,
    right: 12,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
    zIndex: 1002,
  },
  
  // Original styles
  title: { fontSize: 28, fontWeight: "700", marginBottom: 4, color: "#222" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 16,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
