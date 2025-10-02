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

import { ThemedText } from '@/components/themed-text';
import { NotificationPanel } from '@/components/ui/NotificationPanel';
import { useAuth } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');

interface ServiceModule {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  route?: string;
}

const serviceModules: ServiceModule[] = [
  {
    id: 'services',
    title: 'Kết nối',
    icon: 'medical',
    color: '#FF6B6B',
    description: 'Tìm người chăm sóc phù hợp',
    route: '/caregiver-search',
  },
  {
    id: 'elderly-profile',
    title: 'Hồ sơ người già',
    icon: 'person-circle',
    color: '#4ECDC4',
    description: 'Quản lý hồ sơ sức khỏe',
    route: '/elderly-list',
  },
  {
    id: 'family',
    title: 'Gia đình',
    icon: 'people',
    color: '#FFD93D',
    description: 'Quản lý thành viên gia đình',
    route: '/family-list',
  },
  {
    id: 'chat',
    title: 'Tin nhắn',
    icon: 'chatbubbles',
    color: '#9B59B6',
    description: 'Trò chuyện với mọi người',
    route: '/chat-list',
  },
  {
    id: 'reviews',
    title: 'Đánh giá',
    icon: 'star',
    color: '#A8E6CF',
    description: 'Đánh giá chất lượng dịch vụ',
    route: '/reviews',
  },
  {
    id: 'alerts',
    title: 'Alert',
    icon: 'notifications',
    color: '#FFB6C1',
    description: 'Thông báo quan trọng',
    route: '/alert-list',
  },

  {
    id: 'requests',
    title: 'Yêu cầu',
    icon: 'document-text',
    color: '#9B59B6',
    description: 'Quản lý yêu cầu chăm sóc',
    route: '/requests',
  },
  {
    id: 'complaints',
    title: 'Khiếu nại',
    icon: 'warning',
    color: '#E74C3C',
    description: 'Quản lý khiếu nại và tố cáo',
    route: '/complaints',
  },
  {
    id: 'hired',
    title: 'Đang thuê',
    icon: 'people-circle',
    color: '#E67E22',
    description: 'Người chăm sóc đang thuê',
    route: '/hired-caregivers',
  },
  {
    id: 'appointments',
    title: 'Lịch hẹn',
    icon: 'calendar',
    color: '#3498DB',
    description: 'Quản lý lịch hẹn video call',
    route: '/appointments',
  },
  {
    id: 'payments',
    title: 'Thanh toán',
    icon: 'card',
    color: '#27AE60',
    description: 'Quản lý thanh toán dịch vụ',
    route: '/payments',
  },
  {
    id: 'hiring-history',
    title: 'Dịch vụ',
    icon: 'time',
    color: '#8E44AD',
    description: 'Lịch sử các dịch vụ đã thuê',
    route: '/hiring-history',
  }
];

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
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
    if (module.route) {
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
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            setShowProfileModal(false);
            logout();
            router.replace('/(tabs)');
          },
        },
      ]
    );
  };

  const renderServiceModule = (module: ServiceModule, index: number) => {
    // All cards same size: 2x4 grid (8 cards total)
    const cardWidth = (width - 60) / 2;

    return (
      <TouchableOpacity
        key={module.id}
        style={[
          styles.moduleCard,
          { width: cardWidth, backgroundColor: module.color },
        ]}
        onPress={() => handleModulePress(module)}
        activeOpacity={0.8}
      >
        <View style={styles.moduleContent}>
          <View style={styles.moduleHeader}>
            <View style={styles.moduleIconContainer}>
              <Ionicons name={module.icon as any} size={18} color="white" />
            </View>
            <ThemedText style={styles.moduleTitle}>
              {module.title}
            </ThemedText>
          </View>
          <View style={styles.divider} />
          <View style={styles.moduleDescriptionContainer}>
            <ThemedText style={styles.moduleDescription}>
              {module.description}
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <TouchableOpacity style={styles.avatarButton} onPress={handleProfilePress}>
              <View style={styles.userAvatar}>
                <Ionicons name="person" size={24} color="white" />
              </View>
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>
              Xin chào, {user?.name || user?.email?.split('@')[0] || 'Bạn'}!
            </ThemedText>
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
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Question Section */}
        <View style={styles.questionSection}>
          <ThemedText style={styles.questionText}>Chúng tôi có thể giúp gì?</ThemedText>
        </View>

        {/* Service Modules Grid */}
        <View style={styles.modulesContainer}>
          <View style={styles.modulesGrid}>
            {serviceModules.map((module, index) => renderServiceModule(module, index))}
          </View>
        </View>


        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            {/* App Info */}
            <View style={styles.footerHeader}>
              <View style={styles.appLogo}>
                <Ionicons name="heart" size={24} color="#4ECDC4" />
              </View>
              <ThemedText style={styles.footerTitle}>
                Elder Care Connect
              </ThemedText>
              <ThemedText style={styles.footerTagline}>
                Chăm sóc tận tâm, công nghệ hiện đại
              </ThemedText>
            </View>

            {/* Quick Stats */}
            <View style={styles.footerStats}>
              <View style={styles.footerStatItem}>
                <Ionicons name="people" size={20} color="#4ECDC4" />
                <ThemedText style={styles.footerStatNumber}>1000+</ThemedText>
                <ThemedText style={styles.footerStatLabel}>Người chăm sóc</ThemedText>
              </View>
              <View style={styles.footerStatItem}>
                <Ionicons name="home" size={20} color="#FF6B6B" />
                <ThemedText style={styles.footerStatNumber}>500+</ThemedText>
                <ThemedText style={styles.footerStatLabel}>Gia đình</ThemedText>
              </View>
              <View style={styles.footerStatItem}>
                <Ionicons name="star" size={20} color="#FFD93D" />
                <ThemedText style={styles.footerStatNumber}>4.9</ThemedText>
                <ThemedText style={styles.footerStatLabel}>Đánh giá</ThemedText>
              </View>
            </View>

            {/* Contact Info */}
            <View style={styles.footerContact}>
              <View style={styles.contactItem}>
                <Ionicons name="call" size={16} color="#6c757d" />
                <ThemedText style={styles.contactText}>1900 123 456</ThemedText>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="mail" size={16} color="#6c757d" />
                <ThemedText style={styles.contactText}>support@eldercare.vn</ThemedText>
              </View>
            </View>

            {/* Copyright */}
            <View style={styles.footerBottom}>
              <ThemedText style={styles.copyrightText}>
                © 2025 Elder Care Connect. Tất cả quyền được bảo lưu.
              </ThemedText>
              <View style={styles.footerLinks}>
                <ThemedText style={styles.footerLink}>Điều khoản sử dụng</ThemedText>
                <ThemedText style={styles.footerLink}>Chính sách bảo mật</ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#4ECDC4',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  headerTitle: {
    fontSize: 20,
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
  questionSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'white',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  modulesContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modulesGrid: {
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
});