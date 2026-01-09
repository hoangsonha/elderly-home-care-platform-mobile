import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { EmergencyAlert } from "@/components/alerts/EmergencyAlert";
import { ElderlyProfiles } from "@/components/elderly/ElderlyProfiles";
import { RequestNotification } from "@/components/notifications/RequestNotification";
import { AppointmentScheduleToday } from "@/components/schedule/AppointmentScheduleToday";
import { ThemedText } from "@/components/themed-text";
import { AddElderlyModal } from "@/components/ui/AddElderlyModal";
import { CustomModal } from "@/components/ui/CustomModal";
import { NotificationPanel } from "@/components/ui/NotificationPanel";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import { mainService } from "@/services/main.service";

const { width } = Dimensions.get("window");

// Helper function to format time
const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return "Vừa xong";
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ngày trước`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} tuần trước`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} tháng trước`;
};

// Helper function to map notification type to UI type
const mapNotificationType = (type: string): 'info' | 'success' | 'warning' | 'error' | 'reminder' => {
  if (type.includes('ACCEPT') || type.includes('APPROVED') || type.includes('SUCCESS')) {
    return 'success';
  }
  if (type.includes('REJECT') || type.includes('DECLINE') || type.includes('ERROR')) {
    return 'error';
  }
  if (type.includes('WARNING') || type.includes('REMINDER')) {
    return 'warning';
  }
  if (type.includes('REMINDER')) {
    return 'reminder';
  }
  return 'info';
};

interface ServiceModule {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  route?: string;
}

// Các tính năng khác
const otherFeatures: ServiceModule[] = [
  {
    id: "complaints-feature",
    title: "Khiếu nại",
    icon: "warning",
    color: "#E74C3C",
    description: "Quản lý khiếu nại và tố cáo",
    route: "/complaints",
  },
  {
    id: "reviews-feature",
    title: "Đánh giá",
    icon: "star",
    color: "#A8E6CF",
    description: "Đánh giá chất lượng dịch vụ",
    route: "/reviews",
  },
  {
    id: "app-info",
    title: "Thông tin app",
    icon: "information-circle",
    color: "#3498DB",
    description: "Thông tin về ứng dụng",
    route: "/app-info",
  },
];

export default function CaregiverHome() {
  const { user, logout } = useAuth();
  const { emergencyAlertVisible, hideEmergencyAlert } = useNotification();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showAppInfoModal, setShowAppInfoModal] = useState(false);
  const [showAddElderlyModal, setShowAddElderlyModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);


  // Request notification data
  const requestCount = 3; // Sample data
  const showRequestNotification = true;

  // Emergency alert data
  const emergencyAlert = {
    caregiverName: "Nguyễn Văn A",
    elderlyName: "Bà Nguyễn Thị B",
    timestamp: new Date().toISOString(),
    location: "123 Đường ABC, Quận 1, TP.HCM",
    message: "Người già có dấu hiệu khó thở, cần hỗ trợ y tế ngay lập tức!",
  };

  // Sample appointment data
  const appointments = [
    {
      id: "1",
      caregiverName: "Trần Văn Nam",
      caregiverAvatar: "N",
      timeSlot: "08:00 - 12:00",
      status: "completed" as const,
      address: "123 Đường ABC, Quận 1, TP.HCM",
      rating: 4.8,
      isVerified: true,
      tasks: [
        {
          id: "7",
          name: "Nhắc nhở uống thuốc buổi sáng",
          completed: true,
          time: "09:00",
          status: "completed" as const,
        },
        {
          id: "8",
          name: "Tập thể dục nhẹ",
          completed: true,
          time: "08:00",
          status: "completed" as const,
        },
        {
          id: "9",
          name: "Chuẩn bị bữa trưa",
          completed: false,
          time: "12:00",
          status: "failed" as const,
        },
        {
          id: "10",
          name: "Dọn dẹp phòng",
          completed: false,
          time: "14:00",
          status: "failed" as const,
        },
      ],
    },
    {
      id: "2",
      caregiverName: "Nguyễn Thị Mai",
      caregiverAvatar: "M",
      timeSlot: "14:00 - 18:00",
      status: "in-progress" as const,
      address: "456 Đường XYZ, Quận 2, TP.HCM",
      rating: 4.5,
      isVerified: true,
      tasks: [
        {
          id: "1",
          name: "Nhắc nhở uống thuốc buổi sáng",
          completed: true,
          time: "09:00",
          status: "completed" as const,
        },
        {
          id: "2",
          name: "Tập thể dục nhẹ",
          completed: true,
          time: "08:00",
          status: "completed" as const,
        },
        {
          id: "3",
          name: "Chuẩn bị bữa trưa",
          completed: false,
          time: "12:00",
          status: "pending" as const,
        },
        {
          id: "4",
          name: "Dọn dẹp phòng",
          completed: false,
          time: "14:00",
          status: "pending" as const,
        },
        {
          id: "5",
          name: "Trò chuyện và giải trí",
          completed: false,
          time: "15:00",
          status: "pending" as const,
        },
        {
          id: "6",
          name: "Mua sắm đồ dùng",
          completed: false,
          time: "16:00",
          status: "pending" as const,
        },
      ],
    },
    {
      id: "3",
      caregiverName: "Lê Thị Hoa",
      caregiverAvatar: "H",
      timeSlot: "19:00 - 22:00",
      status: "upcoming" as const,
      address: "789 Đường DEF, Quận 3, TP.HCM",
      rating: 4.2,
      isVerified: false,
      tasks: [
        {
          id: "11",
          name: "Nhắc nhở uống thuốc buổi sáng",
          completed: false,
          time: "09:00",
        },
        { id: "12", name: "Tập thể dục nhẹ", completed: false, time: "08:00" },
        {
          id: "13",
          name: "Chuẩn bị bữa trưa",
          completed: false,
          time: "12:00",
        },
        { id: "14", name: "Dọn dẹp phòng", completed: false, time: "14:00" },
        {
          id: "15",
          name: "Trò chuyện và giải trí",
          completed: false,
          time: "15:00",
        },
        { id: "16", name: "Mua sắm đồ dùng", completed: false, time: "16:00" },
      ],
    },
  ];

  // Sample elderly profiles data
  const elderlyProfiles = [
    {
      id: "1",
      name: "Bà Nguyễn Thị Lan",
      age: 75,
      healthStatus: "Tốt",
      avatar: "https://via.placeholder.com/60x60/4ECDC4/FFFFFF?text=NL",
      relationship: "Bà nội",
    },
    {
      id: "2",
      name: "Ông Trần Văn Minh",
      age: 82,
      healthStatus: "Khá",
      avatar: "https://via.placeholder.com/60x60/27AE60/FFFFFF?text=TM",
      relationship: "Ông ngoại",
    },
    {
      id: "3",
      name: "Bà Lê Thị Hoa",
      age: 68,
      healthStatus: "Tốt",
      avatar: "https://via.placeholder.com/60x60/F39C12/FFFFFF?text=LH",
      relationship: "Bà ngoại",
    },
    {
      id: "4",
      name: "Ông Phạm Văn Đức",
      age: 79,
      healthStatus: "Yếu",
      avatar: "https://via.placeholder.com/60x60/E74C3C/FFFFFF?text=PD",
      relationship: "Ông nội",
    },
  ];
  const [notifications, setNotifications] = useState<{
    id: string;
    title: string;
    message: string;
    time: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'reminder';
    isRead: boolean;
    notificationId?: string; // API notificationId
  }[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      setLoadingNotifications(true);
      const response = await mainService.getNotifications({
        page: 0,
        size: 20,
        sort: 'createdAt,desc',
      });
      
      // Sort: unread first, then by createdAt descending
      const sortedContent = [...response.content].sort((a, b) => {
        // Unread notifications first
        if (!a.isRead && b.isRead) return -1;
        if (a.isRead && !b.isRead) return 1;
        // If both have same read status, sort by createdAt descending (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      const mappedNotifications = sortedContent.map((notif) => ({
        id: notif.notificationId,
        notificationId: notif.notificationId,
        title: notif.title,
        message: notif.body,
        time: formatTimeAgo(notif.sentAt || notif.createdAt),
        type: mapNotificationType(notif.notificationType),
        isRead: notif.isRead,
      }));
      
      setNotifications(mappedNotifications);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      // Keep existing notifications on error
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await mainService.getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (error: any) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  // Fetch notifications on mount and when modal opens
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Refresh when modal opens
  useEffect(() => {
    console.log("🔔 showNotificationModal changed to:", showNotificationModal);
    if (showNotificationModal) {
      console.log("🔔 Fetching notifications and unread count...");
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [showNotificationModal, fetchNotifications, fetchUnreadCount]);

  const handleModulePress = (module: ServiceModule) => {
    if (module.id === "app-info") {
      // Hiển thị footer thay vì navigate
      setShowAppInfoModal(true);
    } else if (module.id === "add-elderly") {
      // Mở modal thay vì navigate
      setShowAddElderlyModal(true);
    } else if (module.route) {
      router.push(module.route as any);
    } else {
      Alert.alert(
        module.title,
        `Tính năng "${module.title}" sẽ sớm được phát triển!`,
        [{ text: "OK" }]
      );
    }
  };

  const handleProfilePress = () => {
    setShowProfileModal(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowProfileModal(false);
    });
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Simulate logout process
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setShowProfileModal(false);
      setShowLogoutModal(false);
      logout();
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header - giống Careseeker */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.avatarButton}
              onPress={handleProfilePress}
            >
              <View style={styles.userAvatar}>
                <Ionicons name="person" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <View style={styles.greetingContainer}>
              <ThemedText style={styles.greeting}>Xin chào!</ThemedText>
              <ThemedText style={styles.userName}>
                {user?.name || user?.email?.split("@")[0] || "Caregiver"}
              </ThemedText>
            </View>
          </View>
          
          {/* Chat & Notification buttons */}
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => router.push('/caregiver/chat-list' as any)}
            >
              <Ionicons name="chatbubble-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => {
                console.log("🔔 Notification icon pressed, unreadCount:", unreadCount);
                console.log("🔔 Current showNotificationModal:", showNotificationModal);
                setShowNotificationModal(true);
                console.log("🔔 After setShowNotificationModal(true)");
              }}
            >
              <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <ThemedText style={styles.badgeText}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </ThemedText>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Service Modules Grid */}
        <View style={styles.modulesContainer}>
          {/* Emergency Alert - Hiển thị khi được trigger */}
          <EmergencyAlert
            alert={emergencyAlert}
            visible={emergencyAlertVisible}
            onDismiss={hideEmergencyAlert}
          />

          {/* Chỉ hiển thị các component khác khi KHÔNG có emergency alert */}
          {!emergencyAlertVisible && (
            <>
              {/* Find Caregiver Section */}
              <View style={styles.findCaregiverSection}>
                <LinearGradient
                  colors={["#4ECDC4", "#27AE60"]}
                  style={styles.findCaregiverCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <View style={styles.findCaregiverContent}>
                    <ThemedText style={styles.findCaregiverTitle}>
                      Cần tìm người chăm sóc?
                    </ThemedText>
                    <ThemedText style={styles.findCaregiverDescription}>
                      Chúng tôi sẽ giúp bạn tìm được người phù hợp nhất
                    </ThemedText>
                    <TouchableOpacity
                      style={styles.findNowButton}
                      onPress={() => router.push("/caregiver-search")}
                      activeOpacity={0.8}
                    >
                      <ThemedText style={styles.findNowButtonText}>
                        Tìm ngay
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>

              {/* Request Notification */}
              <View style={styles.requestNotificationContainer}>
                <RequestNotification
                  requestCount={requestCount}
                  visible={showRequestNotification}
                />
              </View>

              {/* Appointment Schedule */}
              <View style={styles.appointmentContainer}>
                <AppointmentScheduleToday appointments={appointments} />
              </View>

              {/* Elderly Profiles */}
              <View style={styles.elderlyProfilesContainer}>
                <ElderlyProfiles profiles={elderlyProfiles} />
              </View>

              {/* Các tính năng khác */}
              <View style={styles.otherFeaturesSection}>
                <ThemedText style={styles.otherFeaturesTitle}>
                  Các tính năng khác
                </ThemedText>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.featuresScrollView}
                  contentContainerStyle={styles.featuresScrollContent}
                >
                  {otherFeatures.map((feature, index) => (
                    <TouchableOpacity
                      key={feature.id}
                      style={styles.featureCardLarge}
                      onPress={() => handleModulePress(feature)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.featureImageContainer}>
                        <Ionicons
                          name={feature.icon as any}
                          size={28}
                          color={feature.color}
                        />
                      </View>
                      <ThemedText style={styles.featureTitleLarge}>
                        {feature.title}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </>
          )}
        </View>

        {/* Footer đã được chuyển vào App Info Modal */}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* App Info Modal */}
      <Modal
        visible={showAppInfoModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAppInfoModal(false)}
      >
        <View style={styles.appInfoModalContainer}>
          <View style={styles.appInfoModalHeader}>
            <TouchableOpacity
              style={styles.appInfoCloseButton}
              onPress={() => setShowAppInfoModal(false)}
            >
              <Ionicons name="close" size={24} color="#6C757D" />
            </TouchableOpacity>
            <ThemedText style={styles.appInfoModalTitle}>
              Thông tin ứng dụng
            </ThemedText>
            <View style={styles.appInfoPlaceholder} />
          </View>

          <ScrollView style={styles.appInfoModalContent}>
            {/* App Info */}
            <View style={styles.appInfoSection}>
              <View style={styles.appInfoLogo}>
                <Ionicons name="heart" size={32} color="#4ECDC4" />
              </View>
              <ThemedText style={styles.appInfoTitle}>
                Elder Care Connect
              </ThemedText>
              <ThemedText style={styles.appInfoTagline}>
                Chăm sóc tận tâm, công nghệ hiện đại
              </ThemedText>
            </View>

            {/* Quick Stats */}
            <View style={styles.appInfoStatsSection}>
              <View style={styles.appInfoStatItem}>
                <Ionicons name="people" size={24} color="#4ECDC4" />
                <ThemedText style={styles.appInfoStatNumber}>1000+</ThemedText>
                <ThemedText style={styles.appInfoStatLabel}>
                  Người chăm sóc
                </ThemedText>
              </View>
              <View style={styles.appInfoStatItem}>
                <Ionicons name="home" size={24} color="#4ECDC4" />
                <ThemedText style={styles.appInfoStatNumber}>500+</ThemedText>
                <ThemedText style={styles.appInfoStatLabel}>
                  Gia đình
                </ThemedText>
              </View>
              <View style={styles.appInfoStatItem}>
                <Ionicons name="star" size={24} color="#4ECDC4" />
                <ThemedText style={styles.appInfoStatNumber}>4.9</ThemedText>
                <ThemedText style={styles.appInfoStatLabel}>
                  Đánh giá
                </ThemedText>
              </View>
            </View>

            {/* Contact Info */}
            <View style={styles.appInfoContactSection}>
              <ThemedText style={styles.appInfoSectionTitle}>
                Thông tin liên hệ
              </ThemedText>
              <View style={styles.appInfoContactItem}>
                <Ionicons name="call" size={20} color="#6C757D" />
                <ThemedText style={styles.appInfoContactText}>
                  Hotline: 1900-1234
                </ThemedText>
              </View>
              <View style={styles.appInfoContactItem}>
                <Ionicons name="mail" size={20} color="#6C757D" />
                <ThemedText style={styles.appInfoContactText}>
                  support@eldercare.com
                </ThemedText>
              </View>
              <View style={styles.appInfoContactItem}>
                <Ionicons name="location" size={20} color="#6C757D" />
                <ThemedText style={styles.appInfoContactText}>
                  123 Đường ABC, Quận 1, TP.HCM
                </ThemedText>
              </View>
            </View>

            {/* Bottom Links */}
            <View style={styles.appInfoLinksSection}>
              <ThemedText style={styles.appInfoCopyright}>
                © 2024 Elder Care Connect. Tất cả quyền được bảo lưu.
              </ThemedText>
              <View style={styles.appInfoLinks}>
                <ThemedText style={styles.appInfoLink}>
                  Điều khoản sử dụng
                </ThemedText>
                <ThemedText style={styles.appInfoLink}>
                  Chính sách bảo mật
                </ThemedText>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Profile Modal */}
      <Modal
        visible={showProfileModal}
        transparent={true}
        animationType="none"
        onRequestClose={handleCloseModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseModal}
        >
          <Animated.View
            style={[
              styles.modalContent,
              { opacity: fadeAnim, transform: [{ scale: fadeAnim }] },
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.modalHeader}>
                <View style={styles.modalAvatar}>
                  <Ionicons name="person" size={40} color="#4ECDC4" />
                </View>
                <ThemedText style={styles.modalName}>
                  {user?.name || "Người dùng"}
                </ThemedText>
                <ThemedText style={styles.modalEmail}>{user?.email}</ThemedText>
              </View>

              <View style={styles.modalInfo}>
                <View style={styles.infoRow}>
                  <Ionicons name="call" size={20} color="#6c757d" />
                  <ThemedText style={styles.infoText}>
                    {user?.phone || "Chưa cập nhật"}
                  </ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="location" size={20} color="#6c757d" />
                  <ThemedText style={styles.infoText}>
                    {user?.address || "Chưa cập nhật"}
                  </ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="calendar" size={20} color="#6c757d" />
                  <ThemedText style={styles.infoText}>
                    {user?.dateOfBirth || "Chưa cập nhật"}
                  </ThemedText>
                </View>
              </View>

              <TouchableOpacity
                style={styles.logoutButtonModal}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={20} color="white" />
                <ThemedText style={styles.logoutButtonText}>
                  Đăng xuất
                </ThemedText>
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* Notification Dropdown */}
      <Modal
        visible={showNotificationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          console.log("🔔 Modal onRequestClose called");
          setShowNotificationModal(false);
        }}
      >
        <TouchableOpacity
          style={styles.notificationOverlay}
          activeOpacity={1}
          onPress={() => {
            console.log("🔔 Overlay pressed, closing modal");
            setShowNotificationModal(false);
          }}
        >
          <View 
            style={styles.notificationDropdown}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <View style={styles.notificationArrow} />
            <NotificationPanel
              notifications={notifications}
              onNotificationPress={async (notification) => {
                console.log("Notification pressed:", notification);
                // Mark as read when pressed
                const notif = notification as any;
                const notifId = notif.notificationId || notification.id;
                if (notifId && !notification.isRead) {
                  try {
                    await mainService.markNotificationAsRead(notifId);
                    setNotifications((prev) =>
                      prev.map((notif) =>
                        notif.id === notification.id
                          ? { ...notif, isRead: true }
                          : notif
                      )
                    );
                    setUnreadCount((prev) => Math.max(0, prev - 1));
                  } catch (error: any) {
                    console.error('Error marking notification as read:', error);
                  }
                }
              }}
              onMarkAsRead={async (notificationId) => {
                // Find notification by id (could be notificationId or id)
                const notification = notifications.find(n => {
                  const notif = n as any;
                  return n.id === notificationId || notif.notificationId === notificationId;
                });
                const notif = notification as any;
                const notifId = notif?.notificationId || notification?.id;
                if (notifId && notification && !notification.isRead) {
                  try {
                    await mainService.markNotificationAsRead(notifId);
                    setNotifications((prev) =>
                      prev.map((n) => {
                        const nAny = n as any;
                        if (n.id === notificationId || nAny.notificationId === notificationId) {
                          return { ...n, isRead: true };
                        }
                        return n;
                      })
                    );
                    setUnreadCount((prev) => Math.max(0, prev - 1));
                  } catch (error: any) {
                    console.error('Error marking notification as read:', error);
                  }
                }
              }}
              onMarkAllAsRead={async () => {
                try {
                  await mainService.markAllNotificationsAsRead();
                  setNotifications((prev) =>
                    prev.map((notif) => ({ ...notif, isRead: true }))
                  );
                  setUnreadCount(0);
                } catch (error: any) {
                  console.error('Error marking all notifications as read:', error);
                }
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Elderly Modal */}
      <AddElderlyModal
        visible={showAddElderlyModal}
        onClose={() => setShowAddElderlyModal(false)}
        onSuccess={() => {
          // Refresh elderly profiles or show success message
          console.log("Elderly profile created successfully");
        }}
      />

      {/* Logout Confirmation Modal */}
      <CustomModal
        visible={showLogoutModal}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?"
        buttonText={isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
        onPress={handleConfirmLogout}
        iconName="log-out-outline"
        iconColor="#E74C3C"
        buttonColors={["#E74C3C", "#C0392B"]}
        isLoading={isLoggingOut}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingBottom: 100, // Space for navigation bar
  },
  // Header - giống Careseeker
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
  // Old header styles - removed
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  notificationButton: {
    padding: 8,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -2,
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
    paddingHorizontal: 6,
  },
  content: {
    flex: 1,
  },
  modulesContainer: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  modulesGrid: {
    flexDirection: "column",
    gap: 20,
  },
  singleModuleContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  findCaregiverSection: {
    marginHorizontal: 8,
    marginTop: 20,
    marginBottom: 32,
  },
  findCaregiverCard: {
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  findCaregiverContent: {
    alignItems: "flex-start",
  },
  findCaregiverTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 6,
  },
  findCaregiverDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
    marginBottom: 16,
  },
  findNowButton: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  findNowButtonText: {
    color: "#4ECDC4",
    fontSize: 16,
    fontWeight: "600",
  },
  regularModulesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
  },
  moduleCard: {
    borderRadius: 16,
    padding: 16,
    minHeight: 110,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  moduleContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  moduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginVertical: 8,
  },
  moduleIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
    flex: 1,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  moduleDescriptionContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  moduleDescription: {
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 15,
    textAlign: "left",
    fontWeight: "400",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  footer: {
    backgroundColor: "#2c3e50",
    paddingHorizontal: 20,
    paddingVertical: 40,
    marginTop: 20,
  },
  footerContent: {
    alignItems: "center",
  },
  footerHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  appLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(78, 205, 196, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  footerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  footerTagline: {
    fontSize: 14,
    color: "#bdc3c7",
    textAlign: "center",
    lineHeight: 20,
  },
  footerStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 30,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  footerStatItem: {
    alignItems: "center",
    flex: 1,
  },
  footerStatNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginTop: 8,
    marginBottom: 4,
  },
  footerStatLabel: {
    fontSize: 12,
    color: "#bdc3c7",
    textAlign: "center",
  },
  footerContact: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 25,
    gap: 30,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: "#bdc3c7",
  },
  footerBottom: {
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    paddingTop: 20,
  },
  copyrightText: {
    fontSize: 12,
    color: "#95a5a6",
    textAlign: "center",
    marginBottom: 12,
  },
  footerLinks: {
    flexDirection: "row",
    gap: 20,
  },
  footerLink: {
    fontSize: 12,
    color: "#4ECDC4",
    textDecorationLine: "underline",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 300,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#4ECDC4",
  },
  modalName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  modalEmail: {
    fontSize: 14,
    color: "#6c757d",
  },
  modalInfo: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#2c3e50",
    flex: 1,
  },
  logoutButtonModal: {
    backgroundColor: "#e74c3c",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  bottomSpacing: {
    height: 20,
  },
  // Container styles for better spacing
  requestNotificationContainer: {
    marginBottom: 24,
  },
  appointmentContainer: {
    marginBottom: 24,
  },
  elderlyProfilesContainer: {
    marginBottom: 24,
  },
  // Other Features Styles
  otherFeaturesSection: {
    marginTop: 32,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  otherFeaturesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 16,
  },
  featuresScrollView: {
    marginTop: 16,
  },
  featuresScrollContent: {
    paddingHorizontal: 4,
  },
  featureCardLarge: {
    width: 120,
    height: 140,
    backgroundColor: "white",
    borderRadius: 12,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  featureImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  featureTitleLarge: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    textAlign: "center",
  },
  notificationOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 100,
    paddingRight: 20,
  },
  notificationDropdown: {
    width: width * 0.75,
    maxHeight: "80%",
    backgroundColor: "transparent",
  },
  notificationArrow: {
    position: "absolute",
    top: -8,
    right: 12,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "white",
    zIndex: 1002,
  },
  // Service Banner Styles
  serviceBannerContainer: {
    width: "100%",
    marginBottom: 20,
  },
  serviceBanner: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 140,
  },
  bannerImageContainer: {
    marginRight: 20,
  },
  bannerImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#4ECDC4",
  },
  bannerContent: {
    flex: 1,
    justifyContent: "center",
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
    lineHeight: 24,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 16,
    lineHeight: 20,
  },
  // Duplicate styles - removed
  // findNowButton: {
  //   backgroundColor: '#4ECDC4',
  //   borderRadius: 12,
  //   paddingVertical: 12,
  //   paddingHorizontal: 20,
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   alignSelf: 'flex-start',
  //   elevation: 2,
  //   shadowColor: '#4ECDC4',
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.3,
  //   shadowRadius: 4,
  // },
  // findNowButtonText: {
  //   color: 'white',
  //   fontSize: 16,
  //   fontWeight: '600',
  //   marginRight: 8,
  // },
  // App Info Modal Styles
  appInfoModalContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  appInfoModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#4ECDC4",
  },
  appInfoCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  appInfoModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  appInfoPlaceholder: {
    width: 40,
  },
  appInfoModalContent: {
    flex: 1,
    padding: 20,
  },
  appInfoSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  appInfoLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4ECDC4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  appInfoTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 8,
  },
  appInfoTagline: {
    fontSize: 16,
    color: "#6C757D",
    textAlign: "center",
  },
  appInfoStatsSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
  },
  appInfoStatItem: {
    alignItems: "center",
    flex: 1,
  },
  appInfoStatNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    marginTop: 8,
  },
  appInfoStatLabel: {
    fontSize: 12,
    color: "#6C757D",
    marginTop: 4,
    textAlign: "center",
  },
  appInfoContactSection: {
    marginBottom: 30,
  },
  appInfoSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 16,
  },
  appInfoContactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  appInfoContactText: {
    fontSize: 14,
    color: "#6C757D",
    marginLeft: 12,
  },
  appInfoLinksSection: {
    alignItems: "center",
  },
  appInfoCopyright: {
    fontSize: 12,
    color: "#6C757D",
    textAlign: "center",
    marginBottom: 16,
  },
  appInfoLinks: {
    flexDirection: "row",
    gap: 20,
  },
  appInfoLink: {
    fontSize: 12,
    color: "#4ECDC4",
    textDecorationLine: "underline",
  },
});
