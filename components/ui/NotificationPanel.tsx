import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'reminder';
  isRead: boolean;
}

interface NotificationPanelProps {
  notifications: Notification[];
  onNotificationPress?: (notification: Notification) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Yêu cầu mới',
    message: 'Bà Nguyễn Thị Lan đã gửi yêu cầu chăm sóc cho ngày mai',
    time: '5 phút trước',
    type: 'info',
    isRead: false,
  },
  {
    id: '2',
    title: 'Xác nhận lịch',
    message: 'Lịch chăm sóc với Trần Văn Nam đã được xác nhận',
    time: '1 giờ trước',
    type: 'success',
    isRead: false,
  },
  {
    id: '3',
    title: 'Nhắc nhở',
    message: 'Có 2 task chưa hoàn thành trong ngày hôm nay',
    time: '2 giờ trước',
    type: 'warning',
    isRead: true,
  },
  {
    id: '4',
    title: 'Thanh toán',
    message: 'Thanh toán tháng 12 đã được xử lý thành công',
    time: '1 ngày trước',
    type: 'success',
    isRead: true,
  },
  {
    id: '5',
    title: 'Cập nhật hệ thống',
    message: 'Hệ thống sẽ bảo trì từ 2:00 - 4:00 sáng ngày mai',
    time: '2 ngày trước',
    type: 'info',
    isRead: true,
  },
];

export function NotificationPanel({ 
  notifications = mockNotifications,
  onNotificationPress,
  onMarkAsRead,
  onMarkAllAsRead 
}: NotificationPanelProps) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'alert-circle';
      case 'reminder':
        return 'star';
      default:
        return 'information-circle';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return '#4ECDC4';
      case 'warning':
        return '#FECA57';
      case 'error':
        return '#FF6B6B';
      case 'reminder':
        return '#FFD700';
      default:
        return '#4ECDC4';
    }
  };

  const renderNotification = (notification: Notification) => (
    <TouchableOpacity
      key={notification.id}
      style={[
        styles.notificationItem,
        !notification.isRead && styles.unreadNotification
      ]}
      onPress={() => onNotificationPress?.(notification)}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={styles.notificationTextContainer}>
            <ThemedText style={styles.notificationTitle}>
              {notification.title}
            </ThemedText>
            <ThemedText style={styles.notificationTime}>
              {notification.time}
            </ThemedText>
          </View>
          {!notification.isRead && (
            <View style={styles.unreadDot} />
          )}
        </View>
        <ThemedText style={styles.notificationMessage}>
          {notification.message}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Thông báo</ThemedText>
        <TouchableOpacity onPress={onMarkAllAsRead}>
          <ThemedText style={styles.markAllText}>Đánh dấu tất cả</ThemedText>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        {notifications.map(renderNotification)}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    maxHeight: 500,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  markAllText: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '500',
  },
  scrollContainer: {
    maxHeight: 400,
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  unreadNotification: {
    backgroundColor: '#f8f9fa',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#6c757d',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ECDC4',
    marginTop: 6,
  },
});
