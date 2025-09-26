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

interface Participant {
  id: string;
  name: string;
  email: string;
  type: 'family' | 'external';
  avatar?: string;
}

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: string;
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
    participants: [] as Participant[],
  });

  // Modal states
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
  const [showFamilyMembersModal, setShowFamilyMembersModal] = useState(false);
  const [showExternalParticipantModal, setShowExternalParticipantModal] = useState(false);
  const [externalEmail, setExternalEmail] = useState('');
  const [foundExternalUser, setFoundExternalUser] = useState<any>(null);
  const [familySearchQuery, setFamilySearchQuery] = useState('');

  // Mock family members data
  const familyMembers: FamilyMember[] = [
    {
      id: '1',
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@email.com',
      role: 'Con trai',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    },
    {
      id: '2',
      name: 'Nguyễn Thị B',
      email: 'nguyenthib@email.com',
      role: 'Con gái',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    },
    {
      id: '3',
      name: 'Nguyễn Văn C',
      email: 'nguyenvanc@email.com',
      role: 'Cháu trai',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
    },
  ];

  // Filtered family members based on search
  const filteredFamilyMembers = familyMembers.filter(member =>
    member.name.toLowerCase().includes(familySearchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(familySearchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(familySearchQuery.toLowerCase())
  );

  const handleClose = () => {
    setSelectedProfiles([]);
    setBookingType(null);
    setCurrentStep(1);
    setIsSubmitting(false);
    setShowValidation(false);
    setShowCalendar(false);
    setShowTimePicker(false);
    setShowAddParticipantModal(false);
    setShowFamilyMembersModal(false);
    setShowExternalParticipantModal(false);
    setExternalEmail('');
    setFoundExternalUser(null);
    setFamilySearchQuery('');
    setScheduleData(prev => ({ ...prev, participants: [] }));
    onClose();
  };

  const handleAddParticipant = (type: 'family' | 'external') => {
    if (type === 'family') {
      setShowFamilyMembersModal(true);
    } else {
      setShowExternalParticipantModal(true);
    }
    setShowAddParticipantModal(false);
  };

  const handleAddFamilyMember = (member: FamilyMember) => {
    const participant: Participant = {
      id: member.id,
      name: member.name,
      email: member.email,
      type: 'family',
      avatar: member.avatar,
    };
    setScheduleData(prev => ({
      ...prev,
      participants: [...prev.participants, participant]
    }));
    setShowFamilyMembersModal(false);
  };

  const handleRemoveParticipant = (participantId: string) => {
    setScheduleData(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.id !== participantId)
    }));
  };

  const handleSearchExternalUser = () => {
    if (!externalEmail.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }

    // Mock search - simulate API call
    const mockUser = {
      id: 'external_' + Date.now(),
      name: 'Người dùng ngoài',
      email: externalEmail,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    };
    setFoundExternalUser(mockUser);
  };

  const handleAddExternalUser = () => {
    if (!foundExternalUser) return;

    const participant: Participant = {
      id: foundExternalUser.id,
      name: foundExternalUser.name,
      email: foundExternalUser.email,
      type: 'external',
      avatar: foundExternalUser.avatar,
    };
    setScheduleData(prev => ({
      ...prev,
      participants: [...prev.participants, participant]
    }));
    setShowExternalParticipantModal(false);
    setExternalEmail('');
    setFoundExternalUser(null);
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
            <View style={styles.labelContainer}>
              <ThemedText style={styles.inputLabel}>Thành viên tham gia</ThemedText>
            </View>
            
            {/* Participants List */}
            {scheduleData.participants.length > 0 && (
              <View style={styles.participantsList}>
                {scheduleData.participants.map((participant) => (
                  <View key={participant.id} style={styles.participantItem}>
                    <View style={styles.participantInfo}>
                      <View style={styles.participantAvatar}>
                        <ThemedText style={styles.participantAvatarText}>
                          {participant.name ? participant.name.split(' ').pop()?.charAt(0) : '?'}
                        </ThemedText>
                      </View>
                      <View style={styles.participantDetails}>
                        <ThemedText style={styles.participantName}>{participant.name}</ThemedText>
                        <ThemedText style={styles.participantEmail}>{participant.email}</ThemedText>
                        <ThemedText style={styles.participantType}>
                          {participant.type === 'family' ? 'Thành viên gia đình' : 'Người ngoài'}
                        </ThemedText>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.removeParticipantButton}
                      onPress={() => handleRemoveParticipant(participant.id)}
                    >
                      <Ionicons name="close-circle" size={20} color="#ff4757" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Add Participant Button */}
            <TouchableOpacity
              style={styles.addParticipantButton}
              onPress={() => setShowAddParticipantModal(true)}
            >
              <Ionicons name="add-circle-outline" size={20} color="#4ECDC4" />
              <ThemedText style={styles.addParticipantText}>Thêm thành viên</ThemedText>
            </TouchableOpacity>
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

        {/* Add Participant Options Modal */}
        <Modal
          visible={showAddParticipantModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAddParticipantModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.addParticipantModal}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleContainer}>
                  <Ionicons name="people" size={24} color="#4ECDC4" />
                  <ThemedText style={styles.modalTitle}>Thêm thành viên tham gia</ThemedText>
                </View>
                <TouchableOpacity onPress={() => setShowAddParticipantModal(false)}>
                  <Ionicons name="close" size={24} color="#6c757d" />
                </TouchableOpacity>
              </View>

              <ThemedText style={styles.modalSubtitle}>
                Chọn cách thêm thành viên vào cuộc họp
              </ThemedText>

              <View style={styles.participantOptions}>
                <TouchableOpacity
                  style={styles.participantOption}
                  onPress={() => handleAddParticipant('family')}
                >
                  <View style={styles.participantOptionIcon}>
                    <Ionicons name="people" size={28} color="#4ECDC4" />
                  </View>
                  <View style={styles.participantOptionText}>
                    <ThemedText style={styles.participantOptionTitle}>Thành viên gia đình</ThemedText>
                    <ThemedText style={styles.participantOptionSubtitle}>
                      Chọn từ các thành viên trong gia đình
                    </ThemedText>
                  </View>
                  <View style={styles.participantOptionArrow}>
                    <Ionicons name="chevron-forward" size={20} color="#4ECDC4" />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.participantOption}
                  onPress={() => handleAddParticipant('external')}
                >
                  <View style={styles.participantOptionIcon}>
                    <Ionicons name="person-add" size={28} color="#4ECDC4" />
                  </View>
                  <View style={styles.participantOptionText}>
                    <ThemedText style={styles.participantOptionTitle}>Người ngoài</ThemedText>
                    <ThemedText style={styles.participantOptionSubtitle}>
                      Thêm người không thuộc gia đình
                    </ThemedText>
                  </View>
                  <View style={styles.participantOptionArrow}>
                    <Ionicons name="chevron-forward" size={20} color="#4ECDC4" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Family Members Modal */}
        <Modal
          visible={showFamilyMembersModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowFamilyMembersModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.familyMembersModal}>
              <View style={styles.modalHeader}>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => {
                    setShowFamilyMembersModal(false);
                    setShowAddParticipantModal(true);
                    setFamilySearchQuery('');
                  }}
                >
                  <Ionicons name="arrow-back" size={24} color="#4ECDC4" />
                </TouchableOpacity>
                <ThemedText style={styles.modalTitle}>Thành viên gia đình</ThemedText>
                <TouchableOpacity onPress={() => setShowFamilyMembersModal(false)}>
                  <Ionicons name="close" size={24} color="#6c757d" />
                </TouchableOpacity>
              </View>

              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                  <Ionicons name="search" size={20} color="#6c757d" style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm thành viên..."
                    value={familySearchQuery}
                    onChangeText={setFamilySearchQuery}
                    placeholderTextColor="#999"
                  />
                  {familySearchQuery.length > 0 && (
                    <TouchableOpacity
                      style={styles.clearSearchButton}
                      onPress={() => setFamilySearchQuery('')}
                    >
                      <Ionicons name="close-circle" size={20} color="#6c757d" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <ScrollView style={styles.familyMembersList} showsVerticalScrollIndicator={false}>
                {filteredFamilyMembers.length > 0 ? (
                  filteredFamilyMembers.map((member) => (
                    <TouchableOpacity
                      key={member.id}
                      style={styles.familyMemberItem}
                      onPress={() => handleAddFamilyMember(member)}
                    >
                      <View style={styles.familyMemberAvatar}>
                        <ThemedText style={styles.familyMemberAvatarText}>
                          {member.name ? member.name.split(' ').pop()?.charAt(0) : '?'}
                        </ThemedText>
                      </View>
                      <View style={styles.familyMemberDetails}>
                        <ThemedText style={styles.familyMemberName}>{member.name}</ThemedText>
                        <ThemedText style={styles.familyMemberRole}>{member.role}</ThemedText>
                        <ThemedText style={styles.familyMemberEmail}>{member.email}</ThemedText>
                      </View>
                      <View style={styles.addButtonContainer}>
                        <Ionicons name="add-circle" size={28} color="#4ECDC4" />
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="people-outline" size={48} color="#6c757d" />
                    <ThemedText style={styles.emptyStateTitle}>Không tìm thấy thành viên</ThemedText>
                    <ThemedText style={styles.emptyStateSubtitle}>
                      Thử tìm kiếm với từ khóa khác
                    </ThemedText>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* External Participant Modal */}
        <Modal
          visible={showExternalParticipantModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowExternalParticipantModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.externalParticipantModal}>
              <View style={styles.modalHeader}>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => {
                    setShowExternalParticipantModal(false);
                    setShowAddParticipantModal(true);
                    setExternalEmail('');
                    setFoundExternalUser(null);
                  }}
                >
                  <Ionicons name="arrow-back" size={24} color="#4ECDC4" />
                </TouchableOpacity>
                <ThemedText style={styles.modalTitle}>Thêm người ngoài</ThemedText>
                <TouchableOpacity onPress={() => setShowExternalParticipantModal(false)}>
                  <Ionicons name="close" size={24} color="#6c757d" />
                </TouchableOpacity>
              </View>

              <View style={styles.externalParticipantContent}>
                {/* Search Section */}
                <View style={styles.searchSection}>
                  <ThemedText style={styles.sectionTitle}>Tìm kiếm người dùng</ThemedText>
                  <View style={styles.searchInputContainer}>
                    <Ionicons name="mail" size={20} color="#6c757d" style={styles.searchIcon} />
                    <TextInput
                      style={styles.searchInput}
                      value={externalEmail}
                      onChangeText={setExternalEmail}
                      placeholder="Nhập email người tham gia..."
                      keyboardType="email-address"
                      placeholderTextColor="#999"
                    />
                    {externalEmail.length > 0 && (
                      <TouchableOpacity
                        style={styles.clearSearchButton}
                        onPress={() => {
                          setExternalEmail('');
                          setFoundExternalUser(null);
                        }}
                      >
                        <Ionicons name="close-circle" size={20} color="#6c757d" />
                      </TouchableOpacity>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[styles.searchButton, !externalEmail.trim() && styles.disabledButton]}
                    onPress={handleSearchExternalUser}
                    disabled={!externalEmail.trim()}
                  >
                    <Ionicons name="search" size={20} color="white" />
                    <ThemedText style={styles.searchButtonText}>Tìm kiếm</ThemedText>
                  </TouchableOpacity>
                </View>

                {/* Results Section */}
                {foundExternalUser && (
                  <View style={styles.resultsSection}>
                    <ThemedText style={styles.sectionTitle}>Kết quả tìm kiếm</ThemedText>
                    <View style={styles.foundUserCard}>
                      <View style={styles.foundUserInfo}>
                        <View style={styles.foundUserAvatar}>
                          <ThemedText style={styles.foundUserAvatarText}>
                            {foundExternalUser.name ? foundExternalUser.name.split(' ').pop()?.charAt(0) : '?'}
                          </ThemedText>
                        </View>
                        <View style={styles.foundUserDetails}>
                          <ThemedText style={styles.foundUserName}>{foundExternalUser.name}</ThemedText>
                          <ThemedText style={styles.foundUserEmail}>{foundExternalUser.email}</ThemedText>
                          <ThemedText style={styles.foundUserType}>Người dùng ngoài</ThemedText>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.addFoundUserButton}
                        onPress={handleAddExternalUser}
                      >
                        <Ionicons name="add-circle" size={28} color="#4ECDC4" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Empty State */}
                {!foundExternalUser && externalEmail.length === 0 && (
                  <View style={styles.emptyState}>
                    <Ionicons name="person-add-outline" size={48} color="#6c757d" />
                    <ThemedText style={styles.emptyStateTitle}>Thêm người ngoài</ThemedText>
                    <ThemedText style={styles.emptyStateSubtitle}>
                      Nhập email để tìm kiếm và thêm người tham gia
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>
          </View>
        </Modal>
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
  // Participant styles
  participantsList: {
    marginBottom: 12,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  participantAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  participantDetails: {
    flex: 1,
  },
  participantName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  participantEmail: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  participantType: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '500',
  },
  removeParticipantButton: {
    padding: 4,
  },
  addParticipantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#4ECDC4',
    borderStyle: 'dashed',
    gap: 8,
  },
  addParticipantText: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '500',
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
  addParticipantModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 450,
    minHeight: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  participantOptions: {
    gap: 20,
    paddingHorizontal: 8,
  },
  participantOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 80,
  },
  participantOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F8F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  participantOptionText: {
    flex: 1,
  },
  participantOptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  participantOptionSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  participantOptionArrow: {
    marginLeft: 12,
    padding: 4,
  },
  // Family members modal
  familyMembersModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#2c3e50',
  },
  clearSearchButton: {
    padding: 4,
  },
  familyMembersList: {
    maxHeight: 300,
    paddingHorizontal: 20,
  },
  familyMemberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  familyMemberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  familyMemberAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  familyMemberDetails: {
    flex: 1,
  },
  familyMemberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  familyMemberRole: {
    fontSize: 14,
    color: '#4ECDC4',
    marginBottom: 2,
    fontWeight: '500',
  },
  familyMemberEmail: {
    fontSize: 12,
    color: '#6c757d',
  },
  addButtonContainer: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
  // External participant modal
  externalParticipantModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  externalParticipantContent: {
    padding: 20,
    gap: 24,
  },
  searchSection: {
    gap: 16,
  },
  resultsSection: {
    gap: 16,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#e9ecef',
    shadowOpacity: 0,
    elevation: 0,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  foundUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#4ECDC4',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  foundUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  foundUserAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  foundUserAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  foundUserDetails: {
    flex: 1,
  },
  foundUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  foundUserEmail: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  foundUserType: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '500',
  },
  addFoundUserButton: {
    padding: 8,
  },
});