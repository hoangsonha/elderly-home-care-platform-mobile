import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Animated,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { DynamicInputList } from '@/components/ui/DynamicInputList';
import { WorkTimeSelectorFromAI } from '@/components/ui/WorkTimeSelectorFromAI';
import { SimpleTimePicker } from '@/components/ui/SimpleTimePicker';
import { UserService } from '@/services/user.service';
import { MatchResponse, matchService } from '@/services/matchServiceAxios';
import { mainService, type ServicePackageApiResponse } from '@/services/main.service';
import { formatCurrency } from '@/utils/currency';

interface ElderlyProfile {
  id: string;
  name: string;
  age: number;
  currentCaregivers: number;
  family: string;
  healthStatus: 'good' | 'fair' | 'poor';
  avatar?: string;
}

interface AIMatchingModalProps {
  visible: boolean;
  onClose: () => void;
  onGetRecommendations: (response: MatchResponse) => void;
  elderlyProfiles?: ElderlyProfile[];
}


interface UserInfo {
  elderlyAge: string;
  healthStatus: string;
  careLevel: number;
  requiredSkills: string[];
  prioritySkills: string[];
  customRequiredSkills: string[];
  customPrioritySkills: string[];
  timeSlotGroups: {
    id: string;
    days: string[];
    timeSlots: { slot: string; start: string; end: string }[];
  }[];
  caregiverAgeRange: {
    min: string;
    max: string;
  } | null;
  genderPreference: string | null;
  requiredYearsExperience: string | null;
  personality: string[];
  attitude: string[];
  overallRatingRange: {
    min: number;
    max: number;
  } | null;
  budgetPerHour: string;
}

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


// Helper function to map package type to Vietnamese
const getPackageTypeLabel = (packageType: string | undefined): string => {
  if (!packageType) return '';
  const typeMap: { [key: string]: string } = {
    'BASIC': 'Cơ bản',
    'PROFESSIONAL': 'Chuyên nghiệp',
    'ADVANCED': 'Nâng cao',
  };
  return typeMap[packageType.toUpperCase()] || packageType;
};

export function AIMatchingModal({ visible, onClose, onGetRecommendations, elderlyProfiles: initialProfiles = [] }: AIMatchingModalProps) {
  const insets = useSafeAreaInsets();
  const [userInfo, setUserInfo] = useState<UserInfo>({
    elderlyAge: '',
    healthStatus: 'moderate',
    careLevel: 2,
    requiredSkills: [],
    prioritySkills: [],
    customRequiredSkills: [],
    customPrioritySkills: [],
    timeSlotGroups: [],
    caregiverAgeRange: null,
    genderPreference: null,
    requiredYearsExperience: null,
    personality: [],
    attitude: [],
    overallRatingRange: null, // Mặc định là "Không yêu cầu"
    budgetPerHour: '',
  });

  const [elderlyProfiles, setElderlyProfiles] = useState<ElderlyProfile[]>(initialProfiles);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // Start from step 0
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  
  // Total steps: 0 = select profile (Bước 1/2), 1 = select date/time and service package (Bước 2/2)
  const totalSteps = 2;

  // New state for date/time and service package selection
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [startHour, setStartHour] = useState<string>('');
  const [startMinute, setStartMinute] = useState<string>('');
  const [selectedServicePackageId, setSelectedServicePackageId] = useState<string>('');
  const [servicePackages, setServicePackages] = useState<ServicePackageApiResponse[]>([]);
  const [isLoadingServicePackages, setIsLoadingServicePackages] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerType, setTimePickerType] = useState<'hour' | 'minute'>('hour');

  // Animation values
  const spinValue = new Animated.Value(0);
  const pulseValue = new Animated.Value(1);

  // Fetch elderly profiles from API when modal opens
  useEffect(() => {
    if (visible) {
      const fetchElderlyProfiles = async () => {
        try {
          setIsLoadingProfiles(true);
          const apiProfiles = await UserService.getElderlyProfiles();
          
          // Map API response to ElderlyProfile format
          const mappedProfiles: ElderlyProfile[] = apiProfiles.map((profile: any) => {
            // Map healthStatus from API to component format
            let healthStatus: 'good' | 'fair' | 'poor' = 'fair';
            if (profile.healthStatus) {
              const statusLower = profile.healthStatus.toLowerCase();
              if (statusLower === 'good' || statusLower === 'tốt') {
                healthStatus = 'good';
              } else if (statusLower === 'moderate' || statusLower === 'fair' || statusLower === 'trung bình' || statusLower === 'khá') {
                healthStatus = 'fair';
              } else if (statusLower === 'weak' || statusLower === 'poor' || statusLower === 'yếu' || statusLower === 'kém') {
                healthStatus = 'poor';
              }
            }
            
            return {
              id: profile.elderlyProfileId,
              name: profile.fullName,
              age: profile.age,
              currentCaregivers: 0, // Not available in API
              family: '', // Will be removed from UI
              healthStatus: healthStatus,
              avatar: profile.avatarUrl || undefined,
            };
          });
          
          setElderlyProfiles(mappedProfiles);
        } catch (error) {
          console.error('Error fetching elderly profiles:', error);
          // Fallback to initial profiles on error
          setElderlyProfiles(initialProfiles);
        } finally {
          setIsLoadingProfiles(false);
        }
      };

      fetchElderlyProfiles();
    }
  }, [visible, initialProfiles]);

  useEffect(() => {
    if (isLoading) {
      // Spin animation
      const spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );

      // Pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      spinAnimation.start();
      pulseAnimation.start();

      return () => {
        spinAnimation.stop();
        pulseAnimation.stop();
      };
    }
  }, [isLoading]);

  const handleRequiredSkillToggle = (skillId: string) => {
    setUserInfo(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.includes(skillId)
        ? prev.requiredSkills.filter(id => id !== skillId)
        : [...prev.requiredSkills, skillId]
    }));
  };

  const handlePrioritySkillToggle = (skillId: string) => {
    setUserInfo(prev => ({
      ...prev,
      prioritySkills: prev.prioritySkills.includes(skillId)
        ? prev.prioritySkills.filter(id => id !== skillId)
        : [...prev.prioritySkills, skillId]
    }));
  };



  const handleProfileSelect = (profileId: string | null) => {
    setSelectedProfileId(profileId);
  };

  // Fetch service packages when moving to step 1
  useEffect(() => {
    if (currentStep === 1 && selectedProfileId) {
      const fetchServicePackages = async () => {
        try {
          setIsLoadingServicePackages(true);
          const packages = await mainService.getActiveServicePackages();
          setServicePackages(packages);
        } catch (error) {
          console.error('Error fetching service packages:', error);
          Alert.alert('Lỗi', 'Không thể tải danh sách gói dịch vụ. Vui lòng thử lại.');
        } finally {
          setIsLoadingServicePackages(false);
        }
      };
      fetchServicePackages();
    }
  }, [currentStep, selectedProfileId]);

  const handleConfirmProfile = () => {
    if (selectedProfileId) {
      // Auto-fill info from selected profile
      const profile = elderlyProfiles.find(p => p.id === selectedProfileId);
      if (profile) {
        setUserInfo(prev => ({
          ...prev,
          elderlyAge: profile.age.toString(),
          healthStatus: profile.healthStatus === 'good' ? 'low' : profile.healthStatus === 'fair' ? 'moderate' : 'high',
        }));
        
        // Move to step 1 (date/time and service package selection) instead of calling API
        setCurrentStep(1);
      }
    }
  };

  const handleNext = async () => {
    // Step 1: Validate date/time and service package before calling API
    if (currentStep === 1 && selectedProfileId) {
      if (!selectedDate) {
        Alert.alert('Thiếu thông tin', 'Vui lòng chọn ngày làm việc');
        return;
      }
      if (!startHour || !startMinute) {
        Alert.alert('Thiếu thông tin', 'Vui lòng chọn giờ bắt đầu');
        return;
      }
      if (!selectedServicePackageId) {
        Alert.alert('Thiếu thông tin', 'Vui lòng chọn gói dịch vụ');
        return;
      }

      // Call API with new endpoint
      setIsLoading(true);
      try {
        const response = await matchService.matchCaregiversWithProfile({
          elderly_profile_id: selectedProfileId,
          service_package_id: selectedServicePackageId,
          work_date: selectedDate,
          start_hour: startHour,
          start_minute: startMinute,
          top_n: 10,
        });
        setIsLoading(false);
        onGetRecommendations(response);
      } catch (error: any) {
        setIsLoading(false);
        Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.');
      }
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Validate required fields
      if (!userInfo.elderlyAge) {
        Alert.alert('Thiếu thông tin', 'Vui lòng nhập tuổi của người già');
        return;
      }
      if (!userInfo.healthStatus) {
        Alert.alert('Thiếu thông tin', 'Vui lòng chọn mức độ sức khỏe');
        return;
      }
      if (!userInfo.careLevel) {
        Alert.alert('Thiếu thông tin', 'Vui lòng chọn mức độ chăm sóc cần thiết');
        return;
      }
      if (userInfo.timeSlotGroups.length === 0) {
        Alert.alert('Thiếu thông tin', 'Vui lòng thêm ít nhất một khung thời gian làm việc');
        return;
      }
      if (!userInfo.budgetPerHour) {
        Alert.alert('Thiếu thông tin', 'Vui lòng chọn ngân sách dự kiến');
        return;
      }
      // Transform userInfo to API request format
      const requestBody = {
        seeker_name: "Người dùng", // You can get this from user context
        care_level: userInfo.careLevel,
        health_status: userInfo.healthStatus,
        elderly_age: parseInt(userInfo.elderlyAge),
        caregiver_age_range: userInfo.caregiverAgeRange ? [
          parseInt(userInfo.caregiverAgeRange.min),
          parseInt(userInfo.caregiverAgeRange.max)
        ] as [number, number] : null,
        gender_preference: userInfo.genderPreference,
        required_years_experience: userInfo.requiredYearsExperience ? parseInt(userInfo.requiredYearsExperience) : null,
        overall_rating_range: userInfo.overallRatingRange ? [
          userInfo.overallRatingRange.min,
          userInfo.overallRatingRange.max
        ] as [number, number] : null,
        personality: userInfo.personality,
        attitude: userInfo.attitude,
        skills: {
          required_skills: [...userInfo.requiredSkills, ...userInfo.customRequiredSkills],
          priority_skills: [...userInfo.prioritySkills, ...userInfo.customPrioritySkills]
        },
        time_slots: userInfo.timeSlotGroups.flatMap(group => 
          group.days.flatMap(day => 
            group.timeSlots.map(slot => ({
              day: day.toLowerCase(),
              start: slot.start,
              end: slot.end
            }))
          )
        ),
        location: {
          lat: 10.7350,
          lon: 106.7200,
          address: "Quận 7, TP.HCM"
        },
        budget_per_hour: parseInt(userInfo.budgetPerHour)
      };
      // Gọi API thông qua service
      setIsLoading(true);
      try {
        const response = await matchService.matchCaregivers(requestBody);
        
        
        onGetRecommendations(response);
      } catch (error: any) {
        Alert.alert(
          'Lỗi API',
          error.message || 'Có lỗi xảy ra khi gọi API. Vui lòng thử lại.',
          [{ text: 'OK' }]
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep0 = () => {
    const getHealthStatusText = (status: string) => {
      switch (status) {
        case 'good': return 'Tốt';
        case 'fair': return 'Trung bình';
        case 'poor': return 'Yếu';
        default: return 'Không xác định';
      }
    };

    const getHealthStatusColor = (status: string) => {
      switch (status) {
        case 'good': return '#28a745';
        case 'fair': return '#ffc107';
        case 'poor': return '#dc3545';
        default: return '#6c757d';
      }
    };

    return (
      <View style={styles.stepContent}>
        <ThemedText style={styles.stepTitle}>Chọn hồ sơ người già</ThemedText>
        <ThemedText style={styles.stepDescription}>
          Chọn một hồ sơ người già hoặc nhập yêu cầu thủ công
        </ThemedText>

        {isLoadingProfiles ? (
          <View style={styles.loadingProfilesContainer}>
            <ThemedText style={styles.loadingProfilesText}>Đang tải danh sách người già...</ThemedText>
          </View>
        ) : elderlyProfiles.length > 0 ? (
          <ScrollView 
            style={styles.profileList} 
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {elderlyProfiles.map((profile) => (
              <TouchableOpacity
                key={profile.id}
                style={[
                  styles.profileCard,
                  selectedProfileId === profile.id && styles.profileCardSelected
                ]}
                onPress={() => setSelectedProfileId(selectedProfileId === profile.id ? null : profile.id)}
              >
                <View style={styles.profileHeader}>
                  <View style={styles.profileInfo}>
                    <ThemedText style={[
                      styles.profileName,
                      selectedProfileId === profile.id && styles.profileNameSelected
                    ]}>
                      {profile.name}
                    </ThemedText>
                    <ThemedText style={[
                      styles.profileAge,
                      selectedProfileId === profile.id && styles.profileAgeSelected
                    ]}>
                      {profile.age} tuổi
                    </ThemedText>
                  </View>
                  
                  <View style={styles.selectionIndicator}>
                    {selectedProfileId === profile.id ? (
                      <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
                    ) : (
                      <View style={styles.unselectedCircle} />
                    )}
                  </View>
                </View>

                <View style={styles.profileDetails}>
                  {profile.family && (
                    <View style={styles.detailRow}>
                      <Ionicons name="people" size={16} color="#9CA3AF" />
                      <ThemedText style={styles.detailText}>
                        Gia đình: {profile.family}
                      </ThemedText>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Ionicons name="pulse" size={16} color="#9CA3AF" />
                    <View style={[styles.healthBadge, { backgroundColor: getHealthStatusColor(profile.healthStatus) + '20' }]}>
                      <View style={[styles.healthDot, { backgroundColor: getHealthStatusColor(profile.healthStatus) }]} />
                      <ThemedText style={[styles.healthStatusText, { color: getHealthStatusColor(profile.healthStatus) }]}>
                        {getHealthStatusText(profile.healthStatus)}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}
      </View>
    );
  };

  const renderStep1 = () => {
    // Show date/time and service package selection when profile is selected
    if (selectedProfileId) {
      const selectedProfile = elderlyProfiles.find(p => p.id === selectedProfileId);
      
      // Generate dates for next 7 days - format like BookingModal
      const dates = [];
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const monthNames = ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 
                          'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12'];
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        const displayStr = `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]} ${year}`;
        
        dates.push({
          date: date,
          dateStr: dateStr,
          displayStr: displayStr,
        });
      }

      return (
        <View style={styles.stepContent}>
          <ThemedText style={styles.stepTitle}>Chọn ngày giờ và dịch vụ</ThemedText>
          
          {/* Selected Profile Card */}
          <View style={styles.selectedProfileCard}>
            <Ionicons name="person-circle" size={24} color="#4ECDC4" />
            <ThemedText style={styles.selectedProfileText}>
              Đã chọn: <ThemedText style={styles.selectedProfileName}>{selectedProfile?.name || 'Người già'}</ThemedText>
            </ThemedText>
          </View>

          {/* Date Selection */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <ThemedText style={styles.inputLabel}>Ngày làm việc</ThemedText>
              <ThemedText style={styles.requiredMark}>*</ThemedText>
            </View>
            <TouchableOpacity 
              style={styles.pickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <ThemedText style={[styles.pickerButtonText, !selectedDate && styles.placeholderText]}>
                {selectedDate ? dates.find(d => d.dateStr === selectedDate)?.displayStr : 'Chọn ngày làm việc'}
              </ThemedText>
              <Ionicons name="calendar-outline" size={20} color="#68C2E8" />
            </TouchableOpacity>
          </View>

          {/* Time Selection */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <ThemedText style={styles.inputLabel}>Giờ bắt đầu</ThemedText>
              <ThemedText style={styles.requiredMark}>*</ThemedText>
            </View>
            <View style={styles.timePickerContainer}>
              <TouchableOpacity 
                style={[styles.pickerButton, styles.timePickerButton]}
                onPress={() => {
                  setTimePickerType('hour');
                  setShowTimePicker(true);
                }}
              >
                <ThemedText style={[styles.pickerButtonText, !startHour && styles.placeholderText, { textAlign: 'center' }]}>
                  {startHour || 'Giờ'}
                </ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.timeSeparator}>:</ThemedText>
              <TouchableOpacity 
                style={[styles.pickerButton, styles.timePickerButton]}
                onPress={() => {
                  setTimePickerType('minute');
                  setShowTimePicker(true);
                }}
              >
                <ThemedText style={[styles.pickerButtonText, !startMinute && styles.placeholderText, { textAlign: 'center' }]}>
                  {startMinute || 'Phút'}
                </ThemedText>
              </TouchableOpacity>
            </View>
            {startHour && startMinute && (
              <ThemedText style={styles.timeRangeText}>
                Giờ bắt đầu: {startHour}:{startMinute}
              </ThemedText>
            )}
          </View>

          {/* Service Package Selection */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <ThemedText style={styles.inputLabel}>Chọn gói dịch vụ</ThemedText>
              <ThemedText style={styles.requiredMark}>*</ThemedText>
            </View>
            {isLoadingServicePackages ? (
              <View style={styles.loadingContainer}>
                <ThemedText style={styles.loadingText}>Đang tải danh sách gói dịch vụ...</ThemedText>
              </View>
            ) : (
              <ScrollView 
                style={styles.packagesScrollView}
                contentContainerStyle={styles.packagesContainer}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                {servicePackages.map((pkg) => (
                  <TouchableOpacity
                    key={pkg.servicePackageId}
                    style={[
                      styles.packageCard,
                      selectedServicePackageId === pkg.servicePackageId && styles.packageCardSelected
                    ]}
                    onPress={() => setSelectedServicePackageId(pkg.servicePackageId)}
                  >
                    {selectedServicePackageId === pkg.servicePackageId && (
                      <View style={styles.packageCheckmark}>
                        <Ionicons name="checkmark-circle" size={24} color="#4ECDC4" />
                      </View>
                    )}
                    <ThemedText style={styles.packageName}>{pkg.packageName}</ThemedText>
                    <View style={styles.packageDetails}>
                      <View style={styles.packageDetailRow}>
                        <View style={styles.packageDetailItem}>
                          <Ionicons name="time-outline" size={16} color="#6c757d" />
                          <ThemedText style={styles.packageDetailText}>{pkg.durationHours}h</ThemedText>
                        </View>
                        <ThemedText style={styles.packagePrice}>
                          {pkg.price.toLocaleString('vi-VN')} VNĐ
                        </ThemedText>
                      </View>
                      {pkg.packageType && (
                        <View style={styles.packageTypeContainer}>
                          <ThemedText style={styles.packageTypeText}>
                            Loại: {getPackageTypeLabel(pkg.packageType)}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                    {pkg.serviceTasks && pkg.serviceTasks.length > 0 && (
                      <View style={styles.packageServices}>
                        <ThemedText style={styles.packageServicesTitle}>Dịch vụ bao gồm:</ThemedText>
                        {pkg.serviceTasks.map((task, index) => (
                          <View key={index} style={styles.packageServiceItem}>
                            <Ionicons name="checkmark" size={16} color="#4ECDC4" />
                            <ThemedText style={styles.packageServiceText}>{task.taskName || task}</ThemedText>
                          </View>
                        ))}
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Date Picker Modal */}
          <Modal
            visible={showDatePicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.pickerHeader}>
                  <ThemedText style={styles.pickerTitle}>Chọn ngày làm việc</ThemedText>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Ionicons name="close" size={24} color="#6c757d" />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.pickerScroll}>
                  <View style={styles.pickerContent}>
                    {dates.map((dateItem) => {
                      const isSelected = selectedDate === dateItem.dateStr;
                      return (
                        <TouchableOpacity
                          key={dateItem.dateStr}
                          style={[
                            styles.pickerItem,
                            styles.datePickerItem,
                            isSelected && styles.pickerItemSelected
                          ]}
                          onPress={() => {
                            setSelectedDate(dateItem.dateStr);
                            setShowDatePicker(false);
                          }}
                        >
                          <ThemedText style={[
                            styles.pickerText,
                            isSelected && styles.pickerTextSelected
                          ]}>
                            {dateItem.displayStr}
                          </ThemedText>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* Time Picker Modal */}
          <Modal
            visible={showTimePicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowTimePicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.pickerHeader}>
                  <ThemedText style={styles.pickerTitle}>
                    {timePickerType === 'hour' ? 'Chọn giờ' : 'Chọn phút'}
                  </ThemedText>
                  <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                    <Ionicons name="close" size={24} color="#6c757d" />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.pickerScroll}>
                  <View style={styles.pickerContent}>
                    {timePickerType === 'hour' 
                      ? Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0');
                          return (
                            <TouchableOpacity
                              key={hour}
                              style={[
                                styles.pickerItem,
                                startHour === hour && styles.pickerItemSelected
                              ]}
                              onPress={() => {
                                setStartHour(hour);
                                setShowTimePicker(false);
                              }}
                            >
                              <ThemedText style={[
                                styles.pickerText,
                                startHour === hour && styles.pickerTextSelected
                              ]}>
                                {hour}
                              </ThemedText>
                            </TouchableOpacity>
                          );
                        })
                      : Array.from({ length: 60 }, (_, i) => {
                          const minute = i.toString().padStart(2, '0');
                          return (
                            <TouchableOpacity
                              key={minute}
                              style={[
                                styles.pickerItem,
                                startMinute === minute && styles.pickerItemSelected
                              ]}
                              onPress={() => {
                                setStartMinute(minute);
                                setShowTimePicker(false);
                              }}
                            >
                              <ThemedText style={[
                                styles.pickerText,
                                startMinute === minute && styles.pickerTextSelected
                              ]}>
                                {minute}
                              </ThemedText>
                            </TouchableOpacity>
                          );
                        })
                    }
                  </View>
                </ScrollView>
              </View>
            </View>
          </Modal>
        </View>
      );
    }

    // If no profile selected, return empty view (should not happen)
    return null;
  };


  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderStep0(); // Profile selection
      case 1: return renderStep1(); // Date/time and service package selection
      default: return renderStep0();
    }
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <ThemedText style={styles.headerTitle}>AI Gợi ý Người Chăm Sóc</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Bước {currentStep + 1}/{totalSteps}
            </ThemedText>
          </View>

          <View style={styles.placeholder} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentStep + 1) / totalSteps) * 100}%` }
              ]} 
            />
          </View>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          {renderCurrentStep()}
        </ScrollView>

        {/* Navigation */}
        <View style={[styles.navigation, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          {currentStep > 0 && (
            <TouchableOpacity style={styles.previousButton} onPress={handlePrevious}>
              <Ionicons name="chevron-back" size={20} color="#4ECDC4" />
              <ThemedText style={styles.previousButtonText}>Trước</ThemedText>
            </TouchableOpacity>
          )}
          <View style={styles.navigationSpacer} />
          <TouchableOpacity 
            style={[
              styles.nextButton, 
              (isLoading || 
               (currentStep === 0 && !selectedProfileId) ||
               (currentStep === 1 && selectedProfileId && (!selectedDate || !startHour || !startMinute || !selectedServicePackageId))
              ) && styles.nextButtonDisabled
            ]} 
            onPress={currentStep === 0 ? handleConfirmProfile : handleNext}
            disabled={
              isLoading || 
              (currentStep === 0 && !selectedProfileId) ||
              (currentStep === 1 && selectedProfileId && (!selectedDate || !startHour || !startMinute || !selectedServicePackageId))
            }
          >
            <ThemedText style={styles.nextButtonText}>
              {currentStep === 0 ? 'Xác nhận' :
               currentStep === 1 ? 'Xác nhận' : 'Tiếp theo'}
            </ThemedText>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <Animated.View 
                style={[
                  styles.loadingIconContainer,
                  { transform: [{ scale: pulseValue }] }
                ]}
              >
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <Ionicons name="heart" size={48} color="#4ECDC4" />
                </Animated.View>
              </Animated.View>
              
              <ThemedText style={styles.loadingTitle}>
                Đang tìm người chăm sóc phù hợp cho bạn
              </ThemedText>
              
              <ThemedText style={styles.loadingSubtitle}>
                AI đang phân tích và tìm kiếm những người chăm sóc tốt nhất...
              </ThemedText>
              
              <View style={styles.loadingDots}>
                <Animated.View style={[styles.dot, { opacity: pulseValue }]} />
                <Animated.View style={[styles.dot, { opacity: pulseValue }]} />
                <Animated.View style={[styles.dot, { opacity: pulseValue }]} />
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
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
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  textInput: {
    height: 48,
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#2c3e50',
    backgroundColor: 'white',
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
    borderColor: '#4ECDC4',
    backgroundColor: '#f0fdfa',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: '#4ECDC4',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6c757d',
  },
  optionDescriptionSelected: {
    color: '#4ECDC4',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  specialNeedCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  specialNeedCardSelected: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  specialNeedText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  specialNeedTextSelected: {
    color: 'white',
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
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  genderText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  genderTextSelected: {
    color: 'white',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  previousButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  previousButtonText: {
    marginLeft: 8,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  navigationSpacer: {
    flex: 1,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  nextButtonText: {
    marginRight: 8,
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  loadingProfilesContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  loadingProfilesText: {
    fontSize: 14,
    color: '#6c757d',
  },
  profileList: {
    maxHeight: 400,
    marginBottom: 16,
    flex: 1,
  },
  manualInputButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  profileCardSelected: {
    borderColor: '#4ECDC4',
    backgroundColor: '#F0FDFB',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  profileNameSelected: {
    color: '#4ECDC4',
  },
  profileAge: {
    fontSize: 16,
    color: '#6B7280',
  },
  profileAgeSelected: {
    color: '#4ECDC4',
  },
  selectionIndicator: {
    marginLeft: 12,
  },
  unselectedCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  profileDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  healthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  healthStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  manualInputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDFB',
    borderWidth: 1,
    borderColor: '#4ECDC4',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  manualInputButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ECDC4',
  },
  helpText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 16,
  },
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
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  healthLevelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 8,
  },
  healthLevelTextSelected: {
    color: 'white',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdfa',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  mapButtonText: {
    marginLeft: 8,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  priceReferenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdfa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  priceReferenceText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  requiredMark: {
    color: '#dc3545',
    fontWeight: 'bold',
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
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdfa',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  locationText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    flex: 1,
  },
  locationNote: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
    marginTop: 8,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ff6b6b',
    marginBottom: 16,
  },
  warningText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#dc3545',
    flex: 1,
    lineHeight: 20,
  },
  budgetInput: {
    height: 48,
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#2c3e50',
    backgroundColor: 'white',
  },
  currencyDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f0fdfa',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  currencyText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
    marginLeft: 6,
  },
  // Loading Overlay Styles
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  loadingIconContainer: {
    marginBottom: 24,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 12,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ECDC4',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#2c3e50',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  timePickerButton: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeSeparator: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  timeRangeText: {
    fontSize: 14,
    color: '#68C2E8',
    marginTop: 8,
    fontWeight: '500',
  },
  packagesScrollView: {
    maxHeight: 400,
  },
  packagesContainer: {
    gap: 12,
  },
  packageCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    position: 'relative',
  },
  packageCardSelected: {
    borderColor: '#4ECDC4',
    backgroundColor: '#f0fdfa',
  },
  packageCheckmark: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  packageName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  packageDetails: {
    marginBottom: 12,
  },
  packageDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  packageDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  packageDetailText: {
    fontSize: 14,
    color: '#6c757d',
  },
  packagePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ECDC4',
  },
  packageTypeContainer: {
    marginTop: 4,
  },
  packageTypeText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  packageServices: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  packageServicesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  packageServiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  packageServiceText: {
    fontSize: 14,
    color: '#6c757d',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    maxHeight: '80%',
    width: '90%',
    maxWidth: 400,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  pickerScroll: {
    maxHeight: 400,
  },
  pickerContent: {
    padding: 20,
  },
  pickerItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerItemSelected: {
    backgroundColor: '#68C2E8',
  },
  pickerText: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
  },
  pickerTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  stepDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 24,
  },
  selectedProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#B2F5EA',
    gap: 12,
  },
  selectedProfileText: {
    fontSize: 16,
    color: '#64748B',
  },
  selectedProfileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ECDC4',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  datePickerItem: {
    width: '100%',
    paddingHorizontal: 16,
  },
});