import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
  appointmentId: string;
  amount: number;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  onClose,
  onComplete,
  appointmentId,
  amount,
}) => {
  // Thông tin ngân hàng công ty
  const companyBankInfo = {
    bankName: 'Ngân hàng TMCP Á Châu (ACB)',
    accountNumber: '123456789',
    accountName: 'CONG TY TNHH CHAM SOC NGUOI GIA',
    branch: 'Chi nhánh TP.HCM',
  };

  // Generate QR code URL (using a QR code API)
  // Format: Bank code|Account number|Account name|Amount|Description
  const qrContent = `${companyBankInfo.accountNumber}|${amount}|${appointmentId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrContent)}`;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Thanh toán dịch vụ</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Amount */}
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Số tiền thanh toán</Text>
              <Text style={styles.amountValue}>{formatCurrency(amount)}</Text>
            </View>

            {/* QR Code */}
            <View style={styles.qrContainer}>
              <Text style={styles.sectionTitle}>Quét mã QR để thanh toán</Text>
              <View style={styles.qrCodeWrapper}>
                <Image
                  source={{ uri: qrCodeUrl }}
                  style={styles.qrCode}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.qrNote}>
                Yêu cầu người nhà quét mã QR bằng ứng dụng ngân hàng
              </Text>
            </View>

            {/* Bank Information */}
            <View style={styles.bankInfoContainer}>
              <Text style={styles.sectionTitle}>Hoặc chuyển khoản thủ công</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ngân hàng:</Text>
                <Text style={styles.infoValue}>{companyBankInfo.bankName}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Chi nhánh:</Text>
                <Text style={styles.infoValue}>{companyBankInfo.branch}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Số tài khoản:</Text>
                <Text style={[styles.infoValue, styles.highlight]}>
                  {companyBankInfo.accountNumber}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Chủ tài khoản:</Text>
                <Text style={styles.infoValue}>{companyBankInfo.accountName}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nội dung:</Text>
                <Text style={[styles.infoValue, styles.highlight]}>
                  {appointmentId}
                </Text>
              </View>
            </View>

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <View style={styles.instructionRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.instructionText}>
                  Yêu cầu người nhà quét mã QR hoặc chuyển khoản thủ công
                </Text>
              </View>

              <View style={styles.instructionRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.instructionText}>
                  Kiểm tra đã nhận được tiền trong tài khoản công ty
                </Text>
              </View>

              <View style={styles.instructionRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.instructionText}>
                  Nhấn &quot;Hoàn tất chuyển khoản&quot; để hoàn thành dịch vụ
                </Text>
              </View>
            </View>

            {/* Warning */}
            <View style={styles.warningContainer}>
              <Ionicons name="alert-circle" size={20} color="#F59E0B" />
              <Text style={styles.warningText}>
                Chỉ hoàn tất sau khi đã xác nhận nhận được tiền
              </Text>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.completeButton}
              onPress={onComplete}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.completeButtonText}>Hoàn tất chuyển khoản</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  amountContainer: {
    backgroundColor: '#F0F9FF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E40AF',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  qrCodeWrapper: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  qrCode: {
    width: 250,
    height: 250,
  },
  qrNote: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  bankInfoContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  highlight: {
    color: '#2563EB',
    fontWeight: '700',
  },
  instructionsContainer: {
    marginBottom: 20,
  },
  instructionRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  completeButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
