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
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';

interface ServiceStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalHours: number;
  hourlyRate: number;
}

interface HiringService {
  id: string;
  name: string;
  caregiverName: string;
  caregiverAvatar: string;
  elderlyName: string;
  familyName: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed';
  hourlyRate: number;
  stats: ServiceStats;
}

const mockHiringServices: HiringService[] = [
  {
    id: '1',
    name: 'Thuê Người chăm sóc',
    caregiverName: 'Nguyễn Thị Lan',
    caregiverAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    elderlyName: 'Ông Nguyễn Văn A',
    familyName: 'Gia đình A',
    startDate: '01/12/2024',
    endDate: '30/12/2024',
    status: 'completed',
    hourlyRate: 50000,
    stats: {
      totalTasks: 45,
      completedTasks: 42,
      pendingTasks: 3,
      totalHours: 120,
      hourlyRate: 50000,
    },
  },
  {
    id: '2',
    name: 'Thuê Người chăm sóc',
    caregiverName: 'Trần Văn Nam',
    caregiverAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    elderlyName: 'Bà Lê Thị B',
    familyName: 'Gia đình B',
    startDate: '15/11/2024',
    endDate: '30/11/2024',
    status: 'completed',
    hourlyRate: 45000,
    stats: {
      totalTasks: 38,
      completedTasks: 38,
      pendingTasks: 0,
      totalHours: 95,
      hourlyRate: 45000,
    },
  },
  {
    id: '3',
    name: 'Thuê Người chăm sóc',
    caregiverName: 'Phạm Thị Hoa',
    caregiverAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    elderlyName: 'Ông Trần Văn C',
    familyName: 'Gia đình C',
    startDate: '01/10/2024',
    status: 'active',
    hourlyRate: 55000,
    stats: {
      totalTasks: 25,
      completedTasks: 20,
      pendingTasks: 5,
      totalHours: 65,
      hourlyRate: 55000,
    },
  },
  {
    id: '4',
    name: 'Thuê Người chăm sóc',
    caregiverName: 'Lê Văn Minh',
    caregiverAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    elderlyName: 'Bà Nguyễn Thị D',
    familyName: 'Gia đình D',
    startDate: '01/09/2024',
    endDate: '15/12/2024',
    status: 'completed',
    hourlyRate: 48000,
    stats: {
      totalTasks: 52,
      completedTasks: 50,
      pendingTasks: 2,
      totalHours: 130,
      hourlyRate: 48000,
    },
  },
  {
    id: '5',
    name: 'Thuê Người chăm sóc',
    caregiverName: 'Hoàng Văn Đức',
    caregiverAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    elderlyName: 'Bà Nguyễn Thị E',
    familyName: 'Gia đình E',
    startDate: '01/12/2024',
    status: 'active',
    hourlyRate: 52000,
    stats: {
      totalTasks: 15,
      completedTasks: 12,
      pendingTasks: 3,
      totalHours: 35,
      hourlyRate: 52000,
    },
  },
];

type TabType = 'completed' | 'active';

export default function HiringHistoryScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('completed');
  const [selectedService, setSelectedService] = useState<HiringService | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const getFilteredServices = () => {
    return mockHiringServices.filter(service => service.status === activeTab);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Đang thuê';
      case 'completed':
        return 'Đã thuê';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#27AE60';
      case 'completed':
        return '#6C757D';
      default:
        return '#6C757D';
    }
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('vi-VN');
  };

  const handleServicePress = (service: HiringService) => {
    setSelectedService(service);
    setShowDetailModal(true);
  };

  const renderService = ({ item }: { item: HiringService }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => handleServicePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.serviceHeader}>
        <Image source={{ uri: item.caregiverAvatar }} style={styles.avatar} />
        <View style={styles.serviceInfo}>
          <ThemedText style={styles.serviceName}>{item.name}</ThemedText>
          <ThemedText style={styles.caregiverName}>{item.caregiverName}</ThemedText>
          <ThemedText style={styles.elderlyName}>Chăm sóc: {item.elderlyName}</ThemedText>
          <ThemedText style={styles.familyName}>Gia đình: {item.familyName}</ThemedText>
          <ThemedText style={styles.hourlyRate}>Lương: {formatAmount(item.hourlyRate)} VND/h</ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <ThemedText style={styles.statusText}>{getStatusText(item.status)}</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDetailModal = () => {
    if (!selectedService) return null;

    return (
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDetailModal(false)}
            >
              <Ionicons name="close" size={24} color="#2C3E50" />
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>Chi tiết dịch vụ</ThemedText>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={true}>
            <View style={styles.modalBody}>
              {/* Service Info */}
              <View style={styles.detailSection}>
                <ThemedText style={styles.sectionTitle}>Thông tin dịch vụ</ThemedText>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <ThemedText style={styles.infoLabel}>Tên dịch vụ:</ThemedText>
                    <ThemedText style={styles.infoValue}>{selectedService.name}</ThemedText>
                  </View>
                  <View style={styles.infoRow}>
                    <ThemedText style={styles.infoLabel}>Người chăm sóc:</ThemedText>
                    <ThemedText style={styles.infoValue}>{selectedService.caregiverName}</ThemedText>
                  </View>
                  <View style={styles.infoRow}>
                    <ThemedText style={styles.infoLabel}>Chăm sóc:</ThemedText>
                    <ThemedText style={styles.infoValue}>{selectedService.elderlyName}</ThemedText>
                  </View>
                  <View style={styles.infoRow}>
                    <ThemedText style={styles.infoLabel}>Gia đình:</ThemedText>
                    <ThemedText style={styles.infoValue}>{selectedService.familyName}</ThemedText>
                  </View>
                  <View style={styles.infoRow}>
                    <ThemedText style={styles.infoLabel}>Ngày bắt đầu:</ThemedText>
                    <ThemedText style={styles.infoValue}>{selectedService.startDate}</ThemedText>
                  </View>
                  {selectedService.endDate && (
                    <View style={styles.infoRow}>
                      <ThemedText style={styles.infoLabel}>Ngày kết thúc:</ThemedText>
                      <ThemedText style={styles.infoValue}>{selectedService.endDate}</ThemedText>
                    </View>
                  )}
                  <View style={styles.infoRow}>
                    <ThemedText style={styles.infoLabel}>Lương:</ThemedText>
                    <ThemedText style={styles.infoValue}>{formatAmount(selectedService.hourlyRate)} VND/h</ThemedText>
                  </View>
                </View>
              </View>

              {/* Statistics */}
              <View style={styles.detailSection}>
                <ThemedText style={styles.sectionTitle}>
                  {activeTab === 'completed' ? 'Thống kê' : 'Thống kê tới hiện tại'}
                </ThemedText>
                <View style={styles.statsContainer}>
                  <View style={styles.statCard}>
                    <ThemedText style={styles.statNumber}>{selectedService.stats.totalTasks}</ThemedText>
                    <ThemedText style={styles.statLabel}>Tổng nhiệm vụ</ThemedText>
                  </View>
                  <View style={styles.statCard}>
                    <ThemedText style={[styles.statNumber, { color: '#27AE60' }]}>{selectedService.stats.completedTasks}</ThemedText>
                    <ThemedText style={styles.statLabel}>Đã hoàn thành</ThemedText>
                  </View>
                  <View style={styles.statCard}>
                    <ThemedText style={[styles.statNumber, { color: '#E74C3C' }]}>{selectedService.stats.pendingTasks}</ThemedText>
                    <ThemedText style={styles.statLabel}>Chưa hoàn thành</ThemedText>
                  </View>
                  <View style={styles.statCard}>
                    <ThemedText style={styles.statNumber}>{selectedService.stats.totalHours}</ThemedText>
                    <ThemedText style={styles.statLabel}>Tổng giờ làm</ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
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
          <ThemedText style={styles.headerTitle}>Lịch sử thuê dịch vụ</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Quản lý các dịch vụ đã và đang thuê</ThemedText>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScrollContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
            onPress={() => setActiveTab('completed')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
              Đã thuê
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'active' && styles.tabActive]}
            onPress={() => setActiveTab('active')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
              Đang thuê
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <FlatList
          data={getFilteredServices()}
          renderItem={renderService}
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
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#8E44AD',
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
    color: 'white',
    opacity: 0.8,
  },
  filterButton: {
    padding: 8,
  },
  tabsContainer: {
    backgroundColor: '#F7F9FC',
    paddingVertical: 12,
  },
  tabsScrollContainer: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  tabActive: {
    backgroundColor: '#8E44AD',
    borderColor: '#8E44AD',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C757D',
  },
  tabTextActive: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 8,
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
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  caregiverName: {
    fontSize: 14,
    color: '#3498DB',
    marginBottom: 2,
  },
  elderlyName: {
    fontSize: 12,
    color: '#E74C3C',
    marginBottom: 2,
  },
  familyName: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 2,
  },
  hourlyRate: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '600',
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6C757D',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6C757D',
    textAlign: 'center',
  },
});
