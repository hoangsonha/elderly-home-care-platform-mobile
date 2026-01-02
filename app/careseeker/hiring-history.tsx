import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { SimpleNavBar } from '@/components/navigation/SimpleNavBar';
import { ThemedText } from '@/components/themed-text';
import { useBottomNavPadding } from '@/hooks/useBottomNavPadding';

interface HiringHistory {
  id: string;
  caregiverName: string;
  caregiverAvatar: string;
  rating: number;
  totalHires: number;
  lastHireDate: string;
  status: 'completed' | 'cancelled' | 'pending';
}

const mockHiringHistory: HiringHistory[] = [
  {
    id: '1',
    caregiverName: 'Nguyễn Thị Mai',
    caregiverAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    rating: 4.8,
    totalHires: 3,
    lastHireDate: '12/10/2025',
    status: 'completed',
  },
  {
    id: '2',
    caregiverName: 'Trần Văn Minh',
    caregiverAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    rating: 5.0,
    totalHires: 1,
    lastHireDate: '05/10/2025',
    status: 'completed',
  },
  {
    id: '3',
    caregiverName: 'Lê Thị Hoa',
    caregiverAvatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
    rating: 4.5,
    totalHires: 2,
    lastHireDate: '28/09/2025',
    status: 'cancelled',
  },
];

type FilterType = 'all' | 'this-month' | 'last-month' | 'this-year';
type StatusFilter = 'all' | 'completed' | 'cancelled';

export default function HiringHistoryScreen() {
  const bottomNavPadding = useBottomNavPadding();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'Tất cả' },
    { id: 'this-month', label: 'Tháng này' },
    { id: 'last-month', label: 'Tháng trước' },
    { id: 'this-year', label: 'Năm nay' },
  ];

  const statusFilters: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: 'Tất cả' },
    { id: 'completed', label: 'Hoàn thành' },
    { id: 'cancelled', label: 'Đã hủy' },
  ];

  const filteredHistory = mockHiringHistory.filter(item => {
    const matchesSearch = item.caregiverName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCaregiverPress = (caregiver: HiringHistory) => {
    router.push({
      pathname: '/hired-detail',
      params: {
        caregiverId: caregiver.id,
        caregiverName: caregiver.caregiverName,
      }
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={14} color="#FFD700" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={14} color="#FFD700" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={14} color="#FFD700" />
      );
    }

    return stars;
  };

  const renderHiringHistoryItem = ({ item }: { item: HiringHistory }) => (
    <TouchableOpacity
      style={styles.historyCard}
      onPress={() => handleCaregiverPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.caregiverInfo}>
          <Image source={{ uri: item.caregiverAvatar }} style={styles.avatar} />
          <View style={styles.caregiverDetails}>
            <ThemedText style={styles.caregiverName}>{item.caregiverName}</ThemedText>
            <View style={styles.ratingContainer}>
              <View style={styles.stars}>
                {renderStars(item.rating)}
              </View>
              <ThemedText style={styles.ratingText}>
                {item.rating}/5 ({item.totalHires} lần thuê)
              </ThemedText>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6c757d" />
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#6c757d" />
          <ThemedText style={styles.infoText}>Gần nhất: {item.lastHireDate}</ThemedText>
        </View>
        
        
        <View style={styles.infoRow}>
          <Ionicons name="refresh-outline" size={16} color="#6c757d" />
          <ThemedText style={styles.infoText}>Tổng số lần thuê: {item.totalHires}</ThemedText>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.viewDetailButton}>
          <ThemedText style={styles.viewDetailText}>Xem chi tiết</ThemedText>
          <Ionicons name="arrow-forward" size={16} color="#30A0E0" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Lịch sử thuê dịch vụ</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Xem lại lịch sử thuê của bạn</ThemedText>
        </View>
        
        <View style={styles.headerActions}>
          {/* Empty space for centering */}
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6c757d" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên người chăm sóc..."
            placeholderTextColor="#6c757d"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[styles.filterTab, activeFilter === filter.id && styles.activeFilterTab]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <ThemedText style={[styles.filterText, activeFilter === filter.id && styles.activeFilterText]}>
                {filter.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Status Filter */}
      <View style={styles.statusFilterContainer}>
        <View style={styles.statusFilterScroll}>
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[styles.statusFilterTab, statusFilter === filter.id && styles.activeStatusFilterTab]}
              onPress={() => setStatusFilter(filter.id)}
            >
              <ThemedText style={[styles.statusFilterText, statusFilter === filter.id && styles.activeStatusFilterText]}>
                {filter.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* History List */}
      <FlatList
        data={filteredHistory}
        renderItem={renderHiringHistoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContainer, { paddingBottom: bottomNavPadding }]}
        showsVerticalScrollIndicator={false}
      />

      {/* Navigation Bar */}
      <SimpleNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#30A0E0',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
    textAlign: 'center',
  },
  headerActions: {
    width: 40,
    height: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#2c3e50',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  filterScroll: {
    paddingRight: 20,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  activeFilterTab: {
    backgroundColor: '#30A0E0',
    borderColor: '#30A0E0',
  },
  filterText: {
    fontSize: 14,
    color: '#6c757d',
  },
  activeFilterText: {
    color: 'white',
    fontWeight: '600',
  },
  statusFilterContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  statusFilterScroll: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusFilterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  activeStatusFilterTab: {
    backgroundColor: '#27AE60',
    borderColor: '#27AE60',
  },
  statusFilterText: {
    fontSize: 12,
    color: '#6c757d',
  },
  activeStatusFilterText: {
    color: 'white',
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  historyCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  caregiverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  caregiverDetails: {
    flex: 1,
  },
  caregiverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
    marginRight: 6,
  },
  ratingText: {
    fontSize: 14,
    color: '#6c757d',
  },
  cardContent: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#6c757d',
    marginLeft: 8,
  },
  cardFooter: {
    alignItems: 'flex-end',
  },
  viewDetailButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailText: {
    fontSize: 14,
    color: '#30A0E0',
    fontWeight: '600',
    marginRight: 4,
  },
});
