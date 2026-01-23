import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Linking,
    Platform,
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
import { caregiverService } from '@/services/caregiver.service';
import { chatService } from '@/services/chat.service';
// TODO: Replace with API call
// import { useElderlyProfiles } from '@/hooks/useDatabaseEntities';

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
  // TODO: Replace with API call
  // const { profiles: elderlyProfiles } = useElderlyProfiles(user?.id || '');
  // Mock data tạm thời
  const elderlyProfiles: any[] = [
    { id: 'elderly-1', name: 'Bà Nguyễn Thị Mai', age: 75 },
    { id: 'elderly-2', name: 'Ông Trần Văn Nam', age: 80 },
  ];
  const [selectedTab, setSelectedTab] = useState<'info' | 'reviews'>('info');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const params = useLocalSearchParams();
  
  // Log all params
  console.log('=== CAREGIVER DETAIL SCREEN PARAMS ===');
  console.log('All params:', JSON.stringify(params, null, 2));
  console.log('Params keys:', Object.keys(params));
  
  // Extract individual params
  const id = params.id;
  const caregiverParam = params.caregiver;
  const profileParam = params.profile;
  const profileDataParam = params.profileData;
  const avatarUrlParam = params.avatarUrl; // Lấy avatarUrl riêng nếu có
  
  console.log('id:', id);
  console.log('caregiver (raw):', caregiverParam);
  console.log('profile (raw):', profileParam);
  console.log('profileData (raw):', profileDataParam);
  console.log('avatarUrl (from params):', avatarUrlParam);
  
  // Try to parse if they are strings
  let caregiverParsed = null;
  let profileParsed = null;
  let profileDataParsed = null;
  
  if (caregiverParam) {
    try {
      // Parse JSON string
      let parsed = typeof caregiverParam === 'string' ? JSON.parse(caregiverParam) : caregiverParam;
      
      // Kiểm tra và decode URL nếu bị encode (expo-router có thể encode params)
      if (parsed.avatarUrl && typeof parsed.avatarUrl === 'string') {
        // Nếu URL có %2F hoặc các ký tự encoded khác, có thể đã bị encode
        // Nhưng với Firebase Storage, URL gốc đã có %2F, nên không decode
        // Chỉ decode nếu URL bị double encode (có %252F thay vì %2F)
        if (parsed.avatarUrl.includes('%252F')) {
          // Double encoded, decode một lần
          parsed.avatarUrl = decodeURIComponent(parsed.avatarUrl);
          console.log('URL đã được decode (double encode):', parsed.avatarUrl);
        } else {
          // URL đã đúng format, giữ nguyên
          console.log('URL giữ nguyên:', parsed.avatarUrl);
        }
      }
      
      caregiverParsed = parsed;
      console.log('caregiver (parsed):', JSON.stringify(caregiverParsed, null, 2));
    } catch (e) {
      console.log('Failed to parse caregiver:', e);
    }
  }
  
  if (profileParam) {
    try {
      profileParsed = typeof profileParam === 'string' ? JSON.parse(profileParam) : profileParam;
      console.log('profile (parsed):', JSON.stringify(profileParsed, null, 2));
    } catch (e) {
      console.log('Failed to parse profile:', e);
    }
  }
  
  if (profileDataParam) {
    try {
      profileDataParsed = typeof profileDataParam === 'string' ? JSON.parse(profileDataParam) : profileDataParam;
      console.log('profileData (parsed):', JSON.stringify(profileDataParsed, null, 2));
    } catch (e) {
      console.log('Failed to parse profileData:', e);
    }
  }
  
  // Log all other params
  Object.keys(params).forEach(key => {
    if (!['id', 'caregiver', 'profile', 'profileData'].includes(key)) {
      console.log(`${key}:`, params[key]);
    }
  });
  
  console.log('=== END PARAMS LOG ===');

  // Map data từ params vào CaregiverDetail interface
  const mapCaregiverFromParams = (): CaregiverDetail | null => {
    if (!caregiverParsed) {
      return null;
    }

    const cg = caregiverParsed as any;
    
    // Log avatar URL để debug
    console.log('=== AVATAR URL DEBUG ===');
    console.log('cg.avatarUrl (from parsed):', cg.avatarUrl);
    console.log('avatarUrlParam (from params):', avatarUrlParam);
    
    // Ưu tiên lấy avatarUrl từ params riêng (không bị encode trong JSON)
    // Nếu không có thì lấy từ object parsed
    let avatarUrl = (avatarUrlParam && typeof avatarUrlParam === 'string' && avatarUrlParam.startsWith('http')) 
      ? avatarUrlParam 
      : (cg.avatarUrl || 'https://via.placeholder.com/150');
    
    // Xử lý URL Firebase Storage: nếu có /o/ và phần sau có / (chưa encode), encode lại thành %2F
    if (avatarUrl && typeof avatarUrl === 'string' && avatarUrl.includes('/o/')) {
      const parts = avatarUrl.split('/o/');
      if (parts.length === 2) {
        const pathAfterO = parts[1];
        // Nếu có / chưa được encode (không phải %2F), encode lại
        if (pathAfterO.includes('/') && !pathAfterO.includes('%2F')) {
          const encodedPath = pathAfterO.replace(/\//g, '%2F');
          avatarUrl = `${parts[0]}/o/${encodedPath}`;
          console.log('URL đã được encode lại:', avatarUrl);
        } else {
          console.log('URL đã đúng format (có %2F):', avatarUrl);
        }
      }
    }
    
    console.log('avatarUrl (final - using):', avatarUrl);
    console.log('avatarUrl starts with http?', avatarUrl?.startsWith('http'));
    console.log('=== END AVATAR DEBUG ===');
    
    // Lấy rating và total reviews
    const ratingsReviews = cg.profileData?.ratings_reviews;
    const rating = ratingsReviews?.overall_rating || 0;
    const totalReviews = ratingsReviews?.total_reviews || 0;
    
    // Lấy years_experience
    const yearsExperience = cg.profileData?.years_experience || cg.years_experience;
    const experienceText = yearsExperience ? `${yearsExperience} năm kinh nghiệm` : 'Chưa có thông tin';
    
    // Lấy certifications từ qualifications (chỉ lấy những cái không bị deleted và đã approved)
    const certifications = (cg.qualifications || [])
      .filter((q: any) => !q.deleted && q.status === 'APPROVED')
      .map((q: any) => q.qualificationTypeName);
    
    // Lấy specialties từ qualifications (có thể dùng chung với certifications)
    const specialties = certifications.length > 0 ? certifications : ['Chăm sóc người cao tuổi'];
    
    // Lấy education từ qualifications
    const education = (cg.qualifications || [])
      .filter((q: any) => !q.deleted)
      .map((q: any) => {
        const org = q.issuingOrganization || '';
        const date = q.issueDate ? new Date(q.issueDate).getFullYear() : '';
        return `${q.qualificationTypeName}${org ? ` - ${org}` : ''}${date ? ` (${date})` : ''}`;
      });
    
    // Location
    const location = cg.location?.address || 'Chưa có địa chỉ';
    
    // Languages - có thể để trống hoặc lấy từ profileData nếu có
    const languages: string[] = ['Tiếng Việt']; // Default
    
    // Reviews - để mảng rỗng vì không có trong API response, nhưng lưu totalReviews để hiển thị
    const reviews: Review[] = [];
    // Lưu totalReviews vào một property tạm để dùng sau
    (reviews as any).totalReviews = totalReviews;

    // Lấy lịch rảnh từ profileData
    const freeSchedule = cg.profileData?.free_schedule;
    const availableAllTime = freeSchedule?.available_all_time || false;
    const bookedSlots = freeSchedule?.booked_slots || [];
    
    // Lấy các thông tin thống kê
    const totalCompletedBookings = cg.totalCompletedBookings || 0;
    const totalEarnings = cg.totalEarnings || 0;
    const taskCompletionRate = cg.taskCompletionRate || 0;

    return {
      id: cg.caregiverProfileId || id || '',
      name: cg.fullName || params.caregiverName || '',
      age: cg.age || 0,
      avatar: avatarUrl, // URL gốc - không decode/encode
      rating: rating,
      gender: (cg.gender === 'MALE' ? 'male' : cg.gender === 'FEMALE' ? 'female' : 'male') as 'male' | 'female',
      specialties: specialties,
      description: cg.bio || 'Không có thông tin',
      education: education,
      certifications: certifications, // Đã filter APPROVED
      languages: languages,
      experience: experienceText,
      location: location,
      locationLat: cg.location?.latitude,
      locationLng: cg.location?.longitude,
      phone: cg.phoneNumber || 'Không có thông tin',
      email: cg.email || 'Không có thông tin',
      reviews: reviews,
      // Thêm các field mới
      totalReviews: totalReviews,
      isVerified: cg.isVerified || false,
      availableAllTime: availableAllTime,
      bookedSlots: bookedSlots,
      totalCompletedBookings: totalCompletedBookings,
      totalEarnings: totalEarnings,
      taskCompletionRate: taskCompletionRate,
      ratingsReviews: ratingsReviews, // Lưu toàn bộ ratings_reviews
    } as CaregiverDetail & { 
      totalReviews: number;
      isVerified: boolean;
      locationLat?: number;
      locationLng?: number;
      availableAllTime: boolean;
      bookedSlots: any[];
      totalCompletedBookings: number;
      totalEarnings: number;
      taskCompletionRate: number;
      ratingsReviews?: any;
    };
  };

  // Lấy caregiver data từ params hoặc fallback về mock data
  const caregiverFromParams = mapCaregiverFromParams();
  
  // Mock caregiver data - fallback nếu không có params
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
      reviews: [],
    },
  };

  const caregiver = caregiverFromParams || caregiverMap[id as string] || caregiverMap['1'];

  const handleBook = () => {
    setShowBookingModal(true);
  };


  const handleChat = async () => {
    try {
      // caregiver.id là caregiverProfileId, cần lấy accountId
      // Gọi API để lấy chi tiết caregiver (có accountId)
      const caregiverDetail = await caregiverService.getPublicCaregiverById(caregiver.id);

      // Lấy accountId từ response
      const accountId = caregiverDetail.accountId;

      if (!accountId) {
        throw new Error('AccountId not found');
      }

      // Gọi API để lấy chatId với accountId (receiverId)
      const chatIdResponse = await chatService.getChatId(accountId);

      const chatId = chatIdResponse.chatId || chatIdResponse.id;

      // Navigate đến chat screen với chatId
      router.push({
        pathname: '/careseeker/chat',
        params: {
          chatId: chatId,
          caregiverId: caregiver.id, // caregiverProfileId
          accountId: accountId, // accountId
          caregiverName: caregiver.name,
          caregiverAvatar: caregiver.avatar,
        }
      });
    } catch (error: any) {
      console.error('Error navigating to chat:', error);
      // Nếu API fail, vẫn navigate với caregiverId (fallback)
      router.push({
        pathname: '/careseeker/chat',
        params: {
          caregiverId: caregiver.id,
          caregiverName: caregiver.name,
          caregiverAvatar: caregiver.avatar,
        }
      });
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
            {caregiver.avatar && caregiver.avatar !== 'https://via.placeholder.com/150' ? (
              <Image 
                source={{ uri: caregiver.avatar }} 
                style={styles.avatar}
                resizeMode="cover"
                onError={(e) => {
                  console.error('Image load error:', e.nativeEvent.error);
                  console.error('Failed URL:', caregiver.avatar);
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', caregiver.avatar);
                }}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={40} color="#68C2E8" />
              </View>
            )}
            {(caregiver as any).isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={16} color="white" />
              </View>
            )}
          </View>
          
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <ThemedText style={styles.caregiverName}>{caregiver.name}, {caregiver.age}</ThemedText>
              {(caregiver as any).isVerified && (
                <View style={styles.verifiedLabel}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <ThemedText style={styles.verifiedText}>Đã xác thực</ThemedText>
                </View>
              )}
            </View>
            <View style={styles.ratingContainer}>
              <View style={styles.ratingStars}>
                {renderStars(caregiver.rating)}
              </View>
              <ThemedText style={styles.ratingText}>
                {caregiver.rating} ({(caregiver as any).totalReviews || caregiver.reviews.length || 0} đánh giá)
              </ThemedText>
            </View>
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
              Đánh giá
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {selectedTab === 'info' ? (
          <View style={styles.infoContent}>
            {/* Basic Information */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Thông tin cơ bản</ThemedText>
              
              {/* Gender */}
              <View style={styles.basicInfoItem}>
                <Ionicons name="person-outline" size={16} color="#68C2E8" />
                <View style={styles.basicInfoContent}>
                  <ThemedText style={styles.basicInfoLabel}>Giới tính:</ThemedText>
                  <ThemedText style={styles.basicInfoText}>
                    {caregiver.gender === 'male' ? 'Nam' : 'Nữ'}
                  </ThemedText>
                </View>
              </View>

              {/* Experience */}
              <View style={styles.basicInfoItem}>
                <Ionicons name="briefcase-outline" size={16} color="#68C2E8" />
                <View style={styles.basicInfoContent}>
                  <ThemedText style={styles.basicInfoLabel}>Năm kinh nghiệm:</ThemedText>
                  <ThemedText style={styles.basicInfoText}>
                    {caregiver.experience || 'Không có thông tin'}
                  </ThemedText>
                </View>
              </View>

              {/* Location */}
              <View style={styles.basicInfoItem}>
                <Ionicons name="location-outline" size={16} color="#68C2E8" />
                <View style={styles.basicInfoContent}>
                  <ThemedText style={styles.basicInfoLabel}>Vị trí:</ThemedText>
                  {(caregiver as any).locationLat && (caregiver as any).locationLng ? (
                    <TouchableOpacity 
                      style={styles.locationButtonInline}
                      onPress={() => {
                        const lat = (caregiver as any).locationLat;
                        const lng = (caregiver as any).locationLng;
                        // URL để chỉ hiển thị vị trí, không bắt đầu navigation
                        const url = Platform.select({
                          ios: `maps://maps.google.com/maps?q=${lat},${lng}`,
                          android: `geo:${lat},${lng}?q=${lat},${lng}`,
                        });
                        // Fallback web URL
                        const webUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
                        if (url) {
                          Linking.canOpenURL(url).then((supported) => {
                            if (supported) {
                              Linking.openURL(url);
                            } else {
                              Linking.openURL(webUrl);
                            }
                          }).catch(() => {
                            Linking.openURL(webUrl);
                          });
                        } else {
                          Linking.openURL(webUrl);
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="location" size={16} color="#68C2E8" />
                      <ThemedText style={styles.locationButtonTextInline}>Xem vị trí</ThemedText>
                    </TouchableOpacity>
                  ) : (
                    <ThemedText style={styles.basicInfoText}>
                      {caregiver.location || 'Không có thông tin'}
                    </ThemedText>
                  )}
                </View>
              </View>

              {/* Phone */}
              <View style={styles.basicInfoItem}>
                <Ionicons name="call-outline" size={16} color="#68C2E8" />
                <View style={styles.basicInfoContent}>
                  <ThemedText style={styles.basicInfoLabel}>Số điện thoại:</ThemedText>
                  <ThemedText style={styles.basicInfoText}>
                    {caregiver.phone && caregiver.phone !== 'Không có thông tin' 
                      ? caregiver.phone 
                      : 'Không có thông tin'}
                  </ThemedText>
                </View>
              </View>

              {/* Email */}
              <View style={[styles.basicInfoItem, styles.basicInfoItemLast]}>
                <Ionicons name="mail-outline" size={16} color="#68C2E8" />
                <View style={styles.basicInfoContent}>
                  <ThemedText style={styles.basicInfoLabel}>Email:</ThemedText>
                  <ThemedText style={styles.basicInfoText}>
                    {caregiver.email && caregiver.email !== 'Không có thông tin' 
                      ? caregiver.email 
                      : 'Không có thông tin'}
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Giới thiệu</ThemedText>
              <ThemedText style={styles.sectionContent}>{caregiver.description}</ThemedText>
            </View>

            {/* Statistics */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Thống kê</ThemedText>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#28a745" />
                  <View style={styles.statInfo}>
                    <ThemedText style={styles.statLabel}>Đã hoàn thành</ThemedText>
                    <ThemedText style={styles.statValue}>{(caregiver as any).totalCompletedBookings || 0} lịch hẹn</ThemedText>
                  </View>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="trending-up" size={20} color="#68C2E8" />
                  <View style={styles.statInfo}>
                    <ThemedText style={styles.statLabel}>Tỷ lệ hoàn thành nhiệm vụ</ThemedText>
                    <ThemedText style={styles.statValue}>{((caregiver as any).taskCompletionRate || 0).toFixed(1)}%</ThemedText>
                  </View>
                </View>
              </View>
            </View>

            {/* Availability */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Lịch bận</ThemedText>
              <View style={styles.availabilityContainer}>
                <Ionicons name="calendar" size={16} color="#68C2E8" />
                <View style={styles.availabilityTextContainer}>
                  {(caregiver as any).availableAllTime ? (
                    <ThemedText style={styles.availabilityText}>Rảnh tất cả thời gian</ThemedText>
                  ) : (caregiver as any).bookedSlots?.length > 0 ? (
                    <View style={styles.bookedSlotsList}>
                      {(caregiver as any).bookedSlots.map((slot: any, index: number) => (
                        <View key={index} style={styles.bookedSlotItem}>
                          <Ionicons name="time" size={14} color="#F59E0B" />
                          <ThemedText style={styles.bookedSlotText}>
                            {slot.date ? new Date(slot.date).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' }) : ''} {slot.start_time || ''} - {slot.end_time || ''}
                          </ThemedText>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <ThemedText style={styles.availabilityText}>Người này không có lịch bận trong 7 ngày tới</ThemedText>
                  )}
                </View>
              </View>
            </View>

            {/* Certifications */}
            <View style={[styles.section, styles.lastSection]}>
              <ThemedText style={styles.sectionTitle}>Chứng chỉ</ThemedText>
              {caregiver.certifications && caregiver.certifications.length > 0 ? (
                caregiver.certifications.map((cert, index) => (
                  <View key={index} style={styles.certificationItem}>
                    <Ionicons name="ribbon-outline" size={16} color="#68C2E8" />
                    <ThemedText style={styles.certificationText}>{cert}</ThemedText>
                  </View>
                ))
              ) : (
                <ThemedText style={styles.emptyText}>Không có thông tin</ThemedText>
              )}
            </View>

          </View>
        ) : (
          <View style={styles.reviewsContent}>
            {(caregiver as any).ratingsReviews ? (
              <View>
                {/* Overall Rating */}
                <View style={styles.section}>
                  <ThemedText style={styles.sectionTitle}>Đánh giá tổng quan</ThemedText>
                  <View style={styles.overallRatingContainer}>
                    <View style={styles.overallRatingRow}>
                      <ThemedText style={styles.overallRatingNumber}>
                        {((caregiver as any).ratingsReviews.overall_rating || 0).toFixed(1)}
                      </ThemedText>
                      <View style={styles.overallRatingStars}>
                        {renderStars((caregiver as any).ratingsReviews.overall_rating || 0)}
                      </View>
                    </View>
                    <ThemedText style={styles.totalReviewsText}>
                      Dựa trên {(caregiver as any).ratingsReviews.total_reviews || 0} đánh giá
                    </ThemedText>
                  </View>
                </View>

                {/* Rating Breakdown */}
                {(caregiver as any).ratingsReviews.rating_breakdown && (
                  <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Phân bổ đánh giá</ThemedText>
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = (caregiver as any).ratingsReviews.rating_breakdown[`${star}_star`] || 0;
                      const total = (caregiver as any).ratingsReviews.total_reviews || 1;
                      const percentage = total > 0 ? (count / total) * 100 : 0;
                      return (
                        <View key={star} style={styles.ratingBreakdownItem}>
                          <ThemedText style={styles.ratingBreakdownStar}>{star} sao</ThemedText>
                          <View style={styles.ratingBreakdownBar}>
                            <View style={[styles.ratingBreakdownBarFill, { width: `${percentage}%` }]} />
                          </View>
                          <ThemedText style={styles.ratingBreakdownCount}>{count}</ThemedText>
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* Detailed Ratings */}
                {(caregiver as any).ratingsReviews.detailed_ratings_breakdown && (
                  <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Đánh giá chi tiết</ThemedText>
                    <View style={styles.detailedRatingsContainer}>
                      {[
                        { key: 'quality', label: 'Chất lượng' },
                        { key: 'attitude', label: 'Thái độ' },
                        { key: 'punctuality', label: 'Đúng giờ' },
                        { key: 'professionalism', label: 'Chuyên nghiệp' },
                      ].map((item) => {
                        const rating = (caregiver as any).ratingsReviews.detailed_ratings_breakdown[item.key] || 0;
                        return (
                          <View key={item.key} style={styles.detailedRatingItem}>
                            <ThemedText style={styles.detailedRatingLabel}>{item.label}</ThemedText>
                            <View style={styles.detailedRatingStars}>
                              {renderStars(rating)}
                            </View>
                            <ThemedText style={styles.detailedRatingValue}>{rating.toFixed(1)}</ThemedText>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.emptyReviewsContainer}>
                <ThemedText style={styles.emptyReviewsText}>Không có thông tin</ThemedText>
              </View>
            )}
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
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 0.5,
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
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F4FC',
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  caregiverName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginRight: 8,
  },
  verifiedLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  genderText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
    gap: 6,
    alignSelf: 'flex-start',
  },
  locationButtonText: {
    fontSize: 14,
    color: '#68C2E8',
    fontWeight: '600',
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
    justifyContent: 'space-between',
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
    marginRight: 6,
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#68C2E8',
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
    marginLeft: 6,
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
  contactSection: {
    marginBottom: 100,
  },
  basicInfoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  basicInfoItemLast: {
    marginBottom: 0,
  },
  basicInfoContent: {
    flex: 1,
  },
  basicInfoLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  basicInfoText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  locationButtonInline: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#68C2E8',
    marginTop: 4,
  },
  locationButtonTextInline: {
    fontSize: 14,
    color: '#68C2E8',
    fontWeight: '600',
  },
  lastSection: {
    marginBottom: 100,
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
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
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
  emptyReviewsContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyReviewsText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  overallRatingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  overallRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 16,
  },
  overallRatingNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2c3e50',
    lineHeight: 56,
  },
  overallRatingStars: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  totalReviewsText: {
    fontSize: 14,
    color: '#6c757d',
  },
  ratingBreakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  ratingBreakdownStar: {
    fontSize: 14,
    color: '#2c3e50',
    width: 50,
  },
  ratingBreakdownBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  ratingBreakdownBarFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  ratingBreakdownCount: {
    fontSize: 14,
    color: '#2c3e50',
    width: 30,
    textAlign: 'right',
  },
  detailedRatingsContainer: {
    gap: 16,
  },
  detailedRatingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailedRatingLabel: {
    fontSize: 14,
    color: '#2c3e50',
    width: 100,
  },
  detailedRatingStars: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  detailedRatingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    width: 40,
    textAlign: 'right',
  },
  emptyText: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  statsContainer: {
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  availabilityTextContainer: {
    flex: 1,
  },
  availabilityText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  bookedSlotsList: {
    flex: 1,
    gap: 8,
  },
  bookedSlotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bookedSlotText: {
    fontSize: 14,
    color: '#2c3e50',
  },
});

