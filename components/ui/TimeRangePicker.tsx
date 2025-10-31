import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';

interface TimeRange {
  id: string;
  startTime: string;
  endTime: string;
}

interface TimeRangePickerProps {
  timeRanges: TimeRange[];
  onTimeRangesChange: (timeRanges: TimeRange[]) => void;
  maxRanges?: number;
  selectedTimeSlots?: string[];
  availableTimeRanges?: TimeRange[];
}

const hours = Array.from({ length: 24 }, (_, i) => i);
const minutes = Array.from({ length: 60 }, (_, i) => i);

export function TimeRangePicker({
  timeRanges,
  onTimeRangesChange,
  maxRanges = 5,
  selectedTimeSlots = [],
  availableTimeRanges = [],
}: TimeRangePickerProps) {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editingRange, setEditingRange] = useState<TimeRange | null>(null);
  const [tempStartHour, setTempStartHour] = useState(8);
  const [tempStartMinute, setTempStartMinute] = useState(0);
  const [tempEndHour, setTempEndHour] = useState(17);
  const [tempEndMinute, setTempEndMinute] = useState(0);

  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const getAvailableTimeSlots = () => {
    const timeSlotRanges = {
      'morning': { start: 6, end: 12 },
      'afternoon': { start: 12, end: 18 },
      'evening': { start: 18, end: 22 },
      'overnight': { start: 22, end: 6 },
    };

    const usedHours = new Set<number>();
    
    // Add hours from selected time slots
    selectedTimeSlots.forEach(slot => {
      const range = timeSlotRanges[slot as keyof typeof timeSlotRanges];
      if (range) {
        if (range.start < range.end) {
          for (let hour = range.start; hour < range.end; hour++) {
            usedHours.add(hour);
          }
        } else {
          // Overnight case (22:00 - 06:00)
          for (let hour = range.start; hour < 24; hour++) {
            usedHours.add(hour);
          }
          for (let hour = 0; hour < range.end; hour++) {
            usedHours.add(hour);
          }
        }
      }
    });

    // Add hours from specific time ranges
    timeRanges.forEach(range => {
      const [startHour] = range.startTime.split(':').map(Number);
      const [endHour] = range.endTime.split(':').map(Number);
      
      if (startHour < endHour) {
        for (let hour = startHour; hour < endHour; hour++) {
          usedHours.add(hour);
        }
      } else {
        // Cross midnight
        for (let hour = startHour; hour < 24; hour++) {
          usedHours.add(hour);
        }
        for (let hour = 0; hour < endHour; hour++) {
          usedHours.add(hour);
        }
      }
    });

    return usedHours;
  };

  const getAvailableTimeRanges = () => {
    const usedHours = getAvailableTimeSlots();
    const availableRanges: TimeRange[] = [];
    
    // Find continuous available time ranges
    let startHour = -1;
    for (let hour = 0; hour < 24; hour++) {
      if (!usedHours.has(hour)) {
        if (startHour === -1) {
          startHour = hour;
        }
      } else {
        if (startHour !== -1) {
          // End of available range
          availableRanges.push({
            id: `available-${startHour}-${hour}`,
            startTime: `${startHour.toString().padStart(2, '0')}:00`,
            endTime: `${hour.toString().padStart(2, '0')}:00`,
          });
          startHour = -1;
        }
      }
    }
    
    // Handle case where available range goes to end of day
    if (startHour !== -1) {
      availableRanges.push({
        id: `available-${startHour}-24`,
        startTime: `${startHour.toString().padStart(2, '0')}:00`,
        endTime: '24:00',
      });
    }
    
    return availableRanges;
  };

  const getRemainingHours = () => {
    const usedHours = getAvailableTimeSlots();
    const allHours = Array.from({ length: 24 }, (_, i) => i);
    return allHours.filter(hour => !usedHours.has(hour));
  };

  const handleAddTimeRange = () => {
    if (!timeRanges || timeRanges.length >= maxRanges) return;
    
    setEditingRange(null);
    
    // Find first available hour for default start time
    const usedHours = getAvailableTimeSlots();
    let defaultStartHour = 8;
    for (let hour = 0; hour < 24; hour++) {
      if (!usedHours.has(hour)) {
        defaultStartHour = hour;
        break;
      }
    }
    
    // Find first available hour after start time for default end time
    let defaultEndHour = defaultStartHour + 1;
    for (let hour = defaultStartHour + 1; hour < 24; hour++) {
      if (!usedHours.has(hour)) {
        defaultEndHour = hour + 1;
        break;
      }
    }
    
    setTempStartHour(defaultStartHour);
    setTempStartMinute(0);
    setTempEndHour(defaultEndHour);
    setTempEndMinute(0);
    setShowTimePicker(true);
  };

  const handleEditTimeRange = (range: TimeRange) => {
    const [startHour, startMinute] = range.startTime.split(':').map(Number);
    const [endHour, endMinute] = range.endTime.split(':').map(Number);
    
    setEditingRange(range);
    setTempStartHour(startHour);
    setTempStartMinute(startMinute);
    setTempEndHour(endHour);
    setTempEndMinute(endMinute);
    setShowTimePicker(true);
  };

  const isTimeRangeOverlap = (startTime: string, endTime: string, excludeId?: string) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    // Check overlap with existing specific time ranges
    const hasOverlapWithSpecificRanges = timeRanges.some(range => {
      if (excludeId && range.id === excludeId) return false;
      
      const [existingStartHour, existingStartMinute] = range.startTime.split(':').map(Number);
      const [existingEndHour, existingEndMinute] = range.endTime.split(':').map(Number);
      
      const newStart = startHour * 60 + startMinute;
      const newEnd = endHour * 60 + endMinute;
      const existingStart = existingStartHour * 60 + existingStartMinute;
      const existingEnd = existingEndHour * 60 + existingEndMinute;
      
      return (newStart < existingEnd && newEnd > existingStart);
    });

    // Check overlap with selected time slots
    const usedHours = getAvailableTimeSlots();
    const hasOverlapWithTimeSlots = Array.from({ length: endHour - startHour }, (_, i) => startHour + i)
      .some(hour => usedHours.has(hour));

    return hasOverlapWithSpecificRanges || hasOverlapWithTimeSlots;
  };

  const handleSaveTimeRange = () => {
    const startTime = formatTime(tempStartHour, tempStartMinute);
    const endTime = formatTime(tempEndHour, tempEndMinute);

    // Validate time range
    if (tempStartHour > tempEndHour || (tempStartHour === tempEndHour && tempStartMinute >= tempEndMinute)) {
      Alert.alert('Lỗi', 'Giờ kết thúc phải sau giờ bắt đầu');
      return;
    }

    // Check for overlap with existing ranges
    if (isTimeRangeOverlap(startTime, endTime, editingRange?.id)) {
      Alert.alert('Lỗi', 'Khung giờ này đã được chọn trong các khung giờ cơ bản hoặc khung giờ cụ thể khác');
      return;
    }

    if (editingRange) {
      // Update existing range
      const updatedRanges = timeRanges.map(range =>
        range.id === editingRange.id
          ? { ...range, startTime, endTime }
          : range
      );
      onTimeRangesChange(updatedRanges);
    } else {
      // Add new range
      const newRange: TimeRange = {
        id: Date.now().toString(),
        startTime,
        endTime,
      };
      onTimeRangesChange([...timeRanges, newRange]);
    }

    setShowTimePicker(false);
    setEditingRange(null);
  };

  const handleRemoveTimeRange = (rangeId: string) => {
    onTimeRangesChange(timeRanges.filter(range => range.id !== rangeId));
  };

  const isHourDisabled = (hour: number) => {
    const usedHours = getAvailableTimeSlots();
    return usedHours.has(hour);
  };

  const renderTimePicker = () => (
    <Modal visible={showTimePicker} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowTimePicker(false)}>
              <ThemedText style={styles.cancelButton}>Hủy</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>
              {editingRange ? 'Chỉnh sửa khung giờ' : 'Thêm khung giờ mới'}
            </ThemedText>
            <TouchableOpacity onPress={handleSaveTimeRange}>
              <ThemedText style={styles.saveButton}>Lưu</ThemedText>
            </TouchableOpacity>
          </View>

          {timeRanges && timeRanges.length > 0 && (
            <View style={styles.existingRangesContainer}>
              <ThemedText style={styles.existingRangesTitle}>Thời gian đã chọn:</ThemedText>
              {timeRanges.map((range, index) => (
                <View key={range.id} style={styles.existingRangeItem}>
                  <ThemedText style={styles.existingRangeText}>
                    Khung {index + 1}: {range.startTime} - {range.endTime}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}

          <View style={styles.timePickerContainer}>
            <View style={styles.timeSection}>
              <ThemedText style={styles.timeLabel}>Từ giờ</ThemedText>
              <View style={styles.timePickerRow}>
                <ScrollView style={styles.timePicker} showsVerticalScrollIndicator={false}>
                  {hours.map(hour => {
                    const isDisabled = isHourDisabled(hour);
                    return (
                      <TouchableOpacity
                        key={hour}
                        style={[
                          styles.timeOption,
                          tempStartHour === hour && styles.timeOptionSelected,
                          isDisabled && styles.timeOptionDisabled
                        ]}
                        onPress={() => !isDisabled && setTempStartHour(hour)}
                        disabled={isDisabled}
                      >
                        <ThemedText style={[
                          styles.timeOptionText,
                          tempStartHour === hour && styles.timeOptionTextSelected,
                          isDisabled && styles.timeOptionTextDisabled
                        ]}>
                          {hour.toString().padStart(2, '0')}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <ThemedText style={styles.timeSeparator}>:</ThemedText>
                <ScrollView style={styles.timePicker} showsVerticalScrollIndicator={false}>
                  {minutes.filter(m => m % 15 === 0).map(minute => (
                    <TouchableOpacity
                      key={minute}
                      style={[
                        styles.timeOption,
                        tempStartMinute === minute && styles.timeOptionSelected
                      ]}
                      onPress={() => setTempStartMinute(minute)}
                    >
                      <ThemedText style={[
                        styles.timeOptionText,
                        tempStartMinute === minute && styles.timeOptionTextSelected
                      ]}>
                        {minute.toString().padStart(2, '0')}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.timeSection}>
              <ThemedText style={styles.timeLabel}>Đến giờ</ThemedText>
              <View style={styles.timePickerRow}>
                <ScrollView style={styles.timePicker} showsVerticalScrollIndicator={false}>
                  {hours.map(hour => {
                    const isDisabled = isHourDisabled(hour);
                    return (
                      <TouchableOpacity
                        key={hour}
                        style={[
                          styles.timeOption,
                          tempEndHour === hour && styles.timeOptionSelected,
                          isDisabled && styles.timeOptionDisabled
                        ]}
                        onPress={() => !isDisabled && setTempEndHour(hour)}
                        disabled={isDisabled}
                      >
                        <ThemedText style={[
                          styles.timeOptionText,
                          tempEndHour === hour && styles.timeOptionTextSelected,
                          isDisabled && styles.timeOptionTextDisabled
                        ]}>
                          {hour.toString().padStart(2, '0')}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <ThemedText style={styles.timeSeparator}>:</ThemedText>
                <ScrollView style={styles.timePicker} showsVerticalScrollIndicator={false}>
                  {minutes.filter(m => m % 15 === 0).map(minute => (
                    <TouchableOpacity
                      key={minute}
                      style={[
                        styles.timeOption,
                        tempEndMinute === minute && styles.timeOptionSelected
                      ]}
                      onPress={() => setTempEndMinute(minute)}
                    >
                      <ThemedText style={[
                        styles.timeOptionText,
                        tempEndMinute === minute && styles.timeOptionTextSelected
                      ]}>
                        {minute.toString().padStart(2, '0')}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  const availableRanges = getAvailableTimeRanges();

  return (
    <View style={styles.container}>
      {/* Hiển thị các khung giờ có thể chọn */}
      {availableRanges && availableRanges.length > 0 ? (
        <View style={styles.availableRangesContainer}>
          <ThemedText style={styles.availableRangesTitle}>Khung giờ có thể chọn:</ThemedText>
          <View style={styles.availableRangesList}>
            {availableRanges.map((range) => (
              <View key={range.id} style={styles.availableRangeItem}>
                <ThemedText style={styles.availableRangeText}>
                  {range.startTime} - {range.endTime}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.noAvailableRangesContainer}>
          <Ionicons name="time-outline" size={32} color="#6c757d" />
          <ThemedText style={styles.noAvailableRangesTitle}>Không có khung giờ trống</ThemedText>
          <ThemedText style={styles.noAvailableRangesText}>
            Tất cả khung giờ đã được chọn. Hãy bỏ chọn một số khung giờ cơ bản để có thể thêm khung giờ cụ thể.
          </ThemedText>
        </View>
      )}

      {availableRanges && availableRanges.length > 0 && (
        <TouchableOpacity style={styles.addButton} onPress={handleAddTimeRange}>
          <Ionicons name="add-circle" size={20} color="#68C2E8" />
          <ThemedText style={styles.addButtonText}>Thêm khung giờ cụ thể</ThemedText>
        </TouchableOpacity>
      )}

      {timeRanges.map((range, index) => (
        <View key={range.id} style={styles.timeRangeItem}>
          <View style={styles.timeRangeContent}>
            <ThemedText style={styles.timeRangeText}>
              Khung {index + 1}: {range.startTime} - {range.endTime}
            </ThemedText>
          </View>
          <View style={styles.timeRangeActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEditTimeRange(range)}
            >
              <Ionicons name="pencil" size={16} color="#68C2E8" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveTimeRange(range.id)}
            >
              <Ionicons name="remove-circle" size={20} color="#dc3545" />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {renderTimePicker()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f0fdfa',
    borderWidth: 1,
    borderColor: '#68C2E8',
    alignSelf: 'flex-start',
  },
  addButtonText: {
    marginLeft: 8,
    color: '#68C2E8',
    fontWeight: '600',
  },
  timeRangeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  timeRangeContent: {
    flex: 1,
  },
  timeRangeText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  timeRangeActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 4,
    marginRight: 8,
  },
  removeButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  cancelButton: {
    fontSize: 16,
    color: '#6c757d',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  saveButton: {
    fontSize: 16,
    color: '#68C2E8',
    fontWeight: '600',
  },
  timePickerContainer: {
    padding: 20,
  },
  timeSection: {
    marginBottom: 24,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timePicker: {
    height: 120,
    width: 80,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
  },
  timeOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  timeOptionSelected: {
    backgroundColor: '#68C2E8',
  },
  timeOptionText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  timeOptionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  timeOptionDisabled: {
    backgroundColor: '#f8f9fa',
    opacity: 0.5,
  },
  timeOptionTextDisabled: {
    color: '#adb5bd',
  },
  timeSeparator: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginHorizontal: 8,
  },
  existingRangesContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    marginHorizontal: 20,
    borderRadius: 8,
  },
  existingRangesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  existingRangeItem: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  existingRangeText: {
    fontSize: 12,
    color: '#6c757d',
  },
  availableRangesContainer: {
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#28a745',
  },
  availableRangesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28a745',
    marginBottom: 8,
  },
  availableRangesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  availableRangeItem: {
    backgroundColor: 'white',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#28a745',
  },
  availableRangeText: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '500',
  },
  noAvailableRangesContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  noAvailableRangesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
    marginTop: 8,
    marginBottom: 4,
  },
  noAvailableRangesText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
});
