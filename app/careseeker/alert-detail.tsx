import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
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

interface AlertDetail {
  id: string;
  title: string;
  message: string;
  fullMessage: string;
  type: 'health' | 'appointment' | 'payment' | 'system' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  createdAt: string;
  familyId?: string;
  elderlyId?: string;
  elderlyName?: string;
  actionRequired?: boolean;
  actionText?: string;
  relatedData?: {
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
    appointmentTime?: string;
    caregiverName?: string;
    amount?: string;
    paymentMethod?: string;
  };
}

export default function AlertDetailScreen() {
  const { id } = useLocalSearchParams();
  const [isRead, setIsRead] = useState(false);

  // Mock data - in real app, this would come from API based on id
  const alert: AlertDetail = {
    id: id as string,
    title: 'Cảnh báo sức khỏe',
    message: 'Bà Nguyễn Thị Lan có dấu hiệu huyết áp cao bất thường. Vui lòng kiểm tra ngay.',
    fullMessage: 'Hệ thống theo dõi sức khỏe đã phát hiện huyết áp của Bà Nguyễn Thị Lan tăng cao bất thường. Chỉ số huyết áp hiện tại là 180/110 mmHg, vượt quá ngưỡng an toàn. Đây có thể là dấu hiệu của tình trạng tăng huyết áp cấp tính cần được xử lý ngay lập tức.\n\nKhuyến nghị:\n• Kiểm tra lại huyết áp sau 15 phút\n• Liên hệ bác sĩ hoặc đưa đến cơ sở y tế gần nhất\n• Theo dõi các triệu chứng khác như đau đầu, chóng mặt\n• Đảm bảo uống đủ nước và nghỉ ngơi',
    type: 'health',
    priority: 'critical',
    isRead: false,
    createdAt: '2024-12-19T10:30:00Z',
    familyId: '1',
    elderlyId: '1',
    elderlyName: 'Bà Nguyễn Thị Lan',
    actionRequired: true,
    actionText: 'Kiểm tra ngay',
    relatedData: {
      bloodPressure: '180/110 mmHg',
      heartRate: '95 bpm',
      temperature: '36.8°C',
    },
  };

  const handleActionPress = () => {
    RNAlert.alert(
      'Xác nhận hành động',
      `Bạn có chắc chắn muốn thực hiện: ${alert.actionText}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xác nhận', 
          onPress: () => {
            setIsRead(true);
            RNAlert.alert('Thành công', 'Hành động đã được thực hiện!');
          }
        },
      ]
    );
  };

  const handleCallDoctor = () => {
    RNAlert.alert(
      'Gọi bác sĩ',
      'Bạn có muốn gọi bác sĩ của Bà Nguyễn Thị Lan không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Gọi', onPress: () => console.log('Calling doctor...') },
      ]
    );
  };

  const handleViewElderlyProfile = () => {
    if (alert.elderlyId) {
      router.push(`/careseeker/elderly-detail?id=${alert.elderlyId}`);
    }
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderHealthData = () => {
    if (alert.type !== 'health' || !alert.relatedData) return null;

    return (
      <View style={styles.dataSection}>
        <ThemedText style={styles.sectionTitle}>Dữ liệu sức khỏe</ThemedText>
        <View style={styles.dataGrid}>
          {alert.relatedData.bloodPressure && (
            <View style={styles.dataItem}>
              <Ionicons name="pulse" size={20} color="#e74c3c" />
              <View style={styles.dataContent}>
                <ThemedText style={styles.dataLabel}>Huyết áp</ThemedText>
                <ThemedText style={[styles.dataValue, { color: '#e74c3c' }]}>
                  {alert.relatedData.bloodPressure}
                </ThemedText>
              </View>
            </View>
          )}
          {alert.relatedData.heartRate && (
            <View style={styles.dataItem}>
              <Ionicons name="heart" size={20} color="#e74c3c" />
              <View style={styles.dataContent}>
                <ThemedText style={styles.dataLabel}>Nhịp tim</ThemedText>
                <ThemedText style={styles.dataValue}>
                  {alert.relatedData.heartRate}
                </ThemedText>
              </View>
            </View>
          )}
          {alert.relatedData.temperature && (
            <View style={styles.dataItem}>
              <Ionicons name="thermometer" size={20} color="#e74c3c" />
              <View style={styles.dataContent}>
                <ThemedText style={styles.dataLabel}>Nhiệt độ</ThemedText>
                <ThemedText style={styles.dataValue}>
                  {alert.relatedData.temperature}
                </ThemedText>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderAppointmentData = () => {
    if (alert.type !== 'appointment' || !alert.relatedData) return null;

    return (
      <View style={styles.dataSection}>
        <ThemedText style={styles.sectionTitle}>Thông tin lịch hẹn</ThemedText>
        <View style={styles.dataList}>
          {alert.relatedData.appointmentTime && (
            <View style={styles.dataItem}>
              <Ionicons name="time" size={20} color="#3498db" />
              <View style={styles.dataContent}>
                <ThemedText style={styles.dataLabel}>Thời gian</ThemedText>
                <ThemedText style={styles.dataValue}>
                  {alert.relatedData.appointmentTime}
                </ThemedText>
              </View>
            </View>
          )}
          {alert.relatedData.caregiverName && (
            <View style={styles.dataItem}>
              <Ionicons name="person" size={20} color="#3498db" />
              <View style={styles.dataContent}>
                <ThemedText style={styles.dataLabel}>Người chăm sóc</ThemedText>
                <ThemedText style={styles.dataValue}>
                  {alert.relatedData.caregiverName}
                </ThemedText>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderPaymentData = () => {
    if (alert.type !== 'payment' || !alert.relatedData) return null;

    return (
      <View style={styles.dataSection}>
        <ThemedText style={styles.sectionTitle}>Thông tin thanh toán</ThemedText>
        <View style={styles.dataList}>
          {alert.relatedData.amount && (
            <View style={styles.dataItem}>
              <Ionicons name="card" size={20} color="#27ae60" />
              <View style={styles.dataContent}>
                <ThemedText style={styles.dataLabel}>Số tiền</ThemedText>
                <ThemedText style={[styles.dataValue, { color: '#27ae60' }]}>
                  {alert.relatedData.amount}
                </ThemedText>
              </View>
            </View>
          )}
          {alert.relatedData.paymentMethod && (
            <View style={styles.dataItem}>
              <Ionicons name="wallet" size={20} color="#27ae60" />
              <View style={styles.dataContent}>
                <ThemedText style={styles.dataLabel}>Phương thức</ThemedText>
                <ThemedText style={styles.dataValue}>
                  {alert.relatedData.paymentMethod}
                </ThemedText>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

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
          <ThemedText style={styles.headerTitle}>Chi tiết thông báo</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {formatDateTime(alert.createdAt)}
          </ThemedText>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Alert Info */}
        <View style={styles.alertInfo}>
          <View style={styles.alertHeader}>
            <View style={[
              styles.alertIconContainer,
              { backgroundColor: getAlertColor(alert.type) + '20' }
            ]}>
              <Ionicons 
                name={getAlertIcon(alert.type) as any} 
                size={24} 
                color={getAlertColor(alert.type)} 
              />
            </View>
            
            <View style={styles.alertTitleContainer}>
              <ThemedText style={styles.alertTitle}>{alert.title}</ThemedText>
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
          </View>

          <ThemedText style={styles.alertMessage}>{alert.message}</ThemedText>
        </View>

        {/* Related Data */}
        {renderHealthData()}
        {renderAppointmentData()}
        {renderPaymentData()}

        {/* Full Message */}
        <View style={styles.messageSection}>
          <ThemedText style={styles.sectionTitle}>Chi tiết</ThemedText>
          <ThemedText style={styles.fullMessage}>{alert.fullMessage}</ThemedText>
        </View>

        {/* Elderly Profile Link */}
        {alert.elderlyId && alert.elderlyName && (
          <View style={styles.elderlySection}>
            <ThemedText style={styles.sectionTitle}>Liên quan đến</ThemedText>
            <TouchableOpacity 
              style={styles.elderlyCard}
              onPress={handleViewElderlyProfile}
            >
              <Ionicons name="person" size={20} color="#4ECDC4" />
              <ThemedText style={styles.elderlyName}>{alert.elderlyName}</ThemedText>
              <Ionicons name="chevron-forward" size={16} color="#6c757d" />
            </TouchableOpacity>
          </View>
        )}

        {/* Actions */}
        {alert.actionRequired && (
          <View style={styles.actionsSection}>
            <ThemedText style={styles.sectionTitle}>Hành động</ThemedText>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: getAlertColor(alert.type) }
              ]}
              onPress={handleActionPress}
            >
              <Ionicons name="checkmark" size={20} color="white" />
              <ThemedText style={styles.actionButtonText}>
                {alert.actionText}
              </ThemedText>
            </TouchableOpacity>

            {alert.type === 'health' && (
              <TouchableOpacity
                style={styles.secondaryActionButton}
                onPress={handleCallDoctor}
              >
                <Ionicons name="call" size={20} color="#4ECDC4" />
                <ThemedText style={styles.secondaryActionText}>
                  Gọi bác sĩ
                </ThemedText>
              </TouchableOpacity>
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
    fontSize: 18,
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
  moreButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  content: {
    flex: 1,
  },
  alertInfo: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 12,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  alertTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  alertMessage: {
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 24,
  },
  dataSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  dataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  dataList: {
    gap: 16,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
  },
  dataContent: {
    marginLeft: 12,
    flex: 1,
  },
  dataLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  dataValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  messageSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 12,
  },
  fullMessage: {
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 24,
  },
  elderlySection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 12,
  },
  elderlyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    gap: 12,
  },
  elderlyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  actionsSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  secondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4ECDC4',
    gap: 8,
  },
  secondaryActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ECDC4',
  },
});
