import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ElderlyList from '@/components/elderly/ElderlyList';
import { SimpleNavBar } from '@/components/navigation/SimpleNavBar';
import { ThemedText } from '@/components/themed-text';
import { ElderlyProfile } from '@/types/elderly';

type ElderlyPerson = Pick<ElderlyProfile, 'id' | 'name' | 'age' | 'avatar' | 'family' | 'healthStatus' | 'currentCaregivers'> & { gender?: 'male' | 'female' };

// Mock data
const mockElderlyData: ElderlyPerson[] = [
  {
    id: '1',
    name: 'Bà Nguyễn Thị Lan',
    age: 78,
    gender: 'female',
    family: 'Gia đình Nguyễn Văn A',
    healthStatus: 'good',
    currentCaregivers: 2,
  },
  {
    id: '2',
    name: 'Ông Trần Văn Minh',
    age: 82,
    gender: 'male',
    family: 'Gia đình Trần Thị B',
    healthStatus: 'fair',
    currentCaregivers: 1,
  },
  {
    id: '3',
    name: 'Bà Lê Thị Hoa',
    age: 75,
    gender: 'female',
    family: 'Gia đình Lê Minh C',
    healthStatus: 'poor',
    currentCaregivers: 3,
  },
  {
    id: '4',
    name: 'Ông Phạm Văn Đức',
    age: 80,
    gender: 'male',
    family: 'Gia đình Phạm Thị D',
    healthStatus: 'good',
    currentCaregivers: 1,
  },
];

export default function ElderlyListScreen() {
  const [elderlyData] = useState<ElderlyPerson[]>(mockElderlyData);

  const handlePersonPress = (person: ElderlyPerson) => {
    router.push(`/careseeker/elderly-detail?id=${person.id}`);
  };

  const handleAddPerson = () => {
    router.push('/careseeker/add-elderly');
  };

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
        data={elderlyData}
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
    paddingBottom: 100,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
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