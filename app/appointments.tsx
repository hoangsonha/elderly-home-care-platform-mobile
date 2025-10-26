import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

import { ThemedText } from '@/components/themed-text';

interface Participant {
  name: string;
  type: 'user' | 'caregiver' | 'family' | 'guest';
  status: 'accepted' | 'pending' | 'declined';
}

interface Appointment {
  id: string;
  caregiverName: string;
  caregiverAvatar: string;
  date: string;
  time: string;
  duration: number; // in minutes
  status: 'upcoming' | 'completed' | 'cancelled';
  meetLink?: string;
  content: string;
  participants: Participant[];
}

const mockAppointments: Appointment[] = [
  {
    id: '1',
    caregiverName: 'Nguyễn Thị Lan',
    caregiverAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    date: '20/12/2024',
    time: '14:00',
    duration: 60,
    status: 'upcoming',
    meetLink: 'https://meet.google.com/abc-defg-hij',
    content: 'Tư vấn về chế độ dinh dưỡng cho người cao tuổi',
    participants: [
      { name: 'Bạn', type: 'user', status: 'accepted' },
      { name: 'Nguyễn Thị Lan', type: 'caregiver', status: 'accepted' },
      { name: 'Ông Nguyễn Văn A', type: 'family', status: 'pending' },
      { name: 'Bà Nguyễn Thị B', type: 'family', status: 'accepted' },
    ],
  },
  {
    id: '2',
    caregiverName: 'Trần Văn Nam',
    caregiverAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    date: '18/12/2024',
    time: '10:15',
    duration: 90,
    status: 'completed',
    meetLink: 'https://meet.google.com/xyz-1234-567',
    content: 'Tư vấn về tập luyện thể dục cho người cao tuổi',
    participants: [
      { name: 'Bạn', type: 'user', status: 'accepted' },
      { name: 'Trần Văn Nam', type: 'caregiver', status: 'accepted' },
      { name: 'Bà Lê Thị B', type: 'family', status: 'accepted' },
    ],
  },
  {
    id: '3',
    caregiverName: 'Phạm Thị Hoa',
    caregiverAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    date: '22/12/2024',
    time: '16:30',
    duration: 60,
    status: 'upcoming',
    meetLink: 'https://meet.google.com/mno-5678-901',
    content: 'Kiểm tra sức khỏe định kỳ và tư vấn y tế',
    participants: [
      { name: 'Bạn', type: 'user', status: 'accepted' },
      { name: 'Phạm Thị Hoa', type: 'caregiver', status: 'accepted' },
      { name: 'Ông Trần Văn C', type: 'family', status: 'pending' },
      { name: 'Con gái ông C', type: 'family', status: 'declined' },
    ],
  },
  {
    id: '4',
    caregiverName: 'Lê Văn Minh',
    caregiverAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    date: '15/12/2024',
    time: '09:45',
    duration: 45,
    status: 'cancelled',
    content: 'Tư vấn về chăm sóc sức khỏe tâm lý',
    participants: [
      { name: 'Bạn', type: 'user', status: 'accepted' },
      { name: 'Lê Văn Minh', type: 'caregiver', status: 'accepted' },
      { name: 'Bà Nguyễn Thị D', type: 'family', status: 'accepted' },
    ],
  },
  {
    id: '5',
    caregiverName: 'Hoàng Văn Đức',
    caregiverAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    date: '25/12/2024',
    time: '08:00',
    duration: 30,
    status: 'upcoming',
    meetLink: 'https://meet.google.com/efg-hij-klm',
    content: 'Tư vấn về thuốc và cách sử dụng thuốc an toàn',
    participants: [
      { name: 'Bạn', type: 'user', status: 'accepted' },
      { name: 'Hoàng Văn Đức', type: 'caregiver', status: 'accepted' },
      { name: 'Bà Nguyễn Thị E', type: 'family', status: 'pending' },
    ],
  },
  {
    id: '6',
    caregiverName: 'Vũ Thị Mai',
    caregiverAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    date: '17/12/2024',
    time: '15:15',
    duration: 75,
    status: 'completed',
    meetLink: 'https://meet.google.com/nop-qrs-tuv',
    content: 'Hướng dẫn các bài tập vật lý trị liệu tại nhà',
    participants: [
      { name: 'Bạn', type: 'user', status: 'accepted' },
      { name: 'Vũ Thị Mai', type: 'caregiver', status: 'accepted' },
      { name: 'Ông Bùi Văn F', type: 'family', status: 'accepted' },
    ],
  },
  {
    id: '7',
    caregiverName: 'Nguyễn Thị Lan',
    caregiverAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    date: '28/12/2024',
    time: '16:00',
    duration: 60,
    status: 'upcoming',
    meetLink: 'https://meet.google.com/guest-demo-123',
    content: 'Tư vấn với bác sĩ chuyên khoa tim mạch',
    participants: [
      { name: 'Bạn', type: 'user', status: 'accepted' },
      { name: 'Nguyễn Thị Lan', type: 'caregiver', status: 'accepted' },
      { name: 'Ông Nguyễn Văn A', type: 'family', status: 'pending' },
      { name: 'Bác sĩ Trần Văn K', type: 'guest', status: 'pending' },
    ],
  },
];

type StatusTab = 'all' | 'upcoming' | 'completed' | 'cancelled';

export default function AppointmentsScreen() {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState<StatusTab>('all');

  const handleAppointmentPress = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  const getFilteredAppointments = () => {
    if (activeTab === 'all') {
      return mockAppointments;
    }
    return mockAppointments.filter(appointment => appointment.status === activeTab);
  };

  const getTabCount = (tab: StatusTab) => {
    if (tab === 'all') {
      return mockAppointments.length;
    }
    return mockAppointments.filter(appointment => appointment.status === tab).length;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return '#3498DB';
      case 'completed':
        return '#27AE60';
      case 'cancelled':
        return '#E74C3C';
      default:
        return '#95A5A6';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'Sắp tới';
      case 'completed':
        return 'Đã hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  const getParticipantStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Đã chấp nhận';
      case 'pending':
        return 'Đang chờ';
      case 'declined':
        return 'Đã từ chối';
      default:
        return status;
    }
  };

  const getParticipantStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return '#27AE60';
      case 'pending':
        return '#F39C12';
      case 'declined':
        return '#E74C3C';
      default:
        return '#6C757D';
    }
  };


  const renderAppointment = ({ item }: { item: Appointment }) => (
    <TouchableOpacity
      style={styles.appointmentCard}
      onPress={() => handleAppointmentPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.appointmentHeader}>
        <Image source={{ uri: item.caregiverAvatar }} style={styles.avatar} />
        <View style={styles.appointmentInfo}>
          <ThemedText style={styles.caregiverName}>{item.caregiverName}</ThemedText>
          <ThemedText style={styles.appointmentType}>Video tư vấn</ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <ThemedText style={styles.statusText}>{getStatusText(item.status)}</ThemedText>
        </View>
      </View>

      <View style={styles.appointmentDetails}>
        <View style={styles.detailRow}>
          <ThemedText style={styles.detailLabel}>Ngày:</ThemedText>
          <ThemedText style={styles.detailText}>{item.date}</ThemedText>
        </View>
        <View style={styles.detailRow}>
          <ThemedText style={styles.detailLabel}>Giờ:</ThemedText>
          <ThemedText style={styles.detailText}>{item.time}</ThemedText>
        </View>
        <View style={styles.detailRow}>
          <ThemedText style={styles.detailLabel}>Thời lượng:</ThemedText>
          <ThemedText style={styles.detailText}>{item.duration} phút</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDetailModal = () => {
    if (!selectedAppointment) return null;

    return (
      <Modal
        visible={showDetailModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Chi tiết lịch hẹn</ThemedText>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowDetailModal(false)}
              >
                <Ionicons name="close" size={24} color="#6C757D" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalBody} 
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.modalScrollContent}
            >
              {/* Caregiver Info */}
              <View style={styles.detailSection}>
                <View style={styles.detailHeader}>
                  <Image source={{ uri: selectedAppointment.caregiverAvatar }} style={styles.detailAvatar} />
                  <View style={styles.detailInfo}>
                    <ThemedText style={styles.detailTitle}>Người tư vấn</ThemedText>
                    <ThemedText style={styles.detailSubtitle}>{selectedAppointment.caregiverName}</ThemedText>
                  </View>
                </View>
              </View>

              {/* Appointment Details */}
              <View style={styles.detailSection}>
                <ThemedText style={styles.sectionTitle}>Thông tin cuộc hẹn</ThemedText>
                
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Ngày:</ThemedText>
                  <ThemedText style={styles.detailValue}>{selectedAppointment.date}</ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Giờ bắt đầu:</ThemedText>
                  <ThemedText style={styles.detailValue}>{selectedAppointment.time}</ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Thời lượng:</ThemedText>
                  <ThemedText style={styles.detailValue}>{selectedAppointment.duration} phút</ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Trạng thái:</ThemedText>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedAppointment.status) }]}>
                    <ThemedText style={styles.statusText}>{getStatusText(selectedAppointment.status)}</ThemedText>
                  </View>
                </View>
              </View>

              {/* Meet Link */}
              {selectedAppointment.meetLink && (
                <View style={styles.detailSection}>
                  <ThemedText style={styles.sectionTitle}>Link tham gia</ThemedText>
                  <TouchableOpacity 
                    style={[
                      styles.meetLinkContainer,
                      (selectedAppointment.status === 'completed' || selectedAppointment.status === 'cancelled') && styles.meetLinkDisabled
                    ]}
                    disabled={selectedAppointment.status === 'completed' || selectedAppointment.status === 'cancelled'}
                    activeOpacity={selectedAppointment.status === 'completed' || selectedAppointment.status === 'cancelled' ? 1 : 0.7}
                  >
                    <Ionicons 
                      name="videocam" 
                      size={20} 
                      color={(selectedAppointment.status === 'completed' || selectedAppointment.status === 'cancelled') ? '#95A5A6' : '#3498DB'} 
                    />
                    <ThemedText style={[
                      styles.meetLinkText,
                      (selectedAppointment.status === 'completed' || selectedAppointment.status === 'cancelled') && styles.meetLinkTextDisabled
                    ]}>
                      {selectedAppointment.meetLink}
                    </ThemedText>
                    <Ionicons 
                      name="copy-outline" 
                      size={16} 
                      color={(selectedAppointment.status === 'completed' || selectedAppointment.status === 'cancelled') ? '#95A5A6' : '#6C757D'} 
                    />
                  </TouchableOpacity>
                  {(selectedAppointment.status === 'completed' || selectedAppointment.status === 'cancelled') && (
                    <ThemedText style={styles.meetLinkNote}>
                      {selectedAppointment.status === 'completed' ? 'Cuộc hẹn đã kết thúc' : 'Cuộc hẹn đã bị hủy'}
                    </ThemedText>
                  )}
                </View>
              )}

              {/* Content */}
              <View style={styles.detailSection}>
                <ThemedText style={styles.sectionTitle}>Nội dung cuộc hẹn</ThemedText>
                <View style={styles.contentBox}>
                  <ThemedText style={styles.contentText}>{selectedAppointment.content}</ThemedText>
                </View>
              </View>

              {/* Participants */}
              <View style={styles.detailSection}>
                <ThemedText style={styles.sectionTitle}>Thành viên tham gia</ThemedText>
                <View style={styles.participantsContainer}>
                  {selectedAppointment.participants.map((participant, index) => (
                    <View key={index} style={styles.participantItem}>
                      <View style={styles.participantAvatar}>
                        <ThemedText style={styles.participantInitial}>
                          {participant.name === 'Bạn' ? 'B' : participant.name.split(' ').pop()?.charAt(0) || '?'}
                        </ThemedText>
                      </View>
                      <View style={styles.participantInfo}>
                        <ThemedText style={styles.participantName}>{participant.name}</ThemedText>
                        <ThemedText style={styles.participantType}>
                          {participant.type === 'user' ? 'Bạn' : 
                           participant.type === 'caregiver' ? 'Người chăm sóc' :
                           participant.type === 'family' ? 'Người trong gia đình' :
                           'Người ngoài được mời'}
                        </ThemedText>
                      </View>
                      <View style={[styles.participantStatusBadge, { backgroundColor: getParticipantStatusColor(participant.status) }]}>
                        <ThemedText style={styles.participantStatusText}>
                          {getParticipantStatusText(participant.status)}
                        </ThemedText>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                {selectedAppointment.status === 'upcoming' && (
                  <>
                    <TouchableOpacity style={styles.joinButton}>
                      <Ionicons name="videocam" size={20} color="white" />
                      <ThemedText style={styles.joinButtonText}>Tham gia</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton}>
                      <Ionicons name="close-circle" size={20} color="#E74C3C" />
                      <ThemedText style={styles.cancelButtonText}>Hủy lịch</ThemedText>
                    </TouchableOpacity>
                  </>
                )}
                {selectedAppointment.status === 'completed' && (
                  <TouchableOpacity 
                    style={styles.reviewButton}
                    onPress={() => {
                      setShowDetailModal(false);
                      router.push('/reviews');
                    }}
                  >
                    <Ionicons name="star" size={20} color="white" />
                    <ThemedText style={styles.reviewButtonText}>Đánh giá</ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <ThemedText style={styles.headerTitle}>Lịch hẹn</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Quản lý lịch hẹn video call</ThemedText>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScrollContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.tabActive]}
            onPress={() => setActiveTab('all')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
              Tất cả ({getTabCount('all')})
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
            onPress={() => setActiveTab('upcoming')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
              Sắp tới ({getTabCount('upcoming')})
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
            onPress={() => setActiveTab('completed')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
              Hoàn thành ({getTabCount('completed')})
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'cancelled' && styles.tabActive]}
            onPress={() => setActiveTab('cancelled')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'cancelled' && styles.tabTextActive]}>
              Đã hủy ({getTabCount('cancelled')})
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <FlatList
          data={getFilteredAppointments()}
          renderItem={renderAppointment}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>

      {/* Detail Modal */}
      {renderDetailModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    paddingBottom: 100, // Space for navigation bar
  },
  header: {
    backgroundColor: '#3498DB',
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
  headerCenter: {
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
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  addButton: {
    padding: 8,
  },
  tabsContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  tabsScrollContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    minWidth: 100,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#3498DB',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6C757D',
  },
  tabTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 20,
  },
  appointmentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  appointmentInfo: {
    flex: 1,
  },
  caregiverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  appointmentType: {
    fontSize: 14,
    color: '#6C757D',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  appointmentDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
    minWidth: 80,
  },
  detailText: {
    fontSize: 14,
    color: '#6C757D',
    marginLeft: 8,
  },
  notesContainer: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498DB',
  },
  notesText: {
    fontSize: 14,
    color: '#495057',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxHeight: '90%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  detailInfo: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  detailSubtitle: {
    fontSize: 14,
    color: '#6C757D',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6C757D',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  meetLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498DB',
    gap: 12,
  },
  meetLinkText: {
    fontSize: 14,
    color: '#3498DB',
    flex: 1,
  },
  meetLinkDisabled: {
    backgroundColor: '#F8F9FA',
    borderLeftColor: '#95A5A6',
    opacity: 0.6,
  },
  meetLinkTextDisabled: {
    color: '#95A5A6',
    textDecorationLine: 'line-through',
  },
  meetLinkNote: {
    fontSize: 12,
    color: '#E74C3C',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  contentBox: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498DB',
  },
  contentText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  participantsContainer: {
    gap: 12,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    gap: 12,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3498DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  participantInfo: {
    flex: 1,
    marginLeft: 12,
  },
  participantName: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
    marginBottom: 2,
  },
  participantType: {
    fontSize: 12,
    color: '#6C757D',
  },
  participantStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  participantStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  youBadge: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  youBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  joinButton: {
    flex: 1,
    backgroundColor: '#27AE60',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E74C3C',
  },
  reviewButton: {
    flex: 1,
    backgroundColor: '#F39C12',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  reviewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
