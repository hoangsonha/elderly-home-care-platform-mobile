import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfilePreview } from '@/components/elderly/ProfilePreview';
import { ThemedText } from '@/components/themed-text';
import { useErrorNotification, useSuccessNotification } from '@/contexts/NotificationContext';

interface AddElderlyModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddElderlyModal({ visible, onClose, onSuccess }: AddElderlyModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState({
    personalInfo: {
      name: '',
      age: '',
      gender: 'male' as 'male' | 'female',
      phone: '',
      address: '',
      emergencyContact: '',
      relationship: '',
    },
    medicalInfo: {
      healthStatus: 'good' as 'good' | 'fair' | 'poor',
      medicalConditions: [] as string[],
      medications: [] as string[],
      allergies: [] as string[],
      bloodType: '',
      doctorName: '',
      doctorPhone: '',
    },
    independenceLevel: {
      mobility: 'independent' as 'independent' | 'assisted' | 'dependent',
      dailyActivities: 'independent' as 'independent' | 'assisted' | 'dependent',
      cognitiveFunction: 'normal' as 'normal' | 'mild' | 'moderate' | 'severe',
    },
    careNeeds: {
      personalCare: [] as string[],
      medicalCare: [] as string[],
      socialCare: [] as string[],
      specialNeeds: '',
    },
    preferences: {
      preferredActivities: [] as string[],
      dietaryRestrictions: [] as string[],
      communicationStyle: 'verbal' as 'verbal' | 'non-verbal' | 'mixed',
      culturalPreferences: '',
    },
    environment: {
      livingSituation: 'alone' as 'alone' | 'with_family' | 'assisted_living',
      homeAccessibility: 'accessible' as 'accessible' | 'partially_accessible' | 'not_accessible',
      safetyConcerns: [] as string[],
      equipmentNeeded: [] as string[],
    },
    emergencyContacts: [] as Array<{
      id: string;
      name: string;
      relationship: string;
      phone: string;
      isPrimary: boolean;
    }>,
  });

  const { showSuccessTooltip } = useSuccessNotification();
  const { showErrorTooltip } = useErrorNotification();

  const totalSteps = 8;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      // Validate before going to preview step
      if (currentStep === totalSteps - 1) {
        // Validate required fields
        if (!profile.personalInfo.name || !profile.personalInfo.age) {
          showErrorTooltip('Vui lòng điền đầy đủ thông tin cơ bản');
          setCurrentStep(1);
          return;
        }
      }
      
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      if (currentStep === 8) {
        // Từ preview quay về step 7 (emergency contacts)
        setCurrentStep(7);
      } else if (currentStep === 2) {
        // Từ personal info quay về step 1 (personal info)
        setCurrentStep(1);
      } else {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const handleSubmit = () => {
    // Simulate API call
    setTimeout(() => {
      showSuccessTooltip('Tạo hồ sơ người già thành công!');
      onSuccess?.();
      onClose();
      // Reset form
      setCurrentStep(1);
      setProfile({
        personalInfo: {
          name: '',
          age: '',
          gender: 'male',
          phone: '',
          address: '',
          emergencyContact: '',
          relationship: '',
        },
        medicalInfo: {
          healthStatus: 'good',
          medicalConditions: [],
          medications: [],
          allergies: [],
          bloodType: '',
          doctorName: '',
          doctorPhone: '',
        },
        independenceLevel: {
          mobility: 'independent',
          dailyActivities: 'independent',
          cognitiveFunction: 'normal',
        },
        careNeeds: {
          personalCare: [],
          medicalCare: [],
          socialCare: [],
          specialNeeds: '',
        },
        preferences: {
          preferredActivities: [],
          dietaryRestrictions: [],
          communicationStyle: 'verbal',
          culturalPreferences: '',
        },
        environment: {
          livingSituation: 'alone',
          homeAccessibility: 'accessible',
          safetyConcerns: [],
          equipmentNeeded: [],
        },
        emergencyContacts: [],
      });
    }, 2000);
  };

  const renderPersonalInfo = () => (
    <View style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>Thông tin cá nhân</ThemedText>
      <ThemedText style={styles.stepDescription}>
        Nhập thông tin cơ bản về người già
      </ThemedText>
      
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Họ và tên <ThemedText style={styles.requiredMark}>*</ThemedText></ThemedText>
        <TextInput
          style={styles.textInput}
          value={profile.personalInfo.name}
          onChangeText={(text) => setProfile(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, name: text }
          }))}
          placeholder="Nhập họ và tên"
        />
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Tuổi <ThemedText style={styles.requiredMark}>*</ThemedText></ThemedText>
        <TextInput
          style={styles.textInput}
          value={profile.personalInfo.age}
          onChangeText={(text) => setProfile(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, age: text }
          }))}
          placeholder="Nhập tuổi"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Số điện thoại</ThemedText>
        <TextInput
          style={styles.textInput}
          value={profile.personalInfo.phone}
          onChangeText={(text) => setProfile(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, phone: text }
          }))}
          placeholder="Nhập số điện thoại"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Địa chỉ</ThemedText>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={profile.personalInfo.address}
          onChangeText={(text) => setProfile(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, address: text }
          }))}
          placeholder="Nhập địa chỉ"
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  const renderMedicalInfo = () => (
    <View style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>Thông tin y tế</ThemedText>
      <ThemedText style={styles.stepDescription}>
        Nhập thông tin về tình trạng sức khỏe
      </ThemedText>
      
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Tình trạng sức khỏe</ThemedText>
        <View style={styles.radioGroup}>
          {[
            { value: 'good', label: 'Tốt' },
            { value: 'fair', label: 'Trung bình' },
            { value: 'poor', label: 'Yếu' }
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.radioOption}
              onPress={() => setProfile(prev => ({
                ...prev,
                medicalInfo: { ...prev.medicalInfo, healthStatus: option.value as any }
              }))}
            >
              <View style={[
                styles.radioCircle,
                profile.medicalInfo.healthStatus === option.value && styles.radioCircleSelected
              ]}>
                {profile.medicalInfo.healthStatus === option.value && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <ThemedText style={styles.radioLabel}>{option.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Nhóm máu</ThemedText>
        <TextInput
          style={styles.textInput}
          value={profile.medicalInfo.bloodType}
          onChangeText={(text) => setProfile(prev => ({
            ...prev,
            medicalInfo: { ...prev.medicalInfo, bloodType: text }
          }))}
          placeholder="Nhập nhóm máu"
        />
      </View>
    </View>
  );

  const renderIndependenceLevel = () => (
    <View style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>Mức độ độc lập</ThemedText>
      <ThemedText style={styles.stepDescription}>
        Đánh giá khả năng tự chăm sóc
      </ThemedText>
      
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Khả năng di chuyển</ThemedText>
        <View style={styles.radioGroup}>
          {[
            { value: 'independent', label: 'Độc lập' },
            { value: 'assisted', label: 'Cần hỗ trợ' },
            { value: 'dependent', label: 'Phụ thuộc hoàn toàn' }
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.radioOption}
              onPress={() => setProfile(prev => ({
                ...prev,
                independenceLevel: { ...prev.independenceLevel, mobility: option.value as any }
              }))}
            >
              <View style={[
                styles.radioCircle,
                profile.independenceLevel.mobility === option.value && styles.radioCircleSelected
              ]}>
                {profile.independenceLevel.mobility === option.value && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <ThemedText style={styles.radioLabel}>{option.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderCareNeeds = () => (
    <View style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>Nhu cầu chăm sóc</ThemedText>
      <ThemedText style={styles.stepDescription}>
        Xác định các nhu cầu chăm sóc cụ thể
      </ThemedText>
      
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Nhu cầu đặc biệt</ThemedText>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={profile.careNeeds.specialNeeds}
          onChangeText={(text) => setProfile(prev => ({
            ...prev,
            careNeeds: { ...prev.careNeeds, specialNeeds: text }
          }))}
          placeholder="Mô tả nhu cầu đặc biệt"
          multiline
          numberOfLines={4}
        />
      </View>
    </View>
  );

  const renderPreferences = () => (
    <View style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>Sở thích</ThemedText>
      <ThemedText style={styles.stepDescription}>
        Thông tin về sở thích và phong cách sống
      </ThemedText>
      
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Phong cách giao tiếp</ThemedText>
        <View style={styles.radioGroup}>
          {[
            { value: 'verbal', label: 'Nói chuyện' },
            { value: 'non-verbal', label: 'Không nói chuyện' },
            { value: 'mixed', label: 'Hỗn hợp' }
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.radioOption}
              onPress={() => setProfile(prev => ({
                ...prev,
                preferences: { ...prev.preferences, communicationStyle: option.value as any }
              }))}
            >
              <View style={[
                styles.radioCircle,
                profile.preferences.communicationStyle === option.value && styles.radioCircleSelected
              ]}>
                {profile.preferences.communicationStyle === option.value && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <ThemedText style={styles.radioLabel}>{option.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderEnvironment = () => (
    <View style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>Môi trường sống</ThemedText>
      <ThemedText style={styles.stepDescription}>
        Thông tin về môi trường sống hiện tại
      </ThemedText>
      
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Tình trạng sống</ThemedText>
        <View style={styles.radioGroup}>
          {[
            { value: 'alone', label: 'Sống một mình' },
            { value: 'with_family', label: 'Sống với gia đình' },
            { value: 'assisted_living', label: 'Sống trong viện dưỡng lão' }
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.radioOption}
              onPress={() => setProfile(prev => ({
                ...prev,
                environment: { ...prev.environment, livingSituation: option.value as any }
              }))}
            >
              <View style={[
                styles.radioCircle,
                profile.environment.livingSituation === option.value && styles.radioCircleSelected
              ]}>
                {profile.environment.livingSituation === option.value && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <ThemedText style={styles.radioLabel}>{option.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderEmergencyContacts = () => (
    <View style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>Liên hệ khẩn cấp</ThemedText>
      <ThemedText style={styles.stepDescription}>
        Thông tin liên hệ trong trường hợp khẩn cấp
      </ThemedText>
      
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Tên người liên hệ</ThemedText>
        <TextInput
          style={styles.textInput}
          value={profile.personalInfo.emergencyContact}
          onChangeText={(text) => setProfile(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, emergencyContact: text }
          }))}
          placeholder="Nhập tên người liên hệ"
        />
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Mối quan hệ</ThemedText>
        <TextInput
          style={styles.textInput}
          value={profile.personalInfo.relationship}
          onChangeText={(text) => setProfile(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, relationship: text }
          }))}
          placeholder="Con trai, con gái, vợ, chồng..."
        />
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderPersonalInfo();
      case 2: return renderMedicalInfo();
      case 3: return renderIndependenceLevel();
      case 4: return renderCareNeeds();
      case 5: return renderPreferences();
      case 6: return renderEnvironment();
      case 7: return renderEmergencyContacts();
      case 8: return (
        <View style={styles.stepContent}>
          <ThemedText style={styles.stepTitle}>Xem trước hồ sơ</ThemedText>
          
          {/* Profile Information */}
          <View style={styles.previewSection}>
            <ThemedText style={styles.previewSectionTitle}>Thông tin hồ sơ người già</ThemedText>
            <ProfilePreview profile={profile} />
          </View>
        </View>
      );
      default: return renderPersonalInfo();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <ThemedText style={styles.headerTitle}>Tạo hồ sơ người già</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Bước {currentStep} / {totalSteps}
            </ThemedText>
          </View>
          
          <View style={styles.headerActions}>
            {/* Empty space for balance */}
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderCurrentStep()}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.previousButton} onPress={handlePrevious}>
              <ThemedText style={styles.previousButtonText}>Trước</ThemedText>
            </TouchableOpacity>
          )}
          
          <View style={styles.footerSpacer} />
          
          {currentStep < totalSteps ? (
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <ThemedText style={styles.nextButtonText}>Tiếp theo</ThemedText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <ThemedText style={styles.submitButtonText}>Tạo hồ sơ</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  closeButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
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
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  stepContent: {
    paddingVertical: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#6C757D',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  requiredMark: {
    color: '#E74C3C',
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2C3E50',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  radioGroup: {
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#4ECDC4',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4ECDC4',
  },
  radioLabel: {
    fontSize: 16,
    color: '#2C3E50',
  },
  previewSection: {
    marginTop: 20,
  },
  previewSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  footerSpacer: {
    flex: 1,
  },
  previousButton: {
    backgroundColor: '#6C757D',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
  },
  previousButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#28A745',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

