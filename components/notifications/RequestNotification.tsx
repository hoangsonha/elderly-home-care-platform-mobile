import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface RequestNotificationProps {
  requestCount: number;
  visible: boolean;
}

export function RequestNotification({ requestCount, visible }: RequestNotificationProps) {
  const handleViewRequests = () => {
    router.push('/careseeker/requests');
  };

  if (!visible || requestCount === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="notifications" size={24} color="#4ECDC4" />
        </View>
        
        <View style={styles.textContainer}>
          <ThemedText style={styles.title}>
            Bạn đang có {requestCount} yêu cầu thuê đang đợi phản hồi từ người chăm sóc
          </ThemedText>
        </View>
        
        <TouchableOpacity
          style={styles.viewButton}
          onPress={handleViewRequests}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.buttonText}>Xem yêu cầu</ThemedText>
          <Ionicons name="chevron-forward" size={16} color="#4ECDC4" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 8,
    marginTop: 20,
    marginBottom: 20,
  },
  content: {
    backgroundColor: '#E8F6F3',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'white',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ECDC4',
    marginRight: 4,
  },
});

