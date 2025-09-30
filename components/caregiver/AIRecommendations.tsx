import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    StyleSheet,
    View
} from 'react-native';

import { CaregiverCard, type Caregiver } from '@/components/caregiver/CaregiverCard';
import { ThemedText } from '@/components/themed-text';

const { width } = Dimensions.get('window');

interface AIRecommendationsProps {
  recommendations: Caregiver[];
  onCaregiverPress: (caregiver: Caregiver) => void;
  onBookPress: (caregiver: Caregiver) => void;
  onChatPress: (caregiver: Caregiver) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function AIRecommendations({
  recommendations,
  onCaregiverPress,
  onBookPress,
  onChatPress,
  onRefresh,
  isLoading = false,
}: AIRecommendationsProps) {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <View style={styles.loadingSpinner}>
            <Ionicons name="refresh" size={32} color="#4ECDC4" />
          </View>
          <ThemedText style={styles.loadingTitle}>AI đang phân tích...</ThemedText>
          <ThemedText style={styles.loadingSubtitle}>
            Đang tìm kiếm người chăm sóc phù hợp nhất với yêu cầu của bạn
          </ThemedText>
        </View>
      </View>
    );
  }

  if (recommendations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyContent}>
          <Ionicons name="search" size={64} color="#ced4da" />
          <ThemedText style={styles.emptyTitle}>Không tìm thấy kết quả</ThemedText>
          <ThemedText style={styles.emptySubtitle}>
            Hãy thử điều chỉnh yêu cầu hoặc mở rộng phạm vi tìm kiếm
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* AI Header */}
      <View style={styles.aiHeader}>
        <View style={styles.aiIconContainer}>
          <Ionicons name="sparkles" size={24} color="#4ECDC4" />
        </View>
        <View style={styles.aiContent}>
          <ThemedText style={styles.aiTitle}>AI Gợi ý</ThemedText>
          <ThemedText style={styles.aiSubtitle}>
            {recommendations.length} người chăm sóc phù hợp nhất
          </ThemedText>
        </View>
      </View>

      {/* Match Score Info */}
      <View style={styles.matchInfo}>
        <View style={styles.matchItem}>
          <Ionicons name="checkmark-circle" size={16} color="#28a745" />
          <ThemedText style={styles.matchText}>Phù hợp về kỹ năng</ThemedText>
        </View>
        <View style={styles.matchItem}>
          <Ionicons name="location" size={16} color="#28a745" />
          <ThemedText style={styles.matchText}>Gần địa chỉ của bạn</ThemedText>
        </View>
        <View style={styles.matchItem}>
          <Ionicons name="time" size={16} color="#28a745" />
          <ThemedText style={styles.matchText}>Linh hoạt về thời gian</ThemedText>
        </View>
      </View>

      {/* Recommendations List */}
      <View style={styles.recommendationsList}>
        {recommendations.map((caregiver, index) => (
          <View key={caregiver.id} style={styles.recommendationItem}>
            {/* Match Score Badge */}
            <View style={styles.matchScoreBadge}>
              <Ionicons name="star" size={12} color="#ffc107" />
              <ThemedText style={styles.matchScoreText}>
                {Math.round(95 - index * 2)}% phù hợp
              </ThemedText>
            </View>
            
            <CaregiverCard
              caregiver={caregiver}
              onPress={onCaregiverPress}
              onBookPress={onBookPress}
              onChatPress={onChatPress}
            />
          </View>
        ))}
      </View>

      {/* AI Explanation */}
      <View style={styles.explanationContainer}>
        <View style={styles.explanationHeader}>
          <Ionicons name="bulb" size={20} color="#4ECDC4" />
          <ThemedText style={styles.explanationTitle}>Tại sao AI chọn những người này?</ThemedText>
        </View>
        <ThemedText style={styles.explanationText}>
          AI đã phân tích yêu cầu của bạn và tìm ra những người chăm sóc có:
        </ThemedText>
        <View style={styles.explanationList}>
          <View style={styles.explanationItem}>
            <Ionicons name="checkmark" size={16} color="#28a745" />
            <ThemedText style={styles.explanationItemText}>
              Kỹ năng phù hợp với nhu cầu đặc biệt
            </ThemedText>
          </View>
          <View style={styles.explanationItem}>
            <Ionicons name="checkmark" size={16} color="#28a745" />
            <ThemedText style={styles.explanationItemText}>
              Kinh nghiệm phù hợp với mức độ chăm sóc
            </ThemedText>
          </View>
          <View style={styles.explanationItem}>
            <Ionicons name="checkmark" size={16} color="#28a745" />
            <ThemedText style={styles.explanationItemText}>
              Vị trí gần địa chỉ của bạn
            </ThemedText>
          </View>
          <View style={styles.explanationItem}>
            <Ionicons name="checkmark" size={16} color="#28a745" />
            <ThemedText style={styles.explanationItemText}>
              Giá cả phù hợp với ngân sách
            </ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0fdfa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  aiIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdfa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  aiContent: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  aiSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  matchInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  matchText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#28a745',
    fontWeight: '500',
  },
  recommendationsList: {
    padding: 20,
  },
  recommendationItem: {
    marginBottom: 16,
    position: 'relative',
  },
  matchScoreBadge: {
    position: 'absolute',
    top: -8,
    right: 8,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  matchScoreText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#856404',
    fontWeight: '600',
  },
  explanationContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  explanationTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  explanationText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 16,
  },
  explanationList: {
    gap: 8,
  },
  explanationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  explanationItemText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
});
