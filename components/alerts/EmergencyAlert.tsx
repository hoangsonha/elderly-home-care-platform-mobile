import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface EmergencyAlertProps {
  alert: {
    caregiverName: string;
    elderlyName: string;
    timestamp: string;
    location?: string;
    message?: string;
  } | null;
  visible: boolean;
  onDismiss?: () => void;
}

export function EmergencyAlert({ alert, visible, onDismiss }: EmergencyAlertProps) {
  if (!visible || !alert) {
    return null;
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.alertContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="warning" size={28} color="#E74C3C" />
          </View>
          <View style={styles.titleContainer}>
            <ThemedText style={styles.title}>CẢNH BÁO KHẨN CẤP</ThemedText>
            <ThemedText style={styles.subtitle}>Yêu cầu hỗ trợ ngay lập tức</ThemedText>
          </View>
          {onDismiss && (
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={onDismiss}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color="#E74C3C" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Ionicons name="person" size={16} color="#7f8c8d" />
            <ThemedText style={styles.detailLabel}>Người chăm sóc:</ThemedText>
            <ThemedText style={styles.detailValue}>{alert.caregiverName}</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="person-circle" size={16} color="#7f8c8d" />
            <ThemedText style={styles.detailLabel}>Người già:</ThemedText>
            <ThemedText style={styles.detailValue}>{alert.elderlyName}</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="time" size={16} color="#7f8c8d" />
            <ThemedText style={styles.detailLabel}>Thời gian:</ThemedText>
            <ThemedText style={styles.detailValue}>{formatTime(alert.timestamp)}</ThemedText>
          </View>

          {alert.location && (
            <View style={styles.detailRow}>
              <Ionicons name="location" size={16} color="#7f8c8d" />
              <ThemedText style={styles.detailLabel}>Vị trí:</ThemedText>
              <ThemedText style={styles.detailValue}>{alert.location}</ThemedText>
            </View>
          )}

          {alert.message && (
            <View style={styles.messageContainer}>
              <ThemedText style={styles.messageLabel}>Tin nhắn:</ThemedText>
              <ThemedText style={styles.messageText}>{alert.message}</ThemedText>
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.callButton} activeOpacity={0.7}>
            <Ionicons name="call" size={20} color="white" />
            <ThemedText style={styles.callButtonText}>Gọi ngay</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.messageButton} activeOpacity={0.7}>
            <Ionicons name="chatbubble" size={20} color="#E74C3C" />
            <ThemedText style={styles.messageButtonText}>Nhắn tin</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  alertContent: {
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 6,
    borderLeftColor: '#E74C3C',
    elevation: 4,
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  dismissButton: {
    padding: 4,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 8,
    marginRight: 8,
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  messageContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  messageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E74C3C',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  callButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E74C3C',
  },
  messageButtonText: {
    color: '#E74C3C',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
