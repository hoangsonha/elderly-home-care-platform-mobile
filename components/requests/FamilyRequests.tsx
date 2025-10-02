import { CaregiverCard } from '@/components/caregiver/CaregiverCard';
import { ThemedText } from '@/components/themed-text';
import { AddElderlyToFamilyRequest, FamilyRequest, HireCaregiverRequest, JoinFamilyRequest } from '@/types/request';
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

interface FamilyRequestsProps {
  onChatPress?: (caregiver: any) => void;
  onBookPress?: (caregiver: any) => void;
}

type StatusTab = 'all' | 'pending' | 'waiting_response' | 'responded' | 'approved' | 'rejected' | 'cancelled';
type MemberResponseStatus = 'waiting' | 'accepted' | 'rejected';

export function FamilyRequests({ onChatPress, onBookPress }: FamilyRequestsProps) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<FamilyRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeStatusTab, setActiveStatusTab] = useState<StatusTab>('all');
  const [showMemberResponseModal, setShowMemberResponseModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showConfirmHireModal, setShowConfirmHireModal] = useState(false);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);

  const getFilteredRequests = () => {
    if (activeStatusTab === 'all') {
      return familyRequests;
    }
    return familyRequests.filter(request => request.status === activeStatusTab);
  };

  const getStatusCount = (status: StatusTab) => {
    if (status === 'all') {
      return familyRequests.length;
    }
    return familyRequests.filter(request => request.status === status).length;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ duyệt';
      case 'waiting_response':
        return 'Đang chờ phản hồi';
      case 'responded':
        return 'Đã phản hồi';
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Đã từ chối';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#ffa502';
      case 'waiting_response':
        return '#3498db';
      case 'responded':
        return '#9b59b6';
      case 'approved':
        return '#2ed573';
      case 'rejected':
        return '#ff4757';
      case 'cancelled':
        return '#6c757d';
      default:
        return '#6c757d';
    }
  };

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
        members: [
          { 
            id: '1', 
            name: 'Nguyễn Văn A', 
            role: 'member', 
            responseStatus: 'accepted' as MemberResponseStatus,
            responseComment: 'Tôi đồng ý với việc thuê người chăm sóc này. Cô ấy có kinh nghiệm tốt và phù hợp với nhu cầu của gia đình.',
            respondedAt: '2024-01-20T11:00:00Z'
          },
          { 
            id: '2', 
            name: 'Nguyễn Thị D', 
            role: 'admin', 
            responseStatus: 'waiting' as MemberResponseStatus,
            responseComment: '',
            respondedAt: ''
          },
          { 
            id: '3', 
            name: 'Nguyễn Văn E', 
            role: 'member', 
            responseStatus: 'rejected' as MemberResponseStatus,
            responseComment: 'Tôi không đồng ý vì giá cả quá cao và thời gian làm việc không phù hợp với lịch trình của gia đình.',
            respondedAt: '2024-01-20T12:30:00Z'
          },
        ],
        elderly: [],
      },
      status: 'waiting_response',
      createdAt: '2024-01-20T10:00:00Z',
    },
    {
      id: '2',
      type: 'hire_caregiver',
      requester: {
        id: '2',
        name: 'Lê Văn D',
        email: 'levand@email.com',
        phone: '0987654321',
        role: 'member',
        joinedDate: '2024-01-10',
      },
      caregiver: {
        id: '2',
        name: 'Phạm Thị E',
        avatar: 'https://via.placeholder.com/60',
        rating: 4.6,
        experience: '3 năm',
        specialties: ['Chăm sóc người già', 'Y tá'],
        hourlyRate: 120000,
        distance: '1.8 km',
        isVerified: true,
        totalReviews: 85,
      },
      elderly: {
        id: '2',
        name: 'Lê Thị F',
        age: 68,
        healthStatus: 'good',
      },
      family: {
        id: '2',
        name: 'Gia đình Lê',
        members: [
          { 
            id: '2', 
            name: 'Lê Văn D', 
            role: 'member', 
            responseStatus: 'accepted' as MemberResponseStatus,
            responseComment: 'Tôi hoàn toàn đồng ý với việc thuê người chăm sóc này.',
            respondedAt: '2024-01-19T15:00:00Z'
          },
          { 
            id: '4', 
            name: 'Lê Thị G', 
            role: 'admin', 
            responseStatus: 'accepted' as MemberResponseStatus,
            responseComment: 'Người chăm sóc này có chuyên môn tốt và phù hợp với yêu cầu của gia đình.',
            respondedAt: '2024-01-19T16:00:00Z'
          },
          { 
            id: '5', 
            name: 'Lê Văn H', 
            role: 'member', 
            responseStatus: 'accepted' as MemberResponseStatus,
            responseComment: 'Tôi đồng ý với quyết định này.',
            respondedAt: '2024-01-19T17:00:00Z'
          },
        ],
        elderly: [],
      },
      status: 'responded',
      createdAt: '2024-01-19T14:30:00Z',
    },
    {
      id: '3',
      type: 'join_family',
      requester: {
        name: 'Hoàng Văn I',
        email: 'hoangvani@email.com',
        phone: '0912345678',
        avatar: 'https://via.placeholder.com/60',
      },
      targetFamily: {
        id: '1',
        name: 'Gia đình Nguyễn',
        members: [],
        elderly: [],
      },
      status: 'pending',
      createdAt: '2024-01-18T09:15:00Z',
    },
    {
      id: '4',
      type: 'add_elderly_to_family',
      requester: {
        id: '3',
        name: 'Phạm Thị J',
        email: 'phamthij@email.com',
        phone: '0923456789',
        role: 'member',
        joinedDate: '2024-01-12',
      },
      elderly: {
        id: '3',
        name: 'Phạm Văn K',
        age: 82,
        healthStatus: 'poor',
        avatar: 'https://via.placeholder.com/60',
      },
      family: {
        id: '1',
        name: 'Gia đình Nguyễn',
        members: [],
        elderly: [],
      },
      status: 'pending',
      createdAt: '2024-01-21T09:15:00Z',
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

  const handleMemberPress = (member: any) => {
    setSelectedMember(member);
    setShowMemberResponseModal(true);
  };

  const getMemberResponseText = (status: MemberResponseStatus) => {
    switch (status) {
      case 'waiting':
        return 'Chờ phản hồi';
      case 'accepted':
        return 'Đã chấp nhận';
      case 'rejected':
        return 'Đã từ chối';
      default:
        return 'Không xác định';
    }
  };

  const getMemberResponseColor = (status: MemberResponseStatus) => {
    switch (status) {
      case 'waiting':
        return '#ffa502';
      case 'accepted':
        return '#2ed573';
      case 'rejected':
        return '#ff4757';
      default:
        return '#6c757d';
    }
  };

  const handleCancelService = (request: FamilyRequest) => {
    setSelectedRequest(request);
    setShowCancelConfirmModal(true);
  };

  const confirmCancelService = () => {
    if (!selectedRequest) return;
    
    console.log('Cancelled service:', selectedRequest.id);
    // Update request status to cancelled
    setShowCancelConfirmModal(false);
    setSelectedRequest(null);
  };

  const handleConfirmHire = (request: FamilyRequest) => {
    setSelectedRequest(request);
    setShowConfirmHireModal(true);
  };

  const confirmHire = () => {
    if (!selectedRequest) return;
    
    console.log('Confirmed hire:', selectedRequest.id);
    // Show notification about waiting for caregiver response
    Alert.alert(
      'Thông báo',
      'Đang đợi phản hồi từ người chăm sóc',
      [{ text: 'OK' }]
    );
    setShowConfirmHireModal(false);
    setSelectedRequest(null);
  };

  const getRequestTypeText = (type: string) => {
    switch (type) {
      case 'hire_caregiver':
        return 'Thuê người chăm sóc';
      case 'join_family':
        return 'Tham gia gia đình';
      case 'add_elderly_to_family':
        return 'Thêm người già vào gia đình';
      default:
        return 'Yêu cầu';
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
          onPress={() => {
            // Navigate to caregiver detail
            router.push(`/caregiver-detail?id=${request.caregiver.id}&name=${request.caregiver.name}`);
          }}
          onChatPress={() => onChatPress?.(request.caregiver)}
          onBookPress={() => onBookPress?.(request.caregiver)}
          hideBookingButton={request.status === 'waiting_response' || request.status === 'responded'}
        />
      </View>

      <View style={styles.elderlySection}>
        <ThemedText style={styles.sectionTitle}>Người già cần chăm sóc:</ThemedText>
        <View style={styles.elderlyInfo}>
          <ThemedText style={styles.elderlyName}>{request.elderly.name}</ThemedText>
          <ThemedText style={styles.elderlyAge}>{request.elderly.age} tuổi</ThemedText>
        </View>
      </View>

      {/* Family Members Response Status */}
      {request.family.members && request.family.members.length > 0 && (
        <View style={styles.familyMembersSection}>
          <ThemedText style={styles.sectionTitle}>Thành viên gia đình:</ThemedText>
          <View style={styles.membersList}>
            {request.family.members.map((member, index) => (
              <TouchableOpacity 
                key={member.id} 
                style={styles.memberItem}
                onPress={() => handleMemberPress(member)}
              >
                <View style={styles.memberInfo}>
                  <ThemedText style={styles.memberName}>{member.name}</ThemedText>
                  <ThemedText style={styles.memberRole}>
                    {member.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                  </ThemedText>
                </View>
                <View style={[
                  styles.responseStatus,
                  { backgroundColor: getMemberResponseColor(member.responseStatus) }
                ]}>
                  <ThemedText style={styles.responseStatusText}>
                    {getMemberResponseText(member.responseStatus)}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {request.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleReject(request)}
          >
            <Ionicons name="close" size={16} color="white" />
            <ThemedText style={styles.rejectButtonText}>Từ chối</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {/* Cancel and Confirm buttons for waiting_response and responded statuses */}
      {(request.status === 'waiting_response' || request.status === 'responded') && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleCancelService(request)}
          >
            <ThemedText style={styles.cancelButtonText}>Hủy dịch vụ</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.confirmButton]}
            onPress={() => handleConfirmHire(request)}
          >
            <ThemedText style={styles.confirmButtonText}>Xác nhận thuê</ThemedText>
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

  const renderAddElderlyToFamilyRequest = (request: AddElderlyToFamilyRequest) => (
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

      <View style={styles.elderlySection}>
        <ThemedText style={styles.sectionTitle}>Hồ sơ người già:</ThemedText>
        <TouchableOpacity 
          style={styles.elderlyInfo}
          onPress={() => {
            // Navigate to elderly detail
            router.push(`/elderly-detail?id=${request.elderly.id}`);
          }}
        >
          <View style={styles.elderlyHeader}>
            <View style={styles.elderlyAvatar}>
              <Ionicons name="person" size={24} color="#4ECDC4" />
            </View>
            <View style={styles.elderlyDetails}>
              <ThemedText style={styles.elderlyName}>{request.elderly.name}</ThemedText>
              <ThemedText style={styles.elderlyAge}>{request.elderly.age} tuổi</ThemedText>
              <View style={styles.healthStatusContainer}>
                <ThemedText style={styles.healthStatusLabel}>Tình trạng sức khỏe:</ThemedText>
                <View style={[
                  styles.healthStatusBadge,
                  { backgroundColor: request.elderly.healthStatus === 'good' ? '#2ed573' : 
                                    request.elderly.healthStatus === 'medium' ? '#ffa502' : '#ff4757' }
                ]}>
                  <ThemedText style={styles.healthStatusText}>
                    {request.elderly.healthStatus === 'good' ? 'Tốt' :
                     request.elderly.healthStatus === 'medium' ? 'Trung bình' : 'Kém'}
                  </ThemedText>
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6c757d" />
          </View>
        </TouchableOpacity>
      </View>

      {request.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApprove(request)}
          >
            <Ionicons name="checkmark" size={16} color="white" />
            <ThemedText style={styles.approveButtonText}>Chấp nhận</ThemedText>
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
      case 'add_elderly_to_family':
        return renderAddElderlyToFamilyRequest(item as AddElderlyToFamilyRequest);
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Status Tabs */}
      <View style={styles.statusTabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusTabsScrollContainer}>
          <TouchableOpacity
            style={[styles.statusTab, activeStatusTab === 'all' && styles.statusTabActive]}
            onPress={() => setActiveStatusTab('all')}
          >
            <ThemedText style={[styles.statusTabText, activeStatusTab === 'all' && styles.statusTabTextActive]}>
              Tất cả ({getStatusCount('all')})
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusTab, activeStatusTab === 'pending' && styles.statusTabActive]}
            onPress={() => setActiveStatusTab('pending')}
          >
            <ThemedText style={[styles.statusTabText, activeStatusTab === 'pending' && styles.statusTabTextActive]}>
              Chờ duyệt ({getStatusCount('pending')})
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusTab, activeStatusTab === 'waiting_response' && styles.statusTabActive]}
            onPress={() => setActiveStatusTab('waiting_response')}
          >
            <ThemedText style={[styles.statusTabText, activeStatusTab === 'waiting_response' && styles.statusTabTextActive]}>
              Đang chờ phản hồi ({getStatusCount('waiting_response')})
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusTab, activeStatusTab === 'responded' && styles.statusTabActive]}
            onPress={() => setActiveStatusTab('responded')}
          >
            <ThemedText style={[styles.statusTabText, activeStatusTab === 'responded' && styles.statusTabTextActive]}>
              Đã phản hồi ({getStatusCount('responded')})
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusTab, activeStatusTab === 'approved' && styles.statusTabActive]}
            onPress={() => setActiveStatusTab('approved')}
          >
            <ThemedText style={[styles.statusTabText, activeStatusTab === 'approved' && styles.statusTabTextActive]}>
              Đã duyệt ({getStatusCount('approved')})
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusTab, activeStatusTab === 'rejected' && styles.statusTabActive]}
            onPress={() => setActiveStatusTab('rejected')}
          >
            <ThemedText style={[styles.statusTabText, activeStatusTab === 'rejected' && styles.statusTabTextActive]}>
              Đã từ chối ({getStatusCount('rejected')})
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={getFilteredRequests()}
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

      {/* Member Response Detail Modal */}
      <Modal
        visible={showMemberResponseModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMemberResponseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>
              Phản hồi của {selectedMember?.name}
            </ThemedText>
            
            <View style={styles.memberDetailSection}>
              <View style={styles.memberDetailHeader}>
                <ThemedText style={styles.memberDetailName}>{selectedMember?.name}</ThemedText>
                <ThemedText style={styles.memberDetailRole}>
                  {selectedMember?.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                </ThemedText>
              </View>
              
              <View style={[
                styles.memberDetailStatus,
                { backgroundColor: getMemberResponseColor(selectedMember?.responseStatus) }
              ]}>
                <ThemedText style={styles.memberDetailStatusText}>
                  {getMemberResponseText(selectedMember?.responseStatus)}
                </ThemedText>
              </View>
            </View>

            {selectedMember?.responseStatus === 'waiting' ? (
              <View style={styles.waitingSection}>
                <ThemedText style={styles.waitingText}>
                  Thành viên này chưa phản hồi về yêu cầu thuê người chăm sóc.
                </ThemedText>
              </View>
            ) : (
              <View style={styles.responseDetailSection}>
                <ThemedText style={styles.responseDetailTitle}>Góp ý:</ThemedText>
                <View style={styles.commentBox}>
                  <ThemedText style={styles.commentText}>
                    {selectedMember?.responseComment}
                  </ThemedText>
                </View>
                
                <View style={styles.responseTimeSection}>
                  <ThemedText style={styles.responseTimeLabel}>Thời gian phản hồi:</ThemedText>
                  <ThemedText style={styles.responseTimeText}>
                    {selectedMember?.respondedAt ? 
                      new Date(selectedMember.respondedAt).toLocaleString('vi-VN') : 
                      'Chưa xác định'
                    }
                  </ThemedText>
                </View>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.closeButton]}
                onPress={() => setShowMemberResponseModal(false)}
              >
                <ThemedText style={styles.closeButtonText}>Đóng</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Cancel Service Confirmation Modal */}
      <Modal
        visible={showCancelConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Xác nhận hủy dịch vụ</ThemedText>
            
            <ThemedText style={styles.modalMessage}>
              Bạn có chắc chắn muốn hủy dịch vụ thuê người chăm sóc này không?
            </ThemedText>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setShowCancelConfirmModal(false)}
              >
                <ThemedText style={styles.cancelModalButtonText}>Không</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmModalButton]}
                onPress={confirmCancelService}
              >
                <ThemedText style={styles.confirmModalButtonText}>Có, hủy dịch vụ</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirm Hire Modal */}
      <Modal
        visible={showConfirmHireModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmHireModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Xác nhận thuê người chăm sóc</ThemedText>
            
            {selectedRequest && (
              <View style={styles.memberStatusSummary}>
                <ThemedText style={styles.summaryTitle}>Tình trạng phản hồi từ các thành viên:</ThemedText>
                
                {selectedRequest.family.members.map((member) => (
                  <View key={member.id} style={styles.memberStatusItem}>
                    <ThemedText style={styles.memberStatusName}>{member.name}</ThemedText>
                    <View style={[
                      styles.memberStatusBadge,
                      { backgroundColor: getMemberResponseColor(member.responseStatus) }
                    ]}>
                      <ThemedText style={styles.memberStatusText}>
                        {getMemberResponseText(member.responseStatus)}
                      </ThemedText>
                    </View>
                  </View>
                ))}
                
                <ThemedText style={styles.confirmQuestion}>
                  Bạn có muốn xác nhận thuê người chăm sóc này không?
                </ThemedText>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setShowConfirmHireModal(false)}
              >
                <ThemedText style={styles.cancelModalButtonText}>Hủy</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmModalButton]}
                onPress={confirmHire}
              >
                <ThemedText style={styles.confirmModalButtonText}>Xác nhận thuê</ThemedText>
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
    borderBottomColor: '#E9ECEF',
  },
  statusTabsScrollContainer: {
    paddingHorizontal: 16,
  },
  statusTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  statusTabActive: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },
  statusTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6C757D',
  },
  statusTabTextActive: {
    color: 'white',
    fontWeight: '600',
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
  elderlyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  elderlyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  elderlyDetails: {
    flex: 1,
  },
  healthStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  healthStatusLabel: {
    fontSize: 12,
    color: '#6c757d',
  },
  healthStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  healthStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  // Family Members Styles
  familyMembersSection: {
    marginBottom: 16,
  },
  membersList: {
    gap: 8,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 12,
    color: '#6c757d',
  },
  responseStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  responseStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  // Member Response Detail Modal Styles
  memberDetailSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  memberDetailHeader: {
    flex: 1,
  },
  memberDetailName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  memberDetailRole: {
    fontSize: 14,
    color: '#6c757d',
  },
  memberDetailStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  memberDetailStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  waitingSection: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    marginBottom: 20,
  },
  waitingText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 20,
  },
  responseDetailSection: {
    marginBottom: 20,
  },
  responseDetailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  commentBox: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  commentText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  responseTimeSection: {
    backgroundColor: '#e9ecef',
    padding: 12,
    borderRadius: 8,
  },
  responseTimeLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  responseTimeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  closeButton: {
    backgroundColor: '#6c757d',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  // New action button styles
  cancelButton: {
    backgroundColor: '#ff4757',
    flex: 1,
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  confirmButton: {
    backgroundColor: '#2ed573',
    flex: 1,
    marginLeft: 8,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  // Modal styles
  modalMessage: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  cancelModalButton: {
    backgroundColor: '#6c757d',
    flex: 1,
    marginRight: 8,
  },
  cancelModalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  confirmModalButton: {
    backgroundColor: '#ff4757',
    flex: 1,
    marginLeft: 8,
  },
  confirmModalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  // Member status summary styles
  memberStatusSummary: {
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  memberStatusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  memberStatusName: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  memberStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  memberStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  confirmQuestion: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '500',
  },
});
