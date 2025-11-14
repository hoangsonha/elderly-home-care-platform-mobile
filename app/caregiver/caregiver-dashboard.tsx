import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { getAppointmentStatus, subscribeToStatusChanges } from "@/data/appointmentStore";
import { useAppointments } from "@/hooks/useDatabaseEntities";
import * as ElderlyRepository from "@/services/elderly.repository";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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

// Parse Vietnamese date format "T5, 13 Thg 11 2025" to "YYYY-MM-DD"
const parseVietnameseDate = (dateStr: string): string | null => {
  if (!dateStr) return null;
  
  // Match pattern: "T5, 13 Thg 11 2025" or "CN, 16 Thg 11 2025"
  const match = dateStr.match(/(\d{1,2})\s+Thg\s+(\d{1,2})\s+(\d{4})/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    const year = match[3];
    return `${year}-${month}-${day}`;
  }
  
  // If already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  return null;
};

export default function CaregiverDashboardScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { appointments, loading, error, refresh } = useAppointments(user?.id || '', user?.role);
  const [refreshKey, setRefreshKey] = useState(0);
  const [elderlyNames, setElderlyNames] = useState<{ [key: string]: string }>({});

  // Load elderly names for appointments
  useEffect(() => {
    const loadElderlyNames = async () => {
      const names: { [key: string]: string } = {};
      for (const apt of appointments) {
        if (apt.elderly_profile_id && !names[apt.elderly_profile_id]) {
          try {
            const elderly = await ElderlyRepository.getElderlyProfileById(apt.elderly_profile_id);
            if (elderly) {
              names[apt.elderly_profile_id] = elderly.name;
            }
          } catch (err) {
            console.error('Error loading elderly profile:', err);
          }
        }
      }
      setElderlyNames(names);
    };

    if (appointments.length > 0) {
      loadElderlyNames();
    }
  }, [appointments]);

  // Refresh appointments when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        refresh();
      }
    }, [user?.id, refresh])
  );

  // Subscribe to status changes
  useEffect(() => {
    const unsubscribe = subscribeToStatusChanges(() => {
      setRefreshKey(prev => prev + 1);
    });
    return () => unsubscribe();
  }, []);

  // Get today's appointments (only confirmed or in-progress)
  const today = new Date();
  // Use local date, not UTC
  const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  console.log('🔍 DEBUG Dashboard:');
  console.log('  Today date:', todayDateString);
  console.log('  Total appointments:', appointments.length);
  console.log('  User ID:', user?.id);
  console.log('  User role:', user?.role);
  
  appointments.forEach((apt, index) => {
    const globalStatus = getAppointmentStatus(apt.id);
    const parsedDate = parseVietnameseDate(apt.start_date);
    console.log(`  [${index}] ID: ${apt.id}`);
    console.log(`      Date: ${apt.start_date}`);
    console.log(`      Parsed Date: ${parsedDate}`);
    console.log(`      DB Status: ${apt.status}`);
    console.log(`      Global Status: ${globalStatus}`);
    console.log(`      Match today: ${parsedDate === todayDateString}`);
  });
  
  const todayAppointments = appointments.filter(apt => {
    // Check global store status first
    const globalStatus = getAppointmentStatus(apt.id);
    const currentStatus = globalStatus || apt.status;
    
    // Parse Vietnamese date format to YYYY-MM-DD
    const parsedDate = parseVietnameseDate(apt.start_date);
    
    // Check if appointment is for today
    const isToday = parsedDate === todayDateString;
    
    // Check if appointment is accepted (confirmed, pending, or in-progress)
    // 'pending' here means it's been confirmed/accepted and waiting to start
    // 'new' means not yet accepted by caregiver
    const isAccepted = currentStatus === 'confirmed' || currentStatus === 'in-progress' || currentStatus === 'pending';
    
    console.log(`  Filter result for ${apt.id}: isToday=${isToday}, isAccepted=${isAccepted}, currentStatus=${currentStatus}`);
    
    return isToday && isAccepted;
  });
  
  console.log('  ✅ Final today appointments count:', todayAppointments.length);

  // Count new requests (appointments with status 'new' or 'pending')
  const newRequestsCount = appointments.filter(apt => {
    const globalStatus = getAppointmentStatus(apt.id);
    const currentStatus = globalStatus || apt.status;
    return currentStatus === 'pending' || currentStatus === 'new';
  }).length;

  // Check profile status and navigate accordingly
  useFocusEffect(
    useCallback(() => {
      if (user && user.role === "Caregiver") {
        console.log('🔍 Dashboard check - user.hasCompletedProfile:', user.hasCompletedProfile);
        // Small delay to ensure navigation is ready
        setTimeout(() => {
          // Check if profile has been submitted (exists in profileStore)
          const { getProfileStatus, hasProfile } = require("@/data/profileStore");
          const hasProfileInStore = hasProfile(user.id);
          const profileStatus = getProfileStatus(user.id);
          
          // Check status from API (user.status) or profileStore
          const currentStatus = user.status || profileStatus.status;
          
          console.log('🔍 Dashboard check - hasProfileInStore:', hasProfileInStore, 'currentStatus:', currentStatus);
          
          // If no profile submitted yet and user hasn't completed profile, navigate to complete profile
          if (!hasProfileInStore && !user.hasCompletedProfile) {
            console.log('➡️ Dashboard redirecting to complete-profile');
            navigation.navigate("Hoàn thiện hồ sơ", {
              email: user.email,
              fullName: user.name || "",
            });
            return;
          }

          // If profile is approved (from API or profileStore), stay on dashboard
          if (currentStatus === "approved") {
            console.log('✅ Profile approved, staying on dashboard');
            return; // Stay on dashboard
          }

          // If profile is pending or rejected, navigate to status screen
          if (currentStatus === "pending" || currentStatus === "rejected") {
            console.log('⏳ Profile pending/rejected, navigating to status screen');
            navigation.navigate("Trạng thái hồ sơ");
            return;
          }
        }, 100); // Reduced timeout for faster response
      }
    }, [user, navigation])
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2DC2D7" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
        <CaregiverBottomNav />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Lỗi: {error.message}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
        <CaregiverBottomNav />
      </View>
    );
  }

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
              <Text style={styles.userName}>{user?.name || 'Người dùng'}</Text>
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
        

        {/* New Requests Alert - Only show if there are new requests */}
        {newRequestsCount > 0 && (
          <TouchableOpacity 
            style={styles.alertCard}
            onPress={() => navigation.navigate("Yêu cầu dịch vụ", { initialTab: "Mới" })}
          >
            <View style={styles.alertIconContainer}>
              <Text style={styles.alertIcon}>🔔</Text>
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>{newRequestsCount} yêu cầu mới</Text>
              <Text style={styles.alertSubtitle}>Hãy phản hồi để nhận việc</Text>
            </View>
            <Text style={styles.alertArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* Today's Schedule */}
      <View style={styles.scheduleCard}>
        <View style={styles.scheduleHeader}>
          <Text style={styles.scheduleTitle}>Lịch hôm nay</Text>
        </View>

        {todayAppointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có lịch hẹn nào hôm nay</Text>
          </View>
        ) : (
          todayAppointments.map((appointment: any) => {
            // Get status from global store first, fallback to database status
            const globalStatus = getAppointmentStatus(appointment.id);
            const currentStatus = globalStatus || appointment.status;
            const statusInfo = mapStatusToDashboard(currentStatus);
            
            return (
              <TouchableOpacity 
                key={appointment.id} 
                style={styles.appointmentCard}
                onPress={() => navigation.navigate("Appointment Detail", { appointmentId: appointment.id, fromScreen: "dashboard" })}
                activeOpacity={0.7}
              >
                <View style={styles.appointmentHeader}>
                  <View style={styles.appointmentInfo}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarEmoji}>👤</Text>
                    </View>
                    <View style={styles.appointmentDetails}>
                      <Text style={styles.appointmentName}>
                        {elderlyNames[appointment.elderly_profile_id] || 'Đang tải...'}
                      </Text>
                      <Text style={styles.appointmentMeta}>
                        {appointment.package_type || 'Gói cơ bản'}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                    <Text style={styles.statusBadgeText}>{statusInfo.text}</Text>
                  </View>
                </View>

                <View style={styles.appointmentFooter}>
                  <View style={styles.appointmentTimeLocation}>
                    <View style={styles.timeRow}>
                      <Text style={styles.timeIcon}>🕐</Text>
                      <Text style={styles.timeText}>{appointment.start_time} - {appointment.end_time}</Text>
                    </View>
                    <View style={styles.locationRow}>
                      <Text style={styles.locationIcon}>📍</Text>
                      <Text style={styles.locationText}>{appointment.work_location || 'Chưa có địa chỉ'}</Text>
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
                        clientId: appointment.user_id,
                        fromScreen: "dashboard"
                      })}
                    >
                      <Text style={styles.contactButtonText}>Liên hệ</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
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

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#2DC2D7',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
