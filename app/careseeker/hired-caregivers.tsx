import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { HiredCaregiver } from '@/types/hired';

export default function HiredCaregiversScreen() {
  const [activeTab, setActiveTab] = useState<'working' | 'off'>('working');
  // Mock data
  const hiredCaregivers: HiredCaregiver[] = [
    {
      id: '1',
      name: 'Nguyễn Thị Mai',
      age: 28,
      avatar: 'https://via.placeholder.com/60x60/4ECDC4/FFFFFF?text=NM',
      isCurrentlyCaring: true,
      currentElderly: [
        {
          id: 'elderly1',
          name: 'Bà Nguyễn Thị Lan',
          age: 75
        }
      ],
      totalTasks: 6,
      completedTasks: 3,
      pendingTasks: 3,
      hourlyRate: 200000,
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      timeSlots: ['morning', 'afternoon'],
      status: 'active'
    },
    {
      id: '2',
      name: 'Trần Văn Nam',
      age: 32,
      avatar: 'https://via.placeholder.com/60x60/FF6B6B/FFFFFF?text=TN',
      isCurrentlyCaring: true,
      currentElderly: [
        {
          id: 'elderly2',
          name: 'Ông Phạm Văn Đức',
          age: 82
        },
        {
          id: 'elderly3',
          name: 'Bà Lê Thị Bình',
          age: 78
        }
      ],
      totalTasks: 4,
      completedTasks: 2,
      pendingTasks: 2,
      hourlyRate: 180000,
      startDate: '2024-01-10',
      endDate: '2024-03-10',
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      timeSlots: ['morning', 'afternoon', 'evening'],
      status: 'active'
    },
    {
      id: '3',
      name: 'Lê Thị Hoa',
      age: 25,
      avatar: 'https://via.placeholder.com/60x60/45B7D1/FFFFFF?text=LH',
      isCurrentlyCaring: false,
      currentElderly: [
        {
          id: 'elderly4',
          name: 'Bà Lê Thị Bình',
          age: 68
        }
      ],
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      hourlyRate: 220000,
      startDate: '2024-01-05',
      endDate: '2024-01-20',
      workingDays: ['wednesday', 'friday', 'sunday'],
      timeSlots: ['morning'],
      status: 'active'
    },
    {
      id: '4',
      name: 'Phạm Văn Đức',
      age: 30,
      avatar: 'https://via.placeholder.com/60x60/9B59B6/FFFFFF?text=PD',
      isCurrentlyCaring: true,
      currentElderly: [
        {
          id: 'elderly5',
          name: 'Bà Trần Thị Hoa',
          age: 70
        }
      ],
      totalTasks: 1,
      completedTasks: 0,
      pendingTasks: 1,
      hourlyRate: 190000,
      startDate: '2024-01-20',
      endDate: '2024-02-20',
      workingDays: ['tuesday', 'thursday', 'saturday'],
      timeSlots: ['morning'],
      status: 'active'
    }
  ];

  // Filter caregivers based on working schedule
  // Hardcode for Monday (thứ 2) for demo purposes
  const getTodayWorkingCaregivers = () => {
    const todayName = 'monday'; // Hardcode for Monday
    
    return hiredCaregivers.filter(caregiver => 
      caregiver.workingDays.includes(todayName) && caregiver.status === 'active'
    );
  };

  const getTodayOffCaregivers = () => {
    const todayName = 'monday'; // Hardcode for Monday
    
    return hiredCaregivers.filter(caregiver => 
      !caregiver.workingDays.includes(todayName) && caregiver.status === 'active'
    );
  };

  const currentCaregivers = activeTab === 'working' ? getTodayWorkingCaregivers() : getTodayOffCaregivers();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#30A0E0';
      case 'paused': return '#FECA57';
      case 'completed': return '#6C757D';
      default: return '#6C757D';
    }
  };


  const handleCaregiverPress = (caregiver: HiredCaregiver) => {
    router.push({
      pathname: '/hired-detail',
      params: {
        id: caregiver.id,
        name: caregiver.name
      }
    });
  };

  const handleChatPress = (caregiver: HiredCaregiver) => {
    router.push({
      pathname: '/chat',
      params: {
        caregiverId: caregiver.id,
        caregiverName: caregiver.name
      }
    });
  };

  const renderCaregiverItem = ({ item }: { item: HiredCaregiver }) => (
    <TouchableOpacity 
      style={styles.caregiverCard}
      onPress={() => handleCaregiverPress(item)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: getStatusColor(item.status) }]}>
            <ThemedText style={styles.avatarText}>
              {item.name ? item.name.split(' ').map(n => n[0]).join('') : '?'}
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.caregiverInfo}>
          <View style={styles.nameRow}>
            <ThemedText style={styles.caregiverName}>{item.name}</ThemedText>
            <View style={styles.ageContainer}>
              <ThemedText style={styles.caregiverAge}>{item.age} tuổi</ThemedText>
            </View>
          </View>
          <View style={styles.caringForRow}>
            <ThemedText style={styles.caringForLabel}>Đang chăm sóc: </ThemedText>
            <View style={styles.caringForNames}>
              {item.currentElderly.map((elderly, index) => (
                <ThemedText key={index} style={styles.caringForName}>{elderly.name}</ThemedText>
              ))}
            </View>
          </View>
          <ThemedText style={styles.taskInfo}>
            {activeTab === 'working' ? `${item.totalTasks} nhiệm vụ hôm nay` : 'Hôm nay nghỉ'}
          </ThemedText>
        </View>
        
        <View style={styles.chevronContainer}>
          <TouchableOpacity 
            style={styles.chevronButton}
            onPress={() => handleCaregiverPress(item)}
          >
            <Ionicons name="chevron-forward" size={20} color="#6c757d" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.chatButton}
            onPress={() => handleChatPress(item)}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#30A0E0" />
            <ThemedText style={styles.chatButtonText}>Chat</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Đang thuê</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Quản lý người chăm sóc đang thuê</ThemedText>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="search-outline" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="filter-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'working' && styles.activeTab]}
          onPress={() => setActiveTab('working')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'working' && styles.activeTabText]}>
            Hôm nay làm
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'off' && styles.activeTab]}
          onPress={() => setActiveTab('off')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'off' && styles.activeTabText]}>
            Hôm nay nghỉ
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statItem, styles.statItemHighlighted]}>
          <ThemedText style={styles.statNumber}>{currentCaregivers.length}</ThemedText>
          <ThemedText style={styles.statLabel}>
            {activeTab === 'working' ? 'Đang làm' : 'Nghỉ'}
          </ThemedText>
        </View>
        <View style={[styles.statItem, styles.statItemHighlighted]}>
          <ThemedText style={styles.statNumber}>
            {currentCaregivers.reduce((sum, c) => sum + c.totalTasks, 0)}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Tổng nhiệm vụ</ThemedText>
        </View>
      </View>

      {/* Caregivers List */}
      <FlatList
        data={currentCaregivers}
        renderItem={renderCaregiverItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#30A0E0',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#30A0E0',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
  },
  activeTabText: {
    color: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statItemHighlighted: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#30A0E0',
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100, // Thêm margin bottom để tránh đụng navigation bar
  },
  caregiverCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  caregiverInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  caregiverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  ageContainer: {
    alignItems: 'flex-end',
    marginRight: -8,
  },
  caregiverAge: {
    fontSize: 14,
    color: '#6c757d',
  },
  chevronContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginTop: 8,
  },
  chevronButton: {
    padding: 4,
  },
  caringForRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  caringForLabel: {
    fontSize: 12,
    color: '#30A0E0',
    fontWeight: '500',
    marginRight: 8,
  },
  caringForNames: {
    flex: 1,
  },
  caringForName: {
    fontSize: 12,
    color: '#30A0E0',
    fontWeight: '500',
    marginBottom: 2,
  },
  taskInfo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f8f9fa',
    paddingTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#30A0E0',
  },
  chatButtonText: {
    fontSize: 14,
    color: '#30A0E0',
    fontWeight: '600',
    marginLeft: 6,
  },
});
