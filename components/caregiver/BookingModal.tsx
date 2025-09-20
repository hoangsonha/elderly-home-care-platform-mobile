import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { ElderlyProfileSelector } from '@/components/elderly/ElderlyProfileSelector';
import { ThemedText } from '@/components/themed-text';
import { DurationSelector } from '@/components/ui/DurationSelector';
import { SimpleDatePicker } from '@/components/ui/SimpleDatePicker';
import { SimpleTimePicker } from '@/components/ui/SimpleTimePicker';
import { Task, TaskSelector } from '@/components/ui/TaskSelector';
import { WorkTimeSelectorFromAI } from '@/components/ui/WorkTimeSelectorFromAI';

interface Caregiver {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  experience: string;
  specialties: string[];
  hourlyRate: number;
  distance: string;
  isVerified: boolean;
  totalReviews: number;
}

interface ElderlyProfile {
  id: string;
  name: string;
  age: number;
  currentCaregivers: number;
  family: string;
  healthStatus: 'good' | 'fair' | 'poor';
  avatar?: string;
}

interface BookingModalProps {
  visible: boolean;
  onClose: () => void;
  caregiver: Caregiver;
  elderlyProfiles: ElderlyProfile[];
}

type BookingType = 'immediate' | 'schedule';

export function BookingModal({ visible, onClose, caregiver, elderlyProfiles }: BookingModalProps) {
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [bookingType, setBookingType] = useState<BookingType | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Immediate hire form data
  const [immediateData, setImmediateData] = useState({
    workLocation: '',
    salary: '',
    workingDays: [] as string[],
    workingTimeSlots: [] as string[],
    specificTimeRanges: [] as { start: string; end: string }[],
    tasks: [] as Task[],
    durationType: '',
    durationValue: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
  });

  // Schedule meeting data
  const [scheduleData, setScheduleData] = useState({
    selectedDate: '',
    startTime: '',
    duration: '',
    notes: '',
  });

  // Modal states
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleClose = () => {
    setSelectedProfiles([]);
    setBookingType(null);
    setCurrentStep(1);
    setIsSubmitting(false);
    setShowValidation(false);
    setShowCalendar(false);
    setShowTimePicker(false);
    onClose();
  };

  const [showValidation, setShowValidation] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    workTime: false,
    tasks: false,
    duration: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Helper functions
  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    if (!startTime || !durationMinutes) return '';
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    return `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
  };

  const handleDateSelect = (date: string) => {
    setScheduleData(prev => ({ ...prev, selectedDate: date }));
  };

  const handleTimeSelect = (time: string) => {
    setScheduleData(prev => ({ ...prev, startTime: time }));
  };

  const handleDurationChange = (duration: string) => {
    // Only allow numbers
    const numericValue = duration.replace(/[^0-9]/g, '');
    
    if (numericValue === '') {
      setScheduleData(prev => ({ ...prev, duration: '' }));
      return;
    }
    
    const durationNum = parseInt(numericValue);
    if (durationNum > 360) { // Max 6 hours = 360 minutes
      Alert.alert('Lỗi', 'Thời lượng tối đa là 6 tiếng (360 phút)');
      return;
    }
    
    setScheduleData(prev => ({ ...prev, duration: numericValue }));
  };

  // Format salary display
  const formatSalary = (salary: string) => {
    if (!salary) return '';
    const num = parseInt(salary);
    return num.toLocaleString('vi-VN') + ' VNĐ/giờ';
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!selectedProfiles || selectedProfiles.length === 0) {
        setShowValidation(true);
        return;
      }
      setShowValidation(false);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!bookingType) {
        Alert.alert('Thiếu thông tin', 'Vui lòng chọn loại đặt lịch');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (bookingType === 'schedule') {
        if (!scheduleData.selectedDate || !scheduleData.startTime || !scheduleData.duration) {
          Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ thông tin đặt lịch hẹn');
          return;
        }
      } else if (bookingType === 'immediate') {
        if (!immediateData.workLocation || !immediateData.salary || 
            (!immediateData.workingDays || immediateData.workingDays.length === 0) ||
            ((!immediateData.workingTimeSlots || immediateData.workingTimeSlots.length === 0) && 
             (!immediateData.specificTimeRanges || immediateData.specificTimeRanges.length === 0)) ||
            !immediateData.durationType || !immediateData.durationValue) {
          Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ thông tin thuê ngay lập tức');
          return;
        }
      }
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      if (bookingType === 'immediate') {
        Alert.alert('Thành công', 'Đã gửi yêu cầu thuê ngay lập tức!');
      } else {
        Alert.alert('Thành công', `Đang gửi đi và chờ ${caregiver.name} chấp nhận`);
      }
      handleClose();
    }, 2000);
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <ElderlyProfileSelector
        profiles={elderlyProfiles}
        selectedProfiles={selectedProfiles}
        onSelectionChange={setSelectedProfiles}
        showValidation={showValidation}
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <View style={styles.titleContainer}>
        <ThemedText style={styles.stepTitle}>Chọn loại đặt lịch</ThemedText>
        <ThemedText style={styles.requiredMark}>*</ThemedText>
      </View>
      
      <TouchableOpacity
        style={[
          styles.optionCard,
          bookingType === 'immediate' && styles.optionCardSelected
        ]}
        onPress={() => setBookingType('immediate')}
      >
        <View style={styles.optionContent}>
          <Ionicons 
            name="flash" 
            size={32} 
            color={bookingType === 'immediate' ? '#4ECDC4' : '#6c757d'} 
          />
          <View style={styles.optionText}>
            <ThemedText style={[
              styles.optionTitle,
              bookingType === 'immediate' && styles.optionTitleSelected
            ]}>
              Thuê ngay lập tức
            </ThemedText>
            <ThemedText style={[
              styles.optionDescription,
              bookingType === 'immediate' && styles.optionDescriptionSelected
            ]}>
              Bắt đầu chăm sóc ngay sau khi được chấp nhận
            </ThemedText>
          </View>
        </View>
        {bookingType === 'immediate' && (
          <Ionicons name="checkmark-circle" size={24} color="#4ECDC4" />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.optionCard,
          bookingType === 'schedule' && styles.optionCardSelected
        ]}
        onPress={() => setBookingType('schedule')}
      >
        <View style={styles.optionContent}>
          <Ionicons 
            name="calendar" 
            size={32} 
            color={bookingType === 'schedule' ? '#4ECDC4' : '#6c757d'} 
          />
          <View style={styles.optionText}>
            <ThemedText style={[
              styles.optionTitle,
              bookingType === 'schedule' && styles.optionTitleSelected
            ]}>
              Đặt lịch hẹn trước
            </ThemedText>
            <ThemedText style={[
              styles.optionDescription,
              bookingType === 'schedule' && styles.optionDescriptionSelected
            ]}>
              Hẹn gặp để hiểu thêm về người này
            </ThemedText>
          </View>
        </View>
        {bookingType === 'schedule' && (
          <Ionicons name="checkmark-circle" size={24} color="#4ECDC4" />
        )}
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => {
    if (bookingType === 'immediate') {
      return (
        <View style={styles.stepContent}>
          <ThemedText style={styles.stepTitle}>Thông tin thuê ngay lập tức</ThemedText>
          
          {/* Section 1: Basic Info */}
          <View style={styles.sectionContainer}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => toggleSection('basicInfo')}
            >
              <ThemedText style={styles.sectionTitle}>📋 Thông tin cơ bản</ThemedText>
              <Ionicons 
                name={expandedSections.basicInfo ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#4ECDC4" 
              />
            </TouchableOpacity>
            
            {expandedSections.basicInfo && (
              <View style={styles.sectionContent}>
                <View style={styles.inputGroup}>
                  <View style={styles.labelContainer}>
                    <ThemedText style={styles.inputLabel}>Vị trí làm việc</ThemedText>
                    <ThemedText style={styles.requiredMark}>*</ThemedText>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    value={immediateData.workLocation}
                    onChangeText={(text) => setImmediateData(prev => ({ ...prev, workLocation: text }))}
                    placeholder="Nhập địa chỉ làm việc"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.labelContainer}>
                    <ThemedText style={styles.inputLabel}>Mức lương (VNĐ/giờ)</ThemedText>
                    <ThemedText style={styles.requiredMark}>*</ThemedText>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    value={immediateData.salary}
                    onChangeText={(text) => {
                      // Only allow numbers
                      const numericValue = text.replace(/[^0-9]/g, '');
                      setImmediateData(prev => ({ ...prev, salary: numericValue }));
                    }}
                    placeholder="Ví dụ: 150000"
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                  {immediateData.salary && (
                    <ThemedText style={styles.salaryDisplay}>
                      💰 {formatSalary(immediateData.salary)}
                    </ThemedText>
                  )}
                  <ThemedText style={styles.salaryHint}>
                    💡 Gợi ý: Hà Nội: 120,000-200,000 VNĐ/giờ | TP.HCM: 130,000-220,000 VNĐ/giờ
                  </ThemedText>
                </View>
              </View>
            )}
          </View>

          {/* Section 2: Work Time */}
          <View style={styles.sectionContainer}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => toggleSection('workTime')}
            >
              <ThemedText style={styles.sectionTitle}>⏰ Thời gian làm việc</ThemedText>
              <Ionicons 
                name={expandedSections.workTime ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#4ECDC4" 
              />
            </TouchableOpacity>
            
            {expandedSections.workTime && (
              <View style={styles.sectionContent}>
                <View style={styles.labelContainer}>
                </View>
                <WorkTimeSelectorFromAI
                  selectedDays={immediateData.workingDays || []}
                  selectedTimeSlots={immediateData.workingTimeSlots || []}
                  specificTimeRanges={immediateData.specificTimeRanges || []}
                  onDaysChange={(days) => setImmediateData(prev => ({ ...prev, workingDays: days }))}
                  onTimeSlotsChange={(slots) => setImmediateData(prev => ({ ...prev, workingTimeSlots: slots }))}
                  onSpecificTimeRangesChange={(ranges) => setImmediateData(prev => ({ ...prev, specificTimeRanges: ranges }))}
                />
              </View>
            )}
          </View>

          {/* Section 3: Duration */}
          <View style={styles.sectionContainer}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => toggleSection('duration')}
            >
              <ThemedText style={styles.sectionTitle}>⏳ Thời gian thuê</ThemedText>
              <Ionicons 
                name={expandedSections.duration ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#4ECDC4" 
              />
            </TouchableOpacity>
            
            {expandedSections.duration && (
              <View style={styles.sectionContent}>
                <View style={styles.labelContainer}>
                  <ThemedText style={styles.inputLabel}>Chọn loại và thời gian thuê</ThemedText>
                  <ThemedText style={styles.requiredMark}>*</ThemedText>
                </View>
                <DurationSelector
                  durationType={immediateData.durationType}
                  durationValue={immediateData.durationValue}
                  startDate={immediateData.startDate}
                  endDate={immediateData.endDate}
                  startTime={immediateData.startTime}
                  endTime={immediateData.endTime}
                  onDurationTypeChange={(type) => setImmediateData(prev => ({ ...prev, durationType: type }))}
                  onDurationValueChange={(value) => setImmediateData(prev => ({ ...prev, durationValue: value }))}
                  onStartDateChange={(date) => setImmediateData(prev => ({ ...prev, startDate: date }))}
                  onEndDateChange={(date) => setImmediateData(prev => ({ ...prev, endDate: date }))}
                  onStartTimeChange={(time) => setImmediateData(prev => ({ ...prev, startTime: time }))}
                  onEndTimeChange={(time) => setImmediateData(prev => ({ ...prev, endTime: time }))}
                />
              </View>
            )}
          </View>

          {/* Section 4: Tasks */}
          <View style={styles.sectionContainer}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => toggleSection('tasks')}
            >
              <ThemedText style={styles.sectionTitle}>📝 Nhiệm vụ cho từng ngày</ThemedText>
              <Ionicons 
                name={expandedSections.tasks ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#4ECDC4" 
              />
            </TouchableOpacity>
            
            {expandedSections.tasks && (
              <View style={styles.sectionContent}>
                <View style={styles.labelContainer}>
                  <ThemedText style={styles.inputLabel}>Thêm nhiệm vụ cụ thể</ThemedText>
                  <ThemedText style={styles.requiredMark}>*</ThemedText>
                </View>
                <TaskSelector
                  tasks={immediateData.tasks || []}
                  onTasksChange={(tasks) => setImmediateData(prev => ({ ...prev, tasks }))}
                  durationType={immediateData.durationType}
                  durationValue={immediateData.durationValue}
                  startDate={immediateData.startDate}
                  endDate={immediateData.endDate}
                  workingTimeSlots={immediateData.specificTimeRanges?.map(range => `${range.start}-${range.end}`) || []}
                  selectedWorkingDays={immediateData.workingDays || []}
                  onValidationError={(message) => {
                    Alert.alert('Thông báo', message);
                  }}
                />
              </View>
            )}
          </View>
        </View>
      );
    } else {
      const endTime = calculateEndTime(scheduleData.startTime, parseInt(scheduleData.duration) || 0);
      
      return (
        <View style={styles.stepContent}>
          <ThemedText style={styles.stepTitle}>Đặt lịch hẹn trước</ThemedText>
          
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <ThemedText style={styles.inputLabel}>Ngày hẹn</ThemedText>
              <ThemedText style={styles.requiredMark}>*</ThemedText>
            </View>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowCalendar(true)}
            >
              <ThemedText style={[
                styles.pickerButtonText,
                !scheduleData.selectedDate && styles.placeholderText
              ]}>
                {scheduleData.selectedDate 
                  ? new Date(scheduleData.selectedDate).toLocaleDateString('vi-VN')
                  : 'Chọn ngày hẹn'
                }
              </ThemedText>
              <Ionicons name="calendar-outline" size={20} color="#4ECDC4" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <ThemedText style={styles.inputLabel}>Giờ bắt đầu</ThemedText>
              <ThemedText style={styles.requiredMark}>*</ThemedText>
            </View>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowTimePicker(true)}
            >
              <ThemedText style={[
                styles.pickerButtonText,
                !scheduleData.startTime && styles.placeholderText
              ]}>
                {scheduleData.startTime || 'Chọn giờ bắt đầu'}
              </ThemedText>
              <Ionicons name="time-outline" size={20} color="#4ECDC4" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <ThemedText style={styles.inputLabel}>Thời lượng (phút)</ThemedText>
              <ThemedText style={styles.requiredMark}>*</ThemedText>
            </View>
            <TextInput
              style={styles.textInput}
              value={scheduleData.duration}
              onChangeText={handleDurationChange}
              placeholder="Nhập số phút (tối đa 360 phút)"
              keyboardType="numeric"
              placeholderTextColor="#999"
              maxLength={3}
            />
            {scheduleData.startTime && scheduleData.duration && endTime && (
              <ThemedText style={styles.timeRangeText}>
                Khung thời gian: {scheduleData.startTime} - {endTime}
              </ThemedText>
            )}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Ghi chú thêm</ThemedText>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={scheduleData.notes}
              onChangeText={(text) => setScheduleData(prev => ({ ...prev, notes: text }))}
              placeholder="Mô tả thêm về cuộc hẹn..."
              multiline
              numberOfLines={3}
              placeholderTextColor="#999"
            />
          </View>
        </View>
      );
    }
  };


  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      default: return renderStep1();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <ThemedText style={styles.headerTitle}>Đặt lịch với {caregiver.name}</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Bước {currentStep}/3
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
                { width: `${(currentStep / 3) * 100}%` }
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
            <TouchableOpacity style={styles.previousButton} onPress={() => setCurrentStep(prev => prev - 1)}>
              <Ionicons name="chevron-back" size={20} color="#4ECDC4" />
              <ThemedText style={styles.previousButtonText}>Trước</ThemedText>
            </TouchableOpacity>
          )}
          
          <View style={styles.navigationSpacer} />
          
          <TouchableOpacity 
            style={styles.nextButton} 
            onPress={currentStep === 3 ? handleSubmit : handleNext}
            disabled={isSubmitting}
          >
            <ThemedText style={styles.nextButtonText}>
              {isSubmitting ? 'Đang xử lý...' : currentStep === 3 ? 'Xác nhận' : 'Tiếp theo'}
            </ThemedText>
            {!isSubmitting && (
              <Ionicons name="chevron-forward" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>

        {/* Simple Date Picker Modal */}
        <SimpleDatePicker
          visible={showCalendar}
          onClose={() => setShowCalendar(false)}
          onDateSelect={handleDateSelect}
          selectedDate={scheduleData.selectedDate}
        />

        {/* Simple Time Picker Modal */}
        <SimpleTimePicker
          visible={showTimePicker}
          onClose={() => setShowTimePicker(false)}
          onTimeSelect={handleTimeSelect}
          selectedTime={scheduleData.startTime}
        />
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ECDC4',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 0,
    textAlign: 'left',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionContent: {
    padding: 20,
  },
  requiredMark: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc3545',
    marginLeft: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    marginLeft: 16,
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
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pickerButton: {
    height: 48,
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  placeholderText: {
    color: '#999',
  },
  timeRangeText: {
    fontSize: 14,
    color: '#4ECDC4',
    marginTop: 8,
    fontWeight: '500',
  },
  salaryDisplay: {
    fontSize: 14,
    color: '#4ECDC4',
    marginTop: 6,
    fontWeight: '600',
  },
  salaryHint: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 6,
    fontStyle: 'italic',
    lineHeight: 16,
  },
});