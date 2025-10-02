import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookingModal } from '@/components/caregiver/BookingModal';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext';

interface VideoConsultationReview {
  id: string;
  caregiverId: string;
  caregiverName: string;
  caregiverAvatar: string;
  rating: number;
  comment: string;
  date: string;
  duration: number; // phút
  isVerified: boolean;
}

interface ServiceReview {
  id: string;
  caregiverId: string;
  caregiverName: string;
  caregiverAvatar: string;
  rating: number;
  comment: string;
  date: string;
  elderlyName: string;
  familyName: string;
  totalHours: number;
  completedTasks: number;
  pendingTasks: number;
  totalTasks: number;
  isVerified: boolean;
}

interface SystemReview {
  id: string;
  rating: number;
  comment: string;
  date: string;
  category: string; // 'app_performance', 'ui_ux', 'features', 'support'
  isVerified: boolean;
}

interface ComplaintReview {
  id: string;
  complainantName: string;
  complainantAvatar: string;
  accusedName: string;
  accusedAvatar: string;
  adminName: string;
  adminAvatar: string;
  date: string;
  time: string;
  status: 'pending' | 'resolved' | 'rejected';
  category: string;
  isVerified: boolean;
}

type ReviewTab = 'video' | 'service' | 'system' | 'complaint';
type ReviewSubTab = 'completed' | 'pending';

export default function ReviewsScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ReviewTab>('video');
  const [activeSubTab, setActiveSubTab] = useState<ReviewSubTab>('completed');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<any>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState<any>(null);

  // Mock elderly profiles for booking
  const elderlyProfiles = [
    {
      id: '1',
      name: 'Bà Nguyễn Thị Mai',
      age: 75,
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
      healthStatus: 'good',
      familyName: 'Gia đình Nguyễn',
    },
    {
      id: '2',
      name: 'Ông Trần Văn Nam',
      age: 82,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      healthStatus: 'fair',
      familyName: 'Gia đình Trần',
    },
  ];

  // Mock data - Video Consultation Reviews
  const videoReviews: VideoConsultationReview[] = [
    {
      id: '1',
      caregiverId: '1',
      caregiverName: 'Chị Nguyễn Thị Lan',
      caregiverAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      comment: 'Chị Lan tư vấn rất chi tiết và nhiệt tình. Cuộc gọi video rất chất lượng.',
      date: '2024-01-15',
      duration: 45,
      isVerified: true,
    },
    {
      id: '2',
      caregiverId: '2',
      caregiverName: 'Chị Trần Văn Hoa',
      caregiverAvatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
      rating: 4,
      comment: 'Tư vấn tốt, chị Hoa giải thích rõ ràng các vấn đề sức khỏe.',
      date: '2024-01-10',
      duration: 30,
      isVerified: true,
    },
  ];

  // Mock data - Service Reviews
  const serviceReviews: ServiceReview[] = [
    {
      id: '1',
      caregiverId: '1',
      caregiverName: 'Chị Nguyễn Thị Lan',
      caregiverAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      comment: 'Chị Lan chăm sóc rất tận tâm và chuyên nghiệp.',
      date: '2024-01-15',
      elderlyName: 'Bà Nguyễn Thị Mai',
      familyName: 'Gia đình Nguyễn',
      totalHours: 120,
      completedTasks: 45,
      pendingTasks: 5,
      totalTasks: 50,
      isVerified: true,
    },
    {
      id: '2',
      caregiverId: '2',
      caregiverName: 'Anh Lê Minh Đức',
      caregiverAvatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
      rating: 4,
      comment: 'Anh Đức hỗ trợ di chuyển rất tốt.',
      date: '2024-01-05',
      elderlyName: 'Bà Lê Thị Hoa',
      familyName: 'Gia đình Lê',
      totalHours: 80,
      completedTasks: 30,
      pendingTasks: 3,
      totalTasks: 33,
      isVerified: true,
    },
  ];

  // Mock data - System Reviews
  const systemReviews: SystemReview[] = [
    {
      id: '1',
      rating: 4,
      comment: 'Ứng dụng chạy mượt mà, giao diện thân thiện.',
      date: '2024-01-15',
      category: 'app_performance',
      isVerified: true,
    },
    {
      id: '2',
      rating: 5,
      comment: 'Tính năng tìm kiếm caregiver rất tiện lợi.',
      date: '2024-01-10',
      category: 'features',
      isVerified: true,
    },
    {
      id: '3',
      rating: 3,
      comment: 'Cần cải thiện tốc độ tải trang.',
      date: '2024-01-05',
      category: 'ui_ux',
      isVerified: true,
    },
  ];

  // Mock data - Complaint Reviews
  const complaintReviews: ComplaintReview[] = [
    {
      id: '1',
      complainantName: 'Nguyễn Văn A',
      complainantAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      accusedName: 'Chị Trần Thị B',
      accusedAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      adminName: 'Admin Nguyễn',
      adminAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      date: '2024-01-15',
      time: '14:30',
      status: 'resolved',
      category: 'Chất lượng dịch vụ',
      isVerified: true,
    },
    {
      id: '2',
      complainantName: 'Lê Thị C',
      complainantAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      accusedName: 'Anh Hoàng Văn D',
      accusedAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      adminName: 'Admin Lê',
      adminAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      date: '2024-01-10',
      time: '09:15',
      status: 'resolved',
      category: 'Thái độ phục vụ',
      isVerified: true,
    },
  ];

  // Mock data cho pending reviews
  const pendingReviews = [
    // Video Reviews
    {
      id: '1',
      type: 'video',
      caregiverName: 'Nguyễn Thị Lan',
      caregiverAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      serviceDate: '2024-01-15',
      duration: '30 phút',
      isExpired: false,
    },
    {
      id: '2',
      type: 'video',
      caregiverName: 'Trần Văn Minh',
      caregiverAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      serviceDate: '2024-01-10',
      duration: '45 phút',
      isExpired: true,
    },
    // Service Reviews
    {
      id: '3',
      type: 'service',
      caregiverName: 'Lê Thị Hoa',
      caregiverAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      serviceDate: '2024-01-12',
      elderlyName: 'Bà Nguyễn Thị Mai',
      familyName: 'Gia đình Nguyễn',
      isExpired: false,
    },
    {
      id: '4',
      type: 'service',
      caregiverName: 'Hoàng Văn Dũng',
      caregiverAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      serviceDate: '2024-01-08',
      elderlyName: 'Ông Trần Văn Nam',
      familyName: 'Gia đình Trần',
      isExpired: true,
    },
    // System Reviews
    {
      id: '5',
      type: 'system',
      category: 'App Performance',
      date: '2024-01-10',
      isExpired: false,
    },
    {
      id: '6',
      type: 'system',
      category: 'UI/UX Design',
      date: '2024-01-05',
      isExpired: false,
    },
    // Complaint Reviews
    {
      id: '7',
      type: 'complaint',
      complainantName: 'Nguyễn Văn A',
      accusedName: 'Trần Thị B',
      date: '2024-01-10',
      category: 'Thái độ phục vụ',
      isExpired: false,
    },
  ];

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color="#ffd700"
          />
        ))}
      </View>
    );
  };

  const handleReviewPress = (item: any) => {
    setSelectedReviewItem(item);
    setRating(0);
    setComment('');
    setShowReviewModal(true);
  };

  const handleItemPress = (item: any) => {
    setSelectedDetailItem(item);
    setShowDetailModal(true);
  };

  const handleSubmitReview = () => {
    if (rating === 0) {
      alert('Vui lòng chọn số sao đánh giá');
      return;
    }
    
    // TODO: Submit review to API
    console.log('Submitting review:', {
      item: selectedReviewItem,
      rating,
      comment,
      user: user?.email
    });
    
    // Close review modal and show confirmation modal
    setShowReviewModal(false);
    setShowConfirmationModal(true);
  };

  const handleConfirmationChoice = (choice: 'hire' | 'not_hire') => {
    setShowConfirmationModal(false);
    
    if (choice === 'hire') {
      // Show booking modal for immediate hire only
      setSelectedCaregiver({
        id: selectedReviewItem.caregiverId || '1',
        name: selectedReviewItem.caregiverName,
        avatar: selectedReviewItem.caregiverAvatar,
        hourlyRate: 150000, // Mock rate
        specialties: ['Chăm sóc người già', 'Tư vấn sức khỏe'],
        experience: '5 năm',
        rating: 4.5,
        reviews: 120,
        location: 'Hồ Chí Minh',
        isOnline: true,
        isVerified: true,
      });
      setShowBookingModal(true);
    } else {
      // Just show success message
      alert('Đánh giá đã được gửi thành công!');
    }
  };

  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
    setSelectedCaregiver(null);
  };

  const renderRatingStars = (currentRating: number, onPress: (rating: number) => void) => {
    return (
      <View style={styles.ratingStarsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onPress(star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= currentRating ? 'star' : 'star-outline'}
              size={32}
              color={star <= currentRating ? '#ffd700' : '#ddd'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'app_performance': return 'Hiệu suất ứng dụng';
      case 'ui_ux': return 'Giao diện người dùng';
      case 'features': return 'Tính năng';
      case 'support': return 'Hỗ trợ';
      default: return category;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffa502';
      case 'resolved': return '#2ed573';
      case 'rejected': return '#ff4757';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Hết hạn';
      case 'resolved': return 'Đã giải quyết';
      case 'rejected': return 'Đã từ chối';
      default: return 'Không xác định';
    }
  };

  const renderVideoReview = ({ item }: { item: VideoConsultationReview }) => (
    <TouchableOpacity style={styles.reviewCard} onPress={() => handleItemPress(item)}>
      <View style={styles.reviewHeader}>
        <View style={styles.caregiverInfo}>
          <View style={styles.avatar}>
            <ThemedText style={styles.avatarText}>
              {item.caregiverName ? item.caregiverName.split(' ').pop()?.charAt(0) : '?'}
            </ThemedText>
          </View>
          <View style={styles.caregiverDetails}>
            <ThemedText style={styles.caregiverName}>{item.caregiverName}</ThemedText>
            <ThemedText style={styles.videoDuration}>Thời lượng: {item.duration} phút</ThemedText>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          {renderStars(item.rating)}
          <ThemedText style={styles.ratingText}>{item.rating}/5</ThemedText>
        </View>
      </View>

      <ThemedText style={styles.comment}>{item.comment}</ThemedText>

      <View style={styles.reviewFooter}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar" size={14} color="#6c757d" />
          <ThemedText style={styles.dateText}>{item.date}</ThemedText>
        </View>
        {item.isVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#2ed573" />
            <ThemedText style={styles.verifiedText}>Đã xác thực</ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderServiceReview = ({ item }: { item: ServiceReview }) => (
    <TouchableOpacity style={styles.reviewCard} onPress={() => handleItemPress(item)}>
      <View style={styles.reviewHeader}>
        <View style={styles.caregiverInfo}>
          <View style={styles.avatar}>
            <ThemedText style={styles.avatarText}>
              {item.caregiverName ? item.caregiverName.split(' ').pop()?.charAt(0) : '?'}
            </ThemedText>
          </View>
          <View style={styles.caregiverDetails}>
            <ThemedText style={styles.caregiverName}>{item.caregiverName}</ThemedText>
            <ThemedText style={styles.caregiverRole}>Dịch vụ chăm sóc</ThemedText>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          {renderStars(item.rating)}
          <ThemedText style={styles.ratingText}>{item.rating}/5</ThemedText>
        </View>
      </View>

      <ThemedText style={styles.comment}>{item.comment}</ThemedText>

      <View style={styles.reviewFooter}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar" size={14} color="#6c757d" />
          <ThemedText style={styles.dateText}>{item.date}</ThemedText>
        </View>
        {item.isVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#2ed573" />
            <ThemedText style={styles.verifiedText}>Đã xác thực</ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSystemReview = ({ item }: { item: SystemReview }) => (
    <TouchableOpacity style={styles.reviewCard} onPress={() => handleItemPress(item)}>
      <View style={styles.reviewHeader}>
        <View style={styles.systemInfo}>
          <Ionicons name="settings" size={24} color="#4ECDC4" />
          <View style={styles.systemDetails}>
            <ThemedText style={styles.systemCategory}>{getCategoryText(item.category)}</ThemedText>
            <ThemedText style={styles.systemDate}>{item.date}</ThemedText>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          {renderStars(item.rating)}
          <ThemedText style={styles.ratingText}>{item.rating}/5</ThemedText>
        </View>
      </View>

      <ThemedText style={styles.comment}>{item.comment}</ThemedText>

      <View style={styles.reviewFooter}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar" size={14} color="#6c757d" />
          <ThemedText style={styles.dateText}>{item.date}</ThemedText>
        </View>
        {item.isVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#2ed573" />
            <ThemedText style={styles.verifiedText}>Đã xác thực</ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderComplaintReview = ({ item }: { item: ComplaintReview }) => (
    <TouchableOpacity style={styles.reviewCard} onPress={() => handleItemPress(item)}>
      <View style={styles.reviewHeader}>
        <View style={styles.complaintInfo}>
          <View style={styles.complaintIcon}>
            <Ionicons name="warning" size={24} color="#ff4757" />
          </View>
          <View style={styles.complaintDetails}>
            <ThemedText style={styles.complaintTitle}>Khiếu nại</ThemedText>
            <ThemedText style={styles.complaintCategory}>{item.category}</ThemedText>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <ThemedText style={styles.statusText}>{getStatusText(item.status)}</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.reviewFooter}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar" size={14} color="#6c757d" />
          <ThemedText style={styles.dateText}>{item.date}</ThemedText>
        </View>
        {item.isVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#2ed573" />
            <ThemedText style={styles.verifiedText}>Đã xác thực</ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderPendingReview = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.reviewCard} onPress={() => handleItemPress(item)}>
      <View style={styles.reviewHeader}>
        {item.type === 'video' && (
          <View style={styles.caregiverInfo}>
            <Image source={{ uri: item.caregiverAvatar }} style={styles.avatar} />
            <View style={styles.caregiverDetails}>
              <ThemedText style={styles.caregiverName}>{item.caregiverName}</ThemedText>
              <ThemedText style={styles.serviceInfo}>Video tư vấn • {item.duration}</ThemedText>
            </View>
          </View>
        )}
        
        {item.type === 'service' && (
          <View style={styles.caregiverInfo}>
            <Image source={{ uri: item.caregiverAvatar }} style={styles.avatar} />
            <View style={styles.caregiverDetails}>
              <ThemedText style={styles.caregiverName}>{item.caregiverName}</ThemedText>
              <ThemedText style={styles.serviceInfo}>Dịch vụ chăm sóc</ThemedText>
              <ThemedText style={styles.elderlyInfo}>{item.elderlyName} • {item.familyName}</ThemedText>
            </View>
          </View>
        )}
        
        {item.type === 'system' && (
          <View style={styles.systemInfo}>
            <View style={styles.systemIcon}>
              <Ionicons name="settings" size={24} color="#4ECDC4" />
            </View>
            <View style={styles.systemDetails}>
              <ThemedText style={styles.systemTitle}>Đánh giá hệ thống</ThemedText>
              <ThemedText style={styles.systemCategory}>{item.category}</ThemedText>
            </View>
          </View>
        )}
        
        {item.type === 'complaint' && (
          <View style={styles.complaintInfo}>
            <View style={styles.complaintIcon}>
              <Ionicons name="warning" size={24} color="#ff4757" />
            </View>
            <View style={styles.complaintDetails}>
              <ThemedText style={styles.complaintTitle}>Khiếu nại</ThemedText>
              <ThemedText style={styles.complaintCategory}>{item.category}</ThemedText>
              <ThemedText style={styles.complaintPeople}>
                {item.complainantName} → {item.accusedName}
              </ThemedText>
            </View>
          </View>
        )}
        
        <View style={styles.ratingContainer}>
          {item.isExpired ? (
            <View style={styles.expiredBadge}>
              <ThemedText style={styles.expiredText}>Hết hạn</ThemedText>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.reviewButton}
              onPress={() => handleReviewPress(item)}
            >
              <ThemedText style={styles.reviewButtonText}>Đánh giá</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.reviewFooter}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar" size={14} color="#6c757d" />
          <ThemedText style={styles.dateText}>{item.serviceDate || item.date}</ThemedText>
        </View>
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
          <ThemedText style={styles.headerTitle}>Đánh giá</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Chất lượng dịch vụ</ThemedText>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="search-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          <TouchableOpacity
            style={[styles.tab, activeTab === 'video' && styles.tabActive]}
            onPress={() => setActiveTab('video')}
          >
            <Ionicons 
              name="videocam" 
              size={16} 
              color={activeTab === 'video' ? '#4ECDC4' : '#6c757d'} 
            />
            <ThemedText style={[styles.tabText, activeTab === 'video' && styles.tabTextActive]}>
              Video tư vấn ({videoReviews.length})
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'service' && styles.tabActive]}
            onPress={() => setActiveTab('service')}
          >
            <Ionicons 
              name="medical" 
              size={16} 
              color={activeTab === 'service' ? '#4ECDC4' : '#6c757d'} 
            />
            <ThemedText style={[styles.tabText, activeTab === 'service' && styles.tabTextActive]}>
              Dịch vụ ({serviceReviews.length})
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'system' && styles.tabActive]}
            onPress={() => setActiveTab('system')}
          >
            <Ionicons 
              name="settings" 
              size={16} 
              color={activeTab === 'system' ? '#4ECDC4' : '#6c757d'} 
            />
            <ThemedText style={[styles.tabText, activeTab === 'system' && styles.tabTextActive]}>
              Hệ thống ({systemReviews.length})
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'complaint' && styles.tabActive]}
            onPress={() => setActiveTab('complaint')}
          >
            <Ionicons 
              name="warning" 
              size={16} 
              color={activeTab === 'complaint' ? '#4ECDC4' : '#6c757d'} 
            />
            <ThemedText style={[styles.tabText, activeTab === 'complaint' && styles.tabTextActive]}>
              Khiếu nại ({complaintReviews.length})
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Sub Tabs */}
      <View style={styles.subTabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subTabsScrollContent}
        >
          <TouchableOpacity
            style={[styles.subTab, activeSubTab === 'completed' && styles.subTabActive]}
            onPress={() => setActiveSubTab('completed')}
          >
            <ThemedText style={[styles.subTabText, activeSubTab === 'completed' && styles.subTabTextActive]}>
              Đã đánh giá
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTab, activeSubTab === 'pending' && styles.subTabActive]}
            onPress={() => setActiveSubTab('pending')}
          >
            <ThemedText style={[styles.subTabText, activeSubTab === 'pending' && styles.subTabTextActive]}>
              Chờ đánh giá
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeSubTab === 'completed' && (
          <>
            {activeTab === 'video' && (
              <FlatList
                data={videoReviews}
                renderItem={renderVideoReview}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
              />
            )}
            {activeTab === 'service' && (
              <FlatList
                data={serviceReviews}
                renderItem={renderServiceReview}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
              />
            )}
            {activeTab === 'system' && (
              <FlatList
                data={systemReviews}
                renderItem={renderSystemReview}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
              />
            )}
            {activeTab === 'complaint' && (
              <FlatList
                data={complaintReviews}
                renderItem={renderComplaintReview}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
              />
            )}
          </>
        )}
        
        {activeSubTab === 'pending' && (
          <FlatList
            data={pendingReviews.filter(item => item.type === activeTab)}
            renderItem={renderPendingReview}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowReviewModal(false)}
            >
              <Ionicons name="close" size={24} color="#6c757d" />
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>Đánh giá</ThemedText>
            <View style={styles.modalPlaceholder} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Review Item Info */}
            <View style={styles.reviewItemInfo}>
              {selectedReviewItem?.type === 'video' && (
                <View style={styles.itemInfo}>
                  <Image source={{ uri: selectedReviewItem.caregiverAvatar }} style={styles.itemAvatar} />
                  <View style={styles.itemDetails}>
                    <ThemedText style={styles.itemTitle}>Video tư vấn</ThemedText>
                    <ThemedText style={styles.itemSubtitle}>{selectedReviewItem.caregiverName}</ThemedText>
                    <ThemedText style={styles.itemInfo}>{selectedReviewItem.duration}</ThemedText>
                  </View>
                </View>
              )}
              
              {selectedReviewItem?.type === 'service' && (
                <View style={styles.itemInfo}>
                  <Image source={{ uri: selectedReviewItem.caregiverAvatar }} style={styles.itemAvatar} />
                  <View style={styles.itemDetails}>
                    <ThemedText style={styles.itemTitle}>Dịch vụ chăm sóc</ThemedText>
                    <ThemedText style={styles.itemSubtitle}>{selectedReviewItem.caregiverName}</ThemedText>
                    <ThemedText style={styles.itemInfo}>{selectedReviewItem.elderlyName} • {selectedReviewItem.familyName}</ThemedText>
                  </View>
                </View>
              )}
              
              {selectedReviewItem?.type === 'system' && (
                <View style={styles.itemInfo}>
                  <View style={styles.itemIcon}>
                    <Ionicons name="settings" size={24} color="#4ECDC4" />
                  </View>
                  <View style={styles.itemDetails}>
                    <ThemedText style={styles.itemTitle}>Đánh giá hệ thống</ThemedText>
                    <ThemedText style={styles.itemSubtitle}>{selectedReviewItem.category}</ThemedText>
                  </View>
                </View>
              )}
              
              {selectedReviewItem?.type === 'complaint' && (
                <View style={styles.itemInfo}>
                  <View style={styles.itemIcon}>
                    <Ionicons name="warning" size={24} color="#ff4757" />
                  </View>
                  <View style={styles.itemDetails}>
                    <ThemedText style={styles.itemTitle}>Khiếu nại</ThemedText>
                    <ThemedText style={styles.itemSubtitle}>{selectedReviewItem.category}</ThemedText>
                    <ThemedText style={styles.itemInfo}>{selectedReviewItem.complainantName} → {selectedReviewItem.accusedName}</ThemedText>
                  </View>
                </View>
              )}
            </View>

            {/* Rating Section */}
            <View style={styles.ratingSection}>
              <ThemedText style={styles.ratingTitle}>Đánh giá của bạn</ThemedText>
              {renderRatingStars(rating, setRating)}
              <ThemedText style={styles.ratingText}>
                {rating === 0 ? 'Chọn số sao' : 
                 rating === 1 ? 'Rất tệ' :
                 rating === 2 ? 'Tệ' :
                 rating === 3 ? 'Bình thường' :
                 rating === 4 ? 'Tốt' : 'Rất tốt'}
              </ThemedText>
            </View>

            {/* Comment Section */}
            <View style={styles.commentSection}>
              <ThemedText style={styles.commentTitle}>Nhận xét (tùy chọn)</ThemedText>
              <TextInput
                style={styles.commentInput}
                placeholder="Chia sẻ trải nghiệm của bạn..."
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[styles.submitButton, rating === 0 && styles.submitButtonDisabled]}
              onPress={handleSubmitReview}
              disabled={rating === 0}
            >
              <ThemedText style={[styles.submitButtonText, rating === 0 && styles.submitButtonTextDisabled]}>
                Gửi đánh giá
              </ThemedText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowDetailModal(false)}
            >
              <Ionicons name="close" size={24} color="#6c757d" />
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>Chi tiết</ThemedText>
            <View style={styles.modalPlaceholder} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Detail Content based on type */}
            {selectedDetailItem && (
              <>
                {/* Video Consultation Detail */}
                {selectedDetailItem.type === 'video' && (
                  <View style={styles.detailSection}>
                    <View style={styles.detailHeader}>
                      <Image source={{ uri: selectedDetailItem.caregiverAvatar }} style={styles.detailAvatar} />
                      <View style={styles.detailInfo}>
                        <ThemedText style={styles.detailTitle}>Video tư vấn</ThemedText>
                        <ThemedText style={styles.detailSubtitle}>{selectedDetailItem.caregiverName}</ThemedText>
                        <ThemedText style={styles.detailText}>{selectedDetailItem.duration}</ThemedText>
                      </View>
                    </View>
                    
                    <View style={styles.detailContent}>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Người chăm sóc:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.caregiverName}</ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Ngày tư vấn:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.serviceDate}</ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Giờ tư vấn:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.time || '14:00 - 15:00'}</ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Thời lượng:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.duration}</ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Trạng thái:</ThemedText>
                        <ThemedText style={styles.detailValue}>
                          {selectedDetailItem.isExpired ? 'Hết hạn' : 'Có thể đánh giá'}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                )}

                {/* Service Detail */}
                {selectedDetailItem.type === 'service' && (
                  <View style={styles.detailSection}>
                    <View style={styles.detailHeader}>
                      <Image source={{ uri: selectedDetailItem.caregiverAvatar }} style={styles.detailAvatar} />
                      <View style={styles.detailInfo}>
                        <ThemedText style={styles.detailTitle}>Dịch vụ chăm sóc</ThemedText>
                        <ThemedText style={styles.detailSubtitle}>{selectedDetailItem.caregiverName}</ThemedText>
                        <ThemedText style={styles.detailText}>{selectedDetailItem.elderlyName} • {selectedDetailItem.familyName}</ThemedText>
                      </View>
                    </View>
                    
                    <View style={styles.detailContent}>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Người chăm sóc:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.caregiverName}</ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Người thuê:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.familyName}</ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Người được chăm sóc:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.elderlyName}</ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Ngày dịch vụ:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.serviceDate}</ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Giờ dịch vụ:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.time || '08:00 - 17:00'}</ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Thời lượng:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.duration || '8 giờ'}</ThemedText>
                      </View>
                      
                      {/* Service Statistics */}
                      <View style={styles.statsSection}>
                        <ThemedText style={styles.statsTitle}>Thống kê dịch vụ</ThemedText>
                        <View style={styles.statsGrid}>
                          <View style={styles.statCard}>
                            <ThemedText style={styles.statValue}>120</ThemedText>
                            <ThemedText style={styles.statLabel}>Tổng giờ làm</ThemedText>
                          </View>
                          <View style={styles.statCard}>
                            <ThemedText style={styles.statValue}>45</ThemedText>
                            <ThemedText style={styles.statLabel}>Task hoàn thành</ThemedText>
                          </View>
                          <View style={styles.statCard}>
                            <ThemedText style={styles.statValue}>5</ThemedText>
                            <ThemedText style={styles.statLabel}>Task chưa hoàn thành</ThemedText>
                          </View>
                          <View style={styles.statCard}>
                            <ThemedText style={styles.statValue}>50</ThemedText>
                            <ThemedText style={styles.statLabel}>Tổng task</ThemedText>
                          </View>
                        </View>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Trạng thái:</ThemedText>
                        <ThemedText style={styles.detailValue}>
                          {selectedDetailItem.isExpired ? 'Hết hạn' : 'Có thể đánh giá'}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                )}

                {/* System Detail */}
                {selectedDetailItem.type === 'system' && (
                  <View style={styles.detailSection}>
                    <View style={styles.detailHeader}>
                      <View style={styles.detailIcon}>
                        <Ionicons name="settings" size={24} color="#4ECDC4" />
                      </View>
                      <View style={styles.detailInfo}>
                        <ThemedText style={styles.detailTitle}>Đánh giá hệ thống</ThemedText>
                        <ThemedText style={styles.detailSubtitle}>{selectedDetailItem.category}</ThemedText>
                      </View>
                    </View>
                    
                    <View style={styles.detailContent}>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Danh mục đánh giá:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.category}</ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Ngày đánh giá:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.date}</ThemedText>
                      </View>
                      
                      {/* System Evaluation */}
                      <View style={styles.evaluationSection}>
                        <ThemedText style={styles.evaluationTitle}>Đánh giá hệ thống</ThemedText>
                        <View style={styles.evaluationContent}>
                          <ThemedText style={styles.evaluationText}>
                            Hệ thống hoạt động ổn định, giao diện thân thiện với người dùng. 
                            Tốc độ tải trang nhanh, tính năng đầy đủ và dễ sử dụng.
                          </ThemedText>
                        </View>
                      </View>
                      
                      {/* Feedback Section */}
                      <View style={styles.feedbackSection}>
                        <ThemedText style={styles.feedbackTitle}>Góp ý cải thiện</ThemedText>
                        <View style={styles.feedbackContent}>
                          <ThemedText style={styles.feedbackText}>
                            • Cải thiện tốc độ phản hồi của hệ thống{'\n'}
                            • Thêm tính năng thông báo push{'\n'}
                            • Tối ưu hóa giao diện trên mobile{'\n'}
                            • Thêm tính năng backup dữ liệu
                          </ThemedText>
                        </View>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Trạng thái:</ThemedText>
                        <ThemedText style={styles.detailValue}>
                          {selectedDetailItem.isExpired ? 'Hết hạn' : 'Có thể đánh giá'}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                )}

                {/* Complaint Detail */}
                {selectedDetailItem.type === 'complaint' && (
                  <View style={styles.detailSection}>
                    <View style={styles.detailHeader}>
                      <View style={styles.detailIcon}>
                        <Ionicons name="warning" size={24} color="#ff4757" />
                      </View>
                      <View style={styles.detailInfo}>
                        <ThemedText style={styles.detailTitle}>Khiếu nại</ThemedText>
                        <ThemedText style={styles.detailSubtitle}>{selectedDetailItem.category}</ThemedText>
                      </View>
                    </View>
                    
                    <View style={styles.detailContent}>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Người khiếu nại:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.complainantName}</ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Người bị khiếu nại:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.accusedName}</ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Danh mục:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.category}</ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Ngày khiếu nại:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.date}</ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Thời gian:</ThemedText>
                        <ThemedText style={styles.detailValue}>14:30</ThemedText>
                      </View>
                      
                      {/* Admin Information */}
                      <View style={styles.adminSection}>
                        <ThemedText style={styles.adminTitle}>Thông tin Admin xử lý</ThemedText>
                        <View style={styles.adminInfo}>
                          <View style={styles.adminAvatar}>
                            <ThemedText style={styles.adminAvatarText}>A</ThemedText>
                          </View>
                          <View style={styles.adminDetails}>
                            <ThemedText style={styles.adminName}>Admin Lê</ThemedText>
                            <ThemedText style={styles.adminRole}>Quản trị viên hệ thống</ThemedText>
                          </View>
                        </View>
                      </View>
                      
                      {/* Complaint Details */}
                      <View style={styles.complaintDetailsSection}>
                        <ThemedText style={styles.complaintDetailsTitle}>Chi tiết khiếu nại</ThemedText>
                        <View style={styles.complaintDetailsContent}>
                          <ThemedText style={styles.complaintDetailsText}>
                            Người chăm sóc có thái độ không tốt, không tuân thủ quy trình chăm sóc 
                            và có hành vi thiếu tôn trọng với người già. Cần xem xét và xử lý nghiêm khắc.
                          </ThemedText>
                        </View>
                      </View>
                      
                      {/* Decision */}
                      <View style={styles.decisionSection}>
                        <ThemedText style={styles.decisionTitle}>Quyết định xử lý</ThemedText>
                        <View style={styles.decisionContent}>
                          <View style={styles.decisionStatus}>
                            <View style={[styles.statusBadge, { backgroundColor: '#2ed573' }]}>
                              <ThemedText style={styles.statusText}>Đã giải quyết</ThemedText>
                            </View>
                          </View>
                          <ThemedText style={styles.decisionText}>
                            Đã tiến hành cảnh cáo và yêu cầu người chăm sóc cải thiện thái độ. 
                            Sẽ theo dõi và đánh giá lại trong 30 ngày tới.
                          </ThemedText>
                          <View style={styles.decisionDate}>
                            <ThemedText style={styles.decisionDateText}>Ngày quyết định: 15/01/2024</ThemedText>
                          </View>
                        </View>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Trạng thái:</ThemedText>
                        <ThemedText style={styles.detailValue}>
                          {selectedDetailItem.isExpired ? 'Hết hạn' : 'Có thể đánh giá'}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                )}

                {/* Completed Review Detail */}
                {!selectedDetailItem.type && (
                  <View style={styles.detailSection}>
                    <View style={styles.detailHeader}>
                      <View style={styles.detailAvatar}>
                        <ThemedText style={styles.detailAvatarText}>
                          {selectedDetailItem.caregiverName ? selectedDetailItem.caregiverName.split(' ').pop()?.charAt(0) : '?'}
                        </ThemedText>
                      </View>
                      <View style={styles.detailInfo}>
                        <ThemedText style={styles.detailTitle}>
                          {selectedDetailItem.caregiverName || 'Đánh giá hệ thống'}
                        </ThemedText>
                        <ThemedText style={styles.detailSubtitle}>
                          {selectedDetailItem.category ? getCategoryText(selectedDetailItem.category) : 'Đánh giá đã hoàn thành'}
                        </ThemedText>
                      </View>
                    </View>
                    
                    <View style={styles.detailContent}>
                      {/* Service Information */}
                      {selectedDetailItem.caregiverName && (
                        <>
                          <View style={styles.detailRow}>
                            <ThemedText style={styles.detailLabel}>Người chăm sóc:</ThemedText>
                            <ThemedText style={styles.detailValue}>{selectedDetailItem.caregiverName}</ThemedText>
                          </View>
                          {selectedDetailItem.familyName && (
                            <View style={styles.detailRow}>
                              <ThemedText style={styles.detailLabel}>Người thuê:</ThemedText>
                              <ThemedText style={styles.detailValue}>{selectedDetailItem.familyName}</ThemedText>
                            </View>
                          )}
                          {selectedDetailItem.elderlyName && (
                            <View style={styles.detailRow}>
                              <ThemedText style={styles.detailLabel}>Người được chăm sóc:</ThemedText>
                              <ThemedText style={styles.detailValue}>{selectedDetailItem.elderlyName}</ThemedText>
                            </View>
                          )}
                          <View style={styles.detailRow}>
                            <ThemedText style={styles.detailLabel}>
                              {selectedDetailItem.type === 'video' ? 'Ngày tư vấn:' : 'Ngày dịch vụ:'}
                            </ThemedText>
                            <ThemedText style={styles.detailValue}>{selectedDetailItem.serviceDate || selectedDetailItem.date}</ThemedText>
                          </View>
                          {selectedDetailItem.time && (
                            <View style={styles.detailRow}>
                              <ThemedText style={styles.detailLabel}>
                                {selectedDetailItem.type === 'video' ? 'Giờ tư vấn:' : 'Giờ dịch vụ:'}
                              </ThemedText>
                              <ThemedText style={styles.detailValue}>{selectedDetailItem.time}</ThemedText>
                            </View>
                          )}
                          {selectedDetailItem.duration && (
                            <View style={styles.detailRow}>
                              <ThemedText style={styles.detailLabel}>Thời lượng:</ThemedText>
                              <ThemedText style={styles.detailValue}>{selectedDetailItem.duration}</ThemedText>
                            </View>
                          )}
                          
                          {/* Service Statistics for Service Reviews */}
                          {(selectedDetailItem.type === 'service' || (selectedDetailItem.familyName && selectedDetailItem.elderlyName)) && (
                            <View style={styles.statsSection}>
                              <ThemedText style={styles.statsTitle}>Thống kê dịch vụ</ThemedText>
                              <View style={styles.statsGrid}>
                                <View style={styles.statCard}>
                                  <ThemedText style={styles.statValue}>{selectedDetailItem.totalHours || 120}</ThemedText>
                                  <ThemedText style={styles.statLabel}>Tổng giờ làm</ThemedText>
                                </View>
                                <View style={styles.statCard}>
                                  <ThemedText style={styles.statValue}>{selectedDetailItem.completedTasks || 45}</ThemedText>
                                  <ThemedText style={styles.statLabel}>Task hoàn thành</ThemedText>
                                </View>
                                <View style={styles.statCard}>
                                  <ThemedText style={styles.statValue}>{selectedDetailItem.pendingTasks || 5}</ThemedText>
                                  <ThemedText style={styles.statLabel}>Task chưa hoàn thành</ThemedText>
                                </View>
                                <View style={styles.statCard}>
                                  <ThemedText style={styles.statValue}>{selectedDetailItem.totalTasks || 50}</ThemedText>
                                  <ThemedText style={styles.statLabel}>Tổng task</ThemedText>
                                </View>
                              </View>
                            </View>
                          )}
                        </>
                      )}
                      
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Đánh giá:</ThemedText>
                        <View style={styles.detailRating}>
                          {renderStars(selectedDetailItem.rating)}
                          <ThemedText style={styles.detailRatingText}>{selectedDetailItem.rating}/5</ThemedText>
                        </View>
                      </View>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Nhận xét:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.comment}</ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Ngày đánh giá:</ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedDetailItem.date}</ThemedText>
                      </View>
                      {selectedDetailItem.isVerified && (
                        <View style={styles.detailRow}>
                          <ThemedText style={styles.detailLabel}>Trạng thái:</ThemedText>
                          <View style={styles.verifiedBadge}>
                            <Ionicons name="checkmark-circle" size={16} color="#2ed573" />
                            <ThemedText style={styles.verifiedText}>Đã xác thực</ThemedText>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmationModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowConfirmationModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowConfirmationModal(false)}
            >
              <Ionicons name="close" size={24} color="#6c757d" />
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>Xác nhận đánh giá</ThemedText>
            <View style={styles.modalPlaceholder} />
          </View>

          <View style={styles.confirmationContent}>
            <View style={styles.confirmationStars}>
              {renderStars(rating)}
            </View>
            
            <ThemedText style={styles.confirmationTitle}>
              Bạn đánh giá người này {rating} sao
            </ThemedText>
            
            <ThemedText style={styles.confirmationQuestion}>
              Vậy bạn có muốn tiếp tục thuê người này không?
            </ThemedText>

            <View style={styles.confirmationButtons}>
              <TouchableOpacity 
                style={styles.confirmationButton}
                onPress={() => handleConfirmationChoice('not_hire')}
              >
                <ThemedText style={styles.confirmationButtonText}>
                  Gửi đánh giá và không thuê
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.confirmationButton, styles.confirmationButtonPrimary]}
                onPress={() => handleConfirmationChoice('hire')}
              >
                <ThemedText style={[styles.confirmationButtonText, styles.confirmationButtonTextPrimary]}>
                  Gửi đánh giá và thuê
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Booking Modal */}
      {selectedCaregiver && (
        <BookingModal
          visible={showBookingModal}
          onClose={handleCloseBookingModal}
          caregiver={selectedCaregiver}
          elderlyProfiles={elderlyProfiles}
          immediateOnly={true} // Only show immediate hire option
        />
      )}
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
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  tabsContainer: {
    backgroundColor: 'white',
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tabsScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#4ECDC4',
  },
  tabText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#4ECDC4',
    fontWeight: '600',
  },
  // Sub Tabs Styles
  subTabsContainer: {
    backgroundColor: 'white',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  subTabsScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  subTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  subTabActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  subTabText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  subTabTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  reviewCard: {
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
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  caregiverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
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
  elderlyName: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  familyName: {
    fontSize: 12,
    color: '#6c757d',
  },
  ratingContainer: {
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
  },
  comment: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#6c757d',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: '#2ed573',
    fontWeight: '500',
  },
  // New styles for different review types
  videoDuration: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '500',
  },
  serviceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginVertical: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  systemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  systemDetails: {
    marginLeft: 12,
  },
  systemCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  systemDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  complaintHeader: {
    marginBottom: 16,
  },
  complaintInfo: {
    marginBottom: 12,
  },
  complaintPeople: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  personInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  personAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  personAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  personDetails: {
    flex: 1,
  },
  personName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  personRole: {
    fontSize: 12,
    color: '#6c757d',
  },
  adminInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 8,
  },
  adminAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  adminAvatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  adminDetails: {
    flex: 1,
  },
  adminName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  adminRole: {
    fontSize: 10,
    color: '#6c757d',
  },
  complaintStatus: {
    alignItems: 'flex-end',
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
  complaintDetails: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  complaintCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  complaintDateTime: {
    fontSize: 12,
    color: '#6c757d',
  },
  // Pending Reviews Styles
  pendingSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  pendingSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  pendingListContainer: {
    gap: 12,
  },
  pendingReviewCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pendingReviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  caregiverDetails: {
    marginLeft: 12,
    flex: 1,
  },
  caregiverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  serviceInfo: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  elderlyInfo: {
    fontSize: 12,
    color: '#95a5a6',
  },
  systemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  systemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  systemDetails: {
    flex: 1,
  },
  systemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  systemCategory: {
    fontSize: 14,
    color: '#6c757d',
  },
  complaintInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  complaintIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  complaintDetails: {
    flex: 1,
  },
  complaintTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  complaintCategory: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  complaintPeople: {
    fontSize: 12,
    color: '#95a5a6',
  },
  pendingStatus: {
    alignItems: 'flex-end',
  },
  serviceDate: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 8,
  },
  expiredBadge: {
    backgroundColor: '#ff4757',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  expiredText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  reviewButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  reviewButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  modalPlaceholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalFooter: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  // Review Item Info Styles
  reviewItemInfo: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  itemIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '500',
    marginBottom: 2,
  },
  // Rating Styles
  ratingSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  ratingStarsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
    marginHorizontal: 2,
  },
  ratingText: {
    fontSize: 16,
    color: '#4ECDC4',
    fontWeight: '500',
  },
  // Comment Styles
  commentSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  commentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2c3e50',
    backgroundColor: '#f8f9fa',
    minHeight: 100,
  },
  // Submit Button Styles
  submitButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ddd',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  submitButtonTextDisabled: {
    color: '#999',
  },
  // Detail Modal Styles
  detailSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  detailIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailInfo: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  detailSubtitle: {
    fontSize: 16,
    color: '#4ECDC4',
    fontWeight: '500',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#6c757d',
  },
  detailContent: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '400',
    flex: 1,
    textAlign: 'right',
  },
  detailRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailRatingText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  // Stats Section Styles
  statsSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  // Evaluation Section Styles
  evaluationSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  evaluationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  evaluationContent: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  evaluationText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  // Feedback Section Styles
  feedbackSection: {
    marginTop: 16,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  feedbackContent: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  feedbackText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  // Admin Section Styles
  adminSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  adminTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  adminInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  adminAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  adminAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  adminDetails: {
    flex: 1,
  },
  adminName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  adminRole: {
    fontSize: 12,
    color: '#6c757d',
  },
  // Complaint Details Section Styles
  complaintDetailsSection: {
    marginTop: 16,
  },
  complaintDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  complaintDetailsContent: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  complaintDetailsText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  // Decision Section Styles
  decisionSection: {
    marginTop: 16,
  },
  decisionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  decisionContent: {
    backgroundColor: '#d4edda',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  decisionStatus: {
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  decisionText: {
    fontSize: 14,
    color: '#155724',
    lineHeight: 20,
    marginBottom: 8,
  },
  decisionDate: {
    alignItems: 'flex-end',
  },
  decisionDateText: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  // Confirmation Modal Styles
  confirmationContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmationStars: {
    marginBottom: 20,
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 12,
  },
  confirmationQuestion: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  confirmationButtons: {
    width: '100%',
    gap: 16,
  },
  confirmationButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  confirmationButtonPrimary: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  confirmationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
  },
  confirmationButtonTextPrimary: {
    color: 'white',
  },
});
