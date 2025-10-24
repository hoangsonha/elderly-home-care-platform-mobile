import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookingModal } from '@/components/caregiver/BookingModal';
import { ThemedText } from '@/components/themed-text';

interface CaregiverDetail {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  experience: string;
  yearsOfExperience: number;
  specialties: string[];
  hourlyRate: number;
  distance: string;
  isVerified: boolean;
  totalReviews: number;
  description: string;
  education: string[];
  certifications: string[];
  languages: string[];
  availability: string;
  location: string;
  phone: string;
  email: string;
  birthDate: string;
  gender: 'male' | 'female';
  permanentAddress: string;
  temporaryAddress: string;
  workHistory: string[];
  reviews: Review[];
}

interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

export default function CaregiverDetailScreen() {
  const [selectedTab, setSelectedTab] = useState<'info' | 'reviews'>('info');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const { id, name, fromElderly, openBooking } = useLocalSearchParams();

  // Auto-open booking modal if openBooking param is true
  useEffect(() => {
    if (openBooking === 'true') {
      setShowBookingModal(true);
    }
  }, [openBooking]);

  // Mock elderly profiles data
  const elderlyProfiles = [
    {
      id: '1',
      name: 'Bà Nguyễn Thị Lan',
      age: 75,
      currentCaregivers: 1,
      family: 'Gia đình Nguyễn',
      healthStatus: 'good' as const,
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    },
    {
      id: '2',
      name: 'Ông Trần Văn Minh',
      age: 82,
      currentCaregivers: 0,
      family: 'Gia đình Trần',
      healthStatus: 'fair' as const,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    },
  ];

  // Mock data - in real app, this would come from props or API
  const caregiver: CaregiverDetail = {
    id: '1',
    name: 'Chị Nguyễn Thị Lan',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    rating: 4.9,
    experience: '5 năm',
    yearsOfExperience: 5,
    specialties: ['Chăm sóc người cao tuổi', 'Y tế cơ bản', 'Vật lý trị liệu'],
    hourlyRate: 150000,
    distance: '2.5 km',
    isVerified: true,
    totalReviews: 127,
    description: 'Tôi là một người chăm sóc có kinh nghiệm với 5 năm làm việc trong lĩnh vực chăm sóc người cao tuổi. Tôi đặc biệt chuyên về việc hỗ trợ những người có vấn đề về trí nhớ và vận động, luôn đặt sự an toàn và hạnh phúc của người được chăm sóc lên hàng đầu.',
    education: [
      'Cử nhân Điều dưỡng - Đại học Y Hà Nội (2018)',
      'Chứng chỉ Chăm sóc người cao tuổi - Bệnh viện Bạch Mai (2019)',
    ],
    certifications: [
      'Chứng chỉ Sơ cấp cứu',
      'Chứng chỉ Chăm sóc người mất trí nhớ',
      'Chứng chỉ Vật lý trị liệu cơ bản',
    ],
    languages: ['Tiếng Việt', 'Tiếng Anh cơ bản'],
    availability: 'Thứ 2 - Chủ nhật: 7:00 - 19:00',
    location: 'Quận Cầu Giấy, Hà Nội',
    phone: '0901 234 567',
    email: 'nguyenlan@gmail.com',
    birthDate: '15/03/1990',
    gender: 'female',
    permanentAddress: 'Số 123, đường Láng, phường Láng Thượng, quận Đống Đa, Hà Nội',
    temporaryAddress: 'Số 456, đường Cầu Giấy, phường Dịch Vọng, quận Cầu Giấy, Hà Nội',
    workHistory: [
      'Bệnh viện Bạch Mai - Điều dưỡng viên (2018-2020)',
      'Trung tâm Chăm sóc người cao tuổi Hà Nội - Chuyên viên chăm sóc (2020-2022)',
      'Tự do - Người chăm sóc tại nhà (2022-nay)',
    ],
    reviews: [
      {
        id: '1',
        userName: 'Anh Minh',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
        rating: 5,
        comment: 'Chị Lan rất tận tâm và chuyên nghiệp. Mẹ tôi rất yêu quý chị và sức khỏe cải thiện rõ rệt.',
        date: '2 tuần trước',
      },
      {
        id: '2',
        userName: 'Chị Hoa',
        userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
        rating: 5,
        comment: 'Chị có kinh nghiệm và kiến thức y tế tốt. Rất đáng tin cậy và chu đáo.',
        date: '1 tháng trước',
      },
      {
        id: '3',
        userName: 'Anh Đức',
        userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        rating: 4,
        comment: 'Dịch vụ tốt, giá cả hợp lý. Chị Lan rất kiên nhẫn và hiểu biết.',
        date: '2 tháng trước',
      },
    ],
  };

  const handleChat = () => {
    router.push('/chat');
  };

  const handleBook = () => {
    setShowBookingModal(true);
  };

  const handleCall = () => {
    Alert.alert('Gọi điện', `Gọi đến ${caregiver.phone}?`, [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Gọi', onPress: () => console.log('Calling...') },
    ]);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name={index < Math.floor(rating) ? 'star' : 'star-outline'}
        size={16}
        color="#FFD700"
      />
    ));
  };

  const renderReview = (review: Review) => (
    <View key={review.id} style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewUser}>
          <Image source={{ uri: review.userAvatar }} style={styles.reviewAvatar} />
          <View style={styles.reviewUserInfo}>
            <ThemedText style={styles.reviewUserName}>{review.userName}</ThemedText>
            <View style={styles.reviewRating}>
              {renderStars(review.rating)}
            </View>
          </View>
        </View>
        <ThemedText style={styles.reviewDate}>{review.date}</ThemedText>
      </View>
      <ThemedText style={styles.reviewComment}>{review.comment}</ThemedText>
    </View>
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
          <ThemedText style={styles.headerTitle}>Chi tiết người chăm sóc</ThemedText>
          <ThemedText style={styles.headerSubtitle}>{name || caregiver.name}</ThemedText>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="call-outline" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: caregiver.avatar }} style={styles.avatar} />
            {caregiver.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={16} color="white" />
              </View>
            )}
          </View>
          
          <View style={styles.profileInfo}>
            <ThemedText style={styles.caregiverName}>{caregiver.name}</ThemedText>
            <View style={styles.ratingContainer}>
              <View style={styles.ratingStars}>
                {renderStars(caregiver.rating)}
              </View>
              <ThemedText style={styles.ratingText}>
                {caregiver.rating} ({caregiver.totalReviews} đánh giá)
              </ThemedText>
            </View>
            <ThemedText style={styles.experience}>Kinh nghiệm: {caregiver.experience}</ThemedText>
            <ThemedText style={styles.location}>📍 {caregiver.location}</ThemedText>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.chatButton} onPress={handleChat}>
            <Ionicons name="chatbubble-outline" size={20} color="#4ECDC4" />
            <ThemedText style={styles.chatButtonText}>Chat</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <Ionicons name="call-outline" size={20} color="white" />
            <ThemedText style={styles.callButtonText}>Gọi</ThemedText>
          </TouchableOpacity>
          
          {fromElderly !== 'true' && (
            <TouchableOpacity style={styles.bookButton} onPress={handleBook}>
              <Ionicons name="calendar-outline" size={20} color="white" />
              <ThemedText style={styles.bookButtonText}>Đặt lịch</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* Price */}
        <View style={styles.priceSection}>
          <ThemedText style={styles.priceLabel}>Giá dịch vụ</ThemedText>
          <ThemedText style={styles.price}>
            {caregiver.hourlyRate.toLocaleString('vi-VN')}đ/giờ
          </ThemedText>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'info' && styles.activeTab]}
            onPress={() => setSelectedTab('info')}
          >
            <ThemedText style={[styles.tabText, selectedTab === 'info' && styles.activeTabText]}>
              Thông tin
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'reviews' && styles.activeTab]}
            onPress={() => setSelectedTab('reviews')}
          >
            <ThemedText style={[styles.tabText, selectedTab === 'reviews' && styles.activeTabText]}>
              Đánh giá ({caregiver.totalReviews})
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {selectedTab === 'info' ? (
          <View style={styles.infoContent}>
            {/* Description */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Giới thiệu</ThemedText>
              <ThemedText style={styles.sectionContent}>{caregiver.description}</ThemedText>
            </View>

            {/* Specialties */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Chuyên môn</ThemedText>
              <View style={styles.specialtiesContainer}>
                {caregiver.specialties.map((specialty, index) => (
                  <View key={index} style={styles.specialtyTag}>
                    <ThemedText style={styles.specialtyText}>{specialty}</ThemedText>
                  </View>
                ))}
              </View>
            </View>

            {/* Education */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Học vấn</ThemedText>
              {caregiver.education.map((edu, index) => (
                <View key={index} style={styles.educationItem}>
                  <Ionicons name="school-outline" size={16} color="#4ECDC4" />
                  <ThemedText style={styles.educationText}>{edu}</ThemedText>
                </View>
              ))}
            </View>

            {/* Certifications */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Chứng chỉ</ThemedText>
              {caregiver.certifications.map((cert, index) => (
                <View key={index} style={styles.certificationItem}>
                  <Ionicons name="ribbon-outline" size={16} color="#4ECDC4" />
                  <ThemedText style={styles.certificationText}>{cert}</ThemedText>
                </View>
              ))}
            </View>

            {/* Languages */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Ngôn ngữ</ThemedText>
              <View style={styles.languagesContainer}>
                {caregiver.languages.map((lang, index) => (
                  <View key={index} style={styles.languageTag}>
                    <ThemedText style={styles.languageText}>{lang}</ThemedText>
                  </View>
                ))}
              </View>
            </View>

            {/* Availability */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Thời gian làm việc</ThemedText>
              <View style={styles.availabilityItem}>
                <Ionicons name="time-outline" size={16} color="#4ECDC4" />
                <ThemedText style={styles.availabilityText}>{caregiver.availability}</ThemedText>
              </View>
            </View>

            {/* Contact */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Liên hệ</ThemedText>
              <View style={styles.contactItem}>
                <Ionicons name="call-outline" size={16} color="#4ECDC4" />
                <ThemedText style={styles.contactText}>{caregiver.phone}</ThemedText>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="mail-outline" size={16} color="#4ECDC4" />
                <ThemedText style={styles.contactText}>{caregiver.email}</ThemedText>
              </View>
            </View>

            {/* Personal Information */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Thông tin cá nhân</ThemedText>
              <View style={styles.infoItem}>
                <Ionicons name="calendar-outline" size={16} color="#4ECDC4" />
                <ThemedText style={styles.infoLabel}>Ngày sinh:</ThemedText>
                <ThemedText style={styles.infoText}>{caregiver.birthDate}</ThemedText>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="person-outline" size={16} color="#4ECDC4" />
                <ThemedText style={styles.infoLabel}>Giới tính:</ThemedText>
                <ThemedText style={styles.infoText}>{caregiver.gender === 'female' ? 'Nữ' : 'Nam'}</ThemedText>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={16} color="#4ECDC4" />
                <ThemedText style={styles.infoLabel}>Số năm kinh nghiệm:</ThemedText>
                <ThemedText style={styles.infoText}>{caregiver.yearsOfExperience} năm</ThemedText>
              </View>
            </View>

            {/* Address Information */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Địa chỉ</ThemedText>
              <View style={styles.addressItem}>
                <Ionicons name="home-outline" size={16} color="#4ECDC4" />
                <View style={styles.addressContent}>
                  <ThemedText style={styles.addressLabel}>Địa chỉ thường chú:</ThemedText>
                  <ThemedText style={styles.addressText}>{caregiver.permanentAddress}</ThemedText>
                </View>
              </View>
              <View style={styles.addressItem}>
                <Ionicons name="location-outline" size={16} color="#4ECDC4" />
                <View style={styles.addressContent}>
                  <ThemedText style={styles.addressLabel}>Địa chỉ tạm trú:</ThemedText>
                  <ThemedText style={styles.addressText}>{caregiver.temporaryAddress}</ThemedText>
                </View>
              </View>
            </View>

            {/* Work History */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Nơi từng làm việc</ThemedText>
              {caregiver.workHistory.map((work, index) => (
                <View key={index} style={styles.workItem}>
                  <Ionicons name="business-outline" size={16} color="#4ECDC4" />
                  <ThemedText style={styles.workText}>{work}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.reviewsContent}>
            {caregiver.reviews.map(renderReview)}
          </View>
        )}
      </ScrollView>
      
      <BookingModal
        visible={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        caregiver={caregiver}
        elderlyProfiles={elderlyProfiles}
        immediateOnly={true}
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
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: 'white',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e9ecef',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#28a745',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  caregiverName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingStars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#6c757d',
  },
  experience: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#6c757d',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdfa',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#4ECDC4',
    gap: 8,
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ECDC4',
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  callButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  bookButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  priceSection: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4ECDC4',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6c757d',
  },
  activeTabText: {
    color: '#4ECDC4',
  },
  infoContent: {
    backgroundColor: 'white',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 24,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyTag: {
    backgroundColor: '#e6f4fe',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  specialtyText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },
  educationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  educationText: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  certificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  certificationText: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageTag: {
    backgroundColor: '#f0fdfa',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  languageText: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '500',
  },
  availabilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  availabilityText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  // New styles for additional information
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
    minWidth: 120,
  },
  infoText: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  addressContent: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  workItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  workText: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  reviewsContent: {
    backgroundColor: 'white',
  },
  reviewItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewUserInfo: {
    flex: 1,
  },
  reviewUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  reviewComment: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
});
