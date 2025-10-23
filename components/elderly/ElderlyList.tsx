import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ElderlyProfile } from '@/types/elderly';

const { width } = Dimensions.get('window');

type ElderlyPerson = Pick<ElderlyProfile, 'id' | 'name' | 'age' | 'avatar' | 'family' | 'healthStatus' | 'currentCaregivers'>;

interface ElderlyListProps {
  data: ElderlyPerson[];
  showSearch?: boolean;
  showStats?: boolean;
  showCaregiverCount?: boolean;
  onPersonPress?: (person: ElderlyPerson) => void;
  onAddPress?: () => void;
}

export default function ElderlyList({ 
  data, 
  showSearch = true, 
  showStats = true, 
  showCaregiverCount = false,
  onPersonPress,
  onAddPress 
}: ElderlyListProps) {
  const handlePersonPress = (person: ElderlyPerson) => {
    if (onPersonPress) {
      onPersonPress(person);
    } else {
      router.push(`/elderly-detail?id=${person.id}`);
    }
  };

  const getHealthStatusColor = (status: ElderlyPerson['healthStatus']) => {
    switch (status) {
      case 'good':
        return '#28a745';
      case 'fair':
        return '#ffc107';
      case 'poor':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getHealthStatusText = (status: ElderlyPerson['healthStatus']) => {
    switch (status) {
      case 'good':
        return 'Tốt';
      case 'fair':
        return 'Trung bình';
      case 'poor':
        return 'Yếu';
      default:
        return 'Không rõ';
    }
  };

  const renderElderlyCard = ({ item }: { item: ElderlyPerson }) => (
    <TouchableOpacity
      style={styles.elderlyCard}
      onPress={() => handlePersonPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        <View style={styles.topRow}>
          <View style={styles.avatarContainer}>
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.defaultAvatar}>
                <ThemedText style={styles.avatarText}>
                  {item.name.split(' ').pop()?.charAt(0)}
                </ThemedText>
              </View>
            )}
            <View style={[styles.healthIndicator, { backgroundColor: getHealthStatusColor(item.healthStatus) }]} />
          </View>

          <View style={styles.personInfo}>
            <View style={styles.nameRow}>
              <ThemedText style={styles.personName} numberOfLines={1}>{item.name}</ThemedText>
            </View>
            
            <View style={styles.familyRow}>
              <TouchableOpacity
                style={styles.chevronButton}
                onPress={() => handlePersonPress(item)}
                activeOpacity={0.8}
              >
                <Ionicons name="chevron-forward" size={20} color="#6c757d" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.ageContainer}>
            <ThemedText style={styles.personAge}>{item.age} tuổi</ThemedText>
          </View>
        </View>

        <View style={styles.bottomRow}>
          {showCaregiverCount ? (
            <View style={styles.caregiverBadge}>
              <Ionicons name="people" size={12} color="#4ECDC4" />
              <ThemedText style={styles.caregiverText}>
                {item.currentCaregivers} người chăm sóc
              </ThemedText>
            </View>
          ) : (
            <View style={styles.emptySpace} />
          )}
          
          <View style={[styles.healthStatusBadge, { 
            backgroundColor: getHealthStatusColor(item.healthStatus) + '20',
            borderColor: getHealthStatusColor(item.healthStatus) + '40'
          }]}>
            <ThemedText style={[styles.healthStatusText, { color: getHealthStatusColor(item.healthStatus) }]}>
              Tình trạng {getHealthStatusText(item.healthStatus)}
            </ThemedText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => {
    if (!showStats) return null;

    const goodCount = data.filter(person => person.healthStatus === 'good').length;
    const fairCount = data.filter(person => person.healthStatus === 'fair').length;
    const poorCount = data.filter(person => person.healthStatus === 'poor').length;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statsHeader}>
          <ThemedText style={styles.statsTitle}>Tổng quan</ThemedText>
          <ThemedText style={styles.statsCount}>{data.length} người già</ThemedText>
        </View>
        
        <View style={styles.healthStatusSection}>
          <ThemedText style={styles.healthStatusTitle}>Tình trạng</ThemedText>
          <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.goodStatCard]}>
            <View style={styles.statHeader}>
              <View style={[styles.statIcon, { backgroundColor: '#28a745' }]}>
                <Ionicons name="checkmark-circle" size={16} color="white" />
              </View>
              <ThemedText style={styles.statValue}>{goodCount}</ThemedText>
            </View>
            <ThemedText style={styles.statLabel}>Tốt</ThemedText>
          </View>
          
          <View style={[styles.statCard, styles.fairStatCard]}>
            <View style={styles.statHeader}>
              <View style={[styles.statIcon, { backgroundColor: '#ffc107' }]}>
                <Ionicons name="warning" size={16} color="white" />
              </View>
              <ThemedText style={styles.statValue}>{fairCount}</ThemedText>
            </View>
            <ThemedText style={styles.statLabel}>Trung bình</ThemedText>
          </View>
          
          <View style={[styles.statCard, styles.poorStatCard]}>
            <View style={styles.statHeader}>
              <View style={[styles.statIcon, { backgroundColor: '#dc3545' }]}>
                <Ionicons name="alert-circle" size={16} color="white" />
              </View>
              <ThemedText style={styles.statValue}>{poorCount}</ThemedText>
            </View>
            <ThemedText style={styles.statLabel}>Yếu</ThemedText>
          </View>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="person-outline" size={64} color="#6c757d" />
      <ThemedText style={styles.emptyTitle}>Chưa có người già nào</ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        {onAddPress ? 'Thêm người già đầu tiên vào gia đình' : 'Danh sách trống'}
      </ThemedText>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <FlatList
        data={data}
        renderItem={renderElderlyCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  statsContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statsCount: {
    fontSize: 14,
    color: '#6c757d',
  },
  healthStatusSection: {
    marginTop: 8,
  },
  healthStatusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  goodStatCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  fairStatCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  poorStatCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  elderlyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardContent: {
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    position: 'relative',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  defaultAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  healthIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
  },
  personInfo: {
    flex: 1,
  },
  nameRow: {
    marginBottom: 4,
  },
  personName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  ageContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  personAge: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  familyRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  healthStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  healthStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  healthBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  healthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  caregiverBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  caregiverText: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '500',
  },
  chevronButton: {
    padding: 8,
    alignSelf: 'center',
  },
  emptySpace: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6c757d',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
