import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookingModal } from '@/components/caregiver/BookingModal';
import { RequestTabs } from '@/components/requests/RequestTabs';
import { ThemedText } from '@/components/themed-text';

export default function RequestsScreen() {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState<any>(null);

  // Mock elderly profiles data (same as caregiver-search)
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

  const handleChatPress = (caregiver: any) => {
    // Navigate to chat with specific caregiver
    console.log('Chat with:', caregiver.name);
    router.push({
      pathname: '/chat',
      params: {
        caregiverId: caregiver.id,
        caregiverName: caregiver.name,
      }
    });
  };

  const handleBookPress = (caregiver: any) => {
    // Open booking modal directly (same as caregiver-search)
    console.log('Book caregiver:', caregiver.name);
    setSelectedCaregiver(caregiver);
    setShowBookingModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Yêu cầu</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <RequestTabs 
        onChatPress={handleChatPress}
        onBookPress={handleBookPress}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
});