import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfilePreview } from '@/components/elderly/ProfilePreview';
import { ThemedText } from '@/components/themed-text';
import { DynamicInputList } from '@/components/ui/DynamicInputList';
import { DynamicMedicationList } from '@/components/ui/DynamicMedicationList';
import { LocationPickerModal } from '@/components/ui/LocationPickerModal';
import { useAuth } from '@/contexts/AuthContext';
import { useEmergencyContact } from '@/contexts/EmergencyContactContext';
import { useErrorNotification, useSuccessNotification } from '@/contexts/NotificationContext';
import { UserService } from '@/services/user.service';

// Caregiver requirements constants
const careLevels = [
  { id: 1, label: 'Cơ bản', description: 'Hỗ trợ sinh hoạt hàng ngày' },
  { id: 2, label: 'Trung bình', description: 'Chăm sóc y tế cơ bản' },
  { id: 3, label: 'Nâng cao', description: 'Chăm sóc y tế chuyên sâu' },
  { id: 4, label: 'Chuyên biệt', description: 'Chăm sóc đặc biệt, phục hồi chức năng' },
];

const requiredSkillsOptions = [
  { id: 'tiêm insulin', label: 'Tiêm insulin' },
  { id: 'đo đường huyết', label: 'Đo đường huyết' },
  { id: 'đái tháo đường', label: 'Chăm sóc đái tháo đường' },
  { id: 'quản lý thuốc', label: 'Quản lý thuốc' },
  { id: 'đo huyết áp', label: 'Đo huyết áp' },
  { id: 'cao huyết áp', label: 'Chăm sóc cao huyết áp' },
  { id: 'hỗ trợ vệ sinh', label: 'Hỗ trợ vệ sinh' },
  { id: 'nấu ăn', label: 'Nấu ăn' },
  { id: 'đồng hành', label: 'Đồng hành' },
];

const prioritySkillsOptions = [
  { id: 'chăm sóc vết thương', label: 'Chăm sóc vết thương' },
  { id: 'đo dấu hiệu sinh tồn', label: 'Đo dấu hiệu sinh tồn' },
  { id: 'hỗ trợ đi lại', label: 'Hỗ trợ đi lại' },
  { id: 'vật lý trị liệu', label: 'Vật lý trị liệu' },
  { id: 'giám sát an toàn', label: 'Giám sát an toàn' },
  { id: 'nhắc nhở uống thuốc', label: 'Nhắc nhở uống thuốc' },
  { id: 'theo dõi sức khỏe', label: 'Theo dõi sức khỏe' },
  { id: 'hỗ trợ tâm lý', label: 'Hỗ trợ tâm lý' },
];

const genderOptions = [
  { id: null, label: 'Không' },
  { id: 'female', label: 'Nữ' },
  { id: 'male', label: 'Nam' },
];

const experienceLevels = [
  { id: null, label: 'Không yêu cầu' },
  { id: '1', label: '1 năm' },
  { id: '2', label: '2 năm' },
  { id: '3', label: '3 năm' },
  { id: '5', label: '5 năm' },
  { id: '7', label: '7 năm' },
  { id: '10', label: '10 năm' },
];

const ratingRangeOptions = [
  { id: null, label: 'Không yêu cầu' },
  { id: '0-1', label: '0 tới 1 sao', min: 0.0, max: 1.0 },
  { id: '1-2', label: '1 tới 2 sao', min: 1.0, max: 2.0 },
  { id: '2-3', label: '2 tới 3 sao', min: 2.0, max: 3.0 },
  { id: '3-4', label: '3 tới 4 sao', min: 3.0, max: 4.0 },
  { id: '4-5', label: '4 tới 5 sao', min: 4.0, max: 5.0 },
];

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
    birthYear: string;
    dateOfBirth: string;
    address: string;
    bloodType: string;
    weight: string;
    height: string;
    gender: string;
    phoneNumber: string;
    healthStatus: 'good' | 'moderate' | 'weak';
    healthNote: string;
    note: string;
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
    toileting: 'independent' | 'assisted' | 'dependent';
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
  // Yêu cầu tìm người chăm sóc
  caregiverRequirements: {
    careLevel: number;
    requiredSkills: string[];
    customRequiredSkills: string[];
    prioritySkills: string[];
    customPrioritySkills: string[];
    caregiverAgeRange: { min: string; max: string } | null;
    genderPreference: string | null;
    requiredYearsExperience: string | null;
    overallRatingRange: { min: number; max: number } | null;
  };
}

export default function AddElderlyScreen() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const { tempContacts, setTempContacts } = useEmergencyContact();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBirthYearPicker, setShowBirthYearPicker] = useState(false);
  
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

  const handleImagePicker = () => {
    setShowImagePickerModal(true);
  };

  const handlePickFromLibrary = async () => {
    setShowImagePickerModal(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Thông báo', 'Cần quyền truy cập thư viện ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    setShowImagePickerModal(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Thông báo', 'Cần quyền truy cập camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };
  
  const [profile, setProfile] = useState<ElderlyProfile>({
    personalInfo: {
      name: '',
      birthYear: '',
      dateOfBirth: '',
      address: '',
      bloodType: '',
      weight: '',
      height: '',
      gender: '',
      phoneNumber: '',
      healthStatus: 'moderate',
      healthNote: '',
      note: '',
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
      toileting: 'independent',
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
    caregiverRequirements: {
      careLevel: 2,
      requiredSkills: [],
      customRequiredSkills: [],
      prioritySkills: [],
      customPrioritySkills: [],
      caregiverAgeRange: null,
      genderPreference: null,
      requiredYearsExperience: null,
      overallRatingRange: null,
    },
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
        if (!profile.personalInfo.birthYear.trim()) {
          showErrorTooltip('Vui lòng chọn năm sinh');
          return false;
        }
        const birthYear = parseInt(profile.personalInfo.birthYear);
        const currentYear = new Date().getFullYear();
        if (isNaN(birthYear) || birthYear < 1900 || birthYear > currentYear) {
          showErrorTooltip('Năm sinh không hợp lệ (1900 - ' + currentYear + ')');
          return false;
        }
        if (!profile.personalInfo.gender) {
          showErrorTooltip('Vui lòng chọn giới tính');
          return false;
        }
        if (!profile.personalInfo.location) {
          showErrorTooltip('Vui lòng chọn vị trí');
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
      
      case 4: // Yêu cầu tìm người chăm sóc
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

  const handleSave = async () => {
    // Validate all steps
    for (let step = 1; step <= 4; step++) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        return;
      }
    }

    if (!user?.id) {
      showErrorTooltip('Không tìm thấy thông tin người dùng');
      return;
    }

    if (!profile.personalInfo.location) {
      showErrorTooltip('Vui lòng chọn vị trí');
      return;
    }

    setIsSubmitting(true);

    try {
      // Map independence level từ format UI sang format API
      const independenceLevelMap: Array<{ activity: string; level: string }> = [];
      
      // Map các hoạt động
      const activityMap: Record<string, string> = {
        eating: 'ăn uống',
        bathing: 'tắm rửa',
        mobility: 'di chuyển',
        dressing: 'mặc quần áo',
        toileting: 'vệ sinh',
      };

      const levelMap: Record<string, string> = {
        independent: 'Tự lập',
        assisted: 'Cần hỗ trợ',
        dependent: 'Phụ thuộc',
      };

      Object.entries(profile.independenceLevel).forEach(([key, value]) => {
        if (value) {
          independenceLevelMap.push({
            activity: activityMap[key] || key,
            level: levelMap[value] || value,
          });
        }
      });

      // Map care level
      const careLevelMap: Record<number, string> = {
        1: 'Cơ bản',
        2: 'Trung bình',
        3: 'Nâng cao',
        4: 'Chuyên biệt',
      };

      // Map gender
      const genderMap: Record<string, 'MALE' | 'FEMALE'> = {
        male: 'MALE',
        female: 'FEMALE',
      };

      // Map caregiver requirements
      const allRequiredSkills = [
        ...profile.caregiverRequirements.requiredSkills,
        ...profile.caregiverRequirements.customRequiredSkills,
      ];
      const allPrioritySkills = [
        ...profile.caregiverRequirements.prioritySkills,
        ...profile.caregiverRequirements.customPrioritySkills,
      ];

      // Prepare API request data
      const requestData = {
        name: profile.personalInfo.name,
        birth_year: parseInt(profile.personalInfo.birthYear),
        gender: genderMap[profile.personalInfo.gender] || 'FEMALE',
        location: {
          address: profile.personalInfo.location.address || 'Chưa có địa chỉ',
          latitude: profile.personalInfo.location.latitude,
          longitude: profile.personalInfo.location.longitude,
        },
        weight: profile.personalInfo.weight ? parseFloat(profile.personalInfo.weight) : undefined,
        height: profile.personalInfo.height ? parseFloat(profile.personalInfo.height) : undefined,
        medical_conditions: {
          underlying_diseases: profile.medicalConditions.underlyingDiseases,
          special_conditions: profile.medicalConditions.specialConditions,
          allergies: profile.medicalConditions.allergies,
          medications: profile.medicalConditions.medications,
        },
        independence_level: independenceLevelMap,
        care_needs: {
          level_of_care: careLevelMap[profile.caregiverRequirements.careLevel] || 'Trung bình',
          skills: {
            'kĩ năng bắt buộc': allRequiredSkills,
            'kĩ năng ưu tiên': allPrioritySkills,
          },
          age: profile.caregiverRequirements.caregiverAgeRange
            ? [
                parseInt(profile.caregiverRequirements.caregiverAgeRange.min) || 25,
                parseInt(profile.caregiverRequirements.caregiverAgeRange.max) || 45,
              ]
            : null,
          gender: profile.caregiverRequirements.genderPreference
            ? (genderMap[profile.caregiverRequirements.genderPreference] || null)
            : null,
          experience: profile.caregiverRequirements.requiredYearsExperience
            ? parseInt(profile.caregiverRequirements.requiredYearsExperience)
            : null,
          rating: profile.caregiverRequirements.overallRatingRange
            ? profile.caregiverRequirements.overallRatingRange.min
            : null,
        },
        hobbies: profile.preferences.hobbies,
        favorite_activities: profile.preferences.favoriteActivities,
        favorite_food: profile.preferences.foodPreferences,
        emergency_contacts: profile.emergencyContacts,
        health_status: profile.personalInfo.healthStatus.toUpperCase() as 'GOOD' | 'MODERATE' | 'WEAK',
        health_note: profile.personalInfo.healthNote || undefined,
        note: profile.personalInfo.note || undefined,
      };

      // Prepare avatar file if exists
      // Prepare avatar file
      let avatarFile = avatarUri
        ? {
            uri: avatarUri,
            type: 'image/jpeg',
            name: `avatar_${Date.now()}.jpg`,
          }
        : undefined;

      // Log avatar info
      if (avatarFile) {
        console.log('📷 Avatar URI:', avatarFile.uri);
        console.log('📷 Avatar type:', avatarFile.type);
        console.log('📷 Avatar name:', avatarFile.name);
      } else {
        console.log('ℹ️ No avatar selected, sending JSON only');
      }

      // TEMPORARY TEST: Comment out avatar to test JSON-only request
      // Uncomment the line below to test without avatar
      // avatarFile = undefined;
      // console.log('⚠️ TESTING WITHOUT AVATAR');

      // Call API
      const response = await UserService.createElderlyProfile(requestData, avatarFile);

      setIsSubmitting(false);

      if (response.status === 'Success') {
        // Clear temp contacts
        setTempContacts([]);
        
        showSuccessTooltip('Hồ sơ người già đã được tạo thành công!');
        
        // Navigate back to elderly list (replace to avoid stack issues)
        setTimeout(() => {
          router.replace('/careseeker/elderly-list');
        }, 1500);
      } else {
        // Show error modal
        setErrorMessage(response.message || 'Có lỗi xảy ra khi tạo hồ sơ');
        setShowErrorModal(true);
      }
    } catch (error: any) {
      setIsSubmitting(false);
      console.error('Error saving elderly profile:', error);
      
      // Show error modal
      setErrorMessage(error.message || 'Có lỗi xảy ra khi lưu hồ sơ. Vui lòng thử lại.');
      setShowErrorModal(true);
    }
  };

  const getStepName = (step: number) => {
    const stepNames = [
      'Thông tin cá nhân',
      'Sinh hoạt & Chăm sóc',
      'Sở thích & Liên hệ',
      'Yêu cầu tìm người chăm sóc',
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
            <ThemedText style={styles.inputLabel}>Năm sinh</ThemedText>
            <ThemedText style={styles.requiredMark}>*</ThemedText>
          </View>
          <TouchableOpacity
            style={styles.textInput}
            onPress={() => setShowBirthYearPicker(true)}
          >
            <ThemedText style={profile.personalInfo.birthYear ? styles.textInputValue : styles.textInputPlaceholder}>
              {profile.personalInfo.birthYear || 'Chọn năm sinh'}
            </ThemedText>
          </TouchableOpacity>
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

      {/* Mức độ sức khỏe */}
      <View style={styles.sectionDivider} />
      <View style={styles.subsectionHeader}>
        <ThemedText style={styles.sectionTitle}>Mức độ sức khỏe</ThemedText>
      </View>
      <View style={styles.inputGroup}>
        <View style={styles.healthLevelContainer}>
          <TouchableOpacity
            style={[
              styles.healthLevelCard,
              profile.personalInfo.healthStatus === 'good' && styles.healthLevelCardSelected
            ]}
            onPress={() => setProfile(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, healthStatus: 'good' }
            }))}
          >
            <Ionicons name="happy" size={32} color={profile.personalInfo.healthStatus === 'good' ? 'white' : '#68C2E8'} />
            <ThemedText style={[
              styles.healthLevelText,
              profile.personalInfo.healthStatus === 'good' && styles.healthLevelTextSelected
            ]}>
              Tốt
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.healthLevelCard,
              profile.personalInfo.healthStatus === 'moderate' && styles.healthLevelCardSelected
            ]}
            onPress={() => setProfile(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, healthStatus: 'moderate' }
            }))}
          >
            <Ionicons name="medical" size={32} color={profile.personalInfo.healthStatus === 'moderate' ? 'white' : '#68C2E8'} />
            <ThemedText style={[
              styles.healthLevelText,
              profile.personalInfo.healthStatus === 'moderate' && styles.healthLevelTextSelected
            ]}>
              Trung bình
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.healthLevelCard,
              profile.personalInfo.healthStatus === 'weak' && styles.healthLevelCardSelected
            ]}
            onPress={() => setProfile(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, healthStatus: 'weak' }
            }))}
          >
            <Ionicons name="warning" size={32} color={profile.personalInfo.healthStatus === 'weak' ? 'white' : '#68C2E8'} />
            <ThemedText style={[
              styles.healthLevelText,
              profile.personalInfo.healthStatus === 'weak' && styles.healthLevelTextSelected
            ]}>
              Yếu
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Ghi chú */}
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Ghi chú</ThemedText>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={profile.personalInfo.note}
          onChangeText={(text) => setProfile(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, note: text }
          }))}
          placeholder="Nhập ghi chú (ví dụ: Người cao tuổi cần chăm sóc đặc biệt vào buổi sáng)"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Avatar Upload */}
      <View style={styles.sectionDivider} />
      <View style={styles.subsectionHeader}>
        <ThemedText style={styles.sectionTitle}>Ảnh đại diện</ThemedText>
      </View>
      
      <View style={styles.inputGroup}>
        {avatarUri ? (
          <View style={styles.avatarContainer}>
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            <TouchableOpacity
              style={styles.removeAvatarButton}
              onPress={() => setAvatarUri(null)}
            >
              <Ionicons name="close-circle" size={24} color="#ff6b6b" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.changeAvatarButton}
              onPress={handleImagePicker}
            >
              <Ionicons name="camera" size={20} color="#68C2E8" />
              <ThemedText style={styles.changeAvatarText}>Chụp lại</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.uploadAvatarButton} onPress={handleImagePicker}>
            <Ionicons name="camera-outline" size={48} color="#68C2E8" />
            <ThemedText style={styles.uploadAvatarText}>Chụp ảnh hoặc chọn từ thư viện</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {/* Location Picker */}
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Vị trí</ThemedText>
        {profile.personalInfo.location ? (
          <TouchableOpacity
            style={styles.locationDisplayCard}
            onPress={() => setShowLocationPicker(true)}
          >
            <View style={styles.locationInfoContainer}>
              <Ionicons name="location" size={24} color="#68C2E8" />
              <View style={styles.locationTextContainer}>
                <ThemedText style={styles.locationLabel}>Vị trí đã chọn</ThemedText>
                <ThemedText style={styles.locationTextDisplay} numberOfLines={2}>
                  {profile.personalInfo.location.address && profile.personalInfo.location.address !== 'Chưa có địa chỉ'
                    ? profile.personalInfo.location.address
                    : `Tọa độ: ${profile.personalInfo.location.latitude.toFixed(6)}, ${profile.personalInfo.location.longitude.toFixed(6)}`}
                </ThemedText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#7F8C8D" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.uploadAvatarButton}
            onPress={() => setShowLocationPicker(true)}
          >
            <Ionicons name="map" size={40} color="#68C2E8" />
            <ThemedText style={styles.uploadAvatarText}>Chọn vị trí trên bản đồ</ThemedText>
          </TouchableOpacity>
        )}
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

      {/* Lưu ý sức khỏe */}
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Lưu ý sức khỏe</ThemedText>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={profile.personalInfo.healthNote}
          onChangeText={(text) => setProfile(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, healthNote: text }
          }))}
          placeholder="Nhập lưu ý về sức khỏe (ví dụ: Cần theo dõi huyết áp thường xuyên)"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
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
            {key === 'toileting' && 'Vệ sinh'}
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

  const handleRequiredSkillToggle = (skillId: string) => {
    setProfile(prev => ({
      ...prev,
      caregiverRequirements: {
        ...prev.caregiverRequirements,
        requiredSkills: prev.caregiverRequirements.requiredSkills.includes(skillId)
          ? prev.caregiverRequirements.requiredSkills.filter(id => id !== skillId)
          : [...prev.caregiverRequirements.requiredSkills, skillId]
      }
    }));
  };

  const handlePrioritySkillToggle = (skillId: string) => {
    setProfile(prev => ({
      ...prev,
      caregiverRequirements: {
        ...prev.caregiverRequirements,
        prioritySkills: prev.caregiverRequirements.prioritySkills.includes(skillId)
          ? prev.caregiverRequirements.prioritySkills.filter(id => id !== skillId)
          : [...prev.caregiverRequirements.prioritySkills, skillId]
      }
    }));
  };

  const renderCaregiverRequest = () => (
    <View style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>Yêu cầu tìm người chăm sóc</ThemedText>
      <ThemedText style={styles.stepDescription}>Thông tin về nhu cầu tìm người chăm sóc</ThemedText>
      
      {/* Mức độ chăm sóc cần thiết */}
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Mức độ chăm sóc cần thiết</ThemedText>
        {careLevels.map((level) => (
          <TouchableOpacity
            key={level.id}
            style={[
              styles.optionCard,
              profile.caregiverRequirements.careLevel === level.id && styles.optionCardSelected
            ]}
            onPress={() => setProfile(prev => ({
              ...prev,
              caregiverRequirements: { ...prev.caregiverRequirements, careLevel: level.id }
            }))}
          >
            <View style={styles.optionContent}>
              <ThemedText style={[
                styles.optionTitle,
                profile.caregiverRequirements.careLevel === level.id && styles.optionTitleSelected
              ]}>
                {level.label}
              </ThemedText>
              <ThemedText style={[
                styles.optionDescription,
                profile.caregiverRequirements.careLevel === level.id && styles.optionDescriptionSelected
              ]}>
                {level.description}
              </ThemedText>
            </View>
            {profile.caregiverRequirements.careLevel === level.id && (
              <Ionicons name="checkmark-circle" size={24} color="#68C2E8" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Kĩ năng bắt buộc khác */}
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Kĩ năng bắt buộc khác</ThemedText>
        <DynamicInputList
          title=""
          placeholder="Nhập kĩ năng bắt buộc"
          items={profile.caregiverRequirements.customRequiredSkills}
          onItemsChange={(customRequiredSkills) => setProfile(prev => ({
            ...prev,
            caregiverRequirements: { ...prev.caregiverRequirements, customRequiredSkills }
          }))}
          maxItems={5}
        />
      </View>

      {/* Kĩ năng ưu tiên khác */}
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Kĩ năng ưu tiên khác</ThemedText>
        <DynamicInputList
          title=""
          placeholder="Nhập kĩ năng ưu tiên"
          items={profile.caregiverRequirements.customPrioritySkills}
          onItemsChange={(customPrioritySkills) => setProfile(prev => ({
            ...prev,
            caregiverRequirements: { ...prev.caregiverRequirements, customPrioritySkills }
          }))}
          maxItems={5}
        />
      </View>

      {/* Độ tuổi của người chăm sóc */}
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Độ tuổi người chăm sóc</ThemedText>
        <View style={styles.ageRangeContainer}>
          <View style={styles.ageInputContainer}>
            <ThemedText style={styles.ageLabel}>Từ</ThemedText>
            <TextInput
              style={styles.ageInput}
              value={profile.caregiverRequirements.caregiverAgeRange?.min || ''}
              onChangeText={(text) => setProfile(prev => ({
                ...prev,
                caregiverRequirements: {
                  ...prev.caregiverRequirements,
                  caregiverAgeRange: prev.caregiverRequirements.caregiverAgeRange
                    ? { ...prev.caregiverRequirements.caregiverAgeRange, min: text }
                    : { min: text, max: '' }
                }
              }))}
              placeholder="Ví dụ: 25"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.ageInputContainer}>
            <ThemedText style={styles.ageLabel}>Đến</ThemedText>
            <TextInput
              style={styles.ageInput}
              value={profile.caregiverRequirements.caregiverAgeRange?.max || ''}
              onChangeText={(text) => setProfile(prev => ({
                ...prev,
                caregiverRequirements: {
                  ...prev.caregiverRequirements,
                  caregiverAgeRange: prev.caregiverRequirements.caregiverAgeRange
                    ? { ...prev.caregiverRequirements.caregiverAgeRange, max: text }
                    : { min: '', max: text }
                }
              }))}
              placeholder="Ví dụ: 50"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>
        </View>
      </View>

      {/* Giới tính */}
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Giới tính</ThemedText>
        <View style={styles.genderOptions}>
          {genderOptions.map((gender) => (
            <TouchableOpacity
              key={gender.id || 'any'}
              style={[
                styles.genderCard,
                profile.caregiverRequirements.genderPreference === gender.id && styles.genderCardSelected
              ]}
              onPress={() => setProfile(prev => ({
                ...prev,
                caregiverRequirements: { ...prev.caregiverRequirements, genderPreference: gender.id }
              }))}
            >
              <ThemedText style={[
                styles.genderText,
                profile.caregiverRequirements.genderPreference === gender.id && styles.genderTextSelected
              ]}>
                {gender.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Kinh nghiệm */}
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Kinh nghiệm</ThemedText>
        {experienceLevels.map((exp) => (
          <TouchableOpacity
            key={exp.id || 'none'}
            style={[
              styles.optionCard,
              profile.caregiverRequirements.requiredYearsExperience === exp.id && styles.optionCardSelected
            ]}
            onPress={() => setProfile(prev => ({
              ...prev,
              caregiverRequirements: { ...prev.caregiverRequirements, requiredYearsExperience: exp.id }
            }))}
          >
            <ThemedText style={[
              styles.optionTitle,
              profile.caregiverRequirements.requiredYearsExperience === exp.id && styles.optionTitleSelected
            ]}>
              {exp.label}
            </ThemedText>
            {profile.caregiverRequirements.requiredYearsExperience === exp.id && (
              <Ionicons name="checkmark-circle" size={24} color="#68C2E8" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Đánh giá */}
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Đánh giá</ThemedText>
        {ratingRangeOptions.map((rating) => (
          <TouchableOpacity
            key={rating.id || 'none'}
            style={[
              styles.optionCard,
              ((!profile.caregiverRequirements.overallRatingRange && !rating.id) ||
               (profile.caregiverRequirements.overallRatingRange && rating.id &&
                profile.caregiverRequirements.overallRatingRange.min === rating.min &&
                profile.caregiverRequirements.overallRatingRange.max === rating.max)) && styles.optionCardSelected
            ]}
            onPress={() => setProfile(prev => ({
              ...prev,
              caregiverRequirements: {
                ...prev.caregiverRequirements,
                overallRatingRange: rating.id ? { min: rating.min, max: rating.max } : null
              }
            }))}
          >
            <ThemedText style={[
              styles.optionTitle,
              ((!profile.caregiverRequirements.overallRatingRange && !rating.id) ||
               (profile.caregiverRequirements.overallRatingRange && rating.id &&
                profile.caregiverRequirements.overallRatingRange.min === rating.min &&
                profile.caregiverRequirements.overallRatingRange.max === rating.max)) && styles.optionTitleSelected
            ]}>
              {rating.label}
            </ThemedText>
            {((!profile.caregiverRequirements.overallRatingRange && !rating.id) ||
              (profile.caregiverRequirements.overallRatingRange && rating.id &&
               profile.caregiverRequirements.overallRatingRange.min === rating.min &&
               profile.caregiverRequirements.overallRatingRange.max === rating.max)) && (
              <Ionicons name="checkmark-circle" size={24} color="#68C2E8" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderPersonalInfo();
      case 2: return renderIndependenceLevel();
      case 3: return renderPreferences();
      case 4: return renderCaregiverRequest();
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
          <ThemedText style={styles.headerTitle} numberOfLines={1}>Tạo hồ sơ người già</ThemedText>
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

      {/* Image Picker Modal */}
      <Modal
        visible={showImagePickerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImagePickerModal(false)}
      >
        <View style={styles.imagePickerModalOverlay}>
          <View style={styles.imagePickerModalContent}>
            <View style={styles.imagePickerModalHeader}>
              <ThemedText style={styles.imagePickerModalTitle}>Chọn ảnh đại diện</ThemedText>
              <TouchableOpacity
                style={styles.imagePickerModalCloseButton}
                onPress={() => setShowImagePickerModal(false)}
              >
                <Ionicons name="close" size={24} color="#6c757d" />
              </TouchableOpacity>
            </View>
            
            <ThemedText style={styles.imagePickerModalSubtitle}>
              Bạn muốn chụp ảnh mới hay chọn từ thư viện?
            </ThemedText>

            <View style={styles.imagePickerOptions}>
              <TouchableOpacity
                style={styles.imagePickerOption}
                onPress={handleTakePhoto}
              >
                <View style={styles.imagePickerOptionIconContainer}>
                  <Ionicons name="camera" size={32} color="#68C2E8" />
                </View>
                <ThemedText style={styles.imagePickerOptionTitle}>Chụp ảnh</ThemedText>
                <ThemedText style={styles.imagePickerOptionDescription}>
                  Chụp ảnh mới bằng camera
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.imagePickerOption}
                onPress={handlePickFromLibrary}
              >
                <View style={styles.imagePickerOptionIconContainer}>
                  <Ionicons name="images" size={32} color="#68C2E8" />
                </View>
                <ThemedText style={styles.imagePickerOptionTitle}>Thư viện</ThemedText>
                <ThemedText style={styles.imagePickerOptionDescription}>
                  Chọn ảnh từ thư viện
                </ThemedText>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.imagePickerCancelButton}
              onPress={() => setShowImagePickerModal(false)}
            >
              <ThemedText style={styles.imagePickerCancelButtonText}>Hủy</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
          <TouchableOpacity 
            style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <ActivityIndicator size="small" color="white" />
                <ThemedText style={styles.saveButtonText}>Đang tạo...</ThemedText>
              </>
            ) : (
              <ThemedText style={styles.saveButtonText}>Tạo hồ sơ</ThemedText>
            )}
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

      {/* Location Picker Modal */}
      <LocationPickerModal
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelectLocation={(lat, lng, address) => {
          setLocation({ latitude: lat, longitude: lng });
          setProfile(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, location: { latitude: lat, longitude: lng, address: address || '' } }
          }));
          setShowLocationPicker(false);
        }}
        initialLocation={profile.personalInfo.location}
      />

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.errorModalOverlay}>
          <View style={styles.errorModalContent}>
            <View style={styles.errorModalHeader}>
              <Ionicons name="alert-circle" size={32} color="#E74C3C" />
              <ThemedText style={styles.errorModalTitle}>Lỗi</ThemedText>
            </View>
            <ThemedText style={styles.errorModalMessage}>{errorMessage}</ThemedText>
            <TouchableOpacity
              style={styles.errorModalButton}
              onPress={() => setShowErrorModal(false)}
            >
              <ThemedText style={styles.errorModalButtonText}>Đóng</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Birth Year Picker Modal */}
      <Modal
        visible={showBirthYearPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBirthYearPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.birthYearPickerContainer}>
            <View style={styles.birthYearPickerHeader}>
              <TouchableOpacity onPress={() => setShowBirthYearPicker(false)}>
                <ThemedText style={styles.birthYearPickerCancel}>Hủy</ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.birthYearPickerTitle}>Chọn năm sinh</ThemedText>
              <TouchableOpacity onPress={() => setShowBirthYearPicker(false)}>
                <ThemedText style={styles.birthYearPickerDone}>Xong</ThemedText>
              </TouchableOpacity>
            </View>
            <FlatList
              data={Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => new Date().getFullYear() - i)}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.birthYearItem,
                    profile.personalInfo.birthYear === item.toString() && styles.birthYearItemSelected
                  ]}
                  onPress={() => {
                    setProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, birthYear: item.toString() }
                    }));
                  }}
                >
                  <ThemedText style={[
                    styles.birthYearItemText,
                    profile.personalInfo.birthYear === item.toString() && styles.birthYearItemTextSelected
                  ]}>
                    {item}
                  </ThemedText>
                </TouchableOpacity>
              )}
            />
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
    flexShrink: 1,
    minWidth: 0,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    textAlign: 'center',
    numberOfLines: 1,
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
    justifyContent: 'space-between',
  },
  previousButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E8EBED',
    backgroundColor: 'white',
    flex: 1,
  },
  previousButtonText: {
    fontSize: 16,
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
    justifyContent: 'center',
    backgroundColor: '#68C2E8',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#68C2E8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    flex: 1,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginRight: 6,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27AE60',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    flex: 1,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  saveButtonDisabled: {
    opacity: 0.6,
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
  placeholderSection: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8EBED',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  // Caregiver Requirements Styles
  healthLevelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  healthLevelCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  healthLevelCardSelected: {
    backgroundColor: '#68C2E8',
    borderColor: '#68C2E8',
  },
  healthLevelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 8,
    textAlign: 'center',
  },
  healthLevelTextSelected: {
    color: 'white',
  },
  optionCard: {
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
  optionCardSelected: {
    borderColor: '#68C2E8',
    backgroundColor: '#f0fdfa',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  optionTitleSelected: {
    color: '#68C2E8',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  optionDescriptionSelected: {
    color: '#68C2E8',
  },
  ageRangeContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  ageInputContainer: {
    flex: 1,
  },
  ageLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 8,
  },
  ageInput: {
    height: 48,
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#2c3e50',
    backgroundColor: 'white',
    textAlign: 'center',
  },
  genderOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  genderCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
  },
  genderCardSelected: {
    backgroundColor: '#68C2E8',
    borderColor: '#68C2E8',
  },
  genderText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  genderTextSelected: {
    color: 'white',
  },
  // Avatar Upload Styles
  avatarContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  avatarImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#68C2E8',
  },
  removeAvatarButton: {
    position: 'absolute',
    top: 0,
    right: '30%',
    backgroundColor: 'white',
    borderRadius: 15,
  },
  changeAvatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f0fdfa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#68C2E8',
    gap: 8,
  },
  changeAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#68C2E8',
  },
  uploadAvatarButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#68C2E8',
    borderStyle: 'dashed',
    gap: 12,
  },
  uploadAvatarText: {
    fontSize: 14,
    color: '#68C2E8',
    fontWeight: '500',
    textAlign: 'center',
  },
  // Location Picker Styles
  locationDisplayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F0FDFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#68C2E8',
    minHeight: 80,
  },
  locationInfoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
    fontWeight: '500',
  },
  locationTextDisplay: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
    lineHeight: 20,
  },
  locationSelectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F0FDFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#68C2E8',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  locationCoordinates: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  changeLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#68C2E8',
    gap: 6,
  },
  changeLocationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#68C2E8',
  },
  selectLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#68C2E8',
    borderStyle: 'dashed',
    gap: 12,
  },
  selectLocationText: {
    flex: 1,
    fontSize: 14,
    color: '#68C2E8',
    fontWeight: '500',
  },
  // Image Picker Modal Styles
  imagePickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imagePickerModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imagePickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePickerModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
  },
  imagePickerModalCloseButton: {
    padding: 4,
  },
  imagePickerModalSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 24,
    textAlign: 'center',
  },
  imagePickerOptions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  imagePickerOption: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E8EBED',
  },
  imagePickerOptionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#68C2E8',
  },
  imagePickerOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  imagePickerOptionDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  imagePickerCancelButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  imagePickerCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  errorModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  errorModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  errorModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
  },
  errorModalMessage: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  errorModalButton: {
    backgroundColor: '#68C2E8',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  errorModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  // Birth Year Picker Styles
  birthYearPickerContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
    width: '100%',
  },
  birthYearPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EBED',
  },
  birthYearPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  birthYearPickerCancel: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  birthYearPickerDone: {
    fontSize: 16,
    color: '#68C2E8',
    fontWeight: '600',
  },
  birthYearItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  birthYearItemSelected: {
    backgroundColor: '#E8F5E9',
  },
  birthYearItemText: {
    fontSize: 16,
    color: '#2C3E50',
    textAlign: 'center',
  },
  birthYearItemTextSelected: {
    color: '#68C2E8',
    fontWeight: '600',
  },
  textInputValue: {
    fontSize: 16,
    color: '#2C3E50',
  },
  textInputPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
});
