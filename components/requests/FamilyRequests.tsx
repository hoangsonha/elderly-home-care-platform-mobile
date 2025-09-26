import { CaregiverCard } from '@/components/caregiver/CaregiverCard';
import { ThemedText } from '@/components/themed-text';
import { FamilyRequest, HireCaregiverRequest, JoinFamilyRequest } from '@/types/request';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface FamilyRequestsProps {
  onChatPress?: (caregiver: any) => void;
  onBookPress?: (caregiver: any) => void;
}

export function FamilyRequests({ onChatPress, onBookPress }: FamilyRequestsProps) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<FamilyRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Mock data
  const familyRequests: FamilyRequest[] = [
    {
      id: '1',
      type: 'hire_caregiver',
      requester: {
        id: '1',
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@email.com',
        phone: '0123456789',
        role: 'member',
        joinedDate: '2024-01-15',
      },
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
      elderly: {
        id: '1',
        name: 'Nguyễn Thị C',
        age: 75,
        healthStatus: 'medium',
      },
      family: {
        id: '1',
        name: 'Gia đình Nguyễn',
        members: [],
        elderly: [],
      },
      status: 'pending',
      createdAt: '2024-01-20T10:00:00Z',
    },
    {
      id: '2',
      type: 'join_family',
      requester: {
        name: 'Lê Văn D',
        email: 'levand@email.com',
        phone: '0987654321',
        avatar: 'https://via.placeholder.com/60',
      },
      targetFamily: {
        id: '1',
        name: 'Gia đình Nguyễn',
        members: [],
        elderly: [],
      },
      status: 'pending',
      createdAt: '2024-01-19T14:30:00Z',
    },
  ];

  const handleApprove = (request: FamilyRequest) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn phê duyệt yêu cầu này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Phê duyệt', onPress: () => console.log('Approved:', request.id) },
      ]
    );
  };

  const handleReject = (request: FamilyRequest) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập lý do từ chối');
      return;
    }

    console.log('Rejected:', selectedRequest.id, 'Reason:', rejectionReason);
    setShowRejectModal(false);
    setSelectedRequest(null);
    setRejectionReason('');
  };

  const getRequestTypeText = (type: string) => {
    switch (type) {
      case 'hire_caregiver':
        return 'Thuê người chăm sóc';
      case 'join_family':
        return 'Tham gia gia đình';
      default:
        return 'Yêu cầu';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#ffa502';
      case 'approved':
        return '#2ed573';
      case 'rejected':
        return '#ff4757';
      default:
        return '#6c757d';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ duyệt';
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Đã từ chối';
      default:
        return 'Không xác định';
    }
  };

  const renderHireCaregiverRequest = (request: HireCaregiverRequest) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.requestInfo}>
          <ThemedText style={styles.requestType}>
            {getRequestTypeText(request.type)}
          </ThemedText>
          <ThemedText style={styles.requesterName}>
            Từ: {request.requester.name}
          </ThemedText>
          <ThemedText style={styles.familyName}>
            Gia đình: {request.family.name}
          </ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
          <ThemedText style={styles.statusText}>
            {getStatusText(request.status)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.caregiverSection}>
        <ThemedText style={styles.sectionTitle}>Người chăm sóc được đề xuất:</ThemedText>
        <CaregiverCard
          caregiver={request.caregiver}
          onPress={() => {}}
          onChatPress={() => onChatPress?.(request.caregiver)}
          onBookPress={() => onBookPress?.(request.caregiver)}
        />
      </View>

      <View style={styles.elderlySection}>
        <ThemedText style={styles.sectionTitle}>Người già cần chăm sóc:</ThemedText>
        <View style={styles.elderlyInfo}>
          <ThemedText style={styles.elderlyName}>{request.elderly.name}</ThemedText>
          <ThemedText style={styles.elderlyAge}>{request.elderly.age} tuổi</ThemedText>
        </View>
      </View>

      {request.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApprove(request)}
          >
            <Ionicons name="checkmark" size={16} color="white" />
            <ThemedText style={styles.approveButtonText}>Duyệt</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleReject(request)}
          >
            <Ionicons name="close" size={16} color="white" />
            <ThemedText style={styles.rejectButtonText}>Từ chối</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderJoinFamilyRequest = (request: JoinFamilyRequest) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.requestInfo}>
          <ThemedText style={styles.requestType}>
            {getRequestTypeText(request.type)}
          </ThemedText>
          <ThemedText style={styles.requesterName}>
            Từ: {request.requester.name}
          </ThemedText>
          <ThemedText style={styles.familyName}>
            Muốn tham gia: {request.targetFamily.name}
          </ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
          <ThemedText style={styles.statusText}>
            {getStatusText(request.status)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.requesterInfo}>
        <ThemedText style={styles.sectionTitle}>Thông tin người yêu cầu:</ThemedText>
        <View style={styles.infoRow}>
          <Ionicons name="person" size={16} color="#6c757d" />
          <ThemedText style={styles.infoText}>{request.requester.name}</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="mail" size={16} color="#6c757d" />
          <ThemedText style={styles.infoText}>{request.requester.email}</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call" size={16} color="#6c757d" />
          <ThemedText style={styles.infoText}>{request.requester.phone}</ThemedText>
        </View>
      </View>

      {request.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApprove(request)}
          >
            <Ionicons name="checkmark" size={16} color="white" />
            <ThemedText style={styles.approveButtonText}>Duyệt</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleReject(request)}
          >
            <Ionicons name="close" size={16} color="white" />
            <ThemedText style={styles.rejectButtonText}>Từ chối</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );


  const renderRequest = ({ item }: { item: FamilyRequest }) => {
    switch (item.type) {
      case 'hire_caregiver':
        return renderHireCaregiverRequest(item as HireCaregiverRequest);
      case 'join_family':
        return renderJoinFamilyRequest(item as JoinFamilyRequest);
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={familyRequests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Reject Modal */}
      <Modal
        visible={showRejectModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRejectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Lý do từ chối</ThemedText>
            <TextInput
              style={styles.reasonInput}
              placeholder="Nhập lý do từ chối..."
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowRejectModal(false)}
              >
                <ThemedText style={styles.cancelButtonText}>Hủy</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmReject}
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
  requesterName: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  familyName: {
    fontSize: 14,
    color: '#6c757d',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  caregiverSection: {
    marginBottom: 16,
  },
  elderlySection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  elderlyInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  elderlyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  elderlyAge: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  requesterInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#2c3e50',
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
  approveButton: {
    backgroundColor: '#2ed573',
  },
  approveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  rejectButton: {
    backgroundColor: '#ff4757',
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
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
  reasonInput: {
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
    backgroundColor: '#ff4757',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});
