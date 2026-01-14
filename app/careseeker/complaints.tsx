import { ThemedText } from '@/components/themed-text';
import { Complaint, ComplaintTab } from '@/types/complaint';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

type StatusTab = 'all' | 'pending' | 'received' | 'processing' | 'resolved' | 'rejected';

export default function ComplaintsScreen() {
  const [activeTab, setActiveTab] = useState<'my_complaints' | 'complaints_against_me'>('my_complaints');
  const [activeStatusTab, setActiveStatusTab] = useState<StatusTab>('all');

  const tabs: ComplaintTab[] = [
    {
      id: 'my_complaints',
      title: 'Bạn khiếu nại',
      icon: 'person-outline',
    },
    {
      id: 'complaints_against_me',
      title: 'Bạn bị khiếu nại',
      icon: 'warning-outline',
    },
  ];

  // Mock data
  const mockComplaints: Complaint[] = [
    {
      id: '1',
      type: 'salary',
      title: 'Khiếu nại về lương không đúng thỏa thuận',
      description: 'Người chăm sóc không trả đúng số tiền đã thỏa thuận trong hợp đồng.',
      complainant: {
        id: '1',
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@email.com',
        phone: '0123456789',
        role: 'member',
      },
      accused: {
        id: '2',
        name: 'Trần Thị B',
        email: 'tranthib@email.com',
        phone: '0987654321',
        role: 'caregiver',
      },
      service: {
        id: '1',
        name: 'Dịch vụ chăm sóc tại nhà',
        type: 'caregiver_service',
        caregiver: {
          id: '2',
          name: 'Trần Thị B',
          email: 'tranthib@email.com',
          phone: '0987654321',
          role: 'caregiver',
        },
        startDate: '2024-01-01',
        status: 'active',
      },
      evidences: [
        {
          id: '1',
          type: 'image',
          url: 'https://via.placeholder.com/300x200',
          filename: 'contract.jpg',
          uploadedAt: '2024-01-20T10:00:00Z',
        },
      ],
      status: 'pending',
      priority: 'high',
      createdAt: '2024-01-20T10:00:00Z',
      updatedAt: '2024-01-20T10:00:00Z',
    },
    {
      id: '2',
      type: 'behavior',
      title: 'Khiếu nại về thái độ phục vụ',
      description: 'Người chăm sóc có thái độ không tốt với người già.',
      complainant: {
        id: '3',
        name: 'Lê Văn C',
        email: 'levanc@email.com',
        phone: '0912345678',
        role: 'member',
      },
      accused: {
        id: '4',
        name: 'Phạm Thị D',
        email: 'phamthid@email.com',
        phone: '0923456789',
        role: 'caregiver',
      },
      service: {
        id: '2',
        name: 'Dịch vụ chăm sóc buổi sáng',
        type: 'caregiver_service',
        caregiver: {
          id: '4',
          name: 'Phạm Thị D',
          email: 'phamthid@email.com',
          phone: '0923456789',
          role: 'caregiver',
        },
        startDate: '2024-01-15',
        status: 'active',
      },
      evidences: [],
      status: 'processing',
      priority: 'medium',
      createdAt: '2024-01-19T14:30:00Z',
      updatedAt: '2024-01-21T09:15:00Z',
    },
    {
      id: '3',
      type: 'quality',
      title: 'Khiếu nại về chất lượng dịch vụ',
      description: 'Dịch vụ chăm sóc không đạt chất lượng như cam kết.',
      complainant: {
        id: '5',
        name: 'Hoàng Thị E',
        email: 'hoangthie@email.com',
        phone: '0934567890',
        role: 'member',
      },
      accused: {
        id: '6',
        name: 'Vũ Văn F',
        email: 'vuvanf@email.com',
        phone: '0945678901',
        role: 'caregiver',
      },
      service: {
        id: '3',
        name: 'Dịch vụ chăm sóc 24/7',
        type: 'caregiver_service',
        caregiver: {
          id: '6',
          name: 'Vũ Văn F',
          email: 'vuvanf@email.com',
          phone: '0945678901',
          role: 'caregiver',
        },
        startDate: '2024-01-10',
        status: 'active',
      },
      evidences: [
        {
          id: '3',
          type: 'image',
          url: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Quality',
          filename: 'quality_issue.jpg',
          uploadedAt: '2024-01-18T16:20:00Z',
        },
      ],
      status: 'received',
      priority: 'high',
      createdAt: '2024-01-18T16:20:00Z',
      updatedAt: '2024-01-19T08:30:00Z',
    },
    {
      id: '4',
      type: 'schedule',
      title: 'Khiếu nại về lịch trình làm việc',
      description: 'Người chăm sóc thường xuyên đến muộn và không tuân thủ lịch trình.',
      complainant: {
        id: '7',
        name: 'Đặng Thị G',
        email: 'dangthig@email.com',
        phone: '0956789012',
        role: 'member',
      },
      accused: {
        id: '8',
        name: 'Bùi Văn H',
        email: 'buivanh@email.com',
        phone: '0967890123',
        role: 'caregiver',
      },
      service: {
        id: '4',
        name: 'Dịch vụ chăm sóc buổi chiều',
        type: 'caregiver_service',
        caregiver: {
          id: '8',
          name: 'Bùi Văn H',
          email: 'buivanh@email.com',
          phone: '0967890123',
          role: 'caregiver',
        },
        startDate: '2024-01-05',
        status: 'active',
      },
      evidences: [],
      status: 'resolved',
      priority: 'medium',
      createdAt: '2024-01-16T11:45:00Z',
      updatedAt: '2024-01-22T14:20:00Z',
      resolvedAt: '2024-01-22T14:20:00Z',
      resolution: 'Đã thảo luận với người chăm sóc và cam kết tuân thủ lịch trình.',
    },
    {
      id: '5',
      type: 'payment',
      title: 'Khiếu nại về thanh toán',
      description: 'Có vấn đề với việc thanh toán dịch vụ chăm sóc.',
      complainant: {
        id: '9',
        name: 'Ngô Thị I',
        email: 'ngothii@email.com',
        phone: '0978901234',
        role: 'member',
      },
      accused: {
        id: '10',
        name: 'Lý Văn K',
        email: 'lyvank@email.com',
        phone: '0989012345',
        role: 'caregiver',
      },
      service: {
        id: '5',
        name: 'Dịch vụ chăm sóc cuối tuần',
        type: 'caregiver_service',
        caregiver: {
          id: '10',
          name: 'Lý Văn K',
          email: 'lyvank@email.com',
          phone: '0989012345',
          role: 'caregiver',
        },
        startDate: '2024-01-12',
        status: 'active',
      },
      evidences: [
        {
          id: '5',
          type: 'image',
          url: 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Payment',
          filename: 'payment_receipt.jpg',
          uploadedAt: '2024-01-17T13:10:00Z',
        },
      ],
      status: 'rejected',
      priority: 'low',
      createdAt: '2024-01-17T13:10:00Z',
      updatedAt: '2024-01-20T10:30:00Z',
      resolution: 'Khiếu nại không có cơ sở, thanh toán đã được thực hiện đúng.',
    },
    {
      id: '6',
      type: 'other',
      title: 'Khiếu nại khác',
      description: 'Các vấn đề khác liên quan đến dịch vụ chăm sóc.',
      complainant: {
        id: '11',
        name: 'Trịnh Thị L',
        email: 'trinhthil@email.com',
        phone: '0990123456',
        role: 'member',
      },
      accused: {
        id: '12',
        name: 'Phan Văn M',
        email: 'phanvanm@email.com',
        phone: '0901234567',
        role: 'caregiver',
      },
      service: {
        id: '6',
        name: 'Dịch vụ chăm sóc đặc biệt',
        type: 'caregiver_service',
        caregiver: {
          id: '12',
          name: 'Phan Văn M',
          email: 'phanvanm@email.com',
          phone: '0901234567',
          role: 'caregiver',
        },
        startDate: '2024-01-08',
        status: 'active',
      },
      evidences: [],
      status: 'pending',
      priority: 'urgent',
      createdAt: '2024-01-21T09:00:00Z',
      updatedAt: '2024-01-21T09:00:00Z',
    },
    // Additional complaints for "Bạn bị khiếu nại" tab (where user ID = '2' is accused)
    {
      id: '7',
      type: 'behavior',
      title: 'Khiếu nại về thái độ không chuyên nghiệp',
      description: 'Người chăm sóc có thái độ không tốt và không tuân thủ quy định.',
      complainant: {
        id: '13',
        name: 'Nguyễn Thị N',
        email: 'nguyenthin@email.com',
        phone: '0912345678',
        role: 'member',
      },
      accused: {
        id: '2', // Same as user ID for "Bạn bị khiếu nại" tab
        name: 'Trần Thị B',
        email: 'tranthib@email.com',
        phone: '0987654321',
        role: 'caregiver',
      },
      service: {
        id: '7',
        name: 'Dịch vụ chăm sóc buổi tối',
        type: 'caregiver_service',
        caregiver: {
          id: '2',
          name: 'Trần Thị B',
          email: 'tranthib@email.com',
          phone: '0987654321',
          role: 'caregiver',
        },
        startDate: '2024-01-03',
        status: 'active',
      },
      evidences: [
        {
          id: '7',
          type: 'image',
          url: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Behavior',
          filename: 'behavior_issue.jpg',
          uploadedAt: '2024-01-22T14:30:00Z',
        },
      ],
      status: 'received',
      priority: 'high',
      createdAt: '2024-01-22T14:30:00Z',
      updatedAt: '2024-01-23T09:15:00Z',
    },
    {
      id: '8',
      type: 'quality',
      title: 'Khiếu nại về chất lượng dịch vụ kém',
      description: 'Dịch vụ chăm sóc không đạt tiêu chuẩn và thiếu trách nhiệm.',
      complainant: {
        id: '14',
        name: 'Lê Văn O',
        email: 'levano@email.com',
        phone: '0923456789',
        role: 'member',
      },
      accused: {
        id: '2', // Same as user ID for "Bạn bị khiếu nại" tab
        name: 'Trần Thị B',
        email: 'tranthib@email.com',
        phone: '0987654321',
        role: 'caregiver',
      },
      service: {
        id: '8',
        name: 'Dịch vụ chăm sóc cuối tuần',
        type: 'caregiver_service',
        caregiver: {
          id: '2',
          name: 'Trần Thị B',
          email: 'tranthib@email.com',
          phone: '0987654321',
          role: 'caregiver',
        },
        startDate: '2024-01-05',
        status: 'active',
      },
      evidences: [],
      status: 'processing',
      priority: 'medium',
      createdAt: '2024-01-23T10:20:00Z',
      updatedAt: '2024-01-24T08:45:00Z',
    },
    {
      id: '9',
      type: 'schedule',
      title: 'Khiếu nại về việc không tuân thủ lịch trình',
      description: 'Người chăm sóc thường xuyên đến muộn và không báo trước.',
      complainant: {
        id: '15',
        name: 'Phạm Thị P',
        email: 'phamthip@email.com',
        phone: '0934567890',
        role: 'member',
      },
      accused: {
        id: '2', // Same as user ID for "Bạn bị khiếu nại" tab
        name: 'Trần Thị B',
        email: 'tranthib@email.com',
        phone: '0987654321',
        role: 'caregiver',
      },
      service: {
        id: '9',
        name: 'Dịch vụ chăm sóc hàng ngày',
        type: 'caregiver_service',
        caregiver: {
          id: '2',
          name: 'Trần Thị B',
          email: 'tranthib@email.com',
          phone: '0987654321',
          role: 'caregiver',
        },
        startDate: '2024-01-07',
        status: 'active',
      },
      evidences: [
        {
          id: '9',
          type: 'image',
          url: 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Schedule',
          filename: 'schedule_issue.jpg',
          uploadedAt: '2024-01-24T16:10:00Z',
        },
      ],
      status: 'resolved',
      priority: 'low',
      createdAt: '2024-01-24T16:10:00Z',
      updatedAt: '2024-01-25T11:30:00Z',
      resolvedAt: '2024-01-25T11:30:00Z',
      resolution: 'Đã thảo luận và cam kết tuân thủ lịch trình nghiêm ngặt.',
    },
  ];

  const getFilteredComplaints = () => {
    let filtered = mockComplaints;
    
    // Filter by tab
    if (activeTab === 'my_complaints') {
      // Show complaints where current user is complainant (simulate current user ID = '1')
      filtered = filtered.filter(complaint => complaint.complainant.id === '1');
    } else {
      // Show complaints where current user is accused (simulate current user ID = '2')
      filtered = filtered.filter(complaint => complaint.accused.id === '2');
    }
    
    // Filter by status
    if (activeStatusTab !== 'all') {
      filtered = filtered.filter(complaint => complaint.status === activeStatusTab);
    }
    
    return filtered;
  };

  const getStatusCount = (status: StatusTab) => {
    const filtered = getFilteredComplaints();
    if (status === 'all') {
      return filtered.length;
    }
    return filtered.filter(complaint => complaint.status === status).length;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Đang chờ';
      case 'received': return 'Đã tiếp nhận';
      case 'processing': return 'Đang xử lí';
      case 'resolved': return 'Đã xử lí';
      case 'rejected': return 'Đã từ chối';
      default: return 'Không xác định';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffa502';
      case 'received': return '#3498db';
      case 'processing': return '#f39c12';
      case 'resolved': return '#2ed573';
      case 'rejected': return '#ff4757';
      default: return '#6c757d';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'salary': return 'Lương';
      case 'behavior': return 'Thái độ';
      case 'quality': return 'Chất lượng';
      case 'schedule': return 'Lịch trình';
      case 'payment': return 'Thanh toán';
      case 'other': return 'Khác';
      default: return 'Không xác định';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return '#2ed573';
      case 'medium': return '#ffa502';
      case 'high': return '#ff4757';
      case 'urgent': return '#ff6b6b';
      default: return '#6c757d';
    }
  };

  const handleComplaintPress = (complaint: Complaint) => {
    router.push(`/careseeker/complaint-detail?id=${complaint.id}`);
  };

  const handleCreateComplaint = () => {
    router.push('/careseeker/create-complaint');
  };

  const renderComplaintCard = ({ item }: { item: Complaint }) => (
    <TouchableOpacity
      style={styles.complaintCard}
      onPress={() => handleComplaintPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.complaintHeader}>
        <View style={styles.complaintInfo}>
          <ThemedText style={styles.complaintTitle} numberOfLines={2}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.complaintType}>
            Loại: {getTypeText(item.type)}
          </ThemedText>
          <ThemedText style={styles.complaintDescription} numberOfLines={2}>
            {item.description}
          </ThemedText>
        </View>
        <View style={styles.complaintStatus}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <ThemedText style={styles.statusText}>
              {getStatusText(item.status)}
            </ThemedText>
          </View>
        </View>
      </View>
      
      <View style={styles.complaintFooter}>
        <View style={styles.complaintMeta}>
          <ThemedText style={styles.complaintDate}>
            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
          </ThemedText>
          <ThemedText style={styles.complaintEvidence}>
            {item.evidences.length} bằng chứng
          </ThemedText>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6c757d" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Khiếu nại</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Quản lý khiếu nại và tố cáo</ThemedText>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleCreateComplaint}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Main Tabs */}
      <View style={styles.mainTabsContainer}>
        <View style={styles.tabsWrapper}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.mainTab, activeTab === tab.id && styles.mainTabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons 
                name={tab.icon as any} 
                size={20} 
                color={activeTab === tab.id ? 'white' : '#6c757d'} 
              />
              <ThemedText style={[styles.mainTabText, activeTab === tab.id && styles.mainTabTextActive]}>
                {tab.title}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Status Tabs */}
      <View style={styles.statusTabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusTabsScrollContainer}>
          <TouchableOpacity
            style={[styles.statusTab, activeStatusTab === 'all' && styles.statusTabActive]}
            onPress={() => setActiveStatusTab('all')}
          >
            <ThemedText style={[styles.statusTabText, activeStatusTab === 'all' && styles.statusTabTextActive]}>
              Tất cả ({getStatusCount('all')})
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusTab, activeStatusTab === 'pending' && styles.statusTabActive]}
            onPress={() => setActiveStatusTab('pending')}
          >
            <ThemedText style={[styles.statusTabText, activeStatusTab === 'pending' && styles.statusTabTextActive]}>
              Đang chờ ({getStatusCount('pending')})
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusTab, activeStatusTab === 'received' && styles.statusTabActive]}
            onPress={() => setActiveStatusTab('received')}
          >
            <ThemedText style={[styles.statusTabText, activeStatusTab === 'received' && styles.statusTabTextActive]}>
              Đã tiếp nhận ({getStatusCount('received')})
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusTab, activeStatusTab === 'processing' && styles.statusTabActive]}
            onPress={() => setActiveStatusTab('processing')}
          >
            <ThemedText style={[styles.statusTabText, activeStatusTab === 'processing' && styles.statusTabTextActive]}>
              Đang xử lí ({getStatusCount('processing')})
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusTab, activeStatusTab === 'resolved' && styles.statusTabActive]}
            onPress={() => setActiveStatusTab('resolved')}
          >
            <ThemedText style={[styles.statusTabText, activeStatusTab === 'resolved' && styles.statusTabTextActive]}>
              Đã xử lí ({getStatusCount('resolved')})
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
        </ScrollView>
      </View>

      {/* Complaints List */}
      <FlatList
        data={getFilteredComplaints()}
        renderItem={renderComplaintCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={64} color="#6c757d" />
            <ThemedText style={styles.emptyTitle}>Không có khiếu nại</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              {activeTab === 'my_complaints' 
                ? 'Bạn chưa có khiếu nại nào' 
                : 'Chưa có khiếu nại nào về bạn'
              }
            </ThemedText>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingBottom: 100, // Space for navigation bar
  },
  header: {
    backgroundColor: '#68C2E8',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
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
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  addButton: {
    padding: 8,
  },
  mainTabsContainer: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  tabsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
  },
  mainTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    gap: 8,
    minWidth: 140,
    justifyContent: 'center',
  },
  mainTabActive: {
    backgroundColor: '#68C2E8',
    borderColor: '#68C2E8',
  },
  mainTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6C757D',
  },
  mainTabTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  statusTabsContainer: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  statusTabsScrollContainer: {
    paddingHorizontal: 16,
  },
  statusTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  statusTabActive: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },
  statusTabText: {
    fontSize: 12,
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
  complaintCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  complaintInfo: {
    flex: 1,
    marginRight: 12,
  },
  complaintTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  complaintType: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  complaintDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  complaintStatus: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  complaintFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  complaintMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  complaintDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  complaintEvidence: {
    fontSize: 12,
    color: '#6c757d',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
});
