import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

interface TimeSlot {
  id: string;
  day: string;
  timeRange: string;
  startTime: string;
  endTime: string;
}

interface WorkTimeSelectorProps {
  onTimeSlotsChange?: (timeSlots: TimeSlot[]) => void;
}

const DAYS = [
  { key: 'monday', label: 'Thứ 2', short: 'T2' },
  { key: 'tuesday', label: 'Thứ 3', short: 'T3' },
  { key: 'wednesday', label: 'Thứ 4', short: 'T4' },
  { key: 'thursday', label: 'Thứ 5', short: 'T5' },
  { key: 'friday', label: 'Thứ 6', short: 'T6' },
  { key: 'saturday', label: 'Thứ 7', short: 'T7' },
  { key: 'sunday', label: 'Chủ nhật', short: 'CN' },
];

const TIME_RANGES = [
  { key: 'morning', label: 'Sáng', startTime: '06:00', endTime: '12:00' },
  { key: 'afternoon', label: 'Chiều', startTime: '12:00', endTime: '18:00' },
  { key: 'evening', label: 'Tối', startTime: '18:00', endTime: '22:00' },
  { key: 'night', label: 'Đêm', startTime: '22:00', endTime: '06:00' },
];

export function WorkTimeSelector({ onTimeSlotsChange }: WorkTimeSelectorProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  const handleDayPress = (dayKey: string) => {
    if (selectedDays.includes(dayKey)) {
      setSelectedDays(selectedDays.filter(day => day !== dayKey));
    } else {
      setSelectedDays([...selectedDays, dayKey]);
    }
  };

  const handleTimeRangePress = (timeRangeKey: string) => {
    setSelectedTimeRange(timeRangeKey);
  };

  const handleAddTimeSlot = () => {
    if (selectedDays.length === 0 || !selectedTimeRange) {
      return;
    }

    const timeRange = TIME_RANGES.find(tr => tr.key === selectedTimeRange);
    if (!timeRange) return;

    const newTimeSlots: TimeSlot[] = [];
    
    selectedDays.forEach(dayKey => {
      const day = DAYS.find(d => d.key === dayKey);
      if (!day) return;

      // Check if this day already has a time slot
      const existingSlot = timeSlots.find(slot => slot.day === day.label);
      if (existingSlot) {
        // Update existing slot
        const updatedSlots = timeSlots.map(slot => 
          slot.day === day.label 
            ? { ...slot, timeRange: timeRange.label, startTime: timeRange.startTime, endTime: timeRange.endTime }
            : slot
        );
        setTimeSlots(updatedSlots);
        onTimeSlotsChange?.(updatedSlots);
        return;
      }

      // Add new slot
      newTimeSlots.push({
        id: `${dayKey}-${selectedTimeRange}-${Date.now()}`,
        day: day.label,
        timeRange: timeRange.label,
        startTime: timeRange.startTime,
        endTime: timeRange.endTime,
      });
    });

    if (newTimeSlots.length > 0) {
      const updatedSlots = [...timeSlots, ...newTimeSlots];
      setTimeSlots(updatedSlots);
      onTimeSlotsChange?.(updatedSlots);
    }

    // Clear selections
    setSelectedDays([]);
    setSelectedTimeRange('');
  };

  const handleRemoveTimeSlot = (slotId: string) => {
    const updatedSlots = timeSlots.filter(slot => slot.id !== slotId);
    setTimeSlots(updatedSlots);
    onTimeSlotsChange?.(updatedSlots);
  };

  const getDayLabel = (dayKey: string) => {
    return DAYS.find(day => day.key === dayKey)?.short || dayKey;
  };

  const getTimeRangeLabel = (timeRangeKey: string) => {
    return TIME_RANGES.find(tr => tr.key === timeRangeKey)?.label || timeRangeKey;
  };

  return (
    <View style={styles.container}>
      {/* Selected Time Slots */}
      {timeSlots.length > 0 && (
        <View style={styles.timeSlotsContainer}>
          <ThemedText style={styles.sectionTitle}>Thời gian đã chọn</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeSlotsScroll}>
            {timeSlots.map((slot) => (
              <View key={slot.id} style={styles.timeSlotCard}>
                <View style={styles.timeSlotContent}>
                  <ThemedText style={styles.timeSlotDay}>{slot.day}</ThemedText>
                  <ThemedText style={styles.timeSlotTime}>{slot.timeRange}</ThemedText>
                  <ThemedText style={styles.timeSlotRange}>{slot.startTime} - {slot.endTime}</ThemedText>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveTimeSlot(slot.id)}
                >
                  <Ionicons name="close-circle" size={20} color="#DC3545" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Day Selection */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Chọn ngày trong tuần</ThemedText>
        <View style={styles.daysContainer}>
          {DAYS.map((day) => (
            <TouchableOpacity
              key={day.key}
              style={[
                styles.dayButton,
                selectedDays.includes(day.key) && styles.dayButtonSelected
              ]}
              onPress={() => handleDayPress(day.key)}
            >
              <ThemedText style={[
                styles.dayButtonText,
                selectedDays.includes(day.key) && styles.dayButtonTextSelected
              ]}>
                {day.short}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Time Range Selection */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Chọn khung giờ</ThemedText>
        <View style={styles.timeRangesContainer}>
          {TIME_RANGES.map((timeRange) => (
            <TouchableOpacity
              key={timeRange.key}
              style={[
                styles.timeRangeButton,
                selectedTimeRange === timeRange.key && styles.timeRangeButtonSelected
              ]}
              onPress={() => handleTimeRangePress(timeRange.key)}
            >
              <ThemedText style={[
                styles.timeRangeButtonText,
                selectedTimeRange === timeRange.key && styles.timeRangeButtonTextSelected
              ]}>
                {timeRange.label}
              </ThemedText>
              <ThemedText style={[
                styles.timeRangeTimeText,
                selectedTimeRange === timeRange.key && styles.timeRangeTimeTextSelected
              ]}>
                {timeRange.startTime} - {timeRange.endTime}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Add Button */}
      <TouchableOpacity
        style={[
          styles.addButton,
          (selectedDays.length === 0 || !selectedTimeRange) && styles.addButtonDisabled
        ]}
        onPress={handleAddTimeSlot}
        disabled={selectedDays.length === 0 || !selectedTimeRange}
      >
        <Ionicons name="add" size={20} color="white" />
        <ThemedText style={styles.addButtonText}>Thêm khung giờ</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  timeSlotsContainer: {
    marginBottom: 20,
  },
  timeSlotsScroll: {
    marginTop: 8,
  },
  timeSlotCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 120,
  },
  timeSlotContent: {
    flex: 1,
  },
  timeSlotDay: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 2,
  },
  timeSlotTime: {
    fontSize: 12,
    color: '#1976D2',
    marginBottom: 2,
  },
  timeSlotRange: {
    fontSize: 10,
    color: '#1976D2',
    opacity: 0.8,
  },
  removeButton: {
    marginLeft: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  dayButtonSelected: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6C757D',
  },
  dayButtonTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  timeRangesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    alignItems: 'center',
    minWidth: 80,
  },
  timeRangeButtonSelected: {
    backgroundColor: '#27AE60',
    borderColor: '#27AE60',
  },
  timeRangeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6C757D',
    marginBottom: 4,
  },
  timeRangeButtonTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  timeRangeTimeText: {
    fontSize: 10,
    color: '#6C757D',
    opacity: 0.8,
  },
  timeRangeTimeTextSelected: {
    color: 'white',
    opacity: 0.9,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498DB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  addButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});