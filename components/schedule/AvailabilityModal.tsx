import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { updateAppointmentStatus } from "@/data/appointmentStore";
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
  const [isBusy, setIsBusy] = useState(false); // Checkbox để set bận cả ngày
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

  // Check if two time ranges overlap
  const timeRangesOverlap = (
    start1: string, 
    end1: string, 
    start2: string, 
    end2: string
  ): boolean => {
    const parseTime = (time: string): number => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes; // Convert to minutes since midnight
    };

    const start1Min = parseTime(start1);
    const end1Min = parseTime(end1);
    const start2Min = parseTime(start2);
    const end2Min = parseTime(end2);

    // Check if ranges overlap
    return start1Min < end2Min && start2Min < end1Min;
  };

  // Parse time from string like "8:00 - 16:00" to {start: "08:00", end: "16:00"}
  const parseAppointmentTime = (timeStr: string): { start: string; end: string } | null => {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
    if (!match) return null;
    
    const startHour = match[1].padStart(2, "0");
    const startMin = match[2];
    const endHour = match[3].padStart(2, "0");
    const endMin = match[4];
    
    return {
      start: `${startHour}:${startMin}`,
      end: `${endHour}:${endMin}`,
    };
  };

  const checkConflictingSchedule = () => {
    const conflictingAppointments: any[] = [];
    
    // Generate all dates that will be affected by this availability
    const affectedDates: Date[] = [];
    
    if (frequency === "Không lặp lại") {
      affectedDates.push(new Date(startDate));
    } else {
      // Weekly recurring - generate dates for 1 year or until endDate
      const maxDate = endDate 
        ? new Date(endDate) 
        : new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
      const currentCheckDate = new Date(startDate);
      
      while (currentCheckDate <= maxDate) {
        const dayOfWeek = currentCheckDate.getDay();
        if (selectedDays.includes(dayOfWeek)) {
          affectedDates.push(new Date(currentCheckDate));
        }
        currentCheckDate.setDate(currentCheckDate.getDate() + 1);
      }
    }

    // Check each appointment against affected dates
    existingSchedule.forEach((appointment) => {
      const appointmentDate = new Date(appointment.date);
      const appointmentDateStr = `${appointmentDate.getDate()}-${appointmentDate.getMonth()}-${appointmentDate.getFullYear()}`;
      
      // Check if appointment date is in affected dates
      const isDateAffected = affectedDates.some((date) => {
        const dateStr = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
        return dateStr === appointmentDateStr;
      });

      if (!isDateAffected) return;

      // If full day available, no conflict
      if (isFullDay) return;

      // Parse appointment time
      const appointmentTime = parseAppointmentTime(appointment.time);
      if (!appointmentTime) return;

      // Check if appointment time is FULLY contained within available time slots
      // An appointment conflicts if ANY part of it falls outside available slots
      const parseTime = (time: string): number => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes; // Convert to minutes since midnight
      };

      const aptStart = parseTime(appointmentTime.start);
      const aptEnd = parseTime(appointmentTime.end);

      // Check if appointment is fully covered by available time slots
      // Strategy: Check if every minute of the appointment is within at least one slot
      let isFullyCovered = false;

      // First, check if appointment is fully within a single slot
      for (const slot of timeSlots) {
        const slotStart = parseTime(slot.startTime);
        const slotEnd = parseTime(slot.endTime);
        
        // If appointment is fully within this slot, it's covered
        if (aptStart >= slotStart && aptEnd <= slotEnd) {
          isFullyCovered = true;
          break;
        }
      }

      // If not covered by a single slot, check if multiple slots can cover it
      if (!isFullyCovered && timeSlots.length > 1) {
        // Sort slots by start time
        const sortedSlots = [...timeSlots].sort((a, b) => 
          parseTime(a.startTime) - parseTime(b.startTime)
        );
        
        // Merge overlapping/consecutive slots to create continuous ranges
        const mergedRanges: { start: number; end: number }[] = [];
        for (const slot of sortedSlots) {
          const slotStart = parseTime(slot.startTime);
          const slotEnd = parseTime(slot.endTime);
          
          if (mergedRanges.length === 0) {
            mergedRanges.push({ start: slotStart, end: slotEnd });
          } else {
            const lastRange = mergedRanges[mergedRanges.length - 1];
            // If this slot overlaps or is adjacent to the last range, merge them
            if (slotStart <= lastRange.end) {
              lastRange.end = Math.max(lastRange.end, slotEnd);
            } else {
              mergedRanges.push({ start: slotStart, end: slotEnd });
            }
          }
        }
        
        // Check if appointment is fully within any merged range
        for (const range of mergedRanges) {
          if (aptStart >= range.start && aptEnd <= range.end) {
            isFullyCovered = true;
            break;
          }
        }
      }

      // If appointment is not fully covered by available slots, it conflicts
      if (!isFullyCovered) {
        conflictingAppointments.push(appointment);
      }
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

    if (!startDate) {
      Alert.alert("Lỗi", "Vui lòng chọn ngày áp dụng");
      return;
    }

    // If isBusy is checked, handle busy mode
    if (isBusy) {
      // Check for conflicting appointments
      const conflicts = checkConflictingScheduleForBusy();
      if (conflicts.length > 0) {
        Alert.alert(
          "Cảnh báo lịch hẹn",
          `Bạn có ${conflicts.length} lịch hẹn trong các ngày bạn muốn set là bận:\n\n${conflicts
            .map(
              (apt) =>
                `• ${apt.name} - ${apt.time} (${apt.date.getDate()}/${
                  apt.date.getMonth() + 1
                }/${apt.date.getFullYear()})`
            )
            .join("\n")}\n\nNếu bạn set lịch bận, các lịch hẹn này sẽ bị hủy. Bạn có chắc chắn muốn tiếp tục không?`,
          [
            {
              text: "Không",
              style: "cancel",
            },
            {
              text: "Có, hủy các lịch hẹn",
              style: "destructive",
              onPress: () => {
                // Cancel all conflicting appointments
                conflicts.forEach((apt) => {
                  updateAppointmentStatus(apt.id, "cancelled");
                });
                Alert.alert(
                  "Đã hủy lịch hẹn",
                  `Đã hủy ${conflicts.length} lịch hẹn và thiết lập lịch bận thành công.`,
                  [{ text: "OK" }]
                );
                saveAvailability();
              },
            },
          ]
        );
        return;
      }
      saveAvailability();
      return;
    }

    // If not busy, validate time slots
    if (!isFullDay && timeSlots.length === 0) {
      Alert.alert("Lỗi", "Vui lòng thêm ít nhất một khung giờ rảnh hoặc chọn 'Cả ngày' hoặc 'Bận cả ngày'");
      return;
    }

    // Check for conflicting schedule
    const conflicts = checkConflictingSchedule();
    if (conflicts.length > 0) {
      Alert.alert(
        "Cảnh báo lịch hẹn",
        `Bạn có ${conflicts.length} lịch hẹn trong khoảng thời gian bạn đang set là bận:\n\n${conflicts
          .map(
            (apt) =>
              `• ${apt.name} - ${apt.time} (${apt.date.getDate()}/${
                apt.date.getMonth() + 1
              }/${apt.date.getFullYear()})`
          )
          .join("\n")}\n\nNếu bạn set lịch bận trong khoảng thời gian này, các lịch hẹn sẽ bị hủy. Bạn có chắc chắn muốn tiếp tục không?`,
        [
          {
            text: "Không",
            style: "cancel",
          },
          {
            text: "Có, hủy các lịch hẹn",
            style: "destructive",
            onPress: () => {
              // Cancel all conflicting appointments
              conflicts.forEach((apt) => {
                updateAppointmentStatus(apt.id, "cancelled");
              });
              Alert.alert(
                "Đã hủy lịch hẹn",
                `Đã hủy ${conflicts.length} lịch hẹn và thiết lập lịch rảnh thành công.`,
                [{ text: "OK" }]
              );
              saveAvailability();
            },
          },
        ]
      );
      return;
    }

    saveAvailability();
  };

  const checkConflictingScheduleForBusy = () => {
    const conflictingAppointments: any[] = [];
    
    // Generate all dates that will be marked as busy
    const affectedDates: Date[] = [];
    
    if (frequency === "Không lặp lại") {
      affectedDates.push(new Date(startDate));
    } else {
      // Weekly recurring - generate dates for 1 year or until endDate
      const maxDate = endDate 
        ? new Date(endDate) 
        : new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
      const currentCheckDate = new Date(startDate);
      
      while (currentCheckDate <= maxDate) {
        const dayOfWeek = currentCheckDate.getDay();
        if (selectedDays.includes(dayOfWeek)) {
          affectedDates.push(new Date(currentCheckDate));
        }
        currentCheckDate.setDate(currentCheckDate.getDate() + 1);
      }
    }

    // Check each appointment against affected dates
    existingSchedule.forEach((appointment) => {
      const appointmentDate = new Date(appointment.date);
      const appointmentDateStr = `${appointmentDate.getDate()}-${appointmentDate.getMonth()}-${appointmentDate.getFullYear()}`;
      
      // Check if appointment date is in affected dates
      const isDateAffected = affectedDates.some((date) => {
        const dateStr = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
        return dateStr === appointmentDateStr;
      });

      if (isDateAffected) {
        conflictingAppointments.push(appointment);
      }
    });

    return conflictingAppointments;
  };

  const saveAvailability = () => {
    const data = {
      isBusy, // true if user wants to mark as busy
      frequency,
      selectedDays,
      timeSlots: isBusy ? [] : timeSlots,
      startDate,
      endDate,
      isFullDay: isBusy ? false : isFullDay,
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
                <View style={{ flexDirection: "row", gap: 16 }}>
                  <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                    onPress={() => {
                      setIsFullDay(!isFullDay);
                      if (!isFullDay) setIsBusy(false); // Nếu chọn cả ngày rảnh thì bỏ chọn bận
                    }}
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
                  
                  <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                    onPress={() => {
                      setIsBusy(!isBusy);
                      if (!isBusy) setIsFullDay(false); // Nếu chọn bận thì bỏ chọn cả ngày rảnh
                    }}
                  >
                    <View style={[
                      styles.checkbox,
                      isBusy && styles.checkboxCheckedBusy
                    ]}>
                      {isBusy && (
                        <MaterialCommunityIcons
                          name="check"
                          size={16}
                          color="#FFFFFF"
                        />
                      )}
                    </View>
                    <Text style={{ fontSize: 14, color: "#64748B" }}>Bận cả ngày</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {!isFullDay && !isBusy && (
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
              
              {/* Info for busy mode */}
              {isBusy && (
                <View style={styles.busyInfoBox}>
                  <MaterialCommunityIcons name="information" size={20} color="#F59E0B" />
                  <Text style={styles.busyInfoText}>
                    Bạn sẽ đánh dấu các ngày đã chọn là bận cả ngày. Nếu có lịch hẹn trong các ngày này, bạn sẽ được hỏi xác nhận trước khi hủy.
                  </Text>
                </View>
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

            {/* Đến ngày - Only show if frequency is "Hằng tuần" */}
            {frequency === "Hằng tuần" && (
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
            )}
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
              <Text style={styles.saveButtonText}>
                {isBusy ? "Lưu lịch bận" : "Lưu lịch rảnh"}
              </Text>
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
  checkboxCheckedBusy: {
    backgroundColor: "#EF4444",
    borderColor: "#EF4444",
  },
  busyInfoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FCD34D",
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  busyInfoText: {
    flex: 1,
    fontSize: 14,
    color: "#92400E",
    lineHeight: 20,
  },
});
