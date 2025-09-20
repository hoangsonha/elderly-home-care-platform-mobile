import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useErrorNotification, useInfoNotification, useSuccessNotification, useWarningNotification } from '@/contexts/NotificationContext';
import { ThemedText } from '../themed-text';

export const NotificationDemo: React.FC = () => {
  const { showSuccessTooltip, showSuccess } = useSuccessNotification();
  const { showErrorTooltip, showError } = useErrorNotification();
  const { showWarningTooltip, showWarning } = useWarningNotification();
  const { showInfoTooltip, showInfo } = useInfoNotification();

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Demo Thông báo Đẹp</ThemedText>
      <ThemedText style={styles.subtitle}>Vị trí an toàn, không bị che bởi status bar</ThemedText>
      
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Tooltip (Nhỏ gọn)</ThemedText>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.successButton]}
            onPress={() => showSuccessTooltip('Đăng nhập thành công!')}
          >
            <Ionicons name="checkmark" size={16} color="white" />
            <ThemedText style={styles.buttonText}>Success</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.errorButton]}
            onPress={() => showErrorTooltip('Có lỗi xảy ra!')}
          >
            <Ionicons name="close" size={16} color="white" />
            <ThemedText style={styles.buttonText}>Error</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Notification (Chi tiết)</ThemedText>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.infoButton]}
            onPress={() => showInfo('Thông tin', 'Hệ thống đang được cập nhật')}
          >
            <Ionicons name="information" size={16} color="white" />
            <ThemedText style={styles.buttonText}>Info</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.warningButton]}
            onPress={() => showWarning('Cảnh báo', 'Vui lòng kiểm tra thông tin')}
          >
            <Ionicons name="warning" size={16} color="white" />
            <ThemedText style={styles.buttonText}>Warning</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Demo Đăng nhập</ThemedText>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => showSuccessTooltip('Đăng nhập thành công! Đang chuyển hướng...')}
        >
          <Ionicons name="log-in" size={16} color="white" />
          <ThemedText style={styles.buttonText}>Đăng nhập Demo</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  successButton: {
    backgroundColor: '#28a745',
  },
  errorButton: {
    backgroundColor: '#dc3545',
  },
  warningButton: {
    backgroundColor: '#ffc107',
  },
  infoButton: {
    backgroundColor: '#4ECDC4',
  },
  primaryButton: {
    backgroundColor: '#007bff',
  },
});


