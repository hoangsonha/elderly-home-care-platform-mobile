import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { LocationPickerModal } from '@/components/ui/LocationPickerModal';
import { useAuth } from '@/contexts/AuthContext';
import { useErrorNotification, useSuccessNotification } from '@/contexts/NotificationContext';
import { UserService } from '@/services/user.service';

const genderOptions = [
  { id: 'MALE', label: 'Nam' },
  { id: 'FEMALE', label: 'Nữ' },
];

export default function CompleteProfileScreen() {
  const { user, updateProfile } = useAuth();
  const { showSuccessTooltip } = useSuccessNotification();
  const { showErrorTooltip } = useErrorNotification();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | null>(null);
  const [birthYear, setBirthYear] = useState('');
  const [showBirthYearPicker, setShowBirthYearPicker] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address?: string } | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleImagePicker = () => {
    setShowImagePickerModal(true);
  };

  const handlePickFromLibrary = async () => {
    setShowImagePickerModal(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Thông báo', 'Cần quyền truy cập thư viện ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    setShowImagePickerModal(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Thông báo', 'Cần quyền truy cập camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUri(null);
  };

  const validateForm = (): boolean => {
    if (!fullName.trim()) {
      showErrorTooltip('Vui lòng nhập họ và tên');
      return false;
    }
    if (!phone.trim()) {
      showErrorTooltip('Vui lòng nhập số điện thoại');
      return false;
    }
    if (!/^0\d{9}$/.test(phone)) {
      showErrorTooltip('Số điện thoại không hợp lệ (phải là 10 số bắt đầu bằng 0)');
      return false;
    }
    if (!gender) {
      showErrorTooltip('Vui lòng chọn giới tính');
      return false;
    }
    if (!birthYear.trim()) {
      showErrorTooltip('Vui lòng chọn năm sinh');
      return false;
    }
    const year = parseInt(birthYear);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1900 || year > currentYear) {
      showErrorTooltip('Năm sinh không hợp lệ (1900 - ' + currentYear + ')');
      return false;
    }
    if (!location) {
      showErrorTooltip('Vui lòng chọn vị trí');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        full_name: fullName.trim(),
        birth_year: parseInt(birthYear),
        gender: gender!,
        location: {
          address: location!.address || 'Chưa có địa chỉ',
          latitude: location!.latitude,
          longitude: location!.longitude,
        },
        phone: phone.trim(),
      };

      const avatarFile = avatarUri
        ? {
            uri: avatarUri,
            type: 'image/jpeg',
            name: `avatar_${Date.now()}.jpg`,
          }
        : undefined;

      const response = await UserService.createCareSeekerProfile(requestData, avatarFile);

      setIsSubmitting(false);

      if (response.status === 'Success') {
        // Update user profile in context
        updateProfile({
          name: fullName,
          phone: phone,
          avatar: avatarUri || undefined,
          hasCompletedProfile: true,
        });

        showSuccessTooltip('Hoàn thiện hồ sơ thành công!');

        // Navigate to dashboard
        setTimeout(() => {
          router.replace('/careseeker/dashboard');
        }, 1500);
      } else {
        // Show error modal
        setErrorMessage(response.message || 'Có lỗi xảy ra khi hoàn thiện hồ sơ');
        setShowErrorModal(true);
      }
    } catch (error: any) {
      setIsSubmitting(false);
      console.error('Error completing profile:', error);
      
      // Show error modal
      setErrorMessage(error.message || 'Có lỗi xảy ra khi hoàn thiện hồ sơ. Vui lòng thử lại.');
      setShowErrorModal(true);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Hoàn thiện hồ sơ</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Vui lòng điền đầy đủ thông tin để tiếp tục
          </ThemedText>
        </View>

        {/* Avatar Upload */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Ảnh đại diện</ThemedText>
          <View style={styles.avatarContainer}>
            {avatarUri ? (
              <View style={styles.avatarWrapper}>
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                <TouchableOpacity style={styles.removeAvatarButton} onPress={handleRemoveAvatar}>
                  <Ionicons name="close-circle" size={30} color="#dc3545" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.changeAvatarButton} onPress={handleImagePicker}>
                  <Ionicons name="camera" size={20} color="#68C2E8" />
                  <ThemedText style={styles.changeAvatarText}>Chụp lại / Chọn ảnh khác</ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadAvatarButton} onPress={handleImagePicker}>
                <Ionicons name="camera" size={40} color="#68C2E8" />
                <ThemedText style={styles.uploadAvatarText}>Chụp ảnh hoặc chọn từ thư viện</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Full Name */}
        <View style={styles.section}>
          <ThemedText style={styles.label}>
            Họ và tên <ThemedText style={styles.required}>*</ThemedText>
          </ThemedText>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Nhập họ và tên"
            placeholderTextColor="#999"
          />
        </View>

        {/* Phone */}
        <View style={styles.section}>
          <ThemedText style={styles.label}>
            Số điện thoại <ThemedText style={styles.required}>*</ThemedText>
          </ThemedText>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Nhập số điện thoại (ví dụ: 0901234567)"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        {/* Gender */}
        <View style={styles.section}>
          <ThemedText style={styles.label}>
            Giới tính <ThemedText style={styles.required}>*</ThemedText>
          </ThemedText>
          <View style={styles.genderOptions}>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.genderCard,
                  gender === option.id && styles.genderCardSelected,
                ]}
                onPress={() => setGender(option.id as 'MALE' | 'FEMALE')}
              >
                <ThemedText
                  style={[
                    styles.genderText,
                    gender === option.id && styles.genderTextSelected,
                  ]}
                >
                  {option.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Birth Year */}
        <View style={styles.section}>
          <ThemedText style={styles.label}>
            Năm sinh <ThemedText style={styles.required}>*</ThemedText>
          </ThemedText>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowBirthYearPicker(true)}
          >
            <ThemedText style={birthYear ? styles.dateText : styles.placeholderText}>
              {birthYear || 'Chọn năm sinh'}
            </ThemedText>
            <Ionicons name="calendar-outline" size={20} color="#68C2E8" />
          </TouchableOpacity>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <ThemedText style={styles.label}>
            Vị trí <ThemedText style={styles.required}>*</ThemedText>
          </ThemedText>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={() => setShowLocationPicker(true)}
          >
            <Ionicons name="location" size={20} color="#68C2E8" />
            <ThemedText style={styles.locationButtonText} numberOfLines={1}>
              {location ? 'Chọn vị trí khác' : 'Chọn vị trí trên bản đồ'}
            </ThemedText>
          </TouchableOpacity>

          {location && (
            <View style={styles.selectedLocationCard}>
              <View style={styles.selectedLocationHeader}>
                <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
                <ThemedText style={styles.selectedLocationTitle}>Vị trí đã chọn</ThemedText>
              </View>
              <View style={styles.selectedLocationInfo}>
                <ThemedText style={styles.selectedLocationText}>
                  {location.address || 'Chưa có địa chỉ'}
                </ThemedText>
                <ThemedText style={styles.selectedLocationCoords}>
                  Tọa độ: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </ThemedText>
              </View>
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <ActivityIndicator size="small" color="white" />
              <ThemedText style={styles.submitButtonText}>Đang xử lý...</ThemedText>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <ThemedText style={styles.submitButtonText}>Hoàn thành</ThemedText>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Image Picker Modal */}
      <Modal
        visible={showImagePickerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImagePickerModal(false)}
      >
        <TouchableOpacity
          style={styles.imagePickerModalOverlay}
          activeOpacity={1}
          onPress={() => setShowImagePickerModal(false)}
        >
          <View style={styles.imagePickerModalContent} onTouchEnd={(e) => e.stopPropagation()}>
            <View style={styles.imagePickerModalHeader}>
              <ThemedText style={styles.imagePickerModalTitle}>Chọn ảnh đại diện</ThemedText>
              <TouchableOpacity onPress={() => setShowImagePickerModal(false)}>
                <Ionicons name="close" size={24} color="#6c757d" />
              </TouchableOpacity>
            </View>
            <ThemedText style={styles.imagePickerModalSubtitle}>
              Chọn nguồn ảnh cho ảnh đại diện
            </ThemedText>

            <View style={styles.imagePickerOptionsContainer}>
              <TouchableOpacity style={styles.imagePickerOption} onPress={handleTakePhoto}>
                <View style={styles.imagePickerOptionIcon}>
                  <Ionicons name="camera" size={32} color="#68C2E8" />
                </View>
                <ThemedText style={styles.imagePickerOptionText}>Chụp ảnh</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imagePickerOption} onPress={handlePickFromLibrary}>
                <View style={styles.imagePickerOptionIcon}>
                  <Ionicons name="images" size={32} color="#68C2E8" />
                </View>
                <ThemedText style={styles.imagePickerOptionText}>Thư viện</ThemedText>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.imagePickerCancelButton}
              onPress={() => setShowImagePickerModal(false)}
            >
              <ThemedText style={styles.imagePickerCancelButtonText}>Hủy</ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Location Picker Modal */}
      <LocationPickerModal
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelectLocation={(lat, lng, address) => {
          setLocation({ latitude: lat, longitude: lng, address: address });
          setShowLocationPicker(false);
        }}
        initialLocation={location}
      />

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.errorModalOverlay}>
          <View style={styles.errorModalContent}>
            <View style={styles.errorModalHeader}>
              <Ionicons name="alert-circle" size={32} color="#E74C3C" />
              <ThemedText style={styles.errorModalTitle}>Lỗi</ThemedText>
            </View>
            <ThemedText style={styles.errorModalMessage}>{errorMessage}</ThemedText>
            <TouchableOpacity
              style={styles.errorModalButton}
              onPress={() => setShowErrorModal(false)}
            >
              <ThemedText style={styles.errorModalButtonText}>Đóng</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Birth Year Picker Modal */}
      <Modal
        visible={showBirthYearPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBirthYearPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.birthYearPickerContainer}>
            <View style={styles.birthYearPickerHeader}>
              <TouchableOpacity onPress={() => setShowBirthYearPicker(false)}>
                <ThemedText style={styles.birthYearPickerCancel}>Hủy</ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.birthYearPickerTitle}>Chọn năm sinh</ThemedText>
              <TouchableOpacity onPress={() => setShowBirthYearPicker(false)}>
                <ThemedText style={styles.birthYearPickerDone}>Xong</ThemedText>
              </TouchableOpacity>
            </View>
            <FlatList
              data={Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => new Date().getFullYear() - i)}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.birthYearItem,
                    birthYear === item.toString() && styles.birthYearItemSelected
                  ]}
                  onPress={() => {
                    setBirthYear(item.toString());
                  }}
                >
                  <ThemedText style={[
                    styles.birthYearItemText,
                    birthYear === item.toString() && styles.birthYearItemTextSelected
                  ]}>
                    {item}
                  </ThemedText>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  required: {
    color: '#E74C3C',
  },
  input: {
    height: 50,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#2C3E50',
    borderWidth: 1,
    borderColor: '#E8EBED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 15,
    color: '#2C3E50',
  },
  placeholderText: {
    fontSize: 15,
    color: '#999',
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  avatarWrapper: {
    position: 'relative',
    alignItems: 'center',
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  uploadAvatarButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F8FF',
    borderWidth: 2,
    borderColor: '#68C2E8',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  uploadAvatarText: {
    fontSize: 12,
    color: '#68C2E8',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  removeAvatarButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  changeAvatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#68C2E8',
  },
  changeAvatarText: {
    fontSize: 12,
    color: '#68C2E8',
    fontWeight: '500',
  },
  genderOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  genderCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E8EBED',
    alignItems: 'center',
  },
  genderCardSelected: {
    borderColor: '#68C2E8',
    backgroundColor: '#F0F8FF',
  },
  genderText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  genderTextSelected: {
    color: '#68C2E8',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#68C2E8',
    gap: 8,
  },
  locationButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#68C2E8',
    flexShrink: 0,
  },
  selectedLocationCard: {
    marginTop: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27AE60',
  },
  selectedLocationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  selectedLocationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27AE60',
  },
  selectedLocationInfo: {
    gap: 4,
  },
  selectedLocationText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  selectedLocationCoords: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#68C2E8',
    marginHorizontal: 20,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  imagePickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  imagePickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  imagePickerModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
  },
  imagePickerModalSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 24,
  },
  imagePickerOptionsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  imagePickerOption: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E8EBED',
  },
  imagePickerOptionIcon: {
    marginBottom: 12,
  },
  imagePickerOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  imagePickerCancelButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  imagePickerCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  errorModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  errorModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  errorModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
  },
  errorModalMessage: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  errorModalButton: {
    backgroundColor: '#68C2E8',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  errorModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  // Birth Year Picker Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  birthYearPickerContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
    width: '100%',
  },
  birthYearPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EBED',
  },
  birthYearPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  birthYearPickerCancel: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  birthYearPickerDone: {
    fontSize: 16,
    color: '#68C2E8',
    fontWeight: '600',
  },
  birthYearItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  birthYearItemSelected: {
    backgroundColor: '#E8F5E9',
  },
  birthYearItemText: {
    fontSize: 16,
    color: '#2C3E50',
    textAlign: 'center',
  },
  birthYearItemTextSelected: {
    color: '#68C2E8',
    fontWeight: '600',
  },
});


