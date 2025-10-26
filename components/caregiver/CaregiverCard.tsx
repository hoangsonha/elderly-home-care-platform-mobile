import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';

export interface Caregiver {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  experience: string;
  hourlyRate: number;
  distance: string;
  isVerified: boolean;
  totalReviews: number;
}

interface CaregiverCardProps {
  caregiver: Caregiver;
  onPress: (caregiver: Caregiver) => void;
  onBookPress?: (caregiver: Caregiver) => void;
  onChatPress?: (caregiver: Caregiver) => void;
  showActions?: boolean;
  hideBookingButton?: boolean;
}

export function CaregiverCard({ caregiver, onPress, onBookPress, onChatPress, showActions = true, hideBookingButton = false }: CaregiverCardProps) {
  return (
    <TouchableOpacity
      style={styles.caregiverCard}
      onPress={() => onPress(caregiver)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: caregiver.avatar }} style={styles.avatar} />
          {caregiver.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={12} color="white" />
            </View>
          )}
        </View>
        
        <View style={styles.caregiverInfo}>
          <View style={styles.nameRow}>
            <ThemedText style={styles.caregiverName} numberOfLines={1}>
              {caregiver.name}
            </ThemedText>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <ThemedText style={styles.rating}>
                {caregiver.rating}
              </ThemedText>
              <ThemedText style={styles.reviewCount}>
                ({caregiver.totalReviews})
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.experienceRow}>
            <Ionicons name="time" size={14} color="#666" />
            <ThemedText style={styles.experience}>
              Kinh nghiệm: {caregiver.experience}
            </ThemedText>
          </View>
          
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color="#666" />
            <ThemedText style={styles.distance}>
              Cách bạn {caregiver.distance}
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.priceContainer}>
          <ThemedText style={styles.priceLabel}>Giá/giờ:</ThemedText>
          <ThemedText style={styles.price}>
            {(caregiver.hourlyRate || 0).toLocaleString('vi-VN')}đ
          </ThemedText>
        </View>
        
        {showActions && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => onChatPress?.(caregiver)}
            >
              <Ionicons name="chatbubble-outline" size={16} color="#4ECDC4" />
              <ThemedText style={styles.chatButtonText}>Chat</ThemedText>
            </TouchableOpacity>
            
            {!hideBookingButton && (
              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => onBookPress?.(caregiver)}
              >
                <ThemedText style={styles.bookButtonText}>Đặt lịch</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  caregiverCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e9ecef',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#28a745',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  caregiverInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  caregiverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  reviewCount: {
    fontSize: 12,
    color: '#6c757d',
  },
  experienceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  experience: {
    fontSize: 14,
    color: '#6c757d',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distance: {
    fontSize: 14,
    color: '#6c757d',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdfa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#4ECDC4',
    gap: 4,
  },
  chatButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ECDC4',
  },
  bookButton: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});
