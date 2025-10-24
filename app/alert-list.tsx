import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert as RNAlert,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext';

interface AlertItem {
  id: string;
  title: string;
  message: string;
  type: 'health' | 'appointment' | 'payment' | 'system' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  createdAt: string;
  familyId?: string;
  elderlyId?: string;
  actionRequired?: boolean;
  actionText?: string;
}

export default function AlertListScreen() {
  const { user } = useAuth();
  
  // Mock data - in real app, this would come from API
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: '1',
      title: 'Cảnh báo sức khỏe',
      message: 'Bà Nguyễn Thị Lan có dấu hiệu huyết áp cao bất thường. Vui lòng kiểm tra ngay.',
      type: 'health',
      priority: 'critical',
      isRead: false,
      createdAt: '2024-12-19T10:30:00Z',
      familyId: '1',
      elderlyId: '1',
      actionRequired: true,
      actionText: 'Kiểm tra ngay',
    },
    {
      id: '2',
      title: 'Lịch hẹn sắp tới',
      message: 'Bạn có lịch hẹn với Chị Nguyễn Thị Lan vào 14:00 hôm nay.',
      type: 'appointment',
      priority: 'high',
      isRead: false,
      createdAt: '2024-12-19T09:15:00Z',
      familyId: '1',
      actionRequired: true,
      actionText: 'Xem chi tiết',
    },
    {
      id: '3',
      title: 'Thanh toán thành công',
      message: 'Thanh toán dịch vụ chăm sóc tháng 12/2024 đã được xử lý thành công.',
      type: 'payment',
      priority: 'low',
      isRead: true,
      createdAt: '2024-12-18T16:45:00Z',
      familyId: '1',
    },
    {
      id: '4',
      title: 'Cập nhật hệ thống',
      message: 'Hệ thống sẽ được bảo trì từ 02:00 - 04:00 ngày 20/12/2024.',
      type: 'system',
      priority: 'medium',
      isRead: true,
      createdAt: '2024-12-18T14:20:00Z',
    },
    {
      id: '5',
      title: 'Nhắc nhở uống thuốc',
      message: 'Bà Nguyễn Thị Lan cần uống thuốc huyết áp lúc 08:00 sáng.',
      type: 'health',
      priority: 'high',
      isRead: false,
      createdAt: '2024-12-19T07:30:00Z',
      familyId: '1',
      elderlyId: '1',
      actionRequired: true,
      actionText: 'Xác nhận',
    },
    {
      id: '6',
      title: 'Đánh giá dịch vụ',
      message: 'Vui lòng đánh giá chất lượng dịch vụ chăm sóc tuần vừa qua.',
      type: 'system',
      priority: 'low',
      isRead: true,
      createdAt: '2024-12-17T11:00:00Z',
      familyId: '1',
      actionRequired: true,
      actionText: 'Đánh giá',
    },
  ]);

  const handleAlertPress = (alert: AlertItem) => {
    // Mark as read
    if (!alert.isRead) {
      setAlerts(prev => 
        prev.map(a => a.id === alert.id ? { ...a, isRead: true } : a)
      );
    }
    
    router.push(`/alert-detail?id=${alert.id}`);
  };

  const handleMarkAllAsRead = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })));
  };

  const handleActionPress = (alert: AlertItem) => {
    RNAlert.alert(
      alert.title,
      `Thực hiện hành động: ${alert.actionText}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xác nhận', 
          onPress: () => {
            // Mark as read and handle action
            setAlerts(prev => 
              prev.map(a => a.id === alert.id ? { ...a, isRead: true } : a)
            );
            console.log(`Action performed: ${alert.actionText}`);
          }
        },
      ]
    );
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'health': return 'medical';
      case 'appointment': return 'calendar';
      case 'payment': return 'card';
      case 'system': return 'settings';
      case 'urgent': return 'warning';
      default: return 'notifications';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'health': return '#e74c3c';
      case 'appointment': return '#3498db';
      case 'payment': return '#27ae60';
      case 'system': return '#95a5a6';
      case 'urgent': return '#f39c12';
      default: return '#4ECDC4';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#e74c3c';
      case 'high': return '#f39c12';
      case 'medium': return '#3498db';
      case 'low': return '#95a5a6';
      default: return '#4ECDC4';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'critical': return 'Khẩn cấp';
      case 'high': return 'Cao';
      case 'medium': return 'Sức khỏe Trung bình';
      case 'low': return 'Thấp';
      default: return 'Không xác định';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Vừa xong';
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ngày trước`;
    }
  };

  const unreadCount = alerts.filter(alert => !alert.isRead).length;
  const criticalCount = alerts.filter(alert => alert.priority === 'critical' && !alert.isRead).length;

  const renderAlertItem = (alert: AlertItem) => (
    <TouchableOpacity
      key={alert.id}
      style={[
        styles.alertItem,
        !alert.isRead && styles.unreadAlert,
        alert.priority === 'critical' && styles.criticalAlert,
      ]}
      onPress={() => handleAlertPress(alert)}
      activeOpacity={0.8}
    >
      <View style={styles.alertHeader}>
        <View style={styles.alertIconContainer}>
          <Ionicons 
            name={getAlertIcon(alert.type) as any} 
            size={20} 
            color={getAlertColor(alert.type)} 
          />
        </View>
        
        <View style={styles.alertContent}>
          <View style={styles.alertTitleRow}>
            <ThemedText style={[
              styles.alertTitle,
              !alert.isRead && styles.unreadText
            ]}>
              {alert.title}
            </ThemedText>
            <View style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(alert.priority) + '20' }
            ]}>
              <ThemedText style={[
                styles.priorityText,
                { color: getPriorityColor(alert.priority) }
              ]}>
                {getPriorityText(alert.priority)}
              </ThemedText>
            </View>
          </View>
          
          <ThemedText style={styles.alertMessage} numberOfLines={2}>
            {alert.message}
          </ThemedText>
          
          <View style={styles.alertFooter}>
            <ThemedText style={styles.alertTime}>
              {formatTime(alert.createdAt)}
            </ThemedText>
            {!alert.isRead && <View style={styles.unreadDot} />}
          </View>
        </View>
      </View>

      {alert.actionRequired && (
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: getAlertColor(alert.type) + '20' }
          ]}
          onPress={(e) => {
            e.stopPropagation();
            handleActionPress(alert);
          }}
        >
          <ThemedText style={[
            styles.actionButtonText,
            { color: getAlertColor(alert.type) }
          ]}>
            {alert.actionText}
          </ThemedText>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Thông báo</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả đã đọc'}
          </ThemedText>
        </View>
        
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllAsRead}>
              <Ionicons name="checkmark-done" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Critical Alerts Banner */}
      {criticalCount > 0 && (
        <View style={styles.criticalBanner}>
          <Ionicons name="warning" size={20} color="white" />
          <ThemedText style={styles.criticalBannerText}>
            {criticalCount} cảnh báo khẩn cấp cần xử lý
          </ThemedText>
        </View>
      )}

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {alerts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off" size={64} color="#ced4da" />
            <ThemedText style={styles.emptyTitle}>Không có thông báo</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Bạn chưa có thông báo nào. Các thông báo quan trọng sẽ hiển thị ở đây.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.alertsList}>
            {/* Unread Alerts */}
            {alerts.filter(alert => !alert.isRead).length > 0 && (
              <>
                <ThemedText style={styles.sectionTitle}>Chưa đọc</ThemedText>
                {alerts
                  .filter(alert => !alert.isRead)
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map(renderAlertItem)}
              </>
            )}

            {/* Read Alerts */}
            {alerts.filter(alert => alert.isRead).length > 0 && (
              <>
                <ThemedText style={styles.sectionTitle}>Đã đọc</ThemedText>
                {alerts
                  .filter(alert => alert.isRead)
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map(renderAlertItem)}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingBottom: 100, // Space for navigation bar
  },
  header: {
    backgroundColor: '#4ECDC4',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  criticalBanner: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  criticalBannerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
  },
  alertsList: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    marginTop: 8,
  },
  alertItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  unreadAlert: {
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  criticalAlert: {
    borderLeftColor: '#e74c3c',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  alertIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  unreadText: {
    fontWeight: 'bold',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  alertMessage: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 8,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertTime: {
    fontSize: 12,
    color: '#95a5a6',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ECDC4',
  },
  actionButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
