import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

import { ThemedText } from '@/components/themed-text';

interface PaymentCodeProps {
  visible: boolean;
  onClose: () => void;
  onComplete?: () => void; // Callback when payment is confirmed
  bookingId: string;
  amount: number;
  caregiverName: string;
  completedAt: Date;
}

export function PaymentCode({
  visible,
  onClose,
  onComplete,
  bookingId,
  amount,
  caregiverName,
  completedAt
}: PaymentCodeProps) {
  
  // Bank account info
  const bankInfo = {
    bankName: 'Ngân hàng TMCP Á Châu (ACB)',
    accountNumber: '123456789',
    accountName: 'NGUYEN VAN A',
    branch: 'Chi nhánh TP.HCM'
  };

  const handleCopyToClipboard = async (text: string, label: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('Đã sao chép', `${label} đã được sao chép vào clipboard`);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Lỗi', 'Không thể sao chép');
    }
  };

  const handleConfirmPayment = () => {
    Alert.alert(
      'Xác nhận thanh toán',
      'Bạn đã nhận được tiền từ khách hàng chưa?',
      [
        {
          text: 'Chưa',
          style: 'cancel'
        },
        {
          text: 'Đã nhận tiền',
          onPress: () => {
            if (onComplete) {
              onComplete();
            }
            onClose();
          }
        }
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <ThemedText style={styles.headerTitle}>Mã thanh toán</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Booking #{bookingId}
            </ThemedText>
          </View>

          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.contentInner}>
            {/* Success Icon */}
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={80} color="#27AE60" />
            </View>

            <ThemedText style={styles.completedTitle}>
              Đã hoàn thành công việc!
            </ThemedText>

            <ThemedText style={styles.completedMessage}>
              Cảm ơn bạn đã hoàn thành xuất sắc. Vui lòng đưa mã thanh toán dưới đây cho khách hàng.
            </ThemedText>

            {/* Booking Info */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Nhân viên:</ThemedText>
                <ThemedText style={styles.infoValue}>{caregiverName}</ThemedText>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Hoàn thành lúc:</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {completedAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  {' - '}
                  {completedAt.toLocaleDateString('vi-VN')}
                </ThemedText>
              </View>
            </View>

            {/* Amount Display */}
            <View style={styles.amountCard}>
              <ThemedText style={styles.amountLabel}>Số tiền thanh toán</ThemedText>
              <ThemedText style={styles.amountValue}>
                {amount.toLocaleString('vi-VN')} VNĐ
              </ThemedText>
            </View>

            {/* QR Code */}
            <View style={styles.qrSection}>
              <ThemedText style={styles.qrTitle}>Mã QR thanh toán</ThemedText>
              <ThemedText style={styles.qrSubtitle}>
                Khách hàng quét mã này để thanh toán
              </ThemedText>

              <View style={styles.qrCodeContainer}>
                <View style={styles.qrCodePlaceholder}>
                  <Ionicons name="qr-code-outline" size={200} color="#68C2E8" />
                </View>
              </View>

              <View style={styles.qrInfo}>
                <TouchableOpacity 
                  style={styles.copyRow}
                  onPress={() => handleCopyToClipboard(bookingId, 'Mã booking')}
                >
                  <View style={styles.copyContent}>
                    <ThemedText style={styles.qrInfoLabel}>Mã booking:</ThemedText>
                    <ThemedText style={styles.qrInfoValue}>{bookingId}</ThemedText>
                  </View>
                  <Ionicons name="copy-outline" size={20} color="#68C2E8" />
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity 
                  style={styles.copyRow}
                  onPress={() => handleCopyToClipboard(bankInfo.accountNumber, 'Số tài khoản')}
                >
                  <View style={styles.copyContent}>
                    <ThemedText style={styles.qrInfoLabel}>Số TK:</ThemedText>
                    <ThemedText style={styles.qrInfoValue}>{bankInfo.accountNumber}</ThemedText>
                  </View>
                  <Ionicons name="copy-outline" size={20} color="#68C2E8" />
                </TouchableOpacity>

                <View style={styles.divider} />

                <View style={styles.copyRow}>
                  <View style={styles.copyContent}>
                    <ThemedText style={styles.qrInfoLabel}>Ngân hàng:</ThemedText>
                    <ThemedText style={styles.qrInfoValue}>{bankInfo.bankName}</ThemedText>
                  </View>
                </View>
              </View>
            </View>

            {/* Instructions */}
            <View style={styles.instructionCard}>
              <View style={styles.instructionHeader}>
                <Ionicons name="information-circle" size={24} color="#68C2E8" />
                <ThemedText style={styles.instructionTitle}>Hướng dẫn</ThemedText>
              </View>
              <ThemedText style={styles.instructionText}>
                1. Đưa mã QR này cho khách hàng{'\n'}
                2. Khách hàng mở app ngân hàng và quét mã{'\n'}
                3. Kiểm tra xác nhận thanh toán{'\n'}
                4. Bấm "Xác nhận đã thanh toán" bên dưới
              </ThemedText>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity 
            style={styles.confirmButton}
            onPress={handleConfirmPayment}
          >
            <Ionicons name="checkmark-circle" size={24} color="white" />
            <ThemedText style={styles.confirmButtonText}>
              Xác nhận đã thanh toán
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={onClose}
          >
            <ThemedText style={styles.cancelButtonText}>
              Đóng
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#68C2E8',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 20,
    paddingBottom: 40,
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 12,
  },
  completedMessage: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  divider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 12,
  },
  amountCard: {
    backgroundColor: '#f0f8ff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#68C2E8',
  },
  amountLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#68C2E8',
  },
  qrSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 4,
  },
  qrSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrCodePlaceholder: {
    width: 250,
    height: 250,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  qrInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  copyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  copyContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  qrInfoLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  qrInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  instructionCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  instructionText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 22,
  },
  bottomActions: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    gap: 12,
  },
  confirmButton: {
    backgroundColor: '#27AE60',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
  },
});
