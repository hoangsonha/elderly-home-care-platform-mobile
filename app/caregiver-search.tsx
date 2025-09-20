import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AIMatchingModal } from '@/components/caregiver/AIMatchingModal';
import { AIRecommendations } from '@/components/caregiver/AIRecommendations';
import { BookingModal } from '@/components/caregiver/BookingModal';
import { CaregiverCard, type Caregiver } from '@/components/caregiver/CaregiverCard';
import { SearchFilters, type FilterOption } from '@/components/caregiver/SearchFilters';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext';

// Mock data
const mockCaregivers: Caregiver[] = [
  {
    id: '1',
    name: 'Chị Nguyễn Thị Lan',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    rating: 4.9,
    experience: '5 năm',
    specialties: ['Chăm sóc người cao tuổi', 'Y tế cơ bản'],
    hourlyRate: 150000,
    distance: '2.5 km',
    isVerified: true,
    totalReviews: 127,
  },
  {
    id: '2',
    name: 'Chị Trần Văn Hoa',
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
    rating: 4.8,
    experience: '3 năm',
    specialties: ['Vật lý trị liệu', 'Chăm sóc sau phẫu thuật'],
    hourlyRate: 120000,
    distance: '1.8 km',
    isVerified: true,
    totalReviews: 89,
  },
  {
    id: '3',
    name: 'Anh Lê Minh Đức',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
    rating: 4.7,
    experience: '7 năm',
    specialties: ['Chăm sóc đặc biệt', 'Hỗ trợ di chuyển'],
    hourlyRate: 180000,
    distance: '3.2 km',
    isVerified: true,
    totalReviews: 203,
  },
];

const filterOptions: FilterOption[] = [
  { id: 'all', label: 'Tất cả', icon: 'grid' },
  { id: 'nearby', label: 'Gần nhất', icon: 'location' },
  { id: 'topRated', label: 'Đánh giá cao', icon: 'star' },
  { id: 'verified', label: 'Đã xác thực', icon: 'shield-checkmark' },
];

export default function CaregiverSearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [caregivers] = useState<Caregiver[]>(mockCaregivers);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<Caregiver[]>([]);
  const [showAIResults, setShowAIResults] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [showFloatingAI, setShowFloatingAI] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState<Caregiver | null>(null);
  const { user } = useAuth();

  // Mock elderly profiles data
  const elderlyProfiles = [
    {
      id: '1',
      name: 'Bà Nguyễn Thị Lan',
      age: 75,
      currentCaregivers: 1,
      family: 'Gia đình Nguyễn',
      healthStatus: 'fair' as const,
    },
    {
      id: '2',
      name: 'Ông Trần Văn Minh',
      age: 82,
      currentCaregivers: 0,
      family: 'Gia đình Trần',
      healthStatus: 'poor' as const,
    },
    {
      id: '3',
      name: 'Bà Lê Thị Hoa',
      age: 68,
      currentCaregivers: 2,
      family: 'Gia đình Lê',
      healthStatus: 'good' as const,
    },
  ];

  const handleCaregiverPress = (caregiver: Caregiver) => {
    router.push('/caregiver-detail');
  };

  const handleChatPress = (caregiver: Caregiver) => {
    router.push('/chat');
  };

  const handleBookNow = (caregiver: Caregiver) => {
    setSelectedCaregiver(caregiver);
    setShowBookingModal(true);
  };

  const handleAIMatching = () => {
    setShowAIModal(true);
  };

  const handleGetAIRecommendations = async (userInfo: any) => {
    setShowAIModal(false);
    setIsAILoading(true);
    setShowAIResults(true);

    // Simulate AI processing delay
    setTimeout(() => {
      // Mock AI recommendations based on user info
      const recommendations = generateAIRecommendations(userInfo);
      setAiRecommendations(recommendations);
      setIsAILoading(false);
    }, 2000);
  };

  const generateAIRecommendations = (userInfo: any): Caregiver[] => {
    // Mock AI logic - in real app, this would call AI API
    let filteredCaregivers = [...mockCaregivers];

    // Filter by special needs
    if (userInfo.specialNeeds && userInfo.specialNeeds.length > 0) {
      filteredCaregivers = filteredCaregivers.filter(caregiver => 
        userInfo.specialNeeds.some((need: string) => 
          caregiver.specialties.some(specialty => 
            specialty.toLowerCase().includes(need.toLowerCase())
          )
        )
      );
    }

    // Filter by experience level
    if (userInfo.experience) {
      const experienceYears = parseInt(userInfo.experience.split('-')[0]) || 0;
      filteredCaregivers = filteredCaregivers.filter(caregiver => {
        const caregiverExp = parseInt(caregiver.experience.split(' ')[0]);
        return caregiverExp >= experienceYears;
      });
    }

    // Filter by budget
    if (userInfo.budget) {
      const budgetRanges = {
        'low': 100000,
        'medium': 200000,
        'high': 300000,
        'premium': 500000
      };
      const maxRate = budgetRanges[userInfo.budget as keyof typeof budgetRanges] || 500000;
      filteredCaregivers = filteredCaregivers.filter(caregiver => 
        caregiver.hourlyRate <= maxRate
      );
    }

    // Sort by rating and return top 3
    return filteredCaregivers
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
  };

  const handleRefreshAI = () => {
    setIsAILoading(true);
    setTimeout(() => {
      // Re-generate recommendations
      const newRecommendations = generateAIRecommendations({});
      setAiRecommendations(newRecommendations);
      setIsAILoading(false);
    }, 1500);
  };



  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Tìm người chăm sóc</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Chào {user?.name || user?.email}!</ThemedText>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.aiButton} onPress={handleAIMatching}>
            <Ionicons name="sparkles" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên, kỹ năng, khu vực..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <SearchFilters
        filters={filterOptions}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
      />

      {/* Results */}
      {showAIResults ? (
        <AIRecommendations
          recommendations={aiRecommendations}
          onCaregiverPress={handleCaregiverPress}
          onBookPress={handleBookNow}
          onChatPress={handleChatPress}
          onRefresh={handleRefreshAI}
          isLoading={isAILoading}
        />
      ) : (
        <ScrollView
          style={styles.resultsContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.resultsHeader}>
            <ThemedText style={styles.resultsCount}>
              Tìm thấy {caregivers.length} người chăm sóc
            </ThemedText>
            <TouchableOpacity style={styles.sortButton}>
              <Ionicons name="swap-vertical" size={16} color="#667eea" />
              <ThemedText style={styles.sortButtonText}>Sắp xếp</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.caregiversList}>
            {caregivers.map((caregiver) => (
              <CaregiverCard
                key={caregiver.id}
                caregiver={caregiver}
                onPress={handleCaregiverPress}
                onBookPress={handleBookNow}
                onChatPress={handleChatPress}
              />
            ))}
          </View>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      )}

      {/* Floating AI Button */}
      {showFloatingAI && (
        <View style={styles.floatingAIContainer}>
          <TouchableOpacity style={styles.floatingAIButton} onPress={handleAIMatching}>
            <Ionicons name="sparkles" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.closeFloatingButton} 
            onPress={() => setShowFloatingAI(false)}
          >
            <Ionicons name="close" size={16} color="#666" />
          </TouchableOpacity>
        </View>
      )}

      {/* AI Matching Modal */}
      <AIMatchingModal
        visible={showAIModal}
        onClose={() => setShowAIModal(false)}
        onGetRecommendations={handleGetAIRecommendations}
      />

      {/* Booking Modal */}
      {selectedCaregiver && (
        <BookingModal
          visible={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedCaregiver(null);
          }}
          caregiver={selectedCaregiver}
          elderlyProfiles={elderlyProfiles}
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
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  floatingAIContainer: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    alignItems: 'center',
    zIndex: 1000,
  },
  floatingAIButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  closeFloatingButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortButtonText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },
  caregiversList: {
    padding: 20,
    gap: 16,
  },
  bottomSpacing: {
    height: 20,
  },
});
