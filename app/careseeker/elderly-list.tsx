import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ElderlyList from '@/components/elderly/ElderlyList';
import { SimpleNavBar } from '@/components/navigation/SimpleNavBar';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext';
import { UserService } from '@/services/user.service';

interface ElderlyPerson {
  id?: string;
  elderlyProfileId?: string;
  name?: string;
  fullName?: string;
  age: number | null;
  avatar?: string;
  avatarUrl?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'male' | 'female' | 'other';
  family?: string;
  healthStatus?: string | null;
  currentCaregivers?: any[];
}

export default function ElderlyListScreen() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<ElderlyPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await UserService.getElderlyProfiles();
      console.log('Elderly profiles data:', data);
      
      // getElderlyProfiles returns array directly, not an object with status/data
      const mappedProfiles = data.map((profile: any) => ({
        id: profile.elderlyProfileId,
        elderlyProfileId: profile.elderlyProfileId,
        name: profile.fullName,
        fullName: profile.fullName,
        age: profile.age,
        avatar: profile.avatarUrl,
        avatarUrl: profile.avatarUrl,
        gender: profile.gender,
        healthStatus: profile.healthStatus,
        currentCaregivers: profile.currentCaregivers || [],
      }));
      console.log('Mapped profiles:', mappedProfiles);
      setProfiles(mappedProfiles);
    } catch (err: any) {
      console.error('Error loading elderly profiles:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load profiles when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadProfiles();
    }, [loadProfiles])
  );

  const refresh = async () => {
    await loadProfiles();
  };

  const handlePersonPress = (person: ElderlyPerson) => {
    const id = person.elderlyProfileId || person.id;
    router.push(`/careseeker/elderly-detail?id=${id}`);
  };

  const handleAddPerson = () => {
    router.push('/careseeker/add-elderly');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2DC2D7" />
          <ThemedText style={styles.loadingText}>Đang tải dữ liệu...</ThemedText>
        </View>
        <SimpleNavBar />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.errorText}>Lỗi: {error.message}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <ThemedText style={styles.retryText}>Thử lại</ThemedText>
          </TouchableOpacity>
        </View>
        <SimpleNavBar />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header - Similar to caregiver-search */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Hồ sơ người già</ThemedText>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddPerson}>
          <Ionicons name="add-circle" size={32} color="white" />
        </TouchableOpacity>
      </View>

      <ElderlyList
        data={profiles as any}
        showSearch={false}
        showStats={false}
        showCaregiverCount={false}
        onPersonPress={handlePersonPress}
        onAddPress={handleAddPerson}
      />

      {/* Navigation Bar */}
      <SimpleNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#2DC2D7',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    padding: 4,
  },
});