import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
    Alert,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface AvailabilityModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  existingSchedule?: any[];
}

export default function AvailabilityModal({
  visible,
  onClose,
  onSave,
  existingSchedule = [],
}: AvailabilityModalProps) {
  const [frequency, setFrequency] = useState("Hằng tuần");
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [isFullDay, setIsFullDay] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { startTime: "08:00", endTime: "12:00" },
    { startTime: "14:00", endTime: "18:00" },
  ]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState<{
    slotIndex: number;
    field: "startTime" | "endTime";
  } | null>(null);

  const frequencyOptions = ["Không lặp lại", "Hằng tuần"];

  const days = [
    { id: 0, label: "CN" },
    { id: 1, label: "T2" },
    { id: 2, label: "T3" },
    { id: 3, label: "T4" },
    { id: 4, label: "T5" },
    { id: 5, label: "T6" },
    { id: 6, label: "T7" },
  ];

  const toggleDay = (dayId: number) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter((id) => id !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
  };

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, { startTime: "08:00", endTime: "12:00" }]);
  };

  const removeTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (
    index: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    const newSlots = [...timeSlots];
    newSlots[index][field] = value;
    setTimeSlots(newSlots);
  };

  // Convert time string "HH:MM" to Date object
  const timeStringToDate = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date;
  };

  // Convert Date object to time string "HH:MM"
  const dateToTimeString = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const checkConflictingSchedule = () => {
    // Check if there are any appointments from start date onwards
    const conflictingAppointments = existingSchedule.filter((appointment) => {
      return appointment.date >= startDate;
    });

    return conflictingAppointments;
  };

  const formatDate = (date: Date) => {
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const handleSave = () => {
    // Validation
    if (frequency === "Hằng tuần" && selectedDays.length === 0) {
      Alert.alert("Lỗi", "Vui lòng chọn ít nhất một ngày trong tuần");
      return;
    }

    if (!isFullDay && timeSlots.length === 0) {
      Alert.alert("Lỗi", "Vui lòng thêm ít nhất một khung giờ rảnh hoặc chọn 'Cả ngày'");
      return;
    }

    if (!startDate) {
      Alert.alert("Lỗi", "Vui lòng chọn ngày áp dụng");
      return;
    }

    // Check for conflicting schedule
    const conflicts = checkConflictingSchedule();
    if (conflicts.length > 0) {
      Alert.alert(
        "Cảnh báo lịch hẹn",
        `Bạn có ${conflicts.length} lịch hẹn từ ngày ${formatDate(startDate)} trở đi:\n\n${conflicts
          .map(
            (apt) =>
              `• ${apt.name} - ${apt.time} (${apt.date.getDate()}/${
                apt.date.getMonth() + 1
              }/${apt.date.getFullYear()})`
          )
          .join("\n")}\n\nCác lịch hẹn này vẫn phải được thực hiện. Bạn có muốn tiếp tục thiết lập lịch rảnh không?`,
        [
          {
            text: "Hủy",
            style: "cancel",
          },
          {
            text: "Tiếp tục",
            onPress: () => {
              saveAvailability();
            },
          },
        ]
      );
    } else {
      saveAvailability();
    }
  };

  const saveAvailability = () => {
    const data = {
      frequency,
      selectedDays,
      timeSlots,
      startDate,
      endDate,
      isFullDay,
    };
    onSave(data);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleRow}>
              <MaterialCommunityIcons
                name="bell-ring"
                size={24}
                color="#EF4444"
              />
              <Text style={styles.modalTitle}>Thiết lập lịch rảnh</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
          >
            {/* Lặp lại */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Lặp lại</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowFrequencyPicker(!showFrequencyPicker)}
              >
                <Text style={styles.dropdownText}>{frequency}</Text>
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={20}
                  color="#64748B"
                />
              </TouchableOpacity>

              {/* Frequency options */}
              {showFrequencyPicker && (
                <View style={styles.frequencyOptions}>
                  {frequencyOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.frequencyOption,
                        frequency === option && styles.frequencyOptionSelected,
                      ]}
                      onPress={() => {
                        setFrequency(option);
                        setShowFrequencyPicker(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.frequencyOptionText,
                          frequency === option &&
                            styles.frequencyOptionTextSelected,
                        ]}
                      >
                        {option}
                      </Text>
                      {frequency === option && (
                        <MaterialCommunityIcons
                          name="check"
                          size={20}
                          color="#3B82F6"
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Chọn ngày trong tuần - Only show if frequency is "Hằng tuần" */}
            {frequency === "Hằng tuần" && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Chọn ngày trong tuần</Text>
                <View style={styles.daysRow}>
                  {days.map((day) => (
                    <TouchableOpacity
                      key={day.id}
                      style={[
                        styles.dayButton,
                        selectedDays.includes(day.id) && styles.dayButtonSelected,
                      ]}
                      onPress={() => toggleDay(day.id)}
                    >
                      <Text
                        style={[
                          styles.dayButtonText,
                          selectedDays.includes(day.id) &&
                            styles.dayButtonTextSelected,
                        ]}
                      >
                        {day.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Khung giờ rảnh */}
            <View style={styles.section}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text style={styles.sectionLabel}>Khung giờ rảnh</Text>
                <TouchableOpacity
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                  onPress={() => setIsFullDay(!isFullDay)}
                >
                  <View style={[
                    styles.checkbox,
                    isFullDay && styles.checkboxChecked
                  ]}>
                    {isFullDay && (
                      <MaterialCommunityIcons
                        name="check"
                        size={16}
                        color="#FFFFFF"
                      />
                    )}
                  </View>
                  <Text style={{ fontSize: 14, color: "#64748B" }}>Cả ngày</Text>
                </TouchableOpacity>
              </View>

              {!isFullDay && (
                <>
                  {timeSlots.map((slot, index) => (
                    <View key={index} style={styles.timeSlotRow}>
                      <TouchableOpacity
                        style={styles.timeInput}
                        onPress={() =>
                          setShowTimePicker({ slotIndex: index, field: "startTime" })
                        }
                      >
                        <Text style={styles.timeInputText}>{slot.startTime}</Text>
                        <MaterialCommunityIcons
                          name="clock-outline"
                          size={20}
                          color="#64748B"
                        />
                      </TouchableOpacity>

                      <Text style={styles.timeSeparator}>-</Text>

                      <TouchableOpacity
                        style={styles.timeInput}
                        onPress={() =>
                          setShowTimePicker({ slotIndex: index, field: "endTime" })
                        }
                      >
                        <Text style={styles.timeInputText}>{slot.endTime}</Text>
                        <MaterialCommunityIcons
                          name="clock-outline"
                          size={20}
                          color="#64748B"
                        />
                      </TouchableOpacity>

                      {timeSlots.length > 1 && (
                        <TouchableOpacity
                          onPress={() => removeTimeSlot(index)}
                          style={styles.removeButton}
                        >
                          <MaterialCommunityIcons
                            name="close-circle"
                            size={20}
                            color="#EF4444"
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}

                  {showTimePicker && (
                    <DateTimePicker
                      value={timeStringToDate(
                        timeSlots[showTimePicker.slotIndex][showTimePicker.field]
                      )}
                      mode="time"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={(event, selectedTime) => {
                        setShowTimePicker(null);
                        if (selectedTime) {
                          updateTimeSlot(
                            showTimePicker.slotIndex,
                            showTimePicker.field,
                            dateToTimeString(selectedTime)
                          );
                        }
                      }}
                    />
                  )}

                  <TouchableOpacity style={styles.addButton} onPress={addTimeSlot}>
                    <MaterialCommunityIcons
                      name="plus"
                      size={20}
                      color="#3B82F6"
                    />
                    <Text style={styles.addButtonText}>Thêm khung giờ</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Áp dụng từ ngày */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Áp dụng từ ngày</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={styles.dateInputText}>{formatDate(startDate)}</Text>
                <MaterialCommunityIcons
                  name="calendar-blank"
                  size={20}
                  color="#64748B"
                />
              </TouchableOpacity>
              {showStartDatePicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, selectedDate) => {
                    setShowStartDatePicker(false);
                    if (selectedDate) {
                      setStartDate(selectedDate);
                    }
                  }}
                />
              )}
            </View>

            {/* Đến ngày */}
            <View style={styles.section}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={styles.sectionLabel}>Đến ngày (không bắt buộc)</Text>
                {endDate && (
                  <TouchableOpacity
                    onPress={() => setEndDate(null)}
                    style={{ padding: 4 }}
                  >
                    <Text style={{ color: "#EF4444", fontSize: 14, fontWeight: "600" }}>
                      Xóa
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={[styles.dateInputText, !endDate && { color: "#94A3B8" }]}>
                  {endDate ? formatDate(endDate) : "Không giới hạn"}
                </Text>
                <MaterialCommunityIcons
                  name="calendar-blank"
                  size={20}
                  color="#64748B"
                />
              </TouchableOpacity>
              {showEndDatePicker && (
                <DateTimePicker
                  value={endDate || startDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  minimumDate={startDate}
                  onChange={(event, selectedDate) => {
                    setShowEndDatePicker(false);
                    if (event.type === "set" && selectedDate) {
                      setEndDate(selectedDate);
                    }
                  }}
                />
              )}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="content-save"
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.saveButtonText}>Lưu lịch rảnh</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 12,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  dropdownText: {
    fontSize: 16,
    color: "#1E293B",
  },
  daysRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  dayButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  dayButtonSelected: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  dayButtonTextSelected: {
    color: "#FFFFFF",
  },
  timeSlotRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  timeInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    gap: 8,
  },
  timeInputText: {
    flex: 1,
    fontSize: 16,
    color: "#1E293B",
  },
  timeInputLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  timeSeparator: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "600",
  },
  removeButton: {
    padding: 4,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    borderRadius: 8,
    borderStyle: "dashed",
    gap: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B82F6",
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  dateInputText: {
    flex: 1,
    fontSize: 16,
    color: "#1E293B",
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  frequencyOptions: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    marginTop: 8,
    overflow: "hidden",
  },
  frequencyOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  frequencyOptionSelected: {
    backgroundColor: "#EFF6FF",
  },
  frequencyOptionText: {
    fontSize: 16,
    color: "#475569",
  },
  frequencyOptionTextSelected: {
    color: "#2196F3",
    fontWeight: "600",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
});
