import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';

interface ElderlyProfile {
  id: string;
  name: string;
  age: number;
  currentCaregivers: number;
  family: string;
  healthStatus: 'good' | 'fair' | 'poor';
  avatar?: string;
}

interface ElderlyProfileSelectorProps {
  profiles: ElderlyProfile[];
  selectedProfiles: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  showValidation?: boolean;
  hideTitle?: boolean; // Option to hide the title when used in a modal/form with its own title
  onAddNewProfile?: (profile: Omit<ElderlyProfile, 'id'>) => void; // Callback to add new elderly profile
  onNavigateToAddElderly?: () => void; // Callback to navigate to add elderly page
}

export function ElderlyProfileSelector({
  profiles,
  selectedProfiles,
  onSelectionChange,
  showValidation = false,
  hideTitle = false,
  onAddNewProfile,
  onNavigateToAddElderly,
}: ElderlyProfileSelectorProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProfile, setNewProfile] = useState({
    name: '',
    age: '',
    gender: '',
    weight: '',
    height: '',
    family: '',
    healthStatus: 'good' as 'good' | 'fair' | 'poor',
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    age: '',
    gender: '',
    weight: '',
    height: '',
  });
  const handleProfileToggle = (profileId: string) => {
    if (selectedProfiles.includes(profileId)) {
      onSelectionChange([]);
    } else {
      onSelectionChange([profileId]); // Chỉ cho phép chọn 1 người
    }
  };

  const validateForm = (): boolean => {
    const errors = {
      name: '',
      age: '',
      gender: '',
      weight: '',
      height: '',
    };
    let hasError = false;

    // Validate name
    if (!newProfile.name.trim()) {
      errors.name = 'Vui lòng nhập họ và tên';
      hasError = true;
    }

    // Validate age
    if (!newProfile.age.trim()) {
      errors.age = 'Vui lòng nhập tuổi';
      hasError = true;
    } else {
      const age = parseInt(newProfile.age);
      if (isNaN(age)) {
        errors.age = 'Tuổi phải là số';
        hasError = true;
      } else if (age < 50 || age > 120) {
        errors.age = 'Tuổi phải từ 50 đến 120';
        hasError = true;
      }
    }

    // Validate gender
    if (!newProfile.gender) {
      errors.gender = 'Vui lòng chọn giới tính';
      hasError = true;
    }

    // Validate weight (optional but must be valid if entered)
    if (newProfile.weight.trim()) {
      const weight = parseFloat(newProfile.weight);
      if (isNaN(weight) || weight <= 0 || weight > 300) {
        errors.weight = 'Cân nặng không hợp lệ (0-300kg)';
        hasError = true;
      }
    }

    // Validate height (optional but must be valid if entered)
    if (newProfile.height.trim()) {
      const height = parseFloat(newProfile.height);
      if (isNaN(height) || height <= 0 || height > 250) {
        errors.height = 'Chiều cao không hợp lệ (0-250cm)';
        hasError = true;
      }
    }

    setFormErrors(errors);
    return !hasError;
  };

  const handleAddNewProfile = () => {
    // Validate
    if (!validateForm()) {
      return;
    }

    // Call callback
    if (onAddNewProfile) {
      onAddNewProfile({
        name: newProfile.name.trim(),
        age: parseInt(newProfile.age),
        family: newProfile.family.trim() || 'Gia đình mới',
        healthStatus: newProfile.healthStatus,
        currentCaregivers: 0,
      });
    }

    // Reset and close
    setNewProfile({
      name: '',
      age: '',
      gender: '',
      weight: '',
      height: '',
      family: '',
      healthStatus: 'good',
    });
    setFormErrors({
      name: '',
      age: '',
      gender: '',
      weight: '',
      height: '',
    });
    setShowAddModal(false);
    Alert.alert('Thành công', 'Đã thêm người già mới!');
  };

  const getHealthStatusText = (status: string) => {
    switch (status) {
      case 'good': return 'Tốt';
      case 'fair': return 'Trung bình';
      case 'poor': return 'Yếu';
      default: return 'Không xác định';
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'good': return '#28a745';
      case 'fair': return '#ffc107';
      case 'poor': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const renderProfile = ({ item }: { item: ElderlyProfile }) => {
    const isSelected = selectedProfiles.includes(item.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.profileCard,
          isSelected && styles.profileCardSelected
        ]}
        onPress={() => handleProfileToggle(item.id)}
      >
        <View style={styles.profileHeader}>
          {/* Avatar */}
          {item.avatar ? (
            <Image 
              source={{ uri: item.avatar }} 
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <ThemedText style={styles.avatarText}>
                {item.name.split(' ').pop()?.charAt(0) || '?'}
              </ThemedText>
            </View>
          )}
          
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <ThemedText style={[
                styles.profileName,
                isSelected && styles.profileNameSelected
              ]}>
                {item.name}
              </ThemedText>
              <ThemedText style={[
                styles.profileAge,
                isSelected && styles.profileAgeSelected
              ]}>
                {item.age} tuổi
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.selectionIndicator}>
            {isSelected ? (
              <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
            ) : (
              <View style={styles.unselectedCircle} />
            )}
          </View>
        </View>

        <View style={styles.profileDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="medical" size={16} color={isSelected ? '#4ECDC4' : '#6c757d'} />
            <ThemedText style={[
              styles.detailText,
              isSelected && styles.detailTextSelected
            ]}>
              Sức khỏe: 
              <ThemedText style={[
                styles.healthStatus,
                { color: getHealthStatusColor(item.healthStatus) }
              ]}>
                {' '}{getHealthStatusText(item.healthStatus)}
              </ThemedText>
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const hasSelection = selectedProfiles && selectedProfiles.length > 0;
  const showError = showValidation && !hasSelection;

  return (
    <View style={styles.container}>
      {!hideTitle && (
        <>
          <View style={styles.titleContainer}>
            <ThemedText style={styles.title}>Chọn người già cần chăm sóc</ThemedText>
            <ThemedText style={styles.requiredMark}>*</ThemedText>
          </View>
          <ThemedText style={styles.subtitle}>
            Chỉ có thể chọn 1 người già
          </ThemedText>
        </>
      )}
      {showError && (
        <ThemedText style={styles.errorText}>
          Vui lòng chọn ít nhất một người già
        </ThemedText>
      )}
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.profilesList}
      >
        {profiles.map((profile) => (
          <View key={profile.id}>
            {renderProfile({ item: profile })}
          </View>
        ))}

        {/* Add New Profile Button */}
        {(onAddNewProfile || onNavigateToAddElderly) && (
          <TouchableOpacity
            style={styles.addNewButton}
            onPress={() => {
              if (onNavigateToAddElderly) {
                onNavigateToAddElderly();
              } else if (onAddNewProfile) {
                setShowAddModal(true);
              }
            }}
          >
            <Ionicons name="add-circle-outline" size={24} color="#68C2E8" />
            <ThemedText style={styles.addNewButtonText}>
              Thêm người già mới
            </ThemedText>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Add New Profile Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Thêm người già mới</ThemedText>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#6c757d" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Name */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>
                  Họ và tên <ThemedText style={styles.requiredMark}>*</ThemedText>
                </ThemedText>
                <TextInput
                  style={[
                    styles.textInput,
                    formErrors.name && styles.textInputError
                  ]}
                  placeholder="Nhập họ và tên"
                  value={newProfile.name}
                  onChangeText={(text) => {
                    setNewProfile({ ...newProfile, name: text });
                    if (formErrors.name) {
                      setFormErrors({ ...formErrors, name: '' });
                    }
                  }}
                />
                {formErrors.name && (
                  <ThemedText style={styles.errorText}>{formErrors.name}</ThemedText>
                )}
              </View>

              {/* Age & Gender Row */}
              <View style={styles.inputRow}>
                <View style={styles.inputGroupHalf}>
                  <ThemedText style={styles.inputLabel}>
                    Tuổi <ThemedText style={styles.requiredMark}>*</ThemedText>
                  </ThemedText>
                  <TextInput
                    style={[
                      styles.textInput,
                      formErrors.age && styles.textInputError
                    ]}
                    placeholder="Tuổi"
                    value={newProfile.age}
                    onChangeText={(text) => {
                      setNewProfile({ ...newProfile, age: text });
                      if (formErrors.age) {
                        setFormErrors({ ...formErrors, age: '' });
                      }
                    }}
                    keyboardType="numeric"
                  />
                  {formErrors.age && (
                    <ThemedText style={styles.errorText}>{formErrors.age}</ThemedText>
                  )}
                </View>
                <View style={styles.inputGroupHalf}>
                  <ThemedText style={styles.inputLabel}>
                    Giới tính <ThemedText style={styles.requiredMark}>*</ThemedText>
                  </ThemedText>
                  <View style={styles.genderContainer}>
                    <TouchableOpacity
                      style={[
                        styles.genderButton,
                        newProfile.gender === 'Nam' && styles.genderButtonActive,
                        formErrors.gender && styles.genderButtonError
                      ]}
                      onPress={() => {
                        setNewProfile({ ...newProfile, gender: 'Nam' });
                        if (formErrors.gender) {
                          setFormErrors({ ...formErrors, gender: '' });
                        }
                      }}
                    >
                      <ThemedText style={[
                        styles.genderText,
                        newProfile.gender === 'Nam' && styles.genderTextActive
                      ]}>Nam</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.genderButton,
                        newProfile.gender === 'Nữ' && styles.genderButtonActive,
                        formErrors.gender && styles.genderButtonError
                      ]}
                      onPress={() => {
                        setNewProfile({ ...newProfile, gender: 'Nữ' });
                        if (formErrors.gender) {
                          setFormErrors({ ...formErrors, gender: '' });
                        }
                      }}
                    >
                      <ThemedText style={[
                        styles.genderText,
                        newProfile.gender === 'Nữ' && styles.genderTextActive
                      ]}>Nữ</ThemedText>
                    </TouchableOpacity>
                  </View>
                  {formErrors.gender && (
                    <ThemedText style={styles.errorText}>{formErrors.gender}</ThemedText>
                  )}
                </View>
              </View>

              {/* Weight & Height Row */}
              <View style={styles.inputRow}>
                <View style={styles.inputGroupHalf}>
                  <ThemedText style={styles.inputLabel}>Cân nặng</ThemedText>
                  <TextInput
                    style={[
                      styles.textInput,
                      formErrors.weight && styles.textInputError
                    ]}
                    placeholder="kg"
                    value={newProfile.weight}
                    onChangeText={(text) => {
                      setNewProfile({ ...newProfile, weight: text });
                      if (formErrors.weight) {
                        setFormErrors({ ...formErrors, weight: '' });
                      }
                    }}
                    keyboardType="numeric"
                  />
                  {formErrors.weight && (
                    <ThemedText style={styles.errorText}>{formErrors.weight}</ThemedText>
                  )}
                </View>
                <View style={styles.inputGroupHalf}>
                  <ThemedText style={styles.inputLabel}>Chiều cao</ThemedText>
                  <TextInput
                    style={[
                      styles.textInput,
                      formErrors.height && styles.textInputError
                    ]}
                    placeholder="cm"
                    value={newProfile.height}
                    onChangeText={(text) => {
                      setNewProfile({ ...newProfile, height: text });
                      if (formErrors.height) {
                        setFormErrors({ ...formErrors, height: '' });
                      }
                    }}
                    keyboardType="numeric"
                  />
                  {formErrors.height && (
                    <ThemedText style={styles.errorText}>{formErrors.height}</ThemedText>
                  )}
                </View>
              </View>
              
              {/* Family */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>
                  Tên gia đình <ThemedText style={styles.requiredMark}>*</ThemedText>
                </ThemedText>
                <TextInput
                  style={styles.textInput}
                  placeholder="VD: Gia đình Nguyễn"
                  value={newProfile.family}
                  onChangeText={(text) => setNewProfile({ ...newProfile, family: text })}
                />
              </View>

              {/* Health Status */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>
                  Tình trạng sức khỏe <ThemedText style={styles.requiredMark}>*</ThemedText>
                </ThemedText>
                <View style={styles.healthStatusOptions}>
                  {[
                    { value: 'good', label: 'Tốt', color: '#28a745' },
                    { value: 'fair', label: 'Trung bình', color: '#ffc107' },
                    { value: 'poor', label: 'Yếu', color: '#dc3545' }
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.healthOption,
                        newProfile.healthStatus === option.value && styles.healthOptionSelected,
                        { borderColor: option.color }
                      ]}
                      onPress={() => setNewProfile({ ...newProfile, healthStatus: option.value as any })}
                    >
                      <ThemedText style={[
                        styles.healthOptionText,
                        newProfile.healthStatus === option.value && { color: option.color }
                      ]}>
                        {option.label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <ThemedText style={styles.cancelButtonText}>Hủy</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddNewProfile}
              >
                <ThemedText style={styles.saveButtonText}>Thêm</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  requiredMark: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc3545',
    marginLeft: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#dc3545',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  profilesList: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  profileCardSelected: {
    borderColor: '#4ECDC4',
    backgroundColor: '#f0fdfa',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#e9ecef',
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#68C2E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  profileNameSelected: {
    color: '#4ECDC4',
  },
  profileAge: {
    fontSize: 13,
    color: '#6c757d',
    fontWeight: '500',
  },
  profileAgeSelected: {
    color: '#4ECDC4',
  },
  selectionIndicator: {
    marginLeft: 10,
  },
  unselectedCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  profileDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#6c757d',
  },
  detailTextSelected: {
    color: '#4ECDC4',
  },
  healthStatus: {
    fontWeight: '600',
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#68C2E8',
    borderStyle: 'dashed',
  },
  addNewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#68C2E8',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  inputGroupHalf: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
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
  textInputError: {
    borderColor: '#dc3545',
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 4,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'white',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e9ecef',
  },
  genderButtonActive: {
    backgroundColor: '#e8f6f3',
    borderColor: '#68C2E8',
  },
  genderButtonError: {
    borderColor: '#dc3545',
    borderWidth: 2,
  },
  genderText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6c757d',
  },
  genderTextActive: {
    color: '#68C2E8',
  },
  healthStatusOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  healthOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  healthOptionSelected: {
    backgroundColor: '#f0fdf4',
  },
  healthOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#68C2E8',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
