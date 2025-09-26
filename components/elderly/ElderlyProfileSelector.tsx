import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';

interface ElderlyProfile {
  id: string;
  name: string;
  age: number;
  currentCaregivers: number;
  family: string;
  healthStatus: 'good' | 'fair' | 'poor';
  avatar?: string;
}

interface ElderlyProfileSelectorProps {
  profiles: ElderlyProfile[];
  selectedProfiles: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  showValidation?: boolean;
}

export function ElderlyProfileSelector({
  profiles,
  selectedProfiles,
  onSelectionChange,
  showValidation = false,
}: ElderlyProfileSelectorProps) {
  const handleProfileToggle = (profileId: string) => {
    if (selectedProfiles.includes(profileId)) {
      onSelectionChange([]);
    } else {
      onSelectionChange([profileId]); // Chỉ cho phép chọn 1 người
    }
  };

  const getHealthStatusText = (status: string) => {
    switch (status) {
      case 'good': return 'Tốt';
      case 'fair': return 'Trung bình';
      case 'poor': return 'Yếu';
      default: return 'Không xác định';
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'good': return '#28a745';
      case 'fair': return '#ffc107';
      case 'poor': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const renderProfile = ({ item }: { item: ElderlyProfile }) => {
    const isSelected = selectedProfiles.includes(item.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.profileCard,
          isSelected && styles.profileCardSelected
        ]}
        onPress={() => handleProfileToggle(item.id)}
      >
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <ThemedText style={[
                styles.profileName,
                isSelected && styles.profileNameSelected
              ]}>
                {item.name}
              </ThemedText>
              <ThemedText style={[
                styles.profileAge,
                isSelected && styles.profileAgeSelected
              ]}>
                {item.age} tuổi
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.selectionIndicator}>
            {isSelected ? (
              <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
            ) : (
              <View style={styles.unselectedCircle} />
            )}
          </View>
        </View>

        <View style={styles.profileDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="people" size={16} color={isSelected ? '#4ECDC4' : '#6c757d'} />
            <ThemedText style={[
              styles.detailText,
              isSelected && styles.detailTextSelected
            ]}>
              {item.currentCaregivers} người chăm sóc hiện tại
            </ThemedText>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="home" size={16} color={isSelected ? '#4ECDC4' : '#6c757d'} />
            <ThemedText style={[
              styles.detailText,
              isSelected && styles.detailTextSelected
            ]}>
              Gia đình: {item.family}
            </ThemedText>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="medical" size={16} color={isSelected ? '#4ECDC4' : '#6c757d'} />
            <ThemedText style={[
              styles.detailText,
              isSelected && styles.detailTextSelected
            ]}>
              Sức khỏe: 
              <ThemedText style={[
                styles.healthStatus,
                { color: getHealthStatusColor(item.healthStatus) }
              ]}>
                {' '}{getHealthStatusText(item.healthStatus)}
              </ThemedText>
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const hasSelection = selectedProfiles && selectedProfiles.length > 0;
  const showError = showValidation && !hasSelection;

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <ThemedText style={styles.title}>Chọn người già cần chăm sóc</ThemedText>
        <ThemedText style={styles.requiredMark}>*</ThemedText>
      </View>
      <ThemedText style={styles.subtitle}>
        Chỉ có thể chọn 1 người già
      </ThemedText>
      {showError && (
        <ThemedText style={styles.errorText}>
          Vui lòng chọn ít nhất một người già
        </ThemedText>
      )}
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.profilesList}
      >
        {profiles.map((profile) => (
          <View key={profile.id}>
            {renderProfile({ item: profile })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  requiredMark: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc3545',
    marginLeft: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#dc3545',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  profilesList: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  profileCardSelected: {
    borderColor: '#4ECDC4',
    backgroundColor: '#f0fdfa',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  profileNameSelected: {
    color: '#4ECDC4',
  },
  profileAge: {
    fontSize: 13,
    color: '#6c757d',
    fontWeight: '500',
  },
  profileAgeSelected: {
    color: '#4ECDC4',
  },
  selectionIndicator: {
    marginLeft: 10,
  },
  unselectedCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  profileDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#6c757d',
  },
  detailTextSelected: {
    color: '#4ECDC4',
  },
  healthStatus: {
    fontWeight: '600',
  },
});
