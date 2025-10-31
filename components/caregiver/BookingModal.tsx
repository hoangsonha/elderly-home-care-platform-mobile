import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { ElderlyProfileSelector } from '@/components/elderly/ElderlyProfileSelector';
import { ThemedText } from '@/components/themed-text';
import { Task, TaskSelector } from '@/components/ui/TaskSelector';

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
}

interface BookingModalProps {
  visible: boolean;
  onClose: () => void;
  caregiver: Caregiver;
  elderlyProfiles: ElderlyProfile[];
  immediateOnly?: boolean;
}

type BookingType = 'immediate' | 'schedule';

export function BookingModal({ visible, onClose, caregiver, elderlyProfiles, immediateOnly = false }: BookingModalProps) {
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [bookingType] = useState<BookingType>('immediate'); // Always immediate
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Service packages
  const servicePackages = [
    {
      id: 'basic',
      name: 'Gói cơ bản',
      duration: 4,
      price: 400000,
      services: ['Chăm sóc cơ bản', 'Vệ sinh cá nhân', 'Hỗ trợ ăn uống']
    },
    {
      id: 'standard',
      name: 'Gói tiêu chuẩn',
      duration: 8,
      price: 750000,
      services: ['Chăm sóc toàn diện', 'Vệ sinh cá nhân', 'Hỗ trợ ăn uống', 'Đi lại vận động', 'Uống thuốc đúng giờ']
    },
    {
      id: 'premium',
      name: 'Gói cao cấp',
      duration: 12,
      price: 1100000,
      services: ['Chăm sóc 24/7', 'Vệ sinh cá nhân', 'Hỗ trợ ăn uống', 'Đi lại vận động', 'Uống thuốc đúng giờ', 'Theo dõi sức khỏe', 'Trò chuyện động viên']
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
    startHour: '',
    startMinute: '',
    note: '',
  });

  // Modal states
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showCustomLocationInput, setShowCustomLocationInput] = useState(false);
  const [customLocation, setCustomLocation] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleClose = () => {
    setSelectedProfiles([]);
    setCurrentStep(1);
    setIsSubmitting(false);
    setShowValidation(false);
    setShowLocationModal(false);
    setShowCustomLocationInput(false);
    setCustomLocation('');
    onClose();
  };

  const handleSelectLocation = (location: string) => {
    setImmediateData(prev => ({ ...prev, workLocation: location }));
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
    workTime: false,
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
      
      if (!immediateData.selectedPackage) {
        console.log('Validation failed: No package selected');
        Alert.alert('Thiếu thông tin', 'Vui lòng chọn gói dịch vụ');
        return;
      }
      
      console.log('Step 2 validation passed, moving to step 3');
      setCurrentStep(3);
    }
  };

  const handleSubmit = async () => {
    console.log('=== handleSubmit called ===');
    console.log('Selected Package:', immediateData.selectedPackage);
    console.log('Work Location:', immediateData.workLocation);
    console.log('Selected Profiles:', selectedProfiles);
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('=== API call completed ===');
      setIsSubmitting(false);
      console.log('Showing success modal');
      setShowSuccessModal(true);
    }, 1500);
  };

  const handleSuccessClose = () => {
    console.log('Success modal closed');
    setShowSuccessModal(false);
    handleClose();
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <ElderlyProfileSelector
        profiles={elderlyProfiles}
        selectedProfiles={selectedProfiles}
        onSelectionChange={setSelectedProfiles}
        showValidation={showValidation}
      />
    </View>
  );

  const renderStep2 = () => {
      return (
        <View style={styles.stepContent}>
          <ThemedText style={styles.stepTitle}>Thông tin thuê ngay lập tức</ThemedText>
          
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
                color="#4ECDC4" 
              />
            </TouchableOpacity>
            
            {expandedSections.basicInfo && (
              <View style={styles.sectionContent}>
                <View style={styles.inputGroup}>
                  <View style={styles.labelContainer}>
                    <ThemedText style={styles.inputLabel}>Địa điểm làm việc</ThemedText>
                    <ThemedText style={styles.requiredMark}>*</ThemedText>
                  </View>

                  <TouchableOpacity 
                    style={styles.locationSelector}
                    onPress={() => setShowLocationModal(true)}
                  >
                    <View style={styles.locationContent}>
                      <Ionicons name="location" size={20} color="white" />
                      <View style={styles.locationTextContainer}>
                        <ThemedText style={styles.locationTitle}>
                          {immediateData.workLocation ? 'Địa chỉ đã chọn' : 'Chọn địa điểm làm việc'}
                        </ThemedText>
                        {immediateData.workLocation && (
                          <ThemedText style={styles.locationAddress}>
                            {immediateData.workLocation}
                          </ThemedText>
                        )}
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Section 2: Service Package */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>📦 Chọn gói dịch vụ</ThemedText>
            </View>
            
            <View style={styles.sectionContent}>
              <View style={styles.packagesContainer}>
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
                        <Ionicons name="checkmark-circle" size={24} color="#27AE60" />
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
                          <Ionicons name="checkmark" size={16} color="#27AE60" />
                          <ThemedText style={styles.packageServiceText}>{service}</ThemedText>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
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
                color="#4ECDC4" 
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
            <ThemedText style={styles.reviewLabel}>📍 Địa điểm làm việc:</ThemedText>
            <ThemedText style={styles.reviewValue}>
              {immediateData?.workLocation || 'Chưa chọn'}
            </ThemedText>
          </View>

          {/* Selected Package */}
          <View style={styles.reviewItem}>
            <ThemedText style={styles.reviewLabel}>📦 Gói dịch vụ:</ThemedText>
            <ThemedText style={styles.reviewValue}>
              {immediateData?.selectedPackage ? 
                servicePackages.find(p => p.id === immediateData.selectedPackage)?.name : 'Chưa chọn'}
            </ThemedText>
          </View>

          {/* Total Price */}
          <View style={styles.reviewItem}>
            <ThemedText style={styles.reviewLabel}>💰 Tổng chi phí:</ThemedText>
            <ThemedText style={styles.reviewValue}>
              {immediateData?.selectedPackage ? 
                `${servicePackages.find(p => p.id === immediateData.selectedPackage)?.price.toLocaleString('vi-VN')} VNĐ` : 'Chưa tính'}
            </ThemedText>
          </View>

          {/* Note */}
          {immediateData?.note && (
            <View style={styles.reviewItem}>
              <ThemedText style={styles.reviewLabel}>📄 Ghi chú:</ThemedText>
              <ThemedText style={styles.reviewValue}>{immediateData.note}</ThemedText>
            </View>
          )}
        </View>
      </View>
    );
  };

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
        <View style={styles.navigation}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.previousButton} onPress={() => setCurrentStep(prev => prev - 1)}>
              <Ionicons name="chevron-back" size={20} color="#4ECDC4" />
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
               currentStep === 3 ? 'Xác nhận' : 'Tiếp theo'}
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
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>Chọn địa điểm làm việc</ThemedText>
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
                        <TouchableOpacity
                          key={profile.id}
                          style={[
                            styles.locationOption,
                            immediateData.workLocation === profile.address && styles.locationOptionSelected
                          ]}
                          onPress={() => handleSelectLocation(profile.address)}
                        >
                          <View style={styles.locationOptionContent}>
                            <View style={styles.locationOptionIcon}>
                              <Ionicons name="home" size={24} color="#4ECDC4" />
                            </View>
                            <View style={styles.locationOptionText}>
                              <ThemedText style={styles.locationOptionName}>{profile.name}</ThemedText>
                              <ThemedText style={styles.locationOptionAddress}>{profile.address}</ThemedText>
                            </View>
                          </View>
                          {immediateData.workLocation === profile.address && (
                            <Ionicons name="checkmark-circle" size={24} color="#27AE60" />
                          )}
                        </TouchableOpacity>
                      ))}
                  </View>
                )}

                {/* Custom location option */}
                <View style={styles.locationSection}>
                  <ThemedText style={styles.locationSectionTitle}>Địa chỉ khác</ThemedText>
                  <TouchableOpacity
                    style={styles.locationOption}
                    onPress={handleCustomLocationSelect}
                  >
                    <View style={styles.locationOptionContent}>
                      <View style={styles.locationOptionIcon}>
                        <Ionicons name="add-circle" size={24} color="#4ECDC4" />
                      </View>
                      <View style={styles.locationOptionText}>
                        <ThemedText style={styles.locationOptionName}>Nhập địa chỉ khác</ThemedText>
                        <ThemedText style={styles.locationOptionAddress}>Nhập địa chỉ tùy chỉnh</ThemedText>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#6c757d" />
                  </TouchableOpacity>
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
                  <Ionicons name="arrow-back" size={24} color="#4ECDC4" />
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
                <Ionicons name="checkmark-circle" size={80} color="#27AE60" />
              </View>
              
              <ThemedText style={styles.successTitle}>Đặt lịch thành công! 🎉</ThemedText>
              
              <ThemedText style={styles.successMessage}>
                Yêu cầu thuê ngay lập tức của bạn đã được gửi đi.
                {'\n\n'}
                Nhân viên chăm sóc sẽ liên hệ với bạn trong thời gian sớm nhất.
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
    backgroundColor: '#4ECDC4',
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
    backgroundColor: '#4ECDC4',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContent: {
    flex: 1,
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
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ECDC4',
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
    borderColor: '#4ECDC4',
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
    color: '#4ECDC4',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6c757d',
  },
  optionDescriptionSelected: {
    color: '#4ECDC4',
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
    borderColor: '#4ECDC4',
  },
  previousButtonText: {
    marginLeft: 8,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  navigationSpacer: {
    flex: 1,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
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
    color: '#4ECDC4',
    marginTop: 8,
    fontWeight: '500',
  },
  salaryDisplay: {
    fontSize: 14,
    color: '#4ECDC4',
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
    borderColor: '#4ECDC4',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxBoxChecked: {
    backgroundColor: '#4ECDC4',
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
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
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
  pickerItemSelected: {
    backgroundColor: '#4ECDC4',
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
    color: '#27AE60',
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
    borderColor: '#4ECDC4',
    borderStyle: 'dashed',
  },
  addTaskText: {
    fontSize: 14,
    color: '#4ECDC4',
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
  packagesContainer: {
    gap: 16,
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
    borderColor: '#27AE60',
    backgroundColor: '#f0fdf4',
    shadowColor: '#27AE60',
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
    color: '#27AE60',
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
    color: '#4ECDC4',
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
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  locationOptionSelected: {
    borderColor: '#27AE60',
    backgroundColor: '#f0fdf4',
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
    backgroundColor: '#4ECDC4',
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
  successButton: {
    backgroundColor: '#27AE60',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#27AE60',
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
});
