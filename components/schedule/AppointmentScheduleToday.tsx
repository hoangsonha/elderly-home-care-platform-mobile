import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface Appointment {
  id: string;
  caregiverName: string;
  caregiverAvatar: string;
  timeSlot: string;
  status: 'completed' | 'upcoming' | 'in-progress';
  tasks: Task[];
  address: string;
  rating: number;
  isVerified: boolean;
}

export interface Task {
  id: string;
  name: string;
  completed: boolean;
  time: string;
  status?: 'completed' | 'failed' | 'pending';
}

interface AppointmentScheduleTodayProps {
  appointments: Appointment[];
}

export function AppointmentScheduleToday({ appointments }: AppointmentScheduleTodayProps) {
  const [expandedAppointment, setExpandedAppointment] = useState<string | null>(null);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Đã hoàn thành';
      case 'upcoming':
        return 'Đang tới';
      case 'in-progress':
        return 'Đang thực hiện';
      default:
        return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#27AE60'; // Xanh lá cho đã hoàn thành
      case 'in-progress':
        return '#4ECDC4'; // Xanh khác cho đang thực hiện
      case 'upcoming':
        return '#F39C12'; // Vàng cho sắp tới
      default:
        return '#95A5A6';
    }
  };

  const handleToggleDetails = (appointmentId: string) => {
    setExpandedAppointment(expandedAppointment === appointmentId ? null : appointmentId);
  };

  const getTaskColor = (task: Task, appointmentStatus: string, index: number) => {
    if (task.status === 'completed') {
      return '#27AE60'; // Xanh lá cho task đã hoàn thành
    } else if (task.status === 'failed') {
      return '#E74C3C'; // Đỏ cho task không hoàn thành
    } else if (task.status === 'pending') {
      return '#FFB84D'; // Cam cho task đang chờ
    } else if (task.completed) {
      return '#27AE60'; // Fallback cho task đã hoàn thành
    } else {
      return '#E74C3C'; // Fallback cho task chưa hoàn thành
    }
  };

  const handleAppointmentPress = (appointment: Appointment) => {
    // Navigate to hired detail page with appointment data
    router.push({
      pathname: '/hired-detail',
      params: {
        caregiverId: appointment.id,
        caregiverName: appointment.caregiverName,
        timeSlot: appointment.timeSlot,
        status: appointment.status,
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="calendar-outline" size={24} color="#2c3e50" />
          <ThemedText style={styles.title}>Lịch hẹn hôm nay</ThemedText>
        </View>
      </View>

      <View style={styles.appointmentsList}>
        {appointments.map((appointment) => {
          const isExpanded = expandedAppointment === appointment.id;
          const completedTasks = appointment.tasks.filter(task => task.completed).length;
          const totalTasks = appointment.tasks.length;
          
          return (
            <TouchableOpacity 
              key={appointment.id} 
              style={styles.appointmentCard}
              onPress={() => handleAppointmentPress(appointment)}
              activeOpacity={0.7}
            >
              <View style={styles.appointmentHeader}>
                <View style={styles.caregiverInfo}>
                  <View style={styles.leftSection}>
                    <View style={styles.infoRow}>
                      <View style={styles.avatarContainer}>
                        <ThemedText style={styles.avatarText}>
                          {appointment.caregiverName.charAt(0)}
                        </ThemedText>
                      </View>
                      <View style={styles.infoColumn}>
                        <View style={styles.nameRow}>
                          <ThemedText style={styles.caregiverName}>
                            {appointment.caregiverName}
                          </ThemedText>
                          {appointment.isVerified && (
                            <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
                          )}
                        </View>
                        <ThemedText style={styles.timeSlot}>
                          {appointment.timeSlot}
                        </ThemedText>
                        <View style={styles.ratingRow}>
                          <Ionicons name="star" size={12} color="#F39C12" />
                          <ThemedText style={styles.ratingText}>
                            {appointment.rating.toFixed(1)}
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                    <View style={styles.addressRow}>
                      <Ionicons name="location-outline" size={12} color="#7f8c8d" />
                      <ThemedText style={styles.addressText}>
                        {appointment.address}
                      </ThemedText>
                    </View>
                  </View>
                  
                  <View style={styles.rightSection}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
                      <ThemedText style={styles.statusText}>
                        {getStatusText(appointment.status)}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.viewDetailsButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleToggleDetails(appointment.id);
                }}
              >
                <ThemedText style={styles.viewDetailsText}>Xem chi tiết</ThemedText>
                <Ionicons 
                  name={isExpanded ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color="#4ECDC4" 
                />
              </TouchableOpacity>

              {/* Expanded Task Details */}
              {isExpanded && (
                <View style={styles.expandedContent}>
                  <View style={styles.progressHeader}>
                    <ThemedText style={styles.progressText}>
                      {completedTasks}/{totalTasks} Hoàn thành
                    </ThemedText>
                  </View>
                  
                  <View style={styles.tasksContainer}>
                    <View style={styles.timeline}>
                      {appointment.tasks.map((task, index) => (
                        <View key={task.id} style={styles.taskItem}>
                          <View style={styles.taskTimeline}>
                            <View style={[
                              styles.timelineDot, 
                              { backgroundColor: getTaskColor(task, appointment.status, index) }
                            ]} />
                            {index < appointment.tasks.length - 1 && (
                              <View style={styles.timelineLine} />
                            )}
                          </View>
                          
                          <View style={[
                            styles.taskCard,
                            { backgroundColor: getTaskColor(task, appointment.status, index) }
                          ]}>
                            <View style={styles.taskContent}>
                              <ThemedText style={styles.taskName}>{task.name}</ThemedText>
                              <ThemedText style={styles.taskTime}>{task.time}</ThemedText>
                            </View>
                            
                            <View style={styles.taskCheckbox}>
                              {task.status === 'completed' ? (
                                <Ionicons name="checkmark-circle" size={24} color="#27AE60" />
                              ) : task.status === 'failed' ? (
                                <Ionicons name="close-circle" size={24} color="#E74C3C" />
                              ) : task.status === 'pending' ? (
                                <View style={styles.pendingCircle} />
                              ) : task.completed ? (
                                <Ionicons name="checkmark-circle" size={24} color="#27AE60" />
                              ) : (
                                <View style={styles.uncheckedCircle} />
                              )}
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 8,
  },
  viewHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
  },
  viewHistoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4ECDC4',
    marginRight: 4,
  },
  appointmentsList: {
    gap: 8,
  },
  appointmentCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginHorizontal: 0,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  caregiverInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    marginTop: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  caregiverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginRight: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoColumn: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  timeSlot: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  addressText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 4,
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#F39C12',
    fontWeight: '600',
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  viewDetailsText: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  progressHeader: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  tasksContainer: {
    marginLeft: 20,
  },
  timeline: {
    position: 'relative',
  },
  taskItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  taskTimeline: {
    alignItems: 'center',
    marginRight: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  timelineLine: {
    width: 2,
    height: 40,
    backgroundColor: '#e0e0e0',
    marginLeft: 5,
  },
  taskCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskContent: {
    flex: 1,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  taskTime: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  taskCheckbox: {
    marginLeft: 12,
  },
  uncheckedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
  },
  pendingCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFB84D',
  },
});
