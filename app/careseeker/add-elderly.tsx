import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
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
import { DynamicInputList } from '@/components/ui/DynamicInputList';
import { DynamicMedicationList } from '@/components/ui/DynamicMedicationList';
import { useEmergencyContact } from '@/contexts/EmergencyContactContext';
import { useErrorNotification, useSuccessNotification } from '@/contexts/NotificationContext';

// Mock families data
const mockFamilies = [
  {
    id: '1',
    name: 'Gia đình Nguyễn',
    memberCount: 5,
    elderlyCount: 2,
    userRole: 'admin_family',
    createdAt: '2024-01-15',
    description: 'Gia đình đa thế hệ với ông bà và con cháu',
  },
  {
    id: '2',
    name: 'Gia đình Trần',
    memberCount: 3,
    elderlyCount: 1,
    userRole: 'member',
    createdAt: '2024-02-20',
    description: 'Gia đình nhỏ gọn, chăm sóc bà nội',
  },
  {
    id: '3',
    name: 'Gia đình Lê',
    memberCount: 8,
    elderlyCount: 3,
    userRole: 'member',
    createdAt: '2024-03-10',
    description: 'Gia đình lớn với nhiều thế hệ',
  },
];

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
    medications: {
      name: string;
      dosage: string;
      frequency: string;
    }[];
  };
  // Mức độ tự lập
  independenceLevel: {
    eating: 'independent' | 'assisted' | 'dependent';
    bathing: 'independent' | 'assisted' | 'dependent';
    mobility: 'independent' | 'assisted' | 'dependent';
    dressing: 'independent' | 'assisted' | 'dependent';
  };
  // Nhu cầu chăm sóc
  careNeeds: {
    customNeeds: string[];
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
  // Liên hệ khẩn cấp
  emergencyContacts: {
    name: string;
    relationship: string;
    phone: string;
  }[];
}

export default function AddElderlyScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const { tempContacts, setTempContacts } = useEmergencyContact();
  
  // Family selection states
  const [familySelectionType, setFamilySelectionType] = useState<'create' | 'select' | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<any>(null);
  const [newFamilyData, setNewFamilyData] = useState({
    name: '',
    members: [] as any[]
  });
  const [familySearchQuery, setFamilySearchQuery] = useState('');
  
  // Add member modal states
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  
  // Sync emergency contacts from context when returning from emergency contacts page
  useEffect(() => {
    if (tempContacts.length > 0) {
      setProfile(prev => ({
        ...prev,
        emergencyContacts: tempContacts
      }));
    }
  }, [tempContacts]);
  
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
      dressing: 'independent',
    },
    careNeeds: {
      customNeeds: [],
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
    emergencyContacts: [],
  });

  const { showSuccessTooltip } = useSuccessNotification();
  const { showErrorTooltip } = useErrorNotification();

  const totalSteps = 5;

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Thông tin cá nhân
        if (!profile.personalInfo.name.trim()) {
          showErrorTooltip('Vui lòng nhập họ và tên');
          return false;
        }
        if (!profile.personalInfo.age.trim()) {
          showErrorTooltip('Vui lòng nhập tuổi');
          return false;
        }
        const age = parseInt(profile.personalInfo.age);
        if (isNaN(age) || age < 50 || age > 120) {
          showErrorTooltip('Tuổi phải là số từ 50 đến 120');
          return false;
        }
        if (!profile.personalInfo.gender) {
          showErrorTooltip('Vui lòng chọn giới tính');
          return false;
        }
        return true;
      
      case 2: // Sinh hoạt & Chăm sóc
        // Optional fields, always valid
        return true;
      
      case 3: // Sở thích & Liên hệ
        // Check if emergency contacts are valid
        for (let i = 0; i < profile.emergencyContacts.length; i++) {
          const contact = profile.emergencyContacts[i];
          if (!contact.name.trim()) {
            showErrorTooltip(`Liên hệ ${i + 1}: Vui lòng nhập họ tên`);
            return false;
          }
          if (!contact.relationship.trim()) {
            showErrorTooltip(`Liên hệ ${i + 1}: Vui lòng nhập mối quan hệ`);
            return false;
          }
          if (!contact.phone.trim()) {
            showErrorTooltip(`Liên hệ ${i + 1}: Vui lòng nhập số điện thoại`);
            return false;
          }
          // Validate phone format (10 digits starting with 0)
          const phoneRegex = /^0\d{9}$/;
          if (!phoneRegex.test(contact.phone.trim())) {
            showErrorTooltip(`Liên hệ ${i + 1}: Số điện thoại không hợp lệ (phải là 10 số bắt đầu bằng 0)`);
            return false;
          }
        }
        return true;
      
      case 4: // Môi trường sống
        // Optional fields, always valid
        return true;
      
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      // Validate current step before moving to next
      if (currentStep < totalSteps - 1) {
        if (!validateStep(currentStep)) {
          return;
        }
      }
      
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddMember = () => {
    if (!newMemberEmail.trim()) {
      showErrorTooltip('Vui lòng nhập email thành viên');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newMemberEmail.trim())) {
      showErrorTooltip('Vui lòng nhập email hợp lệ');
      return;
    }

    const newMember = {
      id: Date.now().toString(),
      email: newMemberEmail.trim(),
      role: 'member'
    };

    setNewFamilyData(prev => ({
      ...prev,
      members: [...prev.members, newMember]
    }));

    setNewMemberEmail('');
    setShowAddMemberModal(false);
    showSuccessTooltip('Đã thêm thành viên thành công!');
  };

  const handleRemoveMember = (memberId: string) => {
    setNewFamilyData(prev => ({
      ...prev,
      members: prev.members.filter(member => member.id !== memberId)
    }));
  };

  const handleSave = () => {
    // Validate all steps
    for (let step = 1; step <= 4; step++) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        return;
      }
    }

    // Save profile logic here
    showSuccessTooltip('Hồ sơ người già đã được tạo thành công!');
    
    // Navigate back after a short delay
    setTimeout(() => {
      router.back();
    }, 2000);
  };

  const getStepName = (step: number) => {
    const stepNames = [
      'Thông tin cá nhân',
      'Sinh hoạt & Chăm sóc',
      'Sở thích & Liên hệ',
      'Môi trường sống',
      'Xem trước'
    ];
    return stepNames[step - 1] || '';
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      <View style={styles.stepInfo}>
        <ThemedText style={styles.stepNumber}>Bước {currentStep}/{totalSteps}</ThemedText>
        <ThemedText style={styles.stepName}>{getStepName(currentStep)}</ThemedText>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${(currentStep / totalSteps) * 100}%` }]} />
      </View>
    </View>
  );

  const renderFamilySelection = () => (
    <View style={styles.stepContent}>
      <View style={styles.labelContainer}>
        <ThemedText style={styles.stepTitle}>Chọn gia đình</ThemedText>
        <ThemedText style={styles.requiredMark}>*</ThemedText>
      </View>
      <ThemedText style={styles.stepSubtitle}>
        Chọn gia đình để thêm hồ sơ người già vào
      </ThemedText>

      {!familySelectionType ? (
        <View style={styles.familyOptionsContainer}>
          <TouchableOpacity
            style={styles.familyOption}
            onPress={() => setFamilySelectionType('create')}
          >
            <View style={styles.familyOptionIcon}>
              <Ionicons name="add-circle" size={32} color="#68C2E8" />
            </View>
            <View style={styles.familyOptionContent}>
              <ThemedText style={styles.familyOptionTitle}>Tạo mới gia đình</ThemedText>
              <ThemedText style={styles.familyOptionDescription}>
                Tạo một gia đình mới và bạn sẽ là quản trị viên
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6c757d" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.familyOption}
            onPress={() => setFamilySelectionType('select')}
          >
            <View style={styles.familyOptionIcon}>
              <Ionicons name="people" size={32} color="#68C2E8" />
            </View>
            <View style={styles.familyOptionContent}>
              <ThemedText style={styles.familyOptionTitle}>Chọn gia đình có sẵn</ThemedText>
              <ThemedText style={styles.familyOptionDescription}>
                Chọn từ các gia đình bạn đã tham gia
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6c757d" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.familySelectionContainer}>
          <TouchableOpacity
            style={styles.backToOptionsButton}
            onPress={() => {
              setFamilySelectionType(null);
              setSelectedFamily(null);
              setNewFamilyData({ name: '', members: [] });
              setFamilySearchQuery('');
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#68C2E8" />
            <ThemedText style={styles.backToOptionsText}>Quay lại</ThemedText>
          </TouchableOpacity>
          
          {familySelectionType === 'create' ? (
            <View style={styles.createFamilyContainer}>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Tên gia đình</ThemedText>
                <TextInput
                  style={styles.textInput}
                  value={newFamilyData.name}
                  onChangeText={(text) => setNewFamilyData(prev => ({ ...prev, name: text }))}
                  placeholder="Nhập tên gia đình"
                  placeholderTextColor="#6c757d"
                />
              </View>
              
              <View style={styles.familyMembersContainer}>
                <View style={styles.sectionHeader}>
                  <ThemedText style={styles.inputLabel}>Thành viên</ThemedText>
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => setShowAddMemberModal(true)}
                  >
                    <ThemedText style={styles.addButtonText}>Thêm</ThemedText>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.creatorItem}>
                  <View style={styles.memberInfo}>
                    <Ionicons name="person" size={20} color="#68C2E8" />
                    <View style={styles.memberDetails}>
                      <ThemedText style={styles.memberName}>Bạn</ThemedText>
                      <ThemedText style={styles.memberRole}>Quản trị viên</ThemedText>
                    </View>
                  </View>
                </View>
                
                {newFamilyData.members.map((member) => (
                  <View key={member.id} style={styles.memberItem}>
                    <View style={styles.memberInfo}>
                      <Ionicons name="person" size={20} color="#6c757d" />
                      <View style={styles.memberDetails}>
                        <ThemedText style={styles.memberName}>{member.email}</ThemedText>
                        <ThemedText style={styles.memberRole}>Thành viên</ThemedText>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.removeMemberButton}
                      onPress={() => handleRemoveMember(member.id)}
                    >
                      <Ionicons name="close-circle" size={20} color="#ff6b6b" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.selectFamilyContainer}>
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#6c757d" />
                <TextInput
                  style={styles.searchInput}
                  value={familySearchQuery}
                  onChangeText={setFamilySearchQuery}
                  placeholder="Tìm kiếm gia đình..."
                  placeholderTextColor="#6c757d"
                />
              </View>
              
              <ScrollView style={styles.familiesList}>
                {mockFamilies
                  .filter(family => 
                    family.name.toLowerCase().includes(familySearchQuery.toLowerCase())
                  )
                  .map((family) => (
                    <TouchableOpacity
                      key={family.id}
                      style={[
                        styles.familyItem,
                        selectedFamily?.id === family.id && styles.familyItemSelected
                      ]}
                      onPress={() => setSelectedFamily(family)}
                    >
                      <View style={styles.familyItemContent}>
                        <View style={styles.familyItemHeader}>
                          <ThemedText style={styles.familyItemName}>{family.name}</ThemedText>
                          <View style={[
                            styles.roleBadge,
                            { backgroundColor: family.userRole === 'admin_family' ? '#68C2E8' : '#6c757d' }
                          ]}>
                            <ThemedText style={styles.roleBadgeText}>
                              {family.userRole === 'admin_family' ? 'Quản trị viên' : 'Thành viên'}
                            </ThemedText>
                          </View>
                        </View>
                        <ThemedText style={styles.familyItemDescription}>{family.description}</ThemedText>
                        <View style={styles.familyItemStats}>
                          <View style={styles.statItem}>
                            <Ionicons name="people" size={16} color="#68C2E8" />
                            <ThemedText style={styles.statText}>{family.memberCount} thành viên</ThemedText>
                          </View>
                          <View style={styles.statItem}>
                            <Ionicons name="person" size={16} color="#ff6b6b" />
                            <ThemedText style={styles.statText}>{family.elderlyCount} người già</ThemedText>
                          </View>
                        </View>
                      </View>
                      {selectedFamily?.id === family.id && (
                        <Ionicons name="checkmark-circle" size={24} color="#68C2E8" />
                      )}
                    </TouchableOpacity>
                  ))}
              </ScrollView>
              
              {selectedFamily && selectedFamily.userRole === 'member' && (
                <View style={styles.memberNote}>
                  <ThemedText style={styles.memberNoteTitle}>
                    <ThemedText style={styles.requiredMark}>*</ThemedText> Lưu ý quan trọng
                  </ThemedText>
                  <ThemedText style={styles.memberNoteText}>
                    Do bạn là thành viên của gia đình {selectedFamily.name} nên việc tạo hồ sơ người già và thêm vào gia đình này phải được sự chấp nhận của admin gia đình này
                  </ThemedText>
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );

  const renderPersonalInfo = () => (
    <View style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>Thông tin cá nhân</ThemedText>
      <ThemedText style={styles.stepDescription}>Thông tin cơ bản và y tế</ThemedText>
      
      <View style={styles.inputGroup}>
        <View style={styles.labelContainer}>
          <ThemedText style={styles.inputLabel}>Họ và tên</ThemedText>
          <ThemedText style={styles.requiredMark}>*</ThemedText>
        </View>
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
          <View style={styles.labelContainer}>
            <ThemedText style={styles.inputLabel}>Tuổi</ThemedText>
            <ThemedText style={styles.requiredMark}>*</ThemedText>
          </View>
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
          <View style={styles.labelContainer}>
            <ThemedText style={styles.inputLabel}>Giới tính</ThemedText>
            <ThemedText style={styles.requiredMark}>*</ThemedText>
          </View>
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

      {/* Medical Info - Integrated */}
      <View style={styles.sectionDivider} />
      <View style={styles.subsectionHeader}>
        <ThemedText style={styles.sectionTitle}>Thông tin y tế</ThemedText>
      </View>
      
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
      <ThemedText style={styles.stepTitle}>Sinh hoạt & Chăm sóc</ThemedText>
      <ThemedText style={styles.stepDescription}>Khả năng tự lập và nhu cầu chăm sóc</ThemedText>
      
      <View style={styles.subsectionHeader}>
        <ThemedText style={styles.sectionTitle}>Mức độ tự lập</ThemedText>
      </View>
      
      {Object.entries(profile.independenceLevel).map(([key, value]) => (
        <View key={key} style={styles.independenceItem}>
          <ThemedText style={styles.independenceLabel}>
            {key === 'eating' && 'Ăn uống'}
            {key === 'bathing' && 'Tắm rửa'}
            {key === 'mobility' && 'Di chuyển'}
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

  const renderPreferences = () => (
    <View style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>Sở thích & Liên hệ</ThemedText>
      <ThemedText style={styles.stepDescription}>Thông tin về sở thích và người liên hệ khẩn cấp</ThemedText>
      
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

      {/* Emergency Contacts - Link to separate page */}
      <View style={styles.sectionDivider} />
      
      <View style={styles.inputGroup}>
        <View style={styles.emergencyContactsSection}>
          <View style={styles.emergencyContactsHeader}>
            <ThemedText style={styles.sectionTitle}>Liên hệ khẩn cấp</ThemedText>
            <ThemedText style={styles.emergencyContactsCount}>
              {profile.emergencyContacts.length} liên hệ
            </ThemedText>
          </View>
          <TouchableOpacity 
            style={styles.manageContactsButton}
            onPress={() => {
              setTempContacts(profile.emergencyContacts);
              router.push('/careseeker/emergency-contacts');
            }}
          >
            <Ionicons name="call-outline" size={20} color="#68C2E8" />
            <ThemedText style={styles.manageContactsText}>Quản lý liên hệ khẩn cấp</ThemedText>
            <Ionicons name="chevron-forward" size={20} color="#7F8C8D" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEnvironment = () => (
    <View style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>Môi trường sống</ThemedText>
      <ThemedText style={styles.stepDescription}>Nơi ở và điều kiện sinh hoạt</ThemedText>
      
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Loại nhà ở</ThemedText>
        <View style={styles.houseTypeContainer}>
          {[
            { key: 'private_house', label: 'Nhà riêng' },
            { key: 'apartment', label: 'Căn hộ chung cư' }
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

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderPersonalInfo();
      case 2: return renderIndependenceLevel();
      case 3: return renderPreferences();
      case 4: return renderEnvironment();
      case 5: return (
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
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Tạo hồ sơ</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Thông tin người già</ThemedText>
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
            <Ionicons name="chevron-back" size={20} color="#68C2E8" />
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
      
      {/* Add Member Modal */}
      <Modal
        visible={showAddMemberModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddMemberModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Thêm thành viên</ThemedText>
              <TouchableOpacity 
                onPress={() => setShowAddMemberModal(false)} 
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6c757d" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Email thành viên</ThemedText>
                <TextInput
                  style={styles.textInput}
                  value={newMemberEmail}
                  onChangeText={setNewMemberEmail}
                  placeholder="Nhập email thành viên"
                  placeholderTextColor="#6c757d"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowAddMemberModal(false)}
                >
                  <ThemedText style={styles.cancelButtonText}>Hủy</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleAddMember}
                >
                  <ThemedText style={styles.confirmButtonText}>Thêm</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#7F8C8D',
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  stepIndicatorContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  stepInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#68C2E8',
  },
  stepName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C3E50',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#E8EBED',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#68C2E8',
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: 20,
    paddingTop: 24,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E8EBED',
    marginVertical: 24,
  },
  subsectionHeader: {
    marginBottom: 8,
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
    color: '#2C3E50',
    marginBottom: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requiredMark: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc3545',
    marginLeft: 2,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E8EBED',
    color: '#2C3E50',
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
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'white',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8EBED',
  },
  genderButtonActive: {
    backgroundColor: '#E8F6F3',
    borderColor: '#68C2E8',
  },
  genderText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  genderTextActive: {
    color: '#68C2E8',
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
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8EBED',
  },
  independenceButtonActive: {
    backgroundColor: '#E8F6F3',
    borderColor: '#68C2E8',
  },
  independenceButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  independenceButtonTextActive: {
    color: '#68C2E8',
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
    backgroundColor: '#68C2E8',
    borderColor: '#68C2E8',
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
    backgroundColor: '#68C2E8',
    borderColor: '#68C2E8',
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
    paddingTop: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 12,
  },
  previousButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E8EBED',
    backgroundColor: 'white',
  },
  previousButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 6,
  },
  navigationSpacer: {
    flex: 1,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#68C2E8',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#68C2E8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
    marginRight: 6,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27AE60',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
    marginLeft: 6,
  },
  // Family selection styles
  stepSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 24,
    textAlign: 'center',
  },
  familyOptionsContainer: {
    gap: 16,
  },
  familySelectionContainer: {
    gap: 16,
  },
  backToOptionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignSelf: 'flex-start',
  },
  backToOptionsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#68C2E8',
    marginLeft: 8,
  },
  familyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  familyOptionIcon: {
    marginRight: 16,
  },
  familyOptionContent: {
    flex: 1,
  },
  familyOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  familyOptionDescription: {
    fontSize: 14,
    color: '#6c757d',
  },
  createFamilyContainer: {
    gap: 20,
  },
  familyMembersContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#68C2E8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  creatorItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberDetails: {
    marginLeft: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  memberRole: {
    fontSize: 14,
    color: '#6c757d',
  },
  selectFamilyContainer: {
    gap: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 12,
  },
  familiesList: {
    maxHeight: 300,
  },
  familyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  familyItemSelected: {
    borderColor: '#68C2E8',
    backgroundColor: '#f0fdfa',
  },
  familyItemContent: {
    flex: 1,
  },
  familyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  familyItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  familyItemDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  familyItemStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6c757d',
  },
  memberNote: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  memberNoteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  memberNoteText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    gap: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#68C2E8',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  // Member item styles
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  removeMemberButton: {
    padding: 4,
  },
  // Preview styles
  previewSection: {
    marginBottom: 24,
  },
  previewSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  familyPreviewCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  familyPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  familyPreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 8,
  },
  familyPreviewName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#68C2E8',
    marginBottom: 8,
  },
  familyPreviewDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 12,
  },
  familyPreviewMembers: {
    marginTop: 8,
  },
  familyPreviewMembersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  familyPreviewMemberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  familyPreviewMemberText: {
    fontSize: 14,
    color: '#6c757d',
    marginLeft: 8,
  },
  familyPreviewStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  familyPreviewStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  familyPreviewStatText: {
    fontSize: 12,
    color: '#6c757d',
    marginLeft: 4,
  },
  familyPreviewRole: {
    marginBottom: 8,
  },
  familyPreviewRoleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  familyPreviewRoleText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  familyPreviewNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  familyPreviewNoteText: {
    fontSize: 12,
    color: '#856404',
    marginLeft: 8,
    fontWeight: '500',
  },
  emergencyContactsSection: {
    marginTop: 8,
  },
  emergencyContactsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  emergencyContactsCount: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  manageContactsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#68C2E8',
    gap: 12,
  },
  manageContactsText: {
    flex: 1,
    fontSize: 15,
    color: '#68C2E8',
    fontWeight: '600',
  },
});
