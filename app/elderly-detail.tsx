import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CaregiverCard, type Caregiver } from '@/components/caregiver/CaregiverCard';
import { ThemedText } from '@/components/themed-text';
import { ElderlyProfile } from '@/types/elderly';
import {
    renderEnvironmentTab,
    renderIndependenceTab,
    renderMedicalTab,
    renderNeedsTab,
    renderPreferencesTab
} from './elderly-profile-tabs';


export default function ElderlyDetailScreen() {
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - in real app, this would come from API based on id
  const elderlyProfile: ElderlyProfile = {
    id: id as string,
    name: 'Bà Nguyễn Thị Lan',
    age: 75,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    healthStatus: 'fair',
    currentCaregivers: 1,
    family: 'Gia đình Nguyễn',
    personalInfo: {
      name: 'Bà Nguyễn Thị Lan',
      age: 75,
      phoneNumber: '0901 234 567',
      address: '123 Đường ABC, Quận 1, TP.HCM',
    },
    medicalConditions: {
      underlyingDiseases: ['Cao huyết áp', 'Tiểu đường'],
      specialConditions: ['Suy giảm trí nhớ nhẹ'],
      allergies: ['Dị ứng hải sản'],
      medications: [
        { name: 'Metformin', dosage: '500mg', frequency: '2 lần/ngày' },
        { name: 'Lisinopril', dosage: '10mg', frequency: '1 lần/ngày' }
      ],
    },
    independenceLevel: {
      eating: 'assisted',
      bathing: 'assisted',
      mobility: 'independent',
      toileting: 'assisted',
      dressing: 'independent',
    },
    careNeeds: {
      conversation: true,
      reminders: true,
      dietSupport: true,
      exercise: false,
      medicationManagement: true,
      companionship: true,
    },
    preferences: {
      hobbies: ['Nghe nhạc', 'Đọc sách'],
      favoriteActivities: ['Đi dạo', 'Trò chuyện'],
      foodPreferences: ['Cháo', 'Rau xanh'],
    },
    livingEnvironment: {
      houseType: 'private_house',
      livingWith: ['Con trai', 'Con dâu'],
      surroundings: 'Khu dân cư yên tĩnh',
      accessibility: ['Tay vịn cầu thang', 'Nhà vệ sinh rộng rãi', 'Cửa rộng'],
    },
  };

  // Helper functions
  const getHealthStatusColor = (status: ElderlyProfile['healthStatus']) => {
    switch (status) {
      case 'good': return '#28a745';
      case 'fair': return '#ffc107';
      case 'poor': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getHealthStatusText = (status: ElderlyProfile['healthStatus']) => {
    switch (status) {
      case 'good': return 'Tốt';
      case 'fair': return 'Trung bình';
      case 'poor': return 'Yếu';
      default: return 'Không rõ';
    }
  };

  // Overview tab renderer
  const renderOverviewTab = (profile: ElderlyProfile) => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Thông tin cơ bản</ThemedText>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar" size={16} color="#6c757d" />
            <View style={styles.infoTextContainer}>
              <ThemedText style={styles.infoLabel}>Ngày sinh</ThemedText>
              <ThemedText style={styles.infoValue}>15/03/1946</ThemedText>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="person" size={16} color="#6c757d" />
            <View style={styles.infoTextContainer}>
              <ThemedText style={styles.infoLabel}>Giới tính</ThemedText>
              <ThemedText style={styles.infoValue}>Nữ</ThemedText>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="call" size={16} color="#6c757d" />
            <View style={styles.infoTextContainer}>
              <ThemedText style={styles.infoLabel}>Số điện thoại</ThemedText>
              <ThemedText style={styles.infoValue}>{profile.personalInfo.phoneNumber}</ThemedText>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="location" size={16} color="#6c757d" />
            <View style={styles.infoTextContainer}>
              <ThemedText style={styles.infoLabel}>Địa chỉ</ThemedText>
              <ThemedText style={styles.infoValue} numberOfLines={2}>
                {profile.personalInfo.address}
              </ThemedText>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="fitness" size={16} color="#6c757d" />
            <View style={styles.infoTextContainer}>
              <ThemedText style={styles.infoLabel}>Cân nặng / Chiều cao</ThemedText>
              <ThemedText style={styles.infoValue}>58kg / 155cm</ThemedText>
            </View>
          </View>
        </View>
      </View>

      {/* Emergency Contact */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Người liên hệ khẩn cấp</ThemedText>
        <View style={styles.contactCard}>
          <View style={styles.contactIcon}>
            <Ionicons name="person" size={20} color="#4ECDC4" />
          </View>
          <View style={styles.contactInfo}>
            <ThemedText style={styles.contactName}>Nguyễn Văn Minh</ThemedText>
            <ThemedText style={styles.contactRelation}>Con trai</ThemedText>
            <ThemedText style={styles.contactPhone}>0901 234 568</ThemedText>
          </View>
        </View>
        
        <View style={styles.contactCard}>
          <View style={styles.contactIcon}>
            <Ionicons name="person" size={20} color="#4ECDC4" />
          </View>
          <View style={styles.contactInfo}>
            <ThemedText style={styles.contactName}>Nguyễn Thị Hoa</ThemedText>
            <ThemedText style={styles.contactRelation}>Con gái</ThemedText>
            <ThemedText style={styles.contactPhone}>0901 234 569</ThemedText>
          </View>
        </View>
      </View>
    </View>
  );

  // Caregivers tab renderer with data
  const renderCaregiversTab = (profile: ElderlyProfile) => {
    // Mock data for caregivers
    const caregivers: Caregiver[] = [
      {
        id: '1',
        name: 'Nguyễn Thị Mai',
        avatar: 'https://via.placeholder.com/60x60/4ECDC4/FFFFFF?text=MT',
        rating: 4.8,
        experience: '5 năm',
        specialties: ['Chăm sóc người già', 'Vật lý trị liệu'],
        hourlyRate: 200000,
        distance: '1.2 km',
        isVerified: true,
        totalReviews: 45
      },
      {
        id: '2',
        name: 'Trần Văn Nam',
        avatar: 'https://via.placeholder.com/60x60/FF6B6B/FFFFFF?text=TN',
        rating: 4.6,
        experience: '3 năm',
        specialties: ['Y tá', 'Chăm sóc y tế'],
        hourlyRate: 180000,
        distance: '2.1 km',
        isVerified: true,
        totalReviews: 32
      },
      {
        id: '3',
        name: 'Lê Thị Hoa',
        avatar: 'https://via.placeholder.com/60x60/4ECDC4/FFFFFF?text=LH',
        rating: 4.9,
        experience: '7 năm',
        specialties: ['Chăm sóc tâm lý', 'Hỗ trợ sinh hoạt'],
        hourlyRate: 220000,
        distance: '0.8 km',
        isVerified: true,
        totalReviews: 67
      },
      {
        id: '4',
        name: 'Phạm Văn Đức',
        avatar: 'https://via.placeholder.com/60x60/45B7D1/FFFFFF?text=PĐ',
        rating: 4.7,
        experience: '4 năm',
        specialties: ['Chăm sóc tại nhà', 'Hỗ trợ di chuyển'],
        hourlyRate: 190000,
        distance: '1.5 km',
        isVerified: true,
        totalReviews: 28
      }
    ];

    const handleCaregiverPress = (caregiver: any) => {
      router.push({
        pathname: '/caregiver-detail',
        params: {
          id: caregiver.id,
          name: caregiver.name,
          fromElderly: 'true'
        }
      });
    };

    return (
      <View style={styles.tabContent}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Danh sách người chăm sóc</ThemedText>
          <ThemedText style={styles.infoText}>
            Hiện có {caregivers.length} người chăm sóc đang phụ trách {profile.name}.
          </ThemedText>
        </View>
        
        <View style={styles.caregiversList}>
          {caregivers.map((caregiver) => (
            <View key={caregiver.id} style={styles.caregiverItem}>
              <CaregiverCard
                caregiver={caregiver}
                onPress={handleCaregiverPress}
                showActions={false}
              />
            </View>
          ))}
        </View>
      </View>
    );
  };

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
          <ThemedText style={styles.headerTitle}>Chi tiết người già</ThemedText>
          <ThemedText style={styles.headerSubtitle}>{elderlyProfile.name}</ThemedText>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: elderlyProfile.avatar }} style={styles.avatar} />
            <View style={[styles.statusIndicator, { backgroundColor: getHealthStatusColor(elderlyProfile.healthStatus) }]} />
          </View>
          
          <View style={styles.profileInfo}>
            <ThemedText style={styles.profileName}>{elderlyProfile.name}</ThemedText>
            <ThemedText style={styles.profileAge}>{elderlyProfile.age} tuổi</ThemedText>
            <ThemedText style={styles.profileFamily}>{elderlyProfile.family}</ThemedText>
            
            <View style={styles.healthStatus}>
              <Ionicons name="heart" size={16} color={getHealthStatusColor(elderlyProfile.healthStatus)} />
              <ThemedText style={[styles.healthStatusText, { color: getHealthStatusColor(elderlyProfile.healthStatus) }]}>
                Tình trạng: {getHealthStatusText(elderlyProfile.healthStatus)}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScrollView}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
              onPress={() => setActiveTab('overview')}
            >
              <ThemedText style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
                Tổng quan
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'medical' && styles.activeTab]}
              onPress={() => setActiveTab('medical')}
            >
              <ThemedText style={[styles.tabText, activeTab === 'medical' && styles.activeTabText]}>
                Y tế
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'independence' && styles.activeTab]}
              onPress={() => setActiveTab('independence')}
            >
              <ThemedText style={[styles.tabText, activeTab === 'independence' && styles.activeTabText]}>
                Tự lập
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'needs' && styles.activeTab]}
              onPress={() => setActiveTab('needs')}
            >
              <ThemedText style={[styles.tabText, activeTab === 'needs' && styles.activeTabText]}>
                Nhu cầu
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'preferences' && styles.activeTab]}
              onPress={() => setActiveTab('preferences')}
            >
              <ThemedText style={[styles.tabText, activeTab === 'preferences' && styles.activeTabText]}>
                Sở thích
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'environment' && styles.activeTab]}
              onPress={() => setActiveTab('environment')}
            >
              <ThemedText style={[styles.tabText, activeTab === 'environment' && styles.activeTabText]}>
                Môi trường
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, styles.lastTab, activeTab === 'caregivers' && styles.activeTab]}
              onPress={() => setActiveTab('caregivers')}
            >
              <ThemedText style={[styles.tabText, activeTab === 'caregivers' && styles.activeTabText]}>
                Người chăm sóc
              </ThemedText>
            </TouchableOpacity>
            
          </ScrollView>
        </View>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverviewTab(elderlyProfile)}
        {activeTab === 'medical' && renderMedicalTab(elderlyProfile)}
        {activeTab === 'independence' && renderIndependenceTab(elderlyProfile)}
        {activeTab === 'needs' && renderNeedsTab(elderlyProfile)}
        {activeTab === 'preferences' && renderPreferencesTab(elderlyProfile)}
        {activeTab === 'environment' && renderEnvironmentTab(elderlyProfile)}
        {activeTab === 'caregivers' && renderCaregiversTab(elderlyProfile)}
      </ScrollView>
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
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: 'white',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  profileAge: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 4,
  },
  profileFamily: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  healthStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthStatusText: {
    fontSize: 14,
    marginLeft: 4,
  },
  tabContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tabScrollView: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  lastTab: {
    marginRight: 16,
  },
  activeTab: {
    borderBottomColor: '#4ECDC4',
  },
  tabText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4ECDC4',
    fontWeight: 'bold',
  },
  tabContent: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  infoText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  caregiversList: {
    paddingHorizontal: 4,
  },
  caregiverItem: {
    marginBottom: 12,
  },
  contactCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  contactRelation: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '500',
  },
});
