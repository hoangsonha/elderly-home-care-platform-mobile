import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SimpleNavBar } from '@/components/navigation/SimpleNavBar';
import { ThemedText } from '@/components/themed-text';
import { useBottomNavPadding } from '@/hooks/useBottomNavPadding';

interface HiredCaregiver {
  id: string;
  name: string;
  age: number;
  avatar?: string;
  rating: number;
  totalReviews: number;
  specialties: string[];
  elderlyName: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  totalEarnings: number;
  status: 'active' | 'completed' | 'paused';
  hasReviewed?: boolean;
}

export default function HiredCaregiversScreen() {
  const bottomNavPadding = useBottomNavPadding();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  // Mock data
  const mockCaregivers: HiredCaregiver[] = [
    {
      id: '1',
      name: 'Nguyễn Thị Mai',
      age: 28,
      rating: 4.8,
      totalReviews: 45,
      specialties: ['Chăm sóc người già', 'Nấu ăn'],
      elderlyName: 'Bà Nguyễn Thị Lan',
      startDate: '15/01/2024',
      endDate: '15/02/2024',
      totalHours: 160,
      totalEarnings: 32000000,
      status: 'active',
    },
    {
      id: '2',
      name: 'Trần Văn Nam',
      age: 32,
      rating: 4.9,
      totalReviews: 68,
      specialties: ['Y tế', 'Vật lý trị liệu'],
      elderlyName: 'Ông Phạm Văn Đức',
      startDate: '10/01/2024',
      endDate: '10/03/2024',
      totalHours: 200,
      totalEarnings: 36000000,
      status: 'active',
    },
    {
      id: '3',
      name: 'Lê Thị Hoa',
      age: 25,
      rating: 4.7,
      totalReviews: 32,
      specialties: ['Chăm sóc người già', 'Tâm lý'],
      elderlyName: 'Bà Lê Thị Bình',
      startDate: '05/12/2023',
      endDate: '05/01/2024',
      totalHours: 180,
      totalEarnings: 39600000,
      status: 'completed',
      hasReviewed: true,
    },
    {
      id: '4',
      name: 'Phạm Văn Đức',
      age: 30,
      rating: 4.6,
      totalReviews: 28,
      specialties: ['Chăm sóc người già', 'Nấu ăn'],
      elderlyName: 'Ông Trần Văn Hùng',
      startDate: '01/11/2023',
      endDate: '30/11/2023',
      totalHours: 120,
      totalEarnings: 22800000,
      status: 'completed',
      hasReviewed: false,
    },
    {
      id: '5',
      name: 'Võ Thị Hương',
      age: 27,
      rating: 4.9,
      totalReviews: 52,
      specialties: ['Y tế', 'Phục hồi chức năng'],
      elderlyName: 'Bà Nguyễn Thị Kim',
      startDate: '20/10/2023',
      endDate: '20/12/2023',
      totalHours: 240,
      totalEarnings: 52800000,
      status: 'completed',
      hasReviewed: true,
    },
  ];

  const filteredCaregivers = mockCaregivers.filter(
    (c) => c.status === activeTab
  );

  const handleCaregiverPress = (caregiver: HiredCaregiver) => {
    router.push({
      pathname: '/careseeker/caregiver-detail',
      params: {
        id: caregiver.id,
        name: caregiver.name,
      },
    });
  };

  const handleChatPress = (caregiver: HiredCaregiver) => {
    router.push({
      pathname: '/careseeker/chat',
      params: {
        caregiverId: caregiver.id,
        caregiverName: caregiver.name,
      },
    });
  };

  const handleCallPress = (caregiver: HiredCaregiver) => {
    router.push({
      pathname: '/careseeker/video-call',
      params: {
        caregiverId: caregiver.id,
        caregiverName: caregiver.name,
      },
    });
  };

  const handleReviewPress = (caregiver: HiredCaregiver) => {
    Alert.alert(
      'Đánh giá',
      `Bạn muốn đánh giá ${caregiver.name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đánh giá',
          onPress: () => {
            // TODO: Navigate to review screen
            console.log('Review caregiver:', caregiver.id);
          },
        },
      ]
    );
  };

  const handleRehirePress = (caregiver: HiredCaregiver) => {
    Alert.alert(
      'Thuê lại',
      `Bạn muốn thuê lại ${caregiver.name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Thuê lại',
          onPress: () => {
            // TODO: Navigate to booking with pre-filled caregiver
            router.push({
              pathname: '/careseeker/caregiver-detail',
              params: {
                id: caregiver.id,
                name: caregiver.name,
              },
            });
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const renderCaregiverCard = ({ item }: { item: HiredCaregiver }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleCaregiverPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <LinearGradient
              colors={['#68C2E8', '#5AB9E0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradient}
            >
              <ThemedText style={styles.avatarText}>
                {item.name.charAt(0)}
              </ThemedText>
            </LinearGradient>
          )}
          {item.status === 'active' && (
            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
            </View>
          )}
        </View>

        <View style={styles.caregiverInfo}>
          <View style={styles.nameRow}>
            <ThemedText style={styles.caregiverName}>{item.name}</ThemedText>
            <ThemedText style={styles.caregiverAge}>{item.age} tuổi</ThemedText>
          </View>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#FFB648" />
            <ThemedText style={styles.ratingText}>
              {item.rating.toFixed(1)}
            </ThemedText>
            <ThemedText style={styles.reviewsText}>
              ({item.totalReviews} đánh giá)
            </ThemedText>
          </View>

          <View style={styles.specialtiesContainer}>
            {item.specialties.slice(0, 2).map((specialty, index) => (
              <View key={index} style={styles.specialtyBadge}>
                <ThemedText style={styles.specialtyText}>
                  {specialty}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.elderlyInfo}>
        <View style={styles.elderlyRow}>
          <Ionicons name="person" size={16} color="#6B7280" />
          <ThemedText style={styles.elderlyLabel}>Chăm sóc:</ThemedText>
          <ThemedText style={styles.elderlyName}>{item.elderlyName}</ThemedText>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <View style={styles.statContent}>
            <ThemedText style={styles.statLabel}>Thời gian</ThemedText>
            <ThemedText style={styles.statValue}>
              {item.startDate} - {item.endDate}
            </ThemedText>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <View style={styles.statContent}>
            <ThemedText style={styles.statLabel}>Tổng giờ</ThemedText>
            <ThemedText style={styles.statValue}>{item.totalHours}h</ThemedText>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Ionicons name="wallet-outline" size={16} color="#6B7280" />
          <View style={styles.statContent}>
            <ThemedText style={styles.statLabel}>Tổng chi</ThemedText>
            <ThemedText style={styles.statValue}>
              {formatCurrency(item.totalEarnings)}
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        {item.status === 'active' ? (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.chatButton]}
              onPress={() => handleChatPress(item)}
            >
              <Ionicons name="chatbubble-outline" size={18} color="#68C2E8" />
              <ThemedText style={styles.chatButtonText}>Chat</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.callButton]}
              onPress={() => handleCallPress(item)}
            >
              <Ionicons name="videocam-outline" size={18} color="white" />
              <ThemedText style={styles.callButtonText}>Gọi</ThemedText>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {!item.hasReviewed && (
              <TouchableOpacity
                style={[styles.actionButton, styles.reviewButton]}
                onPress={() => handleReviewPress(item)}
              >
                <Ionicons name="star-outline" size={18} color="#FFB648" />
                <ThemedText style={styles.reviewButtonText}>
                  Đánh giá
                </ThemedText>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionButton, styles.rehireButton]}
              onPress={() => handleRehirePress(item)}
            >
              <Ionicons name="refresh-outline" size={18} color="white" />
              <ThemedText style={styles.rehireButtonText}>
                Thuê lại
              </ThemedText>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.detailButton]}
          onPress={() => handleCaregiverPress(item)}
        >
          <ThemedText style={styles.detailButtonText}>Chi tiết</ThemedText>
          <Ionicons name="chevron-forward" size={18} color="#68C2E8" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={['#68C2E8', '#5AB9E0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <ThemedText style={styles.headerTitle}>
              Người chăm sóc đã thuê
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Quản lý lịch sử thuê người chăm sóc
            </ThemedText>
          </View>

          <View style={styles.placeholder} />
        </View>

        {/* Summary Stats */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryValue}>
              {mockCaregivers.filter((c) => c.status === 'active').length}
            </ThemedText>
            <ThemedText style={styles.summaryLabel}>Đang làm</ThemedText>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryValue}>
              {mockCaregivers.filter((c) => c.status === 'completed').length}
            </ThemedText>
            <ThemedText style={styles.summaryLabel}>Đã hoàn thành</ThemedText>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryValue}>
              {mockCaregivers.length}
            </ThemedText>
            <ThemedText style={styles.summaryLabel}>Tổng cộng</ThemedText>
          </View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={activeTab === 'active' ? 'white' : '#6B7280'}
          />
          <ThemedText
            style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}
          >
            Đang làm việc
          </ThemedText>
          <View
            style={[
              styles.tabBadge,
              activeTab === 'active' && styles.activeTabBadge,
            ]}
          >
            <ThemedText
              style={[
                styles.tabBadgeText,
                activeTab === 'active' && styles.activeTabBadgeText,
              ]}
            >
              {mockCaregivers.filter((c) => c.status === 'active').length}
            </ThemedText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Ionicons
            name="time"
            size={20}
            color={activeTab === 'completed' ? 'white' : '#6B7280'}
          />
          <ThemedText
            style={[
              styles.tabText,
              activeTab === 'completed' && styles.activeTabText,
            ]}
          >
            Đã kết thúc
          </ThemedText>
          <View
            style={[
              styles.tabBadge,
              activeTab === 'completed' && styles.activeTabBadge,
            ]}
          >
            <ThemedText
              style={[
                styles.tabBadgeText,
                activeTab === 'completed' && styles.activeTabBadgeText,
              ]}
            >
              {mockCaregivers.filter((c) => c.status === 'completed').length}
            </ThemedText>
          </View>
        </TouchableOpacity>
      </View>

      {/* List */}
      {filteredCaregivers.length > 0 ? (
        <FlatList
          data={filteredCaregivers}
          renderItem={renderCaregiverCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: bottomNavPadding }]}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color="#D1D5DB" />
          <ThemedText style={styles.emptyText}>
            {activeTab === 'active'
              ? 'Chưa có người chăm sóc đang làm việc'
              : 'Chưa có lịch sử thuê người chăm sóc'}
          </ThemedText>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push('/careseeker/caregiver-search')}
          >
            <ThemedText style={styles.emptyButtonText}>
              Tìm người chăm sóc
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}

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
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  placeholder: {
    width: 40,
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#68C2E8',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: 'white',
  },
  tabBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  activeTabBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  activeTabBadgeText: {
    color: 'white',
  },
  listContent: {
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  avatarGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
  },
  activeBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  caregiverInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  caregiverName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#12394A',
  },
  caregiverAge: {
    fontSize: 14,
    color: '#6B7280',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#12394A',
  },
  reviewsText: {
    fontSize: 12,
    color: '#6B7280',
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specialtyBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  specialtyText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#0284C7',
  },
  elderlyInfo: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  elderlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  elderlyLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  elderlyName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#12394A',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#12394A',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  chatButton: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#68C2E8',
  },
  chatButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#68C2E8',
  },
  callButton: {
    backgroundColor: '#68C2E8',
  },
  callButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
  },
  reviewButton: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFB648',
  },
  reviewButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFB648',
  },
  rehireButton: {
    backgroundColor: '#10B981',
  },
  rehireButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
  },
  detailButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#68C2E8',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#68C2E8',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});

