import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import { EmergencyAlert } from '@/components/alerts/EmergencyAlert';
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

const { width } = Dimensions.get('window');

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
  // {
  //   id: 'payments-feature',
  //   title: 'Thanh toán',
  //   icon: 'card',
  //   color: '#27AE60',
  //   description: 'Quản lý thanh toán dịch vụ',
  //   route: '/payments',
  // },
  {
    id: 'complaints-feature',
    title: 'Khiếu nại',
    icon: 'chatbubble-ellipses',
    color: '#E74C3C',
    description: 'Quản lý khiếu nại và tố cáo',
    route: '/complaints',
  },
  {
    id: 'reviews-feature',
    title: 'Đánh giá',
    icon: 'star',
    color: '#A8E6CF',
    description: 'Đánh giá chất lượng dịch vụ',
    route: '/reviews',
  },
  {
    id: 'app-info',
    title: 'Thông tin app',
    icon: 'information-circle',
    color: '#3498DB',
    description: 'Thông tin về ứng dụng',
    route: '/app-info',
  }
];

export default function DashboardScreen() {
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
    caregiverName: 'Nguyễn Văn A',
    elderlyName: 'Bà Nguyễn Thị B',
    timestamp: new Date().toISOString(),
    location: '123 Đường ABC, Quận 1, TP.HCM',
    message: 'Người già có dấu hiệu khó thở, cần hỗ trợ y tế ngay lập tức!'
  };
  
  // Sample appointment data
  const appointments = [  
    {
      id: '1',
      caregiverName: 'Trần Văn Nam',
      caregiverAvatar: 'N',
      timeSlot: '08:00 - 12:00',
      status: 'completed' as const,
      address: '123 Đường ABC, Quận 1, TP.HCM',
      rating: 4.8,
      isVerified: true,
      tasks: [
        { id: '7', name: 'Nhắc nhở uống thuốc buổi sáng', completed: true, time: '09:00', status: 'completed' as const },
        { id: '8', name: 'Tập thể dục nhẹ', completed: true, time: '08:00', status: 'completed' as const },
        { id: '9', name: 'Chuẩn bị bữa trưa', completed: false, time: '12:00', status: 'failed' as const },
        { id: '10', name: 'Dọn dẹp phòng', completed: false, time: '14:00', status: 'failed' as const },
      ],
    },
    {
      id: '2',
      caregiverName: 'Nguyễn Thị Mai',
      caregiverAvatar: 'M',
      timeSlot: '14:00 - 18:00',
      status: 'in-progress' as const,
      address: '456 Đường XYZ, Quận 2, TP.HCM',
      rating: 4.5,
      isVerified: true,
      tasks: [
        { id: '1', name: 'Nhắc nhở uống thuốc buổi sáng', completed: true, time: '09:00', status: 'completed' as const },
        { id: '2', name: 'Tập thể dục nhẹ', completed: true, time: '08:00', status: 'completed' as const },
        { id: '3', name: 'Chuẩn bị bữa trưa', completed: false, time: '12:00', status: 'pending' as const },
        { id: '4', name: 'Dọn dẹp phòng', completed: false, time: '14:00', status: 'pending' as const },
        { id: '5', name: 'Trò chuyện và giải trí', completed: false, time: '15:00', status: 'pending' as const },
        { id: '6', name: 'Mua sắm đồ dùng', completed: false, time: '16:00', status: 'pending' as const },
      ],
    },
    {
      id: '3',
      caregiverName: 'Lê Thị Hoa',
      caregiverAvatar: 'H',
      timeSlot: '19:00 - 22:00',
      status: 'upcoming' as const,
      address: '789 Đường DEF, Quận 3, TP.HCM',
      rating: 4.2,
      isVerified: false,
      tasks: [
        { id: '11', name: 'Nhắc nhở uống thuốc buổi sáng', completed: false, time: '09:00' },
        { id: '12', name: 'Tập thể dục nhẹ', completed: false, time: '08:00' },
        { id: '13', name: 'Chuẩn bị bữa trưa', completed: false, time: '12:00' },
        { id: '14', name: 'Dọn dẹp phòng', completed: false, time: '14:00' },
        { id: '15', name: 'Trò chuyện và giải trí', completed: false, time: '15:00' },
        { id: '16', name: 'Mua sắm đồ dùng', completed: false, time: '16:00' },
      ],
    },
  ];
  
  // Sample elderly profiles data
  const elderlyProfiles = [
    {
      id: '1',
      name: 'Bà Nguyễn Thị Lan',
      age: 75,
      healthStatus: 'Tốt',
      avatar: 'https://via.placeholder.com/60x60/4ECDC4/FFFFFF?text=NL',
      relationship: 'Bà nội',
    },
    {
      id: '2',
      name: 'Ông Trần Văn Minh',
      age: 82,
      healthStatus: 'Khá',
      avatar: 'https://via.placeholder.com/60x60/27AE60/FFFFFF?text=TM',
      relationship: 'Ông ngoại',
    },
    {
      id: '3',
      name: 'Bà Lê Thị Hoa',
      age: 68,
      healthStatus: 'Tốt',
      avatar: 'https://via.placeholder.com/60x60/F39C12/FFFFFF?text=LH',
      relationship: 'Bà ngoại',
    },
    {
      id: '4',
      name: 'Ông Phạm Văn Đức',
      age: 79,
      healthStatus: 'Yếu',
      avatar: 'https://via.placeholder.com/60x60/E74C3C/FFFFFF?text=PD',
      relationship: 'Ông nội',
    },
  ];
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Yêu cầu mới',
      message: 'Bà Nguyễn Thị Lan đã gửi yêu cầu chăm sóc cho ngày mai',
      time: '5 phút trước',
      type: 'info' as const,
      isRead: false,
    },
    {
      id: '2',
      title: 'Xác nhận lịch',
      message: 'Lịch chăm sóc với Trần Văn Nam đã được xác nhận',
      time: '1 giờ trước',
      type: 'success' as const,
      isRead: false,
    },
    {
      id: '3',
      title: 'Nhắc nhở',
      message: 'Có 2 task chưa hoàn thành trong ngày hôm nay',
      time: '2 giờ trước',
      type: 'warning' as const,
      isRead: true,
    },
    {
      id: '4',
      title: 'Thanh toán',
      message: 'Thanh toán tháng 12 đã được xử lý thành công',
      time: '1 ngày trước',
      type: 'success' as const,
      isRead: true,
    },
    {
      id: '5',
      title: 'Cập nhật hệ thống',
      message: 'Hệ thống sẽ bảo trì từ 2:00 - 4:00 sáng ngày mai',
      time: '2 ngày trước',
      type: 'info' as const,
      isRead: true,
    },
  ]);
  const [fadeAnim] = useState(new Animated.Value(0));

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
            logout();
            router.replace('/(tabs)');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.fullContainer} showsVerticalScrollIndicator={false}>
      {/* Header with Wallet */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoContainer}>
            <TouchableOpacity style={styles.avatarButton} onPress={handleProfilePress}>
              <View style={styles.userAvatar}>
                <Ionicons name="person" size={24} color="white" />
              </View>
            </TouchableOpacity>
            <View style={styles.greetingContainer}>
              <ThemedText style={styles.greeting}>Xin chào,</ThemedText>
              <ThemedText style={styles.userName}>{user?.name || user?.email?.split('@')[0] || 'Bạn'}!</ThemedText>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => setShowNotificationModal(true)}
          >
            <Ionicons name="notifications" size={24} color="white" />
            {notifications.filter(notif => !notif.isRead).length > 0 && (
              <View style={styles.notificationBadge}>
                <ThemedText style={styles.badgeText}>
                  {notifications.filter(notif => !notif.isRead).length > 99 
                    ? '99+' 
                    : notifications.filter(notif => !notif.isRead).length}
                </ThemedText>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Wallet Card in Header */}
        <View style={styles.walletCard}>
          {/* Wallet Balance */}
          <TouchableOpacity 
            style={styles.walletBalanceRow}
            onPress={() => router.push('/payments')}
            activeOpacity={0.8}
          >
            <View style={styles.walletIconContainer}>
              <View style={styles.walletIcon}>
                <Ionicons name="wallet" size={24} color="white" />
      </View>
            </View>
            <View style={styles.walletInfo}>
              <ThemedText style={styles.walletLabel}>Số dư ví</ThemedText>
              <ThemedText style={styles.walletBalance}>2.450.000₫</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.walletActions}>
            <TouchableOpacity 
              style={styles.walletActionButton}
              onPress={() => router.push('/top-up')}
            >
              <View style={[styles.walletActionIcon, { backgroundColor: '#4CAF50' }]}>
                <Ionicons name="add" size={24} color="white" />
              </View>
              <ThemedText style={styles.walletActionLabel}>Nạp tiền</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.walletActionButton}
              onPress={() => router.push('/transaction-history' as any)}
            >
              <View style={[styles.walletActionIcon, { backgroundColor: '#9C27B0' }]}>
                <Ionicons name="time" size={24} color="white" />
              </View>
              <ThemedText style={styles.walletActionLabel}>Lịch sử</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.walletActionButton}
              onPress={() => router.push('/withdraw' as any)}
            >
              <View style={[styles.walletActionIcon, { backgroundColor: '#FF9800' }]}>
                <Ionicons name="arrow-up" size={24} color="white" />
              </View>
              <ThemedText style={styles.walletActionLabel}>Rút tiền</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Quick Access Cards with Background */}
      <View style={styles.quickAccessWrapper}>
        <View style={styles.quickAccessContainer}>
          <TouchableOpacity 
            style={[styles.quickAccessCard, { backgroundColor: '#E8F4F8' }]}
            onPress={() => router.push('/caregiver-search' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.quickAccessIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="search" size={28} color="#2196F3" />
            </View>
            <View style={styles.quickAccessTextContainer}>
              <ThemedText style={styles.quickAccessTitle}>Tìm người</ThemedText>
              <ThemedText style={styles.quickAccessSubtitle}>chăm sóc</ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickAccessCard, { backgroundColor: '#F5E6F9' }]}
            onPress={() => router.push('/appointments')}
            activeOpacity={0.8}
          >
            <View style={[styles.quickAccessIcon, { backgroundColor: '#F3E5F5' }]}>
              <Ionicons name="calendar" size={28} color="#9C27B0" />
            </View>
            <View style={styles.quickAccessTextContainer}>
              <ThemedText style={[styles.quickAccessTitle, { color: '#9C27B0' }]}>Lịch hẹn</ThemedText>
              <ThemedText style={[styles.quickAccessSubtitle, { color: '#BA68C8' }]}>của tôi</ThemedText>
            </View>
          </TouchableOpacity>
        </View>
        </View>

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
                <ThemedText style={styles.otherFeaturesTitle}>Các tính năng khác</ThemedText>
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
                        <Ionicons name={feature.icon as any} size={28} color={feature.color} />
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
                <ThemedText style={styles.appInfoStatLabel}>Người chăm sóc</ThemedText>
              </View>
              <View style={styles.appInfoStatItem}>
                <Ionicons name="home" size={24} color="#4ECDC4" />
                <ThemedText style={styles.appInfoStatNumber}>500+</ThemedText>
                <ThemedText style={styles.appInfoStatLabel}>Gia đình</ThemedText>
              </View>
              <View style={styles.appInfoStatItem}>
                <Ionicons name="star" size={24} color="#4ECDC4" />
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
          >
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.modalHeader}>
                <View style={styles.modalAvatar}>
                  <Ionicons name="person" size={40} color="#4ECDC4" />
                </View>
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

              <TouchableOpacity style={styles.logoutButtonModal} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color="white" />
                <ThemedText style={styles.logoutButtonText}>Đăng xuất</ThemedText>
              </TouchableOpacity>
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
              onNotificationPress={(notification) => {
                console.log('Notification pressed:', notification);
                // Mark as read when pressed
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

      {/* Navigation Bar */}
      <SimpleNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  fullContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#2196F3',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingContainer: {
    marginLeft: 12,
  },
  avatarButton: {
    marginRight: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  greeting: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -2,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 12,
  },
  content: {
    flex: 1,
  },
  modulesContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  modulesGrid: {
    flexDirection: 'column',
    gap: 20,
  },
  singleModuleContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  regularModulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  moduleCard: {
    borderRadius: 16,
    padding: 16,
    minHeight: 110,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  moduleContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 8,
  },
  moduleIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  moduleDescriptionContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  moduleDescription: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 15,
    textAlign: 'left',
    fontWeight: '400',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
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
    color: '#4ECDC4',
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
    borderColor: '#4ECDC4',
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
    marginTop: 16,
    marginBottom: 120, // Thêm margin bottom để tránh đụng nav
    paddingHorizontal: 20,
  },
  otherFeaturesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
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
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  featureImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  featureTitleLarge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
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
    borderColor: '#4ECDC4',
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
    backgroundColor: '#F8F9FA',
  },
  appInfoModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#4ECDC4',
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
    backgroundColor: '#4ECDC4',
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
    color: '#4ECDC4',
    textDecorationLine: 'underline',
  },
  // Wallet Styles
  walletCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  walletBalanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletIconContainer: {
    marginRight: 12,
  },
  walletIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 4,
  },
  walletBalance: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  walletActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  walletActionButton: {
    alignItems: 'center',
    flex: 1,
  },
  walletActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  walletActionLabel: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '600',
  },
  // Quick Access Cards
  quickAccessWrapper: {
    backgroundColor: 'white',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    marginTop: -15,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 20,
  },
  quickAccessContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAccessCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  quickAccessIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  quickAccessTextContainer: {
    flex: 1,
  },
  quickAccessTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  quickAccessSubtitle: {
    fontSize: 11,
    color: '#64B5F6',
  },
});