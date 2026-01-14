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
  status: string; // Support all API status values
  tasks: Task[];
  address?: string;
  rating?: number;
  isVerified: boolean;
  elderlyName?: string; // Tên người già
  elderlyGender?: string; // Gender người già (MALE, FEMALE)
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
    const upperStatus = status.toUpperCase().replace(/-/g, '_');
    switch (upperStatus) {
      case 'CAREGIVER_APPROVED':
      case 'CAREGIVER-APPROVED':
        return 'Sắp tới';
      case 'IN_PROGRESS':
      case 'IN-PROGRESS':
        return 'Đang thực hiện';
      case 'COMPLETED':
        return 'Đã hoàn thành';
      case 'CANCELLED':
        return 'Đã hủy';
      case 'COMPLETED_WAITING_REVIEW':
      case 'COMPLETED-WAITING-REVIEW':
        return 'Chờ đánh giá';
      case 'PENDING_CAREGIVER':
      case 'PENDING-CAREGIVER':
        return 'Chờ phản hồi';
      case 'EXPIRED':
        return 'Đã hết hạn';
      default:
        return 'Không xác định';
    }
  };

  const getStatusColor = (status: string) => {
    const upperStatus = status.toUpperCase().replace(/-/g, '_');
    switch (upperStatus) {
      case 'CAREGIVER_APPROVED':
      case 'CAREGIVER-APPROVED':
        return '#F59E0B'; // Vàng cam cho sắp tới
      case 'IN_PROGRESS':
      case 'IN-PROGRESS':
        return '#10B981'; // Xanh lá cho đang thực hiện
      case 'COMPLETED':
        return '#6B7280'; // Xám cho đã hoàn thành
      case 'CANCELLED':
        return '#EF4444'; // Đỏ cho đã hủy
      case 'COMPLETED_WAITING_REVIEW':
      case 'COMPLETED-WAITING-REVIEW':
        return '#8B5CF6'; // Tím cho chờ đánh giá
      case 'PENDING_CAREGIVER':
      case 'PENDING-CAREGIVER':
        return '#F59E0B'; // Vàng cam cho chờ phản hồi
      case 'EXPIRED':
        return '#9CA3AF'; // Xám nhạt cho hết hạn
      default:
        return '#9CA3AF';
    }
  };

  const handleToggleDetails = (appointmentId: string) => {
    setExpandedAppointment(expandedAppointment === appointmentId ? null : appointmentId);
  };

  const getTaskColor = (task: Task, appointmentStatus: string, index: number) => {
    if (task.status === 'completed') {
      return '#10B981'; // Xanh lá cho task đã hoàn thành
    } else if (task.status === 'failed') {
      return '#EF4444'; // Đỏ cho task không hoàn thành
    } else if (task.status === 'pending') {
      return '#FFB648'; // Cam cho task đang chờ
    } else if (task.completed) {
      return '#10B981'; // Fallback cho task đã hoàn thành
    } else {
      return '#EF4444'; // Fallback cho task chưa hoàn thành
    }
  };

  const handleAppointmentPress = (appointment: Appointment) => {
    // Navigate to appointment detail page
    router.push({
      pathname: '/careseeker/appointment-detail',
      params: {
        id: appointment.id,
      }
    });
  };

  const getElderlyTitle = (gender?: string) => {
    if (!gender) return '';
    const upperGender = gender.toUpperCase();
    if (upperGender === 'FEMALE') return 'bà';
    if (upperGender === 'MALE') return 'ông';
    return '';
  };

  return (
    <View style={styles.container}>
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
                            <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginLeft: 6 }} />
                          )}
                        </View>
                        <ThemedText style={styles.timeSlot}>
                          {appointment.timeSlot}
                        </ThemedText>
                        {/* Status badge */}
                        <View style={[styles.statusBadgeInline, { backgroundColor: getStatusColor(appointment.status) }]}>
                          <ThemedText style={styles.statusTextInline}>
                            {getStatusText(appointment.status)}
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                    {/* Tên người già với label rõ ràng hơn */}
                    {appointment.elderlyName && (
                      <View style={styles.elderlyRow}>
                        <Ionicons name="person-outline" size={12} color="#7f8c8d" />
                        <ThemedText style={styles.elderlyText}>
                          Chăm sóc {getElderlyTitle(appointment.elderlyGender)} {appointment.elderlyName}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                  
                  {/* Xóa status badge ở bên phải vì đã chuyển xuống dưới */}
                </View>
              </View>

              <TouchableOpacity
                style={styles.viewDetailsButton}
                onPress={(e) => {
                  e.stopPropagation();
                  // Navigate to appointment detail page
                  router.push({
                    pathname: '/careseeker/appointment-detail',
                    params: {
                      id: appointment.id,
                    }
                  });
                }}
              >
                <ThemedText style={styles.viewDetailsText}>Xem chi tiết</ThemedText>
                <Ionicons 
                  name="chevron-forward" 
                  size={16} 
                  color="#68C2E8" 
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
                                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                              ) : task.status === 'failed' ? (
                                <Ionicons name="close-circle" size={24} color="#EF4444" />
                              ) : task.status === 'pending' ? (
                                <View style={styles.pendingCircle} />
                              ) : task.completed ? (
                                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
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
    paddingHorizontal: 0, // Xóa padding ngang
  },
  appointmentsList: {
    gap: 8,
  },
  appointmentCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 18,
    elevation: 4,
    shadowColor: '#68C2E8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginHorizontal: 0,
    borderWidth: 1,
    borderColor: '#F0F2F5',
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  caregiverName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2C3E50',
    letterSpacing: 0.2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoColumn: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#68C2E8',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#68C2E8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  timeSlot: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 6,
    fontWeight: '500',
  },
  elderlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  elderlyText: {
    fontSize: 13,
    color: '#6C757D',
    marginLeft: 4,
    flex: 1,
    fontWeight: '500',
  },
  statusBadgeInline: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusTextInline: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0, // Prevent rating from shrinking
    marginLeft: 8, // Add spacing from name
  },
  ratingText: {
    fontSize: 11,
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
    paddingVertical: 10,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
  },
  viewDetailsText: {
    color: '#68C2E8',
    fontSize: 15,
    fontWeight: '700',
    marginRight: 4,
    letterSpacing: 0.2,
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
