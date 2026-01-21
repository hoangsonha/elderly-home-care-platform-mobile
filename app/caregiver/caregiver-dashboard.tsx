import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { NotificationPanel } from "@/components/ui/NotificationPanel";
import { useAuth } from "@/contexts/AuthContext";
import { getAppointmentStatus, subscribeToStatusChanges } from "@/data/appointmentStore";
// TODO: Replace with API calls
// import { useAppointments } from "@/hooks/useDatabaseEntities";
// import * as ElderlyRepository from "@/services/elderly.repository";
import { useBottomNavPadding } from "@/hooks/useBottomNavPadding";
import { useNewMessages } from "@/hooks/useNewMessages";
import { mainService, type MyCareServiceData } from "@/services/main.service";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
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

// Map appointment status to dashboard status display
const mapStatusToDashboard = (status: string | undefined) => {
  if (!status) return { text: "Không xác định", color: "#9CA3AF" };
  
  // Convert to uppercase for consistent comparison
  const upperStatus = status.toUpperCase().replace(/-/g, '_');
  
  switch (upperStatus) {
    case "NEW":
    case "PENDING_CAREGIVER":
      return { text: "Yêu cầu mới", color: "#3B82F6" };
    case "PENDING":
    case "CAREGIVER_APPROVED":
      return { text: "Chờ thực hiện", color: "#F59E0B" };
    case "CONFIRMED":
      return { text: "Đã xác nhận", color: "#10B981" };
    case "IN_PROGRESS":
    case "IN-PROGRESS":
      return { text: "Đang thực hiện", color: "#8B5CF6" };
    case "COMPLETED":
    case "COMPLETED_WAITING_REVIEW":
      return { text: "Hoàn thành", color: "#6B7280" };
    case "CANCELLED":
      return { text: "Đã hủy", color: "#EF4444" };
    case "REJECTED":
      return { text: "Đã từ chối", color: "#DC2626" };
    case "EXPIRED":
      return { text: "Đã hết hạn", color: "#9CA3AF" };
    default:
      return { text: "Không xác định", color: "#9CA3AF" };
  }
};

// Format earnings to display (VNĐ) - format ngắn gọn nhưng không làm tròn số nguyên
const formatEarnings = (earnings: number): string => {
  if (earnings >= 1000000) {
    const millions = earnings / 1000000;
    // Chỉ hiển thị 1 chữ số thập phân, không làm tròn số nguyên
    return `${millions.toFixed(1)}M`;
  } else if (earnings >= 1000) {
    const thousands = earnings / 1000;
    // Chỉ hiển thị 1 chữ số thập phân, không làm tròn số nguyên
    return `${thousands.toFixed(1)}K`;
  }
  return earnings.toString();
};

// Format completion rate: show integer if whole number, otherwise show decimal
const formatCompletionRate = (rate: number): string => {
  if (rate === 0) return '0';
  // Check if it's a whole number
  if (rate % 1 === 0) {
    return rate.toString();
  }
  // Otherwise, show with decimal
  return rate.toFixed(1);
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
  const bottomNavPadding = useBottomNavPadding();
  
  // All hooks must be called before any conditional returns
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [elderlyNames, setElderlyNames] = useState<{ [key: string]: string }>({});
  const [newRequestsCount, setNewRequestsCount] = useState(0);
  const [loadingNewRequests, setLoadingNewRequests] = useState(true);
  
  // Statistics state
  const [statistics, setStatistics] = useState<{
    totalCareServicesThisMonth: number;
    totalEarningsThisMonth: number;
    overallRating: number;
    taskCompletionRate: number;
  } | null>(null);
  const [loadingStatistics, setLoadingStatistics] = useState(true);
  
  // Notification state
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    time: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'reminder';
    isRead: boolean;
    notificationId?: string;
  }>>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Listen unread messages real-time từ Firestore
  const { unreadCount: chatUnreadCount } = useNewMessages();

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
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

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Refresh when modal opens
  useEffect(() => {
    if (showNotificationModal) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [showNotificationModal, fetchNotifications, fetchUnreadCount]);

  const refresh = useCallback(async () => {
    // Refresh will be called by fetchTodayAppointments
  }, []);

  // Fetch today's appointments from API
  const fetchTodayAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      
      const response = await mainService.getMyCareServices(todayStr);
      
      if (response.status === 'Success' && response.data) {
        // Map API data to appointment format
        const mappedAppointments = response.data.map((service: MyCareServiceData) => {
          // Parse location
          let locationObj = { address: '', latitude: 0, longitude: 0 };
          try {
            if (typeof service.location === 'string') {
              locationObj = JSON.parse(service.location);
            } else {
              locationObj = service.location as any;
            }
          } catch (e) {
            locationObj = {
              address: service.elderlyProfile.location.address,
              latitude: service.elderlyProfile.location.latitude,
              longitude: service.elderlyProfile.location.longitude,
            };
          }

          return {
            id: service.careServiceId,
            elderly_profile_id: service.elderlyProfile.elderlyProfileId,
            start_date: service.workDate,
            start_time: service.startTime,
            package_type: service.servicePackage.packageName,
            status: service.status,
            caregiver_id: service.caregiverProfile.caregiverProfileId,
            total_amount: service.totalPrice,
            work_location: locationObj.address,
            elderlyName: service.elderlyProfile.fullName,
            bookingCode: service.bookingCode,
          };
        });
        setAppointments(mappedAppointments);
      } else {
        setAppointments([]);
      }
    } catch (error: any) {
      setError(error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch new requests count from API
  const fetchNewRequestsCount = useCallback(async () => {
    try {
      setLoadingNewRequests(true);
      const response = await mainService.getMyCareServices(undefined, 'PENDING_CAREGIVER');
      
      if (response.status === 'Success' && response.data) {
        setNewRequestsCount(response.data.length);
      } else {
        setNewRequestsCount(0);
      }
    } catch (error: any) {
      setNewRequestsCount(0);
    } finally {
      setLoadingNewRequests(false);
    }
  }, []);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      setLoadingStatistics(true);
      const response = await mainService.getCaregiverPersonalStatistics();
      if (response.status === 'Success' && response.data) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoadingStatistics(false);
    }
  }, []);

  // Fetch new requests when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchNewRequestsCount();
      fetchTodayAppointments();
      fetchStatistics();
    }, [fetchNewRequestsCount, fetchTodayAppointments, fetchStatistics])
  );

  // Load elderly names for appointments
  useEffect(() => {
    const loadElderlyNames = async () => {
      const names: { [key: string]: string } = {};
      for (const apt of appointments) {
        if (apt.elderly_profile_id && !names[apt.elderly_profile_id]) {
          // Use elderlyName from API response
          names[apt.elderly_profile_id] = apt.elderlyName || 'Người già';
        }
      }
      setElderlyNames(names);
    };

    if (appointments.length > 0) {
      loadElderlyNames();
    }
  }, [appointments]);

  // Refresh appointments when screen is focused
  // Already handled in fetchNewRequestsCount useFocusEffect above

  // Subscribe to status changes
  useEffect(() => {
    const unsubscribe = subscribeToStatusChanges(() => {
      setRefreshKey(prev => prev + 1);
    });
    return () => unsubscribe();
  }, []);

  // Redirect to complete profile if not completed - check after all hooks
  useEffect(() => {
    if (user && (user.role === "Caregiver" || user.role === "ROLE_CAREGIVER") && !user.hasCompletedProfile) {
            navigation.navigate("Hoàn thiện hồ sơ", {
              email: user.email,
        accountId: user.id,
            });
    }
  }, [user?.hasCompletedProfile, navigation, user]);

  // Don't render dashboard if profile not completed
  if (user && (user.role === "Caregiver" || user.role === "ROLE_CAREGIVER") && !user.hasCompletedProfile) {
    return null;
  }

  // Today's appointments already filtered by API (workDate = today)
  // Just display all appointments from state
  const todayAppointments = appointments;

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
        contentContainerStyle={{ 
          paddingBottom: bottomNavPadding
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <TouchableOpacity style={styles.avatarButton} onPress={() => navigation.navigate("Cá nhân")}>
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
                <Text style={styles.userName}>{user?.name || user?.email?.split('@')[0] || 'Người dùng'}</Text>
              </View>
            </View>
            
            {/* Chat & Notification buttons */}
            <View style={styles.headerRight}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => navigation.navigate("Danh sách tin nhắn")}
              >
                <Ionicons name="chatbubble-outline" size={24} color="#FFFFFF" />
                {chatUnreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {chatUnreadCount > 99 ? "99+" : chatUnreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => {
                  setShowNotificationModal(true);
                }}
              >
                <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
        

        {/* New Requests Alert - Always show, even with 0 requests */}
        {loadingNewRequests ? (
          <View style={styles.alertCard}>
            <View style={styles.alertContent}>
              <ActivityIndicator size="large" color="#68C2E8" />
              <Text style={[styles.alertSubtitle, { marginTop: 12, textAlign: 'center' }]}>Đang tải yêu cầu mới...</Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.alertCard}
            onPress={() => navigation.navigate("Yêu cầu dịch vụ", { initialTab: "Mới" })}
            activeOpacity={0.9}
          >
            <View style={styles.alertIconContainer}>
              <Ionicons name="document-text" size={24} color="#FF9800" />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>
                {newRequestsCount} yêu cầu mới
              </Text>
              <Text style={styles.alertSubtitle}>
                {newRequestsCount > 0 ? 'Hãy phản hồi để nhận việc' : 'Chưa có yêu cầu mới'}
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={24} color="#68C2E8" style={styles.alertArrow} />
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
                      <Ionicons name="person" size={24} color="#FFFFFF" />
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
                      <Ionicons name="time-outline" size={18} color="#68C2E8" />
                      <Text style={styles.timeText}>{appointment.start_time}</Text>
                    </View>
                    <View style={styles.locationRow}>
                      <Ionicons name="location-outline" size={18} color="#68C2E8" />
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
            <View style={[styles.statCard, { backgroundColor: "#E8F2FF" }]}>
              <View style={styles.statIconContainer}>
                <Ionicons name="calendar" size={28} color="#4A90E2" />
              </View>
              {loadingStatistics ? (
                <ActivityIndicator size="small" color="#1F2937" style={{ marginVertical: 8 }} />
              ) : (
                <Text style={styles.statValue}>{statistics?.totalCareServicesThisMonth || 0}</Text>
              )}
              <Text style={styles.statLabel}>Lịch hẹn tháng này</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: "#EFFAF3" }]}>
              <View style={styles.statIconContainer}>
                <Ionicons name="cash" size={28} color="#10B981" />
              </View>
              {loadingStatistics ? (
                <ActivityIndicator size="small" color="#1F2937" style={{ marginVertical: 8 }} />
              ) : (
                <Text style={styles.statValue}>
                  {statistics ? formatEarnings(statistics.totalEarningsThisMonth) : '0'}
                </Text>
              )}
              <Text style={styles.statLabel}>Thu nhập tháng</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: "#FFF8E1" }]}>
              <View style={styles.statIconContainer}>
                <Ionicons name="star" size={28} color="#FFA726" />
              </View>
              {loadingStatistics ? (
                <ActivityIndicator size="small" color="#1F2937" style={{ marginVertical: 8 }} />
              ) : (
                <Text style={styles.statValue}>
                  {statistics?.overallRating ? statistics.overallRating.toFixed(1) : '0.0'}
                </Text>
              )}
              <Text style={styles.statLabel}>Đánh giá tổng</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: "#F3E8FF" }]}>
              <View style={styles.statIconContainer}>
                <Ionicons name="checkmark-circle" size={28} color="#9333EA" />
              </View>
              {loadingStatistics ? (
                <ActivityIndicator size="small" color="#1F2937" style={{ marginVertical: 8 }} />
              ) : (
                <Text style={styles.statValue}>
                  {statistics?.taskCompletionRate !== undefined ? formatCompletionRate(statistics.taskCompletionRate) : '0'}%
                </Text>
              )}
              <Text style={styles.statLabel}>Tỷ lệ hoàn thành nhiệm vụ</Text>
            </View>
          </View>
        </View>
      </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <CaregiverBottomNav activeTab="home" />

      {/* Notification Modal */}
      <Modal
        visible={showNotificationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowNotificationModal(false)}
      >
        <TouchableOpacity
          style={styles.notificationOverlay}
          activeOpacity={1}
          onPress={() => setShowNotificationModal(false)}
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
                const notification = notifications.find(n => {
                  const nAny = n as any;
                  return n.id === notificationId || nAny.notificationId === notificationId;
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
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
    position: 'absolute',
    top: 20,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  appointmentFooter: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    paddingTop: 16,
  },
  appointmentTimeLocation: {
    marginBottom: 16,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: '500',
    marginLeft: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
    marginLeft: 8,
  },
  appointmentActions: {
    flexDirection: "row",
    gap: 10,
  },
  detailButton: {
    flex: 1,
    backgroundColor: "#68C2E8",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  detailButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  contactButton: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  contactButtonText: {
    color: "#374151",
    fontSize: 15,
    fontWeight: "700",
  },

  scrollContainer: {
    flex: 1,
  },

  // Header wrapper
  // Header styles
  header: {
    backgroundColor: '#68C2E8',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 60,
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
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#68C2E8',
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
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 100,
    paddingRight: 20,
  },
  notificationDropdown: {
    width: screenWidth * 0.75,
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
  avatarButton: {
    marginRight: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
    fontWeight: '500',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Stats outer container
  statsOuterContainer: {
    marginTop: 0,
    paddingHorizontal: 20,
    marginBottom: 24,
  },

  // Statistics styles
  statsContainer: {
    paddingTop: 0,
    paddingHorizontal: 0,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 16,
  },
  statCard: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    minHeight: 150,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  statIcon: {
    fontSize: 32,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1F2937",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 8,
    fontWeight: "500",
    textAlign: "center",
  },

  // Alert card styles
  alertCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    padding: 0,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  alertIconContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  alertIcon: {
    fontSize: 24,
    color: "#FF9800",
  },
  alertContent: {
    padding: 20,
    paddingTop: 80,
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    minHeight: 160,
  },
  alertTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 6,
  },
  alertSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "400",
    lineHeight: 20,
  },
  alertArrow: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    fontSize: 28,
    color: "#68C2E8",
    fontWeight: "700",
  },

  // Schedule card styles
  scheduleCard: {
    backgroundColor: "transparent",
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 0,
  },
  scheduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  scheduleTitle: {
    fontSize: 20,
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
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    paddingBottom: 16,
  },
  appointmentInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#68C2E8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 22,
    color: "#FFFFFF",
  },
  appointmentDetails: {
    flex: 1,
  },
  appointmentName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  appointmentMeta: {
    fontSize: 14,
    color: "#6B7280",
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
