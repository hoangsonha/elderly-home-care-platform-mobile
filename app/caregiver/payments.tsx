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

interface Service {
  id: string;
  name: string;
  caregiverName: string;
  caregiverAvatar: string;
  elderlyName: string;
  familyName: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'cancelled';
}

interface Payment {
  id: string;
  serviceId: string;
  type: 'salary' | 'deposit' | 'refund' | 'deposit_refund';
  amount: number;
  currency: string;
  date: string;
  dueDate?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: 'bank_transfer' | 'credit_card' | 'wallet';
  description: string;
  transactionId?: string;
}

const mockServices: Service[] = [
  {
    id: '1',
    name: 'Thuê Người chăm sóc',
    caregiverName: 'Nguyễn Thị Lan',
    caregiverAvatar: 'https://via.placeholder.com/50',
    elderlyName: 'Ông Nguyễn Văn A',
    familyName: 'Gia đình A',
    startDate: '01/12/2024',
    status: 'active',
  },
  {
    id: '2',
    name: 'Thuê Người chăm sóc',
    caregiverName: 'Trần Văn Nam',
    caregiverAvatar: 'https://via.placeholder.com/50',
    elderlyName: 'Bà Lê Thị B',
    familyName: 'Gia đình B',
    startDate: '15/11/2024',
    endDate: '30/11/2024',
    status: 'completed',
  },
  {
    id: '3',
    name: 'Thuê Người chăm sóc',
    caregiverName: 'Phạm Thị Hoa',
    caregiverAvatar: 'https://via.placeholder.com/50',
    elderlyName: 'Ông Trần Văn C',
    familyName: 'Gia đình C',
    startDate: '01/10/2024',
    status: 'active',
  },
];

const mockPayments: Payment[] = [
  // Service 1 - Lịch sử
  {
    id: '1',
    serviceId: '1',
    type: 'salary',
    amount: 2400000,
    currency: 'VND',
    date: '20/12/2024',
    status: 'completed',
    method: 'bank_transfer',
    description: 'Lương tháng 12/2024',
    transactionId: 'TXN123456789',
  },
  {
    id: '2',
    serviceId: '1',
    type: 'deposit',
    amount: 500000,
    currency: 'VND',
    date: '01/12/2024',
    status: 'completed',
    method: 'bank_transfer',
    description: 'Tiền cọc dịch vụ',
    transactionId: 'TXN123456790',
  },
  // Service 1 - Tương lai
  {
    id: '3',
    serviceId: '1',
    type: 'salary',
    amount: 2400000,
    currency: 'VND',
    dueDate: '20/01/2025',
    status: 'pending',
    method: 'bank_transfer',
    description: 'Lương tháng 1/2025',
  },
  {
    id: '4',
    serviceId: '1',
    type: 'refund',
    amount: 500000,
    currency: 'VND',
    dueDate: '01/02/2025',
    status: 'pending',
    method: 'bank_transfer',
    description: 'Hoàn tiền cọc',
  },
  // Service 2 - Lịch sử
  {
    id: '5',
    serviceId: '2',
    type: 'salary',
    amount: 1800000,
    currency: 'VND',
    date: '30/11/2024',
    status: 'completed',
    method: 'credit_card',
    description: 'Lương tháng 11/2024',
    transactionId: 'TXN123456791',
  },
  {
    id: '6',
    serviceId: '2',
    type: 'deposit',
    amount: 400000,
    currency: 'VND',
    date: '15/11/2024',
    status: 'completed',
    method: 'credit_card',
    description: 'Tiền cọc dịch vụ',
    transactionId: 'TXN123456792',
  },
  {
    id: '11',
    serviceId: '2',
    type: 'deposit_refund',
    amount: 400000,
    currency: 'VND',
    date: '01/12/2024',
    status: 'completed',
    method: 'credit_card',
    description: 'Hoàn cọc dịch vụ đã hoàn thành',
    transactionId: 'TXN123456795',
  },
  // Service 3 (Phạm Thị Hoa thuê ông C) - Tương lai (chỉ có tiền cọc và lương, không có hoàn cọc)
  {
    id: '9',
    serviceId: '3',
    type: 'salary',
    amount: 2000000,
    currency: 'VND',
    dueDate: '15/01/2025',
    status: 'pending',
    method: 'wallet',
    description: 'Lương tháng 1/2025',
  },
  {
    id: '13',
    serviceId: '3',
    type: 'deposit',
    amount: 600000,
    currency: 'VND',
    dueDate: '01/01/2025',
    status: 'pending',
    method: 'wallet',
    description: 'Tiền cọc dịch vụ',
  },
  {
    id: '14',
    serviceId: '3',
    type: 'salary',
    amount: 2000000,
    currency: 'VND',
    dueDate: '15/02/2025',
    status: 'pending',
    method: 'wallet',
    description: 'Lương tháng 2/2025',
  },
];

type ServiceTab = 'history' | 'future';

export default function PaymentsScreen() {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [activeServiceTab, setActiveServiceTab] = useState<ServiceTab>('history');

  const handlePaymentPress = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  const handleServicePress = (service: Service) => {
    setSelectedService(service);
    setActiveServiceTab('history');
  };

  const getServicePayments = (serviceId: string, tab: ServiceTab) => {
    if (tab === 'history') {
      return mockPayments.filter(payment => 
        payment.serviceId === serviceId && 
        payment.status === 'completed'
      );
    } else {
      return mockPayments.filter(payment => 
        payment.serviceId === serviceId && 
        payment.status === 'pending'
      );
    }
  };

  const getPaymentTypeText = (type: string) => {
    switch (type) {
      case 'salary':
        return 'Lương';
      case 'deposit':
        return 'Tiền cọc';
      case 'refund':
        return 'Hoàn tiền';
      case 'deposit_refund':
        return 'Hoàn cọc';
      default:
        return 'Thanh toán';
    }
  };

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case 'salary':
        return '#2ed573';
      case 'deposit':
        return '#3498DB';
      case 'refund':
        return '#E74C3C';
      case 'deposit_refund':
        return '#FF6B6B';
      default:
        return '#6C757D';
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return 'Chuyển khoản';
      case 'credit_card':
        return 'Thẻ tín dụng';
      case 'wallet':
        return 'Ví điện tử';
      default:
        return 'Không xác định';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#27AE60';
      case 'pending':
        return '#F39C12';
      case 'failed':
        return '#E74C3C';
      case 'refunded':
        return '#9B59B6';
      default:
        return '#95A5A6';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Thành công';
      case 'pending':
        return 'Chờ xử lý';
      case 'failed':
        return 'Thất bại';
      case 'refunded':
        return 'Đã hoàn tiền';
      default:
        return 'Không xác định';
    }
  };

  const getMethodText = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return 'Chuyển khoản';
      case 'credit_card':
        return 'Thẻ tín dụng';
      case 'wallet':
        return 'Ví điện tử';
      default:
        return 'Không xác định';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return 'card-outline';
      case 'credit_card':
        return 'card-outline';
      case 'wallet':
        return 'wallet-outline';
      default:
        return 'card-outline';
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${amount.toLocaleString('vi-VN')} ${currency}`;
  };

  const getServiceStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Đang hoạt động';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#2ed573';
      case 'completed':
        return '#3498DB';
      case 'cancelled':
        return '#E74C3C';
      default:
        return '#6C757D';
    }
  };

  const renderService = ({ item }: { item: Service }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => handleServicePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.serviceCardHeader}>
        <Image source={{ uri: item.caregiverAvatar }} style={styles.serviceCardAvatar} />
        <View style={styles.serviceInfo}>
          <ThemedText style={styles.serviceName}>{item.name}</ThemedText>
          <ThemedText style={styles.serviceDescription}>Dịch vụ chăm sóc người cao tuổi</ThemedText>
        </View>
        <View style={styles.serviceArrow}>
          <Ionicons name="chevron-forward" size={20} color="#6C757D" />
        </View>
      </View>

      <View style={styles.serviceCardBody}>
        <View style={styles.serviceDetailRow}>
          <View style={styles.serviceDetailItem}>
            <Ionicons name="person-circle" size={16} color="#3498DB" />
            <ThemedText style={styles.serviceDetailText}>{item.caregiverName}</ThemedText>
          </View>
          <View style={styles.serviceDetailItem}>
            <Ionicons name="heart" size={16} color="#E74C3C" />
            <ThemedText style={styles.serviceDetailText}>{item.elderlyName}</ThemedText>
          </View>
        </View>
        <View style={styles.serviceDetailRow}>
          <View style={styles.serviceDetailItem}>
            <Ionicons name="home" size={16} color="#27AE60" />
            <ThemedText style={styles.serviceDetailText}>{item.familyName}</ThemedText>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getServiceStatusColor(item.status) }]}>
            <ThemedText style={styles.statusText}>{getServiceStatusText(item.status)}</ThemedText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPayment = ({ item }: { item: Payment }) => (
    <TouchableOpacity
      style={styles.paymentCard}
      onPress={() => handlePaymentPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.paymentHeader}>
        <View style={styles.paymentAvatarContainer}>
          <Image source={{ uri: 'https://via.placeholder.com/40' }} style={styles.paymentAvatar} />
          <View style={styles.paymentInfo}>
            <ThemedText style={styles.paymentType}>{getPaymentTypeText(item.type)}</ThemedText>
            <ThemedText style={styles.paymentDescription}>{item.description}</ThemedText>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <ThemedText style={styles.statusText}>{getStatusText(item.status)}</ThemedText>
        </View>
      </View>

      <View style={styles.paymentDetails}>
        <View style={styles.amountRow}>
          <ThemedText style={styles.amountLabel}>Số tiền:</ThemedText>
          <ThemedText style={styles.amountValue}>
            {item.amount.toLocaleString('vi-VN')} {item.currency}
          </ThemedText>
        </View>
        <View style={styles.dateRow}>
          <ThemedText style={styles.dateLabel}>
            {item.date ? 'Ngày:' : 'Hạn thanh toán:'}
          </ThemedText>
          <ThemedText style={styles.dateValue}>{item.date || item.dueDate}</ThemedText>
        </View>
        <View style={styles.methodRow}>
          <ThemedText style={styles.methodLabel}>Phương thức:</ThemedText>
          <ThemedText style={styles.methodValue}>{getPaymentMethodText(item.method)}</ThemedText>
        </View>
      </View>

      <View style={styles.descriptionContainer}>
        <ThemedText style={styles.descriptionText}>{item.description}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  const renderDetailModal = () => {
    if (!selectedPayment) return null;

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
              <ThemedText style={styles.modalTitle}>Chi tiết thanh toán</ThemedText>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowDetailModal(false)}
              >
                <Ionicons name="close" size={24} color="#6C757D" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Payment Amount */}
              <View style={styles.amountSection}>
                <ThemedText style={styles.amountLabel}>Số tiền</ThemedText>
                <ThemedText style={styles.amountValue}>
                  {formatAmount(selectedPayment.amount, selectedPayment.currency)}
                </ThemedText>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedPayment.status) }]}>
                  <ThemedText style={styles.statusText}>{getStatusText(selectedPayment.status)}</ThemedText>
                </View>
              </View>

              {/* Caregiver Info */}
              <View style={styles.detailSection}>
                <View style={styles.detailHeader}>
                  <Image source={{ uri: selectedPayment.caregiverAvatar }} style={styles.detailAvatar} />
                  <View style={styles.detailInfo}>
                    <ThemedText style={styles.detailTitle}>Người chăm sóc</ThemedText>
                    <ThemedText style={styles.detailSubtitle}>{selectedPayment.caregiverName}</ThemedText>
                  </View>
                </View>
              </View>

              {/* Payment Details */}
              <View style={styles.detailSection}>
                <ThemedText style={styles.sectionTitle}>Thông tin thanh toán</ThemedText>
                
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Người được chăm sóc:</ThemedText>
                  <ThemedText style={styles.detailValue}>{selectedPayment.elderlyName}</ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Gia đình:</ThemedText>
                  <ThemedText style={styles.detailValue}>{selectedPayment.familyName}</ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Ngày thanh toán:</ThemedText>
                  <ThemedText style={styles.detailValue}>{selectedPayment.date}</ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Phương thức:</ThemedText>
                  <ThemedText style={styles.detailValue}>{getMethodText(selectedPayment.method)}</ThemedText>
                </View>
                {selectedPayment.transactionId && (
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Mã giao dịch:</ThemedText>
                    <ThemedText style={styles.detailValue}>{selectedPayment.transactionId}</ThemedText>
                  </View>
                )}
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Trạng thái:</ThemedText>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedPayment.status) }]}>
                    <ThemedText style={styles.statusText}>{getStatusText(selectedPayment.status)}</ThemedText>
                  </View>
                </View>
              </View>

              {/* Description */}
              <View style={styles.detailSection}>
                <ThemedText style={styles.sectionTitle}>Mô tả</ThemedText>
                <View style={styles.descriptionBox}>
                  <ThemedText style={styles.descriptionContent}>{selectedPayment.description}</ThemedText>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                {selectedPayment.status === 'pending' && (
                  <>
                    <TouchableOpacity style={styles.retryButton}>
                      <Ionicons name="refresh" size={20} color="white" />
                      <ThemedText style={styles.retryButtonText}>Thử lại</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton}>
                      <Ionicons name="close-circle" size={20} color="#E74C3C" />
                      <ThemedText style={styles.cancelButtonText}>Hủy</ThemedText>
                    </TouchableOpacity>
                  </>
                )}
                {selectedPayment.status === 'completed' && (
                  <TouchableOpacity style={styles.downloadButton}>
                    <Ionicons name="download" size={20} color="white" />
                    <ThemedText style={styles.downloadButtonText}>Tải hóa đơn</ThemedText>
                  </TouchableOpacity>
                )}
                {selectedPayment.status === 'failed' && (
                  <TouchableOpacity style={styles.contactButton}>
                    <Ionicons name="call" size={20} color="white" />
                    <ThemedText style={styles.contactButtonText}>Liên hệ hỗ trợ</ThemedText>
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
          <ThemedText style={styles.headerTitle}>Thanh toán</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Quản lý thanh toán dịch vụ</ThemedText>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={24} color="white" />
        </TouchableOpacity>
      </View>


      {/* Content */}
      <View style={styles.content}>
        {selectedService ? (
            <View style={styles.serviceDetailContainer}>
              {/* Service Info */}
              <View style={styles.selectedServiceCard}>
                <View style={styles.serviceHeader}>
                  <Image source={{ uri: selectedService.caregiverAvatar }} style={styles.avatar} />
                  <View style={styles.serviceInfo}>
                    <ThemedText style={styles.serviceName}>{selectedService.name || 'N/A'}</ThemedText>
                    <ThemedText style={styles.caregiverName}>{selectedService.caregiverName || 'N/A'}</ThemedText>
                    <ThemedText style={styles.elderlyName}>Chăm sóc: {selectedService.elderlyName || 'N/A'}</ThemedText>
                    <ThemedText style={styles.familyName}>Gia đình: {selectedService.familyName || 'N/A'}</ThemedText>
                    <ThemedText style={styles.statusText}>Trạng thái: {getServiceStatusText(selectedService.status)}</ThemedText>
                    <ThemedText style={styles.startDate}>Ngày bắt đầu: {selectedService.startDate || 'N/A'}</ThemedText>
                    {selectedService.endDate && (
                      <ThemedText style={styles.endDate}>Ngày kết thúc: {selectedService.endDate}</ThemedText>
                    )}
                  </View>
                </View>
              </View>

              {/* Service Tabs */}
              <View style={styles.serviceTabsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.serviceTabsScrollContainer}>
                  <TouchableOpacity
                    style={[styles.serviceTab, activeServiceTab === 'history' && styles.serviceTabActive]}
                    onPress={() => setActiveServiceTab('history')}
                  >
                    <ThemedText style={[styles.serviceTabText, activeServiceTab === 'history' && styles.serviceTabTextActive]}>
                      Lịch sử
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.serviceTab, activeServiceTab === 'future' && styles.serviceTabActive]}
                    onPress={() => setActiveServiceTab('future')}
                  >
                    <ThemedText style={[styles.serviceTabText, activeServiceTab === 'future' && styles.serviceTabTextActive]}>
                      Tương lai
                    </ThemedText>
                  </TouchableOpacity>
                </ScrollView>
              </View>

              {/* Payments List */}
              <FlatList
                data={getServicePayments(selectedService.id, activeServiceTab)}
                renderItem={renderPayment}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
              />
            </View>
        ) : (
          <View style={styles.servicesContainer}>
            <View style={styles.servicesTitleContainer}>
              <ThemedText style={styles.servicesTitle}>Chọn 1 dịch vụ để xem</ThemedText>
              <ThemedText style={styles.servicesSubtitle}>Thanh toán và lịch sử giao dịch</ThemedText>
            </View>
            <FlatList
              data={mockServices}
              renderItem={renderService}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          </View>
        )}
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
  },
  header: {
    backgroundColor: '#27AE60',
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
  filterButton: {
    padding: 8,
  },
  tabsContainer: {
    backgroundColor: '#F7F9FC',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  tabsScrollContainer: {
    paddingHorizontal: 20,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  tabActive: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
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
  servicesContainer: {
    flex: 1,
  },
  servicesTitleContainer: {
    backgroundColor: '#F7F9FC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  servicesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  servicesSubtitle: {
    fontSize: 14,
    color: '#6C757D',
  },
  serviceDetailContainer: {
    flex: 1,
  },
  selectedServiceCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  serviceCard: {
    backgroundColor: 'white',
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F8F9FA',
  },
  serviceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceCardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  serviceInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '600',
    marginBottom: 4,
  },
  startDate: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 2,
  },
  endDate: {
    fontSize: 12,
    color: '#6C757D',
  },
  caregiverName: {
    fontSize: 14,
    color: '#3498DB',
    marginBottom: 4,
  },
  elderlyName: {
    fontSize: 12,
    color: '#E74C3C',
    marginBottom: 4,
  },
  familyName: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#6C757D',
  },
  serviceArrow: {
    padding: 4,
  },
  serviceCardBody: {
    gap: 8,
  },
  serviceDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceDetailText: {
    fontSize: 14,
    color: '#2C3E50',
    marginLeft: 8,
    flex: 1,
  },
  backToServicesButton: {
    padding: 8,
  },
  serviceTabsContainer: {
    backgroundColor: '#F7F9FC',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  serviceTabsScrollContainer: {
    paddingHorizontal: 16,
  },
  serviceTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  serviceTabActive: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },
  serviceTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6C757D',
  },
  serviceTabTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  paymentType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  paymentDescription: {
    fontSize: 14,
    color: '#6C757D',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 14,
    color: '#6C757D',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: '#6C757D',
  },
  dateValue: {
    fontSize: 14,
    color: '#2C3E50',
  },
  methodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  methodLabel: {
    fontSize: 14,
    color: '#6C757D',
  },
  methodValue: {
    fontSize: 14,
    color: '#2C3E50',
  },
  listContainer: {
    padding: 8,
  },
  paymentCard: {
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
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentAvatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  caregiverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  elderlyInfo: {
    fontSize: 14,
    color: '#6C757D',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27AE60',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  paymentDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6C757D',
    marginLeft: 8,
  },
  descriptionContainer: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#27AE60',
  },
  descriptionText: {
    fontSize: 14,
    color: '#495057',
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
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
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
    padding: 20,
  },
  amountSection: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  amountLabel: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27AE60',
    marginBottom: 12,
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
  descriptionBox: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#27AE60',
  },
  descriptionContent: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  retryButton: {
    flex: 1,
    backgroundColor: '#F39C12',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  retryButtonText: {
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
  downloadButton: {
    flex: 1,
    backgroundColor: '#3498DB',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#9B59B6',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

