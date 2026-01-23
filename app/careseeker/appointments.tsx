import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { useBottomNavPadding } from '@/hooks/useBottomNavPadding';
import { mainService, type MyCareServiceData } from '@/services/main.service';
import { Appointment } from '@/services/database.types';

type StatusTab = 'all' | 'upcoming' | 'completed' | 'cancelled';

export default function AppointmentsScreen() {
  const { user } = useAuth();
  const bottomNavPadding = useBottomNavPadding();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState<StatusTab>('all');
  const [refreshKey, setRefreshKey] = useState(0); // For triggering re-render when status changes
  
  // Fetch appointments from API
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await mainService.getMyCareServices();
      
      if (response.status === 'Success' && response.data) {
        // Map API data to appointment format
        const mappedAppointments = response.data.map((service: MyCareServiceData) => {
          // Parse location if it's a JSON string
          let locationObj = { address: '', latitude: 0, longitude: 0 };
          try {
            if (typeof service.location === 'string') {
              locationObj = JSON.parse(service.location);
            } else {
              locationObj = service.location as any;
            }
          } catch (e) {
            // Use elderly profile location as fallback
            locationObj = {
              address: service.elderlyProfile.location.address,
              latitude: service.elderlyProfile.location.latitude,
              longitude: service.elderlyProfile.location.longitude,
            };
          }

          return {
            id: service.careServiceId,
            caregiver_id: service.caregiverProfile.caregiverProfileId,
            elderly_profile_id: service.elderlyProfile.elderlyProfileId,
            start_date: service.workDate,
            start_time: service.startTime.split(':').slice(0, 2).join(':'), // Convert "06:20:00" to "06:20"
            end_time: service.endTime.split(':').slice(0, 2).join(':'),
            package_type: service.servicePackage.packageName,
            status: service.status,
            work_location: locationObj.address,
            latitude: locationObj.latitude,
            longitude: locationObj.longitude,
            total_amount: service.totalPrice,
            caregiver: {
              id: service.caregiverProfile.caregiverProfileId,
              name: service.caregiverProfile.fullName,
              avatar: service.caregiverProfile.avatarUrl,
            },
            elderly: {
              id: service.elderlyProfile.elderlyProfileId,
              name: service.elderlyProfile.fullName,
              avatar: service.elderlyProfile.avatarUrl,
            },
            servicePackage: service.servicePackage,
            bookingCode: service.bookingCode,
            note: service.note,
            feedback: service.feedback || null,
          };
        });
        
        setAppointments(mappedAppointments);
      } else {
        setError(new Error(response.message || 'Không thể tải danh sách lịch hẹn'));
        setAppointments([]);
      }
    } catch (err: any) {
      setError(err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        fetchAppointments();
      }
    }, [user?.id, fetchAppointments])
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
          <TouchableOpacity style={styles.retryButton} onPress={fetchAppointments}>
            <ThemedText style={styles.retryText}>Thử lại</ThemedText>
          </TouchableOpacity>
        </View>
        <SimpleNavBar />
      </SafeAreaView>
    );
  }

  const getFilteredAppointments = () => {
    if (activeTab === 'all') {
      // Show all appointments (including EXPIRED and PENDING_CAREGIVER)
      return appointments;
    }
    if (activeTab === 'upcoming') {
      // CAREGIVER_APPROVED, IN_PROGRESS, COMPLETED_WAITING_REVIEW
      return appointments.filter(apt => {
        const globalStatus = getAppointmentStatus(apt.id);
        const currentStatus = globalStatus || apt.status;
        return currentStatus === 'CAREGIVER_APPROVED' || 
               currentStatus === 'IN_PROGRESS' || 
               currentStatus === 'COMPLETED_WAITING_REVIEW';
      });
    }
    if (activeTab === 'completed') {
      // COMPLETED
      return appointments.filter(apt => {
        const globalStatus = getAppointmentStatus(apt.id);
        const currentStatus = globalStatus || apt.status;
        return currentStatus === 'COMPLETED';
      });
    }
    if (activeTab === 'cancelled') {
      // CANCELLED
      return appointments.filter(apt => {
        const globalStatus = getAppointmentStatus(apt.id);
        const currentStatus = globalStatus || apt.status;
        return currentStatus === 'CANCELLED';
      });
    }
    return appointments;
  };

  const getTabCount = (tab: StatusTab) => {
    if (tab === 'all') {
      // Count all appointments
      return appointments.length;
    }
    if (tab === 'upcoming') {
      return appointments.filter(apt => {
        const globalStatus = getAppointmentStatus(apt.id);
        const currentStatus = globalStatus || apt.status;
        return currentStatus === 'CAREGIVER_APPROVED' || 
               currentStatus === 'IN_PROGRESS' || 
               currentStatus === 'COMPLETED_WAITING_REVIEW';
      }).length;
    }
    if (tab === 'completed') {
      return appointments.filter(apt => {
        const globalStatus = getAppointmentStatus(apt.id);
        const currentStatus = globalStatus || apt.status;
        return currentStatus === 'COMPLETED';
      }).length;
    }
    if (tab === 'cancelled') {
      return appointments.filter(apt => {
        const globalStatus = getAppointmentStatus(apt.id);
        const currentStatus = globalStatus || apt.status;
        return currentStatus === 'CANCELLED';
      }).length;
    }
    return 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_CAREGIVER': return '#F59E0B';
      case 'CAREGIVER_APPROVED': return '#3B82F6';
      case 'IN_PROGRESS': return '#10B981';
      case 'COMPLETED_WAITING_REVIEW': return '#8B5CF6';
      case 'COMPLETED': return '#6B7280';
      case 'CANCELLED': return '#EF4444';
      case 'EXPIRED': return '#9CA3AF';
      default: return '#9CA3AF';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING_CAREGIVER': return 'Chờ phản hồi';
      case 'CAREGIVER_APPROVED': return 'Đã xác nhận';
      case 'IN_PROGRESS': return 'Đang thực hiện';
      case 'COMPLETED_WAITING_REVIEW': return 'Chờ đánh giá';
      case 'COMPLETED': return 'Đã hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      case 'EXPIRED': return 'Đã hết hạn';
      default: return 'Không xác định';
    }
  };

  const handleViewMap = (item: any, event: any) => {
    event.stopPropagation(); // Prevent triggering the card press
    
    if (!item.latitude || !item.longitude || item.latitude === 0 || item.longitude === 0) {
      Alert.alert('Thông báo', 'Chưa có tọa độ địa điểm');
      return;
    }

    const lat = item.latitude;
    const lng = item.longitude;
    
    const url = Platform.select({
      ios: `maps://maps.apple.com/?q=${lat},${lng}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}`,
    });

    const webUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    Linking.openURL(url || webUrl).catch((err) => {
      console.error('Error opening maps:', err);
      Alert.alert('Lỗi', 'Không thể mở bản đồ');
    });
  };

  const renderAppointment = ({ item }: { item: any }) => {
    // Get real-time status from global store
    const globalStatus = getAppointmentStatus(item.id);
    const currentStatus = globalStatus || item.status;
    
    // Get caregiver info from mapped data
    const caregiverName = item.caregiver?.name || 'Đang tải...';
    const caregiverAvatar = item.caregiver?.avatar;
    
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
            {item.feedback && item.feedback.rating ? (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#FFB648" />
                <ThemedText style={styles.ratingText}>{item.feedback.rating.toFixed(1)}</ThemedText>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Ionicons name="person" size={18} color="#6B7280" />
            <ThemedText style={styles.detailText}>{item.elderly?.name || 'Người già'}</ThemedText>
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
            {item.latitude && item.longitude && item.latitude !== 0 && item.longitude !== 0 ? (
              <TouchableOpacity
                style={styles.mapButton}
                onPress={(e) => handleViewMap(item, e)}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.mapButtonText}>Xem bản đồ</ThemedText>
                <Ionicons name="map-outline" size={16} color="#68C2E8" />
              </TouchableOpacity>
            ) : (
              <ThemedText style={styles.detailText}>Chưa có địa điểm</ThemedText>
            )}
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
      <View style={styles.headerContainer}>
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
          contentContainerStyle={[styles.listContainer, { paddingBottom: bottomNavPadding }]}
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
  headerContainer: {
    backgroundColor: '#68C2E8',
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
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#68C2E8',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
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
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#E0F2FE',
    borderRadius: 8,
    flex: 1,
  },
  mapButtonText: {
    fontSize: 14,
    color: '#68C2E8',
    fontWeight: '600',
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
