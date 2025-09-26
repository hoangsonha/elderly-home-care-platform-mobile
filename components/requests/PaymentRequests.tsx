import { ThemedText } from '@/components/themed-text';
import { PaymentRequest } from '@/types/request';
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

export function PaymentRequests() {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Mock data - Payment requests are the same as in FamilyRequests but focused on payment
  const paymentRequests: PaymentRequest[] = [
    {
      id: '1',
      type: 'payment',
      requester: {
        id: '1',
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@email.com',
        phone: '0123456789',
        role: 'admin',
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
      paymentInfo: {
        month: 'Tháng 8',
        year: 2024,
        amount: 2400000,
        description: 'Lương tháng 8 cho chăm sóc bà Nguyễn Thị C',
      },
      status: 'pending',
      createdAt: '2024-01-20T10:00:00Z',
    },
    {
      id: '2',
      type: 'payment',
      requester: {
        id: '2',
        name: 'Phạm Thị E',
        email: 'phamthie@email.com',
        phone: '0369852147',
        role: 'admin',
        joinedDate: '2024-01-10',
      },
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
      elderly: {
        id: '2',
        name: 'Phạm Văn G',
        age: 82,
        healthStatus: 'poor',
      },
      family: {
        id: '2',
        name: 'Gia đình Phạm',
        members: [],
        elderly: [],
      },
      paymentInfo: {
        month: 'Tháng 7',
        year: 2024,
        amount: 3200000,
        description: 'Lương tháng 7 cho chăm sóc ông Phạm Văn G (bao gồm ca đêm)',
      },
      status: 'approved',
      createdAt: '2024-01-18T09:15:00Z',
    },
    {
      id: '3',
      type: 'payment',
      requester: {
        id: '3',
        name: 'Lê Văn H',
        email: 'levanh@email.com',
        phone: '0987654321',
        role: 'admin',
        joinedDate: '2024-01-05',
      },
      caregiver: {
        id: '3',
        name: 'Lê Thị I',
        avatar: 'https://via.placeholder.com/60',
        rating: 4.7,
        experience: '3 năm',
        specialties: ['Chăm sóc người già', 'Tâm lý'],
        hourlyRate: 140000,
        distance: '3.2 km',
        isVerified: true,
        totalReviews: 85,
      },
      elderly: {
        id: '3',
        name: 'Lê Văn J',
        age: 78,
        healthStatus: 'good',
      },
      family: {
        id: '3',
        name: 'Gia đình Lê',
        members: [],
        elderly: [],
      },
      paymentInfo: {
        month: 'Tháng 8',
        year: 2024,
        amount: 1800000,
        description: 'Lương tháng 8 cho chăm sóc ông Lê Văn J',
      },
      status: 'rejected',
      rejectionReason: 'Số tiền không khớp với thỏa thuận ban đầu',
      createdAt: '2024-01-17T14:30:00Z',
    },
  ];

  const handleApprove = (request: PaymentRequest) => {
    Alert.alert(
      'Xác nhận thanh toán',
      `Bạn có chắc chắn muốn phê duyệt thanh toán ${request.paymentInfo.amount.toLocaleString('vi-VN')}đ cho ${request.caregiver.name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Phê duyệt', onPress: () => console.log('Payment approved:', request.id) },
      ]
    );
  };

  const handleReject = (request: PaymentRequest) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập lý do từ chối');
      return;
    }

    console.log('Payment rejected:', selectedRequest.id, 'Reason:', rejectionReason);
    setShowRejectModal(false);
    setSelectedRequest(null);
    setRejectionReason('');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderPaymentRequest = (request: PaymentRequest) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.requestInfo}>
          <ThemedText style={styles.requestType}>Thanh toán lương</ThemedText>
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

      {/* Payment Information */}
      <View style={styles.paymentSection}>
        <ThemedText style={styles.sectionTitle}>Thông tin thanh toán:</ThemedText>
        <View style={styles.paymentCard}>
          <View style={styles.amountRow}>
            <Ionicons name="cash" size={24} color="#2ed573" />
            <View style={styles.amountInfo}>
              <ThemedText style={styles.amountText}>
                {request.paymentInfo.amount.toLocaleString('vi-VN')}đ
              </ThemedText>
              <ThemedText style={styles.periodText}>
                {request.paymentInfo.month} {request.paymentInfo.year}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={styles.descriptionText}>
            {request.paymentInfo.description}
          </ThemedText>
        </View>
      </View>

      {/* Caregiver Information */}
      <View style={styles.caregiverSection}>
        <ThemedText style={styles.sectionTitle}>Người chăm sóc:</ThemedText>
        <View style={styles.caregiverInfo}>
          <View style={styles.caregiverAvatar}>
            <ThemedText style={styles.avatarText}>
              {request.caregiver.name ? request.caregiver.name.split(' ').map(n => n[0]).join('') : '?'}
            </ThemedText>
          </View>
          <View style={styles.caregiverDetails}>
            <ThemedText style={styles.caregiverName}>{request.caregiver.name}</ThemedText>
            <View style={styles.caregiverStats}>
              <View style={styles.statItem}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <ThemedText style={styles.statText}>{request.caregiver.rating}</ThemedText>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="time" size={14} color="#6c757d" />
                <ThemedText style={styles.statText}>{request.caregiver.experience}</ThemedText>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="location" size={14} color="#6c757d" />
                <ThemedText style={styles.statText}>{request.caregiver.distance}</ThemedText>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Elderly Information */}
      <View style={styles.elderlySection}>
        <ThemedText style={styles.sectionTitle}>Người già được chăm sóc:</ThemedText>
        <View style={styles.elderlyInfo}>
          <ThemedText style={styles.elderlyName}>{request.elderly.name}</ThemedText>
          <ThemedText style={styles.elderlyAge}>{request.elderly.age} tuổi</ThemedText>
          <View style={styles.healthStatus}>
            <Ionicons 
              name="heart" 
              size={14} 
              color={request.elderly.healthStatus === 'good' ? '#2ed573' : 
                     request.elderly.healthStatus === 'medium' ? '#ffa502' : '#ff4757'} 
            />
            <ThemedText style={styles.healthText}>
              Tình trạng: {
                request.elderly.healthStatus === 'good' ? 'Tốt' :
                request.elderly.healthStatus === 'medium' ? 'Trung bình' : 'Yếu'
              }
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Rejection Reason */}
      {request.status === 'rejected' && request.rejectionReason && (
        <View style={styles.rejectionSection}>
          <ThemedText style={styles.sectionTitle}>Lý do từ chối:</ThemedText>
          <View style={styles.rejectionBox}>
            <ThemedText style={styles.rejectionText}>
              {request.rejectionReason}
            </ThemedText>
          </View>
        </View>
      )}

      {/* Action Buttons */}
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

      {/* Request Date */}
      <View style={styles.dateSection}>
        <Ionicons name="calendar" size={14} color="#6c757d" />
        <ThemedText style={styles.dateText}>
          Yêu cầu lúc: {formatDate(request.createdAt)}
        </ThemedText>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={paymentRequests}
        renderItem={({ item }) => renderPaymentRequest(item)}
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
            <ThemedText style={styles.modalTitle}>Lý do từ chối thanh toán</ThemedText>
            <TextInput
              style={styles.reasonInput}
              placeholder="Nhập lý do từ chối thanh toán..."
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
  paymentSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  paymentCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2ed573',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  amountInfo: {
    flex: 1,
  },
  amountText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2ed573',
  },
  periodText: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  descriptionText: {
    fontSize: 14,
    color: '#2c3e50',
    fontStyle: 'italic',
  },
  caregiverSection: {
    marginBottom: 16,
  },
  caregiverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  caregiverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  caregiverDetails: {
    flex: 1,
  },
  caregiverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  caregiverStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6c757d',
  },
  elderlySection: {
    marginBottom: 16,
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
    marginBottom: 2,
  },
  elderlyAge: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  healthStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  healthText: {
    fontSize: 12,
    color: '#6c757d',
  },
  rejectionSection: {
    marginBottom: 16,
  },
  rejectionBox: {
    backgroundColor: '#ffe6e6',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff4757',
  },
  rejectionText: {
    fontSize: 14,
    color: '#ff4757',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
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
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  dateText: {
    fontSize: 12,
    color: '#6c757d',
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
