import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AIMatchingModal } from '@/components/caregiver/AIMatchingModal';
import { AIRecommendations } from '@/components/caregiver/AIRecommendations';
import { BookingModal } from '@/components/caregiver/BookingModal';
import { CaregiverCard, type Caregiver } from '@/components/caregiver/CaregiverCard';
import { SearchFilters, type FilterOption } from '@/components/caregiver/SearchFilters';
import { SimpleNavBar } from '@/components/navigation/SimpleNavBar';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext';
import { CaregiverRecommendation, MatchResponse } from '@/services/types';

// Mock data
const mockElderlyProfiles = [
  {
    id: '1',
    name: 'Bà Nguyễn Thị Mai',
    age: 75,
    currentCaregivers: 0,
    family: 'Gia đình Nguyễn',
    healthStatus: 'fair' as const,
  },
  {
    id: '2',
    name: 'Ông Trần Văn Hùng',
    age: 82,
    currentCaregivers: 1,
    family: 'Gia đình Trần',
    healthStatus: 'poor' as const,
  },
  {
    id: '3',
    name: 'Bà Lê Thị Hoa',
    age: 78,
    currentCaregivers: 0,
    family: 'Gia đình Lê',
    healthStatus: 'good' as const,
  },
];

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
];

export default function CaregiverSearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [caregivers] = useState<Caregiver[]>(mockCaregivers);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<CaregiverRecommendation[]>([]);
  const [showAIResults, setShowAIResults] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [showFloatingAI, setShowFloatingAI] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState<Caregiver | null>(null);
  const { user } = useAuth();

  // Floating AI position state
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const translateX = useSharedValue(screenWidth - 80); // Initial position (right side)
  const translateY = useSharedValue(screenHeight - 200); // Initial position (bottom)

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
    router.push('/careseeker/caregiver-detail');
  };

  const handleChatPress = (caregiver: Caregiver) => {
    router.push({
      pathname: '/careseeker/chat',
      params: {
        caregiverId: caregiver.id,
        caregiverName: caregiver.name,
      }
    });
  };

  const handleBookNow = (caregiver: Caregiver) => {
    setSelectedCaregiver(caregiver);
    setShowBookingModal(true);
  };

  const handleAIMatching = () => {
    // Open booking modal with first caregiver or null
    setSelectedCaregiver(mockCaregivers[0] || null);
    setShowBookingModal(true);
  };

  const handleGetAIRecommendations = (response: MatchResponse) => {
    console.log('AI Recommendations received:', response);
    setAiRecommendations(response.recommendations);
    setShowAIResults(true);
    setShowAIModal(false);
    setIsAILoading(false);
  };

  const handleRefreshAI = () => {
    setIsAILoading(true);
    // In real app, this would refresh AI recommendations
    setTimeout(() => {
      setIsAILoading(false);
    }, 1000);
  };

  // Gesture handler for floating AI button
  const panGesture = Gesture.Pan()
    .onStart(() => {
      // Store initial position
    })
    .onUpdate((event) => {
      translateX.value = event.absoluteX - 28; // Center the button
      translateY.value = event.absoluteY - 28;
    })
    .onEnd(() => {
      // Snap to edges
      const buttonSize = 56;
      const margin = 20;
      
      if (translateX.value < screenWidth / 2) {
        // Snap to left edge
        translateX.value = withSpring(margin);
      } else {
        // Snap to right edge
        translateX.value = withSpring(screenWidth - buttonSize - margin);
      }
      
      // Keep Y within screen bounds
      translateY.value = withSpring(
        Math.max(margin, Math.min(screenHeight - buttonSize - margin, translateY.value))
      );
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });



  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Tìm người chăm sóc</ThemedText>
        </View>
        
        <View style={styles.placeholder} />
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
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.floatingAIContainer, animatedStyle]}>
            <TouchableOpacity style={styles.floatingAIButton} onPress={handleAIMatching}>
              <Ionicons name="sparkles" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.closeFloatingButton} 
              onPress={() => setShowFloatingAI(false)}
            >
              <Ionicons name="close" size={16} color="#666" />
            </TouchableOpacity>
          </Animated.View>
        </GestureDetector>
      )}

      {/* AI Matching Modal */}
      <AIMatchingModal
        visible={showAIModal}
        onClose={() => setShowAIModal(false)}
        onGetRecommendations={handleGetAIRecommendations}
        elderlyProfiles={mockElderlyProfiles}
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

      {/* Navigation Bar */}
      <SimpleNavBar />
    </SafeAreaView>
    </GestureHandlerRootView>
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
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
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
  floatingAIContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 1000,
  },
  floatingAIButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#68C2E8',
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

