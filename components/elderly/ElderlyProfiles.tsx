import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface ElderlyProfile {
  id: string;
  name: string;
  age: number;
  healthStatus: string;
  avatar: string;
  relationship: string;
}

interface ElderlyProfilesProps {
  profiles: ElderlyProfile[];
}

export function ElderlyProfiles({ profiles }: ElderlyProfilesProps) {
  console.log('ElderlyProfiles rendering with profiles:', profiles.length);
  
  // Simple fallback for testing
  if (!profiles || profiles.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: '#f0f0f0', padding: 20 }]}>
        <ThemedText style={styles.title}>Hồ sơ người già - No data</ThemedText>
      </View>
    );
  }
  
  const handleViewAll = () => {
    router.push('/elderly-list');
  };

  const handleProfilePress = (profile: ElderlyProfile) => {
    router.push({
      pathname: '/elderly-detail',
      params: {
        profileId: profile.id,
        profileName: profile.name,
        profileAge: profile.age.toString(),
        healthStatus: profile.healthStatus,
        relationship: profile.relationship,
      }
    });
  };

  const getHealthStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'tốt':
        return '#27AE60';
      case 'khá':
        return '#F39C12';
      case 'yếu':
        return '#E74C3C';
      default:
        return '#95A5A6';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#f0f0f0' }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="people-outline" size={24} color="#2c3e50" />
          <ThemedText style={styles.title}>Hồ sơ người già</ThemedText>
        </View>
        
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={handleViewAll}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.viewAllText}>Xem tất cả</ThemedText>
          <Ionicons name="chevron-forward" size={16} color="#4ECDC4" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.profilesScrollView}
        contentContainerStyle={styles.profilesContainer}
      >
        {profiles.map((profile) => (
          <TouchableOpacity
            key={profile.id}
            style={styles.profileCard}
            onPress={() => handleProfilePress(profile)}
            activeOpacity={0.8}
          >
             <View style={styles.profileImageContainer}>
               <View style={styles.profileImage}>
                 <ThemedText style={styles.profileImageText}>
                   {profile.name.split(' ').map(n => n[0]).join('')}
                 </ThemedText>
               </View>
             </View>
            
            <View style={styles.profileInfo}>
              <ThemedText style={styles.profileName}>{profile.name}</ThemedText>
              <ThemedText style={styles.profileAge}>{profile.age} tuổi</ThemedText>
              
              <View style={styles.healthStatusContainer}>
                <View style={[
                  styles.healthStatusDot, 
                  { backgroundColor: getHealthStatusColor(profile.healthStatus) }
                ]} />
                <ThemedText style={[
                  styles.healthStatusText,
                  { color: getHealthStatusColor(profile.healthStatus) }
                ]}>
                  {profile.healthStatus}
                </ThemedText>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 8,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  viewAllText: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  profilesScrollView: {
    marginHorizontal: -8,
  },
  profilesContainer: {
    paddingHorizontal: 8,
    gap: 12,
  },
  profileCard: {
    width: 220,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 70,
  },
  profileImageContainer: {
    marginRight: 12,
  },
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImageText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  profileInfo: {
    flex: 1,
    alignItems: 'flex-start',
  },
  profileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 1,
  },
  profileAge: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 1,
  },
  healthStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  healthStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  healthStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
