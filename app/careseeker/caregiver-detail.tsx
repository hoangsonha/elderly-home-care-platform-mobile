import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
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
import { SimpleNavBar } from '@/components/navigation/SimpleNavBar';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext';
import { useElderlyProfiles } from '@/hooks/useDatabaseEntities';

interface CaregiverDetail {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  age: number;
  gender: 'male' | 'female';
  specialties: string[];
  description: string;
  education: string[];
  certifications: string[];
  languages: string[];
  experience: string;
  location: string;
  phone: string;
  email: string;
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
  const { user } = useAuth();
  const { profiles: elderlyProfiles } = useElderlyProfiles(user?.id || '');
  const [selectedTab, setSelectedTab] = useState<'info' | 'reviews'>('info');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const { id } = useLocalSearchParams();

  // Mock caregiver data - map from recommended caregivers
  const caregiverMap: { [key: string]: CaregiverDetail } = {
    '1': {
      id: '1',
      name: 'Mai',
      age: 35,
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
      rating: 4.9,
      gender: 'female',
      specialties: ['Cao đẳng Điều dưỡng', 'Chăm sóc đái tháo đường'],
      description: 'Tôi là một điều dưỡng viên có kinh nghiệm với 10 năm làm việc trong lĩnh vực chăm sóc người cao tuổi. Đặc biệt chuyên về chăm sóc bệnh nhân đái tháo đường và các vấn đề về tim mạch.',
      education: [
        'Cao đẳng Điều dưỡng - ĐH Y Dược TP.HCM (2013)',
        'Chứng chỉ Chăm sóc đái tháo đường - Bệnh viện Chợ Rẫy (2015)',
      ],
      certifications: [
        'Chứng chỉ Sơ cấp cứu',
        'Chứng chỉ Chăm sóc bệnh nhân đái tháo đường',
        'Chứng chỉ Điều dưỡng viên hành nghề',
      ],
      languages: ['Tiếng Việt', 'Tiếng Anh giao tiếp'],
      experience: '10 năm kinh nghiệm',
      location: 'Quận 1, TP.HCM',
      phone: '0901 234 567',
      email: 'mai.nurse@gmail.com',
      reviews: [
        {
          id: '1',
          userName: 'Gia đình Nguyễn',
          userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
          rating: 5,
          comment: 'Chị Mai rất tận tâm và chuyên nghiệp. Mẹ tôi rất yêu quý chị.',
          date: '2 tuần trước',
        },
        {
          id: '2',
          userName: 'Gia đình Trần',
          userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
          rating: 5,
          comment: 'Có kiến thức y tế tốt, rất đáng tin cậy.',
          date: '1 tháng trước',
        },
      ],
    },
    '2': {
      id: '2',
      name: 'Hùng',
      age: 42,
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face',
      rating: 4.8,
      gender: 'male',
      specialties: ['Vật lý trị liệu', 'Phục hồi chức năng'],
      description: 'Chuyên viên vật lý trị liệu với 15 năm kinh nghiệm. Chuyên về phục hồi chức năng vận động cho người cao tuổi sau tai biến và chấn thương.',
      education: [
        'Cử nhân Vật lý trị liệu - ĐH Y Hà Nội (2008)',
        'Thạc sĩ Phục hồi chức năng - ĐH Y Dược TP.HCM (2015)',
      ],
      certifications: [
        'Chứng chỉ Vật lý trị liệu viên',
        'Chứng chỉ Phục hồi chức năng nâng cao',
        'Chứng chỉ Massage trị liệu',
      ],
      languages: ['Tiếng Việt'],
      experience: '15 năm kinh nghiệm',
      location: 'Quận 3, TP.HCM',
      phone: '0902 345 678',
      email: 'hung.physio@gmail.com',
      reviews: [
        {
          id: '1',
          userName: 'Gia đình Lê',
          userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
          rating: 5,
          comment: 'Anh Hùng giúp bố tôi phục hồi rất tốt sau tai biến.',
          date: '3 tuần trước',
        },
      ],
    },
    '3': {
      id: '3',
      name: 'Linh',
      age: 28,
      avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150&h=150&fit=crop&crop=face',
      rating: 4.7,
      gender: 'female',
      specialties: ['Chăm sóc sau phẫu thuật', 'Y tế tại nhà'],
      description: 'Điều dưỡng viên chuyên về chăm sóc sau phẫu thuật và chăm sóc y tế tại nhà. Tận tâm và chu đáo trong công việc.',
      education: [
        'Cử nhân Điều dưỡng - ĐH Y Dược Thái Nguyên (2018)',
      ],
      certifications: [
        'Chứng chỉ Điều dưỡng viên',
        'Chứng chỉ Chăm sóc sau phẫu thuật',
        'Chứng chỉ Sơ cấp cứu',
      ],
      languages: ['Tiếng Việt', 'Tiếng Anh'],
      experience: '5 năm kinh nghiệm',
      location: 'Quận 7, TP.HCM',
      phone: '0903 456 789',
      email: 'linh.nurse@gmail.com',
      reviews: [
        {
          id: '1',
          userName: 'Gia đình Phạm',
          userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
          rating: 5,
          comment: 'Chị Linh chăm sóc mẹ tôi sau phẫu thuật rất tốt.',
          date: '1 tuần trước',
        },
      ],
    },
    '4': {
      id: '4',
      name: 'Nam',
      age: 38,
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
      rating: 4.8,
      gender: 'male',
      specialties: ['Chăm sóc bệnh Alzheimer', 'Hỗ trợ di chuyển'],
      description: 'Chuyên viên chăm sóc người cao tuổi với chuyên môn về bệnh Alzheimer và sa sút trí tuệ. Kiên nhẫn và hiểu biết sâu về tâm lý người bệnh.',
      education: [
        'Cử nhân Điều dưỡng - ĐH Y Huế (2010)',
        'Chứng chỉ Chăm sóc bệnh Alzheimer - Singapore (2016)',
      ],
      certifications: [
        'Chứng chỉ Chăm sóc người cao tuổi',
        'Chứng chỉ Chăm sóc bệnh Alzheimer',
        'Chứng chỉ Hỗ trợ di chuyển an toàn',
      ],
      languages: ['Tiếng Việt'],
      experience: '12 năm kinh nghiệm',
      location: 'Quận Bình Thạnh, TP.HCM',
      phone: '0904 567 890',
      email: 'nam.caregiver@gmail.com',
      reviews: [
        {
          id: '1',
          userName: 'Gia đình Hoàng',
          userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
          rating: 5,
          comment: 'Anh Nam rất kiên nhẫn với bà tôi bị Alzheimer.',
          date: '2 tuần trước',
        },
      ],
    },
  };

  const caregiver = caregiverMap[id as string] || caregiverMap['1'];

  const handleBook = () => {
    setShowBookingModal(true);
  };

  const handleCall = () => {
    console.log('handleCall clicked', caregiver.name);
    try {
      router.push({
        pathname: '/careseeker/video-call',
        params: {
          caregiverId: caregiver.id,
          caregiverName: caregiver.name,
        }
      });
    } catch (error) {
      console.error('Error opening video call:', error);
      Alert.alert('Lỗi', 'Không thể thực hiện cuộc gọi');
    }
  };

  const handleChat = () => {
    console.log('handleChat clicked', caregiver.id, caregiver.name);
    try {
      router.push({
        pathname: '/careseeker/chat',
        params: {
          caregiverId: caregiver.id,
          caregiverName: caregiver.name,
        }
      });
    } catch (error) {
      console.error('Error navigating to chat:', error);
      Alert.alert('Lỗi', 'Không thể mở trang chat');
    }
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
          <View style={styles.reviewAvatarPlaceholder}>
            <ThemedText style={styles.reviewAvatarText}>
              {review.userName.charAt(0)}
            </ThemedText>
          </View>
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
        </View>
        
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: caregiver.avatar }} style={styles.avatar} />
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
          </View>
          
          <View style={styles.profileInfo}>
            <ThemedText style={styles.caregiverName}>{caregiver.name}, {caregiver.age}</ThemedText>
            <View style={styles.ratingContainer}>
              <View style={styles.ratingStars}>
                {renderStars(caregiver.rating)}
              </View>
              <ThemedText style={styles.ratingText}>
                {caregiver.rating} ({caregiver.reviews.length} đánh giá)
              </ThemedText>
            </View>
            <ThemedText style={styles.experience}>{caregiver.experience}</ThemedText>
            <ThemedText style={styles.location}>📍 {caregiver.location}</ThemedText>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.chatButton} 
            onPress={handleChat}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#68C2E8" />
            <ThemedText style={styles.chatButtonText}>Chat</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.callButton} 
            onPress={handleCall}
            activeOpacity={0.7}
          >
            <Ionicons name="call-outline" size={20} color="white" />
            <ThemedText style={styles.callButtonText}>Gọi</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.bookButton} 
            onPress={handleBook}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={20} color="white" />
            <ThemedText style={styles.bookButtonText}>Đặt lịch</ThemedText>
          </TouchableOpacity>
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
              Đánh giá ({caregiver.reviews.length})
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
                  <Ionicons name="school-outline" size={16} color="#68C2E8" />
                  <ThemedText style={styles.educationText}>{edu}</ThemedText>
                </View>
              ))}
            </View>

            {/* Certifications */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Chứng chỉ</ThemedText>
              {caregiver.certifications.map((cert, index) => (
                <View key={index} style={styles.certificationItem}>
                  <Ionicons name="ribbon-outline" size={16} color="#68C2E8" />
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

            {/* Contact */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Liên hệ</ThemedText>
              <View style={styles.contactItem}>
                <Ionicons name="call-outline" size={16} color="#68C2E8" />
                <ThemedText style={styles.contactText}>{caregiver.phone}</ThemedText>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="mail-outline" size={16} color="#68C2E8" />
                <ThemedText style={styles.contactText}>{caregiver.email}</ThemedText>
              </View>
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
        caregiver={caregiver as any}
        elderlyProfiles={elderlyProfiles}
        immediateOnly={true}
      />

      <SimpleNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#68C2E8',
    paddingTop: 30,
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
  placeholder: {
    width: 40,
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
    borderColor: '#68C2E8',
    gap: 8,
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#68C2E8',
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
    backgroundColor: '#68C2E8',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
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
    borderBottomColor: '#68C2E8',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6c757d',
  },
  activeTabText: {
    color: '#68C2E8',
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
    borderWidth: 1,
    borderColor: '#68C2E8',
  },
  specialtyText: {
    fontSize: 14,
    color: '#68C2E8',
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
    borderColor: '#68C2E8',
  },
  languageText: {
    fontSize: 14,
    color: '#68C2E8',
    fontWeight: '500',
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
  reviewsContent: {
    backgroundColor: 'white',
    paddingBottom: 100,
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
  reviewAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#68C2E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reviewAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
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

