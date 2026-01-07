import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { mainService } from '@/services/main.service';

interface PaymentCodeProps {
  visible: boolean;
  onClose: () => void;
  onComplete?: () => void; // Callback when payment is confirmed
  bookingId: string;
  amount: number;
  caregiverName: string;
  completedAt: Date;
  qrCodeBase64?: string; // QR code base64 từ API endWork
  orderId?: string; // Order ID để polling payment status
  paymentId?: string; // Payment ID (UUID) để gửi trong request body
  careServiceId?: string; // Care Service ID (UUID) để gửi trong request body
}

export function PaymentCode({
  visible,
  onClose,
  onComplete,
  bookingId,
  amount,
  caregiverName,
  completedAt,
  qrCodeBase64,
  orderId,
  paymentId,
  careServiceId
}: PaymentCodeProps) {
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'PAID' | 'CANCELLED' | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  
  // Bank account info
  const bankInfo = {
    bankName: 'Ngân hàng TMCP Á Châu (ACB)',
    accountNumber: '123456789',
    accountName: 'NGUYEN VAN A',
    branch: 'Chi nhánh TP.HCM'
  };

  // Polling payment status mỗi 1-2 giây
  // API: POST api/v1/payments/order/{orderId}
  // Request body: { paymentId: UUID, careServiceId: UUID }
  // Logic: Nếu status = "PENDING" thì tiếp tục gọi, "PAID" hoặc "CANCELLED" thì dừng
  useEffect(() => {
    // Chỉ polling khi modal visible và có đủ orderId, paymentId, careServiceId
    if (!visible || !orderId || !paymentId || !careServiceId) {
      console.log('PaymentCode: Polling stopped - visible:', visible, 'orderId:', orderId, 'paymentId:', paymentId, 'careServiceId:', careServiceId);
      setIsPolling(false);
      return;
    }

    console.log('PaymentCode: Starting polling with orderId:', orderId, 'paymentId:', paymentId, 'careServiceId:', careServiceId);
    setIsPolling(true);
    let intervalId: NodeJS.Timeout;
    let isStopped = false; // Flag để dừng polling

    const checkPayment = async () => {
      // Kiểm tra nếu đã dừng thì không gọi nữa
      if (isStopped) {
        return;
      }

      try {
        console.log('PaymentCode: Calling checkPaymentStatus with orderId:', orderId, 'paymentId:', paymentId, 'careServiceId:', careServiceId);
        const response = await mainService.checkPaymentStatus(orderId, paymentId, careServiceId);
        console.log('PaymentCode: Response from checkPaymentStatus:', response);
        if (response.status === 'Success' && response.data) {
          // Lấy status từ response (có thể là status hoặc paymentStatus)
          const status = response.data.status || response.data.paymentStatus;
          
          // Chỉ update nếu có status
          if (status) {
            setPaymentStatus(status);

            if (status === 'PAID') {
              // Đã thanh toán - dừng polling
              isStopped = true;
              setIsPolling(false);
              if (intervalId) {
                clearInterval(intervalId);
              }
              // Tự động gọi onComplete khi đã thanh toán
              if (onComplete) {
                setTimeout(() => {
                  onComplete();
                  onClose();
                }, 1000);
              }
            } else if (status === 'CANCELLED') {
              // Đã hủy - dừng polling
              isStopped = true;
              setIsPolling(false);
              if (intervalId) {
                clearInterval(intervalId);
              }
            }
            // Nếu status = 'PENDING' thì tiếp tục polling (không làm gì, interval sẽ tiếp tục chạy)
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        // Lỗi không dừng polling, sẽ thử lại lần sau
      }
    };

    // Gọi ngay lần đầu
    checkPayment();

    // Sau đó gọi mỗi 1.5 giây (trong khoảng 1-2 giây như yêu cầu)
    intervalId = setInterval(() => {
      if (!isStopped) {
        checkPayment();
      }
    }, 1500);

    return () => {
      isStopped = true;
      if (intervalId) {
        clearInterval(intervalId);
      }
      setIsPolling(false);
    };
  }, [visible, orderId, paymentId, careServiceId, onComplete, onClose]);

  // Reset payment status khi modal đóng
  useEffect(() => {
    if (!visible) {
      setPaymentStatus(null);
      setIsPolling(false);
    }
  }, [visible]);

  const handleCopyToClipboard = async (text: string, label: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('Đã sao chép', `${label} đã được sao chép vào clipboard`);
    } catch (error) {
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


            {/* Amount Display */}
            <View style={styles.amountCard}>
              <ThemedText style={styles.amountLabel}>Số tiền thanh toán</ThemedText>
              <ThemedText style={styles.amountValue}>
                {(amount || 0).toLocaleString('vi-VN')} VNĐ
              </ThemedText>
            </View>

            {/* QR Code */}
            <View style={styles.qrSection}>
              <ThemedText style={styles.qrTitle}>Mã QR thanh toán</ThemedText>
              <ThemedText style={styles.qrSubtitle}>
                Khách hàng quét mã này để thanh toán
              </ThemedText>

              <View style={styles.qrCodeContainer}>
                {qrCodeBase64 ? (
                  <Image
                    source={{ uri: `data:image/png;base64,${qrCodeBase64}` }}
                    style={styles.qrCodeImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.qrCodePlaceholder}>
                    <Ionicons name="qr-code-outline" size={200} color="#68C2E8" />
                  </View>
                )}
                {isPolling && paymentStatus === 'PENDING' && (
                  <View style={styles.pollingIndicator}>
                    <ThemedText style={styles.pollingText}>Đang kiểm tra thanh toán...</ThemedText>
                  </View>
                )}
                {paymentStatus === 'PAID' && (
                  <View style={styles.paidIndicator}>
                    <Ionicons name="checkmark-circle" size={32} color="#27AE60" />
                    <ThemedText style={styles.paidText}>Đã thanh toán</ThemedText>
                  </View>
                )}
                {paymentStatus === 'CANCELLED' && (
                  <View style={styles.cancelledIndicator}>
                    <Ionicons name="close-circle" size={32} color="#EF4444" />
                    <ThemedText style={styles.cancelledText}>Đã hủy</ThemedText>
                  </View>
                )}
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
                3. Hệ thống sẽ tự động kiểm tra trạng thái thanh toán
              </ThemedText>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={onClose}
          >
            <ThemedText style={styles.cancelButtonText}>
              Đóng
            </ThemedText>
          </TouchableOpacity>
        </View>
        {/* Safe area padding for bottom navigation */}
        <View style={styles.safeAreaBottom} />
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
  qrCodeImage: {
    width: 250,
    height: 250,
    borderRadius: 16,
  },
  pollingIndicator: {
    position: 'absolute',
    bottom: -30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pollingText: {
    fontSize: 12,
    color: '#68C2E8',
    fontStyle: 'italic',
  },
  paidIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(39, 174, 96, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paidText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  cancelledIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cancelledText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
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
    paddingBottom: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    gap: 12,
  },
  safeAreaBottom: {
    height: 20, // Minimal space for bottom navigation
    backgroundColor: 'white',
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
