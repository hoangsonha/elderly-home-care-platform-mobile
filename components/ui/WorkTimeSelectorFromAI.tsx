import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { TimeRangePicker } from '@/components/ui/TimeRangePicker';

interface WorkTimeSelectorFromAIProps {
  selectedDays: string[];
  selectedTimeSlots: string[];
  specificTimeRanges: { start: string; end: string }[];
  onDaysChange: (days: string[]) => void;
  onTimeSlotsChange: (slots: string[]) => void;
  onSpecificTimeRangesChange: (ranges: { start: string; end: string }[]) => void;
}

export function WorkTimeSelectorFromAI({
  selectedDays,
  selectedTimeSlots,
  specificTimeRanges,
  onDaysChange,
  onTimeSlotsChange,
  onSpecificTimeRangesChange,
}: WorkTimeSelectorFromAIProps) {
  const [showCustomTimePicker, setShowCustomTimePicker] = useState(false);

  const weekDays = [
    { id: 'sunday', label: 'CN' },
    { id: 'monday', label: 'T2' },
    { id: 'tuesday', label: 'T3' },
    { id: 'wednesday', label: 'T4' },
    { id: 'thursday', label: 'T5' },
    { id: 'friday', label: 'T6' },
    { id: 'saturday', label: 'T7' },
  ];

  const timeSlots = [
    { id: 'morning', label: 'Sáng' },
    { id: 'afternoon', label: 'Chiều' },
    { id: 'evening', label: 'Tối' },
    { id: 'overnight', label: 'Đêm' },
    { id: 'custom', label: 'Khác' },
  ];

  const handleDayToggle = (dayId: string) => {
    if (selectedDays.includes(dayId)) {
      onDaysChange(selectedDays.filter(id => id !== dayId));
    } else {
      onDaysChange([...selectedDays, dayId]);
    }
  };

  const handleTimeSlotToggle = (slotId: string) => {
    if (slotId === 'custom') {
      if (showCustomTimePicker) {
        // Bấm lần 2: bỏ chọn và chỉ xóa custom ranges, giữ predefined ranges
        setShowCustomTimePicker(false);
        // Chỉ giữ lại predefined ranges, xóa custom ranges
        updateSpecificTimeRanges(selectedTimeSlots);
        // Bỏ chọn nút Khác
        onTimeSlotsChange(selectedTimeSlots.filter(id => id !== 'custom'));
      } else {
        // Bấm lần 1: mở custom time picker và chọn nút Khác
        setShowCustomTimePicker(true);
        onTimeSlotsChange([...selectedTimeSlots, 'custom']);
      }
      return;
    }

    let newSelectedTimeSlots;
    if (selectedTimeSlots.includes(slotId)) {
      newSelectedTimeSlots = selectedTimeSlots.filter(id => id !== slotId);
    } else {
      newSelectedTimeSlots = [...selectedTimeSlots, slotId];
    }
    
    onTimeSlotsChange(newSelectedTimeSlots);
    
    // Cập nhật specificTimeRanges dựa trên selectedTimeSlots
    updateSpecificTimeRanges(newSelectedTimeSlots);
  };

  const updateSpecificTimeRanges = useCallback((timeSlots: string[]) => {
    const timeSlotRanges = {
      'morning': { start: '06:00', end: '12:00' },
      'afternoon': { start: '12:00', end: '18:00' },
      'evening': { start: '18:00', end: '22:00' },
      'overnight': { start: '22:00', end: '06:00' },
    };

    const newRanges = timeSlots
      .filter(slot => slot !== 'custom')
      .map(slot => timeSlotRanges[slot as keyof typeof timeSlotRanges])
      .filter(Boolean);

    onSpecificTimeRangesChange(newRanges);
  }, [onSpecificTimeRangesChange]);


  return (
    <View style={styles.container}>
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Chọn ngày cần chăm sóc <ThemedText style={styles.requiredMark}>*</ThemedText></ThemedText>
        <View style={styles.daysContainer}>
          {weekDays.map((day) => (
            <TouchableOpacity
              key={day.id}
              style={[
                styles.dayButton,
                selectedDays.includes(day.id) && styles.dayButtonSelected
              ]}
              onPress={() => handleDayToggle(day.id)}
            >
              <ThemedText style={[
                styles.dayButtonText,
                selectedDays.includes(day.id) && styles.dayButtonTextSelected
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
                (time.id === 'custom' ? showCustomTimePicker : selectedTimeSlots.includes(time.id)) && styles.timeSlotButtonSelected
              ]}
              onPress={() => handleTimeSlotToggle(time.id)}
            >
              <ThemedText style={[
                styles.timeSlotButtonText,
                (time.id === 'custom' ? showCustomTimePicker : selectedTimeSlots.includes(time.id)) && styles.timeSlotButtonTextSelected
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
          timeRanges={specificTimeRanges
            .filter((range, index) => {
              // Chỉ hiển thị custom ranges (không phải predefined)
              const predefinedRanges = {
                'morning': { start: '06:00', end: '12:00' },
                'afternoon': { start: '12:00', end: '18:00' },
                'evening': { start: '18:00', end: '22:00' },
                'overnight': { start: '22:00', end: '06:00' },
              };
              return !selectedTimeSlots.some(slot => {
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
            const predefinedRanges = selectedTimeSlots.map(slot => {
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
            onSpecificTimeRangesChange(allRanges);
            // KHÔNG đóng modal, giữ showCustomTimePicker = true
          }}
          maxRanges={5}
          selectedTimeSlots={selectedTimeSlots}
        />
      )}

      {/* Hiển thị khung giờ đã chọn */}
      {specificTimeRanges.length > 0 && (
        <View style={styles.selectedRangesContainer}>
          <ThemedText style={styles.selectedRangesTitle}>Khung giờ đã chọn:</ThemedText>
          
          {/* Tất cả time ranges - KHÔNG có dấu X, chỉ hiển thị */}
          {specificTimeRanges.map((range, index) => (
            <View key={`range-${index}`} style={styles.selectedRangeItem}>
              <ThemedText style={styles.selectedRangeText}>
                Khung {index + 1}: {range.start} - {range.end}
              </ThemedText>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Remove flex to prevent layout issues
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  requiredMark: {
    color: '#dc3545',
    fontSize: 16,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: 'white',
  },
  dayButtonSelected: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  dayButtonTextSelected: {
    color: 'white',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlotButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: 'white',
  },
  timeSlotButtonSelected: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  timeSlotButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  timeSlotButtonTextSelected: {
    color: 'white',
  },
  selectedRangesContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedRangesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  selectedRangeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  selectedRangeText: {
    fontSize: 13,
    color: '#4ECDC4',
    fontWeight: '500',
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
});

