import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DynamicInputList } from '@/components/ui/DynamicInputList';
import { TimeRangePicker } from '@/components/ui/TimeRangePicker';

interface AIMatchingModalProps {
  visible: boolean;
  onClose: () => void;
  onGetRecommendations: (userInfo: UserInfo) => void;
}

interface TimeRange {
  start: string;
  end: string;
}

interface UserInfo {
  address: string;
  elderlyAge: string;
  healthLevel: string;
  careLevel: string;
  specialNeeds: string[];
  customSpecialNeeds: string[];
  preferredGender: string;
  budget: string;
  workingDays: string[];
  workingTimeSlots: string[];
  specificTimeRanges: TimeRange[];
  experience: string;
  workLocation: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  ageRange: {
    min: string;
    max: string;
  };
  certifications: string[];
  skills: string[];
  personality: string[];
  attitude: string[];
  rating: string;
}

const careLevels = [
  { id: 'basic', label: 'Cơ bản', description: 'Hỗ trợ sinh hoạt hàng ngày' },
  { id: 'intermediate', label: 'Trung bình', description: 'Chăm sóc y tế cơ bản' },
  { id: 'advanced', label: 'Nâng cao', description: 'Chăm sóc y tế chuyên sâu' },
  { id: 'specialized', label: 'Chuyên biệt', description: 'Chăm sóc đặc biệt, phục hồi chức năng' },
];

const specialNeedsOptions = [
  { id: 'mobility', label: 'Hỗ trợ di chuyển' },
  { id: 'medication', label: 'Quản lý thuốc' },
  { id: 'dementia', label: 'Chăm sóc người mất trí nhớ' },
  { id: 'diabetes', label: 'Chăm sóc tiểu đường' },
  { id: 'hypertension', label: 'Chăm sóc huyết áp cao' },
  { id: 'physical_therapy', label: 'Vật lý trị liệu' },
  { id: 'companionship', label: 'Đồng hành, trò chuyện' },
  { id: 'cooking', label: 'Nấu ăn theo chế độ đặc biệt' },
];

const genderOptions = [
  { id: 'any', label: 'Không' },
  { id: 'female', label: 'Nữ' },
  { id: 'male', label: 'Nam' },
];

const budgetRanges = [
  { id: 'low', label: 'Dưới 100k/giờ' },
  { id: 'medium', label: '100k - 200k/giờ' },
  { id: 'high', label: '200k - 300k/giờ' },
  { id: 'premium', label: 'Trên 300k/giờ' },
];

const experienceLevels = [
  { id: '1-2', label: '1-2 năm' },
  { id: '3-5', label: '3-5 năm' },
  { id: '5+', label: 'Trên 5 năm' },
  { id: 'expert', label: 'Chuyên gia (10+ năm)' },
];

const weekDays = [
  { id: 'sun', label: 'CN' },
  { id: 'mon', label: 'T2' },
  { id: 'tue', label: 'T3' },
  { id: 'wed', label: 'T4' },
  { id: 'thu', label: 'T5' },
  { id: 'fri', label: 'T6' },
  { id: 'sat', label: 'T7' },
];

const timeSlots = [
  { id: 'morning', label: 'Sáng' },
  { id: 'afternoon', label: 'Chiều' },
  { id: 'evening', label: 'Tối' },
  { id: 'overnight', label: 'Đêm' },
  { id: 'custom', label: 'Khác' },
];

const certificationOptions = [
  { id: 'nursing', label: 'Điều dưỡng' },
  { id: 'medical', label: 'Y tế cơ bản' },
  { id: 'elderly_care', label: 'Chăm sóc người cao tuổi' },
  { id: 'physical_therapy', label: 'Vật lý trị liệu' },
  { id: 'first_aid', label: 'Sơ cấp cứu' },
  { id: 'dementia_care', label: 'Chăm sóc người mất trí nhớ' },
  { id: 'diabetes_care', label: 'Chăm sóc bệnh nhân tiểu đường' },
  { id: 'hypertension_care', label: 'Chăm sóc bệnh nhân huyết áp cao' },
];

const ratingOptions = [
  { id: '4.5+', label: '4.5+ sao' },
  { id: '4.0+', label: '4.0+ sao' },
  { id: '3.5+', label: '3.5+ sao' },
  { id: '3.0+', label: '3.0+ sao' },
  { id: 'any', label: 'Bất kỳ' },
];

export function AIMatchingModal({ visible, onClose, onGetRecommendations }: AIMatchingModalProps) {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    address: '',
    elderlyAge: '',
    healthLevel: 'fair',
    careLevel: 'intermediate',
    specialNeeds: [],
    customSpecialNeeds: [],
    preferredGender: 'any',
    budget: '',
    workingDays: [],
    workingTimeSlots: [],
    specificTimeRanges: [],
    experience: '',
    workLocation: {
      address: '',
      coordinates: {
        latitude: 0,
        longitude: 0,
      },
    },
    ageRange: { min: '18', max: '65' },
    certifications: [],
    skills: [],
    personality: [],
    attitude: [],
    rating: '',
  });

  const [showCustomTimePicker, setShowCustomTimePicker] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  const handleSpecialNeedToggle = (needId: string) => {
    setUserInfo(prev => ({
      ...prev,
      specialNeeds: prev.specialNeeds.includes(needId)
        ? prev.specialNeeds.filter(id => id !== needId)
        : [...prev.specialNeeds, needId]
    }));
  };

  const handleDayToggle = (dayId: string) => {
    setUserInfo(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(dayId)
        ? prev.workingDays.filter(id => id !== dayId)
        : [...prev.workingDays, dayId]
    }));
  };

  const handleTimeSlotToggle = (timeId: string) => {
    if (timeId === 'custom') {
      // Toggle custom time picker
      setShowCustomTimePicker(!showCustomTimePicker);
    } else {
      // Toggle regular time slots
      setUserInfo(prev => {
        const newWorkingTimeSlots = prev.workingTimeSlots.includes(timeId)
          ? prev.workingTimeSlots.filter(id => id !== timeId)
          : [...prev.workingTimeSlots, timeId];
        
        // Tạo specificTimeRanges từ workingTimeSlots
        const timeSlotRanges = {
          'morning': { start: '06:00', end: '12:00' },
          'afternoon': { start: '12:00', end: '18:00' },
          'evening': { start: '18:00', end: '22:00' },
          'overnight': { start: '22:00', end: '06:00' },
        };
        
        const newSpecificTimeRanges = newWorkingTimeSlots.map(slot => 
          timeSlotRanges[slot as keyof typeof timeSlotRanges]
        ).filter(Boolean);
        
        return {
          ...prev,
          workingTimeSlots: newWorkingTimeSlots,
          specificTimeRanges: newSpecificTimeRanges
        };
      });
    }
  };


  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Validate required fields
      if (!userInfo.healthLevel) {
        Alert.alert('Thiếu thông tin', 'Vui lòng chọn mức độ sức khỏe');
        return;
      }
      if (!userInfo.careLevel) {
        Alert.alert('Thiếu thông tin', 'Vui lòng chọn mức độ chăm sóc cần thiết');
        return;
      }
      if (userInfo.workingDays.length === 0 || (userInfo.workingTimeSlots.length === 0 && userInfo.specificTimeRanges.length === 0)) {
        Alert.alert('Thiếu thông tin', 'Vui lòng chọn ít nhất một ngày và một khung thời gian làm việc');
        return;
      }
      if (!userInfo.budget) {
        Alert.alert('Thiếu thông tin', 'Vui lòng chọn ngân sách dự kiến');
        return;
      }
      onGetRecommendations(userInfo);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>Thông tin cơ bản</ThemedText>
      
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Mức độ sức khỏe <ThemedText style={styles.requiredMark}>*</ThemedText></ThemedText>
        <View style={styles.healthLevelContainer}>
          <TouchableOpacity
            style={[
              styles.healthLevelCard,
              userInfo.healthLevel === 'good' && styles.healthLevelCardSelected
            ]}
            onPress={() => setUserInfo(prev => ({ ...prev, healthLevel: 'good' }))}
          >
            <Ionicons name="happy" size={32} color={userInfo.healthLevel === 'good' ? 'white' : '#4ECDC4'} />
            <ThemedText style={[
              styles.healthLevelText,
              userInfo.healthLevel === 'good' && styles.healthLevelTextSelected
            ]}>
              Tốt
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.healthLevelCard,
              userInfo.healthLevel === 'fair' && styles.healthLevelCardSelected
            ]}
            onPress={() => setUserInfo(prev => ({ ...prev, healthLevel: 'fair' }))}
          >
            <Ionicons name="medical" size={32} color={userInfo.healthLevel === 'fair' ? 'white' : '#4ECDC4'} />
            <ThemedText style={[
              styles.healthLevelText,
              userInfo.healthLevel === 'fair' && styles.healthLevelTextSelected
            ]}>
              Trung bình
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.healthLevelCard,
              userInfo.healthLevel === 'poor' && styles.healthLevelCardSelected
            ]}
            onPress={() => setUserInfo(prev => ({ ...prev, healthLevel: 'poor' }))}
          >
            <Ionicons name="warning" size={32} color={userInfo.healthLevel === 'poor' ? 'white' : '#4ECDC4'} />
            <ThemedText style={[
              styles.healthLevelText,
              userInfo.healthLevel === 'poor' && styles.healthLevelTextSelected
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
              userInfo.careLevel === level.id && styles.optionCardSelected
            ]}
            onPress={() => setUserInfo(prev => ({ ...prev, careLevel: level.id }))}
          >
            <View style={styles.optionContent}>
              <ThemedText style={[
                styles.optionTitle,
                userInfo.careLevel === level.id && styles.optionTitleSelected
              ]}>
                {level.label}
              </ThemedText>
              <ThemedText style={[
                styles.optionDescription,
                userInfo.careLevel === level.id && styles.optionDescriptionSelected
              ]}>
                {level.description}
              </ThemedText>
            </View>
            {userInfo.careLevel === level.id && (
              <Ionicons name="checkmark-circle" size={24} color="#4ECDC4" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>Nhu cầu đặc biệt</ThemedText>
      
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Chọn các nhu cầu phù hợp (có thể chọn nhiều)</ThemedText>
        <View style={styles.optionsGrid}>
          {specialNeedsOptions.map((need) => (
            <TouchableOpacity
              key={need.id}
              style={[
                styles.specialNeedCard,
                userInfo.specialNeeds.includes(need.id) && styles.specialNeedCardSelected
              ]}
              onPress={() => handleSpecialNeedToggle(need.id)}
            >
              <ThemedText style={[
                styles.specialNeedText,
                userInfo.specialNeeds.includes(need.id) && styles.specialNeedTextSelected
              ]}>
                {need.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <DynamicInputList
          title="Nhu cầu đặc biệt khác"
          placeholder="Nhập nhu cầu đặc biệt"
          items={userInfo.customSpecialNeeds || []}
          onItemsChange={(customSpecialNeeds) => setUserInfo(prev => ({ ...prev, customSpecialNeeds }))}
          maxItems={10}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>Thời gian làm việc</ThemedText>
      
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Chọn ngày cần chăm sóc <ThemedText style={styles.requiredMark}>*</ThemedText></ThemedText>
        <View style={styles.daysContainer}>
          {weekDays.map((day) => (
            <TouchableOpacity
              key={day.id}
              style={[
                styles.dayButton,
                userInfo.workingDays.includes(day.id) && styles.dayButtonSelected
              ]}
              onPress={() => handleDayToggle(day.id)}
            >
              <ThemedText style={[
                styles.dayButtonText,
                userInfo.workingDays.includes(day.id) && styles.dayButtonTextSelected
              ]}>
                {day.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Chọn khung thời gian <ThemedText style={styles.requiredMark}>*</ThemedText></ThemedText>
        <View style={styles.timeSlotsContainer}>
          {timeSlots.map((time) => (
            <TouchableOpacity
              key={time.id}
              style={[
                styles.timeSlotButton,
                (time.id === 'custom' ? showCustomTimePicker : userInfo.workingTimeSlots.includes(time.id)) && styles.timeSlotButtonSelected
              ]}
              onPress={() => handleTimeSlotToggle(time.id)}
            >
              <ThemedText style={[
                styles.timeSlotButtonText,
                (time.id === 'custom' ? showCustomTimePicker : userInfo.workingTimeSlots.includes(time.id)) && styles.timeSlotButtonTextSelected
              ]}>
                {time.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* TimeRangePicker chỉ hiện khi chọn nút Khác */}
      {showCustomTimePicker && (
        <TimeRangePicker
          timeRanges={userInfo.specificTimeRanges
            .filter((range, index) => {
              // Chỉ hiển thị custom ranges (không phải predefined)
              const predefinedRanges = {
                'morning': { start: '06:00', end: '12:00' },
                'afternoon': { start: '12:00', end: '18:00' },
                'evening': { start: '18:00', end: '22:00' },
                'overnight': { start: '22:00', end: '06:00' },
              };
              return !userInfo.workingTimeSlots.some(slot => {
                const predefinedRange = predefinedRanges[slot as keyof typeof predefinedRanges];
                return predefinedRange && 
                       predefinedRange.start === range.start && 
                       predefinedRange.end === range.end;
              });
            })
            .map((range, index) => ({
              id: `custom-range-${index}`,
              startTime: range.start,
              endTime: range.end,
            }))}
          onTimeRangesChange={(ranges) => {
            // Merge custom ranges với predefined ranges
            const predefinedRanges = userInfo.workingTimeSlots.map(slot => {
              const timeSlotRanges = {
                'morning': { start: '06:00', end: '12:00' },
                'afternoon': { start: '12:00', end: '18:00' },
                'evening': { start: '18:00', end: '22:00' },
                'overnight': { start: '22:00', end: '06:00' },
              };
              return timeSlotRanges[slot as keyof typeof timeSlotRanges];
            }).filter(Boolean);

            const customRanges = ranges.map(range => ({
              start: range.startTime,
              end: range.endTime,
            }));

            // Merge predefined + custom
            const allRanges = [...predefinedRanges, ...customRanges];
            setUserInfo(prev => ({ ...prev, specificTimeRanges: allRanges }));
            // KHÔNG đóng modal, giữ showCustomTimePicker = true
          }}
          maxRanges={5}
          selectedTimeSlots={userInfo.workingTimeSlots}
        />
      )}

      {/* Hiển thị khung giờ đã chọn */}
      {userInfo.specificTimeRanges.length > 0 && (
        <View style={styles.selectedRangesContainer}>
          <ThemedText style={styles.selectedRangesTitle}>Khung giờ đã chọn:</ThemedText>
          
          {userInfo.specificTimeRanges.map((range, index) => (
            <View key={`range-${index}`} style={styles.selectedRangeItem}>
              <ThemedText style={styles.selectedRangeText}>
                Khung {index + 1}: {range.start} - {range.end}
              </ThemedText>
            </View>
          ))}
        </View>
      )}

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
              value={userInfo.ageRange.min}
              onChangeText={(text) => setUserInfo(prev => ({ 
                ...prev, 
                ageRange: { ...prev.ageRange, min: text }
              }))}
              placeholder="18"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.ageInputContainer}>
            <ThemedText style={styles.ageLabel}>Đến</ThemedText>
            <TextInput
              style={styles.ageInput}
              value={userInfo.ageRange.max}
              onChangeText={(text) => setUserInfo(prev => ({ 
                ...prev, 
                ageRange: { ...prev.ageRange, max: text }
              }))}
              placeholder="65"
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
              key={gender.id}
              style={[
                styles.genderCard,
                userInfo.preferredGender === gender.id && styles.genderCardSelected
              ]}
              onPress={() => setUserInfo(prev => ({ ...prev, preferredGender: gender.id }))}
            >
              <ThemedText style={[
                styles.genderText,
                userInfo.preferredGender === gender.id && styles.genderTextSelected
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
            key={exp.id}
            style={[
              styles.optionCard,
              userInfo.experience === exp.id && styles.optionCardSelected
            ]}
            onPress={() => setUserInfo(prev => ({ ...prev, experience: exp.id }))}
          >
            <ThemedText style={[
              styles.optionTitle,
              userInfo.experience === exp.id && styles.optionTitleSelected
            ]}>
              {exp.label}
            </ThemedText>
            {userInfo.experience === exp.id && (
              <Ionicons name="checkmark-circle" size={24} color="#4ECDC4" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Chuyên môn</ThemedText>
        <View style={styles.optionsGrid}>
          {certificationOptions.map((cert) => (
            <TouchableOpacity
              key={cert.id}
              style={[
                styles.specialNeedCard,
                userInfo.certifications.includes(cert.id) && styles.specialNeedCardSelected
              ]}
              onPress={() => {
                setUserInfo(prev => ({
                  ...prev,
                  certifications: prev.certifications.includes(cert.id)
                    ? prev.certifications.filter(id => id !== cert.id)
                    : [...prev.certifications, cert.id]
                }));
              }}
            >
              <ThemedText style={[
                styles.specialNeedText,
                userInfo.certifications.includes(cert.id) && styles.specialNeedTextSelected
              ]}>
                {cert.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <DynamicInputList
          title="Kỹ năng"
          placeholder="Nhập kỹ năng"
          items={userInfo.skills}
          onItemsChange={(skills) => setUserInfo(prev => ({ ...prev, skills }))}
          maxItems={10}
        />
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
        {ratingOptions.map((rating) => (
          <TouchableOpacity
            key={rating.id}
            style={[
              styles.optionCard,
              userInfo.rating === rating.id && styles.optionCardSelected
            ]}
            onPress={() => setUserInfo(prev => ({ ...prev, rating: rating.id }))}
          >
            <ThemedText style={[
              styles.optionTitle,
              userInfo.rating === rating.id && styles.optionTitleSelected
            ]}>
              {rating.label}
            </ThemedText>
            {userInfo.rating === rating.id && (
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
        <ThemedText style={styles.inputLabel}>Vị trí làm việc của người chăm sóc</ThemedText>
        <TextInput
          style={styles.textInput}
          value={userInfo.workLocation.address}
          onChangeText={(text) => setUserInfo(prev => ({ 
            ...prev, 
            workLocation: { ...prev.workLocation, address: text }
          }))}
          placeholder="Ví dụ: 456 Lê Lợi, Quận 3, TP.HCM"
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.mapButton}>
          <Ionicons name="map" size={20} color="#4ECDC4" />
          <ThemedText style={styles.mapButtonText}>Chọn trên bản đồ</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep6 = () => {
    // Mock price reference based on location
    const getPriceReference = () => {
      if (userInfo.workLocation.address.includes('Quận 1') || userInfo.workLocation.address.includes('Quận 3')) {
        return { min: 150, max: 300, area: 'Trung tâm TP.HCM' };
      } else if (userInfo.workLocation.address.includes('Quận 7') || userInfo.workLocation.address.includes('Quận 2')) {
        return { min: 120, max: 250, area: 'Khu vực phát triển' };
      } else if (userInfo.workLocation.address.includes('TP.HCM')) {
        return { min: 100, max: 200, area: 'TP.HCM' };
      } else {
        return { min: 80, max: 150, area: 'Các tỉnh khác' };
      }
    };

    const priceRef = getPriceReference();

    return (
      <View style={styles.stepContent}>
        <ThemedText style={styles.stepTitle}>Ngân sách dự kiến</ThemedText>
        
        <View style={styles.inputGroup}>
          <ThemedText style={styles.inputLabel}>Mức giá tham khảo tại {priceRef.area}</ThemedText>
          <View style={styles.priceReferenceCard}>
            <Ionicons name="information-circle" size={20} color="#4ECDC4" />
            <ThemedText style={styles.priceReferenceText}>
              {priceRef.min}k - {priceRef.max}k/giờ
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.inputGroup}>
          <ThemedText style={styles.inputLabel}>Ngân sách dự kiến <ThemedText style={styles.requiredMark}>*</ThemedText></ThemedText>
          {budgetRanges.map((budget) => (
            <TouchableOpacity
              key={budget.id}
              style={[
                styles.optionCard,
                userInfo.budget === budget.id && styles.optionCardSelected
              ]}
              onPress={() => setUserInfo(prev => ({ ...prev, budget: budget.id }))}
            >
              <ThemedText style={[
                styles.optionTitle,
                userInfo.budget === budget.id && styles.optionTitleSelected
              ]}>
                {budget.label}
              </ThemedText>
              {userInfo.budget === budget.id && (
                <Ionicons name="checkmark-circle" size={24} color="#4ECDC4" />
              )}
            </TouchableOpacity>
          ))}
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
          
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <ThemedText style={styles.nextButtonText}>
              {currentStep === totalSteps ? 'Gợi ý từ AI' : 'Tiếp theo'}
            </ThemedText>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
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
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonSelected: {
    backgroundColor: '#495057',
    borderColor: '#495057',
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  dayButtonTextSelected: {
    color: 'white',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  timeSlotButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: 'white',
    alignItems: 'center',
    minWidth: 0,
  },
  timeSlotButtonSelected: {
    backgroundColor: '#495057',
    borderColor: '#495057',
  },
  timeSlotButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
    textAlign: 'center',
  },
  timeSlotButtonTextSelected: {
    color: 'white',
  },
  helpText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 16,
  },
  selectedTimeRangesContainer: {
    backgroundColor: '#f0fdfa',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  selectedTimeRangesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  selectedTimeRangeItem: {
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 8,
    marginBottom: 4,
  },
  selectedTimeRangeText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
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
  selectedRangesContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedRangesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  selectedRangeItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  selectedRangeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
});
