import React, { useCallback, useState } from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { TimeRangePicker } from '@/components/ui/TimeRangePicker';

interface TimeSlotGroup {
  id: string;
  days: string[];
  timeSlots: { slot: string; start: string; end: string }[];
}

interface WorkTimeSelectorFromAIProps {
  timeSlotGroups: TimeSlotGroup[];
  onTimeSlotGroupsChange: (groups: TimeSlotGroup[]) => void;
}

export function WorkTimeSelectorFromAI({
  timeSlotGroups,
  onTimeSlotGroupsChange,
}: WorkTimeSelectorFromAIProps) {
  const [showCustomTimePicker, setShowCustomTimePicker] = useState(false);
  const [showTimeSelectionUI, setShowTimeSelectionUI] = useState(false);
  const [tempSelectedDays, setTempSelectedDays] = useState<string[]>([]);
  const [tempSelectedTimeSlots, setTempSelectedTimeSlots] = useState<string[]>([]);
  const [tempSpecificTimeRanges, setTempSpecificTimeRanges] = useState<{ start: string; end: string }[]>([]);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [duplicateMessage, setDuplicateMessage] = useState<string>('');

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
    if (tempSelectedDays.includes(dayId)) {
      setTempSelectedDays(tempSelectedDays.filter(id => id !== dayId));
    } else {
      setTempSelectedDays([...tempSelectedDays, dayId]);
    }
  };

  const handleTimeSlotToggle = (slotId: string) => {
    if (slotId === 'custom') {
      if (showCustomTimePicker) {
        // Bấm lần 2: bỏ chọn và chỉ xóa custom ranges, giữ predefined ranges
        setShowCustomTimePicker(false);
        // Chỉ giữ lại predefined ranges, xóa custom ranges
        updateTempSpecificTimeRanges(tempSelectedTimeSlots);
        // Bỏ chọn nút Khác
        setTempSelectedTimeSlots(tempSelectedTimeSlots.filter(id => id !== 'custom'));
      } else {
        // Bấm lần 1: mở custom time picker và chọn nút Khác
        setShowCustomTimePicker(true);
        setTempSelectedTimeSlots([...tempSelectedTimeSlots, 'custom']);
      }
      return;
    }

    let newSelectedTimeSlots;
    if (tempSelectedTimeSlots.includes(slotId)) {
      newSelectedTimeSlots = tempSelectedTimeSlots.filter(id => id !== slotId);
    } else {
      newSelectedTimeSlots = [...tempSelectedTimeSlots, slotId];
    }
    
    setTempSelectedTimeSlots(newSelectedTimeSlots);
    
    // Cập nhật specificTimeRanges dựa trên selectedTimeSlots
    updateTempSpecificTimeRanges(newSelectedTimeSlots);
  };


  const updateTempSpecificTimeRanges = useCallback((timeSlots: string[]) => {
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

    setTempSpecificTimeRanges(newRanges);
  }, []);

  const handleAddTimeSlot = () => {
    // Reset temp states khi mở UI
    setTempSelectedDays([]);
    setTempSelectedTimeSlots([]);
    setTempSpecificTimeRanges([]);
    setShowCustomTimePicker(false);
    setEditingGroupId(null); // Reset editing state
    setShowTimeSelectionUI(true);
  };

  const checkForOverlaps = () => {
    // Kiểm tra overlap giữa các khung giờ mới với các group hiện có
    for (const tempDay of tempSelectedDays) {
      for (const tempTimeRange of tempSpecificTimeRanges) {
        for (const group of timeSlotGroups || []) {
          // Bỏ qua group đang được edit
          if (editingGroupId && group.id === editingGroupId) {
            continue;
          }
          
          // Kiểm tra nếu ngày trùng với group này
          if (group.days.includes(tempDay)) {
            // Kiểm tra overlap với các time slots trong group
            for (const existingTimeSlot of group.timeSlots) {
              if (isTimeOverlap(tempTimeRange, existingTimeSlot)) {
                const dayLabel = weekDays.find(d => d.id === tempDay)?.label || tempDay;
                
                setDuplicateMessage(`Khung giờ ${dayLabel} (${tempTimeRange.start}-${tempTimeRange.end}) trùng với khung giờ hiện có`);
                return true;
              }
            }
          }
        }
      }
    }
    
    setDuplicateMessage('');
    return false;
  };

  const isTimeOverlap = (range1: { start: string; end: string }, range2: { start: string; end: string }) => {
    const start1 = timeToMinutes(range1.start);
    const end1 = timeToMinutes(range1.end);
    const start2 = timeToMinutes(range2.start);
    const end2 = timeToMinutes(range2.end);
    
    return start1 < end2 && start2 < end1;
  };

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const handleSaveTimeSelection = () => {
    // Kiểm tra overlap trước khi lưu
    if (checkForOverlaps()) {
      return; // Không lưu nếu có overlap
    }

    if (editingGroupId) {
      // Edit mode: thay thế hoàn toàn group hiện có
      const newGroups = (timeSlotGroups || []).map(group => {
        if (group.id === editingGroupId) {
          // Thay thế hoàn toàn time slots mới
          const newTimeSlots = tempSelectedTimeSlots.map((slot, index) => ({
            slot,
            start: tempSpecificTimeRanges[index].start,
            end: tempSpecificTimeRanges[index].end
          }));
          return { ...group, timeSlots: newTimeSlots };
        }
        return group;
      });
      
      onTimeSlotGroupsChange(newGroups);
      setEditingGroupId(null);
    } else {
      // Add mode: tạo group mới
      const newGroup: TimeSlotGroup = {
        id: `group_${Date.now()}`,
        days: tempSelectedDays,
        timeSlots: tempSelectedTimeSlots.map((slot, index) => ({
          slot,
          start: tempSpecificTimeRanges[index].start,
          end: tempSpecificTimeRanges[index].end
        }))
      };
      
      onTimeSlotGroupsChange([...(timeSlotGroups || []), newGroup]);
    }

    // Close UI
    setShowTimeSelectionUI(false);
    setDuplicateMessage('');
  };

  const handleEditTimeSlot = (groupId: string) => {
    // Lấy dữ liệu của group cần edit
    const groupToEdit = (timeSlotGroups || []).find(g => g.id === groupId);
    if (!groupToEdit) return;

    // Set temp states với dữ liệu cần edit
    setTempSelectedDays(groupToEdit.days);
    setTempSelectedTimeSlots(groupToEdit.timeSlots.map(ts => ts.slot));
    setTempSpecificTimeRanges(groupToEdit.timeSlots.map(ts => ({ start: ts.start, end: ts.end })));
    
    // Mở UI để edit
    setShowTimeSelectionUI(true);
    
    // Lưu groupId để biết đang edit group nào
    setEditingGroupId(groupId);
  };

  const handleDeleteTimeSlot = (groupId: string) => {
    // Xóa group
    const newGroups = (timeSlotGroups || []).filter(g => g.id !== groupId);
    onTimeSlotGroupsChange(newGroups);
  };


  return (
    <View style={styles.container}>
      {/* Add Time Slot Button - chỉ hiện khi chưa có UI chọn */}
      {!showTimeSelectionUI && (
        <TouchableOpacity
          style={styles.addTimeSlotButton}
          onPress={handleAddTimeSlot}
        >
          <ThemedText style={styles.addTimeSlotButtonText}>Thêm thời gian làm việc</ThemedText>
        </TouchableOpacity>
      )}

      {/* Time Selection UI - hiện khi bấm nút "Thêm" */}
      {showTimeSelectionUI && (
        <View style={styles.timeSelectionContainer}>
          {/* Original Day Selection */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <ThemedText style={styles.inputLabel}>Chọn ngày cần chăm sóc</ThemedText>
              <ThemedText style={styles.requiredMark}>*</ThemedText>
            </View>
            <View style={styles.daysContainer}>
              {weekDays.map((day) => (
                <TouchableOpacity
                  key={day.id}
                  style={[
                    styles.dayButton,
                    tempSelectedDays.includes(day.id) && styles.dayButtonSelected
                  ]}
                  onPress={() => handleDayToggle(day.id)}
                >
                  <ThemedText style={[
                    styles.dayButtonText,
                    tempSelectedDays.includes(day.id) && styles.dayButtonTextSelected
                  ]}>
                    {day.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <ThemedText style={styles.inputLabel}>Chọn khung thời gian</ThemedText>
              <ThemedText style={styles.requiredMark}>*</ThemedText>
            </View>
            <View style={styles.timeSlotsContainer}>
              {timeSlots.map((time) => (
                <TouchableOpacity
                  key={time.id}
                  style={[
                    styles.timeSlotButton,
                    (time.id === 'custom' ? showCustomTimePicker : tempSelectedTimeSlots.includes(time.id)) && styles.timeSlotButtonSelected
                  ]}
                  onPress={() => handleTimeSlotToggle(time.id)}
                >
                  <ThemedText style={[
                    styles.timeSlotButtonText,
                    (time.id === 'custom' ? showCustomTimePicker : tempSelectedTimeSlots.includes(time.id)) && styles.timeSlotButtonTextSelected
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
              timeRanges={tempSpecificTimeRanges
                .filter((range, index) => {
                  // Chỉ hiển thị custom ranges (không phải predefined)
                  const predefinedRanges = {
                    'morning': { start: '06:00', end: '12:00' },
                    'afternoon': { start: '12:00', end: '18:00' },
                    'evening': { start: '18:00', end: '22:00' },
                    'overnight': { start: '22:00', end: '06:00' },
                  };
                  return !tempSelectedTimeSlots.some(slot => {
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
                const predefinedRanges = tempSelectedTimeSlots.map(slot => {
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
                setTempSpecificTimeRanges(allRanges);
                // KHÔNG đóng modal, giữ showCustomTimePicker = true
              }}
              maxRanges={5}
              selectedTimeSlots={tempSelectedTimeSlots}
            />
          )}

          {/* Hiển thị khung giờ đang chọn trước khi Thêm */}
          {(tempSelectedDays.length > 0 || tempSelectedTimeSlots.length > 0) && (
            <View style={styles.previewContainer}>
              <ThemedText style={styles.previewTitle}>Khung giờ đang chọn:</ThemedText>
              
              {/* Hiển thị ngày đã chọn */}
              {tempSelectedDays.length > 0 && (
                <View style={styles.previewItem}>
                  <ThemedText style={styles.previewLabel}>Ngày:</ThemedText>
                  <ThemedText style={styles.previewValue}>
                    {tempSelectedDays.map(dayId => {
                      const day = weekDays.find(d => d.id === dayId);
                      return day ? day.label : '';
                    }).filter(Boolean).join(', ')}
                  </ThemedText>
                </View>
              )}
              
              {/* Hiển thị khung giờ đã chọn */}
              {tempSelectedTimeSlots.length > 0 && (
                <View style={styles.previewItem}>
                  <ThemedText style={styles.previewLabel}>Khung giờ:</ThemedText>
                  <ThemedText style={styles.previewValue}>
                    {tempSelectedTimeSlots.filter(slot => slot !== 'custom').map(slot => {
                      const timeSlotRanges = {
                        'morning': 'Sáng (06:00-12:00)',
                        'afternoon': 'Chiều (12:00-18:00)',
                        'evening': 'Tối (18:00-22:00)',
                        'overnight': 'Đêm (22:00-06:00)',
                      };
                      return timeSlotRanges[slot as keyof typeof timeSlotRanges] || slot;
                    }).join(', ')}
                    {tempSelectedTimeSlots.includes('custom') && tempSpecificTimeRanges.length > 0 && (
                      <ThemedText style={styles.previewValue}>
                        {tempSelectedTimeSlots.filter(slot => slot !== 'custom').length > 0 ? ', ' : ''}
                        Khác: {tempSpecificTimeRanges.map(range => `${range.start}-${range.end}`).join(', ')}
                      </ThemedText>
                    )}
                  </ThemedText>
                </View>
              )}
            </View>
          )}

          {/* Duplicate Message */}
          {duplicateMessage && (
            <View style={styles.duplicateMessageContainer}>
              <ThemedText style={styles.duplicateMessageText}>{duplicateMessage}</ThemedText>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowTimeSelectionUI(false);
                setDuplicateMessage('');
              }}
            >
              <ThemedText style={styles.cancelButtonText}>Hủy</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                (tempSelectedDays.length === 0 || tempSelectedTimeSlots.length === 0) && styles.confirmButtonDisabled
              ]}
              onPress={handleSaveTimeSelection}
              disabled={tempSelectedDays.length === 0 || tempSelectedTimeSlots.length === 0}
            >
              <ThemedText style={styles.confirmButtonText}>
                {editingGroupId !== null ? 'Cập nhật' : 'Thêm'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Hiển thị khung giờ đã chọn - chỉ hiện khi có dữ liệu */}
      {timeSlotGroups && timeSlotGroups.length > 0 && (
        <View style={styles.selectedRangesContainer}>
          <ThemedText style={styles.selectedRangesTitle}>Khung giờ đã chọn:</ThemedText>
          
          {/* Tất cả time slot groups - hiển thị thứ và khung giờ với nút edit/xóa */}
          {timeSlotGroups.map((group, index) => {
            // Lấy labels của các ngày
            const dayLabels = group.days.map(dayId => 
              weekDays.find(d => d.id === dayId)?.label || dayId
            );

            return (
              <View key={`group-${group.id}`} style={styles.selectedRangeItem}>
                <TouchableOpacity
                  style={styles.selectedRangeContent}
                  onPress={() => handleEditTimeSlot(group.id)}
                  activeOpacity={0.7}
                >
                  <ThemedText style={styles.selectedRangeText}>
                    Khung {index + 1}: {dayLabels.join(', ')}
                  </ThemedText>
                  {/* Hiển thị các time slots */}
                  {group.timeSlots.map((timeSlot, slotIndex) => (
                    <ThemedText key={slotIndex} style={styles.timeSlotText}>
                      {timeSlot.start} - {timeSlot.end}
                    </ThemedText>
                  ))}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteTimeSlot(group.id)}
                  activeOpacity={0.7}
                >
                  <ThemedText style={styles.deleteButtonText}>×</ThemedText>
                </TouchableOpacity>
              </View>
            );
          })}
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
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requiredMark: {
    color: '#dc3545',
    fontSize: 16,
    marginLeft: 2,
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
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedRangeContent: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  selectedRangeText: {
    fontSize: 13,
    color: '#4ECDC4',
    fontWeight: '500',
  },
  timeSlotText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#7F8C8D',
    marginLeft: 8,
    marginTop: 2,
  },
  deleteButton: {
    backgroundColor: '#E74C3C',
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
    lineHeight: 8,
  },
  removeButton: {
    padding: 4,
  },
  flexibleTimeSlotsContainer: {
    marginBottom: 20,
  },
  flexibleTimeSlotsScroll: {
    marginTop: 8,
  },
  flexibleTimeSlotCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 120,
  },
  flexibleTimeSlotContent: {
    flex: 1,
  },
  flexibleTimeSlotDay: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 2,
  },
  flexibleTimeSlotTime: {
    fontSize: 12,
    color: '#1976D2',
    marginBottom: 2,
  },
  flexibleTimeSlotRange: {
    fontSize: 10,
    color: '#1976D2',
    opacity: 0.8,
  },
  flexibleRemoveButton: {
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  timeSlotTimeText: {
    fontSize: 10,
    color: '#6C757D',
    opacity: 0.8,
    marginTop: 2,
  },
  timeSlotTimeTextSelected: {
    color: 'white',
    opacity: 0.9,
  },
  addFlexibleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498DB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
    marginBottom: 20,
  },
  addFlexibleButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  addFlexibleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  addTimeSlotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498DB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
    marginBottom: 16,
  },
  addTimeSlotButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  addTimeSlotButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  flexibleSelectionContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  flexibleSelectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  flexibleActionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#6C757D',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#28A745',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    maxHeight: 400,
    paddingHorizontal: 20,
  },
  modalActionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  timeSelectionContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  timeSelectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  duplicateMessageContainer: {
    backgroundColor: '#F8D7DA',
    borderColor: '#F5C6CB',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginTop: 16,
  },
  duplicateMessageText: {
    color: '#721C24',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  previewContainer: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  previewItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  previewLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2C3E50',
    minWidth: 80,
  },
  previewValue: {
    fontSize: 13,
    color: '#4ECDC4',
    fontWeight: '500',
    flex: 1,
  },
});

