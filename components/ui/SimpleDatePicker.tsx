import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';

interface SimpleDatePickerProps {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: string) => void;
  selectedDate?: string;
}

export function SimpleDatePicker({ visible, onClose, onDateSelect, selectedDate }: SimpleDatePickerProps) {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  
  // Generate years (current year + next 2 years)
  const years = Array.from({ length: 3 }, (_, i) => currentYear + i);
  
  // Generate months
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // Generate days for selected month/year
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };
  
  const daysInSelectedMonth = getDaysInMonth(selectedYear, selectedMonth);
  const days = Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1);
  
  const handleConfirm = () => {
    const dateString = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    onDateSelect(dateString);
    onClose();
  };
  
  const isDateValid = (year: number, month: number, day: number) => {
    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    if (year === currentYear && month === currentMonth && day < currentDay) return false;
    return true;
  };
  
  const isValidSelection = isDateValid(selectedYear, selectedMonth, selectedDay);
  
  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Chọn ngày hẹn</ThemedText>
            <View style={styles.placeholder} />
          </View>
          
          {/* Date Pickers */}
          <View style={styles.pickerContainer}>
            {/* Year Picker */}
            <View style={styles.pickerSection}>
              <ThemedText style={styles.sectionTitle}>Năm</ThemedText>
              <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                {years.map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.pickerItem,
                      selectedYear === year && styles.pickerItemSelected
                    ]}
                    onPress={() => setSelectedYear(year)}
                  >
                    <ThemedText style={[
                      styles.pickerItemText,
                      selectedYear === year && styles.pickerItemTextSelected
                    ]}>
                      {year}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            {/* Month Picker */}
            <View style={styles.pickerSection}>
              <ThemedText style={styles.sectionTitle}>Tháng</ThemedText>
              <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                {months.map((month) => (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.pickerItem,
                      selectedMonth === month && styles.pickerItemSelected
                    ]}
                    onPress={() => {
                      setSelectedMonth(month);
                      // Reset day if it's invalid for new month
                      const maxDays = getDaysInMonth(selectedYear, month);
                      if (selectedDay > maxDays) {
                        setSelectedDay(1);
                      }
                    }}
                  >
                    <ThemedText style={[
                      styles.pickerItemText,
                      selectedMonth === month && styles.pickerItemTextSelected
                    ]}>
                      {month}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            {/* Day Picker */}
            <View style={styles.pickerSection}>
              <ThemedText style={styles.sectionTitle}>Ngày</ThemedText>
              <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                {days.map((day) => {
                  const isValid = isDateValid(selectedYear, selectedMonth, day);
                  return (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.pickerItem,
                        selectedDay === day && styles.pickerItemSelected,
                        !isValid && styles.pickerItemDisabled
                      ]}
                      onPress={() => isValid && setSelectedDay(day)}
                      disabled={!isValid}
                    >
                      <ThemedText style={[
                        styles.pickerItemText,
                        selectedDay === day && styles.pickerItemTextSelected,
                        !isValid && styles.pickerItemTextDisabled
                      ]}>
                        {day}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
          
          {/* Selected Date Display */}
          <View style={styles.selectedDateContainer}>
            <Ionicons name="calendar" size={20} color="#4ECDC4" />
            <ThemedText style={styles.selectedDateText}>
              {selectedDay}/{selectedMonth}/{selectedYear}
            </ThemedText>
          </View>
          
          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.confirmButton, !isValidSelection && styles.confirmButtonDisabled]} 
              onPress={handleConfirm}
              disabled={!isValidSelection}
            >
              <ThemedText style={[styles.confirmButtonText, !isValidSelection && styles.confirmButtonTextDisabled]}>
                Xác nhận
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 350,
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#4ECDC4',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  pickerContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
  },
  pickerSection: {
    flex: 1,
    marginHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  pickerScroll: {
    maxHeight: 200,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: '#4ECDC4',
  },
  pickerItemDisabled: {
    backgroundColor: '#f8f9fa',
    opacity: 0.5,
  },
  pickerItemText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  pickerItemTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  pickerItemTextDisabled: {
    color: '#adb5bd',
  },
  selectedDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdfa',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 8,
  },
  footer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  confirmButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#e9ecef',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  confirmButtonTextDisabled: {
    color: '#adb5bd',
  },
});
