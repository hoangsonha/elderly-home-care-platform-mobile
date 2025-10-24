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

import { ThemedText } from '@/components/themed-text';
import { DynamicInputList } from '@/components/ui/DynamicInputList';
import { WorkTimeSelectorFromAI } from '@/components/ui/WorkTimeSelectorFromAI';
import { MatchResponse, matchService } from '@/services/matchServiceAxios';
import { formatCurrency } from '@/utils/currency';

interface AIMatchingModalProps {
  visible: boolean;
  onClose: () => void;
  onGetRecommendations: (response: MatchResponse) => void;
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


export function AIMatchingModal({ visible, onClose, onGetRecommendations }: AIMatchingModalProps) {
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


  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const totalSteps = 6;

  // Animation values
  const spinValue = new Animated.Value(0);
  const pulseValue = new Animated.Value(1);

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



  const handleNext = async () => {
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
      // Log request body để debug
      console.log('=== REQUEST BODY KHI BẤM "GỢI Ý TỪ AI" ===');
      console.log(JSON.stringify(requestBody, null, 2));
      console.log('==========================================');
      // Gọi API thông qua service
      setIsLoading(true);
      try {
        const response = await matchService.matchCaregivers(requestBody);
        
        // Log chi tiết với score_breakdown
        console.log('✅ API Response với Score Breakdown:');
        console.log(JSON.stringify({
          total_matches: response.total_matches,
          recommendations: response.recommendations.map(rec => ({
            name: rec.name,
            match_score: rec.match_score,
            match_percentage: rec.match_percentage,
            score_breakdown: rec.score_breakdown
          }))
        }, null, 2));
        
        onGetRecommendations(response);
      } catch (error: any) {
        console.error('❌ API Error:', error);
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
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>Thông tin cơ bản của người già</ThemedText>
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Tuổi của người già <ThemedText style={styles.requiredMark}>*</ThemedText></ThemedText>
        <TextInput
          style={styles.textInput}
          value={userInfo.elderlyAge}
          onChangeText={(text) => {
            // Chỉ cho phép nhập số
            const numericText = text.replace(/[^0-9]/g, '');
            setUserInfo(prev => ({ ...prev, elderlyAge: numericText }));
          }}
          placeholder="Ví dụ: 60"
          keyboardType="numeric"
          placeholderTextColor="#999"
        />
      </View>
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Mức độ sức khỏe <ThemedText style={styles.requiredMark}>*</ThemedText></ThemedText>
        <View style={styles.healthLevelContainer}>
          <TouchableOpacity
            style={[
              styles.healthLevelCard,
              userInfo.healthStatus === 'good' && styles.healthLevelCardSelected
            ]}
            onPress={() => setUserInfo(prev => ({ ...prev, healthStatus: 'good' }))}
          >
            <Ionicons name="happy" size={32} color={userInfo.healthStatus === 'good' ? 'white' : '#4ECDC4'} />
            <ThemedText style={[
              styles.healthLevelText,
              userInfo.healthStatus === 'good' && styles.healthLevelTextSelected
            ]}>
              Tốt
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.healthLevelCard,
              userInfo.healthStatus === 'moderate' && styles.healthLevelCardSelected
            ]}
            onPress={() => setUserInfo(prev => ({ ...prev, healthStatus: 'moderate' }))}
          >
            <Ionicons name="medical" size={32} color={userInfo.healthStatus === 'moderate' ? 'white' : '#4ECDC4'} />
            <ThemedText style={[
              styles.healthLevelText,
              userInfo.healthStatus === 'moderate' && styles.healthLevelTextSelected
            ]}>
              Trung bình
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.healthLevelCard,
              userInfo.healthStatus === 'weak' && styles.healthLevelCardSelected
            ]}
            onPress={() => setUserInfo(prev => ({ ...prev, healthStatus: 'weak' }))}
          >
            <Ionicons name="warning" size={32} color={userInfo.healthStatus === 'weak' ? 'white' : '#4ECDC4'} />
            <ThemedText style={[
              styles.healthLevelText,
              userInfo.healthStatus === 'weak' && styles.healthLevelTextSelected
            ]}>
              Yếu
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Mức độ chăm sóc cần thiết <ThemedText style={styles.requiredMark}>*</ThemedText></ThemedText>
        {careLevels.map((level) => (
          <TouchableOpacity
            key={level.id}
            style={[
              styles.optionCard,
              userInfo.careLevel === (level.id as number) && styles.optionCardSelected
            ]}
            onPress={() => setUserInfo(prev => ({ ...prev, careLevel: level.id as number }))}
          >
            <View style={styles.optionContent}>
              <ThemedText style={[
                styles.optionTitle,
                userInfo.careLevel === (level.id as number) && styles.optionTitleSelected
              ]}>
                {level.label}
              </ThemedText>
              <ThemedText style={[
                styles.optionDescription,
                userInfo.careLevel === (level.id as number) && styles.optionDescriptionSelected
              ]}>
                {level.description}
              </ThemedText>
            </View>
            {userInfo.careLevel === (level.id as number) && (
              <Ionicons name="checkmark-circle" size={24} color="#4ECDC4" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>Kĩ năng cần có ở người chăm sóc</ThemedText>
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Kĩ năng bắt buộc</ThemedText>
        <View style={styles.optionsGrid}>
          {requiredSkillsOptions.map((skill) => (
            <TouchableOpacity
              key={skill.id}
              style={[
                styles.specialNeedCard,
                userInfo.requiredSkills.includes(skill.id) && styles.specialNeedCardSelected
              ]}
              onPress={() => handleRequiredSkillToggle(skill.id)}
            >
              <ThemedText style={[
                styles.specialNeedText,
                userInfo.requiredSkills.includes(skill.id) && styles.specialNeedTextSelected
              ]}>
                {skill.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
        <DynamicInputList
          title="Kĩ năng bắt buộc khác"
          placeholder="Nhập kĩ năng bắt buộc"
          items={userInfo.customRequiredSkills || []}
          onItemsChange={(customRequiredSkills) => setUserInfo(prev => ({ ...prev, customRequiredSkills }))}
          maxItems={5}
        />
      </View>
      
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Kĩ năng ưu tiên</ThemedText>
        <View style={styles.optionsGrid}>
          {prioritySkillsOptions.map((skill) => (
            <TouchableOpacity
              key={skill.id}
              style={[
                styles.specialNeedCard,
                userInfo.prioritySkills.includes(skill.id) && styles.specialNeedCardSelected
              ]}
              onPress={() => handlePrioritySkillToggle(skill.id)}
            >
              <ThemedText style={[
                styles.specialNeedText,
                userInfo.prioritySkills.includes(skill.id) && styles.specialNeedTextSelected
              ]}>
                {skill.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
        <DynamicInputList
          title="Kĩ năng ưu tiên khác"
          placeholder="Nhập kĩ năng ưu tiên"
          items={userInfo.customPrioritySkills || []}
          onItemsChange={(customPrioritySkills) => setUserInfo(prev => ({ ...prev, customPrioritySkills }))}
          maxItems={5}
        />
      </View>
        </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>Thời gian làm việc</ThemedText>
      <WorkTimeSelectorFromAI
        timeSlotGroups={userInfo.timeSlotGroups}
        onTimeSlotGroupsChange={(timeSlotGroups) => setUserInfo(prev => ({ ...prev, timeSlotGroups }))}
      />

      <ThemedText style={styles.helpText}>
        Đừng lo, bạn có thể điều chỉnh thời gian này sau
      </ThemedText>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>Yêu cầu người chăm sóc</ThemedText>
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Độ tuổi người chăm sóc</ThemedText>
        <View style={styles.ageRangeContainer}>
          <View style={styles.ageInputContainer}>
            <ThemedText style={styles.ageLabel}>Từ</ThemedText>
            <TextInput
              style={styles.ageInput}
              value={userInfo.caregiverAgeRange?.min || ''}
              onChangeText={(text) => setUserInfo(prev => ({ 
                ...prev, 
                caregiverAgeRange: prev.caregiverAgeRange ? { ...prev.caregiverAgeRange, min: text } : { min: text, max: '' }
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
              value={userInfo.caregiverAgeRange?.max || ''}
              onChangeText={(text) => setUserInfo(prev => ({ 
                ...prev, 
                caregiverAgeRange: prev.caregiverAgeRange ? { ...prev.caregiverAgeRange, max: text } : { min: '', max: text }
              }))}
              placeholder="Ví dụ: 50"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>
        </View>
      </View>
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Giới tính ưu tiên</ThemedText>
        <View style={styles.genderOptions}>
          {genderOptions.map((gender) => (
            <TouchableOpacity
              key={gender.id || 'any'}
              style={[
                styles.genderCard,
                userInfo.genderPreference === gender.id && styles.genderCardSelected
              ]}
              onPress={() => setUserInfo(prev => ({ ...prev, genderPreference: gender.id }))}
            >
              <ThemedText style={[
                styles.genderText,
                userInfo.genderPreference === gender.id && styles.genderTextSelected
              ]}>
                {gender.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Kinh nghiệm</ThemedText>
        {experienceLevels.map((exp) => (
          <TouchableOpacity
            key={exp.id || 'none'}
            style={[
              styles.optionCard,
              userInfo.requiredYearsExperience === exp.id && styles.optionCardSelected
            ]}
            onPress={() => setUserInfo(prev => ({ ...prev, requiredYearsExperience: exp.id }))}
          >
            <ThemedText style={[
              styles.optionTitle,
              userInfo.requiredYearsExperience === exp.id && styles.optionTitleSelected
            ]}>
              {exp.label}
            </ThemedText>
            {userInfo.requiredYearsExperience === exp.id && (
              <Ionicons name="checkmark-circle" size={24} color="#4ECDC4" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputGroup}>
        <DynamicInputList
          title="Tính cách"
          placeholder="Nhập tính cách"
          items={userInfo.personality}
          onItemsChange={(personality) => setUserInfo(prev => ({ ...prev, personality }))}
          maxItems={10}
        />
      </View>

      <View style={styles.inputGroup}>
        <DynamicInputList
          title="Thái độ"
          placeholder="Nhập thái độ"
          items={userInfo.attitude}
          onItemsChange={(attitude) => setUserInfo(prev => ({ ...prev, attitude }))}
          maxItems={10}
        />
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Đánh giá</ThemedText>
        {ratingRangeOptions.map((rating) => (
          <TouchableOpacity
            key={rating.id || 'none'}
            style={[
              styles.optionCard,
              ((!userInfo.overallRatingRange && !rating.id) || 
               (userInfo.overallRatingRange && rating.id && 
                userInfo.overallRatingRange.min === rating.min && 
                userInfo.overallRatingRange.max === rating.max)) && styles.optionCardSelected
            ]}
            onPress={() => setUserInfo(prev => ({ 
              ...prev, 
              overallRatingRange: rating.id ? { min: rating.min, max: rating.max } : null 
            }))}
          >
            <ThemedText style={[
              styles.optionTitle,
              ((!userInfo.overallRatingRange && !rating.id) || 
               (userInfo.overallRatingRange && rating.id && 
                userInfo.overallRatingRange.min === rating.min && 
                userInfo.overallRatingRange.max === rating.max)) && styles.optionTitleSelected
            ]}>
              {rating.label}
            </ThemedText>
            {((!userInfo.overallRatingRange && !rating.id) || 
              (userInfo.overallRatingRange && rating.id && 
               userInfo.overallRatingRange.min === rating.min && 
               userInfo.overallRatingRange.max === rating.max)) && (
              <Ionicons name="checkmark-circle" size={24} color="#4ECDC4" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>Vị trí làm việc</ThemedText>
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Vị trí làm việc</ThemedText>
        <View style={styles.locationCard}>
          <Ionicons name="location" size={24} color="#4ECDC4" />
          <ThemedText style={styles.locationText}>
            Quận 7, TP.HCM (Tọa độ: 10.7350, 106.7200)
          </ThemedText>
        </View>
        <ThemedText style={styles.locationNote}>
          Vị trí đã được cố định cho mục đích demo
        </ThemedText>
      </View>
    </View>
  );

  const renderStep6 = () => {
    // Price reference for Quận 7, TP.HCM
    const priceRef = { min: 100, max: 200, area: 'Quận 7, TP.HCM' };
    const selectedBudget = parseInt(userInfo.budgetPerHour) || 0;
    const showWarning = selectedBudget > 0 && selectedBudget < (priceRef.min * 1000);

    return (
      <View style={styles.stepContent}>
        <ThemedText style={styles.stepTitle}>Mức lương theo giờ</ThemedText>
        <View style={styles.inputGroup}>
          <ThemedText style={styles.inputLabel}>Mức giá tham khảo tại {priceRef.area}</ThemedText>
          <View style={styles.priceReferenceCard}>
            <Ionicons name="information-circle" size={20} color="#4ECDC4" />
            <ThemedText style={styles.priceReferenceText}>
              {formatCurrency(priceRef.min * 1000, false)} - {formatCurrency(priceRef.max * 1000, false)}/giờ
            </ThemedText>
          </View>
        </View>
        {showWarning && (
          <View style={styles.warningCard}>
            <Ionicons name="warning" size={20} color="#ff6b6b" />
            <ThemedText style={styles.warningText}>
              Bạn đang chọn mức ngân sách ít hơn mức giá tham khảo, nếu bạn vẫn tiếp tục thì có thể ảnh hưởng tới quá trình tự động tìm người chăm sóc của chúng tôi
            </ThemedText>
          </View>
        )}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.inputLabel}>Bạn có thể trả bao nhiêu tiền/giờ? <ThemedText style={styles.requiredMark}>*</ThemedText></ThemedText>
          <TextInput
            style={styles.budgetInput}
            value={userInfo.budgetPerHour}
            onChangeText={(text) => {
              // Chỉ cho phép nhập số
              const numericText = text.replace(/[^0-9]/g, '');
              setUserInfo(prev => ({ ...prev, budgetPerHour: numericText }));
            }}
            placeholder="Nhập số tiền (VND)/giờ"
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
          {/* Hiển thị số tiền bằng tiếng Việt */}
          {userInfo.budgetPerHour && parseInt(userInfo.budgetPerHour) > 0 && (
            <View style={styles.currencyDisplay}>
              <Ionicons name="cash-outline" size={16} color="#4ECDC4" />
              <ThemedText style={styles.currencyText}>
                {formatCurrency(parseInt(userInfo.budgetPerHour))}/giờ
              </ThemedText>
            </View>
              )}
        </View>
      </View>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      default: return renderStep1();
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
              Bước {currentStep}/{totalSteps}
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
                { width: `${(currentStep / totalSteps) * 100}%` }
              ]} 
            />
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderCurrentStep()}
        </ScrollView>

        {/* Navigation */}
        <View style={styles.navigation}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.previousButton} onPress={handlePrevious}>
              <Ionicons name="chevron-back" size={20} color="#4ECDC4" />
              <ThemedText style={styles.previousButtonText}>Trước</ThemedText>
            </TouchableOpacity>
          )}
          <View style={styles.navigationSpacer} />
          <TouchableOpacity 
            style={[styles.nextButton, isLoading && styles.nextButtonDisabled]} 
            onPress={handleNext}
            disabled={isLoading}
          >
            <ThemedText style={styles.nextButtonText}>
              {currentStep === totalSteps ? 'Gợi ý từ AI' : 'Tiếp theo'}
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
});