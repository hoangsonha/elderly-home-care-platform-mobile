import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { SimpleDatePicker } from '@/components/ui/SimpleDatePicker';
import { SimpleTimePicker } from '@/components/ui/SimpleTimePicker';

interface DurationSelectorProps {
  durationType: string;
  durationValue: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  onDurationTypeChange: (type: string) => void;
  onDurationValueChange: (value: string) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
}

export function DurationSelector({
  durationType,
  durationValue,
  startDate,
  endDate,
  startTime,
  endTime,
  onDurationTypeChange,
  onDurationValueChange,
  onStartDateChange,
  onEndDateChange,
  onStartTimeChange,
  onEndTimeChange,
}: DurationSelectorProps) {
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const durationTypes = [
    { id: 'short', label: 'Ngắn ngày (dưới 7 ngày)', maxDays: 10 },
    { id: 'long', label: 'Dài ngày (trên 7 ngày)', maxDays: null },
    { id: 'hourly', label: 'Theo giờ', maxHours: 8 },
    { id: 'unlimited', label: 'Không thời hạn (chưa rõ thời gian)', maxDays: null },
  ];

  const handleDurationTypeSelect = (typeId: string) => {
    onDurationTypeChange(typeId);
    // Reset values when changing type
    onDurationValueChange('');
    onStartDateChange('');
    onEndDateChange('');
    
    // Chỉ reset giờ khi chuyển từ "Theo giờ" sang loại khác
    if (durationType === 'hourly' && typeId !== 'hourly') {
      onStartTimeChange('');
      onEndTimeChange('');
    }
  };

  const handleHourlyDurationChange = (value: string) => {
    const numValue = parseInt(value);
    if (numValue > 8) {
      return; // Max 8 hours
    }
    onDurationValueChange(value);
  };

  const handleShortDurationChange = (value: string) => {
    const numValue = parseInt(value);
    if (numValue > 10) {
      return; // Max 10 days
    }
    onDurationValueChange(value);
  };


  const renderDurationInput = () => {
    switch (durationType) {
      case 'hourly':
        return (
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <ThemedText style={styles.inputLabel}>Số giờ (tối đa 24 giờ)</ThemedText>
              <ThemedText style={styles.requiredMark}>*</ThemedText>
            </View>
            <TextInput
              style={styles.textInput}
              value={durationValue}
              onChangeText={handleHourlyDurationChange}
              placeholder="Nhập số giờ (1-24)"
              keyboardType="numeric"
              maxLength={1}
              placeholderTextColor="#999"
            />
            {durationValue && (
              <ThemedText style={styles.durationDisplay}>
                ⏰ {durationValue} giờ
              </ThemedText>
            )}
          </View>
        );

      case 'short':
        return (
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <ThemedText style={styles.inputLabel}>Số ngày (tối đa 10 ngày)</ThemedText>
              <ThemedText style={styles.requiredMark}>*</ThemedText>
            </View>
            <TextInput
              style={styles.textInput}
              value={durationValue}
              onChangeText={handleShortDurationChange}
              placeholder="Nhập số ngày (1-10)"
              keyboardType="numeric"
              maxLength={2}
              placeholderTextColor="#999"
            />
            {durationValue && (
              <ThemedText style={styles.durationDisplay}>
                📅 {durationValue} ngày
              </ThemedText>
            )}
          </View>
        );

      case 'long':
        return (
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <ThemedText style={styles.inputLabel}>Số ngày</ThemedText>
              <ThemedText style={styles.requiredMark}>*</ThemedText>
            </View>
            <TextInput
              style={styles.textInput}
              value={durationValue}
              onChangeText={(text) => {
                const numericValue = text.replace(/[^0-9]/g, '');
                onDurationValueChange(numericValue);
              }}
              placeholder="Nhập số ngày"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
            {durationValue && (
              <ThemedText style={styles.durationDisplay}>
                📅 {durationValue} ngày
              </ThemedText>
            )}
          </View>
        );

      case 'unlimited':
        return (
          <View style={styles.unlimitedContainer}>
            <Ionicons name="infinite" size={24} color="#4ECDC4" />
            <ThemedText style={styles.unlimitedText}>
              Không giới hạn thời gian
            </ThemedText>
          </View>
        );

      default:
        return null;
    }
  };

  const renderDateTimeInputs = () => {
    return (
      <View style={styles.dateTimeContainer}>
        <ThemedText style={styles.dateTimeTitle}>
          {durationType === 'unlimited' ? 'Thời gian bắt đầu:' : 'Thời gian bắt đầu và kết thúc:'}
        </ThemedText>
        
        {/* Start Date - hiện cho tất cả loại thuê */}
        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <ThemedText style={styles.inputLabel}>Ngày bắt đầu</ThemedText>
            <ThemedText style={styles.requiredMark}>*</ThemedText>
          </View>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowStartDatePicker(true)}
          >
            <ThemedText style={[
              styles.pickerButtonText,
              !startDate && styles.placeholderText
            ]}>
              {startDate ? new Date(startDate).toLocaleDateString('vi-VN') : 'Chọn ngày bắt đầu'}
            </ThemedText>
            <Ionicons name="calendar-outline" size={20} color="#4ECDC4" />
          </TouchableOpacity>
        </View>

        {/* Start Time - chỉ hiện khi chọn "Theo giờ" */}
        {durationType === 'hourly' && (
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <ThemedText style={styles.inputLabel}>Giờ bắt đầu</ThemedText>
              <ThemedText style={styles.requiredMark}>*</ThemedText>
            </View>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowStartTimePicker(true)}
            >
              <ThemedText style={[
                styles.pickerButtonText,
                !startTime && styles.placeholderText
              ]}>
                {startTime || 'Chọn giờ bắt đầu'}
              </ThemedText>
              <Ionicons name="time-outline" size={20} color="#4ECDC4" />
            </TouchableOpacity>
          </View>
        )}

        {/* End Date - chỉ hiện khi KHÔNG chọn "Không thời hạn" */}
        {durationType !== 'unlimited' && (
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
            <ThemedText style={styles.inputLabel}>Ngày kết thúc</ThemedText>
            <ThemedText style={styles.requiredMark}>*</ThemedText>
          </View>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowEndDatePicker(true)}
            >
              <ThemedText style={[
                styles.pickerButtonText,
                !endDate && styles.placeholderText
              ]}>
                {endDate ? new Date(endDate).toLocaleDateString('vi-VN') : 'Chọn ngày kết thúc'}
              </ThemedText>
              <Ionicons name="calendar-outline" size={20} color="#4ECDC4" />
            </TouchableOpacity>
          </View>
        )}

        {/* End Time - chỉ hiện khi chọn "Theo giờ" */}
        {durationType === 'hourly' && (
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <ThemedText style={styles.inputLabel}>Giờ kết thúc</ThemedText>
              <ThemedText style={styles.requiredMark}>*</ThemedText>
            </View>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowEndTimePicker(true)}
            >
              <ThemedText style={[
                styles.pickerButtonText,
                !endTime && styles.placeholderText
              ]}>
                {endTime || 'Chọn giờ kết thúc'}
              </ThemedText>
              <Ionicons name="time-outline" size={20} color="#4ECDC4" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Duration Type Selection */}
      <View style={styles.durationTypesContainer}>
        {durationTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.durationTypeButton,
              durationType === type.id && styles.durationTypeButtonSelected,
            ]}
            onPress={() => handleDurationTypeSelect(type.id)}
          >
            <ThemedText style={[
              styles.durationTypeButtonText,
              durationType === type.id && styles.durationTypeButtonTextSelected,
            ]}>
              {type.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Duration Input */}
      {renderDurationInput()}

      {/* Date/Time Inputs */}
      {renderDateTimeInputs()}

      {/* Placeholder when no duration type selected */}
      {!durationType && (
        <View style={styles.placeholderContainer}>
          <Ionicons name="time-outline" size={24} color="#6c757d" />
          <ThemedText style={styles.placeholderText}>
            Vui lòng chọn loại thời gian thuê
          </ThemedText>
        </View>
      )}

      {/* Modals */}
      <SimpleDatePicker
        visible={showStartDatePicker}
        onClose={() => setShowStartDatePicker(false)}
        onDateSelect={onStartDateChange}
        selectedDate={startDate}
      />

      <SimpleDatePicker
        visible={showEndDatePicker}
        onClose={() => setShowEndDatePicker(false)}
        onDateSelect={onEndDateChange}
        selectedDate={endDate}
      />

      <SimpleTimePicker
        visible={showStartTimePicker}
        onClose={() => setShowStartTimePicker(false)}
        onTimeSelect={onStartTimeChange}
        selectedTime={startTime}
      />

      <SimpleTimePicker
        visible={showEndTimePicker}
        onClose={() => setShowEndTimePicker(false)}
        onTimeSelect={onEndTimeChange}
        selectedTime={endTime}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Remove flex: 1 to prevent layout issues
  },
  durationTypesContainer: {
    marginBottom: 20,
  },
  durationTypeButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: 'white',
    marginBottom: 8,
  },
  durationTypeButtonSelected: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  durationTypeButtonText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  durationTypeButtonTextSelected: {
    color: 'white',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requiredMark: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc3545',
    marginLeft: 2,
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
  durationDisplay: {
    fontSize: 14,
    color: '#4ECDC4',
    marginTop: 6,
    fontWeight: '600',
  },
  unlimitedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f0fdfa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  unlimitedText: {
    fontSize: 16,
    color: '#4ECDC4',
    fontWeight: '600',
    marginLeft: 8,
  },
  dateTimeContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  dateTimeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
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
  placeholderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginTop: 16,
  },
});
