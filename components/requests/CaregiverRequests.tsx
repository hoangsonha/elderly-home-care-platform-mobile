import { ThemedText } from '@/components/themed-text';
import { CaregiverRequest, ScheduleRequest, VideoCallRequest } from '@/types/request';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface CaregiverRequestsProps {
  onChatPress?: (caregiver: any) => void;
  onBookPress?: (caregiver: any) => void;
}

export function CaregiverRequests({ onChatPress, onBookPress }: CaregiverRequestsProps) {
  const [activeStatus, setActiveStatus] = useState<'waiting_response' | 'responded' | 'accepted' | 'rejected'>('waiting_response');
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CaregiverRequest | null>(null);
  const [modifyMessage, setModifyMessage] = useState('');
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState('');

  // Mock data
  const caregiverRequests: CaregiverRequest[] = [
    {
      id: '1',
      type: 'video_call',
      caregiver: {
        id: '1',
        name: 'Trần Thị B',
        avatar: 'https://via.placeholder.com/60',
        rating: 4.8,
        experience: '5 năm',
        specialties: ['Chăm sóc người già', 'Vật lý trị liệu'],
        hourlyRate: 150000,
        distance: '2.5 km',
        isVerified: true,
        totalReviews: 120,
      },
      family: {
        id: '1',
        name: 'Gia đình Nguyễn',
        members: [],
        elderly: [],
      },
      elderly: {
        id: '1',
        name: 'Nguyễn Thị C',
        age: 75,
        healthStatus: 'medium',
      },
      scheduledTime: '2024-01-25T14:00:00Z',
      duration: 30,
      status: 'waiting_response',
      createdAt: '2024-01-20T10:00:00Z',
    },
    {
      id: '2',
      type: 'schedule',
      caregiver: {
        id: '2',
        name: 'Hoàng Văn F',
        avatar: 'https://via.placeholder.com/60',
        rating: 4.9,
        experience: '7 năm',
        specialties: ['Chăm sóc bệnh nhân', 'Y tá'],
        hourlyRate: 180000,
        distance: '1.8 km',
        isVerified: true,
        totalReviews: 95,
      },
      family: {
        id: '2',
        name: 'Gia đình Phạm',
        members: [],
        elderly: [],
      },
      elderly: {
        id: '2',
        name: 'Phạm Văn G',
        age: 82,
        healthStatus: 'poor',
      },
      requestedSchedule: {
        date: '2024-01-26',
        timeSlots: ['08:00-12:00', '14:00-18:00'],
        tasks: ['Tắm rửa', 'Cho ăn', 'Vật lý trị liệu'],
      },
      status: 'responded',
      caregiverResponse: {
        message: 'Tôi có thể làm vào buổi sáng nhưng buổi chiều có việc riêng. Có thể đổi sang 08:00-16:00 được không?',
        modifiedSchedule: {
          date: '2024-01-26',
          timeSlots: ['08:00-16:00'],
          tasks: ['Tắm rửa', 'Cho ăn', 'Vật lý trị liệu'],
        },
        respondedAt: '2024-01-21T09:30:00Z',
      },
      createdAt: '2024-01-20T15:30:00Z',
    },
    {
      id: '3',
      type: 'video_call',
      caregiver: {
        id: '3',
        name: 'Lê Thị H',
        avatar: 'https://via.placeholder.com/60',
        rating: 4.7,
        experience: '3 năm',
        specialties: ['Chăm sóc người già', 'Tâm lý'],
        hourlyRate: 140000,
        distance: '3.2 km',
        isVerified: true,
        totalReviews: 85,
      },
      family: {
        id: '3',
        name: 'Gia đình Lê',
        members: [],
        elderly: [],
      },
      elderly: {
        id: '3',
        name: 'Lê Văn I',
        age: 78,
        healthStatus: 'good',
      },
      scheduledTime: '2024-01-24T16:00:00Z',
      duration: 45,
      status: 'accepted',
      createdAt: '2024-01-19T11:20:00Z',
    },
    {
      id: '4',
      type: 'schedule',
      caregiver: {
        id: '4',
        name: 'Nguyễn Văn K',
        avatar: 'https://via.placeholder.com/60',
        rating: 4.5,
        experience: '4 năm',
        specialties: ['Chăm sóc người già'],
        hourlyRate: 160000,
        distance: '2.8 km',
        isVerified: false,
        totalReviews: 65,
      },
      family: {
        id: '4',
        name: 'Gia đình Nguyễn',
        members: [],
        elderly: [],
      },
      elderly: {
        id: '4',
        name: 'Nguyễn Thị L',
        age: 80,
        healthStatus: 'medium',
      },
      requestedSchedule: {
        date: '2024-01-27',
        timeSlots: ['09:00-17:00'],
        tasks: ['Chăm sóc cả ngày', 'Cho ăn', 'Đi dạo'],
      },
      status: 'rejected',
      caregiverResponse: {
        message: 'Xin lỗi, tôi không thể nhận lịch này vì đã có lịch khác.',
        respondedAt: '2024-01-21T14:15:00Z',
      },
      createdAt: '2024-01-20T16:45:00Z',
    },
  ];

  const statusTabs = [
    { id: 'waiting_response' as const, title: 'Chờ phản hồi', count: 1 },
    { id: 'responded' as const, title: 'Đã phản hồi', count: 1 },
    { id: 'accepted' as const, title: 'Đã chấp nhận', count: 1 },
    { id: 'rejected' as const, title: 'Đã từ chối', count: 1 },
  ];

  const filteredRequests = caregiverRequests.filter(request => request.status === activeStatus);

  const getRequestTypeText = (type: string) => {
    switch (type) {
      case 'video_call':
        return 'Video Call';
      case 'schedule':
        return 'Đặt lịch';
      default:
        return 'Yêu cầu';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting_response':
        return '#ffa502';
      case 'responded':
        return '#3742fa';
      case 'accepted':
        return '#2ed573';
      case 'rejected':
        return '#ff4757';
      default:
        return '#6c757d';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting_response':
        return 'Chờ phản hồi';
      case 'responded':
        return 'Đã phản hồi';
      case 'accepted':
        return 'Đã chấp nhận';
      case 'rejected':
        return 'Đã từ chối';
      default:
        return 'Không xác định';
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleModifyRequest = (request: CaregiverRequest) => {
    setSelectedRequest(request);
    setModifyMessage('');
    setShowModifyModal(true);
  };

  const confirmModify = () => {
    if (!selectedRequest || !modifyMessage.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung chỉnh sửa');
      return;
    }

    console.log('Modified:', selectedRequest.id, 'Message:', modifyMessage);
    setShowModifyModal(false);
    setSelectedRequest(null);
    setModifyMessage('');
  };

  const handleAcceptRequest = (request: CaregiverRequest) => {
    console.log('Accepted request:', request.id);
    Alert.alert('Thành công', 'Đã chấp nhận yêu cầu');
  };

  const handleRejectRequest = (request: CaregiverRequest) => {
    console.log('Rejected request:', request.id);
    Alert.alert('Thông báo', 'Đã từ chối yêu cầu');
  };

  const handleRespondAgain = (request: CaregiverRequest) => {
    setSelectedRequest(request);
    setShowTimeModal(true);
  };

  const confirmTimeChange = () => {
    if (!selectedRequest || !selectedDateTime.trim()) {
      Alert.alert('Lỗi', 'Vui lòng chọn thời gian mới');
      return;
    }

    console.log('Time changed for request:', selectedRequest.id, 'New time:', selectedDateTime);
    setShowTimeModal(false);
    setSelectedRequest(null);
    setSelectedDateTime('');
    Alert.alert('Thành công', 'Đã gửi phản hồi với thời gian mới');
  };

  const renderVideoCallRequest = (request: VideoCallRequest) => (
    <TouchableOpacity 
      style={styles.requestCard}
      onPress={() => {
        // Navigate to caregiver detail
        router.push(`/careseeker/caregiver-detail?id=${request.caregiver.id}&name=${request.caregiver.name}`);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.requestHeader}>
        <View style={styles.requestInfo}>
          <ThemedText style={styles.requestType}>
            {getRequestTypeText(request.type)}
          </ThemedText>
          <ThemedText style={styles.caregiverName}>
            Với: {request.caregiver.name}
          </ThemedText>
          <ThemedText style={styles.elderlyName}>
            Cho: {request.elderly.name}
          </ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
          <ThemedText style={styles.statusText}>
            {getStatusText(request.status)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.scheduleInfo}>
        <ThemedText style={styles.sectionTitle}>Thông tin cuộc gọi:</ThemedText>
        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={16} color="#6c757d" />
          <ThemedText style={styles.infoText}>
            {formatDateTime(request.scheduledTime)}
          </ThemedText>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time" size={16} color="#6c757d" />
          <ThemedText style={styles.infoText}>
            Thời lượng: {request.duration} phút
          </ThemedText>
        </View>
      </View>

      {request.caregiverResponse && (
        <View style={styles.responseSection}>
          <ThemedText style={styles.sectionTitle}>Phản hồi từ người chăm sóc:</ThemedText>
          <View style={styles.responseBox}>
            <ThemedText style={styles.responseText}>
              {request.caregiverResponse.message}
            </ThemedText>
            {request.caregiverResponse.newScheduledTime && (
              <View style={styles.infoRow}>
                <Ionicons name="calendar" size={16} color="#4ECDC4" />
                <ThemedText style={styles.infoText}>
                  Thời gian mới: {formatDateTime(request.caregiverResponse.newScheduledTime)}
                </ThemedText>
              </View>
            )}
            <ThemedText style={styles.responseTime}>
              Phản hồi lúc: {formatDateTime(request.caregiverResponse.respondedAt)}
            </ThemedText>
          </View>
        </View>
      )}

      {request.status === 'responded' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleAcceptRequest(request)}
          >
            <Ionicons name="checkmark" size={16} color="white" />
            <ThemedText style={styles.acceptButtonText}>Chấp nhận</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.respondButton]}
            onPress={() => handleRespondAgain(request)}
          >
            <Ionicons name="time" size={16} color="white" />
            <ThemedText style={styles.respondButtonText}>Phản hồi lại</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleRejectRequest(request)}
          >
            <Ionicons name="close" size={16} color="white" />
            <ThemedText style={styles.rejectButtonText}>Từ chối</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderScheduleRequest = (request: ScheduleRequest) => (
    <TouchableOpacity 
      style={styles.requestCard}
      onPress={() => {
        // Navigate to caregiver detail
        router.push(`/careseeker/caregiver-detail?id=${request.caregiver.id}&name=${request.caregiver.name}`);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.requestHeader}>
        <View style={styles.requestInfo}>
          <ThemedText style={styles.requestType}>
            {getRequestTypeText(request.type)}
          </ThemedText>
          <ThemedText style={styles.caregiverName}>
            Với: {request.caregiver.name}
          </ThemedText>
          <ThemedText style={styles.elderlyName}>
            Cho: {request.elderly.name}
          </ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
          <ThemedText style={styles.statusText}>
            {getStatusText(request.status)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.scheduleInfo}>
        <ThemedText style={styles.sectionTitle}>Lịch yêu cầu:</ThemedText>
        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={16} color="#6c757d" />
          <ThemedText style={styles.infoText}>
            Ngày: {new Date(request.requestedSchedule.date).toLocaleDateString('vi-VN')}
          </ThemedText>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time" size={16} color="#6c757d" />
          <ThemedText style={styles.infoText}>
            Khung giờ: {request.requestedSchedule.timeSlots.join(', ')}
          </ThemedText>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="list" size={16} color="#6c757d" />
          <ThemedText style={styles.infoText}>
            Nhiệm vụ: {request.requestedSchedule.tasks.join(', ')}
          </ThemedText>
        </View>
      </View>

      {request.caregiverResponse && (
        <View style={styles.responseSection}>
          <ThemedText style={styles.sectionTitle}>Phản hồi từ người chăm sóc:</ThemedText>
          <View style={styles.responseBox}>
            <ThemedText style={styles.responseText}>
              {request.caregiverResponse.message}
            </ThemedText>
            {request.caregiverResponse.modifiedSchedule && (
              <View style={styles.modifiedSchedule}>
                <ThemedText style={styles.modifiedTitle}>Lịch đã chỉnh sửa:</ThemedText>
                <View style={styles.infoRow}>
                  <Ionicons name="calendar" size={16} color="#4ECDC4" />
                  <ThemedText style={styles.infoText}>
                    Ngày: {new Date(request.caregiverResponse.modifiedSchedule.date).toLocaleDateString('vi-VN')}
                  </ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="time" size={16} color="#4ECDC4" />
                  <ThemedText style={styles.infoText}>
                    Khung giờ: {request.caregiverResponse.modifiedSchedule.timeSlots.join(', ')}
                  </ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="list" size={16} color="#4ECDC4" />
                  <ThemedText style={styles.infoText}>
                    Nhiệm vụ: {request.caregiverResponse.modifiedSchedule.tasks.join(', ')}
                  </ThemedText>
                </View>
              </View>
            )}
            <ThemedText style={styles.responseTime}>
              Phản hồi lúc: {formatDateTime(request.caregiverResponse.respondedAt)}
            </ThemedText>
          </View>
        </View>
      )}

      {request.status === 'responded' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleAcceptRequest(request)}
          >
            <Ionicons name="checkmark" size={16} color="white" />
            <ThemedText style={styles.acceptButtonText}>Chấp nhận</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.respondButton]}
            onPress={() => handleRespondAgain(request)}
          >
            <Ionicons name="time" size={16} color="white" />
            <ThemedText style={styles.respondButtonText}>Phản hồi lại</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleRejectRequest(request)}
          >
            <Ionicons name="close" size={16} color="white" />
            <ThemedText style={styles.rejectButtonText}>Từ chối</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderRequest = ({ item }: { item: CaregiverRequest }) => {
    switch (item.type) {
      case 'video_call':
        return renderVideoCallRequest(item as VideoCallRequest);
      case 'schedule':
        return renderScheduleRequest(item as ScheduleRequest);
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Status Tabs - Horizontal Scroll */}
      <View style={styles.statusTabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.statusTabsScrollContainer}
        >
          {statusTabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.statusTab, activeStatus === tab.id && styles.activeStatusTab]}
              onPress={() => setActiveStatus(tab.id)}
              activeOpacity={0.7}
            >
              <ThemedText
                style={[
                  styles.statusTabText,
                  activeStatus === tab.id && styles.activeStatusTabText,
                ]}
              >
                {tab.title} {tab.count > 0 && `(${tab.count})`}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Requests List */}
      <FlatList
        data={filteredRequests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Modify Modal */}
      <Modal
        visible={showModifyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModifyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Chỉnh sửa yêu cầu</ThemedText>
            <TextInput
              style={styles.messageInput}
              placeholder="Nhập nội dung chỉnh sửa..."
              value={modifyMessage}
              onChangeText={setModifyMessage}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModifyModal(false)}
              >
                <ThemedText style={styles.cancelButtonText}>Hủy</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmModify}
              >
                <ThemedText style={styles.confirmButtonText}>Gửi lại</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Time Selection Modal */}
      <Modal
        visible={showTimeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTimeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Chọn thời gian mới</ThemedText>
            
            <View style={styles.timeSelectionContainer}>
              <ThemedText style={styles.timeSelectionLabel}>Thời gian mới:</ThemedText>
              <TextInput
                style={styles.timeInput}
                placeholder="VD: 25/01/2024 15:30"
                value={selectedDateTime}
                onChangeText={setSelectedDateTime}
              />
              <ThemedText style={styles.timeNote}>
                Nhập thời gian theo định dạng: DD/MM/YYYY HH:MM
              </ThemedText>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowTimeModal(false)}
              >
                <ThemedText style={styles.cancelButtonText}>Hủy</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmTimeChange}
              >
                <ThemedText style={styles.confirmButtonText}>Xác nhận</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  statusTabsContainer: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  statusTabsScrollContainer: {
    paddingHorizontal: 16,
  },
  statusTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  activeStatusTab: {
    backgroundColor: '#4ECDC4',
  },
  statusTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6c757d',
  },
  activeStatusTabText: {
    color: 'white',
    fontWeight: '600',
  },
  statusBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff4757',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  listContainer: {
    padding: 16,
  },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  requestInfo: {
    flex: 1,
  },
  requestType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  caregiverName: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  elderlyName: {
    fontSize: 14,
    color: '#6c757d',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  scheduleInfo: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  responseSection: {
    marginBottom: 16,
  },
  responseBox: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  responseText: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 8,
  },
  responseTime: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  modifiedSchedule: {
    backgroundColor: '#e6f4fe',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  modifiedTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4ECDC4',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  modifyButton: {
    backgroundColor: '#3742fa',
  },
  modifyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  // New button styles
  acceptButton: {
    backgroundColor: '#2ed573',
  },
  acceptButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  respondButton: {
    backgroundColor: '#3742fa',
  },
  respondButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  rejectButton: {
    backgroundColor: '#ff4757',
  },
  rejectButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  // Time selection modal styles
  timeSelectionContainer: {
    marginBottom: 20,
  },
  timeSelectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 8,
  },
  timeNote: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#2c3e50',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  confirmButton: {
    backgroundColor: '#3742fa',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});
