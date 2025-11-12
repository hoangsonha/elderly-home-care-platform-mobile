import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
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
import { ElderlyProfile } from '@/types/elderly';
import { useElderlyProfiles } from '@/hooks/useDatabaseEntities';
import { useAuth } from '@/contexts/AuthContext';

type ElderlyPerson = Pick<ElderlyProfile, 'id' | 'name' | 'age' | 'avatar' | 'family' | 'healthStatus' | 'currentCaregivers'> & { gender?: 'male' | 'female' };

export default function ElderlyListScreen() {
  const { user } = useAuth();
  const { profiles, loading, error, refresh } = useElderlyProfiles(user?.id || '');

  const handlePersonPress = (person: ElderlyPerson) => {
    router.push(`/careseeker/elderly-detail?id=${person.id}`);
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
      {/* Header - Clean & Simple */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Hồ sơ người già</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Quản lý thông tin sức khỏe gia đình</ThemedText>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddPerson}>
          <Ionicons name="add-circle" size={32} color="#68C2E8" />
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
    backgroundColor: '#FFFFFF',
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#7F8C8D',
    marginTop: 4,
  },
  addButton: {
    padding: 4,
  },
});