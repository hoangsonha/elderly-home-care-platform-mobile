import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Request, RequestPriority, RequestStatus } from '@/types/request';

export default function RequestsScreen() {
  const [selectedFilter, setSelectedFilter] = useState<RequestStatus | 'all'>('all');

  // Mock data
  const requests: Request[] = [
    {
      id: '1',
      type: 'booking',
      status: 'pending',
      priority: 'high',
      title: 'Yêu cầu chăm sóc buổi sáng',
      description: 'Cần người chăm sóc cho bà Nguyễn Thị Lan vào buổi sáng từ 7h-11h',
      createdAt: '2024-01-15T08:00:00Z',
      updatedAt: '2024-01-15T08:00:00Z',
      dueDate: '2024-01-20T00:00:00Z',
      requester: {
        id: 'elderly1',
        name: 'Nguyễn Văn A',
        avatar: 'https://via.placeholder.com/40x40/4ECDC4/FFFFFF?text=NA',
        type: 'elderly'
      },
      recipient: {
        id: 'caregiver1',
        name: 'Nguyễn Thị Mai',
        avatar: 'https://via.placeholder.com/40x40/FF6B6B/FFFFFF?text=NM',
        type: 'caregiver'
      },
      elderlyId: 'elderly1',
      caregiverId: 'caregiver1',
      bookingDetails: {
        startDate: '2024-01-20',
        endDate: '2024-01-25',
        startTime: '07:00',
        endTime: '11:00',
        duration: 'daily',
        hourlyRate: 200000,
        totalAmount: 1000000,
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        timeSlots: ['morning'],
        specialRequirements: 'Cần kinh nghiệm chăm sóc người già bị tiểu đường'
      },
      messages: [],
      actions: [
        {
          id: 'action1',
          action: 'created',
          actorId: 'elderly1',
          actorName: 'Nguyễn Văn A',
          timestamp: '2024-01-15T08:00:00Z'
        }
      ]
    },
    {
      id: '2',
      type: 'counter',
      status: 'pending',
      priority: 'medium',
      title: 'Đề xuất thay đổi lịch',
      description: 'Tôi có thể làm việc vào buổi chiều thay vì buổi sáng không?',
      createdAt: '2024-01-16T10:30:00Z',
      updatedAt: '2024-01-16T10:30:00Z',
      requester: {
        id: 'caregiver2',
        name: 'Trần Văn Nam',
        avatar: 'https://via.placeholder.com/40x40/45B7D1/FFFFFF?text=TN',
        type: 'caregiver'
      },
      recipient: {
        id: 'elderly2',
        name: 'Lê Thị B',
        avatar: 'https://via.placeholder.com/40x40/96CEB4/FFFFFF?text=LB',
        type: 'elderly'
      },
      elderlyId: 'elderly2',
      caregiverId: 'caregiver2',
      messages: [],
      actions: [
        {
          id: 'action2',
          action: 'countered',
          actorId: 'caregiver2',
          actorName: 'Trần Văn Nam',
          timestamp: '2024-01-16T10:30:00Z'
        }
      ]
    },
    {
      id: '3',
      type: 'booking',
      status: 'accepted',
      priority: 'low',
      title: 'Chăm sóc cuối tuần',
      description: 'Đã chấp nhận yêu cầu chăm sóc cuối tuần',
      createdAt: '2024-01-14T14:20:00Z',
      updatedAt: '2024-01-15T09:15:00Z',
      requester: {
        id: 'elderly3',
        name: 'Phạm Văn C',
        avatar: 'https://via.placeholder.com/40x40/FECA57/FFFFFF?text=PC',
        type: 'elderly'
      },
      recipient: {
        id: 'caregiver3',
        name: 'Lê Thị Hoa',
        avatar: 'https://via.placeholder.com/40x40/FF9FF3/FFFFFF?text=LH',
        type: 'caregiver'
      },
      elderlyId: 'elderly3',
      caregiverId: 'caregiver3',
      bookingDetails: {
        startDate: '2024-01-20',
        endDate: '2024-01-21',
        duration: 'daily',
        hourlyRate: 180000,
        totalAmount: 720000,
        workingDays: ['saturday', 'sunday'],
        timeSlots: ['morning', 'afternoon']
      },
      messages: [],
      actions: [
        {
          id: 'action3',
          action: 'created',
          actorId: 'elderly3',
          actorName: 'Phạm Văn C',
          timestamp: '2024-01-14T14:20:00Z'
        },
        {
          id: 'action4',
          action: 'accepted',
          actorId: 'caregiver3',
          actorName: 'Lê Thị Hoa',
          timestamp: '2024-01-15T09:15:00Z'
        }
      ]
    }
  ];

  const filteredRequests = selectedFilter === 'all' 
    ? requests 
    : requests.filter(request => request.status === selectedFilter);

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case 'pending': return '#FECA57';
      case 'accepted': return '#48CAE4';
      case 'rejected': return '#FF6B6B';
      case 'cancelled': return '#6C757D';
      case 'completed': return '#4ECDC4';
      default: return '#6C757D';
    }
  };

  const getStatusText = (status: RequestStatus) => {
    switch (status) {
      case 'pending': return 'Chờ phản hồi';
      case 'accepted': return 'Đã chấp nhận';
      case 'rejected': return 'Đã từ chối';
      case 'cancelled': return 'Đã hủy';
      case 'completed': return 'Hoàn thành';
      default: return 'Không xác định';
    }
  };

  const getPriorityColor = (priority: RequestPriority) => {
    switch (priority) {
      case 'low': return '#4ECDC4';
      case 'medium': return '#FECA57';
      case 'high': return '#FF6B6B';
      case 'urgent': return '#E74C3C';
      default: return '#6C757D';
    }
  };

  const getPriorityText = (priority: RequestPriority) => {
    switch (priority) {
      case 'low': return '';
      case 'medium': return '';
      case 'high': return '';
      case 'urgent': return 'Khẩn cấp';
      default: return '';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'booking': return 'Đặt lịch';
      case 'counter': return 'Phản đề xuất';
      case 'modification': return 'Chỉnh sửa';
      default: return 'Không xác định';
    }
  };

  const renderRequestItem = ({ item }: { item: Request }) => (
    <TouchableOpacity 
      style={styles.requestCard}
      onPress={() => router.push(`/request-detail?id=${item.id}`)}
    >
      <View style={styles.requestHeader}>
        <View style={styles.requestInfo}>
          <ThemedText style={styles.requestTitle}>{item.title}</ThemedText>
          <ThemedText style={styles.requestDescription} numberOfLines={2}>
            {item.description}
          </ThemedText>
        </View>
         <View style={styles.requestMeta}>
           <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
             <ThemedText style={styles.statusText}>{getStatusText(item.status)}</ThemedText>
           </View>
           {getPriorityText(item.priority) && (
             <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
               <ThemedText style={styles.priorityText}>{getPriorityText(item.priority)}</ThemedText>
             </View>
           )}
         </View>
      </View>

      <View style={styles.requestDetails}>
        <View style={styles.participantInfo}>
          <View style={styles.participant}>
            <ThemedText style={styles.participantLabel}>Người yêu cầu:</ThemedText>
            <ThemedText style={styles.participantName}>{item.requester.name}</ThemedText>
          </View>
          <View style={styles.participant}>
            <ThemedText style={styles.participantLabel}>Người nhận:</ThemedText>
            <ThemedText style={styles.participantName}>{item.recipient.name}</ThemedText>
          </View>
        </View>

        <View style={styles.requestFooter}>
          <View style={styles.typeContainer}>
            <Ionicons name="document-text-outline" size={16} color="#6C757D" />
            <ThemedText style={styles.typeText}>{getTypeText(item.type)}</ThemedText>
          </View>
          <ThemedText style={styles.dateText}>
            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = (filter: RequestStatus | 'all', label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.activeFilterButton
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <ThemedText style={[
        styles.filterButtonText,
        selectedFilter === filter && styles.activeFilterButtonText
      ]}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Yêu cầu</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Quản lý các yêu cầu chăm sóc</ThemedText>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="search-outline" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="filter-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {renderFilterButton('all', 'Tất cả')}
          {renderFilterButton('pending', 'Chờ phản hồi')}
          {renderFilterButton('accepted', 'Đã chấp nhận')}
          {renderFilterButton('rejected', 'Đã từ chối')}
          {renderFilterButton('completed', 'Hoàn thành')}
        </ScrollView>
      </View>

      {/* Requests List */}
      <FlatList
        data={filteredRequests}
        renderItem={renderRequestItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#4ECDC4',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  filterContainer: {
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filterScrollContent: {
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f8f9fa',
  },
  activeFilterButton: {
    backgroundColor: '#4ECDC4',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6c757d',
  },
  activeFilterButtonText: {
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requestInfo: {
    flex: 1,
    marginRight: 12,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  requestDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  requestMeta: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  requestDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f8f9fa',
    paddingTop: 12,
  },
  participantInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  participant: {
    flex: 1,
  },
  participantLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  participantName: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 12,
    color: '#6c757d',
    marginLeft: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#6c757d',
  },
});
