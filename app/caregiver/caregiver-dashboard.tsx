import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { getAppointmentStatus, subscribeToStatusChanges } from "@/data/appointmentStore";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");
const CARD_PADDING = 16; // paddingHorizontal của statsOuterContainer
const CARD_GAP = 12; // gap giữa các card
const CARD_WIDTH = (screenWidth - CARD_PADDING * 2 - CARD_GAP) / 2;

const initialTodayAppointments = [
  {
    id: "1",
    client: "Bà Nguyễn Thị Lan",
    age: 75,
    type: "Gói Cao Cấp",
    time: "08:00 - 16:00",
    address: "123 Nguyễn Văn Linh, Q7",
    status: "Đang thực hiện",
    statusColor: "#8B5CF6",
    avatar: "👵",
  },
];

// Map appointment status to dashboard status display
const mapStatusToDashboard = (status: string | undefined) => {
  switch (status) {
    case "new":
      return { text: "Yêu cầu mới", color: "#3B82F6" };
    case "pending":
      return { text: "Chờ thực hiện", color: "#F59E0B" };
    case "confirmed":
      return { text: "Đã xác nhận", color: "#10B981" };
    case "in-progress":
      return { text: "Đang thực hiện", color: "#8B5CF6" };
    case "completed":
      return { text: "Hoàn thành", color: "#6B7280" };
    case "cancelled":
      return { text: "Đã hủy", color: "#EF4444" };
    case "rejected":
      return { text: "Đã từ chối", color: "#DC2626" };
    default:
      return { text: "Đang thực hiện", color: "#8B5CF6" };
  }
};

const caregiverStats = {
  totalJobs: 12,
  monthlyIncome: 8.5,
  rating: 4.9,
  completionRate: 80,
  satisfactionRate: 95,
};

export default function CaregiverDashboardScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [todayAppointments, setTodayAppointments] = useState(initialTodayAppointments);
  const [, setRefreshKey] = useState(0); // For triggering re-render when status changes

  // Check profile status and navigate accordingly
  useFocusEffect(
    useCallback(() => {
      if (user && user.role === "Caregiver") {
        // Small delay to ensure navigation is ready
        setTimeout(() => {
          // Check if profile has been submitted (exists in profileStore)
          const { getProfileStatus, hasProfile } = require("@/data/profileStore");
          const hasProfileInStore = hasProfile(user.id);
          const profileStatus = getProfileStatus(user.id);
          
          // Check status from API (user.status) or profileStore
          const currentStatus = user.status || profileStatus.status;
          
          // If profile is approved (from API or profileStore), stay on dashboard
          if (currentStatus === "approved") {
            return; // Stay on dashboard
          }
          
          // If profile is pending or rejected, navigate to status screen
          if (currentStatus === "pending" || currentStatus === "rejected") {
            navigation.navigate("Trạng thái hồ sơ");
            return;
          }
          
          // If no profile submitted yet and user hasn't completed profile, navigate to complete profile
          if (!hasProfileInStore && !user.hasCompletedProfile) {
            navigation.navigate("Hoàn thiện hồ sơ", {
              email: user.email,
              fullName: user.name || "",
            });
          }
        }, 500);
      }
    }, [user, navigation])
  );

  // Subscribe to status changes from global store
  useEffect(() => {
    const unsubscribe = subscribeToStatusChanges(() => {
      // Update appointments with real-time status when status changes
      setTodayAppointments(
        initialTodayAppointments.map((appointment) => {
          const globalStatus = getAppointmentStatus(appointment.id);
          const statusInfo = mapStatusToDashboard(globalStatus || "in-progress");
          return {
            ...appointment,
            status: statusInfo.text,
            statusColor: statusInfo.color,
          };
        })
      );
      // Trigger re-render
      setRefreshKey(prev => prev + 1);
    });
    
    // Initial update
    setTodayAppointments(
      initialTodayAppointments.map((appointment) => {
        const globalStatus = getAppointmentStatus(appointment.id);
        const statusInfo = mapStatusToDashboard(globalStatus || "in-progress");
        return {
          ...appointment,
          status: statusInfo.text,
          statusColor: statusInfo.color,
        };
      })
    );
    
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerWrapper}>
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.greeting}>Xin chào</Text>
              <Text style={styles.userName}>Trần Văn Nam</Text>
            </View>
            <View style={styles.headerIconsContainer}>
              <TouchableOpacity 
                style={styles.headerIcon}
                onPress={() => navigation.navigate("Danh sách tin nhắn")}
              >
                <Ionicons name="chatbubble-outline" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerIcon}
                onPress={() => {/* Navigate to notifications */}}
              >
                <Ionicons name="notifications-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        

        {/* New Requests Alert */}
        <TouchableOpacity 
          style={styles.alertCard}
          onPress={() => navigation.navigate("Yêu cầu dịch vụ", { initialTab: "Mới" })}
        >
        <View style={styles.alertIconContainer}>
          <Text style={styles.alertIcon}>🔔</Text>
        </View>
        <View style={styles.alertContent}>
          <Text style={styles.alertTitle}>3 yêu cầu mới</Text>
          <Text style={styles.alertSubtitle}>Hãy phản hồi để nhận việc</Text>
        </View>
        <Text style={styles.alertArrow}>›</Text>
      </TouchableOpacity>

      {/* Today's Schedule */}
      <View style={styles.scheduleCard}>
        <View style={styles.scheduleHeader}>
          <Text style={styles.scheduleTitle}>Lịch hôm nay</Text>
        </View>

        {todayAppointments.map((appointment) => (
          <TouchableOpacity 
            key={appointment.id} 
            style={styles.appointmentCard}
            onPress={() => navigation.navigate("Appointment Detail", { appointmentId: appointment.id, fromScreen: "dashboard" })}
            activeOpacity={0.7}
          >
            <View style={styles.appointmentHeader}>
              <View style={styles.appointmentInfo}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarEmoji}>{appointment.avatar}</Text>
                </View>
                <View style={styles.appointmentDetails}>
                  <Text style={styles.appointmentName}>
                    {appointment.client}
                  </Text>
                  <Text style={styles.appointmentMeta}>
                    {appointment.age} tuổi • {appointment.type}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.appointmentFooter}>
              <View style={styles.appointmentTimeLocation}>
                <View style={styles.timeRow}>
                  <Text style={styles.timeIcon}>🕐</Text>
                  <Text style={styles.timeText}>{appointment.time}</Text>
                </View>
                <View style={styles.locationRow}>
                  <Text style={styles.locationIcon}>📍</Text>
                  <Text style={styles.locationText}>{appointment.address}</Text>
                </View>
              </View>

              <View style={styles.appointmentActions}>
                <TouchableOpacity 
                  style={styles.detailButton}
                  onPress={() => navigation.navigate("Appointment Detail", { appointmentId: appointment.id, fromScreen: "dashboard" })}
                >
                  <Text style={styles.detailButtonText}>Xem chi tiết</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.contactButton}
                  onPress={() => navigation.navigate("Tin nhắn", { 
                    clientName: appointment.client,
                    clientAvatar: appointment.avatar,
                    fromScreen: "dashboard"
                  })}
                >
                  <Text style={styles.contactButtonText}>Liên hệ</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsOuterContainer}>
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: "#E3F2FD" }]}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>📄</Text>
              </View>
              <Text style={styles.statValue}>{caregiverStats.totalJobs}</Text>
              <Text style={styles.statLabel}>Lịch hẹn tháng này</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: "#E8F5E9" }]}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>💰</Text>
              </View>
              <Text style={styles.statValue}>{caregiverStats.monthlyIncome}M</Text>
              <Text style={styles.statLabel}>Thu nhập tháng</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: "#FFF3E0" }]}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>⭐</Text>
              </View>
              <Text style={styles.statValue}>{caregiverStats.rating}</Text>
              <Text style={styles.statLabel}>Đánh giá tổng</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: "#EDE7F6" }]}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>✅</Text>
              </View>
              <Text style={styles.statValue}>{caregiverStats.completionRate}%</Text>
              <Text style={styles.statLabel}>Tỷ lệ hoàn thành nhiệm vụ</Text>
            </View>
          </View>
        </View>
      </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <CaregiverBottomNav activeTab="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  scrollContainer: {
    flex: 1,
  },

  // Header wrapper
  headerWrapper: {
    backgroundColor: "#7CBCFF",
    paddingBottom: 20,
  },

  // Header styles
  header: {
    backgroundColor: "transparent",
    padding: 20,
    paddingTop: 50,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerTextContainer: {
    flex: 1,
  },
  greeting: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 4,
  },
  userName: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },
  headerIconsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerIcon: {
    padding: 4,
  },

  // Stats outer container
  statsOuterContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },

  // Statistics styles
  statsContainer: {
    paddingTop: 0,
    paddingHorizontal: 0,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 12,
  },
  statCard: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    minHeight: 140,
    justifyContent: "center",
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },

  // Alert card styles
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFE0B2",
  },
  alertIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FF9800",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  alertIcon: {
    fontSize: 24,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  alertSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  alertArrow: {
    fontSize: 24,
    color: "#FF9800",
    fontWeight: "700",
  },

  // Schedule card styles
  scheduleCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
    borderRadius: 16,
  },
  scheduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  scheduleLink: {
    fontSize: 14,
    color: "#4A90E2",
    fontWeight: "600",
  },

  // Appointment card styles
  appointmentCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  appointmentInfo: {
    flexDirection: "row",
    flex: 1,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 28,
  },
  appointmentDetails: {
    flex: 1,
  },
  appointmentName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  appointmentMeta: {
    fontSize: 13,
    color: "#6B7280",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  appointmentFooter: {
    marginTop: 12,
  },
  appointmentTimeLocation: {
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  timeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  timeText: {
    fontSize: 14,
    color: "#374151",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  locationText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  appointmentActions: {
    flexDirection: "row",
    gap: 8,
  },
  detailButton: {
    flex: 1,
    backgroundColor: "#4A90E2",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  detailButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  contactButton: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  contactButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },
});
