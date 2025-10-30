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

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'good':
        return 'checkmark-circle';
      case 'average':
        return 'alert-circle';
      case 'critical':
        return 'warning';
      default:
        return 'help-circle';
    }
  };

  const getHealthBgColor = (status: string) => {
    switch (status) {
      case 'good':
        return '#E8F5E9';
      case 'average':
        return '#FFF3E0';
      case 'critical':
        return '#FFEBEE';
      default:
        return '#F5F5F5';
    }
  };

  const renderElderlyCard = ({ item }: { item: ElderlyPerson }) => (
    <TouchableOpacity
      style={styles.elderlyCard}
      onPress={() => handlePersonPress(item)}
      activeOpacity={0.7}
    >
      {/* Health Status Badge - Top Right */}
      <View style={[styles.healthBadge, { backgroundColor: getHealthBgColor(item.healthStatus) }]}>
        <Ionicons 
          name={getHealthIcon(item.healthStatus)} 
          size={16} 
          color={getHealthStatusColor(item.healthStatus)} 
        />
      </View>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={[
          styles.defaultAvatar,
          { backgroundColor: item.gender === 'female' ? '#E91E63' : '#2196F3' }
        ]}>
          <ThemedText style={styles.avatarText}>
            {item.name.split(' ').pop()?.charAt(0)}
          </ThemedText>
        </View>
        {/* Gender indicator */}
        <View style={[
          styles.genderBadge,
          { backgroundColor: item.gender === 'female' ? '#E91E63' : '#2196F3' }
        ]}>
          <Ionicons 
            name={item.gender === 'female' ? 'female' : 'male'} 
            size={14} 
            color="#FFFFFF" 
          />
        </View>
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <ThemedText style={styles.personName} numberOfLines={1}>
          {item.name}
        </ThemedText>
        
        <View style={styles.infoRow}>
          <View style={styles.ageContainer}>
            <Ionicons name="calendar-outline" size={12} color="#95A5A6" />
            <ThemedText style={styles.ageText}>{item.age} tuổi</ThemedText>
          </View>
        </View>

        <View style={[styles.healthStatusRow, { backgroundColor: getHealthBgColor(item.healthStatus) }]}>
          <Ionicons 
            name={getHealthIcon(item.healthStatus)} 
            size={14} 
            color={getHealthStatusColor(item.healthStatus)} 
          />
          <ThemedText style={[styles.healthStatusText, { color: getHealthStatusColor(item.healthStatus) }]}>
            {getHealthStatusText(item.healthStatus)}
          </ThemedText>
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
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderLeftColor: '#28a745' }]}>
            <View style={styles.statContent}>
              <View style={[styles.statIconContainer, { backgroundColor: '#28a74515' }]}>
                <Ionicons name="checkmark-circle" size={24} color="#28a745" />
              </View>
              <View style={styles.statTextContainer}>
                <ThemedText style={styles.statValue}>{goodCount}</ThemedText>
                <ThemedText style={styles.statLabel}>Sức khỏe tốt</ThemedText>
              </View>
            </View>
          </View>
          
          <View style={[styles.statCard, { borderLeftColor: '#ffc107' }]}>
            <View style={styles.statContent}>
              <View style={[styles.statIconContainer, { backgroundColor: '#ffc10715' }]}>
                <Ionicons name="alert-circle-outline" size={24} color="#ffc107" />
              </View>
              <View style={styles.statTextContainer}>
                <ThemedText style={styles.statValue}>{fairCount}</ThemedText>
                <ThemedText style={styles.statLabel}>Trung bình</ThemedText>
              </View>
            </View>
          </View>
          
          <View style={[styles.statCard, { borderLeftColor: '#dc3545' }]}>
            <View style={styles.statContent}>
              <View style={[styles.statIconContainer, { backgroundColor: '#dc354515' }]}>
                <Ionicons name="warning" size={24} color="#dc3545" />
              </View>
              <View style={styles.statTextContainer}>
                <ThemedText style={styles.statValue}>{poorCount}</ThemedText>
                <ThemedText style={styles.statLabel}>Cần chú ý</ThemedText>
              </View>
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
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  statContent: {
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statTextContainer: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '600',
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  elderlyCard: {
    width: (width - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    position: 'relative',
  },
  healthBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    position: 'relative',
  },
  genderBadge: {
    position: 'absolute',
    bottom: 0,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  defaultAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#667EEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
  },
  cardInfo: {
    alignItems: 'center',
  },
  personName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 6,
    textAlign: 'center',
  },
  infoRow: {
    marginBottom: 10,
  },
  ageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ageText: {
    fontSize: 12,
    color: '#95A5A6',
  },
  healthStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
  },
  healthStatusText: {
    fontSize: 11,
    fontWeight: '600',
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
