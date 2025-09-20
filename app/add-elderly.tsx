import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfilePreview } from '@/components/elderly/ProfilePreview';
import { ThemedText } from '@/components/themed-text';
import { DynamicContactList } from '@/components/ui/DynamicContactList';
import { DynamicInputList } from '@/components/ui/DynamicInputList';
import { DynamicMedicationList } from '@/components/ui/DynamicMedicationList';
import { useErrorNotification, useSuccessNotification } from '@/contexts/NotificationContext';

const { width } = Dimensions.get('window');

interface ElderlyProfile {
  // Thông tin cơ bản
  personalInfo: {
    name: string;
    age: string;
    dateOfBirth: string;
    address: string;
    bloodType: string;
    weight: string;
    height: string;
    gender: string;
    phoneNumber: string;
  };
  // Bệnh nền & tình trạng đặc biệt
  medicalConditions: {
    underlyingDiseases: string[];
    specialConditions: string[];
    allergies: string[];
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
    }>;
  };
  // Mức độ tự lập
  independenceLevel: {
    eating: 'independent' | 'assisted' | 'dependent';
    bathing: 'independent' | 'assisted' | 'dependent';
    mobility: 'independent' | 'assisted' | 'dependent';
    toileting: 'independent' | 'assisted' | 'dependent';
    dressing: 'independent' | 'assisted' | 'dependent';
  };
  // Nhu cầu chăm sóc
  careNeeds: {
    conversation: boolean;
    reminders: boolean;
    dietSupport: boolean;
    exercise: boolean;
    medicationManagement: boolean;
    companionship: boolean;
  };
  // Sở thích
  preferences: {
    hobbies: string[];
    favoriteActivities: string[];
    musicPreference: string;
    tvShows: string[];
    foodPreferences: string[];
  };
  // Môi trường sống
  livingEnvironment: {
    houseType: 'private_house' | 'apartment' | 'nursing_home' | 'other';
    livingWith: string[];
    accessibility: string[];
    surroundings: string;
  };
  // Yêu cầu người chăm sóc
  caregiverRequirements: {
    preferredGender: 'male' | 'female' | 'no_preference';
    language: string[];
    experience: string;
    smokingAllowed: boolean;
    specialSkills: string[];
  };
  // Liên hệ khẩn cấp
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
  }>;
}

export default function AddElderlyScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<ElderlyProfile>({
    personalInfo: {
      name: '',
      age: '',
      dateOfBirth: '',
      address: '',
      bloodType: '',
      weight: '',
      height: '',
      gender: '',
      phoneNumber: '',
    },
    medicalConditions: {
      underlyingDiseases: [],
      specialConditions: [],
      allergies: [],
      medications: [],
    },
    independenceLevel: {
      eating: 'independent',
      bathing: 'independent',
      mobility: 'independent',
      toileting: 'independent',
      dressing: 'independent',
    },
    careNeeds: {
      conversation: false,
      reminders: false,
      dietSupport: false,
      exercise: false,
      medicationManagement: false,
      companionship: false,
    },
    preferences: {
      hobbies: [],
      favoriteActivities: [],
      musicPreference: '',
      tvShows: [],
      foodPreferences: [],
    },
    livingEnvironment: {
      houseType: 'private_house',
      livingWith: [],
      accessibility: [],
      surroundings: '',
    },
    caregiverRequirements: {
      preferredGender: 'no_preference',
      language: [],
      experience: '',
      smokingAllowed: false,
      specialSkills: [],
    },
    emergencyContacts: [],
  });

  const { showSuccessTooltip } = useSuccessNotification();
  const { showErrorTooltip } = useErrorNotification();

  const totalSteps = 9;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      if (currentStep === totalSteps) {
        // Từ preview quay về step 7 (caregiver requirements)
        setCurrentStep(7);
      } else {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const handleSave = () => {
    // Validate required fields
    if (!profile.personalInfo.name || !profile.personalInfo.age) {
      showErrorTooltip('Vui lòng điền đầy đủ thông tin cơ bản');
      setCurrentStep(1);
      return;
    }

    // Save profile logic here
    showSuccessTooltip('Hồ sơ người già đã được tạo thành công!');
    
    // Navigate back after a short delay
    setTimeout(() => {
      router.back();
    }, 2000);
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <View
          key={index}
          style={[
            styles.stepDot,
            index + 1 <= currentStep && styles.stepDotActive,
          ]}
        />
      ))}
    </View>
  );

  const renderPersonalInfo = () => (
    <View style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>Thông tin cơ bản</ThemedText>
      
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Họ và tên *</ThemedText>
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

      <View style={styles.inputRow}>
        <View style={styles.inputGroupHalf}>
          <ThemedText style={styles.inputLabel}>Tuổi *</ThemedText>
          <TextInput
            style={styles.textInput}
            value={profile.personalInfo.age}
            onChangeText={(text) => setProfile(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, age: text }
            }))}
            placeholder="Tuổi"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputGroupHalf}>
          <ThemedText style={styles.inputLabel}>Giới tính</ThemedText>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                profile.personalInfo.gender === 'Nam' && styles.genderButtonActive
              ]}
              onPress={() => setProfile(prev => ({
                ...prev,
                personalInfo: { ...prev.personalInfo, gender: 'Nam' }
              }))}
            >
              <ThemedText style={[
                styles.genderText,
                profile.personalInfo.gender === 'Nam' && styles.genderTextActive
              ]}>Nam</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderButton,
                profile.personalInfo.gender === 'Nữ' && styles.genderButtonActive
              ]}
              onPress={() => setProfile(prev => ({
                ...prev,
                personalInfo: { ...prev.personalInfo, gender: 'Nữ' }
              }))}
            >
              <ThemedText style={[
                styles.genderText,
                profile.personalInfo.gender === 'Nữ' && styles.genderTextActive
              ]}>Nữ</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Số điện thoại</ThemedText>
        <TextInput
          style={styles.textInput}
          value={profile.personalInfo.phoneNumber}
          onChangeText={(text) => setProfile(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, phoneNumber: text }
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

      <View style={styles.inputRow}>
        <View style={styles.inputGroupHalf}>
          <ThemedText style={styles.inputLabel}>Cân nặng</ThemedText>
          <TextInput
            style={styles.textInput}
            value={profile.personalInfo.weight}
            onChangeText={(text) => setProfile(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, weight: text }
            }))}
            placeholder="kg"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputGroupHalf}>
          <ThemedText style={styles.inputLabel}>Chiều cao</ThemedText>
          <TextInput
            style={styles.textInput}
            value={profile.personalInfo.height}
            onChangeText={(text) => setProfile(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, height: text }
            }))}
            placeholder="cm"
            keyboardType="numeric"
          />
        </View>
      </View>
    </View>
  );

  const renderMedicalInfo = () => (
    <View style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>Thông tin y tế</ThemedText>
      
      <View style={styles.inputGroup}>
        <DynamicInputList
          items={profile.medicalConditions.underlyingDiseases}
          onItemsChange={(items) => setProfile(prev => ({
            ...prev,
            medicalConditions: {
              ...prev.medicalConditions,
              underlyingDiseases: items
            }
          }))}
          placeholder="Ví dụ: Tiểu đường"
          title="Bệnh nền hiện có"
        />
      </View>

      <View style={styles.inputGroup}>
        <DynamicInputList
          items={profile.medicalConditions.specialConditions}
          onItemsChange={(items) => setProfile(prev => ({
            ...prev,
            medicalConditions: {
              ...prev.medicalConditions,
              specialConditions: items
            }
          }))}
          placeholder="Ví dụ: Khó nghe"
          title="Tình trạng đặc biệt"
        />
      </View>

      <View style={styles.inputGroup}>
        <DynamicInputList
          items={profile.medicalConditions.allergies}
          onItemsChange={(items) => setProfile(prev => ({
            ...prev,
            medicalConditions: {
              ...prev.medicalConditions,
              allergies: items
            }
          }))}
          placeholder="Ví dụ: Penicillin"
          title="Dị ứng"
        />
      </View>

      <View style={styles.inputGroup}>
        <DynamicMedicationList
          medications={profile.medicalConditions.medications}
          onMedicationsChange={(medications) => setProfile(prev => ({
            ...prev,
            medicalConditions: {
              ...prev.medicalConditions,
              medications: medications
            }
          }))}
        />
      </View>
    </View>
  );

  const renderIndependenceLevel = () => (
    <View style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>Mức độ tự lập</ThemedText>
      
      {Object.entries(profile.independenceLevel).map(([key, value]) => (
        <View key={key} style={styles.independenceItem}>
          <ThemedText style={styles.independenceLabel}>
            {key === 'eating' && 'Ăn uống'}
            {key === 'bathing' && 'Tắm rửa'}
            {key === 'mobility' && 'Di chuyển'}
            {key === 'toileting' && 'Đi vệ sinh'}
            {key === 'dressing' && 'Mặc quần áo'}
          </ThemedText>
          <View style={styles.independenceOptions}>
            {['independent', 'assisted', 'dependent'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.independenceButton,
                  value === option && styles.independenceButtonActive
                ]}
                onPress={() => setProfile(prev => ({
                  ...prev,
                  independenceLevel: {
                    ...prev.independenceLevel,
                    [key]: option as any
                  }
                }))}
              >
                <ThemedText style={[
                  styles.independenceButtonText,
                  value === option && styles.independenceButtonTextActive
                ]}>
                  {option === 'independent' && 'Tự lập'}
                  {option === 'assisted' && 'Cần hỗ trợ'}
                  {option === 'dependent' && 'Phụ thuộc'}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  const renderCareNeeds = () => (
    <View style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>Nhu cầu chăm sóc</ThemedText>
      
      {Object.entries(profile.careNeeds).map(([key, value]) => (
        <TouchableOpacity
          key={key}
          style={styles.careNeedItem}
          onPress={() => setProfile(prev => ({
            ...prev,
            careNeeds: {
              ...prev.careNeeds,
              [key]: !value
            }
          }))}
        >
          <View style={styles.careNeedContent}>
            <Ionicons
              name={key === 'conversation' && 'chatbubbles' ||
                    key === 'reminders' && 'alarm' ||
                    key === 'dietSupport' && 'nutrition' ||
                    key === 'exercise' && 'fitness' ||
                    key === 'medicationManagement' && 'medical' ||
                    key === 'companionship' && 'people' || 'help'}
              size={20}
              color={value ? '#28a745' : '#6c757d'}
            />
            <ThemedText style={styles.careNeedLabel}>
              {key === 'conversation' && 'Trò chuyện'}
              {key === 'reminders' && 'Nhắc nhở'}
              {key === 'dietSupport' && 'Chế độ ăn'}
              {key === 'exercise' && 'Vận động'}
              {key === 'medicationManagement' && 'Quản lý thuốc'}
              {key === 'companionship' && 'Đồng hành'}
            </ThemedText>
          </View>
          <View style={[
            styles.checkbox,
            value && styles.checkboxActive
          ]}>
            {value && <Ionicons name="checkmark" size={16} color="white" />}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPreferences = () => (
    <View style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>Sở thích và sở thích</ThemedText>
      
      <View style={styles.inputGroup}>
        <DynamicInputList
          items={profile.preferences.hobbies}
          onItemsChange={(items) => setProfile(prev => ({
            ...prev,
            preferences: {
              ...prev.preferences,
              hobbies: items
            }
          }))}
          placeholder="Ví dụ: Đọc sách"
          title="Sở thích"
        />
      </View>

      <View style={styles.inputGroup}>
        <DynamicInputList
          items={profile.preferences.favoriteActivities}
          onItemsChange={(items) => setProfile(prev => ({
            ...prev,
            preferences: {
              ...prev.preferences,
              favoriteActivities: items
            }
          }))}
          placeholder="Ví dụ: Xem phim"
          title="Hoạt động yêu thích"
        />
      </View>

      <View style={styles.inputGroup}>
        <DynamicInputList
          items={profile.preferences.foodPreferences}
          onItemsChange={(items) => setProfile(prev => ({
            ...prev,
            preferences: {
              ...prev.preferences,
              foodPreferences: items
            }
          }))}
          placeholder="Ví dụ: Cháo"
          title="Món ăn yêu thích"
        />
      </View>
    </View>
  );

  const renderEnvironment = () => (
    <View style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>Môi trường sống</ThemedText>
      
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Loại nhà ở</ThemedText>
        <View style={styles.houseTypeContainer}>
          {[
            { key: 'private_house', label: 'Nhà riêng' },
            { key: 'apartment', label: 'Căn hộ chung cư' },
            { key: 'nursing_home', label: 'Viện dưỡng lão' },
            { key: 'other', label: 'Khác' }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.houseTypeButton,
                profile.livingEnvironment.houseType === option.key && styles.houseTypeButtonActive
              ]}
              onPress={() => setProfile(prev => ({
                ...prev,
                livingEnvironment: {
                  ...prev.livingEnvironment,
                  houseType: option.key as any
                }
              }))}
            >
              <ThemedText style={[
                styles.houseTypeText,
                profile.livingEnvironment.houseType === option.key && styles.houseTypeTextActive
              ]}>{option.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <DynamicInputList
          items={profile.livingEnvironment.livingWith}
          onItemsChange={(items) => setProfile(prev => ({
            ...prev,
            livingEnvironment: {
              ...prev.livingEnvironment,
              livingWith: items
            }
          }))}
          placeholder="Ví dụ: Con trai"
          title="Sống cùng"
        />
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Môi trường xung quanh</ThemedText>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={profile.livingEnvironment.surroundings}
          onChangeText={(text) => setProfile(prev => ({
            ...prev,
            livingEnvironment: {
              ...prev.livingEnvironment,
              surroundings: text
            }
          }))}
          placeholder="Mô tả môi trường xung quanh"
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  const renderCaregiverRequirements = () => (
    <View style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>Yêu cầu người chăm sóc</ThemedText>
      
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Giới tính ưu tiên</ThemedText>
        <View style={styles.genderContainer}>
          {[
            { key: 'no_preference', label: 'Không yêu cầu' },
            { key: 'male', label: 'Nam' },
            { key: 'female', label: 'Nữ' }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.genderButton,
                profile.caregiverRequirements.preferredGender === option.key && styles.genderButtonActive
              ]}
              onPress={() => setProfile(prev => ({
                ...prev,
                caregiverRequirements: {
                  ...prev.caregiverRequirements,
                  preferredGender: option.key as any
                }
              }))}
            >
              <ThemedText style={[
                styles.genderText,
                profile.caregiverRequirements.preferredGender === option.key && styles.genderTextActive
              ]}>{option.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Kinh nghiệm yêu cầu</ThemedText>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={profile.caregiverRequirements.experience}
          onChangeText={(text) => setProfile(prev => ({
            ...prev,
            caregiverRequirements: {
              ...prev.caregiverRequirements,
              experience: text
            }
          }))}
          placeholder="Ví dụ: Ít nhất 2 năm kinh nghiệm chăm sóc người già"
          multiline
          numberOfLines={2}
        />
      </View>

      <View style={styles.inputGroup}>
        <DynamicInputList
          items={profile.caregiverRequirements.specialSkills}
          onItemsChange={(items) => setProfile(prev => ({
            ...prev,
            caregiverRequirements: {
              ...prev.caregiverRequirements,
              specialSkills: items
            }
          }))}
          placeholder="Ví dụ: Đo huyết áp"
          title="Kỹ năng đặc biệt"
        />
      </View>

      <TouchableOpacity
        style={styles.careNeedItem}
        onPress={() => setProfile(prev => ({
          ...prev,
          caregiverRequirements: {
            ...prev.caregiverRequirements,
            smokingAllowed: !prev.caregiverRequirements.smokingAllowed
          }
        }))}
      >
        <View style={styles.careNeedContent}>
          <Ionicons
            name={profile.caregiverRequirements.smokingAllowed ? "checkmark-circle" : "close-circle"}
            size={20}
            color={profile.caregiverRequirements.smokingAllowed ? '#28a745' : '#dc3545'}
          />
          <ThemedText style={styles.careNeedLabel}>Cho phép hút thuốc</ThemedText>
        </View>
        <View style={[
          styles.checkbox,
          profile.caregiverRequirements.smokingAllowed && styles.checkboxActive
        ]}>
          {profile.caregiverRequirements.smokingAllowed && <Ionicons name="checkmark" size={16} color="white" />}
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderEmergencyContacts = () => (
    <View style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>Liên hệ khẩn cấp</ThemedText>
      
      <View style={styles.inputGroup}>
        <DynamicContactList
          contacts={profile.emergencyContacts}
          onContactsChange={(contacts) => setProfile(prev => ({
            ...prev,
            emergencyContacts: contacts
          }))}
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
      case 7: return renderCaregiverRequirements();
      case 8: return renderEmergencyContacts();
      case 9: return (
        <View style={styles.stepContent}>
          <ThemedText style={styles.stepTitle}>Xem trước hồ sơ</ThemedText>
          <ProfilePreview profile={profile} />
        </View>
      );
      default: return renderPersonalInfo();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Tạo hồ sơ người già</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Thông tin chi tiết và đầy đủ</ThemedText>
        </View>

        <View style={styles.placeholder} />
      </View>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigation}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.previousButton} onPress={handlePrevious}>
            <Ionicons name="chevron-back" size={20} color="#4ECDC4" />
            <ThemedText style={styles.previousButtonText}>
              {currentStep === totalSteps ? 'Chỉnh sửa' : 'Trước'}
            </ThemedText>
          </TouchableOpacity>
        )}
        
        <View style={styles.navigationSpacer} />
        
        {currentStep < totalSteps - 1 ? (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <ThemedText style={styles.nextButtonText}>Tiếp theo</ThemedText>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </TouchableOpacity>
        ) : currentStep === totalSteps - 1 ? (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <ThemedText style={styles.nextButtonText}>Xem trước</ThemedText>
            <Ionicons name="eye" size={20} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="checkmark" size={20} color="white" />
            <ThemedText style={styles.saveButtonText}>Tạo hồ sơ</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  placeholder: {
    width: 40,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e9ecef',
    marginHorizontal: 4,
  },
  stepDotActive: {
    backgroundColor: '#4ECDC4',
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputGroupHalf: {
    flex: 1,
    marginRight: 10,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  genderButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  genderButtonActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  genderText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
  genderTextActive: {
    color: 'white',
  },
  independenceItem: {
    marginBottom: 20,
  },
  independenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  independenceOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  independenceButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  independenceButtonActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  independenceButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
  independenceButtonTextActive: {
    color: 'white',
  },
  careNeedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  careNeedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  careNeedLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginLeft: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  houseTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  houseTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  houseTypeButtonActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  houseTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
  houseTypeTextActive: {
    color: 'white',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  previousButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  previousButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ECDC4',
    marginLeft: 8,
  },
  navigationSpacer: {
    flex: 1,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginRight: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
});
