import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useErrorNotification, useInfoNotification, useSuccessNotification, useWarningNotification } from '@/contexts/NotificationContext';
import { ThemedText } from '../themed-text';

export const TooltipDemo: React.FC = () => {
  const { showSuccessTooltip } = useSuccessNotification();
  const { showErrorTooltip } = useErrorNotification();
  const { showWarningTooltip } = useWarningNotification();
  const { showInfoTooltip } = useInfoNotification();

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Demo Tooltip Đẹp</ThemedText>
      
      <TouchableOpacity
        style={[styles.button, styles.successButton]}
        onPress={() => showSuccessTooltip('Thành công! Dữ liệu đã được lưu.')}
      >
        <ThemedText style={styles.buttonText}>Success Tooltip</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.errorButton]}
        onPress={() => showErrorTooltip('Lỗi! Không thể kết nối đến server.')}
      >
        <ThemedText style={styles.buttonText}>Error Tooltip</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.warningButton]}
        onPress={() => showWarningTooltip('Cảnh báo! Vui lòng kiểm tra thông tin.')}
      >
        <ThemedText style={styles.buttonText}>Warning Tooltip</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.infoButton]}
        onPress={() => showInfoTooltip('Thông tin: Hệ thống đang được cập nhật.')}
      >
        <ThemedText style={styles.buttonText}>Info Tooltip</ThemedText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
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
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});


