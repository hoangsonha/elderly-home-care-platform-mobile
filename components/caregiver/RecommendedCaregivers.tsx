import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../themed-text';

interface RecommendedCaregiver {
  id: string;
  name: string;
  age: number;
  avatar: string;
  rating: number;
  gender?: 'male' | 'female';
  specialties?: string[];
}

interface RecommendedCaregiversProps {
  caregivers: RecommendedCaregiver[];
  onBookPress?: (caregiver: RecommendedCaregiver) => void;
}

export function RecommendedCaregivers({ caregivers, onBookPress }: RecommendedCaregiversProps) {
  const handleCaregiverPress = (caregiver: RecommendedCaregiver) => {
    router.push({
      pathname: '/careseeker/caregiver-detail',
      params: { id: caregiver.id, name: caregiver.name }
    });
  };

  const handleBookPress = (caregiver: RecommendedCaregiver, event: any) => {
    event.stopPropagation(); // Prevent card press
    if (onBookPress) {
      onBookPress(caregiver);
    }
  };

  const getInitial = (name: string) => {
    return name.split(' ').pop()?.charAt(0) || 'C';
  };

  // Empty state
  if (!caregivers || caregivers.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Phù hợp với người thân</ThemedText>
          <TouchableOpacity onPress={() => router.push('/careseeker/caregiver-search')}>
            <ThemedText style={styles.seeAllText}>Xem tất cả →</ThemedText>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={48} color="#CCC" />
          <ThemedText style={styles.emptyText}>Đang tải danh sách...</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Phù hợp với người thân</ThemedText>
        <TouchableOpacity onPress={() => router.push('/careseeker/caregiver-search')}>
          <ThemedText style={styles.seeAllText}>Xem tất cả →</ThemedText>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {caregivers.map((caregiver) => (
          <TouchableOpacity 
            key={caregiver.id} 
            style={styles.card}
            onPress={() => handleCaregiverPress(caregiver)}
            activeOpacity={0.7}
          >
            {/* Avatar and Rating */}
            <View style={styles.avatarContainer}>
              {caregiver.avatar ? (
                <Image source={{ uri: caregiver.avatar }} style={styles.avatar} />
              ) : (
                <View style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: caregiver.gender === 'female' ? '#E91E63' : '#2196F3' }
                ]}>
                  <ThemedText style={styles.avatarText}>
                    {getInitial(caregiver.name)}
                  </ThemedText>
                </View>
              )}
              <View style={styles.ratingBadge}>
                <ThemedText style={styles.ratingText}>{caregiver.rating}</ThemedText>
                <Ionicons name="star" size={12} color="#FFFFFF" />
              </View>
            </View>

            {/* Name and Age */}
            <ThemedText style={styles.name}>{caregiver.name}, {caregiver.age}</ThemedText>

            {/* Specialties */}
            {caregiver.specialties && caregiver.specialties.length > 0 && (
              <View style={styles.specialtiesContainer}>
                {caregiver.specialties.slice(0, 2).map((specialty, index) => (
                  <View key={index} style={styles.specialtyBadge}>
                    <ThemedText style={styles.specialtyText} numberOfLines={1}>
                      {specialty}
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}

            {/* Book Button */}
            <TouchableOpacity 
              style={styles.bookButton}
              onPress={(e) => handleBookPress(caregiver, e)}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar-outline" size={16} color="#FFFFFF" />
              <ThemedText style={styles.bookButtonText}>Đặt lịch</ThemedText>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
  },
  seeAllText: {
    fontSize: 14,
    color: '#68C2E8',
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E8EBED',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -34,
    backgroundColor: '#FF9500',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  specialtiesContainer: {
    width: '100%',
    gap: 6,
    marginTop: 4,
  },
  specialtyBadge: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#68C2E8',
  },
  specialtyText: {
    fontSize: 11,
    color: '#68C2E8',
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  bookButton: {
    backgroundColor: '#FF9500',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 12,
    gap: 6,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

