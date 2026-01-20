import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import { EmergencyAlert } from '@/components/alerts/EmergencyAlert';
import { BookingModal } from '@/components/caregiver/BookingModal';
import { RecommendedCaregivers } from '@/components/caregiver/RecommendedCaregivers';
import { ElderlyProfiles } from '@/components/elderly/ElderlyProfiles';
import { SimpleNavBar } from '@/components/navigation/SimpleNavBar';
import { RequestNotification } from '@/components/notifications/RequestNotification';
import { AppointmentScheduleToday } from '@/components/schedule/AppointmentScheduleToday';
import { ThemedText } from '@/components/themed-text';
import { AddElderlyModal } from '@/components/ui/AddElderlyModal';
import { CustomModal } from '@/components/ui/CustomModal';
import { NotificationPanel } from '@/components/ui/NotificationPanel';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useBottomNavPadding } from '@/hooks/useBottomNavPadding';
import { mainService, type MyCareServiceData } from '@/services/main.service';
import { ElderlyProfileApiResponse, UserService } from '@/services/user.service';
import { useNewMessages } from '@/hooks/useNewMessages';

const { width } = Dimensions.get('window');

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


export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const { emergencyAlertVisible, hideEmergencyAlert } = useNotification();
  const bottomNavPadding = useBottomNavPadding();
  const [elderlyProfiles, setElderlyProfiles] = useState<any[]>([]);
  const [loadingElderlyProfiles, setLoadingElderlyProfiles] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showAppInfoModal, setShowAppInfoModal] = useState(false);
  const [showAddElderlyModal, setShowAddElderlyModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDevMenu, setShowDevMenu] = useState(false); // 👈 NEW
  const [selectedCaregiver, setSelectedCaregiver] = useState<any>(null);
  const [recommendedCaregivers, setRecommendedCaregivers] = useState<any[]>([]);
  const [loadingCaregivers, setLoadingCaregivers] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  
  // Map API response to component format
  const mapElderlyProfile = (apiProfile: ElderlyProfileApiResponse) => {
    return {
      id: apiProfile.elderlyProfileId,
      name: apiProfile.fullName,
      age: apiProfile.age,
      healthStatus: apiProfile.healthStatus,
      avatar: apiProfile.avatarUrl,
      gender: apiProfile.gender === 'FEMALE' ? 'female' : apiProfile.gender === 'MALE' ? 'male' : 'other',
      relationship: 'Người thân', // Default value, can be updated if API provides this
    };
  };

  // Fetch elderly profiles from API
  const fetchElderlyProfiles = useCallback(async () => {
    try {
      setLoadingElderlyProfiles(true);
      const profiles = await UserService.getElderlyProfiles();
      const mappedProfiles = profiles.map(mapElderlyProfile);
      setElderlyProfiles(mappedProfiles);
    } catch (error: any) {
      console.error('Error fetching elderly profiles:', error);
      // On error, set empty array
      setElderlyProfiles([]);
    } finally {
      setLoadingElderlyProfiles(false);
    }
  }, []);

  // Refresh elderly profiles when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchElderlyProfiles();
    }, [fetchElderlyProfiles])
  );
  
  // TODO: Replace with API call to fetch caregivers
  useEffect(() => {
    const fetchCaregivers = async () => {
      try {
        setLoadingCaregivers(true);
        // TODO: Call API to get caregivers
        // const response = await apiClient.get('/api/v1/public/caregivers');
        // setRecommendedCaregivers(response.data);
        
        // Temporary fallback mock data
        setRecommendedCaregivers([
          {
            id: 'mock-1',
            name: 'Mai',
            age: 35,
            avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
            rating: 4.9,
            gender: 'female' as const,
            specialties: ['Cao đẳng Điều dưỡng', 'Chăm sóc đái tháo đường'],
          },
        ]);
      } finally {
        setLoadingCaregivers(false);
      }
    };

    fetchCaregivers();
  }, []);
  
  // Fetch today's appointments from API
  const fetchTodayAppointments = useCallback(async () => {
    try {
      setLoadingAppointments(true);
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      
      console.log('Fetching appointments for today:', todayStr);
      const response = await mainService.getMyCareServices(todayStr);
      
      if (response.status === 'Success' && response.data) {
        // Map API data to appointment format
        const mappedAppointments = response.data.map((service: MyCareServiceData) => {
          // Parse location if it's a JSON string
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
            caregiverName: service.caregiverProfile.fullName,
            caregiverAvatar: service.caregiverProfile.avatarUrl || service.caregiverProfile.fullName.charAt(0),
            timeSlot: `${service.startTime.split(':').slice(0, 2).join(':')} - ${service.endTime.split(':').slice(0, 2).join(':')}`,
            status: service.status, // Giữ nguyên format từ API (CAREGIVER_APPROVED, IN_PROGRESS, etc.)
            address: locationObj.address,
            elderlyName: service.elderlyProfile.fullName, // Tên người già
            elderlyGender: service.elderlyProfile.gender, // Gender người già (MALE, FEMALE)
            rating: 0, // Mặc định 0 nếu chưa có rating
            isVerified: service.caregiverProfile.isVerified || false,
            tasks: [], // TODO: Map tasks if available
            caregiver_id: service.caregiverProfile.caregiverProfileId,
            elderly_profile_id: service.elderlyProfile.elderlyProfileId,
            package_type: service.servicePackage.packageName,
            work_location: locationObj.address,
            total_amount: service.totalPrice,
            bookingCode: service.bookingCode,
          };
        });
        
        setAppointments(mappedAppointments);
      } else {
        setAppointments([]);
      }
    } catch (error: any) {
      console.error('Error fetching today appointments:', error);
      setAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  }, []);

  // Refresh appointments when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchTodayAppointments();
    }, [fetchTodayAppointments])
  );
  
  // Request notification data - TODO: Fetch from API
  const requestCount = 0; // Set to 0 to hide mock notification
  const showRequestNotification = false; // Only show when there are real requests
  
  // Emergency alert data
  const emergencyAlert = {
    caregiverName: 'Nguyễn Văn A',
    elderlyName: 'Bà Nguyễn Thị B',
    timestamp: new Date().toISOString(),
    location: '123 Đường ABC, Quận 1, TP.HCM',
    message: 'Người già có dấu hiệu khó thở, cần hỗ trợ y tế ngay lập tức!'
  };
  
  // Handle booking press
  const handleBookPress = (caregiver: any) => {
    setSelectedCaregiver(caregiver);
    setShowBookingModal(true);
  };
  
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    time: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'reminder';
    isRead: boolean;
    notificationId?: string; // API notificationId
  }>>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  
  // Listen unread messages real-time từ Firestore
  const { unreadCount: chatUnreadCount } = useNewMessages();

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
    if (showNotificationModal) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [showNotificationModal, fetchNotifications, fetchUnreadCount]);

  const handleModulePress = (module: ServiceModule) => {
    if (module.id === 'app-info') {
      // Hiển thị footer thay vì navigate
      setShowAppInfoModal(true);
    } else if (module.id === 'add-elderly') {
      // Mở modal thay vì navigate
      setShowAddElderlyModal(true);
    } else if (module.route) {
      router.push(module.route as any);
    } else {
      Alert.alert(
        module.title,
        `Tính năng "${module.title}" sẽ sớm được phát triển!`,
        [{ text: 'OK' }]
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowProfileModal(false);
      setShowLogoutModal(false);
      
      // Logout will automatically redirect to splash/login due to AuthContext
      logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.fullContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingBottom: bottomNavPadding
        }}
      >
      {/* Header - bTaskee Style */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.avatarButton} onPress={handleProfilePress}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.userAvatarImage} />
              ) : (
                <View style={styles.userAvatar}>
                  <Ionicons name="person" size={20} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.greetingContainer}>
              <ThemedText style={styles.greeting}>Xin chào!</ThemedText>
              <ThemedText style={styles.userName}>{user?.name || user?.email?.split('@')[0] || 'Người dùng'}</ThemedText>
            </View>
          </View>
          
          {/* Chat & Notification buttons */}
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => router.push('/careseeker/chat-list' as any)}
            >
              <Ionicons name="chatbubble-outline" size={24} color="#FFFFFF" />
              {chatUnreadCount > 0 && (
                <View style={styles.badge}>
                  <ThemedText style={styles.badgeText}>
                    {chatUnreadCount > 99 ? "99+" : chatUnreadCount}
                  </ThemedText>
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => setShowNotificationModal(true)}
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

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Emergency Alert */}
        {emergencyAlertVisible && (
          <View style={styles.emergencyContainer}>
            <EmergencyAlert 
              alert={emergencyAlert}
              visible={emergencyAlertVisible}
              onDismiss={hideEmergencyAlert}
            />
          </View>
        )}

        {/* Request Notification */}
        {showRequestNotification && requestCount > 0 && (
          <View style={styles.requestNotificationContainer}>
            <RequestNotification 
              requestCount={requestCount} 
              visible={showRequestNotification} 
            />
          </View>
        )}

        {/* Find Caregiver Section */}
        <View style={styles.findCaregiverSection}>
          <View style={styles.findCaregiverCard}>
            <View style={styles.findCaregiverTopRow}>
              <View style={styles.findCaregiverIconContainer}>
                <Ionicons name="search" size={32} color="#4ECDC4" />
              </View>
              <View style={styles.findCaregiverTextContainer}>
                <ThemedText style={styles.findCaregiverTitle}>Tìm người chăm sóc</ThemedText>
                <ThemedText style={styles.findCaregiverDescription}>
                  Tìm kiếm người chăm sóc phù hợp với nhu cầu của bạn
                </ThemedText>
              </View>
            </View>
            <View style={styles.findCaregiverButtonContainer}>
              <TouchableOpacity 
                style={styles.findCaregiverButton}
                onPress={() => router.push('/careseeker/caregiver-search')}
              >
                <ThemedText style={styles.findCaregiverButtonText}>Tìm ngay</ThemedText>
                <Ionicons name="arrow-forward" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Elderly Profiles - Compact */}
        <View style={styles.elderlySection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Hồ sơ người già</ThemedText>
            {elderlyProfiles.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/careseeker/elderly-list')}>
                <ThemedText style={styles.seeAllText}>Xem tất cả →</ThemedText>
              </TouchableOpacity>
            )}
          </View>
          {loadingElderlyProfiles ? (
            <View style={styles.loadingContainer}>
              <ThemedText style={styles.loadingText}>Đang tải...</ThemedText>
            </View>
          ) : elderlyProfiles.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="person-outline" size={48} color="#BDC3C7" />
              <ThemedText style={styles.emptyStateText}>Bạn chưa có hồ sơ người già</ThemedText>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={() => router.push('/careseeker/add-elderly')}
              >
                <ThemedText style={styles.createButtonText}>Tạo ngay</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <ElderlyProfiles profiles={elderlyProfiles.slice(0, 5)} />
          )}
        </View>

        {/* Appointment Today - Compact */}
        <View style={styles.appointmentSection}>
          <ThemedText style={styles.sectionTitle}>Lịch hẹn hôm nay</ThemedText>
          {loadingAppointments ? (
            <View style={styles.loadingContainer}>
              <ThemedText style={styles.loadingText}>Đang tải...</ThemedText>
            </View>
          ) : appointments.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="calendar-outline" size={48} color="#BDC3C7" />
              <ThemedText style={styles.emptyStateText}>
                Bạn không có lịch hẹn trong ngày hôm nay
              </ThemedText>
            </View>
          ) : (
            <>
              <AppointmentScheduleToday appointments={appointments.slice(0, 2)} />
              {appointments.length > 2 && (
                <TouchableOpacity 
                  style={styles.viewMoreButton}
                  onPress={() => router.push('/careseeker/appointments')}
                >
                  <ThemedText style={styles.viewMoreText}>
                    Xem thêm {appointments.length - 2} lịch hẹn khác
                  </ThemedText>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

      </View>

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
            <ThemedText style={styles.appInfoModalTitle}>Thông tin ứng dụng</ThemedText>
            <View style={styles.appInfoPlaceholder} />
          </View>

          <ScrollView style={styles.appInfoModalContent}>
            {/* App Info */}
            <View style={styles.appInfoSection}>
              <View style={styles.appInfoLogo}>
                <Ionicons name="heart" size={32} color="#68C2E8" />
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
                <Ionicons name="people" size={24} color="#68C2E8" />
                <ThemedText style={styles.appInfoStatNumber}>1000+</ThemedText>
                <ThemedText style={styles.appInfoStatLabel}>Người chăm sóc</ThemedText>
              </View>
              <View style={styles.appInfoStatItem}>
                <Ionicons name="home" size={24} color="#68C2E8" />
                <ThemedText style={styles.appInfoStatNumber}>500+</ThemedText>
                <ThemedText style={styles.appInfoStatLabel}>Gia đình</ThemedText>
              </View>
              <View style={styles.appInfoStatItem}>
                <Ionicons name="star" size={24} color="#68C2E8" />
                <ThemedText style={styles.appInfoStatNumber}>4.9</ThemedText>
                <ThemedText style={styles.appInfoStatLabel}>Đánh giá</ThemedText>
              </View>
            </View>

            {/* Contact Info */}
            <View style={styles.appInfoContactSection}>
              <ThemedText style={styles.appInfoSectionTitle}>Thông tin liên hệ</ThemedText>
              <View style={styles.appInfoContactItem}>
                <Ionicons name="call" size={20} color="#6C757D" />
                <ThemedText style={styles.appInfoContactText}>Hotline: 1900-1234</ThemedText>
              </View>
              <View style={styles.appInfoContactItem}>
                <Ionicons name="mail" size={20} color="#6C757D" />
                <ThemedText style={styles.appInfoContactText}>support@eldercare.com</ThemedText>
              </View>
              <View style={styles.appInfoContactItem}>
                <Ionicons name="location" size={20} color="#6C757D" />
                <ThemedText style={styles.appInfoContactText}>123 Đường ABC, Quận 1, TP.HCM</ThemedText>
              </View>
            </View>

            {/* Bottom Links */}
            <View style={styles.appInfoLinksSection}>
              <ThemedText style={styles.appInfoCopyright}>
                © 2024 Elder Care Connect. Tất cả quyền được bảo lưu.
              </ThemedText>
              <View style={styles.appInfoLinks}>
                <ThemedText style={styles.appInfoLink}>Điều khoản sử dụng</ThemedText>
                <ThemedText style={styles.appInfoLink}>Chính sách bảo mật</ThemedText>
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
              { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }
            ]}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.modalAvatarImage} />
              ) : (
                <View style={styles.modalAvatar}>
                  <Ionicons name="person" size={40} color="#68C2E8" />
                </View>
              )}
              <ThemedText style={styles.modalName}>
                {user?.name || 'Người dùng'}
              </ThemedText>
              <ThemedText style={styles.modalEmail}>
                {user?.email}
              </ThemedText>
            </View>

            <View style={styles.modalInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="call" size={20} color="#6c757d" />
                <ThemedText style={styles.infoText}>
                  {user?.phone || 'Chưa cập nhật'}
                </ThemedText>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="location" size={20} color="#6c757d" />
                <ThemedText style={styles.infoText}>
                  {user?.address || 'Chưa cập nhật'}
                </ThemedText>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="calendar" size={20} color="#6c757d" />
                <ThemedText style={styles.infoText}>
                  {user?.dateOfBirth || 'Chưa cập nhật'}
                </ThemedText>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.logoutButtonModal} 
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={20} color="white" />
              <ThemedText style={styles.logoutButtonText}>Đăng xuất</ThemedText>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

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
              onNotificationPress={async (notification) => {
                console.log('Notification pressed:', notification);
                // Mark as read when pressed
                if (notification.notificationId && !notification.isRead) {
                  try {
                    await mainService.markNotificationAsRead(notification.notificationId);
                    setNotifications(prev => 
                      prev.map(notif => 
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
                const notification = notifications.find(n => n.id === notificationId || n.notificationId === notificationId);
                if (notification?.notificationId && !notification.isRead) {
                  try {
                    await mainService.markNotificationAsRead(notification.notificationId);
                    setNotifications(prev => 
                      prev.map(notif => 
                        (notif.id === notificationId || notif.notificationId === notificationId)
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
              onMarkAllAsRead={async () => {
                try {
                  await mainService.markAllNotificationsAsRead();
                  setNotifications(prev => 
                    prev.map(notif => ({ ...notif, isRead: true }))
                  );
                  setUnreadCount(0);
                } catch (error: any) {
                  console.error('Error marking all notifications as read:', error);
                }
              }}
            />
          </View>
        </TouchableOpacity>
      )}

      {/* Add Elderly Modal */}
      <AddElderlyModal
        visible={showAddElderlyModal}
        onClose={() => setShowAddElderlyModal(false)}
        onSuccess={() => {
          // Refresh elderly profiles or show success message
          console.log('Elderly profile created successfully');
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
        buttonColors={['#E74C3C', '#C0392B']}
        isLoading={isLoggingOut}
        showCancelButton={true}
        cancelButtonText="Hủy"
        onCancel={() => setShowLogoutModal(false)}
      />

      {/* Booking Modal */}
      {selectedCaregiver && (
        <BookingModal
          visible={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedCaregiver(null);
          }}
          caregiver={selectedCaregiver}
          elderlyProfiles={elderlyProfiles}
        />
      )}

      {/* Navigation Bar */}
      <SimpleNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  fullContainer: {
    flex: 1,
  },
  // Header - bTaskee Style
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
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 11,
    includeFontPadding: false,
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
    letterSpacing: 0.3,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  // Main Content
  mainContent: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  emergencyContainer: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  requestNotificationContainer: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2C3E50',
    marginBottom: 20,
    paddingHorizontal: 4,
    letterSpacing: 0.3,
  },
  // Elderly Section
  findCaregiverSection: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  findCaregiverCard: {
    backgroundColor: '#F0FDFA',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#B2F5EA',
    shadowColor: '#4ECDC4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  findCaregiverTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  findCaregiverIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  findCaregiverTextContainer: {
    flex: 1,
  },
  findCaregiverTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 6,
  },
  findCaregiverDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  findCaregiverButtonContainer: {
    alignItems: 'flex-end',
  },
  findCaregiverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 6,
    shadowColor: '#4ECDC4',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  findCaregiverButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  elderlySection: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderRadius: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#68C2E8',
    letterSpacing: 0.2,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  emptyStateContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F9FC',
    borderRadius: 16,
    marginHorizontal: 4,
  },
  emptyStateText: {
    fontSize: 15,
    color: '#6C757D',
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: '#68C2E8',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#68C2E8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  // Appointment Section
  appointmentSection: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  viewMoreButton: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#68C2E8',
  },
  viewMoreText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#68C2E8',
    letterSpacing: 0.2,
  },
  footer: {
    backgroundColor: '#2c3e50',
    paddingHorizontal: 20,
    paddingVertical: 40,
    marginTop: 20,
  },
  footerContent: {
    alignItems: 'center',
  },
  footerHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  appLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  footerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  footerTagline: {
    fontSize: 14,
    color: '#bdc3c7',
    textAlign: 'center',
    lineHeight: 20,
  },
  footerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  footerStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  footerStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
    marginBottom: 4,
  },
  footerStatLabel: {
    fontSize: 12,
    color: '#bdc3c7',
    textAlign: 'center',
  },
  footerContact: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 25,
    gap: 30,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#bdc3c7',
  },
  footerBottom: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 20,
  },
  copyrightText: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
    marginBottom: 12,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 20,
  },
  footerLink: {
    fontSize: 12,
    color: '#68C2E8',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 300,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#68C2E8',
  },
  modalAvatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#68C2E8',
  },
  modalName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  modalEmail: {
    fontSize: 14,
    color: '#6c757d',
  },
  modalInfo: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  logoutButtonModal: {
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  bottomSpacing: {
    height: 120,
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
    width: width * 0.75,
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
  // Service Banner Styles
  serviceBannerContainer: {
    width: '100%',
    marginBottom: 20,
  },
  serviceBanner: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 140,
  },
  bannerImageContainer: {
    marginRight: 20,
  },
  bannerImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#68C2E8',
  },
  bannerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    lineHeight: 24,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 16,
    lineHeight: 20,
  },
  // Duplicate styles - removed
  // findNowButton: {
  //   backgroundColor: '#68C2E8',
  //   borderRadius: 12,
  //   paddingVertical: 12,
  //   paddingHorizontal: 20,
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   alignSelf: 'flex-start',
  //   elevation: 2,
  //   shadowColor: '#68C2E8',
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
    backgroundColor: '#F8F9FA',
  },
  appInfoModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#68C2E8',
  },
  appInfoCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appInfoModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  appInfoPlaceholder: {
    width: 40,
  },
  appInfoModalContent: {
    flex: 1,
    padding: 20,
  },
  appInfoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  appInfoLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#68C2E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appInfoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  appInfoTagline: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
  },
  appInfoStatsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  appInfoStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  appInfoStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 8,
  },
  appInfoStatLabel: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 4,
    textAlign: 'center',
  },
  appInfoContactSection: {
    marginBottom: 30,
  },
  appInfoSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  appInfoContactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  appInfoContactText: {
    fontSize: 14,
    color: '#6C757D',
    marginLeft: 12,
  },
  appInfoLinksSection: {
    alignItems: 'center',
  },
  appInfoCopyright: {
    fontSize: 12,
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: 16,
  },
  appInfoLinks: {
    flexDirection: 'row',
    gap: 20,
  },
  appInfoLink: {
    fontSize: 12,
    color: '#68C2E8',
    textDecorationLine: 'underline',
  },
});