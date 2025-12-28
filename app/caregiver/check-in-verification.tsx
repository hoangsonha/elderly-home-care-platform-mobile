import { CustomAlert } from "@/components/alerts/CustomAlert";
import { updateAppointmentStatus } from "@/data/appointmentStore";
// TODO: Replace with API call
// import * as AppointmentRepository from "@/services/appointment.repository";
import apiClient from "@/services/apiClient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from "react";
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface RouteParams {
  appointmentId: string;
  elderlyName: string;
  address: string;
  amount: number;
  fromScreen?: string;
  elderlyLat?: number;
  elderlyLng?: number;
}

export default function CheckInVerificationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as RouteParams;

  const [currentStep, setCurrentStep] = useState(1); // 1: Photo, 2: Confirm
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);

  // Alert state
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    icon?: any;
    iconColor?: string;
    buttons?: { text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }[];
  }>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });

  const showAlert = (
    title: string,
    message: string,
    buttons?: { text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }[],
    options?: { icon?: any; iconColor?: string }
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons: buttons || [{ text: 'OK', style: 'default' }],
      icon: options?.icon || 'information',
      iconColor: options?.iconColor || '#70C1F1',
    });
  };

  // Step 1: Take photo
  const handleTakePhoto = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showAlert(
          "Quyền truy cập bị từ chối",
          "Vui lòng cấp quyền truy cập camera để chụp ảnh.",
          [{ text: 'OK', style: 'default' }],
          { icon: 'alert-circle', iconColor: '#EF4444' }
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
        setCheckInTime(new Date());
        setCurrentStep(2);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      showAlert(
        "Lỗi",
        "Không thể chụp ảnh. Vui lòng thử lại.",
        [{ text: 'OK', style: 'default' }],
        { icon: 'alert-circle', iconColor: '#EF4444' }
      );
    }
  };

  // Step 2: Start work
  const handleStartWork = async () => {
    try {
      // TODO: Replace with API call
      // await apiClient.patch(`/api/v1/appointments/${params.appointmentId}/status`, { status: 'in-progress' });
      updateAppointmentStatus(params.appointmentId, 'in-progress');

      showAlert(
        "Đã bắt đầu!",
        "Ca làm việc đã được ghi nhận. Người nhà đã nhận thông báo.",
        [
          {
            text: 'Đóng',
            style: 'default',
            onPress: () => {
              // Navigate back to appointment detail or booking
              if (params.fromScreen === 'booking') {
                (navigation as any).navigate('Yêu cầu dịch vụ');
              } else {
                (navigation as any).navigate('Appointment Detail', {
                  appointmentId: params.appointmentId,
                  fromScreen: 'check-in'
                });
              }
            }
          }
        ],
        { icon: 'check-circle', iconColor: '#10B981' }
      );
    } catch (error) {
      console.error('Error starting work:', error);
      showAlert(
        "Lỗi",
        "Không thể bắt đầu ca làm việc. Vui lòng thử lại.",
        [{ text: 'OK', style: 'default' }],
        { icon: 'alert-circle', iconColor: '#EF4444' }
      );
    }
  };

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Render step indicators
  const renderStepIndicators = () => {
    return (
      <View style={styles.stepIndicators}>
        <View style={[styles.stepDot, currentStep >= 1 && styles.stepDotActive]} />
        <View style={[styles.stepDot, currentStep >= 2 && styles.stepDotActive]} />
      </View>
    );
  };

  // Render Step 1: Photo Verification
  const renderPhotoStep = () => {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          {renderStepIndicators()}

          <Text style={styles.title}>Chụp ảnh xác nhận</Text>
          <Text style={styles.subtitle}>
            Chụp ảnh tại địa điểm để xác nhận bạn đã đến
          </Text>

          <TouchableOpacity style={styles.photoCard} onPress={handleTakePhoto}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            ) : (
              <>
                <MaterialCommunityIcons name="camera" size={64} color="#9CA3AF" />
                <Text style={styles.photoCardTitle}>Chụp ảnh tại địa điểm</Text>
                <Text style={styles.photoCardSubtitle}>Tạp để mở camera</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.noteCard}>
            <MaterialCommunityIcons name="lightbulb-on" size={20} color="#F59E0B" />
            <View style={styles.noteContent}>
              <Text style={styles.noteTitle}>Gợi ý</Text>
              <Text style={styles.noteItem}>• Chụp ảnh của nhà hoặc số nhà</Text>
              <Text style={styles.noteItem}>• Đảm bảo ảnh rõ nét</Text>
              <Text style={styles.noteItem}>• Ảnh sẽ được gửi cho người nhà</Text>
            </View>
          </View>

          {photoUri && (
            <TouchableOpacity style={styles.primaryButton} onPress={() => setCurrentStep(2)}>
              <Text style={styles.primaryButtonText}>Tiếp tục</Text>
            </TouchableOpacity>
          )}

          {!photoUri && (
            <TouchableOpacity style={styles.secondaryButton} disabled>
              <Text style={styles.secondaryButtonText}>Tiếp tục</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    );
  };

  // Render Step 2: Confirmation
  const renderConfirmationStep = () => {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          {renderStepIndicators()}

          <Text style={styles.title}>Xác nhận bắt đầu</Text>
          <Text style={styles.subtitle}>
            Kiểm tra lại thông tin trước khi bắt đầu ca làm việc
          </Text>

          <View style={styles.confirmationCard}>
            <View style={styles.confirmationItem}>
              <View style={styles.confirmationIcon}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              </View>
              <View style={styles.confirmationContent}>
                <Text style={styles.confirmationLabel}>Ảnh xác nhận</Text>
                <Text style={styles.confirmationValue}>Đã chụp ảnh tại địa điểm</Text>
              </View>
            </View>
          </View>

          {photoUri && (
            <View style={styles.photoPreviewCard}>
              <Image source={{ uri: photoUri }} style={styles.photoPreviewSmall} />
            </View>
          )}

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Ionicons name="alarm" size={20} color="#EF4444" />
              <Text style={styles.detailLabel}>Thời gian bắt đầu:</Text>
              <Text style={styles.detailValue}>
                {checkInTime ? formatTime(checkInTime) : '--:--'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="cash" size={20} color="#10B981" />
              <Text style={styles.detailLabel}>Thu nhập:</Text>
              <Text style={styles.detailValue}>
                {Number(params.amount || 0).toLocaleString('vi-VN')}đ
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={handleStartWork}>
            <MaterialCommunityIcons name="play-circle" size={24} color="#fff" />
            <Text style={styles.startButtonText}>Bắt đầu ca làm việc</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {currentStep === 1 && renderPhotoStep()}
      {currentStep === 2 && renderConfirmationStep()}

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon}
        iconColor={alertConfig.iconColor}
        buttons={alertConfig.buttons}
        onClose={() => setAlertConfig({ visible: false, title: '', message: '', buttons: [] })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 12,
    gap: 8,
  },
  stepDot: {
    width: 40,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  stepDotActive: {
    backgroundColor: '#70C1F1',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  verificationCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#FDE68A',
    borderStyle: 'dashed',
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  verificationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  verificationDesc: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  loader: {
    marginVertical: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 13,
    color: '#92400E',
    flex: 1,
    lineHeight: 20,
  },
  noteItem: {
    fontSize: 13,
    color: '#92400E',
    marginBottom: 4,
    lineHeight: 18,
  },
  primaryButton: {
    backgroundColor: '#70C1F1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#70C1F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  photoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 48,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    minHeight: 300,
    justifyContent: 'center',
  },
  photoCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  photoCardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  photoPreview: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  confirmationCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    gap: 16,
  },
  confirmationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  confirmationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmationContent: {
    flex: 1,
  },
  confirmationLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  confirmationValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  photoPreviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  photoPreviewSmall: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  startButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
