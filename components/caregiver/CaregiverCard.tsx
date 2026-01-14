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
        <Image source={{ uri: caregiver.avatar }} style={styles.avatar} />
        
        <View style={styles.caregiverInfo}>
          <View style={styles.nameRow}>
            <View style={styles.nameContainer}>
              <ThemedText style={styles.caregiverName} numberOfLines={1}>
                {caregiver.name}
              </ThemedText>
            </View>
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
          
          {/* Verification status badge - always on a new line */}
          <View style={styles.verificationRow}>
            {caregiver.isVerified ? (
              <View style={styles.verifiedLabel}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <ThemedText style={styles.verifiedText}>Đã xác thực</ThemedText>
              </View>
            ) : (
              <View style={styles.unverifiedLabel}>
                <Ionicons name="alert-circle" size={14} color="#F59E0B" />
                <ThemedText style={styles.unverifiedText}>Chưa xác thực</ThemedText>
              </View>
            )}
          </View>
          
          <View style={styles.experienceRow}>
            <Ionicons name="time" size={14} color="#666" />
            <ThemedText style={styles.experience}>
              {caregiver.experience}
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

      {showActions && (
        <View style={styles.cardFooter}>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => onChatPress?.(caregiver)}
            >
              <Ionicons name="chatbubble-outline" size={16} color="#68C2E8" />
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
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  caregiverCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 18,
    elevation: 4,
    shadowColor: '#68C2E8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F2F5',
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E8F4FC',
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#68C2E8',
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
  nameContainer: {
    flex: 1,
    marginRight: 8,
  },
  verificationRow: {
    marginTop: 4,
    marginBottom: 4,
  },
  caregiverName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2C3E50',
    letterSpacing: 0.2,
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
  unverifiedLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  unverifiedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rating: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2C3E50',
  },
  reviewCount: {
    fontSize: 13,
    color: '#6C757D',
    fontWeight: '500',
  },
  experienceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  experience: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distance: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4FC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#68C2E8',
    gap: 6,
  },
  chatButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#68C2E8',
    letterSpacing: 0.2,
  },
  bookButton: {
    backgroundColor: '#68C2E8',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    elevation: 3,
    shadowColor: '#68C2E8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  bookButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 0.3,
  },
});
