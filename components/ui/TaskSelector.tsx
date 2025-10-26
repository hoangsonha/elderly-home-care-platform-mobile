import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { SimpleTimePicker } from '@/components/ui/SimpleTimePicker';


export interface Task {
  id: string;
  name: string;
  description: string;
  startTime?: string; // Optional start time
}

interface TaskSelectorProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  durationType?: string;
  durationValue?: string;
  startDate?: string;
  endDate?: string;
  workingTimeSlots?: string[]; // Khung giờ đã chọn
  selectedWorkingDays?: string[]; // Ngày trong tuần đã chọn
  onValidationError?: (message: string) => void; // Callback để hiển thị lỗi
}

export function TaskSelector({ 
  tasks, 
  onTasksChange, 
  durationType, 
  durationValue, 
  startDate, 
  endDate,
  workingTimeSlots = [],
  selectedWorkingDays = [],
  onValidationError
}: TaskSelectorProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    startTime: '',
  });


  // Tạo tất cả time slots từ 6h-23h (mỗi 15 phút)
  const generateAllTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 23; hour++) {
      for (let minute of [0, 15, 30, 45]) {
        if (hour === 23 && minute > 0) break; // Dừng ở 23:00
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeStr);
      }
    }
    return slots;
  };

  // Tạo time slots được chọn dựa trên workingTimeSlots
  const generateSelectedTimeSlots = () => {
    if (!workingTimeSlots || workingTimeSlots.length === 0) {
      return [];
    }

    const slots = [];
    workingTimeSlots.forEach(timeSlot => {
      // Kiểm tra timeSlot có tồn tại và có format đúng không
      if (!timeSlot || typeof timeSlot !== 'string' || !timeSlot.includes('-')) {
        console.warn('Invalid timeSlot:', timeSlot);
        return;
      }

      try {
        // timeSlot format: "06:00-12:00"
        const [startTime, endTime] = timeSlot.split('-');
        
        if (!startTime || !endTime) {
          console.warn('Invalid timeSlot format:', timeSlot);
          return;
        }

        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        
        // Kiểm tra tính hợp lệ của thời gian
        if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
          console.warn('Invalid time values in timeSlot:', timeSlot);
          return;
        }
        
        let currentHour = startHour;
        let currentMinute = startMinute;
        
        while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
          const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
          slots.push(timeStr);
          
          // Tăng 15 phút
          currentMinute += 15;
          if (currentMinute >= 60) {
            currentMinute = 0;
            currentHour++;
          }
        }
      } catch (error) {
        console.warn('Error processing timeSlot:', timeSlot, error);
      }
    });
    
    return slots;
  };

  const allTimeSlots = generateAllTimeSlots();
  const selectedTimeSlots = generateSelectedTimeSlots();

  const handleAddTask = () => {
    if (newTask.name && newTask.description) {
      const task: Task = {
        id: editingTask ? editingTask.id : Date.now().toString(),
        name: newTask.name,
        description: newTask.description,
        startTime: newTask.startTime,
      };

      if (editingTask) {
        // Edit existing task
        onTasksChange(tasks.map(t => t.id === editingTask.id ? task : t));
      } else {
        // Add new task
        onTasksChange([...tasks, task]);
      }

      // Reset form
      setNewTask({
        name: '',
        description: '',
        startTime: '',
      });
      setEditingTask(null);
      setShowAddModal(false);
    }
  };

  const handleOpenAddModal = () => {
    // Validation: Kiểm tra Thời gian làm việc và Thời gian thuê
    if (!selectedWorkingDays || selectedWorkingDays.length === 0) {
      onValidationError?.('Vui lòng chọn Thời gian làm việc trước khi thêm nhiệm vụ');
      return;
    }
    
    if (!workingTimeSlots || workingTimeSlots.length === 0) {
      onValidationError?.('Vui lòng chọn khung giờ trong Thời gian làm việc trước khi thêm nhiệm vụ');
      return;
    }
    
    if (!durationType || !durationValue) {
      onValidationError?.('Vui lòng chọn Thời gian thuê trước khi thêm nhiệm vụ');
      return;
    }

    setEditingTask(null);
    setShowAddModal(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setNewTask({
      name: task.name,
      description: task.description,
      startTime: task.startTime || '',
    });
    setShowAddModal(true);
  };

  const handleRemoveTask = (taskId: string) => {
    onTasksChange(tasks.filter(task => task.id !== taskId));
  };

  const handleStartTimeSelect = (time: string) => {
    setNewTask(prev => ({ ...prev, startTime: time }));
  };

  const handleTimePickerOpen = () => {
    setShowTimePicker(true);
  };

  const handleTimePickerClose = () => {
    setShowTimePicker(false);
  };

  return (
    <View style={styles.container}>
      {/* Add Task Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleOpenAddModal}
      >
        <Ionicons name="add" size={20} color="#4ECDC4" />
        <ThemedText style={styles.addButtonText}>
          Thêm nhiệm vụ cho khung giờ
        </ThemedText>
      </TouchableOpacity>

      {/* Tasks List */}
      {tasks && tasks.length > 0 && (
        <View style={styles.tasksContainer}>
          <ThemedText style={styles.tasksTitle}>Nhiệm vụ đã thêm:</ThemedText>
          {tasks.map((task) => (
            <View key={task.id} style={styles.taskItem}>
              <TouchableOpacity 
                style={styles.taskContent}
                onPress={() => handleEditTask(task)}
              >
                <ThemedText style={styles.taskName}>
                  {task.name}
                </ThemedText>
                <ThemedText style={styles.taskDescription}>
                  {task.description}
                </ThemedText>
                {task.startTime && (
                  <ThemedText style={styles.taskDetail}>
                    Giờ bắt đầu: {task.startTime}
                  </ThemedText>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeTaskButton}
                onPress={() => handleRemoveTask(task.id)}
              >
                <Ionicons name="close-circle" size={20} color="#dc3545" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Add Task Modal */}
      <Modal 
        visible={showAddModal} 
        animationType="slide" 
        transparent={false}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAddModal(false)}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              <ThemedText style={styles.modalTitle}>
                {editingTask ? 'Sửa nhiệm vụ' : 'Thêm nhiệm vụ'}
              </ThemedText>
              <View style={styles.placeholder} />
            </View>

            {/* Content */}
            <ScrollView 
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Task Name */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <ThemedText style={styles.inputLabel}>Tên nhiệm vụ</ThemedText>
                  <ThemedText style={styles.requiredMark}>*</ThemedText>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={newTask.name}
                  onChangeText={(text) => setNewTask(prev => ({ ...prev, name: text }))}
                  placeholder="Nhập tên nhiệm vụ..."
                  placeholderTextColor="#999"
                />
              </View>

              {/* Task Description */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <ThemedText style={styles.inputLabel}>Mô tả nhiệm vụ</ThemedText>
                  <ThemedText style={styles.requiredMark}>*</ThemedText>
                </View>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={newTask.description}
                  onChangeText={(text) => setNewTask(prev => ({ ...prev, description: text }))}
                  placeholder="Mô tả chi tiết nhiệm vụ cần thực hiện..."
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="#999"
                  textAlignVertical="top"
                />
              </View>

              {/* Start Time Selection (Optional) */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <ThemedText style={styles.inputLabel}>Giờ bắt đầu</ThemedText>
                  <ThemedText style={styles.optionalMark}>(Tùy chọn)</ThemedText>
                </View>
                <TouchableOpacity
                  style={styles.timePickerButton}
                  onPress={handleTimePickerOpen}
                >
                  <ThemedText style={[
                    styles.timePickerButtonText,
                    !newTask.startTime && styles.timePickerButtonTextPlaceholder
                  ]}>
                    {newTask.startTime || 'Chọn giờ bắt đầu'}
                  </ThemedText>
                  <Ionicons name="time-outline" size={20} color="#4ECDC4" />
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <ThemedText style={styles.cancelButtonText}>Hủy</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.addTaskButton,
                  (!newTask.name || !newTask.description) && styles.addTaskButtonDisabled,
                ]}
                onPress={handleAddTask}
                disabled={!newTask.name || !newTask.description}
              >
                <ThemedText style={[
                  styles.addTaskButtonText,
                  (!newTask.name || !newTask.description) && styles.addTaskButtonTextDisabled,
                ]}>
                  {editingTask ? 'Lưu' : 'Thêm'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Simple Time Picker Modal */}
      <SimpleTimePicker
        visible={showTimePicker}
        onClose={handleTimePickerClose}
        onTimeSelect={handleStartTimeSelect}
        selectedTime={newTask.startTime || '06:00'}
        availableTimes={selectedTimeSlots}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Remove flex: 1 to prevent layout issues
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4ECDC4',
    backgroundColor: 'white',
    marginBottom: 16,
  },
  addButtonText: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '500',
    marginLeft: 8,
  },
  tasksContainer: {
    marginBottom: 16,
  },
  tasksTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
    marginBottom: 4,
  },
  taskDetails: {
    marginTop: 4,
  },
  taskDetail: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  removeTaskButton: {
    padding: 4,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: 'white',
  },
  modalHeader: {
    backgroundColor: '#4ECDC4',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
  optionalMark: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
    marginLeft: 4,
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4ECDC4',
    backgroundColor: 'white',
  },
  timePickerButtonText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  timePickerButtonTextPlaceholder: {
    color: '#6c757d',
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
  textArea: {
    minHeight: 80,
    maxHeight: 120,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    gap: 12,
    backgroundColor: '#f8f9fa',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6c757d',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '600',
  },
  addTaskButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
  },
  addTaskButtonDisabled: {
    backgroundColor: '#e9ecef',
  },
  addTaskButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  addTaskButtonTextDisabled: {
    color: '#adb5bd',
  },
});