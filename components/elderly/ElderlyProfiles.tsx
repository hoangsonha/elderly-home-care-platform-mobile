import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Image } from 'react-native';

interface ElderlyProfile {
  id: string;
  elderlyProfileId?: string;
  name?: string;
  fullName?: string;
  age: number;
  healthStatus?: string;
  health_condition?: string; // From database
  avatar?: string;
  avatarUrl?: string;
  relationship?: string;
  gender?: 'male' | 'female' | 'other' | 'MALE' | 'FEMALE' | 'OTHER';
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
    router.push('/careseeker/elderly-list');
  };

  const handleProfilePress = (profile: ElderlyProfile) => {
    const healthStatus = profile.healthStatus || profile.health_condition || 'Chưa rõ';
    router.push({
      pathname: '/careseeker/elderly-detail',
      params: {
        profileId: profile.id,
        profileName: profile.name,
        profileAge: profile.age.toString(),
        healthStatus: healthStatus,
        relationship: profile.relationship || 'Người thân',
      }
    });
  };

  const getHealthStatusColor = (status: string | null | undefined) => {
    if (!status) return '#95A5A6';
    
    switch (status.toUpperCase()) {
      case 'GOOD':
      case 'TỐT':
        return '#27AE60';
      case 'MODERATE':
      case 'FAIR':
      case 'TRUNG BÌNH':
      case 'KHÁ':
        return '#F39C12';
      case 'WEAK':
      case 'POOR':
      case 'YẾU':
        return '#E74C3C';
      default:
        return '#95A5A6';
    }
  };

  const getHealthStatusText = (status: string | null | undefined) => {
    if (!status) return 'Không xác định';
    
    switch (status.toUpperCase()) {
      case 'GOOD':
        return 'Tốt';
      case 'MODERATE':
        return 'Trung bình';
      case 'WEAK':
        return 'Yếu';
      default:
        return status; // Return original value if not recognized
    }
  };

  return (
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
             {(profile.avatar || profile.avatarUrl) ? (
               <Image 
                 source={{ uri: profile.avatar || profile.avatarUrl }} 
                 style={styles.profileImage}
               />
             ) : (
               <View style={[
                 styles.profileImage,
                 { backgroundColor: '#9E9E9E' } // Màu xám khi không có avatar
               ]}>
                 <ThemedText style={styles.profileImageText}>
                   {((profile.name || profile.fullName || 'N/A').split(' ').pop()?.charAt(0) || '?')}
                 </ThemedText>
               </View>
             )}
             {/* Gender indicator */}
             <View style={[
               styles.genderBadge,
               { backgroundColor: (profile.gender === 'female' || profile.gender === 'FEMALE') ? '#E91E63' : '#2196F3' }
             ]}>
               <Ionicons 
                 name={(profile.gender === 'female' || profile.gender === 'FEMALE') ? 'female' : 'male'} 
                 size={12} 
                 color="#FFFFFF" 
               />
             </View>
           </View>
          
          <View style={styles.profileInfo}>
            <ThemedText style={styles.profileName}>{profile.name || profile.fullName}</ThemedText>
            <ThemedText style={styles.profileAge}>{profile.age || 'N/A'} tuổi</ThemedText>
            
            <View style={styles.healthStatusContainer}>
              <Ionicons 
                name="medical" 
                size={14} 
                color={getHealthStatusColor(profile.healthStatus || profile.health_condition)} 
              />
              <ThemedText style={[
                styles.healthStatusText,
                { color: getHealthStatusColor(profile.healthStatus || profile.health_condition) }
              ]}>
                {getHealthStatusText(profile.healthStatus || profile.health_condition)}
              </ThemedText>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  profilesScrollView: {
    marginHorizontal: -20, // Negative margin to extend to edges
  },
  profilesContainer: {
    paddingHorizontal: 20,
  },
  profileCard: {
    width: 240,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#E8EBED',
  },
  profileImageContainer: {
    marginRight: 12,
    position: 'relative',
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileImageText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
    alignItems: 'flex-start',
  },
  profileName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  profileAge: {
    fontSize: 13,
    color: '#7F8C8D',
    marginBottom: 6,
  },
  healthStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  healthStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
