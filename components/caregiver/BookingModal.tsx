import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ElderlyProfileSelector } from '@/components/elderly/ElderlyProfileSelector';
import { ThemedText } from '@/components/themed-text';
import { Task } from '@/components/ui/TaskSelector';
import { SERVICE_PACKAGES, type ServicePackage } from '@/constants/servicePackages';
import { useAuth } from '@/contexts/AuthContext';
import { mainService, type ServicePackageApiResponse, type AvailableScheduleApiResponse, type BookedSlot } from '@/services/main.service';
import { UserService, type ElderlyProfileApiResponse } from '@/services/user.service';
// TODO: Replace with API call
// import * as AppointmentRepository from '@/services/appointment.repository';

interface Caregiver {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  experience: string;
  specialties: string[];
  hourlyRate: number;
  distance: string;
  isVerified: boolean;
  totalReviews: number;
}

interface ElderlyProfile {
  id: string;
  name: string;
  age: number;
  currentCaregivers: number;
  family: string;
  healthStatus: 'good' | 'fair' | 'poor';
  avatar?: string;
  address?: string;
  location?: {
    address: string;
    latitude: number;
    longitude: number;
  };
}

interface BookingModalProps {
  visible: boolean;
  onClose: () => void;
  caregiver: Caregiver;
  elderlyProfiles: ElderlyProfile[];
  immediateOnly?: boolean;
}

type BookingType = 'immediate' | 'schedule';

export function BookingModal({ visible, onClose, caregiver, elderlyProfiles: initialProfiles, immediateOnly = false }: BookingModalProps) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [elderlyProfiles, setElderlyProfiles] = useState(initialProfiles);
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [bookingType] = useState<BookingType>('immediate'); // Always immediate
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [isLoadingElderly, setIsLoadingElderly] = useState(false);
  const [servicePackages, setServicePackages] = useState<ServicePackage[]>(SERVICE_PACKAGES);
  const [isLoadingPackages, setIsLoadingPackages] = useState(false);
  const [availableSchedule, setAvailableSchedule] = useState<AvailableScheduleApiResponse | null>(null);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);

  // Fetch elderly profiles from API when modal opens
  useEffect(() => {
    if (visible) {
      const fetchElderlyProfiles = async () => {
        try {
          setIsLoadingElderly(true);
          const apiProfiles = await UserService.getElderlyProfiles();
          
          // Map API response to ElderlyProfile format
          const mappedProfiles: ElderlyProfile[] = apiProfiles.map((profile: ElderlyProfileApiResponse) => {
            // Map healthStatus from API to component format
            let healthStatus: 'good' | 'fair' | 'poor' = 'fair'; // Default to 'fair' instead of 'good'
            if (profile.healthStatus) {
              const statusLower = profile.healthStatus.toLowerCase();
              if (statusLower === 'good' || statusLower === 'tốt') {
                healthStatus = 'good';
              } else if (statusLower === 'moderate' || statusLower === 'fair' || statusLower === 'trung bình' || statusLower === 'khá') {
                healthStatus = 'fair';
              } else if (statusLower === 'weak' || statusLower === 'poor' || statusLower === 'yếu' || statusLower === 'kém') {
                healthStatus = 'poor';
              }
            }
            
            return {
              id: profile.elderlyProfileId,
              name: profile.fullName,
              age: profile.age,
              currentCaregivers: 0, // Not available in API
              family: '', // Will be removed from UI
              healthStatus: healthStatus,
              avatar: profile.avatarUrl || undefined,
              address: profile.location?.address,
              location: profile.location ? {
                address: profile.location.address,
                latitude: profile.location.latitude,
                longitude: profile.location.longitude,
              } : undefined,
            };
          });
          
          setElderlyProfiles(mappedProfiles);
        } catch (error) {
          // Fallback to initial profiles on error
          setElderlyProfiles(initialProfiles);
        } finally {
          setIsLoadingElderly(false);
        }
      };

      fetchElderlyProfiles();
    }
  }, [visible]);

  // Sync elderlyProfiles when initialProfiles changes (fallback)
  useEffect(() => {
    if (!isLoadingElderly && elderlyProfiles.length === 0) {
      setElderlyProfiles(initialProfiles);
    }
  }, [initialProfiles]);

  // Set work location from selected elderly profile when moving to step 2
  useEffect(() => {
    if (currentStep === 2 && selectedProfiles.length > 0) {
      const selectedProfile = elderlyProfiles.find(p => p.id === selectedProfiles[0]);
      if (selectedProfile) {
        const displayLocation = formatLocationDisplay(
          selectedProfile.address,
          selectedProfile.location?.latitude,
          selectedProfile.location?.longitude
        );
        setImmediateData(prev => ({
          ...prev,
          workLocation: displayLocation
        }));
      }
    }
  }, [currentStep, selectedProfiles, elderlyProfiles]);

  // Fetch available schedule when moving to step 2
  // TODO: Replace with real API call when backend is ready
  useEffect(() => {
    if (currentStep === 2 && caregiver.id) {
      const fetchAvailableSchedule = async () => {
        try {
          setIsLoadingSchedule(true);
          
          // TODO: Uncomment when API is ready
          // const response = await mainService.getCaregiverAvailableSchedule(caregiver.id);
          // setAvailableSchedule(response);
          
          // Fake data for testing UI
          // Simulate loading delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Test case 1: Available all time
          // const fakeResponse: AvailableScheduleApiResponse = {
          //   status: 'Success',
          //   message: 'Lấy lịch rảnh thành công',
          //   data: {
          //     available_all_time: true,
          //     booked_slots: [],
          //   },
          // };
          
          // Test case 2: Has some booked slots
          const fakeResponse: AvailableScheduleApiResponse = {
            status: 'Success',
            message: 'Lấy lịch rảnh thành công',
            data: {
              available_all_time: false,
              booked_slots: [
                {
                  date: '2025-12-01',
                  start_time: '09:00',
                  end_time: '12:00',
                },
                {
                  date: '2025-12-02',
                  start_time: '14:00',
                  end_time: '17:00',
                },
                {
                  date: '2025-12-05',
                  start_time: '08:00',
                  end_time: '11:30',
                },
              ],
            },
          };
          
          setAvailableSchedule(fakeResponse);
        } catch (error) {
          console.error('Failed to fetch available schedule:', error);
          // Set default: available all time on error
          setAvailableSchedule({
            status: 'Success',
            message: 'Lấy lịch rảnh thành công',
            data: {
              available_all_time: true,
              booked_slots: [],
            },
          });
        } finally {
          setIsLoadingSchedule(false);
        }
      };

      fetchAvailableSchedule();
    }
  }, [currentStep, caregiver.id]);

  // Fetch service packages from API when modal opens
  useEffect(() => {
    if (visible) {
      const fetchServicePackages = async () => {
        try {
          setIsLoadingPackages(true);
          const apiPackages = await mainService.getActiveServicePackages();
          
          // Map API response to ServicePackage format
          const mappedPackages: ServicePackage[] = apiPackages.map((pkg: ServicePackageApiResponse) => ({
            id: pkg.servicePackageId,
            name: pkg.packageName,
            duration: pkg.durationHours,
            price: pkg.price,
            services: pkg.serviceTasks.map(task => task.taskName),
          }));
          
          setServicePackages(mappedPackages);
        } catch (error) {
          // Fallback to constants on error
          setServicePackages(SERVICE_PACKAGES);
        } finally {
          setIsLoadingPackages(false);
        }
      };

      fetchServicePackages();
    }
  }, [visible]);

  // Payment methods
  const paymentMethods = [
    {
      id: 'qr_code',
      name: 'Quét mã QR',
      icon: 'qr-code-outline',
      type: 'qr',
      description: 'Quét mã QR để thanh toán nhanh'
    }
  ];

  // Immediate hire form data
  const [immediateData, setImmediateData] = useState({
    workLocation: '123 Đường ABC, Quận 1, TP.HCM',
    salary: '',
    timeSlotGroups: [] as {
      id: string;
      days: string[];
      timeSlots: { slot: string; start: string; end: string }[];
    }[],
    tasks: [] as Task[],
    durationType: '',
    durationValue: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    selectedDate: '',
    selectedPackage: '',
    startHour: '',
    startMinute: '',
    note: '',
  });

  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerType, setTimePickerType] = useState<'hour' | 'minute'>('hour');

  // Modal states
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showCustomLocationInput, setShowCustomLocationInput] = useState(false);
  const [customLocation, setCustomLocation] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleClose = () => {
    setSelectedProfiles([]);
    setCurrentStep(1);
    setIsSubmitting(false);
    setShowValidation(false);
    setShowLocationModal(false);
    setShowCustomLocationInput(false);
    setCustomLocation('');
    setShowErrorModal(false);
    setErrorMessage('');
    setAvailableSchedule(null);
    setIsLoadingSchedule(false);
    onClose();
  };

  // Helper function to format location display
  const formatLocationDisplay = (address?: string, latitude?: number, longitude?: number): string => {
    if (address && address.trim() !== '' && address !== 'Chưa có địa chỉ') {
      return address;
    }
    if (latitude !== undefined && longitude !== undefined) {
      return `Tọa độ: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    }
    return 'Chưa có địa chỉ';
  };

  const handleSelectLocation = (location: string, latitude?: number, longitude?: number) => {
    const displayLocation = formatLocationDisplay(location, latitude, longitude);
    setImmediateData(prev => ({ ...prev, workLocation: displayLocation }));
    setShowLocationModal(false);
    setShowCustomLocationInput(false);
    setCustomLocation('');
  };

  const handleCustomLocationSelect = () => {
    setShowLocationModal(false);
    setShowCustomLocationInput(true);
  };

  const handleSaveCustomLocation = () => {
    if (customLocation.trim()) {
      setImmediateData(prev => ({ ...prev, workLocation: customLocation }));
      setShowCustomLocationInput(false);
      setCustomLocation('');
    }
  };

  const [showValidation, setShowValidation] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    tasks: false,
    duration: false,
    note: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Helper functions
  // Format salary display
  const formatSalary = (salary: string) => {
    if (!salary) return '';
    const num = parseInt(salary);
    return num.toLocaleString('vi-VN') + ' VNĐ/giờ';
  };

  const handleNext = () => {
    console.log('=== handleNext called ===');
    console.log('Current Step:', currentStep);
    
    if (currentStep === 1) {
      console.log('Step 1 validation');
      console.log('Selected Profiles:', selectedProfiles);
      
      if (!selectedProfiles || selectedProfiles.length === 0) {
        console.log('Validation failed: No profiles selected');
        setShowValidation(true);
        return;
      }
      
      console.log('Step 1 validation passed, moving to step 2');
      setShowValidation(false);
      setCurrentStep(2);
      
    } else if (currentStep === 2) {
      console.log('Step 2 validation');
      console.log('Selected Package:', immediateData.selectedPackage);
      console.log('Work Location:', immediateData.workLocation);
      console.log('Selected Date:', immediateData.selectedDate);
      console.log('Start Time:', immediateData.startHour, immediateData.startMinute);
      
      if (!immediateData.selectedDate) {
        console.log('Validation failed: No date selected');
        Alert.alert('Thiếu thông tin', 'Vui lòng chọn ngày làm việc');
        return;
      }
      
      if (!immediateData.startHour || !immediateData.startMinute) {
        console.log('Validation failed: No time selected');
        Alert.alert('Thiếu thông tin', 'Vui lòng chọn giờ bắt đầu');
        return;
      }
      
      if (!immediateData.selectedPackage) {
        console.log('Validation failed: No package selected');
        Alert.alert('Thiếu thông tin', 'Vui lòng chọn gói dịch vụ');
        return;
      }
      
      console.log('Step 2 validation passed, moving to step 3');
      setCurrentStep(3);
      
    } else if (currentStep === 3) {
      console.log('Step 3 validation passed, moving to step 4');
      setCurrentStep(4);
    }
  };

  // Helper function to format date from "T2, 29 Thg 12 2025" to "2025-12-29"
  const formatDateForAPI = (dateStr: string): string => {
    if (!dateStr) {
      return new Date().toISOString().split('T')[0];
    }

    // Try to parse the date string
    // Format: "T2, 29 Thg 12 2025" or similar
    const monthMap: { [key: string]: string } = {
      'Thg 1': '01', 'Thg 2': '02', 'Thg 3': '03', 'Thg 4': '04',
      'Thg 5': '05', 'Thg 6': '06', 'Thg 7': '07', 'Thg 8': '08',
      'Thg 9': '09', 'Thg 10': '10', 'Thg 11': '11', 'Thg 12': '12',
    };

    try {
      // Extract date parts
      const parts = dateStr.split(', ');
      if (parts.length >= 2) {
        const datePart = parts[1]; // "29 Thg 12 2025"
        const dateMatch = datePart.match(/(\d+)\s+(Thg \d+)\s+(\d+)/);
        if (dateMatch) {
          const day = dateMatch[1].padStart(2, '0');
          const month = monthMap[dateMatch[2]] || '01';
          const year = dateMatch[3];
          return `${year}-${month}-${day}`;
        }
      }
      
      // Fallback: try to parse as ISO date or use today
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }
    } catch (error) {
      // Default to today on error
    }

    // Default to today
    return new Date().toISOString().split('T')[0];
  };

  const handleSubmit = async () => {
    console.log('=== handleSubmit called ===');
    console.log('Selected Package:', immediateData.selectedPackage);
    console.log('Work Location:', immediateData.workLocation);
    console.log('Selected Profiles:', selectedProfiles);
    
    if (!user?.id) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
      return;
    }

    if (selectedProfiles.length === 0) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn người cần chăm sóc');
      return;
    }

    if (!immediateData.selectedPackage) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn gói dịch vụ');
      return;
    }

    if (!immediateData.selectedDate) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn ngày làm việc');
      return;
    }

    if (!immediateData.startHour || !immediateData.startMinute) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn giờ bắt đầu');
      return;
    }

    if (!immediateData.workLocation) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn địa điểm làm việc');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get selected elderly profile
      const selectedProfile = elderlyProfiles.find(p => p.id === selectedProfiles[0]);
      if (!selectedProfile) {
        throw new Error('Không tìm thấy hồ sơ người già đã chọn');
      }

      // Get location from elderly profile
      const location = selectedProfile.location || {
        address: immediateData.workLocation,
        latitude: 0.1, // Default fallback
        longitude: 0.1, // Default fallback
      };

      // Format date for API
      const workDate = formatDateForAPI(immediateData.selectedDate);

      // Parse hour and minute to numbers
      const startHour = parseInt(immediateData.startHour, 10);
      const startMinute = parseInt(immediateData.startMinute, 10);

      if (isNaN(startHour) || isNaN(startMinute)) {
        throw new Error('Giờ bắt đầu không hợp lệ');
      }

      // Prepare API request
      const requestData = {
        elderlyProfileId: selectedProfile.id,
        caregiverProfileId: caregiver.id, // Assuming caregiver.id is the caregiverProfileId
        location: {
          address: location.address,
          latitude: location.latitude,
          longitude: location.longitude,
        },
        workDate: workDate,
        startHour: startHour,
        startMinute: startMinute,
        servicePackageId: immediateData.selectedPackage,
        note: immediateData.note || undefined,
      };

      // Call API
      const response = await mainService.createCareService(requestData);
      
      if (response.status === 'Success') {
        setIsSubmitting(false);
        setShowSuccessModal(true);
      } else {
        // Handle error response
        const errorMsg = response.message || 'Không thể tạo lịch hẹn. Vui lòng thử lại.';
        setIsSubmitting(false);
        setErrorMessage(errorMsg);
        setShowErrorModal(true);
      }
    } catch (error: any) {
      setIsSubmitting(false);
      
      // Handle unexpected errors (should not happen if service handles errors properly)
      let errorMsg = 'Không thể tạo lịch hẹn. Vui lòng thử lại.';
      
      // Only use error message if it's from API response
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    }
  };

  const handleSuccessClose = () => {
    console.log('Success modal closed');
    setShowSuccessModal(false);
    handleClose();
  };

  const handleErrorClose = () => {
    setShowErrorModal(false);
    setErrorMessage('');
  };

  const handleCopyToClipboard = async (text: string, label: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('Đã sao chép', `${label} đã được sao chép vào clipboard`);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể sao chép');
    }
  };

  const handleAddNewProfile = (newProfile: Omit<ElderlyProfile, 'id'>) => {
    // Generate new ID
    const newId = `NEW_${Date.now()}`;
    const profileWithId = {
      ...newProfile,
      id: newId,
    };

    // Add to profiles list
    setElderlyProfiles(prev => [...prev, profileWithId]);

    // Auto-select the new profile
    setSelectedProfiles([newId]);

    Alert.alert('Thành công', 'Đã thêm người già mới thành công!');
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>Chọn người cần chăm sóc</ThemedText>
      <ThemedText style={styles.stepDescription}>
        Vui lòng chọn người thân cần được chăm sóc cho lịch hẹn này. Bạn có thể chọn 1 người hoặc thêm mới.
      </ThemedText>
      {isLoadingElderly ? (
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Đang tải danh sách người cần chăm sóc...</ThemedText>
        </View>
      ) : (
        <ElderlyProfileSelector
          profiles={elderlyProfiles}
          selectedProfiles={selectedProfiles}
          onSelectionChange={setSelectedProfiles}
          showValidation={showValidation}
          hideTitle={true}
          onAddNewProfile={handleAddNewProfile}
        />
      )}
    </View>
  );

  const renderStep2 = () => {
      return (
        <View style={styles.stepContent}>
          <ThemedText style={styles.stepTitle}>Thông tin thuê dịch vụ</ThemedText>
          
          {/* Section 1: Basic Info */}
          <View style={styles.sectionContainer}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => toggleSection('basicInfo')}
            >
              <ThemedText style={styles.sectionTitle}>📋 Thông tin cơ bản</ThemedText>
              <Ionicons 
                name={expandedSections.basicInfo ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#68C2E8" 
              />
            </TouchableOpacity>
            
            {expandedSections.basicInfo && (
              <View style={styles.sectionContent}>
                <View style={styles.inputGroup}>
                  <View style={styles.labelContainer}>
                    <ThemedText style={styles.inputLabel}>Địa điểm làm việc</ThemedText>
                    <ThemedText style={styles.requiredMark}>*</ThemedText>
                  </View>

                  <View style={[styles.locationSelector, styles.locationSelectorDisabled]}>
                    <View style={styles.locationContent}>
                      <Ionicons name="location" size={20} color="white" />
                      <View style={styles.locationTextContainer}>
                        <ThemedText style={styles.locationTitle}>
                          {immediateData.workLocation ? 'Địa chỉ từ hồ sơ người già' : 'Chưa có địa chỉ'}
                        </ThemedText>
                        {immediateData.workLocation && (
                          <ThemedText style={styles.locationAddress}>
                            {immediateData.workLocation}
                          </ThemedText>
                        )}
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.locationWarning}>
                    <ThemedText style={styles.locationWarningMark}>*</ThemedText>
                    <ThemedText style={styles.locationWarningText}>
                      Bạn chỉ có thể thay đổi địa chỉ từ thông tin cơ bản của người già trong mục Hồ sơ người già
                    </ThemedText>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Section 2: Date & Time Selection */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>📅 Ngày giờ làm việc</ThemedText>
            </View>
            
            <View style={styles.sectionContent}>
              {/* Date Selection */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <ThemedText style={styles.inputLabel}>Ngày làm việc</ThemedText>
                  <ThemedText style={styles.requiredMark}>*</ThemedText>
                </View>
                <TouchableOpacity 
                  style={styles.pickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <ThemedText style={[
                    styles.pickerButtonText,
                    !immediateData.selectedDate && styles.placeholderText
                  ]}>
                    {immediateData.selectedDate || 'Chọn ngày làm việc'}
                  </ThemedText>
                  <Ionicons name="calendar-outline" size={20} color="#68C2E8" />
                </TouchableOpacity>
              </View>

              {/* Available Schedule Display - Only show after date is selected */}
              {immediateData.selectedDate && (
                <View style={styles.inputGroup}>
                  {isLoadingSchedule ? (
                    <View style={styles.scheduleLoadingContainer}>
                      <ThemedText style={styles.scheduleLoadingText}>Đang tải lịch rảnh...</ThemedText>
                    </View>
                  ) : availableSchedule && (() => {
                    // Convert selectedDate to API format (YYYY-MM-DD) for comparison
                    const selectedDateApiFormat = formatDateForAPI(immediateData.selectedDate);
                    
                    // Filter booked slots for the selected date
                    const bookedSlotsForDate = availableSchedule.data.booked_slots.filter(
                      (slot: BookedSlot) => slot.date === selectedDateApiFormat
                    );
                    
                    // Check if available all time or no booked slots for this date
                    const isDateAvailable = availableSchedule.data.available_all_time || bookedSlotsForDate.length === 0;
                    
                    return (
                      <View style={styles.scheduleInfoContainer}>
                        {isDateAvailable ? (
                          <View style={styles.scheduleStatusAvailable}>
                            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                            <ThemedText style={styles.scheduleStatusText}>
                              Ngày này nhân viên rảnh toàn bộ thời gian
                            </ThemedText>
                          </View>
                        ) : (
                          <View style={styles.scheduleStatusBusy}>
                            <Ionicons name="time-outline" size={20} color="#F59E0B" />
                            <ThemedText style={styles.scheduleStatusText}>
                              Ngày này nhân viên có các khung giờ đã bận:
                            </ThemedText>
                            {bookedSlotsForDate.length > 0 && (
                              <View style={styles.bookedSlotsContainer}>
                                {bookedSlotsForDate.map((slot: BookedSlot, index: number) => (
                                  <View key={index} style={styles.bookedSlotItem}>
                                    <Ionicons name="time" size={16} color="#F59E0B" />
                                    <ThemedText style={styles.bookedSlotText}>
                                      {slot.start_time} - {slot.end_time}
                                    </ThemedText>
                                  </View>
                                ))}
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    );
                  })()}
                </View>
              )}

              {/* Time Selection */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <ThemedText style={styles.inputLabel}>Giờ bắt đầu</ThemedText>
                  <ThemedText style={styles.requiredMark}>*</ThemedText>
                </View>
                <View style={styles.timePickerContainer}>
                  <TouchableOpacity 
                    style={styles.pickerButton}
                    onPress={() => {
                      setTimePickerType('hour');
                      setShowTimePicker(true);
                    }}
                  >
                    <ThemedText style={[
                      styles.pickerButtonText,
                      !immediateData.startHour && styles.placeholderText
                    ]}>
                      {immediateData.startHour || 'Giờ'}
                    </ThemedText>
                  </TouchableOpacity>
                  
                  <ThemedText style={styles.timeSeparator}>:</ThemedText>
                  
                  <TouchableOpacity 
                    style={styles.pickerButton}
                    onPress={() => {
                      setTimePickerType('minute');
                      setShowTimePicker(true);
                    }}
                  >
                    <ThemedText style={[
                      styles.pickerButtonText,
                      !immediateData.startMinute && styles.placeholderText
                    ]}>
                      {immediateData.startMinute || 'Phút'}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
                
                {immediateData.startHour && immediateData.startMinute && (
                  <ThemedText style={styles.timeRangeText}>
                    Giờ bắt đầu: {immediateData.startHour}:{immediateData.startMinute}
                  </ThemedText>
                )}
              </View>
            </View>
          </View>

          {/* Section 3: Service Package */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Chọn gói dịch vụ</ThemedText>
            </View>
            
            <View style={styles.sectionContent}>
              {isLoadingPackages ? (
                <View style={styles.loadingContainer}>
                  <ThemedText style={styles.loadingText}>Đang tải danh sách gói dịch vụ...</ThemedText>
                </View>
              ) : (
                <ScrollView 
                  style={styles.packagesScrollView}
                  contentContainerStyle={styles.packagesContainer}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                  indicatorStyle={Platform.OS === 'ios' ? 'default' : undefined}
                  scrollIndicatorInsets={{ right: 8, top: 4, bottom: 4 }}
                  fadingEdgeLength={Platform.OS === 'android' ? 20 : undefined}
                >
                  {servicePackages.map((pkg) => (
                    <TouchableOpacity
                      key={pkg.id}
                      style={[
                        styles.packageCard,
                        immediateData.selectedPackage === pkg.id && styles.packageCardSelected
                      ]}
                      onPress={() => setImmediateData(prev => ({ ...prev, selectedPackage: pkg.id }))}
                    >
                      {immediateData.selectedPackage === pkg.id && (
                        <View style={styles.packageCheckmark}>
                          <Ionicons name="checkmark-circle" size={24} color="#68C2E8" />
                        </View>
                      )}
                      
                      <ThemedText style={styles.packageName}>{pkg.name}</ThemedText>
                      
                      <View style={styles.packageDetails}>
                        <View style={styles.packageDetailItem}>
                          <Ionicons name="time-outline" size={16} color="#6c757d" />
                          <ThemedText style={styles.packageDetailText}>{pkg.duration}h</ThemedText>
                        </View>
                        <ThemedText style={styles.packagePrice}>
                          {pkg.price.toLocaleString('vi-VN')} VNĐ
                        </ThemedText>
                      </View>
                      
                      <View style={styles.packageServices}>
                        <ThemedText style={styles.packageServicesTitle}>Dịch vụ bao gồm:</ThemedText>
                        {pkg.services.map((service, index) => (
                          <View key={index} style={styles.packageServiceItem}>
                            <Ionicons name="checkmark" size={16} color="#68C2E8" />
                            <ThemedText style={styles.packageServiceText}>{service}</ThemedText>
                          </View>
                        ))}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>

          {/* Section 3: Note */}
          <View style={styles.sectionContainer}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('note')}
            >
              <ThemedText style={styles.sectionTitle}>📝 Ghi chú</ThemedText>
              <Ionicons 
                name={expandedSections.note ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#68C2E8" 
              />
            </TouchableOpacity>
            
            {expandedSections.note && (
              <View style={styles.sectionContent}>
                <View style={styles.labelContainer}>
                  <ThemedText style={styles.inputLabel}>Ghi chú thêm</ThemedText>
          </View>
              <TextInput
                style={styles.noteInput}
                placeholder="Nhập ghi chú của bạn..."
                value={immediateData?.note || ''}
                onChangeText={(text) => {
                  setImmediateData(prev => ({
                    ...prev,
                    note: text
                  }));
                }}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              </View>
                )}
              </View>

        </View>
      );
  };

  const renderStep3 = () => {
    console.log('=== Rendering Step 3 (Review) ===');
    console.log('immediateData:', immediateData);
    return (
      <View style={styles.stepContent}>
        <ThemedText style={styles.stepTitle}>Xem trước thông tin</ThemedText>
        
        <View style={styles.reviewContainer}>
          {/* Work Location */}
          <View style={styles.reviewItem}>
            <ThemedText style={styles.reviewLabel}>Địa điểm làm việc:</ThemedText>
            <ThemedText style={styles.reviewValue}>
              {immediateData?.workLocation || 'Chưa chọn'}
            </ThemedText>
          </View>

          {/* Date and Time */}
          <View style={styles.reviewItem}>
            <ThemedText style={styles.reviewLabel}>Ngày làm việc:</ThemedText>
            <ThemedText style={styles.reviewValue}>
              {immediateData?.selectedDate || 'Chưa chọn'}
            </ThemedText>
          </View>

          <View style={styles.reviewItem}>
            <ThemedText style={styles.reviewLabel}>Giờ bắt đầu:</ThemedText>
            <ThemedText style={styles.reviewValue}>
              {immediateData?.startHour && immediateData?.startMinute 
                ? `${immediateData.startHour}:${immediateData.startMinute}` 
                : 'Chưa chọn'}
            </ThemedText>
          </View>

          {/* Selected Package */}
          <View style={styles.reviewItem}>
            <ThemedText style={styles.reviewLabel}>Gói dịch vụ:</ThemedText>
            <ThemedText style={styles.reviewValue}>
              {immediateData?.selectedPackage ? 
                servicePackages.find(p => p.id === immediateData.selectedPackage)?.name : 'Chưa chọn'}
            </ThemedText>
          </View>

          {/* Total Price */}
          <View style={styles.reviewItem}>
            <ThemedText style={styles.reviewLabel}>Tổng chi phí:</ThemedText>
            <ThemedText style={styles.reviewValue}>
              {immediateData?.selectedPackage ? 
                `${servicePackages.find(p => p.id === immediateData.selectedPackage)?.price.toLocaleString('vi-VN')} VNĐ` : 'Chưa tính'}
            </ThemedText>
          </View>

          {/* Note */}
          {immediateData?.note && (
            <View style={styles.reviewItem}>
              <ThemedText style={styles.reviewLabel}>Ghi chú:</ThemedText>
              <ThemedText style={styles.reviewValue}>{immediateData.note}</ThemedText>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Payment step removed - payment will be done after caregiver completes the booking
  /*
  const renderStep4 = () => {
    console.log('=== Rendering Step 4 (Payment) ===');
    console.log('selectedPaymentMethod:', selectedPaymentMethod);
    
    const selectedPackage = servicePackages.find(p => p.id === immediateData.selectedPackage);
    const totalAmount = selectedPackage?.price || 0;
    
    // Generate booking ID for QR code
    const bookingId = `BK${Date.now().toString().slice(-8)}`;
    
    // Bank account info
    const bankInfo = {
      bankName: 'Ngân hàng TMCP Á Châu (ACB)',
      accountNumber: '123456789',
      accountName: 'NGUYEN VAN A',
      branch: 'Chi nhánh TP.HCM'
    };
    
    return (
      <View style={styles.stepContent}>
        <ThemedText style={styles.stepTitle}>Chọn phương thức thanh toán</ThemedText>
        
        <View style={styles.paymentContainer}>
          {/* Total Amount Display *\/}
          <View style={styles.paymentSummary}>
            <ThemedText style={styles.paymentSummaryLabel}>Tổng thanh toán:</ThemedText>
            <ThemedText style={styles.paymentSummaryAmount}>
              {totalAmount.toLocaleString('vi-VN')} VNĐ
            </ThemedText>
          </View>

          {/* Payment Methods *\/}
          <View style={styles.paymentMethodsContainer}>
            <ThemedText style={styles.sectionSubtitle}>Phương thức thanh toán</ThemedText>
            
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethodCard,
                  selectedPaymentMethod === method.id && styles.paymentMethodCardSelected
                ]}
                onPress={() => setSelectedPaymentMethod(method.id)}
              >
                <View style={styles.paymentMethodContent}>
                  <View style={[
                    styles.paymentMethodIcon,
                    selectedPaymentMethod === method.id && styles.paymentMethodIconSelected
                  ]}>
                    <Ionicons 
                      name={method.icon as any} 
                      size={24} 
                      color={selectedPaymentMethod === method.id ? '#68C2E8' : '#6c757d'} 
                    />
                  </View>
                  <View style={styles.paymentMethodTextContainer}>
                    <ThemedText style={[
                      styles.paymentMethodName,
                      selectedPaymentMethod === method.id && styles.paymentMethodNameSelected
                    ]}>
                      {method.name}
                    </ThemedText>
                    <ThemedText style={styles.paymentMethodDescription}>
                      {method.description}
                    </ThemedText>
                  </View>
                </View>
                {selectedPaymentMethod === method.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#68C2E8" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Payment Details - QR Code *\/}
          {selectedPaymentMethod === 'qr_code' && (
            <View style={styles.paymentDetailsContainer}>
              <View style={styles.paymentDetailsHeader}>
                <Ionicons name="qr-code" size={24} color="#68C2E8" />
                <ThemedText style={styles.paymentDetailsTitle}>Quét mã QR để thanh toán</ThemedText>
              </View>
              
              <View style={styles.qrCodeContainer}>
                <View style={styles.qrCodePlaceholder}>
                  <Ionicons name="qr-code-outline" size={120} color="#68C2E8" />
                  <ThemedText style={styles.qrCodeText}>Mã QR thanh toán</ThemedText>
                  <ThemedText style={styles.qrCodeSubtext}>
                    {totalAmount.toLocaleString('vi-VN')} VNĐ
                  </ThemedText>
                </View>
                
                <View style={styles.qrCodeInfo}>
                  <ThemedText style={styles.qrCodeInfoText}>
                    Mã booking: <ThemedText style={styles.qrCodeInfoBold}>{bookingId}</ThemedText>
                  </ThemedText>
                  <ThemedText style={styles.qrCodeInfoText}>
                    Ngân hàng: <ThemedText style={styles.qrCodeInfoBold}>{bankInfo.bankName}</ThemedText>
                  </ThemedText>
                </View>
              </View>
              
              <View style={styles.paymentNote}>
                <Ionicons name="information-circle-outline" size={20} color="#68C2E8" />
                <ThemedText style={styles.paymentNoteText}>
                  Mở ứng dụng ngân hàng và quét mã QR để thanh toán. Hệ thống sẽ tự động xác nhận sau khi thanh toán thành công.
                </ThemedText>
              </View>
            </View>
          )}

          {/* Default Note *\/}
          {!selectedPaymentMethod && (
            <View style={styles.paymentNote}>
              <Ionicons name="information-circle-outline" size={20} color="#68C2E8" />
              <ThemedText style={styles.paymentNoteText}>
                Vui lòng chọn phương thức thanh toán để tiếp tục.
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    );
  };
  */

  const renderCurrentStep = () => {
    console.log('=== renderCurrentStep ===');
    console.log('Current step:', currentStep);
    
    switch (currentStep) {
      case 1: 
        console.log('Rendering Step 1');
        return renderStep1();
      case 2: 
        console.log('Rendering Step 2');
        return renderStep2();
      case 3: 
        console.log('Rendering Step 3');
        return renderStep3();
      default: 
        console.log('Default: Rendering Step 1');
        return renderStep1();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <ThemedText style={styles.headerTitle}>Đặt lịch với {caregiver.name}</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Bước {currentStep}/3
            </ThemedText>
          </View>

          <View style={styles.placeholder} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(currentStep / 3) * 100}%` }
              ]} 
            />
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderCurrentStep()}
        </ScrollView>

        {/* Navigation */}
        <View style={[styles.navigation, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.previousButton} onPress={() => setCurrentStep(prev => prev - 1)}>
              <Ionicons name="chevron-back" size={20} color="#68C2E8" />
              <ThemedText style={styles.previousButtonText}>Trước</ThemedText>
            </TouchableOpacity>
          )}
          
          <View style={styles.navigationSpacer} />
          
          <TouchableOpacity 
            style={styles.nextButton} 
            onPress={() => {
              console.log('=== Button clicked ===');
              console.log('Current Step:', currentStep);
              console.log('Is Submitting:', isSubmitting);
              
              if (currentStep === 1) {
                handleNext();
              } else if (currentStep === 2) {
                handleNext();
              } else if (currentStep === 3) {
                console.log('Calling handleSubmit');
                handleSubmit();
              }
            }}
            disabled={isSubmitting}
          >
            <ThemedText style={styles.nextButtonText}>
              {isSubmitting ? 'Đang xử lý...' : 
               currentStep === 2 ? 'Xem trước' : 
               currentStep === 3 ? 'Xác nhận đặt lịch' : 'Tiếp theo'}
            </ThemedText>
            {!isSubmitting && (
              <Ionicons name="chevron-forward" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>

        {/* Location Selection Modal */}
        <Modal
          visible={showLocationModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowLocationModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.locationModal}>
              <View style={styles.modalHeaderClose}>
                <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                  <Ionicons name="close" size={24} color="#6c757d" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.locationList} showsVerticalScrollIndicator={false}>
                {/* Addresses from selected elderly profiles */}
                {selectedProfiles.length > 0 && (
                  <View style={styles.locationSection}>
                    <ThemedText style={styles.locationSectionTitle}>Địa chỉ người thân</ThemedText>
                    {elderlyProfiles
                      .filter(profile => selectedProfiles.includes(profile.id))
                      .map((profile) => (
                        <View
                          key={profile.id}
                          style={[
                            styles.locationOption,
                            immediateData.workLocation === formatLocationDisplay(profile.address, profile.location?.latitude, profile.location?.longitude) && styles.locationOptionSelected
                          ]}
                        >
                          <TouchableOpacity
                            style={styles.locationOptionTouchable}
                            onPress={() => handleSelectLocation(
                              profile.address, 
                              profile.location?.latitude, 
                              profile.location?.longitude
                            )}
                          >
                            <View style={styles.locationOptionContent}>
                              <View style={styles.locationOptionIcon}>
                                <Ionicons name="home" size={24} color="#68C2E8" />
                              </View>
                              <View style={styles.locationOptionText}>
                                <ThemedText style={styles.locationOptionName}>{profile.name}</ThemedText>
                                <ThemedText style={styles.locationOptionAddress}>
                                  {formatLocationDisplay(
                                    profile.address, 
                                    profile.location?.latitude, 
                                    profile.location?.longitude
                                  )}
                                </ThemedText>
                              </View>
                            </View>
                            {immediateData.workLocation === formatLocationDisplay(profile.address, profile.location?.latitude, profile.location?.longitude) && (
                              <Ionicons name="checkmark-circle" size={24} color="#68C2E8" />
                            )}
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.editLocationButton}
                            onPress={() => {
                              // Handle edit location
                              Alert.alert('Chỉnh sửa địa chỉ', `Chỉnh sửa địa chỉ của ${profile.name}`);
                            }}
                          >
                            <Ionicons name="create-outline" size={20} color="#68C2E8" />
                          </TouchableOpacity>
                        </View>
                      ))}
                  </View>
                )}

                {/* Custom location option */}
                <View style={styles.locationSection}>
                  <ThemedText style={styles.locationSectionTitle}>Địa chỉ khác</ThemedText>
                  <View style={styles.locationOption}>
                    <TouchableOpacity
                      style={styles.locationOptionTouchable}
                      onPress={handleCustomLocationSelect}
                    >
                      <View style={styles.locationOptionContent}>
                        <View style={styles.locationOptionIcon}>
                          <Ionicons name="add-circle" size={24} color="#68C2E8" />
                        </View>
                        <View style={styles.locationOptionText}>
                          <ThemedText style={styles.locationOptionName}>Nhập địa chỉ khác</ThemedText>
                          <ThemedText style={styles.locationOptionAddress}>Nhập địa chỉ tùy chỉnh</ThemedText>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#6c757d" />
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Custom Location Input Modal */}
        <Modal
          visible={showCustomLocationInput}
          transparent
          animationType="slide"
          onRequestClose={() => {
            setShowCustomLocationInput(false);
            setCustomLocation('');
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.customLocationModal}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => {
                    setShowCustomLocationInput(false);
                    setShowLocationModal(true);
                    setCustomLocation('');
                  }}
                >
                  <Ionicons name="arrow-back" size={24} color="#68C2E8" />
                </TouchableOpacity>
                <ThemedText style={styles.modalTitle}>Nhập địa chỉ</ThemedText>
                <TouchableOpacity onPress={() => {
                  setShowCustomLocationInput(false);
                  setCustomLocation('');
                }}>
                  <Ionicons name="close" size={24} color="#6c757d" />
                </TouchableOpacity>
              </View>

              <View style={styles.customLocationContent}>
                <ThemedText style={styles.inputLabel}>Địa chỉ làm việc</ThemedText>
                <TextInput
                  style={styles.customLocationInput}
                  value={customLocation}
                  onChangeText={setCustomLocation}
                  placeholder="Nhập địa chỉ đầy đủ..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                />

                <TouchableOpacity
                  style={[styles.saveLocationButton, !customLocation.trim() && styles.disabledButton]}
                  onPress={handleSaveCustomLocation}
                  disabled={!customLocation.trim()}
                >
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <ThemedText style={styles.saveLocationButtonText}>Xác nhận</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Date Picker Modal */}
        <Modal
          visible={showDatePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.pickerHeader}>
                <ThemedText style={styles.pickerTitle}>Chọn ngày làm việc</ThemedText>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Ionicons name="close" size={24} color="#6c757d" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.pickerScroll}>
                <View style={styles.pickerContent}>
                  {(() => {
                    const dates = [];
                    const today = new Date();
                    
                    for (let i = 0; i < 30; i++) {
                      const date = new Date(today);
                      date.setDate(today.getDate() + i);
                      
                      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                      const monthNames = ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 
                                        'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12'];
                      
                      const dateStr = `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
                      dates.push(
                        <TouchableOpacity
                          key={i}
                          style={[
                            styles.pickerItem,
                            styles.datePickerItem,
                            immediateData.selectedDate === dateStr && styles.pickerItemSelected
                          ]}
                          onPress={() => {
                            setImmediateData(prev => ({ ...prev, selectedDate: dateStr }));
                            setShowDatePicker(false);
                          }}
                        >
                          <ThemedText style={[
                            styles.pickerText,
                            immediateData.selectedDate === dateStr && styles.pickerTextSelected
                          ]}>
                            {dateStr}
                          </ThemedText>
                        </TouchableOpacity>
                      );
                    }
                    return dates;
                  })()}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Time Picker Modal */}
        <Modal
          visible={showTimePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.pickerHeader}>
                <ThemedText style={styles.pickerTitle}>
                  {timePickerType === 'hour' ? 'Chọn giờ' : 'Chọn phút'}
                </ThemedText>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Ionicons name="close" size={24} color="#6c757d" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.pickerScroll}>
                <View style={styles.pickerContent}>
                  {timePickerType === 'hour' 
                    ? Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return (
                          <TouchableOpacity
                            key={hour}
                            style={[
                              styles.pickerItem,
                              immediateData.startHour === hour && styles.pickerItemSelected
                            ]}
                            onPress={() => {
                              setImmediateData(prev => ({ ...prev, startHour: hour }));
                              setShowTimePicker(false);
                            }}
                          >
                            <ThemedText style={[
                              styles.pickerText,
                              immediateData.startHour === hour && styles.pickerTextSelected
                            ]}>
                              {hour}
                            </ThemedText>
                          </TouchableOpacity>
                        );
                      })
                    : Array.from({ length: 60 }, (_, i) => {
                        const minute = i.toString().padStart(2, '0');
                        return (
                          <TouchableOpacity
                            key={minute}
                            style={[
                              styles.pickerItem,
                              immediateData.startMinute === minute && styles.pickerItemSelected
                            ]}
                            onPress={() => {
                              setImmediateData(prev => ({ ...prev, startMinute: minute }));
                              setShowTimePicker(false);
                            }}
                          >
                            <ThemedText style={[
                              styles.pickerText,
                              immediateData.startMinute === minute && styles.pickerTextSelected
                            ]}>
                              {minute}
                            </ThemedText>
                          </TouchableOpacity>
                        );
                      })
                  }
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Success Modal */}
        <Modal
          visible={showSuccessModal}
          transparent
          animationType="fade"
          onRequestClose={handleSuccessClose}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.successModal}>
              <View style={styles.successIconContainer}>
                <Ionicons name="checkmark-circle" size={80} color="#68C2E8" />
              </View>
              
              <ThemedText style={styles.successTitle}>Đặt lịch thành công!</ThemedText>
              
              <ThemedText style={styles.successMessage}>
                Yêu cầu thuê dịch vụ của bạn đã được gửi đi.
                {'\n\n'}
                Nhân viên chăm sóc sẽ phản hồi với bạn trong thời gian sớm nhất.
                {'\n\n'}
                <ThemedText style={styles.successMessageBold}>Lưu ý:</ThemedText> Bạn sẽ thanh toán sau khi nhân viên hoàn thành công việc.
              </ThemedText>
              
              <TouchableOpacity 
                style={styles.successButton}
                onPress={handleSuccessClose}
              >
                <ThemedText style={styles.successButtonText}>Đóng</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Error Modal */}
        <Modal
          visible={showErrorModal}
          transparent
          animationType="fade"
          onRequestClose={handleErrorClose}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.errorModal}>
              <View style={styles.errorIconContainer}>
                <Ionicons name="close-circle" size={80} color="#EF4444" />
              </View>
              
              <ThemedText style={styles.errorTitle}>Đặt lịch thất bại</ThemedText>
              
              <ThemedText style={styles.errorMessage}>
                {errorMessage || 'Không thể tạo lịch hẹn. Vui lòng thử lại.'}
              </ThemedText>
              
              <TouchableOpacity 
                style={styles.errorButton}
                onPress={handleErrorClose}
              >
                <ThemedText style={styles.errorButtonText}>Đóng</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#68C2E8',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContent: {
    flex: 1,
    paddingTop: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: -10,
    marginBottom: 10,
  },
  stepDescription: {
    fontSize: 15,
    color: '#6c757d',
    lineHeight: 22,
    marginBottom: 20,
  },
  stepSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#68C2E8',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 0,
    textAlign: 'left',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionContent: {
    padding: 20,
  },
  requiredMark: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc3545',
    marginLeft: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  textInput: {
    height: 48,
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#2c3e50',
    backgroundColor: 'white',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  optionCardSelected: {
    borderColor: '#68C2E8',
    backgroundColor: '#f0fdfa',
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    marginLeft: 16,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: '#68C2E8',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6c757d',
  },
  optionDescriptionSelected: {
    color: '#68C2E8',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  previousButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#68C2E8',
  },
  previousButtonText: {
    marginLeft: 8,
    color: '#68C2E8',
    fontWeight: '600',
  },
  navigationSpacer: {
    flex: 1,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#68C2E8',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  nextButtonText: {
    marginRight: 8,
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pickerButton: {
    height: 48,
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  placeholderText: {
    color: '#999',
  },
  timeRangeText: {
    fontSize: 14,
    color: '#68C2E8',
    marginTop: 8,
    fontWeight: '500',
  },
  salaryDisplay: {
    fontSize: 14,
    color: '#68C2E8',
    marginTop: 6,
    fontWeight: '600',
  },
  salaryHint: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 6,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  // Checkbox styles
  checkboxContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#68C2E8',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxBoxChecked: {
    backgroundColor: '#68C2E8',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  locationSelector: {
    backgroundColor: '#E74C3C',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationSelectorDisabled: {
    backgroundColor: '#68C2E8',
    opacity: 0.8,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  locationWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    gap: 4,
  },
  locationWarningMark: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#dc3545',
    lineHeight: 16,
  },
  locationWarningText: {
    fontSize: 12,
    color: '#dc3545',
    flex: 1,
    lineHeight: 16,
  },
  changeLocationButton: {
    padding: 8,
  },
  // Duration Type Styles
  durationTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  durationTypeOption: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  durationTypeOptionSelected: {
    backgroundColor: '#fef2f2',
    borderColor: '#E74C3C',
  },
  durationTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 4,
  },
  durationTypeTextSelected: {
    color: '#E74C3C',
  },
  durationTypeSubtext: {
    fontSize: 12,
    color: '#6c757d',
  },
  durationTypeSubtextSelected: {
    color: '#E74C3C',
  },
  // Date Selection Styles
  dateSelectionContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  dateSelectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateSelectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  dateSelectionMonth: {
    fontSize: 14,
    color: '#6c757d',
  },
  dateScrollView: {
    flexGrow: 0,
  },
  dateCardsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dateCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    minWidth: 60,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateCardSelected: {
    backgroundColor: '#68C2E8',
    borderColor: '#68C2E8',
  },
  dateCardDay: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  dateCardDaySelected: {
    color: 'white',
  },
  dateCardNumber: {
    fontSize: 12,
    color: '#6c757d',
  },
  dateCardNumberSelected: {
    color: 'white',
  },
  // Start Time Styles
  startTimeContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  startTimeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  startTimeLabelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginLeft: 8,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeInput: {
    backgroundColor: '#fef2f2',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    textAlign: 'center',
    minWidth: 40,
  },
  timeSeparator: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  // Time Picker Styles
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  timeInputBoxDisabled: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
    opacity: 0.6,
  },
  timeInputTextDisabled: {
    color: '#adb5bd',
  },
  // Warning Styles
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  warningText: {
    fontSize: 14,
    color: '#E74C3C',
    marginLeft: 8,
    flex: 1,
  },
  timeSeparator: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 20,
    maxHeight: 300,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  pickerScroll: {
    maxHeight: 150,
    width: '100%',
  },
  pickerContent: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  pickerItem: {
    height: 40,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    marginVertical: 2,
  },
  datePickerItem: {
    width: '100%',
    paddingHorizontal: 16,
  },
  pickerItemSelected: {
    backgroundColor: '#68C2E8',
  },
  pickerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6c757d',
  },
  pickerTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  // Summary Styles
  summaryContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
  summaryPrice: {
    fontSize: 16,
    color: '#68C2E8',
    fontWeight: 'bold',
  },
  // Task Styles
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#68C2E8',
    borderStyle: 'dashed',
  },
  addTaskText: {
    fontSize: 14,
    color: '#68C2E8',
    fontWeight: '500',
    marginLeft: 6,
  },
  taskItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  taskInput: {
    backgroundColor: 'white',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#2c3e50',
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 8,
  },
  // Note Styles
  noteInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#2c3e50',
    borderWidth: 1,
    borderColor: '#e9ecef',
    minHeight: 120,
  },
  // Review Styles
  reviewContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  reviewItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  reviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    width: 140,
    marginRight: 8,
  },
  reviewValue: {
    fontSize: 14,
    color: '#495057',
    flex: 1,
    flexWrap: 'wrap',
  },
  // Package Styles
  packagesScrollView: {
    maxHeight: 400,
    paddingRight: 12,
  },
  packagesContainer: {
    gap: 16,
    paddingBottom: 8,
    paddingRight: 8,
  },
  packageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e9ecef',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  packageCardSelected: {
    borderColor: '#68C2E8',
    backgroundColor: '#f0fdf4',
    shadowColor: '#68C2E8',
    shadowOpacity: 0.15,
  },
  packageCheckmark: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  packageName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  packageDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  packageDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  packageDetailText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  packagePrice: {
    fontSize: 16,
    color: '#68C2E8',
    fontWeight: 'bold',
  },
  packageServices: {
    gap: 8,
  },
  packageServicesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  packageServiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  packageServiceText: {
    fontSize: 14,
    color: '#495057',
    flex: 1,
  },
  // Location Modal Styles
  locationModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  locationList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  locationSection: {
    marginBottom: 24,
  },
  locationSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#68C2E8',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    overflow: 'hidden',
  },
  locationOptionSelected: {
    borderColor: '#68C2E8',
    backgroundColor: '#f0fdf4',
  },
  locationOptionTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  editLocationButton: {
    padding: 16,
    borderLeftWidth: 1,
    borderLeftColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F8F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationOptionText: {
    flex: 1,
  },
  locationOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  locationOptionAddress: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  // Custom Location Modal Styles
  customLocationModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeaderClose: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  customLocationContent: {
    padding: 20,
  },
  customLocationInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2c3e50',
    borderWidth: 1,
    borderColor: '#e9ecef',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  saveLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#68C2E8',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  saveLocationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  // Success Modal Styles
  successModal: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  successMessageBold: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  successButton: {
    backgroundColor: '#68C2E8',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#68C2E8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  successButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  // Error Modal Styles
  errorModal: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  errorIconContainer: {
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  errorButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: '100%',
    alignItems: 'center',
  },
  errorButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  // Payment Styles
  paymentContainer: {
    gap: 24,
  },
  paymentSummary: {
    backgroundColor: '#f0f8ff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#68C2E8',
  },
  paymentSummaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  paymentSummaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#68C2E8',
  },
  paymentMethodsContainer: {
    gap: 12,
  },
  paymentMethodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentMethodCardSelected: {
    borderColor: '#68C2E8',
    backgroundColor: '#f0f8ff',
    shadowColor: '#68C2E8',
    shadowOpacity: 0.15,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  paymentMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  paymentMethodIconSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#68C2E8',
  },
  paymentMethodTextContainer: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  paymentMethodNameSelected: {
    color: '#68C2E8',
  },
  paymentMethodDescription: {
    fontSize: 13,
    color: '#6c757d',
  },
  paymentNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#68C2E8',
  },
  paymentNoteText: {
    flex: 1,
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  paymentDetailsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
    gap: 16,
  },
  paymentDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  paymentDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  bankInfoContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  bankInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  bankInfoLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
    minWidth: 100,
  },
  bankInfoValue: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
    textAlign: 'right',
  },
  bankInfoValueBold: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
  bankInfoValueWithCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  copyButton: {
    padding: 6,
    backgroundColor: '#e3f2fd',
    borderRadius: 6,
  },
  bankInfoDivider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 8,
  },
  qrCodeContainer: {
    alignItems: 'center',
    gap: 16,
  },
  qrCodePlaceholder: {
    width: 240,
    height: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#68C2E8',
    borderStyle: 'dashed',
    padding: 20,
  },
  qrCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 16,
  },
  qrCodeSubtext: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#68C2E8',
    marginTop: 8,
  },
  qrCodeInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    gap: 8,
  },
  qrCodeInfoText: {
    fontSize: 14,
    color: '#6c757d',
  },
  qrCodeInfoBold: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6c757d',
  },
  // Schedule Display Styles
  scheduleLoadingContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scheduleLoadingText: {
    fontSize: 14,
    color: '#6c757d',
  },
  scheduleInfoContainer: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  scheduleStatusAvailable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scheduleStatusBusy: {
    gap: 12,
  },
  scheduleStatusText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
    flex: 1,
  },
  bookedSlotsContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    gap: 8,
  },
  bookedSlotsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 4,
  },
  bookedSlotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  bookedSlotText: {
    fontSize: 13,
    color: '#6c757d',
  },
});
