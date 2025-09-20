import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Request, RequestPriority, RequestStatus } from '@/types/request';

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams();
  const [request, setRequest] = useState<Request | null>(null);

  // Mock data - in real app, fetch by id
  const mockRequest: Request = {
    id: '1',
    type: 'booking',
    status: 'pending',
    priority: 'high',
    title: 'Yêu cầu chăm sóc buổi sáng',
    description: 'Cần người chăm sóc cho bà Nguyễn Thị Lan vào buổi sáng từ 7h-11h. Bà Lan bị tiểu đường và cần hỗ trợ uống thuốc đúng giờ.',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
    dueDate: '2024-01-20T00:00:00Z',
    requester: {
      id: 'elderly1',
      name: 'Nguyễn Văn A',
      avatar: 'https://via.placeholder.com/40x40/4ECDC4/FFFFFF?text=NA',
      type: 'elderly'
    },
    recipient: {
      id: 'caregiver1',
      name: 'Nguyễn Thị Mai',
      avatar: 'https://via.placeholder.com/40x40/FF6B6B/FFFFFF?text=NM',
      type: 'caregiver'
    },
    elderlyId: 'elderly1',
    caregiverId: 'caregiver1',
    bookingDetails: {
      startDate: '2024-01-20',
      endDate: '2024-01-25',
      startTime: '07:00',
      endTime: '11:00',
      duration: 'daily',
      hourlyRate: 200000,
      totalAmount: 1000000,
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      timeSlots: ['morning'],
      specialRequirements: 'Cần kinh nghiệm chăm sóc người già bị tiểu đường'
    },
    messages: [
      {
        id: 'msg1',
        senderId: 'elderly1',
        senderName: 'Nguyễn Văn A',
        content: 'Xin chào, tôi muốn đặt lịch chăm sóc cho mẹ tôi vào tuần tới.',
        timestamp: '2024-01-15T08:00:00Z',
        type: 'text',
        isRead: true
      },
      {
        id: 'msg2',
        senderId: 'caregiver1',
        senderName: 'Nguyễn Thị Mai',
        content: 'Chào anh, tôi có thể hỗ trợ chăm sóc bà. Anh có thể cho tôi biết thêm về tình trạng sức khỏe của bà không?',
        timestamp: '2024-01-15T08:30:00Z',
        type: 'text',
        isRead: true
      }
    ],
    actions: [
      {
        id: 'action1',
        action: 'created',
        actorId: 'elderly1',
        actorName: 'Nguyễn Văn A',
        timestamp: '2024-01-15T08:00:00Z'
      }
    ]
  };

  React.useEffect(() => {
    // In real app, fetch request by id
    setRequest(mockRequest);
  }, [id]);

  if (!request) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ThemedText>Đang tải...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case 'pending': return '#FECA57';
      case 'accepted': return '#48CAE4';
      case 'rejected': return '#FF6B6B';
      case 'cancelled': return '#6C757D';
      case 'completed': return '#4ECDC4';
      default: return '#6C757D';
    }
  };

  const getStatusText = (status: RequestStatus) => {
    switch (status) {
      case 'pending': return 'Chờ phản hồi';
      case 'accepted': return 'Đã chấp nhận';
      case 'rejected': return 'Đã từ chối';
      case 'cancelled': return 'Đã hủy';
      case 'completed': return 'Hoàn thành';
      default: return 'Không xác định';
    }
  };

  const getPriorityColor = (priority: RequestPriority) => {
    switch (priority) {
      case 'low': return '#4ECDC4';
      case 'medium': return '#FECA57';
      case 'high': return '#FF6B6B';
      case 'urgent': return '#E74C3C';
      default: return '#6C757D';
    }
  };

  const getPriorityText = (priority: RequestPriority) => {
    switch (priority) {
      case 'low': return '';
      case 'medium': return '';
      case 'high': return '';
      case 'urgent': return 'Khẩn cấp';
      default: return '';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'booking': return 'Đặt lịch';
      case 'counter': return 'Phản đề xuất';
      case 'modification': return 'Chỉnh sửa';
      default: return 'Không xác định';
    }
  };

  const handleAccept = () => {
    Alert.alert(
      'Chấp nhận yêu cầu',
      'Bạn có chắc chắn muốn chấp nhận yêu cầu này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Chấp nhận', onPress: () => console.log('Accepted') }
      ]
    );
  };

  const handleReject = () => {
    Alert.alert(
      'Từ chối yêu cầu',
      'Bạn có chắc chắn muốn từ chối yêu cầu này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Từ chối', onPress: () => console.log('Rejected') }
      ]
    );
  };

  const handleCounter = () => {
    Alert.alert(
      'Phản đề xuất',
      'Bạn muốn đưa ra đề xuất khác cho yêu cầu này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Tạo phản đề xuất', onPress: () => console.log('Countered') }
      ]
    );
  };

  const renderBookingDetails = () => {
    if (!request.bookingDetails) return null;

    const { bookingDetails } = request;
    
    return (
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Chi tiết đặt lịch</ThemedText>
        
        <View style={styles.detailRow}>
          <ThemedText style={styles.detailLabel}>Thời gian:</ThemedText>
          <ThemedText style={styles.detailValue}>
            {new Date(bookingDetails.startDate).toLocaleDateString('vi-VN')} - {new Date(bookingDetails.endDate).toLocaleDateString('vi-VN')}
          </ThemedText>
        </View>

        {bookingDetails.startTime && bookingDetails.endTime && (
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Giờ làm việc:</ThemedText>
            <ThemedText style={styles.detailValue}>
              {bookingDetails.startTime} - {bookingDetails.endTime}
            </ThemedText>
          </View>
        )}

        <View style={styles.detailRow}>
          <ThemedText style={styles.detailLabel}>Tần suất:</ThemedText>
          <ThemedText style={styles.detailValue}>
            {bookingDetails.duration === 'hourly' ? 'Theo giờ' :
             bookingDetails.duration === 'daily' ? 'Hàng ngày' :
             bookingDetails.duration === 'weekly' ? 'Hàng tuần' :
             bookingDetails.duration === 'monthly' ? 'Hàng tháng' : 'Không giới hạn'}
          </ThemedText>
        </View>

        {bookingDetails.hourlyRate && (
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Giá/giờ:</ThemedText>
            <ThemedText style={styles.detailValue}>
              {bookingDetails.hourlyRate.toLocaleString('vi-VN')}đ
            </ThemedText>
          </View>
        )}

        {bookingDetails.totalAmount && (
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Tổng tiền:</ThemedText>
            <ThemedText style={[styles.detailValue, styles.totalAmount]}>
              {bookingDetails.totalAmount.toLocaleString('vi-VN')}đ
            </ThemedText>
          </View>
        )}

        {bookingDetails.specialRequirements && (
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Yêu cầu đặc biệt:</ThemedText>
            <ThemedText style={styles.detailValue}>
              {bookingDetails.specialRequirements}
            </ThemedText>
          </View>
        )}
      </View>
    );
  };

  const renderMessages = () => {
    if (!request.messages || request.messages.length === 0) return null;

    return (
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Tin nhắn</ThemedText>
        {request.messages.map((message) => (
          <View key={message.id} style={styles.messageItem}>
            <ThemedText style={styles.messageSender}>{message.senderName}</ThemedText>
            <ThemedText style={styles.messageContent}>{message.content}</ThemedText>
            <ThemedText style={styles.messageTime}>
              {new Date(message.timestamp).toLocaleString('vi-VN')}
            </ThemedText>
          </View>
        ))}
      </View>
    );
  };

  const renderActions = () => {
    if (request.status !== 'pending') return null;

    return (
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Hành động</ThemedText>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.actionButton, styles.acceptButton]} onPress={handleAccept}>
            <Ionicons name="checkmark" size={20} color="white" />
            <ThemedText style={styles.actionButtonText}>Chấp nhận</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={handleReject}>
            <Ionicons name="close" size={20} color="white" />
            <ThemedText style={styles.actionButtonText}>Từ chối</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.counterButton]} onPress={handleCounter}>
            <Ionicons name="swap-horizontal" size={20} color="white" />
            <ThemedText style={styles.actionButtonText}>Phản đề xuất</ThemedText>
          </TouchableOpacity>
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
          <ThemedText style={styles.headerTitle}>Chi tiết yêu cầu</ThemedText>
          <ThemedText style={styles.headerSubtitle}>{request.title}</ThemedText>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status and Priority */}
         <View style={styles.section}>
           <View style={styles.statusContainer}>
             <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
               <ThemedText style={styles.statusText}>{getStatusText(request.status)}</ThemedText>
             </View>
             {getPriorityText(request.priority) && (
               <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(request.priority) }]}>
                 <ThemedText style={styles.priorityText}>{getPriorityText(request.priority)}</ThemedText>
               </View>
             )}
           </View>
         </View>

        {/* Description */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Mô tả</ThemedText>
          <ThemedText style={styles.description}>{request.description}</ThemedText>
        </View>

        {/* Participants */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Người tham gia</ThemedText>
          <View style={styles.participantContainer}>
            <View style={styles.participant}>
              <ThemedText style={styles.participantLabel}>Người yêu cầu:</ThemedText>
              <ThemedText style={styles.participantName}>{request.requester.name}</ThemedText>
            </View>
            <View style={styles.participant}>
              <ThemedText style={styles.participantLabel}>Người nhận:</ThemedText>
              <ThemedText style={styles.participantName}>{request.recipient.name}</ThemedText>
            </View>
          </View>
        </View>

        {/* Booking Details */}
        {renderBookingDetails()}

        {/* Messages */}
        {renderMessages()}

        {/* Actions */}
        {renderActions()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#4ECDC4',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 12,
  },
  statusText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priorityText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  participantContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  participant: {
    flex: 1,
  },
  participantLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  participantName: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6c757d',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  totalAmount: {
    color: '#4ECDC4',
    fontWeight: 'bold',
  },
  messageItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  messageSender: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  messageContent: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 12,
    color: '#6c757d',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  acceptButton: {
    backgroundColor: '#4ECDC4',
  },
  rejectButton: {
    backgroundColor: '#FF6B6B',
  },
  counterButton: {
    backgroundColor: '#FECA57',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
});
