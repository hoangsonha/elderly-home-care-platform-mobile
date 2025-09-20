import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  StyleSheet,
  View
} from 'react-native';

import { ThemedText } from '@/components/themed-text';

// Helper functions for rendering new tabs
export const renderMedicalTab = (profile: any) => (
  <View style={styles.tabContent}>
    {/* Underlying Diseases */}
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Bệnh nền</ThemedText>
      {profile.medicalConditions.underlyingDiseases?.map((disease: string, index: number) => (
        <View key={index} style={styles.diseaseCard}>
          <View style={styles.diseaseIcon}>
            <Ionicons name="medical" size={20} color="#dc3545" />
          </View>
          <View style={styles.diseaseInfo}>
            <ThemedText style={styles.diseaseName}>{disease}</ThemedText>
            <ThemedText style={styles.diseaseStatus}>Đang điều trị</ThemedText>
          </View>
        </View>
      ))}
    </View>

    {/* Special Conditions */}
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Tình trạng đặc biệt</ThemedText>
      {profile.medicalConditions.specialConditions?.map((condition: string, index: number) => (
        <View key={index} style={styles.conditionCard}>
          <Ionicons name="alert-circle" size={16} color="#ffc107" />
          <ThemedText style={styles.conditionText}>{condition}</ThemedText>
        </View>
      ))}
    </View>

    {/* Current Medications */}
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Thuốc đang sử dụng</ThemedText>
      {profile.medicalConditions.medications?.map((med: any, index: number) => (
        <View key={index} style={styles.medicationCard}>
          <View style={styles.medicationIcon}>
            <Ionicons name="medical" size={20} color="#4ECDC4" />
          </View>
          <View style={styles.medicationInfo}>
            <ThemedText style={styles.medicationName}>{med.name}</ThemedText>
            <ThemedText style={styles.medicationDosage}>{med.dosage}</ThemedText>
            <ThemedText style={styles.medicationFrequency}>{med.frequency}</ThemedText>
          </View>
        </View>
      ))}
    </View>

    {/* Allergies */}
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Dị ứng</ThemedText>
      <View style={styles.allergiesContainer}>
        {profile.medicalConditions.allergies?.map((allergy: string, index: number) => (
          <View key={index} style={styles.allergyTag}>
            <Ionicons name="warning" size={14} color="#dc3545" />
            <ThemedText style={styles.allergyText}>{allergy}</ThemedText>
          </View>
        ))}
      </View>
    </View>
  </View>
);

export const renderIndependenceTab = (profile: any) => {
  const getIndependenceColor = (level: string) => {
    switch (level) {
      case 'independent': return '#28a745';
      case 'assisted': return '#ffc107';
      case 'dependent': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getIndependenceText = (level: string) => {
    switch (level) {
      case 'independent': return 'Tự lập';
      case 'assisted': return 'Cần hỗ trợ';
      case 'dependent': return 'Phụ thuộc';
      default: return 'Không rõ';
    }
  };

  const independenceItems = [
    { key: 'eating', label: 'Ăn uống', icon: 'restaurant' },
    { key: 'bathing', label: 'Tắm rửa', icon: 'water' },
    { key: 'mobility', label: 'Di chuyển', icon: 'walk' },
    { key: 'toileting', label: 'Đi vệ sinh', icon: 'home' },
    { key: 'dressing', label: 'Mặc quần áo', icon: 'shirt' },
  ];

  return (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Mức độ tự lập</ThemedText>
        {independenceItems.map((item, index) => (
          <View key={index} style={styles.independenceCard}>
            <View style={styles.independenceIcon}>
              <Ionicons name={item.icon as any} size={20} color="#4ECDC4" />
            </View>
            <View style={styles.independenceInfo}>
              <ThemedText style={styles.independenceLabel}>{item.label}</ThemedText>
              <View style={[
                styles.independenceStatus,
                { backgroundColor: getIndependenceColor(profile.independenceLevel[item.key]) + '20' }
              ]}>
                <ThemedText style={[
                  styles.independenceStatusText,
                  { color: getIndependenceColor(profile.independenceLevel[item.key]) }
                ]}>
                  {getIndependenceText(profile.independenceLevel[item.key])}
                </ThemedText>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export const renderNeedsTab = (profile: any) => {
  const needsItems = [
    { key: 'conversation', label: 'Trò chuyện', icon: 'chatbubbles' },
    { key: 'reminders', label: 'Nhắc nhở', icon: 'alarm' },
    { key: 'dietSupport', label: 'Chế độ ăn', icon: 'nutrition' },
    { key: 'exercise', label: 'Vận động', icon: 'fitness' },
    { key: 'medicationManagement', label: 'Quản lý thuốc', icon: 'medical' },
    { key: 'companionship', label: 'Đồng hành', icon: 'people' },
  ];

  // Chỉ lấy những nhu cầu cần thiết
  const necessaryNeeds = needsItems.filter(item => profile.careNeeds[item.key]);

  return (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Nhu cầu chăm sóc cần thiết</ThemedText>
        {necessaryNeeds.length > 0 ? (
          necessaryNeeds.map((item, index) => (
            <View key={index} style={styles.needCard}>
              <View style={styles.needIcon}>
                <Ionicons 
                  name={item.icon as any} 
                  size={20} 
                  color="#28a745" 
                />
              </View>
              <View style={styles.needInfo}>
                <ThemedText style={styles.needLabel}>{item.label}</ThemedText>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={48} color="#28a745" />
            <ThemedText style={styles.emptyStateText}>
              Không có nhu cầu chăm sóc đặc biệt
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
};

export const renderPreferencesTab = (profile: any) => (
  <View style={styles.tabContent}>
    {/* Hobbies */}
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Sở thích</ThemedText>
      <View style={styles.tagsContainer}>
        {profile.preferences.hobbies?.map((hobby: string, index: number) => (
          <View key={index} style={styles.hobbyTag}>
            <Ionicons name="star" size={14} color="#ffc107" />
            <ThemedText style={styles.hobbyText}>{hobby}</ThemedText>
          </View>
        ))}
      </View>
    </View>

    {/* Favorite Activities */}
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Hoạt động yêu thích</ThemedText>
      <View style={styles.tagsContainer}>
        {profile.preferences.favoriteActivities?.map((activity: string, index: number) => (
          <View key={index} style={styles.activityTag}>
            <Ionicons name="happy" size={14} color="#4ECDC4" />
            <ThemedText style={styles.activityText}>{activity}</ThemedText>
          </View>
        ))}
      </View>
    </View>

    {/* Music & TV */}
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Giải trí</ThemedText>
      <View style={styles.infoItem}>
        <Ionicons name="musical-notes" size={16} color="#6c757d" />
        <View style={styles.infoText}>
          <ThemedText style={styles.infoLabel}>Âm nhạc</ThemedText>
          <ThemedText style={styles.infoValue}>{profile.preferences.musicPreference || 'Không có'}</ThemedText>
        </View>
      </View>
      
      <View style={styles.infoItem}>
        <Ionicons name="tv" size={16} color="#6c757d" />
        <View style={styles.infoText}>
          <ThemedText style={styles.infoLabel}>Chương trình TV</ThemedText>
          <ThemedText style={styles.infoValue}>
            {profile.preferences.tvShows?.join(', ') || 'Không có'}
          </ThemedText>
        </View>
      </View>
    </View>

    {/* Food Preferences */}
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Món ăn yêu thích</ThemedText>
      <View style={styles.tagsContainer}>
        {profile.preferences.foodPreferences?.map((food: string, index: number) => (
          <View key={index} style={styles.foodTag}>
            <Ionicons name="restaurant" size={14} color="#28a745" />
            <ThemedText style={styles.foodText}>{food}</ThemedText>
          </View>
        ))}
      </View>
    </View>
  </View>
);

export const renderBudgetTab = (profile: any) => (
  <View style={styles.tabContent}>
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Thông tin ngân sách</ThemedText>
      
      <View style={styles.budgetCard}>
        <View style={styles.budgetIcon}>
          <Ionicons name="time" size={24} color="#4ECDC4" />
        </View>
        <View style={styles.budgetInfo}>
          <ThemedText style={styles.budgetLabel}>Giá theo giờ</ThemedText>
          <ThemedText style={styles.budgetValue}>{profile.budget?.hourlyRate || 'Chưa xác định'}</ThemedText>
        </View>
      </View>

      <View style={styles.budgetCard}>
        <View style={styles.budgetIcon}>
          <Ionicons name="calendar" size={24} color="#28a745" />
        </View>
        <View style={styles.budgetInfo}>
          <ThemedText style={styles.budgetLabel}>Ngân sách tháng</ThemedText>
          <ThemedText style={styles.budgetValue}>{profile.budget?.monthlyBudget || 'Chưa xác định'}</ThemedText>
        </View>
      </View>

      <View style={styles.budgetCard}>
        <View style={styles.budgetIcon}>
          <Ionicons name="card" size={24} color="#ffc107" />
        </View>
        <View style={styles.budgetInfo}>
          <ThemedText style={styles.budgetLabel}>Phương thức thanh toán</ThemedText>
          <ThemedText style={styles.budgetValue}>{profile.budget?.paymentMethod || 'Chưa xác định'}</ThemedText>
        </View>
      </View>
    </View>
  </View>
);

export const renderEnvironmentTab = (profile: any) => {
  const getHouseTypeText = (type: string) => {
    switch (type) {
      case 'private_house': return 'Nhà riêng';
      case 'apartment': return 'Căn hộ chung cư';
      case 'nursing_home': return 'Viện dưỡng lão';
      default: return 'Khác';
    }
  };

  return (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Môi trường sống</ThemedText>
        
        <View style={styles.infoItem}>
          <Ionicons name="home" size={16} color="#6c757d" />
          <View style={styles.infoText}>
            <ThemedText style={styles.infoLabel}>Loại nhà ở</ThemedText>
            <ThemedText style={styles.infoValue}>
              {getHouseTypeText(profile.livingEnvironment.houseType)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="people" size={16} color="#6c757d" />
          <View style={styles.infoText}>
            <ThemedText style={styles.infoLabel}>Sống cùng</ThemedText>
            <ThemedText style={styles.infoValue}>
              {profile.livingEnvironment.livingWith?.join(', ') || 'Không có'}
            </ThemedText>
          </View>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="location" size={16} color="#6c757d" />
          <View style={styles.infoText}>
            <ThemedText style={styles.infoLabel}>Môi trường xung quanh</ThemedText>
            <ThemedText style={styles.infoValue}>
              {profile.livingEnvironment.surroundings || 'Không có thông tin'}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Accessibility Features */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Tiện nghi hỗ trợ</ThemedText>
        <View style={styles.tagsContainer}>
          {profile.livingEnvironment.accessibility?.map((item: string, index: number) => (
            <View key={index} style={styles.accessibilityTag}>
              <Ionicons name="checkmark-circle" size={14} color="#28a745" />
              <ThemedText style={styles.accessibilityText}>{item}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export const renderCaregiverTab = (profile: any) => {
  return (
    <View style={styles.tabContent}>
      <ThemedText style={styles.emptyText}>Không có thông tin yêu cầu</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    backgroundColor: 'white',
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    padding: 20,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  diseaseCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  diseaseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  diseaseInfo: {
    flex: 1,
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  diseaseStatus: {
    fontSize: 12,
    color: '#dc3545',
    fontWeight: '500',
  },
  conditionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    gap: 8,
  },
  conditionText: {
    fontSize: 14,
    color: '#856404',
    fontWeight: '500',
  },
  medicationCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  medicationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  medicationDosage: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  medicationFrequency: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '500',
  },
  allergiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8d7da',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  allergyText: {
    fontSize: 12,
    color: '#721c24',
    fontWeight: '500',
  },
  independenceCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  independenceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  independenceInfo: {
    flex: 1,
  },
  independenceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  independenceStatus: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  independenceStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  needCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  needIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  needInfo: {
    flex: 1,
  },
  needLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  needStatus: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  needStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hobbyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  hobbyText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '500',
  },
  activityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f4fe',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  activityText: {
    fontSize: 12,
    color: '#0c5460',
    fontWeight: '500',
  },
  foodTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d4edda',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  foodText: {
    fontSize: 12,
    color: '#155724',
    fontWeight: '500',
  },
  budgetCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  budgetIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  budgetInfo: {
    flex: 1,
  },
  budgetLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  budgetValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  accessibilityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d4edda',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  accessibilityText: {
    fontSize: 12,
    color: '#155724',
    fontWeight: '500',
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  skillText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
});
