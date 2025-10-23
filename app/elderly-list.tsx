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
import { ThemedText } from '@/components/themed-text';
import { ElderlyProfile } from '@/types/elderly';

type ElderlyPerson = Pick<ElderlyProfile, 'id' | 'name' | 'age' | 'avatar' | 'family' | 'healthStatus' | 'currentCaregivers'>;

// Mock data
const mockElderlyData: ElderlyPerson[] = [
  {
    id: '1',
    name: 'Bà Nguyễn Thị Lan',
    age: 78,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    family: 'Gia đình Nguyễn Văn A',
    healthStatus: 'good',
    currentCaregivers: 2,
  },
  {
    id: '2',
    name: 'Ông Trần Văn Minh',
    age: 82,
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
    family: 'Gia đình Trần Thị B',
    healthStatus: 'fair',
    currentCaregivers: 1,
  },
  {
    id: '3',
    name: 'Bà Lê Thị Hoa',
    age: 75,
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
    family: 'Gia đình Lê Minh C',
    healthStatus: 'poor',
    currentCaregivers: 3,
  },
  {
    id: '4',
    name: 'Ông Phạm Văn Đức',
    age: 80,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    family: 'Gia đình Phạm Thị D',
    healthStatus: 'good',
    currentCaregivers: 1,
  },
];

export default function ElderlyListScreen() {
  const [elderlyData] = useState<ElderlyPerson[]>(mockElderlyData);

  const handlePersonPress = (person: ElderlyPerson) => {
    router.push(`/elderly-detail?id=${person.id}`);
  };

  const handleAddPerson = () => {
    router.push('/add-elderly');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Hồ sơ người già</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Quản lý thông tin sức khỏe</ThemedText>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddPerson}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ElderlyList
        data={elderlyData}
        showSearch={true}
        showStats={true}
        showCaregiverCount={false}
        onPersonPress={handlePersonPress}
        onAddPress={handleAddPerson}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingBottom: 100, // Space for navigation bar
  },
  header: {
    backgroundColor: '#4ECDC4',
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
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  addButton: {
    padding: 8,
  },
});