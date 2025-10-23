import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

interface ServiceRequest {
  id: string;
  name: string;
  caregiverName: string;
  caregiverAvatar: string;
  familyName: string;
  elderlyName: string;
  elderlyAvatar: string;
  salary: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  workAddress: string;
  salaryPerHour: number;
  elderlyProfile: {
    age: number;
    healthCondition: string;
    specialNeeds: string[];
    medications: string[];
  };
  workSchedule: {
    type: 'long-term' | 'short-term' | 'hourly' | 'unlimited';
    startDate: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    workingHours: string[];
  };
  salaryFrequency: string;
}

interface ServiceRequestsProps {
  onChatPress?: (caregiver: any) => void;
  onBookPress?: (caregiver: any) => void;
}

const mockServiceRequests: ServiceRequest[] = [
  {
    id: '1',
    name: 'Chăm sóc bà Nguyễn Thị Lan',
    caregiverName: 'Nguyễn Văn Minh',
    caregiverAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    familyName: 'Gia đình Nguyễn',
    elderlyName: 'Bà Nguyễn Thị Lan',
    elderlyAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    salary: 500000,
    status: 'pending',
    createdAt: '2024-01-15T14:30:00',
    workAddress: '123 Đường Lê Lợi, Quận 1, TP.HCM',
    salaryPerHour: 50000,
    elderlyProfile: {
      age: 75,
      healthCondition: 'Cao huyết áp, tiểu đường',
      specialNeeds: ['Hỗ trợ đi lại', 'Uống thuốc đúng giờ'],
      medications: ['Thuốc huyết áp', 'Thuốc tiểu đường'],
    },
    workSchedule: {
      type: 'long-term',
      startDate: '2024-02-01',
      endDate: '2024-12-31',
      startTime: '08:00',
      endTime: '16:00',
      workingHours: ['08:00-16:00'],
    },
    salaryFrequency: 'Hàng tháng',
  },
  {
    id: '2',
    name: 'Chăm sóc ông Trần Văn Hùng',
    caregiverName: 'Lê Thị Mai',
    caregiverAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    familyName: 'Gia đình Trần',
    elderlyName: 'Ông Trần Văn Hùng',
    elderlyAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    salary: 300000,
    status: 'approved',
    createdAt: '2024-01-10T09:15:00',
    workAddress: '456 Đường Nguyễn Huệ, Quận 3, TP.HCM',
    salaryPerHour: 45000,
    elderlyProfile: {
      age: 82,
      healthCondition: 'Suy giảm trí nhớ',
      specialNeeds: ['Giám sát 24/7', 'Hỗ trợ ăn uống'],
      medications: ['Thuốc bổ não'],
    },
    workSchedule: {
      type: 'short-term',
      startDate: '2024-01-20',
      endDate: '2024-03-20',
      startTime: '06:00',
      endTime: '22:00',
      workingHours: ['06:00-22:00'],
    },
    salaryFrequency: 'Hàng tuần',
  },
  {
    id: '3',
    name: 'Chăm sóc bà Phạm Thị Hoa',
    caregiverName: 'Võ Minh Tuấn',
    caregiverAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    familyName: 'Gia đình Phạm',
    elderlyName: 'Bà Phạm Thị Hoa',
    elderlyAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    salary: 200000,
    status: 'rejected',
    createdAt: '2024-01-05T16:45:00',
    workAddress: '789 Đường Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
    salaryPerHour: 40000,
    elderlyProfile: {
      age: 68,
      healthCondition: 'Viêm khớp',
      specialNeeds: ['Vật lý trị liệu', 'Massage'],
      medications: ['Thuốc giảm đau'],
    },
    workSchedule: {
      type: 'hourly',
      startDate: '2024-01-25',
      startTime: '08:00',
      endTime: '12:00',
      workingHours: ['08:00-12:00'],
    },
    salaryFrequency: 'Hàng ngày',
  },
  {
    id: '4',
    name: 'Chăm sóc bà Lê Thị Hương',
    caregiverName: 'Phạm Minh Đức',
    caregiverAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    familyName: 'Gia đình Lê',
    elderlyName: 'Bà Lê Thị Hương',
    elderlyAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    salary: 400000,
    status: 'completed',
    createdAt: '2024-01-08T10:20:00',
    workAddress: '321 Đường Võ Văn Tần, Quận 3, TP.HCM',
    salaryPerHour: 50000,
    elderlyProfile: {
      age: 70,
      healthCondition: 'Suy tim nhẹ',
      specialNeeds: ['Theo dõi huyết áp', 'Uống thuốc đúng giờ'],
      medications: ['Thuốc tim', 'Thuốc huyết áp'],
    },
    workSchedule: {
      type: 'long-term',
      startDate: '2024-01-15',
      endDate: '2024-06-15',
      startTime: '09:00',
      endTime: '17:00',
      workingHours: ['09:00-17:00'],
    },
    salaryFrequency: 'Hàng tuần',
  },
];

export function ServiceRequests({ onChatPress, onBookPress }: ServiceRequestsProps) {
  const [activeStatusTab, setActiveStatusTab] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'completed'>('all');
  const [selectedService, setSelectedService] = useState<ServiceRequest | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentService, setPaymentService] = useState<ServiceRequest | null>(null);

  const handlePayment = (service: ServiceRequest) => {
    setPaymentService(service);
    setShowPaymentModal(true);
  };

  const handleCancel = (service: ServiceRequest) => {
    // Logic hủy yêu cầu
    console.log('Cancel service:', service.id);
    // Có thể thêm confirmation dialog
  };

  const handlePaymentComplete = (service: ServiceRequest) => {
    // Logic chuyển status sang completed
    console.log('Payment completed for service:', service.id);
    setShowPaymentModal(false);
    setPaymentService(null);
    // Có thể cập nhật mockServiceRequests ở đây
  };

  const getFilteredRequests = () => {
    if (activeStatusTab === 'all') {
      return mockServiceRequests;
    }
    return mockServiceRequests.filter(request => request.status === activeStatusTab);
  };

  const getStatusCount = (status: string) => {
    return mockServiceRequests.filter(request => request.status === status).length;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ phản hồi';
      case 'approved': return 'Đã chấp nhận';
      case 'rejected': return 'Đã từ chối';
      case 'completed': return 'Đã hoàn thành';
      default: return 'Tất cả';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'approved': return '#17A2B8';
      case 'rejected': return '#DC3545';
      case 'completed': return '#28A745';
      default: return '#007BFF';
    }
  };

  const getStatusNotificationText = (status: string) => {
    switch (status) {
      case 'pending': return 'Đang đợi phản hồi từ người chăm sóc';
      case 'approved': return 'Người chăm sóc đã chấp nhận yêu cầu của bạn. Vui lòng thanh toán để hoàn tất';
      case 'rejected': return 'Người chăm sóc đã từ chối yêu cầu này';
      case 'completed': return 'Bạn đã thanh toán thành công và dịch vụ đã được tạo';
      default: return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'approved': return 'checkmark-circle-outline';
      case 'rejected': return 'close-circle-outline';
      case 'completed': return 'checkmark-done-outline';
      default: return 'information-circle-outline';
    }
  };

  const getWorkScheduleTypeText = (type: string) => {
    switch (type) {
      case 'long-term': return 'Theo ngày';
      case 'short-term': return 'Theo ngày';
      case 'hourly': return 'Theo buổi';
      case 'unlimited': return 'Theo ngày';
      default: return type;
    }
  };

  const renderServiceRequest = ({ item }: { item: ServiceRequest }) => (
    <TouchableOpacity
      style={styles.requestCard}
      onPress={() => setSelectedService(item)}
      activeOpacity={0.7}
    >
      <View style={styles.requestHeader}>
        <Image source={{ uri: item.caregiverAvatar }} style={styles.caregiverAvatar} />
        <View style={styles.requestInfo}>
          <View style={styles.nameRow}>
            <ThemedText style={styles.caregiverName}>{item.caregiverName}</ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <ThemedText style={styles.statusText}>{getStatusText(item.status)}</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.serviceName}>{item.name}</ThemedText>
        </View>
      </View>

      <View style={styles.requestDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="cash" size={16} color="#27AE60" />
          <ThemedText style={styles.detailText}>{item.salary.toLocaleString()}đ</ThemedText>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={16} color="#E74C3C" />
          <ThemedText style={styles.detailText}>{new Date(item.createdAt).toLocaleString('vi-VN')}</ThemedText>
        </View>
      </View>

      {/* Action Buttons for Approved Status */}
      {item.status === 'approved' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.paymentButton}
            onPress={() => handlePayment(item)}
          >
            <ThemedText style={styles.paymentButtonText}>Thanh toán</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => handleCancel(item)}
          >
            <ThemedText style={styles.cancelButtonText}>Hủy</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {/* Action Buttons for Pending Status */}
      {item.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => handleCancel(item)}
          >
            <ThemedText style={styles.cancelButtonText}>Hủy</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderDetailModal = () => {
    if (!selectedService) return null;

    return (
      <Modal
        visible={!!selectedService}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedService(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedService(null)}
            >
              <Ionicons name="close" size={24} color="#6C757D" />
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>Chi tiết dịch vụ</ThemedText>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={true}>
            {/* Status Notification */}
            <View style={[styles.statusNotification, { backgroundColor: getStatusColor(selectedService.status) }]}>
              <Ionicons 
                name={getStatusIcon(selectedService.status)} 
                size={20} 
                color="white" 
                style={styles.statusIcon}
              />
              <ThemedText style={styles.statusNotificationText}>
                {getStatusNotificationText(selectedService.status)}
              </ThemedText>
            </View>

            {/* Service Info */}
            <View style={styles.detailSection}>
              <ThemedText style={styles.sectionTitle}>Thông tin dịch vụ</ThemedText>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Tên dịch vụ:</ThemedText>
                <ThemedText style={styles.infoValue}>{selectedService.name}</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Người chăm sóc:</ThemedText>
                <ThemedText style={styles.infoValue}>{selectedService.caregiverName}</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Địa chỉ làm việc:</ThemedText>
                <ThemedText style={styles.infoValue}>{selectedService.workAddress}</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Lương:</ThemedText>
                <ThemedText style={styles.infoValue}>{selectedService.salary.toLocaleString()}đ</ThemedText>
              </View>
            </View>

            {/* Elderly Profile */}
            <View style={styles.detailSection}>
              <ThemedText style={styles.sectionTitle}>Hồ sơ người già</ThemedText>
              <TouchableOpacity style={styles.elderlyProfileCard}>
                <Image source={{ uri: selectedService.elderlyAvatar }} style={styles.elderlyAvatar} />
                <View style={styles.elderlyInfo}>
                  <ThemedText style={styles.elderlyName}>{selectedService.elderlyName}</ThemedText>
                  <ThemedText style={styles.elderlyAge}>{selectedService.elderlyProfile.age} tuổi</ThemedText>
                  <ThemedText style={styles.elderlyCondition}>{selectedService.elderlyProfile.healthCondition}</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6C757D" />
              </TouchableOpacity>
            </View>

            {/* Work Schedule */}
            <View style={styles.detailSection}>
              <ThemedText style={styles.sectionTitle}>Thời gian làm việc</ThemedText>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Loại:</ThemedText>
                <ThemedText style={styles.infoValue}>{getWorkScheduleTypeText(selectedService.workSchedule.type)}</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Giờ bắt đầu:</ThemedText>
                <ThemedText style={styles.infoValue}>{selectedService.workSchedule.startTime || '08:00'}</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Giờ kết thúc:</ThemedText>
                <ThemedText style={styles.infoValue}>{selectedService.workSchedule.endTime || '16:00'}</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Tổng số giờ:</ThemedText>
                <ThemedText style={styles.infoValue}>{(() => {
                  const startTime = selectedService.workSchedule.startTime || '08:00';
                  const endTime = selectedService.workSchedule.endTime || '16:00';
                  const startHour = parseInt(startTime.split(':')[0]);
                  const endHour = parseInt(endTime.split(':')[0]);
                  const totalHours = endHour - startHour;
                  return `${totalHours} tiếng`;
                })()}</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Ngày làm việc:</ThemedText>
                <ThemedText style={styles.infoValue}>{selectedService.workSchedule.startDate} - {selectedService.workSchedule.endDate || 'Không giới hạn'}</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Khung giờ:</ThemedText>
                <View style={styles.workingHoursContainer}>
                  <View style={styles.workingHourBadge}>
                    <ThemedText style={styles.workingHourText}>
                      {(() => {
                        const startTime = selectedService.workSchedule.startTime || '08:00';
                        const endTime = selectedService.workSchedule.endTime || '16:00';
                        return `${startTime}-${endTime}`;
                      })()}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>

            {/* Action Buttons for Approved Status */}
            {selectedService.status === 'approved' && (
              <View style={styles.modalActionButtons}>
                <TouchableOpacity 
                  style={styles.modalPaymentButton}
                  onPress={() => handlePayment(selectedService)}
                >
                  <ThemedText style={styles.modalPaymentButtonText}>Thanh toán</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalCancelButton}
                  onPress={() => handleCancel(selectedService)}
                >
                  <ThemedText style={styles.modalCancelButtonText}>Hủy</ThemedText>
                </TouchableOpacity>
              </View>
            )}

            {/* Action Buttons for Pending Status */}
            {selectedService.status === 'pending' && (
              <View style={styles.modalActionButtons}>
                <TouchableOpacity 
                  style={styles.modalCancelButton}
                  onPress={() => handleCancel(selectedService)}
                >
                  <ThemedText style={styles.modalCancelButtonText}>Hủy</ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    );
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
              Tất cả ({mockServiceRequests.length})
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusTab, activeStatusTab === 'pending' && styles.statusTabActive]}
            onPress={() => setActiveStatusTab('pending')}
          >
            <ThemedText style={[styles.statusTabText, activeStatusTab === 'pending' && styles.statusTabTextActive]}>
              Chờ phản hồi ({getStatusCount('pending')})
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusTab, activeStatusTab === 'approved' && styles.statusTabActive]}
            onPress={() => setActiveStatusTab('approved')}
          >
            <ThemedText style={[styles.statusTabText, activeStatusTab === 'approved' && styles.statusTabTextActive]}>
              Đã chấp nhận ({getStatusCount('approved')})
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
          <TouchableOpacity
            style={[styles.statusTab, activeStatusTab === 'completed' && styles.statusTabActive]}
            onPress={() => setActiveStatusTab('completed')}
          >
            <ThemedText style={[styles.statusTabText, activeStatusTab === 'completed' && styles.statusTabTextActive]}>
              Đã hoàn thành ({getStatusCount('completed')})
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Requests List */}
      <FlatList
        data={getFilteredRequests()}
        renderItem={renderServiceRequest}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      {/* Detail Modal */}
      {renderDetailModal()}

      {/* Payment Modal */}
      {paymentService && (
        <Modal
          visible={showPaymentModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowPaymentModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowPaymentModal(false)}
              >
                <Ionicons name="close" size={24} color="#6C757D" />
              </TouchableOpacity>
              <ThemedText style={styles.modalTitle}>Thanh toán</ThemedText>
              <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Payment Info */}
              <View style={styles.detailSection}>
                <ThemedText style={styles.sectionTitle}>Thông tin thanh toán</ThemedText>
                <View style={styles.infoRow}>
                  <ThemedText style={styles.infoLabel}>Dịch vụ:</ThemedText>
                  <ThemedText style={styles.infoValue}>{paymentService.name}</ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <ThemedText style={styles.infoLabel}>Người chăm sóc:</ThemedText>
                  <ThemedText style={styles.infoValue}>{paymentService.caregiverName}</ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <ThemedText style={styles.infoLabel}>Số tiền:</ThemedText>
                  <ThemedText style={[styles.infoValue, styles.paymentAmount]}>
                    {paymentService.salary.toLocaleString()}đ
                  </ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <ThemedText style={styles.infoLabel}>Phương thức:</ThemedText>
                  <ThemedText style={styles.infoValue}>Chuyển khoản ngân hàng</ThemedText>
                </View>
              </View>

              {/* Payment Button */}
              <TouchableOpacity 
                style={styles.completePaymentButton}
                onPress={() => handlePaymentComplete(paymentService)}
              >
                <ThemedText style={styles.completePaymentButtonText}>Đã thanh toán</ThemedText>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  statusTabsContainer: {
    backgroundColor: '#F7F9FC',
    paddingVertical: 12,
  },
  statusTabsScrollContainer: {
    paddingHorizontal: 16,
  },
  statusTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  statusTabActive: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },
  statusTabText: {
    fontSize: 14,
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
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  caregiverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  requestInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 14,
    color: '#3498DB',
    marginBottom: 8,
  },
  caregiverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
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
  requestDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6C757D',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  placeholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  statusNotification: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusIcon: {
    marginRight: 12,
  },
  statusNotificationText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    lineHeight: 20,
  },
  detailSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6C757D',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  elderlyProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  elderlyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  elderlyInfo: {
    flex: 1,
  },
  elderlyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  elderlyAge: {
    fontSize: 14,
    color: '#3498DB',
    marginBottom: 2,
  },
  elderlyCondition: {
    fontSize: 14,
    color: '#6C757D',
  },
  workingHoursContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  workingHourBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  workingHourText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
  },
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 12,
  },
  paymentButton: {
    flex: 1,
    backgroundColor: '#28A745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  paymentButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#DC3545',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal Action Buttons
  modalActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 100,
    gap: 12,
  },
  modalPaymentButton: {
    flex: 1,
    backgroundColor: '#28A745',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalPaymentButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#DC3545',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Payment Modal
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28A745',
  },
  completePaymentButton: {
    backgroundColor: '#28A745',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  completePaymentButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
