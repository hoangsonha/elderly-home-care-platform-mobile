import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '../themed-text';

interface ProfilePreviewProps {
  profile: any;
}

export const ProfilePreview: React.FC<ProfilePreviewProps> = ({ profile }) => {
  const getIndependenceText = (level: string) => {
    switch (level) {
      case 'independent': return 'Tự lập';
      case 'assisted': return 'Cần hỗ trợ';
      case 'dependent': return 'Phụ thuộc';
      default: return 'Không rõ';
    }
  };

  const getHealthStatusText = (status: string) => {
    switch (status) {
      case 'good': return 'Tốt';
      case 'moderate': return 'Trung bình';
      case 'weak': return 'Yếu';
      default: return 'Chưa xác định';
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'good': return '#27AE60';
      case 'moderate': return '#F39C12';
      case 'weak': return '#E74C3C';
      default: return '#95A5A6';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Personal Info - Compact */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Thông tin cơ bản</ThemedText>
        <View style={styles.compactGrid}>
          <View style={styles.compactItem}>
            <Ionicons name="person" size={14} color="#68C2E8" />
            <ThemedText style={styles.compactValue} numberOfLines={1}>{profile.personalInfo.name}</ThemedText>
          </View>
          <View style={styles.compactItem}>
            <Ionicons name="calendar" size={14} color="#68C2E8" />
            <ThemedText style={styles.compactValue}>{profile.personalInfo.age} tuổi</ThemedText>
          </View>
          <View style={styles.compactItem}>
            <Ionicons name="male-female" size={14} color="#68C2E8" />
            <ThemedText style={styles.compactValue}>
              {profile.personalInfo.gender === 'male' ? 'Nam' : profile.personalInfo.gender === 'female' ? 'Nữ' : 'Khác'}
            </ThemedText>
          </View>
          {profile.personalInfo.location && (
            <View style={styles.compactItemFull}>
              <Ionicons name="location" size={14} color="#68C2E8" />
              <ThemedText style={styles.compactValue} numberOfLines={1}>
                {profile.personalInfo.location.address && profile.personalInfo.location.address !== 'Chưa có địa chỉ'
                  ? profile.personalInfo.location.address
                  : `Tọa độ: ${profile.personalInfo.location.latitude.toFixed(4)}, ${profile.personalInfo.location.longitude.toFixed(4)}`}
              </ThemedText>
            </View>
          )}
          {profile.personalInfo.healthStatus && (
            <View style={styles.compactItem}>
              <Ionicons name="medical" size={14} color={getHealthStatusColor(profile.personalInfo.healthStatus)} />
              <ThemedText style={[styles.compactValue, { color: getHealthStatusColor(profile.personalInfo.healthStatus) }]}>
                {getHealthStatusText(profile.personalInfo.healthStatus)}
              </ThemedText>
            </View>
          )}
          {profile.personalInfo.weight && (
            <View style={styles.compactItem}>
              <Ionicons name="scale" size={14} color="#68C2E8" />
              <ThemedText style={styles.compactValue}>{profile.personalInfo.weight} kg</ThemedText>
            </View>
          )}
          {profile.personalInfo.height && (
            <View style={styles.compactItem}>
              <Ionicons name="resize" size={14} color="#68C2E8" />
              <ThemedText style={styles.compactValue}>{profile.personalInfo.height} cm</ThemedText>
            </View>
          )}
          {profile.personalInfo.bloodType && (
            <View style={styles.compactItem}>
              <Ionicons name="water" size={14} color="#68C2E8" />
              <ThemedText style={styles.compactValue}>Nhóm máu: {profile.personalInfo.bloodType}</ThemedText>
            </View>
          )}
          {profile.personalInfo.phoneNumber && (
            <View style={styles.compactItemFull}>
              <Ionicons name="call" size={14} color="#68C2E8" />
              <ThemedText style={styles.compactValue}>{profile.personalInfo.phoneNumber}</ThemedText>
            </View>
          )}
        </View>
      </View>

      {/* Medical Conditions - Compact */}
      {(profile.medicalConditions.underlyingDiseases.length > 0 || 
        profile.medicalConditions.specialConditions.length > 0 || 
        profile.medicalConditions.allergies.length > 0 ||
        profile.medicalConditions.medications.length > 0) && (
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Thông tin y tế</ThemedText>
          
          {profile.medicalConditions.underlyingDiseases.length > 0 && (
            <View style={styles.tagContainer}>
              <ThemedText style={styles.tagLabel}>Bệnh nền:</ThemedText>
              <View style={styles.tags}>
                {profile.medicalConditions.underlyingDiseases.slice(0, 3).map((item: string, idx: number) => (
                  <View key={idx} style={styles.tag}>
                    <ThemedText style={styles.tagText}>{item}</ThemedText>
                  </View>
                ))}
                {profile.medicalConditions.underlyingDiseases.length > 3 && (
                  <ThemedText style={styles.moreTag}>+{profile.medicalConditions.underlyingDiseases.length - 3}</ThemedText>
                )}
              </View>
            </View>
          )}

          {profile.medicalConditions.specialConditions.length > 0 && (
            <View style={styles.tagContainer}>
              <ThemedText style={styles.tagLabel}>Tình trạng đặc biệt:</ThemedText>
              <View style={styles.tags}>
                {profile.medicalConditions.specialConditions.slice(0, 3).map((item: string, idx: number) => (
                  <View key={idx} style={styles.tag}>
                    <ThemedText style={styles.tagText}>{item}</ThemedText>
                  </View>
                ))}
                {profile.medicalConditions.specialConditions.length > 3 && (
                  <ThemedText style={styles.moreTag}>+{profile.medicalConditions.specialConditions.length - 3}</ThemedText>
                )}
              </View>
            </View>
          )}

          {profile.medicalConditions.allergies.length > 0 && (
            <View style={styles.tagContainer}>
              <ThemedText style={styles.tagLabel}>Dị ứng:</ThemedText>
              <View style={styles.tags}>
                {profile.medicalConditions.allergies.slice(0, 3).map((item: string, idx: number) => (
                  <View key={idx} style={styles.tag}>
                    <ThemedText style={styles.tagText}>{item}</ThemedText>
                  </View>
                ))}
                {profile.medicalConditions.allergies.length > 3 && (
                  <ThemedText style={styles.moreTag}>+{profile.medicalConditions.allergies.length - 3}</ThemedText>
                )}
              </View>
            </View>
          )}

          {profile.medicalConditions.medications.length > 0 && (
            <View style={styles.tagContainer}>
              <ThemedText style={styles.tagLabel}>Thuốc đang sử dụng:</ThemedText>
              {profile.medicalConditions.medications.slice(0, 2).map((med: any, idx: number) => (
                <View key={idx} style={styles.medicationItem}>
                  <ThemedText style={styles.medicationText}>
                    • {med.name} - {med.dosage} ({med.frequency})
                  </ThemedText>
                </View>
              ))}
              {profile.medicalConditions.medications.length > 2 && (
                <ThemedText style={styles.moreText}>+{profile.medicalConditions.medications.length - 2} thuốc khác</ThemedText>
              )}
            </View>
          )}

          {profile.personalInfo.healthNote && (
            <View style={styles.noteContainer}>
              <ThemedText style={styles.noteLabel}>Lưu ý sức khỏe:</ThemedText>
              <ThemedText style={styles.noteText} numberOfLines={2}>{profile.personalInfo.healthNote}</ThemedText>
            </View>
          )}
        </View>
      )}

      {/* Independence Level - Compact */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Mức độ tự lập</ThemedText>
        <View style={styles.independenceGrid}>
          {Object.entries(profile.independenceLevel).map(([key, value]) => (
            <View key={key} style={styles.independenceCompact}>
              <ThemedText style={styles.independenceLabelCompact}>
                {key === 'eating' && 'Ăn uống'}
                {key === 'bathing' && 'Tắm rửa'}
                {key === 'mobility' && 'Di chuyển'}
                {key === 'dressing' && 'Mặc quần áo'}
                {key === 'toileting' && 'Vệ sinh'}
              </ThemedText>
              <View style={[styles.independenceBadge, { backgroundColor: value === 'independent' ? '#E8F5E9' : value === 'assisted' ? '#FFF3E0' : '#FFEBEE' }]}>
                <ThemedText style={[styles.independenceBadgeText, { color: value === 'independent' ? '#27AE60' : value === 'assisted' ? '#F39C12' : '#E74C3C' }]}>
                  {getIndependenceText(value as string)}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Care Requirements - Compact */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Yêu cầu chăm sóc</ThemedText>
        <View style={styles.compactGrid}>
          <View style={styles.compactItem}>
            <ThemedText style={styles.compactLabel}>Mức độ:</ThemedText>
            <ThemedText style={styles.compactValue}>
              {profile.caregiverRequirements.careLevel === 1 ? 'Cơ bản' :
               profile.caregiverRequirements.careLevel === 2 ? 'Trung bình' :
               profile.caregiverRequirements.careLevel === 3 ? 'Nâng cao' : 'Chuyên biệt'}
            </ThemedText>
          </View>
          {(profile.caregiverRequirements.customRequiredSkills.length > 0 || profile.caregiverRequirements.requiredSkills.length > 0) && (
            <View style={styles.tagContainer}>
              <ThemedText style={styles.tagLabel}>Kỹ năng bắt buộc:</ThemedText>
              <View style={styles.tags}>
                {[...profile.caregiverRequirements.requiredSkills, ...profile.caregiverRequirements.customRequiredSkills].slice(0, 3).map((skill: string, idx: number) => (
                  <View key={idx} style={styles.tag}>
                    <ThemedText style={styles.tagText}>{skill}</ThemedText>
                  </View>
                ))}
                {([...profile.caregiverRequirements.requiredSkills, ...profile.caregiverRequirements.customRequiredSkills].length > 3) && (
                  <ThemedText style={styles.moreTag}>+{[...profile.caregiverRequirements.requiredSkills, ...profile.caregiverRequirements.customRequiredSkills].length - 3}</ThemedText>
                )}
              </View>
            </View>
          )}
          {(profile.caregiverRequirements.customPrioritySkills.length > 0 || profile.caregiverRequirements.prioritySkills.length > 0) && (
            <View style={styles.tagContainer}>
              <ThemedText style={styles.tagLabel}>Kỹ năng ưu tiên:</ThemedText>
              <View style={styles.tags}>
                {[...profile.caregiverRequirements.prioritySkills, ...profile.caregiverRequirements.customPrioritySkills].slice(0, 3).map((skill: string, idx: number) => (
                  <View key={idx} style={styles.tag}>
                    <ThemedText style={styles.tagText}>{skill}</ThemedText>
                  </View>
                ))}
                {([...profile.caregiverRequirements.prioritySkills, ...profile.caregiverRequirements.customPrioritySkills].length > 3) && (
                  <ThemedText style={styles.moreTag}>+{[...profile.caregiverRequirements.prioritySkills, ...profile.caregiverRequirements.customPrioritySkills].length - 3}</ThemedText>
                )}
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Preferences - Compact */}
      {(profile.preferences.hobbies.length > 0 || 
        profile.preferences.favoriteActivities.length > 0 || 
        profile.preferences.foodPreferences.length > 0) && (
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Sở thích</ThemedText>
          {profile.preferences.hobbies.length > 0 && (
            <View style={styles.tagContainer}>
              <ThemedText style={styles.tagLabel}>Sở thích:</ThemedText>
              <View style={styles.tags}>
                {profile.preferences.hobbies.slice(0, 4).map((item: string, idx: number) => (
                  <View key={idx} style={styles.tag}>
                    <ThemedText style={styles.tagText}>{item}</ThemedText>
                  </View>
                ))}
                {profile.preferences.hobbies.length > 4 && (
                  <ThemedText style={styles.moreTag}>+{profile.preferences.hobbies.length - 4}</ThemedText>
                )}
              </View>
            </View>
          )}
          {profile.preferences.favoriteActivities.length > 0 && (
            <View style={styles.tagContainer}>
              <ThemedText style={styles.tagLabel}>Hoạt động yêu thích:</ThemedText>
              <View style={styles.tags}>
                {profile.preferences.favoriteActivities.slice(0, 4).map((item: string, idx: number) => (
                  <View key={idx} style={styles.tag}>
                    <ThemedText style={styles.tagText}>{item}</ThemedText>
                  </View>
                ))}
                {profile.preferences.favoriteActivities.length > 4 && (
                  <ThemedText style={styles.moreTag}>+{profile.preferences.favoriteActivities.length - 4}</ThemedText>
                )}
              </View>
            </View>
          )}
          {profile.preferences.foodPreferences.length > 0 && (
            <View style={styles.tagContainer}>
              <ThemedText style={styles.tagLabel}>Món ăn yêu thích:</ThemedText>
              <View style={styles.tags}>
                {profile.preferences.foodPreferences.slice(0, 4).map((item: string, idx: number) => (
                  <View key={idx} style={styles.tag}>
                    <ThemedText style={styles.tagText}>{item}</ThemedText>
                  </View>
                ))}
                {profile.preferences.foodPreferences.length > 4 && (
                  <ThemedText style={styles.moreTag}>+{profile.preferences.foodPreferences.length - 4}</ThemedText>
                )}
              </View>
            </View>
          )}
        </View>
      )}

      {/* Emergency Contacts - Compact */}
      {profile.emergencyContacts.length > 0 && (
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Liên hệ khẩn cấp</ThemedText>
          <View style={styles.contactsList}>
            {profile.emergencyContacts.slice(0, 3).map((contact: any, idx: number) => (
              <View key={idx} style={styles.contactItem}>
                <Ionicons name="call" size={14} color="#68C2E8" />
                <ThemedText style={styles.contactText} numberOfLines={1}>
                  {contact.name} ({contact.relationship}) - {contact.phone}
                </ThemedText>
              </View>
            ))}
            {profile.emergencyContacts.length > 3 && (
              <ThemedText style={styles.moreText}>+{profile.emergencyContacts.length - 3} liên hệ khác</ThemedText>
            )}
          </View>
        </View>
      )}

      {/* Note */}
      {profile.personalInfo.note && (
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Ghi chú</ThemedText>
          <ThemedText style={styles.noteText} numberOfLines={3}>{profile.personalInfo.note}</ThemedText>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
  },
  compactGrid: {
    gap: 10,
  },
  compactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactItemFull: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  compactLabel: {
    fontSize: 13,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  compactValue: {
    fontSize: 13,
    color: '#2C3E50',
    fontWeight: '500',
    flex: 1,
  },
  tagContainer: {
    marginBottom: 10,
  },
  tagLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 6,
    fontWeight: '500',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  tag: {
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#68C2E8',
  },
  tagText: {
    fontSize: 11,
    color: '#2C3E50',
    fontWeight: '500',
  },
  moreTag: {
    fontSize: 11,
    color: '#68C2E8',
    fontWeight: '600',
  },
  independenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  independenceCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: '45%',
  },
  independenceLabelCompact: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '500',
  },
  independenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 'auto',
  },
  independenceBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  noteContainer: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F39C12',
  },
  noteLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
    fontWeight: '600',
  },
  noteText: {
    fontSize: 12,
    color: '#2C3E50',
    lineHeight: 18,
  },
  contactsList: {
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  contactText: {
    fontSize: 12,
    color: '#2C3E50',
    flex: 1,
  },
  moreText: {
    fontSize: 11,
    color: '#68C2E8',
    fontStyle: 'italic',
    marginTop: 4,
  },
  medicationItem: {
    marginBottom: 6,
  },
  medicationText: {
    fontSize: 12,
    color: '#2C3E50',
    lineHeight: 18,
  },
});
