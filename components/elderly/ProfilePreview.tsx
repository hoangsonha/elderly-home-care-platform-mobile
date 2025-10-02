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

  const getIndependenceColor = (level: string) => {
    switch (level) {
      case 'independent': return '#28a745';
      case 'assisted': return '#ffc107';
      case 'dependent': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Personal Info */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Thông tin cơ bản</ThemedText>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Ionicons name="person" size={16} color="#6c757d" />
            <View style={styles.infoText}>
              <ThemedText style={styles.infoLabel}>Họ tên</ThemedText>
              <ThemedText style={styles.infoValue}>{profile.personalInfo.name}</ThemedText>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="calendar" size={16} color="#6c757d" />
            <View style={styles.infoText}>
              <ThemedText style={styles.infoLabel}>Tuổi</ThemedText>
              <ThemedText style={styles.infoValue}>{profile.personalInfo.age} tuổi</ThemedText>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="call" size={16} color="#6c757d" />
            <View style={styles.infoText}>
              <ThemedText style={styles.infoLabel}>Số điện thoại</ThemedText>
              <ThemedText style={styles.infoValue}>{profile.personalInfo.phoneNumber}</ThemedText>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="location" size={16} color="#6c757d" />
            <View style={styles.infoText}>
              <ThemedText style={styles.infoLabel}>Địa chỉ</ThemedText>
              <ThemedText style={styles.infoValue} numberOfLines={2}>
                {profile.personalInfo.address}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      {/* Medical Conditions */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Thông tin y tế</ThemedText>
        
        {profile.medicalConditions.underlyingDiseases.length > 0 && (
          <View style={styles.medicalItem}>
            <ThemedText style={styles.medicalLabel}>Bệnh nền:</ThemedText>
            <ThemedText style={styles.medicalValue}>
              {profile.medicalConditions.underlyingDiseases.join(', ')}
            </ThemedText>
          </View>
        )}

        {profile.medicalConditions.specialConditions.length > 0 && (
          <View style={styles.medicalItem}>
            <ThemedText style={styles.medicalLabel}>Tình trạng đặc biệt:</ThemedText>
            <ThemedText style={styles.medicalValue}>
              {profile.medicalConditions.specialConditions.join(', ')}
            </ThemedText>
          </View>
        )}

        {profile.medicalConditions.allergies.length > 0 && (
          <View style={styles.medicalItem}>
            <ThemedText style={styles.medicalLabel}>Dị ứng:</ThemedText>
            <ThemedText style={styles.medicalValue}>
              {profile.medicalConditions.allergies.join(', ')}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Independence Level */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Mức độ tự lập</ThemedText>
        {Object.entries(profile.independenceLevel).map(([key, value]) => (
          <View key={key} style={styles.independenceItem}>
            <ThemedText style={styles.independenceLabel}>
              {key === 'eating' && 'Ăn uống'}
              {key === 'bathing' && 'Tắm rửa'}
              {key === 'mobility' && 'Di chuyển'}
              {key === 'toileting' && 'Đi vệ sinh'}
              {key === 'dressing' && 'Mặc quần áo'}
            </ThemedText>
            <View style={[
              styles.independenceStatus,
              { backgroundColor: getIndependenceColor(value as string) + '20' }
            ]}>
              <ThemedText style={[
                styles.independenceStatusText,
                { color: getIndependenceColor(value as string) }
              ]}>
                {getIndependenceText(value as string)}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>

      {/* Care Needs */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Nhu cầu chăm sóc</ThemedText>
        {Object.entries(profile.careNeeds)
          .filter(([_, value]) => value)
          .map(([key, _]) => (
            <View key={key} style={styles.careNeedItem}>
              <Ionicons name="checkmark-circle" size={16} color="#28a745" />
              <ThemedText style={styles.careNeedText}>
                {key === 'conversation' && 'Trò chuyện'}
                {key === 'reminders' && 'Nhắc nhở'}
                {key === 'dietSupport' && 'Chế độ ăn'}
                {key === 'exercise' && 'Vận động'}
                {key === 'medicationManagement' && 'Quản lý thuốc'}
                {key === 'companionship' && 'Đồng hành'}
              </ThemedText>
            </View>
          ))}
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Sở thích</ThemedText>
        
        {profile.preferences.hobbies.length > 0 && (
          <View style={styles.preferenceItem}>
            <ThemedText style={styles.preferenceLabel}>Sở thích:</ThemedText>
            <ThemedText style={styles.preferenceValue}>
              {profile.preferences.hobbies.join(', ')}
            </ThemedText>
          </View>
        )}

        {profile.preferences.favoriteActivities.length > 0 && (
          <View style={styles.preferenceItem}>
            <ThemedText style={styles.preferenceLabel}>Hoạt động yêu thích:</ThemedText>
            <ThemedText style={styles.preferenceValue}>
              {profile.preferences.favoriteActivities.join(', ')}
            </ThemedText>
          </View>
        )}

        {profile.preferences.foodPreferences.length > 0 && (
          <View style={styles.preferenceItem}>
            <ThemedText style={styles.preferenceLabel}>Món ăn yêu thích:</ThemedText>
            <ThemedText style={styles.preferenceValue}>
              {profile.preferences.foodPreferences.join(', ')}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Living Environment */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Môi trường sống</ThemedText>
        
        <View style={styles.environmentItemInline}>
          <ThemedText style={styles.environmentLabelInline}>Loại nhà ở:</ThemedText>
          <ThemedText style={styles.environmentValueInline}>
            {profile.livingEnvironment.houseType === 'private_house' && 'Nhà riêng'}
            {profile.livingEnvironment.houseType === 'apartment' && 'Căn hộ chung cư'}
            {profile.livingEnvironment.houseType === 'nursing_home' && 'Viện dưỡng lão'}
            {profile.livingEnvironment.houseType === 'other' && 'Khác'}
          </ThemedText>
        </View>

        {profile.livingEnvironment.livingWith.length > 0 && (
          <View style={styles.environmentItem}>
            <ThemedText style={styles.environmentLabel}>Sống cùng:</ThemedText>
            <ThemedText style={styles.environmentValue}>
              {profile.livingEnvironment.livingWith.join(', ')}
            </ThemedText>
          </View>
        )}

        {profile.livingEnvironment.surroundings && (
          <View style={styles.environmentItem}>
            <ThemedText style={styles.environmentLabel}>Môi trường xung quanh:</ThemedText>
            <ThemedText style={styles.environmentValue}>
              {profile.livingEnvironment.surroundings}
            </ThemedText>
          </View>
        )}
      </View>

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
    marginBottom: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
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
  medicalItem: {
    marginBottom: 12,
  },
  medicalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  medicalValue: {
    fontSize: 14,
    color: '#6c757d',
  },
  independenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  independenceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  independenceStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  independenceStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  careNeedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  careNeedText: {
    fontSize: 14,
    color: '#2c3e50',
    marginLeft: 8,
  },
  preferenceItem: {
    marginBottom: 12,
  },
  preferenceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  preferenceValue: {
    fontSize: 14,
    color: '#6c757d',
  },
  environmentItem: {
    marginBottom: 12,
  },
  environmentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  environmentValue: {
    fontSize: 14,
    color: '#6c757d',
  },
  environmentItemInline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  environmentLabelInline: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginRight: 8,
  },
  environmentValueInline: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
});


