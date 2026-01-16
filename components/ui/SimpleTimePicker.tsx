import { ThemedText } from '@/components/themed-text';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

interface SimpleTimePickerProps {
  visible: boolean;
  onClose: () => void;
  onTimeSelect: (time: string) => void;
  selectedTime?: string;
  availableTimes?: string[]; // Khung giờ có sẵn từ Thời gian làm việc
  title?: string;
  blockedRanges?: Array<{ start: string; end: string }>;
  minTime?: string;
}

export function SimpleTimePicker({
  visible,
  onClose,
  onTimeSelect,
  selectedTime = '06:00',
  availableTimes = [],
  title = 'Chọn giờ bắt đầu',
  blockedRanges = [],
  minTime,
}: SimpleTimePickerProps) {
  const [tempHour, setTempHour] = useState(6);
  const [tempMinute, setTempMinute] = useState(0);

  useEffect(() => {
    if (!selectedTime) return;
    const [hourStr, minuteStr] = selectedTime.split(':');
    const parsedHour = Number(hourStr);
    const parsedMinute = Number(minuteStr);
    if (!Number.isNaN(parsedHour)) {
      setTempHour(parsedHour);
    }
    if (!Number.isNaN(parsedMinute)) {
      setTempMinute(parsedMinute);
    }
  }, [selectedTime, visible]);

  // Tạo danh sách giờ dựa trên availableTimes
  const getAvailableHours = () => {
    if (availableTimes.length === 0) {
      // Nếu không có availableTimes, tạo mặc định từ 1-23h
      const hours = [];
      for (let i = 1; i <= 23; i++) {
        hours.push(i);
      }
      return hours;
    }

    // Lấy tất cả giờ từ availableTimes
    const hours = new Set<number>();
    availableTimes.forEach(time => {
      const [hour] = time.split(':').map(Number);
      hours.add(hour);
    });
    return Array.from(hours).sort((a, b) => a - b);
  };

  // Tạo danh sách phút dựa trên availableTimes cho giờ đã chọn
  const getAvailableMinutes = (hour: number) => {
    if (availableTimes.length === 0) {
      // Nếu không có availableTimes, cho phép 00-59
      const minutes = [];
      for (let i = 0; i <= 59; i++) {
        minutes.push(i);
      }
      return minutes;
    }

    // Lấy tất cả phút cho giờ đã chọn
    const minutes = new Set<number>();
    availableTimes.forEach(time => {
      const [timeHour, timeMinute] = time.split(':').map(Number);
      if (timeHour === hour) {
        minutes.add(timeMinute);
      }
    });
    return Array.from(minutes).sort((a, b) => a - b);
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const isBlocked = (hour: number, minute: number) => {
    if (blockedRanges.length === 0) return false;
    const value = hour * 60 + minute;
    return blockedRanges.some((range) => {
      const start = timeToMinutes(range.start);
      const end = timeToMinutes(range.end);
      return value >= start && value < end;
    });
  };

  const isBeforeMinTime = (hour: number, minute: number) => {
    if (!minTime) return false;
    const value = hour * 60 + minute;
    return value < timeToMinutes(minTime);
  };

  const isDisabledTime = (hour: number, minute: number) =>
    isBlocked(hour, minute) || isBeforeMinTime(hour, minute);

  const hours = getAvailableHours();
  const minutes = getAvailableMinutes(tempHour);

  const getFirstAvailableMinute = (hour: number) => {
    const newMinutes = getAvailableMinutes(hour);
    const availableMinute = newMinutes.find(
      (minute) => !isDisabledTime(hour, minute)
    );
    return availableMinute ?? null;
  };

  const handleHourChange = (hour: number) => {
    setTempHour(hour);
    // Reset phút về phút đầu tiên có sẵn và không bị block cho giờ mới
    const nextMinute = getFirstAvailableMinute(hour);
    if (nextMinute !== null) {
      setTempMinute(nextMinute);
    }
  };

  const handleConfirm = () => {
    if (isDisabledTime(tempHour, tempMinute)) {
      // Find first available time in the picker
      for (const hour of hours) {
        const minute = getFirstAvailableMinute(hour);
        if (minute !== null) {
          setTempHour(hour);
          setTempMinute(minute);
          return;
        }
      }
      return;
    }
    const timeString = `${tempHour.toString().padStart(2, '0')}:${tempMinute.toString().padStart(2, '0')}`;
    onTimeSelect(timeString);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <ThemedText style={styles.cancelButtonText}>Hủy</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.title}>{title}</ThemedText>
            <TouchableOpacity onPress={handleConfirm}>
              <ThemedText style={styles.confirmButtonText}>Xong</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Simple Picker */}
          <View style={styles.pickerRow}>
            {/* Hours */}
            <View style={styles.pickerColumn}>
              <ThemedText style={styles.pickerLabel}>Giờ</ThemedText>
              <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
                {hours.map((hour) => {
                  const hourMinutes = getAvailableMinutes(hour);
                  const isHourBlocked =
                    hourMinutes.length > 0 &&
                    hourMinutes.every((minute) => isDisabledTime(hour, minute));
                  return (
                  <TouchableOpacity
                    key={hour}
                    style={[
                      styles.pickerItem,
                      tempHour === hour && styles.pickerItemSelected,
                      isHourBlocked && styles.pickerItemDisabled,
                    ]}
                    onPress={() => handleHourChange(hour)}
                    disabled={isHourBlocked}
                  >
                    <ThemedText style={[
                      styles.pickerItemText,
                      tempHour === hour && styles.pickerItemTextSelected,
                      isHourBlocked && styles.pickerItemTextDisabled,
                    ]}>
                      {hour.toString().padStart(2, '0')}
                    </ThemedText>
                  </TouchableOpacity>
                );
                })}
              </ScrollView>
            </View>

            <ThemedText style={styles.separator}>:</ThemedText>

            {/* Minutes */}
            <View style={styles.pickerColumn}>
              <ThemedText style={styles.pickerLabel}>Phút</ThemedText>
              <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
                {minutes.map((minute) => {
                  const blocked = isDisabledTime(tempHour, minute);
                  return (
                  <TouchableOpacity
                    key={minute}
                    style={[
                      styles.pickerItem,
                      tempMinute === minute && styles.pickerItemSelected,
                      blocked && styles.pickerItemDisabled,
                    ]}
                    onPress={() => setTempMinute(minute)}
                    disabled={blocked}
                  >
                    <ThemedText style={[
                      styles.pickerItemText,
                      tempMinute === minute && styles.pickerItemTextSelected,
                      blocked && styles.pickerItemTextDisabled,
                    ]}>
                      {minute.toString().padStart(2, '0')}
                    </ThemedText>
                  </TouchableOpacity>
                );
                })}
              </ScrollView>
            </View>
          </View>

          {/* Preview */}
          <View style={styles.preview}>
            <ThemedText style={styles.previewText}>
              {tempHour.toString().padStart(2, '0')}:{tempMinute.toString().padStart(2, '0')}
            </ThemedText>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#30A0E0',
    fontWeight: '600',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 10,
  },
  pickerScrollView: {
    height: 200,
    width: 80,
  },
  pickerItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    borderRadius: 6,
  },
  pickerItemSelected: {
    backgroundColor: '#30A0E0',
  },
  pickerItemDisabled: {
    backgroundColor: '#E5E7EB',
  },
  pickerItemText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2c3e50',
  },
  pickerItemTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  pickerItemTextDisabled: {
    color: '#9CA3AF',
    fontWeight: '500',
  },
  separator: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginHorizontal: 10,
  },
  preview: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    marginHorizontal: 20,
  },
  previewText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#30A0E0',
  },
});