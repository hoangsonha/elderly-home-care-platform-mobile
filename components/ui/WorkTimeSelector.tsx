import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { TimeRangePicker } from '@/components/ui/TimeRangePicker';

interface WorkTimeSelectorProps {
  selectedTimeSlots: string[];
  specificTimeRanges: Array<{ start: string; end: string }>;
  onTimeSlotsChange: (slots: string[]) => void;
  onSpecificTimeRangesChange: (ranges: Array<{ start: string; end: string }>) => void;
}

export function WorkTimeSelector({
  selectedTimeSlots,
  specificTimeRanges,
  onTimeSlotsChange,
  onSpecificTimeRangesChange,
}: WorkTimeSelectorProps) {
  const [showTimeRangePicker, setShowTimeRangePicker] = useState(false);

  const timeSlots = [
    { id: 'morning', label: 'Sáng', time: '06:00 - 12:00' },
    { id: 'afternoon', label: 'Chiều', time: '12:00 - 18:00' },
    { id: 'evening', label: 'Tối', time: '18:00 - 22:00' },
    { id: 'night', label: 'Đêm', time: '22:00 - 06:00' },
    { id: 'custom', label: 'Khác', time: 'Tùy chọn' },
  ];

  const handleTimeSlotToggle = (slotId: string) => {
    if (slotId === 'custom') {
      setShowTimeRangePicker(true);
      return;
    }

    if (selectedTimeSlots.includes(slotId)) {
      onTimeSlotsChange(selectedTimeSlots.filter(id => id !== slotId));
    } else {
      onTimeSlotsChange([...selectedTimeSlots, slotId]);
    }
  };

  const handleTimeRangeAdd = (start: string, end: string) => {
    const newRange = { start, end };
    onSpecificTimeRangesChange([...specificTimeRanges, newRange]);
  };

  const handleTimeRangeRemove = (index: number) => {
    const newRanges = specificTimeRanges.filter((_, i) => i !== index);
    onSpecificTimeRangesChange(newRanges);
  };

  const getTimeSlotInfo = (slotId: string) => {
    return timeSlots.find(slot => slot.id === slotId);
  };

  return (
    <View style={styles.container}>
      {/* Time Slot Buttons */}
      <View style={styles.timeSlotsContainer}>
        {timeSlots.map((slot) => {
          const isSelected = selectedTimeSlots.includes(slot.id);
          const isCustom = slot.id === 'custom';
          
          return (
            <TouchableOpacity
              key={slot.id}
              style={[
                styles.timeSlotButton,
                isSelected && styles.timeSlotButtonSelected,
                isCustom && styles.customButton,
              ]}
              onPress={() => handleTimeSlotToggle(slot.id)}
            >
              <ThemedText style={[
                styles.timeSlotButtonText,
                isSelected && styles.timeSlotButtonTextSelected,
              ]}>
                {slot.label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected Time Slots Display */}
      {selectedTimeSlots && selectedTimeSlots.length > 0 && (
        <View style={styles.selectedSlotsContainer}>
          <ThemedText style={styles.selectedSlotsTitle}>Khung giờ đã chọn:</ThemedText>
          {selectedTimeSlots.map((slotId) => {
            const slotInfo = getTimeSlotInfo(slotId);
            if (!slotInfo) return null;
            
            return (
              <View key={slotId} style={styles.selectedSlotItem}>
                <ThemedText style={styles.selectedSlotText}>
                  {slotInfo.label}: {slotInfo.time}
                </ThemedText>
              </View>
            );
          })}
        </View>
      )}

      {/* Specific Time Ranges Display */}
      {specificTimeRanges && specificTimeRanges.length > 0 && (
        <View style={styles.specificRangesContainer}>
          <ThemedText style={styles.specificRangesTitle}>Khung giờ cụ thể:</ThemedText>
          {specificTimeRanges.map((range, index) => (
            <View key={index} style={styles.specificRangeItem}>
              <ThemedText style={styles.specificRangeText}>
                Khung {index + 1}: {range.start} - {range.end}
              </ThemedText>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleTimeRangeRemove(index)}
              >
                <Ionicons name="close-circle" size={20} color="#dc3545" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Add Specific Time Range Button */}
      <TouchableOpacity
        style={styles.addTimeRangeButton}
        onPress={() => setShowTimeRangePicker(true)}
      >
        <Ionicons name="add" size={20} color="#4ECDC4" />
        <ThemedText style={styles.addTimeRangeButtonText}>
          Thêm khung giờ cụ thể
        </ThemedText>
      </TouchableOpacity>

      {/* Time Range Picker Modal */}
      {showTimeRangePicker && (
        <TimeRangePicker
          timeRanges={specificTimeRanges.map((range, index) => ({
            id: `range-${index}`,
            startTime: range.start,
            endTime: range.end,
          }))}
          onTimeRangesChange={(ranges) => {
            const newRanges = ranges.map(range => ({
              start: range.startTime,
              end: range.endTime,
            }));
            onSpecificTimeRangesChange(newRanges);
            setShowTimeRangePicker(false);
          }}
          selectedTimeSlots={selectedTimeSlots}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Remove flex: 1 to prevent layout issues
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
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
  customButton: {
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
  selectedSlotsContainer: {
    marginBottom: 16,
  },
  selectedSlotsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  selectedSlotItem: {
    backgroundColor: '#f0fdfa',
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedSlotText: {
    fontSize: 13,
    color: '#4ECDC4',
    fontWeight: '500',
  },
  specificRangesContainer: {
    marginBottom: 16,
  },
  specificRangesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  specificRangeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  specificRangeText: {
    fontSize: 13,
    color: '#6c757d',
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  addTimeRangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4ECDC4',
    borderStyle: 'dashed',
    backgroundColor: '#f0fdfa',
  },
  addTimeRangeButtonText: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '500',
    marginLeft: 8,
  },
});
