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
      {profile.medicalConditions.underlyingDiseases?.length > 0 ? (
        profile.medicalConditions.underlyingDiseases.map((disease: string, index: number) => (
          <View key={index} style={styles.diseaseCard}>
            <View style={styles.diseaseIcon}>
              <Ionicons name="medical" size={20} color="#dc3545" />
            </View>
            <View style={styles.diseaseInfo}>
              <ThemedText style={styles.diseaseName}>{disease}</ThemedText>
            </View>
          </View>
        ))
      ) : (
        <ThemedText style={styles.emptyText}>Không có thông tin</ThemedText>
      )}
    </View>

    {/* Special Conditions */}
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Tình trạng đặc biệt</ThemedText>
      {profile.medicalConditions.specialConditions?.length > 0 ? (
        profile.medicalConditions.specialConditions.map((condition: string, index: number) => (
          <View key={index} style={styles.conditionCard}>
            <Ionicons name="alert-circle" size={16} color="#ffc107" />
            <ThemedText style={styles.conditionText}>{condition}</ThemedText>
          </View>
        ))
      ) : (
        <ThemedText style={styles.emptyText}>Không có thông tin</ThemedText>
      )}
    </View>

    {/* Current Medications */}
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Thuốc đang sử dụng</ThemedText>
      {profile.medicalConditions.medications?.length > 0 ? (
        profile.medicalConditions.medications.map((med: any, index: number) => (
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
        ))
      ) : (
        <ThemedText style={styles.emptyText}>Không có thông tin</ThemedText>
      )}
    </View>

    {/* Allergies */}
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Dị ứng</ThemedText>
      {profile.medicalConditions.allergies?.length > 0 ? (
        <View style={styles.allergiesContainer}>
          {profile.medicalConditions.allergies.map((allergy: string, index: number) => (
            <View key={index} style={styles.allergyTag}>
              <Ionicons name="warning" size={14} color="#dc3545" />
              <ThemedText style={styles.allergyText}>{allergy}</ThemedText>
            </View>
          ))}
        </View>
      ) : (
        <ThemedText style={styles.emptyText}>Không có thông tin</ThemedText>
      )}
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
      default: return 'Không có thông tin';
    }
  };

  const independenceItems = [
    { key: 'eating', label: 'Ăn uống', icon: 'restaurant' },
    { key: 'bathing', label: 'Tắm rửa', icon: 'water' },
    { key: 'toileting', label: 'Vệ sinh', icon: 'medical' },
    { key: 'mobility', label: 'Di chuyển', icon: 'walk' },
    { key: 'dressing', label: 'Mặc quần áo', icon: 'shirt' },
  ];

  return (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Mức độ tự lập</ThemedText>
        {independenceItems.map((item, index) => {
          const level = profile.independenceLevel[item.key] || 'independent';
          return (
            <View key={index} style={styles.independenceCard}>
              <View style={styles.independenceIcon}>
                <Ionicons name={item.icon as any} size={20} color="#4ECDC4" />
              </View>
              <View style={styles.independenceInfo}>
                <ThemedText style={styles.independenceLabel}>{item.label}</ThemedText>
                <View style={[
                  styles.independenceStatus,
                  { backgroundColor: getIndependenceColor(level) + '20' }
                ]}>
                  <ThemedText style={[
                    styles.independenceStatusText,
                    { color: getIndependenceColor(level) }
                  ]}>
                    {getIndependenceText(level)}
                  </ThemedText>
                </View>
              </View>
            </View>
          );
        })}
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
              Không có thông tin
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
      {profile.preferences.hobbies?.length > 0 ? (
        <View style={styles.tagsContainer}>
          {profile.preferences.hobbies.map((hobby: string, index: number) => (
            <View key={index} style={styles.hobbyTag}>
              <Ionicons name="star" size={14} color="#ffc107" />
              <ThemedText style={styles.hobbyText}>{hobby}</ThemedText>
            </View>
          ))}
        </View>
      ) : (
        <ThemedText style={styles.emptyText}>Không có thông tin</ThemedText>
      )}
    </View>

    {/* Favorite Activities */}
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Hoạt động yêu thích</ThemedText>
      {profile.preferences.favoriteActivities?.length > 0 ? (
        <View style={styles.tagsContainer}>
          {profile.preferences.favoriteActivities.map((activity: string, index: number) => (
            <View key={index} style={styles.activityTag}>
              <Ionicons name="happy" size={14} color="#4ECDC4" />
              <ThemedText style={styles.activityText}>{activity}</ThemedText>
            </View>
          ))}
        </View>
      ) : (
        <ThemedText style={styles.emptyText}>Không có thông tin</ThemedText>
      )}
    </View>

    {/* Food Preferences */}
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Món ăn yêu thích</ThemedText>
      {profile.preferences.foodPreferences?.length > 0 ? (
        <View style={styles.tagsContainer}>
          {profile.preferences.foodPreferences.map((food: string, index: number) => (
            <View key={index} style={styles.foodTag}>
              <Ionicons name="restaurant" size={14} color="#28a745" />
              <ThemedText style={styles.foodText}>{food}</ThemedText>
            </View>
          ))}
        </View>
      ) : (
        <ThemedText style={styles.emptyText}>Không có thông tin</ThemedText>
      )}
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
          <ThemedText style={styles.budgetValue}>{profile.budget?.hourlyRate || 'Không có thông tin'}</ThemedText>
        </View>
      </View>

      <View style={styles.budgetCard}>
        <View style={styles.budgetIcon}>
          <Ionicons name="calendar" size={24} color="#28a745" />
        </View>
        <View style={styles.budgetInfo}>
          <ThemedText style={styles.budgetLabel}>Ngân sách tháng</ThemedText>
          <ThemedText style={styles.budgetValue}>{profile.budget?.monthlyBudget || 'Không có thông tin'}</ThemedText>
        </View>
      </View>

      <View style={styles.budgetCard}>
        <View style={styles.budgetIcon}>
          <Ionicons name="card" size={24} color="#ffc107" />
        </View>
        <View style={styles.budgetInfo}>
          <ThemedText style={styles.budgetLabel}>Phương thức thanh toán</ThemedText>
          <ThemedText style={styles.budgetValue}>{profile.budget?.paymentMethod || 'Không có thông tin'}</ThemedText>
        </View>
      </View>
    </View>
  </View>
);

export const renderEnvironmentTab = (profile: any) => {
  const extendedProfile = profile as any;
  const careRequirement = extendedProfile.careRequirement || {};
  
  // Helper function to format gender
  const formatGender = (gender?: string) => {
    if (!gender) return 'Không yêu cầu';
    return gender === 'MALE' ? 'Nam' : gender === 'FEMALE' ? 'Nữ' : gender === 'OTHER' ? 'Khác' : gender;
  };

  // Helper function to format rating
  const formatRating = (rating?: number[]) => {
    if (!rating || !Array.isArray(rating) || rating.length !== 2) return 'Không yêu cầu';
    return `${rating[0]} - ${rating[1]} sao`;
  };

  // Helper function to format age range
  const formatAgeRange = (age?: number[]) => {
    if (!age || !Array.isArray(age) || age.length !== 2) return 'Không yêu cầu';
    return `${age[0]} - ${age[1]} tuổi`;
  };

  return (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Yêu cầu với người chăm sóc</ThemedText>
        
        {/* Age Range */}
        <View style={styles.infoItem}>
          <Ionicons name="calendar" size={16} color="#6c757d" />
          <View style={styles.infoTextContainer}>
            <ThemedText style={styles.infoLabel}>Độ tuổi</ThemedText>
            <ThemedText style={styles.infoValue}>
              {formatAgeRange(careRequirement.age)}
            </ThemedText>
          </View>
        </View>

        {/* Gender */}
        <View style={styles.infoItem}>
          <Ionicons name="person" size={16} color="#6c757d" />
          <View style={styles.infoTextContainer}>
            <ThemedText style={styles.infoLabel}>Giới tính</ThemedText>
            <ThemedText style={styles.infoValue}>
              {formatGender(careRequirement.gender)}
            </ThemedText>
          </View>
        </View>

        {/* Experience */}
        {careRequirement.experience && (
          <View style={styles.infoItem}>
            <Ionicons name="school" size={16} color="#6c757d" />
            <View style={styles.infoTextContainer}>
              <ThemedText style={styles.infoLabel}>Kinh nghiệm tối thiểu</ThemedText>
              <ThemedText style={styles.infoValue}>
                {careRequirement.experience} năm
              </ThemedText>
            </View>
          </View>
        )}

        {/* Rating */}
        <View style={styles.infoItem}>
          <Ionicons name="star" size={16} color="#6c757d" />
          <View style={styles.infoTextContainer}>
            <ThemedText style={styles.infoLabel}>Đánh giá</ThemedText>
            <ThemedText style={styles.infoValue}>
              {formatRating(careRequirement.rating)}
            </ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
};

export const renderCaregiverTab = (profile: any) => {
  return (
    <View style={styles.tabContent}>
      <ThemedText style={styles.emptyText}>Không có thông tin</ThemedText>
    </View>
  );
};

// Default export to fix route warning
export default function ElderlyProfileTabs() {
  return null; // This file only exports helper functions
}

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
  infoTextContainer: {
    flex: 1,
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
