import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SimpleNavBar } from '@/components/navigation/SimpleNavBar';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext';
import { getAppointmentStatus, subscribeToStatusChanges } from '@/data/appointmentStore';
// TODO: Replace with API calls
// import { useAppointments } from '@/hooks/useDatabaseEntities';
// import * as CaregiverRepository from '@/services/caregiver.repository';
import { Appointment } from '@/services/database.types';

type StatusTab = 'all' | 'upcoming' | 'completed' | 'cancelled';

export default function AppointmentsScreen() {
  const { user } = useAuth();
  // TODO: Replace with API call
  // const { appointments, loading, error, refresh } = useAppointments(user?.id || '');
  // Mock data tạm thời
  const appointments: any[] = [
    {
      id: 'apt-1',
      caregiver_id: 'caregiver-1',
      start_date: '2024-12-25',
      start_time: '08:00',
      package_type: 'Gói cơ bản',
      status: 'confirmed',
    },
  ];
  const loading = false;
  const error = null;
  const refresh = async () => {};
  const [activeTab, setActiveTab] = useState<StatusTab>('all');
  const [refreshKey, setRefreshKey] = useState(0); // For triggering re-render when status changes
  const [caregiverInfo, setCaregiverInfo] = useState<{ [key: string]: { name: string; avatar?: string } }>({});
  
  // Load caregiver information for all appointments
  useEffect(() => {
    const loadCaregiverInfo = async () => {
      const info: { [key: string]: { name: string; avatar?: string } } = {};
      for (const apt of appointments) {
        if (apt.caregiver_id && !info[apt.caregiver_id]) {
          try {
            // Mock data tạm thời - TODO: Replace with API call
            const mockCaregivers: { [key: string]: any } = {
              'caregiver-1': { id: 'caregiver-1', name: 'Chị Nguyễn Thị Lan', rating: 4.8 },
            };
            const caregiver = mockCaregivers[apt.caregiver_id] || null;
            if (caregiver) {
              info[apt.caregiver_id] = {
                name: caregiver.name,
                avatar: caregiver.avatar,
              };
            }
          } catch (err) {
            console.error('Error loading caregiver:', err);
          }
        }
      }
      setCaregiverInfo(info);
    };

    if (appointments.length > 0) {
      loadCaregiverInfo();
    }
  }, [appointments]);
  
  // Auto-refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        refresh();
      }
    }, [user?.id, refresh])
  );
  
  // Subscribe to status changes from global store
  useEffect(() => {
    const unsubscribe = subscribeToStatusChanges(() => {
      // Trigger re-render when appointment status changes
      setRefreshKey(prev => prev + 1);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  const handleAppointmentPress = (appointment: Appointment) => {
    router.push({
      pathname: '/careseeker/appointment-detail',
      params: {
        id: appointment.id,
      },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2DC2D7" />
          <ThemedText style={styles.loadingText}>Đang tải lịch hẹn...</ThemedText>
        </View>
        <SimpleNavBar />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.errorText}>Lỗi: {error.message}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <ThemedText style={styles.retryText}>Thử lại</ThemedText>
          </TouchableOpacity>
        </View>
        <SimpleNavBar />
      </SafeAreaView>
    );
  }

  const getFilteredAppointments = () => {
    if (activeTab === 'all') {
      return appointments;
    }
    if (activeTab === 'upcoming') {
      return appointments.filter(apt => {
        const globalStatus = getAppointmentStatus(apt.id);
        const currentStatus = globalStatus || apt.status;
        return currentStatus === 'pending' || currentStatus === 'confirmed' || currentStatus === 'in-progress';
      });
    }
    if (activeTab === 'cancelled') {
      return appointments.filter(apt => {
        const globalStatus = getAppointmentStatus(apt.id);
        const currentStatus = globalStatus || apt.status;
        return currentStatus === 'cancelled' || currentStatus === 'rejected';
      });
    }
    return appointments.filter(apt => {
      const globalStatus = getAppointmentStatus(apt.id);
      const currentStatus = globalStatus || apt.status;
      return currentStatus === activeTab;
    });
  };

  const getTabCount = (tab: StatusTab) => {
    if (tab === 'all') {
      return appointments.length;
    }
    if (tab === 'upcoming') {
      return appointments.filter(apt => {
        const globalStatus = getAppointmentStatus(apt.id);
        const currentStatus = globalStatus || apt.status;
        return currentStatus === 'pending' || currentStatus === 'confirmed' || currentStatus === 'in-progress';
      }).length;
    }
    if (tab === 'cancelled') {
      return appointments.filter(apt => {
        const globalStatus = getAppointmentStatus(apt.id);
        const currentStatus = globalStatus || apt.status;
        return currentStatus === 'cancelled' || currentStatus === 'rejected';
      }).length;
    }
    return appointments.filter(apt => {
      const globalStatus = getAppointmentStatus(apt.id);
      const currentStatus = globalStatus || apt.status;
      return currentStatus === tab;
    }).length;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'confirmed': return '#3B82F6';
      case 'in-progress': return '#10B981';
      case 'completed': return '#6B7280';
      case 'cancelled':
      case 'rejected': return '#EF4444';
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
      case 'rejected': return 'Đã từ chối';
      default: return 'Không xác định';
    }
  };

  const renderAppointment = ({ item }: { item: any }) => {
    // Get real-time status from global store
    const globalStatus = getAppointmentStatus(item.id);
    const currentStatus = globalStatus || item.status;
    
    // Get caregiver info
    const caregiver = caregiverInfo[item.caregiver_id];
    const caregiverName = caregiver?.name || 'Đang tải...';
    const caregiverAvatar = caregiver?.avatar;
    
    return (
      <TouchableOpacity
        style={styles.appointmentCard}
        onPress={() => handleAppointmentPress(item)}
        activeOpacity={0.7}
      >
        {/* Status Badge */}
        <View style={styles.statusBadgeContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(currentStatus) }]}>
            <ThemedText style={styles.statusText}>{getStatusText(currentStatus)}</ThemedText>
          </View>
        </View>

      {/* Appointment Info */}
      <View style={styles.appointmentInfo}>
        <View style={styles.infoRow}>
          <View style={styles.avatarContainer}>
            {caregiverAvatar ? (
              <Image source={{ uri: caregiverAvatar }} style={styles.avatarImage} />
            ) : (
              <ThemedText style={styles.avatarText}>
                {caregiverName.charAt(0).toUpperCase()}
              </ThemedText>
            )}
          </View>
          <View style={styles.infoContent}>
            <ThemedText style={styles.caregiverName}>{caregiverName}</ThemedText>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#FFB648" />
              <ThemedText style={styles.ratingText}>4.5</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Ionicons name="person" size={18} color="#6B7280" />
            <ThemedText style={styles.detailText}>Elderly {item.elderly_profile_id}</ThemedText>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="calendar" size={18} color="#6B7280" />
            <ThemedText style={styles.detailText}>{item.start_date}</ThemedText>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time" size={18} color="#6B7280" />
            <ThemedText style={styles.detailText}>{item.start_time} - {item.end_time}</ThemedText>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="location" size={18} color="#6B7280" />
            <ThemedText style={styles.detailText} numberOfLines={1}>{item.work_location || 'N/A'}</ThemedText>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.footer}>
          <View style={styles.packageBadge}>
            <ThemedText style={styles.packageText}>{item.package_type || 'Gói cơ bản'}</ThemedText>
          </View>
          <ThemedText style={styles.amountText}>
            {(item.total_amount || 0).toLocaleString('vi-VN')} đ
          </ThemedText>
        </View>
      </View>

        {/* View Detail Arrow */}
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={20} color="#68C2E8" />
        </View>
      </TouchableOpacity>
    );
  };

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
          extraData={refreshKey}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F9FD',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#2DC2D7',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    overflow: 'hidden',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
