import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { mainService, type MyCareServiceData } from '@/services/main.service';

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

export function ServiceRequests({ onChatPress, onBookPress }: ServiceRequestsProps) {
  console.log('=== ServiceRequests Component Rendered ===');
  
  const [activeStatusTab, setActiveStatusTab] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'completed'>('all');
  const [selectedService, setSelectedService] = useState<ServiceRequest | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentService, setPaymentService] = useState<ServiceRequest | null>(null);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);

  // Map API status to component status
  const mapApiStatusToComponentStatus = (apiStatus: string): 'pending' | 'approved' | 'rejected' | 'completed' => {
    switch (apiStatus) {
      case 'PENDING':
      case 'WAITING_CAREGIVER_RESPONSE':
        return 'pending';
      case 'CAREGIVER_APPROVED':
      case 'ACCEPTED':
        return 'approved';
      case 'CAREGIVER_DECLINED':
      case 'DECLINED':
      case 'CANCELLED':
        return 'rejected';
      case 'COMPLETED':
      case 'PAID':
        return 'completed';
      default:
        return 'pending';
    }
  };

  // Fetch service requests from API
  useEffect(() => {
    console.log('=== ServiceRequests useEffect triggered ===');
    const fetchServiceRequests = async () => {
      console.log('=== fetchServiceRequests called ===');
      setIsLoading(true);
      try {
        console.log('=== Calling mainService.getMyCareServices() ===');
        const response = await mainService.getMyCareServices();
        console.log('=== Response received ===');
        
        // Lưu raw response để hiển thị
        setRawResponse(response);
        
        // Log raw response từ BE
        console.log('=== RAW RESPONSE FROM BE (ServiceRequests) ===');
        console.log('Response status:', response.status);
        console.log('Response data length:', response.data?.length || 0);
        console.log('Full response:', JSON.stringify(response, null, 2));
        
        if (response.status === 'Success' && response.data) {
          // Log avatar URLs từ raw response
          response.data.forEach((service: MyCareServiceData, index: number) => {
            console.log(`\n--- Service ${index + 1} (${service.careServiceId}) ---`);
            console.log('Caregiver Profile:');
            console.log('  - fullName:', service.caregiverProfile.fullName);
            console.log('  - avatarUrl (raw):', service.caregiverProfile.avatarUrl);
            console.log('  - avatarUrl type:', typeof service.caregiverProfile.avatarUrl);
            console.log('  - avatarUrl length:', service.caregiverProfile.avatarUrl?.length || 0);
            if (service.caregiverProfile.avatarUrl) {
              console.log('  - avatarUrl includes %2F:', service.caregiverProfile.avatarUrl.includes('%2F'));
              console.log('  - avatarUrl includes /o/:', service.caregiverProfile.avatarUrl.includes('/o/'));
            }
            console.log('Elderly Profile:');
            console.log('  - fullName:', service.elderlyProfile.fullName);
            console.log('  - avatarUrl (raw):', service.elderlyProfile.avatarUrl);
            console.log('  - avatarUrl type:', typeof service.elderlyProfile.avatarUrl);
            console.log('  - avatarUrl length:', service.elderlyProfile.avatarUrl?.length || 0);
            if (service.elderlyProfile.avatarUrl) {
              console.log('  - avatarUrl includes %2F:', service.elderlyProfile.avatarUrl.includes('%2F'));
              console.log('  - avatarUrl includes /o/:', service.elderlyProfile.avatarUrl.includes('/o/'));
            }
          });
          console.log('=== END RAW RESPONSE LOG ===\n');
          
          const mappedRequests: ServiceRequest[] = response.data.map((service: MyCareServiceData) => {
            // Parse location if it's a JSON string
            let locationObj = { address: '', latitude: 0, longitude: 0 };
            try {
              if (typeof service.location === 'string') {
                locationObj = JSON.parse(service.location);
              } else {
                locationObj = service.location as any;
              }
            } catch {
              locationObj = {
                address: service.elderlyProfile.location.address,
                latitude: service.elderlyProfile.location.latitude,
                longitude: service.elderlyProfile.location.longitude,
              };
            }

            // Parse care requirement for elderly profile
            const careRequirement = service.elderlyProfile.careRequirement || {};
            const healthCondition = service.elderlyProfile.healthNote || careRequirement.healthCondition || 'Không có';
            const specialNeeds = careRequirement.specialNeeds || [];
            const medications = careRequirement.medications || [];

            const caregiverAvatar = service.caregiverProfile.avatarUrl || '';
            const elderlyAvatar = service.elderlyProfile.avatarUrl || '';
            
            // Log mapped avatar URLs
            console.log(`\n[MAPPED] Service ${service.careServiceId}:`);
            console.log('  - caregiverAvatar (mapped):', caregiverAvatar);
            console.log('  - elderlyAvatar (mapped):', elderlyAvatar);
            
            return {
              id: service.careServiceId,
              name: `Chăm sóc ${service.elderlyProfile.fullName}`,
              caregiverName: service.caregiverProfile.fullName,
              caregiverAvatar: caregiverAvatar, // Dùng trực tiếp từ BE, không decode/encode
              familyName: service.careSeekerProfile.fullName,
              elderlyName: service.elderlyProfile.fullName,
              elderlyAvatar: elderlyAvatar, // Dùng trực tiếp từ BE, không decode/encode
              salary: service.totalPrice,
              status: mapApiStatusToComponentStatus(service.status),
              createdAt: service.workDate,
              workAddress: locationObj.address,
              salaryPerHour: Math.round(service.totalPrice / service.servicePackage.durationHours),
              elderlyProfile: {
                age: service.elderlyProfile.age,
                healthCondition: healthCondition,
                specialNeeds: specialNeeds,
                medications: medications,
              },
              workSchedule: {
                type: service.servicePackage.packageType === 'LONG_TERM' ? 'long-term' : 
                      service.servicePackage.packageType === 'SHORT_TERM' ? 'short-term' : 'hourly',
                startDate: service.workDate,
                endDate: undefined, // API không có endDate trong MyCareServiceData
                startTime: service.startTime.split(':').slice(0, 2).join(':'),
                endTime: service.endTime.split(':').slice(0, 2).join(':'),
                workingHours: [`${service.startTime.split(':').slice(0, 2).join(':')}-${service.endTime.split(':').slice(0, 2).join(':')}`],
              },
              salaryFrequency: 'Hàng ngày', // Default, có thể map từ servicePackage nếu có
            };
          });
          setServiceRequests(mappedRequests);
        } else {
          setServiceRequests([]);
        }
      } catch (error: any) {
        console.error('Error fetching service requests:', error);
        setServiceRequests([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServiceRequests();
  }, []);

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
    // TODO: Refresh service requests after payment
  };

  const getFilteredRequests = () => {
    if (activeStatusTab === 'all') {
      return serviceRequests;
    }
    return serviceRequests.filter(request => request.status === activeStatusTab);
  };

  const getStatusCount = (status: string) => {
    return serviceRequests.filter(request => request.status === status).length;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ phản hồi';
      case 'approved': return 'Đã xác nhận';
      case 'rejected': return 'Đã hủy';
      case 'completed': return 'Đã thanh toán';
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
        {item.caregiverAvatar ? (
          <Image source={{ uri: item.caregiverAvatar }} style={styles.caregiverAvatar} />
        ) : (
          <View style={[styles.caregiverAvatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={24} color="#BDC3C7" />
          </View>
        )}
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
                {selectedService.elderlyAvatar ? (
                  <Image source={{ uri: selectedService.elderlyAvatar }} style={styles.elderlyAvatar} />
                ) : (
                  <View style={[styles.elderlyAvatar, styles.avatarPlaceholder]}>
                    <Ionicons name="person" size={30} color="#BDC3C7" />
                  </View>
                )}
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
        {/* Debug Button - Hiển thị response từ BE */}
        <TouchableOpacity
          style={styles.debugButton}
          onPress={() => setShowResponseModal(true)}
        >
          <Ionicons name="code-outline" size={20} color="#68C2E8" />
          <ThemedText style={styles.debugButtonText}>Xem Response BE</ThemedText>
        </TouchableOpacity>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusTabsScrollContainer}>
          <TouchableOpacity
            style={[styles.statusTab, activeStatusTab === 'all' && styles.statusTabActive]}
            onPress={() => setActiveStatusTab('all')}
          >
            <ThemedText style={[styles.statusTabText, activeStatusTab === 'all' && styles.statusTabTextActive]}>
              Tất cả ({serviceRequests.length})
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
              Đã xác nhận ({getStatusCount('approved')})
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusTab, activeStatusTab === 'rejected' && styles.statusTabActive]}
            onPress={() => setActiveStatusTab('rejected')}
          >
            <ThemedText style={[styles.statusTabText, activeStatusTab === 'rejected' && styles.statusTabTextActive]}>
              Đã hủy ({getStatusCount('rejected')})
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusTab, activeStatusTab === 'completed' && styles.statusTabActive]}
            onPress={() => setActiveStatusTab('completed')}
          >
            <ThemedText style={[styles.statusTabText, activeStatusTab === 'completed' && styles.statusTabTextActive]}>
              Đã thanh toán ({getStatusCount('completed')})
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Requests List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Đang tải...</ThemedText>
        </View>
      ) : (
        <FlatList
          data={getFilteredRequests()}
          renderItem={renderServiceRequest}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color="#BDC3C7" />
              <ThemedText style={styles.emptyText}>Chưa có yêu cầu dịch vụ nào</ThemedText>
            </View>
          }
        />
      )}

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

      {/* Response Modal - Hiển thị raw response từ BE */}
      <Modal
        visible={showResponseModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowResponseModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowResponseModal(false)}
            >
              <Ionicons name="close" size={24} color="#6C757D" />
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>Response từ BE</ThemedText>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.responseContainer}>
              <ThemedText style={styles.responseTitle}>Raw Response:</ThemedText>
              <ScrollView horizontal style={styles.responseScrollView}>
                <ThemedText style={styles.responseText}>
                  {rawResponse ? JSON.stringify(rawResponse, null, 2) : 'Chưa có dữ liệu'}
                </ThemedText>
              </ScrollView>
            </View>

            {rawResponse?.data && (
              <View style={styles.responseContainer}>
                <ThemedText style={styles.responseTitle}>Avatar URLs:</ThemedText>
                {rawResponse.data.map((service: any, index: number) => (
                  <View key={index} style={styles.avatarInfoContainer}>
                    <ThemedText style={styles.avatarInfoTitle}>
                      Service {index + 1} ({service.careServiceId}):
                    </ThemedText>
                    <ThemedText style={styles.avatarInfoLabel}>
                      Caregiver Avatar:
                    </ThemedText>
                    <ThemedText style={styles.avatarInfoValue}>
                      {service.caregiverProfile?.avatarUrl || 'null'}
                    </ThemedText>
                    <ThemedText style={styles.avatarInfoLabel}>
                      Elderly Avatar:
                    </ThemedText>
                    <ThemedText style={styles.avatarInfoValue}>
                      {service.elderlyProfile?.avatarUrl || 'null'}
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#6C757D',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 16,
    color: '#6C757D',
    marginTop: 12,
    textAlign: 'center',
  },
  avatarPlaceholder: {
    backgroundColor: '#E9ECEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  debugButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#E8F6FB',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  debugButtonText: {
    fontSize: 12,
    color: '#68C2E8',
    fontWeight: '600',
  },
  responseContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  responseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  responseScrollView: {
    maxHeight: 400,
  },
  responseText: {
    fontSize: 12,
    color: '#2C3E50',
    fontFamily: 'monospace',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  avatarInfoContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  avatarInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#68C2E8',
    marginBottom: 8,
  },
  avatarInfoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6C757D',
    marginTop: 6,
  },
  avatarInfoValue: {
    fontSize: 11,
    color: '#2C3E50',
    fontFamily: 'monospace',
    marginTop: 4,
    marginBottom: 4,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
});
