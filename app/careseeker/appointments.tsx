import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SimpleNavBar } from '@/components/navigation/SimpleNavBar';
import { ThemedText } from '@/components/themed-text';

interface Appointment {
  id: string;
  caregiverId: string;
  caregiverName: string;
  caregiverAvatar: string;
  caregiverRating: number;
  elderlyName: string;
  elderlyAge: number;
  date: string;
  timeSlot: string;
  duration: string;
  packageType: string;
  address: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  amount: number;
}

const mockAppointments: Appointment[] = [
  {
    id: '1',
    caregiverId: 'CG001',
    caregiverName: 'Trần Văn Nam',
    caregiverAvatar: 'https://via.placeholder.com/100',
    caregiverRating: 4.8,
    elderlyName: 'Bà Nguyễn Thị Lan',
    elderlyAge: 75,
    date: '25/01/2025',
    timeSlot: '08:00 - 12:00',
    duration: '4 giờ',
    packageType: 'Gói cơ bản',
    address: '123 Lê Lợi, P. Bến Thành, Q.1, TP.HCM',
    status: 'completed',
    amount: 400000, // Gói cơ bản 4h
  },
  {
    id: '2',
    caregiverId: 'CG002',
    caregiverName: 'Nguyễn Thị Mai',
    caregiverAvatar: 'https://via.placeholder.com/100',
    caregiverRating: 4.5,
    elderlyName: 'Ông Trần Văn Minh',
    elderlyAge: 82,
    date: '26/01/2025',
    timeSlot: '14:00 - 22:00',
    duration: '8 giờ',
    packageType: 'Gói chuyên nghiệp',
    address: '456 Đường XYZ, Quận 2, TP.HCM',
    status: 'in-progress',
    amount: 750000, // Gói chuyên nghiệp 8h
  },
  {
    id: '3',
    caregiverId: 'CG003',
    caregiverName: 'Lê Thị Hoa',
    caregiverAvatar: 'https://via.placeholder.com/100',
    caregiverRating: 4.2,
    elderlyName: 'Bà Phạm Thị Mai',
    elderlyAge: 70,
    date: '27/01/2025',
    timeSlot: '08:00 - 12:00',
    duration: '4 giờ',
    packageType: 'Gói cơ bản',
    address: '789 Đường DEF, Quận 3, TP.HCM',
    status: 'confirmed',
    amount: 400000, // Gói cơ bản 4h
  },
  {
    id: '4',
    caregiverId: 'CG004',
    caregiverName: 'Phạm Văn Hùng',
    caregiverAvatar: 'https://via.placeholder.com/100',
    caregiverRating: 4.6,
    elderlyName: 'Ông Lê Văn Thành',
    elderlyAge: 78,
    date: '28/01/2025',
    timeSlot: '08:00 - 16:00',
    duration: '8 giờ',
    packageType: 'Gói nâng cao',
    address: '321 Nguyễn Huệ, Quận 1, TP.HCM',
    status: 'pending',
    amount: 1100000, // Gói nâng cao 8h
  },
  {
    id: '5',
    caregiverId: 'CG001',
    caregiverName: 'Trần Văn Nam',
    caregiverAvatar: 'https://via.placeholder.com/100',
    caregiverRating: 4.8,
    elderlyName: 'Bà Nguyễn Thị Lan',
    elderlyAge: 75,
    date: '22/01/2025',
    timeSlot: '08:00 - 12:00',
    duration: '4 giờ',
    packageType: 'Gói cơ bản',
    address: '123 Lê Lợi, P. Bến Thành, Q.1, TP.HCM',
    status: 'cancelled',
    amount: 400000, // Gói cơ bản 4h
  },
];

type StatusTab = 'all' | 'upcoming' | 'completed' | 'cancelled';

export default function AppointmentsScreen() {
  const [activeTab, setActiveTab] = useState<StatusTab>('all');

  const handleAppointmentPress = (appointment: Appointment) => {
    router.push({
      pathname: '/careseeker/appointment-detail',
      params: {
        id: appointment.id,
      },
    });
  };

  const getFilteredAppointments = () => {
    if (activeTab === 'all') {
      return mockAppointments;
    }
    if (activeTab === 'upcoming') {
      return mockAppointments.filter(apt => 
        apt.status === 'pending' || apt.status === 'confirmed' || apt.status === 'in-progress'
      );
    }
    return mockAppointments.filter(appointment => appointment.status === activeTab);
  };

  const getTabCount = (tab: StatusTab) => {
    if (tab === 'all') {
      return mockAppointments.length;
    }
    if (tab === 'upcoming') {
      return mockAppointments.filter(apt => 
        apt.status === 'pending' || apt.status === 'confirmed' || apt.status === 'in-progress'
      ).length;
    }
    return mockAppointments.filter(appointment => appointment.status === tab).length;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'confirmed': return '#3B82F6';
      case 'in-progress': return '#10B981';
      case 'completed': return '#6B7280';
      case 'cancelled': return '#EF4444';
      default: return '#9CA3AF';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'in-progress': return 'Đang thực hiện';
      case 'completed': return 'Đã hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  const renderAppointment = ({ item }: { item: Appointment }) => (
    <TouchableOpacity
      style={styles.appointmentCard}
      onPress={() => handleAppointmentPress(item)}
      activeOpacity={0.7}
    >
      {/* Status Badge */}
      <View style={styles.statusBadgeContainer}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <ThemedText style={styles.statusText}>{getStatusText(item.status)}</ThemedText>
        </View>
      </View>

      {/* Appointment Info */}
      <View style={styles.appointmentInfo}>
        <View style={styles.infoRow}>
          <View style={styles.avatarContainer}>
            <ThemedText style={styles.avatarText}>
              {item.caregiverName.charAt(0)}
            </ThemedText>
          </View>
          <View style={styles.infoContent}>
            <ThemedText style={styles.caregiverName}>{item.caregiverName}</ThemedText>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#FFB648" />
              <ThemedText style={styles.ratingText}>{item.caregiverRating}</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Ionicons name="person" size={18} color="#6B7280" />
            <ThemedText style={styles.detailText}>{item.elderlyName}</ThemedText>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="calendar" size={18} color="#6B7280" />
            <ThemedText style={styles.detailText}>{item.date}</ThemedText>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time" size={18} color="#6B7280" />
            <ThemedText style={styles.detailText}>{item.timeSlot}</ThemedText>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="location" size={18} color="#6B7280" />
            <ThemedText style={styles.detailText} numberOfLines={1}>{item.address}</ThemedText>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.footer}>
          <View style={styles.packageBadge}>
            <ThemedText style={styles.packageText}>{item.packageType}</ThemedText>
          </View>
          <ThemedText style={styles.amountText}>
            {item.amount.toLocaleString('vi-VN')} đ
          </ThemedText>
        </View>
      </View>

      {/* View Detail Arrow */}
      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={20} color="#68C2E8" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <ThemedText style={styles.headerTitle}>Lịch hẹn</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Quản lý lịch chăm sóc</ThemedText>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
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
      </View>

      {/* Content */}
      <View style={styles.content}>
        <FlatList
          data={getFilteredAppointments()}
          renderItem={renderAppointment}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={64} color="#9CA3AF" />
              <ThemedText style={styles.emptyText}>Chưa có lịch hẹn nào</ThemedText>
            </View>
          }
        />
      </View>

      <SimpleNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F9FD',
  },
  header: {
    backgroundColor: '#68C2E8',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#68C2E8',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  appointmentCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  statusBadgeContainer: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  appointmentInfo: {
    padding: 16,
    paddingTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#68C2E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  infoContent: {
    flex: 1,
  },
  caregiverName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#12394A',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#12394A',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  detailsGrid: {
    gap: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  packageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284C7',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#68C2E8',
  },
  arrowContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
});
