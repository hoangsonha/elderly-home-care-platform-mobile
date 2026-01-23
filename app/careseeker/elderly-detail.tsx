import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SimpleNavBar } from '@/components/navigation/SimpleNavBar';
import { ThemedText } from '@/components/themed-text';
import { ElderlyProfile } from '@/types/elderly';
import { UserService, ElderlyProfileApiResponse, UpdateElderlyProfileRequest } from '@/services/user.service';
import { DynamicInputList } from '@/components/ui/DynamicInputList';
import { DynamicMedicationList } from '@/components/ui/DynamicMedicationList';
import { LocationPickerModal } from '@/components/ui/LocationPickerModal';
import { SuccessModal } from '@/components/ui/SuccessModal';
import { ErrorModal } from '@/components/ui/ErrorModal';
import { useEmergencyContact } from '@/contexts/EmergencyContactContext';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import {
    renderEnvironmentTab,
    renderIndependenceTab,
    renderMedicalTab,
    renderPreferencesTab
} from './_elderly-profile-tabs';


export default function ElderlyDetailScreen() {
  const params = useLocalSearchParams();
  
  // Normalize id param - có thể là 'id' hoặc 'profileId' (handle array case)
  const idParam = params.id || params.profileId;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  
  console.log('=== ElderlyDetailScreen ===');
  console.log('Raw params:', params);
  console.log('ID param (id or profileId):', idParam);
  console.log('Normalized id:', id);
  console.log('ID type:', typeof id);
  console.log('ID value:', id);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [elderlyProfile, setElderlyProfile] = useState<ElderlyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const { tempContacts, setTempContacts } = useEmergencyContact();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Load elderly profile from API
  useEffect(() => {
    const loadElderlyProfile = async () => {
      console.log('=== loadElderlyProfile ===');
      console.log('Checking id:', id);
      console.log('ID is truthy?', !!id);
      console.log('ID is string?', typeof id === 'string');
      console.log('ID length:', id ? String(id).length : 0);
      
      if (!id || (typeof id === 'string' && id.trim() === '')) {
        console.error('ID is missing or empty');
        setError('Không tìm thấy ID người già');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const elderlyId = typeof id === 'string' ? id.trim() : String(id);
        console.log('Calling API with ID:', elderlyId);
        console.log('API Endpoint: GET /api/v1/elderly/' + elderlyId);
        
        // Get elderly profile by ID using the new API endpoint
        const profile = await UserService.getElderlyProfileById(elderlyId);
        
        console.log('API Response received:', profile);
        console.log('Profile ID:', profile.elderlyProfileId);

        // Parse profileData if it's a string
        let profileData: any = {};
        if (profile.profileData) {
          try {
            profileData = typeof profile.profileData === 'string' 
              ? JSON.parse(profile.profileData) 
              : profile.profileData;
          } catch (e) {
            console.warn('Failed to parse profileData:', e);
          }
        }

        // Parse careRequirement if it exists
        let careRequirement: any = {};
        if (profile.careRequirement) {
          try {
            careRequirement = typeof profile.careRequirement === 'string'
              ? JSON.parse(profile.careRequirement)
              : profile.careRequirement;
          } catch (e) {
            console.warn('Failed to parse careRequirement:', e);
          }
        }

        // Parse location if it's a string - lấy tọa độ để mở Google Maps
        let locationLat = 0;
        let locationLng = 0;
        if (profile.location) {
          try {
            const location = typeof profile.location === 'string'
              ? JSON.parse(profile.location)
              : profile.location;
            locationLat = location.latitude || 0;
            locationLng = location.longitude || 0;
          } catch (e) {
            console.warn('Failed to parse location:', e);
          }
        }

        // Parse emergency contacts from profileData
        const emergencyContacts = profileData?.emergency_contacts || [];

        // Helper function to map Vietnamese independence level to English
        const mapIndependenceLevel = (level: string): 'independent' | 'assisted' | 'dependent' => {
          if (!level) return 'independent';
          const levelLower = level.toLowerCase();
          if (levelLower.includes('tự lập') || levelLower === 'independent') return 'independent';
          if (levelLower.includes('cần hỗ trợ') || levelLower === 'assisted') return 'assisted';
          if (levelLower.includes('phụ thuộc') || levelLower === 'dependent') return 'dependent';
          return 'independent';
        };

        // Map independence_level from Vietnamese keys to English
        // API returns: { "ăn uống": "Tự lập", "tắm rửa": "Cần hỗ trợ", "vệ sinh": "...", "di chuyển": "...", "mặc quần áo": "..." }
        const independenceLevelObj = profileData?.independence_level || {};
        const independenceLevel = {
          eating: mapIndependenceLevel(independenceLevelObj['ăn uống'] || independenceLevelObj['eating']),
          bathing: mapIndependenceLevel(independenceLevelObj['tắm rửa'] || independenceLevelObj['bathing']),
          toileting: mapIndependenceLevel(independenceLevelObj['vệ sinh'] || independenceLevelObj['toileting']),
          mobility: mapIndependenceLevel(independenceLevelObj['di chuyển'] || independenceLevelObj['mobility']),
          dressing: mapIndependenceLevel(independenceLevelObj['mặc quần áo'] || independenceLevelObj['dressing']),
        };

        // Map healthStatus from API values (GOOD, STABLE, CRITICAL) to UI values (good, fair, poor)
        const mapHealthStatus = (status: string | null): 'good' | 'fair' | 'poor' => {
          if (!status) return 'fair';
          const statusUpper = status.toUpperCase();
          if (statusUpper === 'GOOD' || statusUpper === 'STABLE') return 'good';
          if (statusUpper === 'FAIR' || statusUpper === 'MODERATE') return 'fair';
          if (statusUpper === 'POOR' || statusUpper === 'CRITICAL' || statusUpper === 'WEAK') return 'poor';
          return 'fair';
        };

        // Map API response to ElderlyProfile type
        const mappedProfile: ElderlyProfile = {
          id: profile.elderlyProfileId,
          name: profile.fullName,
          age: profile.age,
          avatar: profile.avatarUrl || undefined,
          healthStatus: mapHealthStatus(profile.healthStatus),
          currentCaregivers: 0, // Not available in API
          family: '', // Not available in API
          personalInfo: {
            name: profile.fullName,
            age: profile.age,
            phoneNumber: profile.phoneNumber || '',
            address: '', // Không dùng address nữa, dùng tọa độ
          },
          medicalConditions: {
            underlyingDiseases: profileData?.medical_conditions?.underlying_diseases || [],
            specialConditions: profileData?.medical_conditions?.special_conditions || [],
            allergies: profileData?.medical_conditions?.allergies || profileData?.allergies || [],
            medications: profileData?.medical_conditions?.medications || [],
          },
          independenceLevel: independenceLevel,
          careNeeds: {
            conversation: careRequirement?.skills?.['kĩ năng bắt buộc']?.includes('Trò chuyện') || false,
            reminders: careRequirement?.skills?.['kĩ năng bắt buộc']?.includes('Nhắc nhở') || false,
            dietSupport: careRequirement?.skills?.['kĩ năng bắt buộc']?.includes('Hỗ trợ ăn uống') || false,
            exercise: careRequirement?.skills?.['kĩ năng bắt buộc']?.includes('Tập thể dục') || false,
            medicationManagement: careRequirement?.skills?.['kĩ năng bắt buộc']?.includes('Quản lý thuốc') || false,
            companionship: careRequirement?.skills?.['kĩ năng bắt buộc']?.includes('Đồng hành') || false,
          },
          preferences: {
            hobbies: profileData?.hobbies || [],
            favoriteActivities: profileData?.favorite_activities || [],
            foodPreferences: profileData?.favorite_food || [],
          },
          livingEnvironment: {
            houseType: profileData?.living_environment?.house_type || '',
            livingWith: profileData?.living_environment?.living_with || [],
            surroundings: profileData?.living_environment?.surroundings || '',
            accessibility: profileData?.living_environment?.accessibility || [],
          },
          // Store additional data for rendering
          emergencyContacts: emergencyContacts,
          birthDate: profile.birthDate,
          gender: profile.gender,
          weight: profileData?.weight,
          height: profileData?.height,
          bloodType: profileData?.bloodType || profileData?.blood_type,
          locationLat: locationLat,
          locationLng: locationLng,
          note: profile.note,
          careRequirement: careRequirement,
        } as any;

        console.log('Mapped profile:', mappedProfile);
        setElderlyProfile(mappedProfile);
      } catch (err: any) {
        console.error('=== Error loading elderly profile ===');
        console.error('Error object:', err);
        console.error('Error message:', err.message);
        console.error('Error response:', err.response?.data);
        console.error('Error status:', err.response?.status);
        setError(err.message || 'Không thể tải thông tin người già');
      } finally {
        setLoading(false);
      }
    };

    loadElderlyProfile();
  }, [id, refreshKey]);

  // Sync emergency contacts từ context khi quay lại từ emergency-contacts page
  useFocusEffect(
    React.useCallback(() => {
      if (isEditMode && editData && tempContacts.length > 0) {
        // Update editData với tempContacts từ context
        setEditData({
          ...editData,
          emergency_contacts: tempContacts
        });
      }
    }, [tempContacts, isEditMode])
  );

  // Helper functions
  const getHealthStatusColor = (status: ElderlyProfile['healthStatus']) => {
    switch (status) {
      case 'good': return '#68C2E8';
      case 'fair': return '#ffc107';
      case 'poor': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getHealthStatusText = (status: ElderlyProfile['healthStatus']) => {
    switch (status) {
      case 'good': return 'Sức khỏe Tốt';
      case 'fair': return 'Sức khỏe Trung bình';
      case 'poor': return 'Sức khỏe Yếu';
      default: return 'Không rõ';
    }
  };

  // Helper function to format year only
  const formatYear = (dateString?: string) => {
    if (!dateString) return 'Không có thông tin';
    try {
      const date = new Date(dateString);
      return date.getFullYear().toString();
    } catch {
      // Try to extract year from string
      const yearMatch = dateString.match(/\d{4}/);
      return yearMatch ? yearMatch[0] : 'Không có thông tin';
    }
  };

  // Helper function to format gender
  const formatGender = (gender?: string) => {
    if (!gender) return 'Không có thông tin';
    return gender === 'MALE' ? 'Nam' : gender === 'FEMALE' ? 'Nữ' : gender;
  };

  // Helper function to map independence level to Vietnamese
  const mapIndependenceLevelToVietnamese = (level: string): string => {
    switch (level) {
      case 'independent': return 'Tự lập';
      case 'assisted': return 'Cần hỗ trợ';
      case 'dependent': return 'Phụ thuộc';
      default: return 'Tự lập';
    }
  };

  // Helper function to map Vietnamese independence level to English
  const mapVietnameseToIndependenceLevel = (level: string): 'independent' | 'assisted' | 'dependent' => {
    const levelLower = level.toLowerCase();
    if (levelLower.includes('tự lập') || levelLower === 'independent') return 'independent';
    if (levelLower.includes('cần hỗ trợ') || levelLower === 'assisted') return 'assisted';
    if (levelLower.includes('phụ thuộc') || levelLower === 'dependent') return 'dependent';
    return 'independent';
  };

  // Render Overview tab in edit mode - reuse form from add-elderly.tsx
  const renderOverviewTabEdit = (profile: ElderlyProfile, extendedProfile: any, emergencyContacts: any[]) => {
    // Map editData to format similar to add-elderly profile structure
    const profileData = editData || {};
    
    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.editSection}>
          <ThemedText style={styles.editSectionTitle}>Thông tin cá nhân</ThemedText>
          
          {/* Name */}
          <View style={styles.editInputGroup}>
            <View style={styles.editLabelContainer}>
              <ThemedText style={styles.editInputLabel}>Họ và tên</ThemedText>
            </View>
            <TextInput
              style={styles.editTextInput}
              value={profileData.name || ''}
              onChangeText={(text) => setEditData({ ...editData, name: text })}
              placeholder="Nhập họ và tên"
            />
          </View>

          {/* Birth Year and Gender Row */}
          <View style={styles.editInputRow}>
            <View style={styles.editInputGroupHalf}>
              <View style={styles.editLabelContainer}>
                <ThemedText style={styles.editInputLabel}>Năm sinh</ThemedText>
              </View>
              <TextInput
                style={styles.editTextInput}
                value={profileData.birth_year?.toString() || ''}
                onChangeText={(text) => {
                  const year = parseInt(text) || undefined;
                  setEditData({ ...editData, birth_year: year });
                }}
                placeholder="Ví dụ: 1940"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.editInputGroupHalf}>
              <View style={styles.editLabelContainer}>
                <ThemedText style={styles.editInputLabel}>Giới tính</ThemedText>
              </View>
              <View style={styles.editGenderContainer}>
                <TouchableOpacity
                  style={[
                    styles.editGenderButton,
                    profileData.gender === 'MALE' && styles.editGenderButtonActive
                  ]}
                  onPress={() => setEditData({ ...editData, gender: 'MALE' })}
                >
                  <ThemedText style={[
                    styles.editGenderText,
                    profileData.gender === 'MALE' && styles.editGenderTextActive
                  ]}>Nam</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.editGenderButton,
                    profileData.gender === 'FEMALE' && styles.editGenderButtonActive
                  ]}
                  onPress={() => setEditData({ ...editData, gender: 'FEMALE' })}
                >
                  <ThemedText style={[
                    styles.editGenderText,
                    profileData.gender === 'FEMALE' && styles.editGenderTextActive
                  ]}>Nữ</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Weight and Height Row */}
          <View style={styles.editInputRow}>
            <View style={styles.editInputGroupHalf}>
              <ThemedText style={styles.editInputLabel}>Cân nặng</ThemedText>
              <TextInput
                style={styles.editTextInput}
                value={profileData.weight?.toString() || ''}
                onChangeText={(text) => {
                  const weight = parseFloat(text) || undefined;
                  setEditData({ ...editData, weight });
                }}
                placeholder="kg"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.editInputGroupHalf}>
              <ThemedText style={styles.editInputLabel}>Chiều cao</ThemedText>
              <TextInput
                style={styles.editTextInput}
                value={profileData.height?.toString() || ''}
                onChangeText={(text) => {
                  const height = parseFloat(text) || undefined;
                  setEditData({ ...editData, height });
                }}
                placeholder="cm"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Emergency Contacts */}
          <View style={styles.editInputGroup}>
            <View style={styles.editEmergencyContactsSection}>
              <View style={styles.editEmergencyContactsHeader}>
                <ThemedText style={styles.editSectionTitle}>Liên hệ khẩn cấp</ThemedText>
                <ThemedText style={styles.editEmergencyContactsCount}>
                  {(profileData.emergency_contacts || []).length} liên hệ
                </ThemedText>
              </View>
              <TouchableOpacity 
                style={styles.editManageContactsButton}
                onPress={() => {
                  // Set tempContacts với dữ liệu hiện tại trước khi navigate
                  const currentContacts = profileData.emergency_contacts || [];
                  console.log('Setting tempContacts before navigate:', currentContacts);
                  setTempContacts(currentContacts);
                  // Small delay to ensure context is updated
                  setTimeout(() => {
                    router.push('/careseeker/emergency-contacts');
                  }, 100);
                }}
              >
                <Ionicons name="call-outline" size={20} color="#68C2E8" />
                <ThemedText style={styles.editManageContactsText}>Quản lý liên hệ khẩn cấp</ThemedText>
                <Ionicons name="chevron-forward" size={20} color="#7F8C8D" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Note */}
          <View style={styles.editInputGroup}>
            <ThemedText style={styles.editInputLabel}>Ghi chú</ThemedText>
            <TextInput
              style={[styles.editTextInput, styles.editTextArea]}
              value={profileData.note || ''}
              onChangeText={(text) => setEditData({ ...editData, note: text })}
              placeholder="Nhập ghi chú"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Location Picker */}
          <View style={styles.editInputGroup}>
            <View style={styles.editLabelContainer}>
              <ThemedText style={styles.editInputLabel}>Vị trí</ThemedText>
            </View>
            {profileData.location ? (
              <TouchableOpacity
                style={styles.editLocationDisplayCard}
                onPress={() => setShowLocationPicker(true)}
              >
                <View style={styles.editLocationInfoContainer}>
                  <Ionicons name="location" size={24} color="#68C2E8" />
                  <View style={styles.editLocationTextContainer}>
                    <ThemedText style={styles.editLocationLabel}>Vị trí đã chọn</ThemedText>
                    <ThemedText style={styles.editLocationTextDisplay} numberOfLines={2}>
                      {profileData.location.address || `Tọa độ: ${profileData.location.latitude?.toFixed(6)}, ${profileData.location.longitude?.toFixed(6)}`}
                    </ThemedText>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#7F8C8D" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.editUploadButton}
                onPress={() => setShowLocationPicker(true)}
              >
                <Ionicons name="map" size={40} color="#68C2E8" />
                <ThemedText style={styles.editUploadText}>Chọn vị trí trên bản đồ</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Location Picker Modal */}
        <LocationPickerModal
          visible={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
          onLocationSelect={(location) => {
            setEditData({
              ...editData,
              location: {
                latitude: location.latitude,
                longitude: location.longitude,
                address: location.address || '',
              }
            });
            setShowLocationPicker(false);
          }}
        />
      </ScrollView>
    );
  };

  // Render Medical tab in edit mode
  const renderMedicalTabEdit = (profile: ElderlyProfile) => {
    const profileData = editData || {};
    const medicalConditions = profileData.medical_conditions || {
      underlying_diseases: [],
      special_conditions: [],
      allergies: [],
      medications: [],
    };

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.editSection}>
          <ThemedText style={styles.editSectionTitle}>Thông tin y tế</ThemedText>
          
          <View style={styles.editInputGroup}>
            <DynamicInputList
              items={medicalConditions.underlying_diseases || []}
              onItemsChange={(items) => setEditData({
                ...editData,
                medical_conditions: {
                  ...medicalConditions,
                  underlying_diseases: items
                }
              })}
              placeholder="Ví dụ: Tiểu đường"
              title="Bệnh nền hiện có"
            />
          </View>

          <View style={styles.editInputGroup}>
            <DynamicInputList
              items={medicalConditions.special_conditions || []}
              onItemsChange={(items) => setEditData({
                ...editData,
                medical_conditions: {
                  ...medicalConditions,
                  special_conditions: items
                }
              })}
              placeholder="Ví dụ: Khó nghe"
              title="Tình trạng đặc biệt"
            />
          </View>

          <View style={styles.editInputGroup}>
            <DynamicInputList
              items={medicalConditions.allergies || []}
              onItemsChange={(items) => setEditData({
                ...editData,
                medical_conditions: {
                  ...medicalConditions,
                  allergies: items
                }
              })}
              placeholder="Ví dụ: Penicillin"
              title="Dị ứng"
            />
          </View>

          <View style={styles.editInputGroup}>
            <DynamicMedicationList
              medications={medicalConditions.medications || []}
              onMedicationsChange={(medications) => setEditData({
                ...editData,
                medical_conditions: {
                  ...medicalConditions,
                  medications: medications
                }
              })}
            />
          </View>

          <View style={styles.editInputGroup}>
            <ThemedText style={styles.editInputLabel}>Lưu ý sức khỏe</ThemedText>
            <TextInput
              style={[styles.editTextInput, styles.editTextArea]}
              value={profileData.health_note || ''}
              onChangeText={(text) => setEditData({ ...editData, health_note: text })}
              placeholder="Nhập lưu ý về sức khỏe"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>
    );
  };

  // Render Independence tab in edit mode
  const renderIndependenceTabEdit = (profile: ElderlyProfile) => {
    const profileData = editData || {};
    const independenceLevel = profileData.independence_level || [];

    // Convert array to object for easier manipulation
    const independenceMap: any = {};
    independenceLevel.forEach((item: any) => {
      const activityMap: any = {
        'ăn uống': 'eating',
        'tắm rửa': 'bathing',
        'vệ sinh': 'toileting',
        'di chuyển': 'mobility',
        'mặc quần áo': 'dressing',
      };
      const key = activityMap[item.activity] || item.activity;
      independenceMap[key] = item.level;
    });

    const updateIndependenceLevel = (key: string, level: string) => {
      const activityMap: any = {
        'eating': 'ăn uống',
        'bathing': 'tắm rửa',
        'toileting': 'vệ sinh',
        'mobility': 'di chuyển',
        'dressing': 'mặc quần áo',
      };
      const activity = activityMap[key] || key;
      
      const newLevel = [...independenceLevel];
      const existingIndex = newLevel.findIndex((item: any) => 
        item.activity === activity || item.activity === key
      );
      
      if (existingIndex >= 0) {
        newLevel[existingIndex] = { activity, level };
      } else {
        newLevel.push({ activity, level });
      }
      
      setEditData({ ...editData, independence_level: newLevel });
    };

    const getLevel = (key: string) => {
      return independenceMap[key] || 'Tự lập';
    };

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.editSection}>
          <ThemedText style={styles.editSectionTitle}>Mức độ tự lập</ThemedText>
          
          {[
            { key: 'eating', label: 'Ăn uống' },
            { key: 'bathing', label: 'Tắm rửa' },
            { key: 'toileting', label: 'Vệ sinh' },
            { key: 'mobility', label: 'Di chuyển' },
            { key: 'dressing', label: 'Mặc quần áo' },
          ].map(({ key, label }) => (
            <View key={key} style={styles.editIndependenceItem}>
              <ThemedText style={styles.editIndependenceLabel}>{label}</ThemedText>
              <View style={styles.editIndependenceOptions}>
                {[
                  { value: 'Tự lập', label: 'Tự lập' },
                  { value: 'Cần hỗ trợ', label: 'Cần hỗ trợ' },
                  { value: 'Phụ thuộc', label: 'Phụ thuộc' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.editIndependenceButton,
                      getLevel(key) === option.value && styles.editIndependenceButtonActive
                    ]}
                    onPress={() => updateIndependenceLevel(key, option.value)}
                  >
                    <ThemedText style={[
                      styles.editIndependenceButtonText,
                      getLevel(key) === option.value && styles.editIndependenceButtonTextActive
                    ]}>
                      {option.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  // Render Preferences tab in edit mode
  const renderPreferencesTabEdit = (profile: ElderlyProfile) => {
    const profileData = editData || {};

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.editSection}>
          <ThemedText style={styles.editSectionTitle}>Sở thích & Liên hệ</ThemedText>
          
          <View style={styles.editInputGroup}>
            <DynamicInputList
              items={profileData.hobbies || []}
              onItemsChange={(items) => setEditData({ ...editData, hobbies: items })}
              placeholder="Ví dụ: Đọc sách"
              title="Sở thích"
            />
          </View>

          <View style={styles.editInputGroup}>
            <DynamicInputList
              items={profileData.favorite_activities || []}
              onItemsChange={(items) => setEditData({ ...editData, favorite_activities: items })}
              placeholder="Ví dụ: Xem phim"
              title="Hoạt động yêu thích"
            />
          </View>

          <View style={styles.editInputGroup}>
            <DynamicInputList
              items={profileData.favorite_food || []}
              onItemsChange={(items) => setEditData({ ...editData, favorite_food: items })}
              placeholder="Ví dụ: Cháo"
              title="Món ăn yêu thích"
            />
          </View>
        </View>
      </ScrollView>
    );
  };

  // Render Requirements tab in edit mode
  const renderRequirementsTabEdit = (profile: ElderlyProfile) => {
    const profileData = editData || {};
    const careNeeds = profileData.care_needs || {};

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.editSection}>
          <ThemedText style={styles.editSectionTitle}>Yêu cầu với người chăm sóc</ThemedText>
          
          {/* Age Range */}
          <View style={styles.editInputGroup}>
            <ThemedText style={styles.editInputLabel}>Độ tuổi người chăm sóc</ThemedText>
            <View style={styles.editAgeRangeContainer}>
              <View style={styles.editAgeInputContainer}>
                <ThemedText style={styles.editAgeLabel}>Từ</ThemedText>
                <TextInput
                  style={styles.editAgeInput}
                  value={careNeeds.age?.[0]?.toString() || ''}
                  onChangeText={(text) => {
                    const min = parseInt(text) || undefined;
                    const max = careNeeds.age?.[1];
                    setEditData({
                      ...editData,
                      care_needs: {
                        ...careNeeds,
                        age: min !== undefined ? [min, max || min] : undefined
                      }
                    });
                  }}
                  placeholder="Ví dụ: 25"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.editAgeInputContainer}>
                <ThemedText style={styles.editAgeLabel}>Đến</ThemedText>
                <TextInput
                  style={styles.editAgeInput}
                  value={careNeeds.age?.[1]?.toString() || ''}
                  onChangeText={(text) => {
                    const max = parseInt(text) || undefined;
                    const min = careNeeds.age?.[0];
                    setEditData({
                      ...editData,
                      care_needs: {
                        ...careNeeds,
                        age: max !== undefined ? [min || max, max] : undefined
                      }
                    });
                  }}
                  placeholder="Ví dụ: 50"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Gender */}
          <View style={styles.editInputGroup}>
            <ThemedText style={styles.editInputLabel}>Giới tính</ThemedText>
            <View style={styles.editGenderContainer}>
              {[
                { id: null, label: 'Không' },
                { id: 'FEMALE', label: 'Nữ' },
                { id: 'MALE', label: 'Nam' },
              ].map((gender) => (
                <TouchableOpacity
                  key={gender.id || 'any'}
                  style={[
                    styles.editGenderButton,
                    careNeeds.gender === gender.id && styles.editGenderButtonActive
                  ]}
                  onPress={() => setEditData({
                    ...editData,
                    care_needs: { ...careNeeds, gender: gender.id as any }
                  })}
                >
                  <ThemedText style={[
                    styles.editGenderText,
                    careNeeds.gender === gender.id && styles.editGenderTextActive
                  ]}>
                    {gender.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Experience */}
          <View style={styles.editInputGroup}>
            <ThemedText style={styles.editInputLabel}>Kinh nghiệm tối thiểu (năm)</ThemedText>
            <TextInput
              style={styles.editTextInput}
              value={careNeeds.experience?.toString() || ''}
              onChangeText={(text) => {
                const experience = parseInt(text) || undefined;
                setEditData({
                  ...editData,
                  care_needs: { ...careNeeds, experience }
                });
              }}
              placeholder="Ví dụ: 3"
              keyboardType="numeric"
            />
          </View>

          {/* Rating Range */}
          <View style={styles.editInputGroup}>
            <ThemedText style={styles.editInputLabel}>Đánh giá</ThemedText>
            <View style={styles.editAgeRangeContainer}>
              <View style={styles.editAgeInputContainer}>
                <ThemedText style={styles.editAgeLabel}>Từ</ThemedText>
                <TextInput
                  style={styles.editAgeInput}
                  value={careNeeds.rating?.[0]?.toString() || ''}
                  onChangeText={(text) => {
                    const min = parseInt(text) || undefined;
                    const max = careNeeds.rating?.[1];
                    setEditData({
                      ...editData,
                      care_needs: {
                        ...careNeeds,
                        rating: min !== undefined ? [min, max || min] : undefined
                      }
                    });
                  }}
                  placeholder="Ví dụ: 4"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.editAgeInputContainer}>
                <ThemedText style={styles.editAgeLabel}>Đến</ThemedText>
                <TextInput
                  style={styles.editAgeInput}
                  value={careNeeds.rating?.[1]?.toString() || ''}
                  onChangeText={(text) => {
                    const max = parseInt(text) || undefined;
                    const min = careNeeds.rating?.[0];
                    setEditData({
                      ...editData,
                      care_needs: {
                        ...careNeeds,
                        rating: max !== undefined ? [min || max, max] : undefined
                      }
                    });
                  }}
                  placeholder="Ví dụ: 5"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  // Handle save
  const handleSave = async () => {
    if (!id || !editData) return;

    try {
      setSaving(true);
      
      // Prepare update request
      const updateRequest: UpdateElderlyProfileRequest = {
        ...editData,
        // Map independence_level từ Vietnamese về format API
        independence_level: editData.independence_level?.map((item: any) => ({
          activity: item.activity,
          level: item.level, // Keep Vietnamese format as API expects
        })),
      };

      // Remove empty fields
      Object.keys(updateRequest).forEach(key => {
        if (updateRequest[key as keyof UpdateElderlyProfileRequest] === undefined || 
            updateRequest[key as keyof UpdateElderlyProfileRequest] === null ||
            (Array.isArray(updateRequest[key as keyof UpdateElderlyProfileRequest]) && 
             (updateRequest[key as keyof UpdateElderlyProfileRequest] as any[]).length === 0)) {
          delete updateRequest[key as keyof UpdateElderlyProfileRequest];
        }
      });

      console.log('Updating elderly profile with:', updateRequest);

      const response = await UserService.updateElderlyProfile(id, updateRequest);
      
      if (response.status === 'Success') {
        // Show success modal
        setModalMessage('Cập nhật thông tin người già thành công!');
        setShowSuccessModal(true);
        // Reload profile data
        setIsEditMode(false);
        setEditData(null);
        // Trigger reload
        setRefreshKey(prev => prev + 1);
      } else {
        // Show error modal
        setModalMessage(response.message || 'Không thể cập nhật thông tin');
        setShowErrorModal(true);
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      // Show error modal
      setModalMessage(err.message || 'Không thể cập nhật thông tin');
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  // Overview tab renderer
  const renderOverviewTab = (profile: ElderlyProfile) => {
    const extendedProfile = profile as any;
    const emergencyContacts = extendedProfile.emergencyContacts || [];
    
    if (isEditMode && editData) {
      return renderOverviewTabEdit(profile, extendedProfile, emergencyContacts);
    }
    
    return (
      <View style={styles.tabContent}>
        <View style={[styles.section, styles.basicInfoSection]}>
          <ThemedText style={styles.sectionTitle}>Thông tin cơ bản</ThemedText>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <View style={styles.infoItemHeader}>
                <Ionicons name="calendar" size={16} color="#6c757d" />
                <ThemedText style={styles.infoLabel}>Năm sinh</ThemedText>
              </View>
              <ThemedText style={styles.infoValue}>{formatYear(extendedProfile.birthDate)}</ThemedText>
            </View>
            
            <View style={styles.infoItem}>
              <View style={styles.infoItemHeader}>
                <Ionicons name="person" size={16} color="#6c757d" />
                <ThemedText style={styles.infoLabel}>Giới tính</ThemedText>
              </View>
              <ThemedText style={styles.infoValue}>{formatGender(extendedProfile.gender)}</ThemedText>
            </View>

            {(extendedProfile.locationLat && extendedProfile.locationLng) ? (
              <View style={styles.infoItem}>
                <View style={styles.infoItemHeader}>
                  <Ionicons name="location" size={16} color="#6c757d" />
                  <ThemedText style={styles.infoLabel}>Địa chỉ</ThemedText>
                </View>
                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={() => {
                    const lat = extendedProfile.locationLat;
                    const lng = extendedProfile.locationLng;
                    const url = Platform.select({
                      ios: `maps://maps.google.com/maps?daddr=${lat},${lng}`,
                      android: `google.navigation:q=${lat},${lng}`,
                    });
                    const webUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
                    if (url) {
                      Linking.canOpenURL(url).then((supported) => {
                        if (supported) {
                          Linking.openURL(url);
                        } else {
                          Linking.openURL(webUrl);
                        }
                      }).catch(() => {
                        Linking.openURL(webUrl);
                      });
                    } else {
                      Linking.openURL(webUrl);
                    }
                  }}
                >
                  <Ionicons name="map" size={16} color="#68C2E8" />
                  <ThemedText style={styles.mapButtonText}>Xem bản đồ</ThemedText>
                </TouchableOpacity>
              </View>
            ) : null}

            {(extendedProfile.weight || extendedProfile.height) && (
              <View style={styles.infoItem}>
                <View style={styles.infoItemHeader}>
                  <Ionicons name="fitness" size={16} color="#6c757d" />
                  <ThemedText style={styles.infoLabel}>Cân nặng / Chiều cao</ThemedText>
                </View>
                <ThemedText style={styles.infoValue}>
                  {extendedProfile.weight ? `${extendedProfile.weight}kg` : 'Không có thông tin'} / {extendedProfile.height ? `${extendedProfile.height}cm` : 'Không có thông tin'}
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Emergency Contact */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Người liên hệ khẩn cấp</ThemedText>
          {emergencyContacts.length > 0 ? (
            emergencyContacts.map((contact: any, index: number) => (
              <View key={index} style={styles.contactCard}>
                <View style={styles.contactIcon}>
                  <Ionicons name="person" size={20} color="#68C2E8" />
                </View>
                <View style={styles.contactInfo}>
                  <ThemedText style={styles.contactName}>{contact.name || 'Không có thông tin'}</ThemedText>
                  <ThemedText style={styles.contactRelation}>{contact.relationship || 'Không có thông tin'}</ThemedText>
                  <ThemedText style={styles.contactPhone}>{contact.phone || 'Không có thông tin'}</ThemedText>
                </View>
              </View>
            ))
          ) : (
            <ThemedText style={styles.emptyText}>Không có thông tin</ThemedText>
          )}
        </View>

        {/* Note Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Ghi chú</ThemedText>
          {extendedProfile.note ? (
            <View style={styles.noteCard}>
              <ThemedText style={styles.noteText}>{extendedProfile.note}</ThemedText>
            </View>
          ) : (
            <ThemedText style={styles.emptyText}>Không có thông tin</ThemedText>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <ThemedText style={styles.headerTitle}>Chi tiết người già</ThemedText>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#68C2E8" />
          <ThemedText style={styles.loadingText}>Đang tải thông tin...</ThemedText>
        </View>
        <SimpleNavBar />
      </SafeAreaView>
    );
  }

  if (error || !elderlyProfile) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <ThemedText style={styles.headerTitle}>Chi tiết người già</ThemedText>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#dc3545" />
          <ThemedText style={styles.errorText}>{error || 'Không tìm thấy thông tin người già'}</ThemedText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              setError(null);
              // Reload will be triggered by useEffect
            }}
          >
            <ThemedText style={styles.retryButtonText}>Thử lại</ThemedText>
          </TouchableOpacity>
        </View>
        <SimpleNavBar />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (isEditMode) {
              setIsEditMode(false);
              setEditData(null);
            } else {
              router.back();
            }
          }}
        >
          <Ionicons name={isEditMode ? "close" : "arrow-back"} size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Chi tiết người già</ThemedText>
        </View>

        {!isEditMode ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              setIsEditMode(true);
              // Initialize editData với dữ liệu hiện tại
              const extendedProfile = elderlyProfile as any;
              
              // Map healthStatus từ UI format (good/fair/poor) sang API format (GOOD/MODERATE/WEAK)
              const mapHealthStatusToAPI = (status: string): string => {
                switch (status) {
                  case 'good': return 'GOOD';
                  case 'fair': return 'MODERATE';
                  case 'poor': return 'WEAK';
                  default: return 'MODERATE';
                }
              };
              
              setEditData({
                name: elderlyProfile?.name || '',
                birth_year: extendedProfile?.birthDate ? new Date(extendedProfile.birthDate).getFullYear() : undefined,
                gender: extendedProfile?.gender || '',
                location: extendedProfile?.locationLat && extendedProfile?.locationLng ? {
                  latitude: extendedProfile.locationLat,
                  longitude: extendedProfile.locationLng,
                } : undefined,
                weight: extendedProfile?.weight,
                height: extendedProfile?.height,
                note: extendedProfile?.note || '',
                health_status: mapHealthStatusToAPI(extendedProfile?.healthStatus || 'fair'),
                health_note: extendedProfile?.healthNote || '',
                medical_conditions: {
                  underlying_diseases: elderlyProfile?.medicalConditions?.underlyingDiseases || [],
                  special_conditions: elderlyProfile?.medicalConditions?.specialConditions || [],
                  allergies: elderlyProfile?.medicalConditions?.allergies || [],
                  medications: elderlyProfile?.medicalConditions?.medications || [],
                },
                independence_level: [
                  { activity: 'ăn uống', level: mapIndependenceLevelToVietnamese(elderlyProfile?.independenceLevel?.eating || 'independent') },
                  { activity: 'tắm rửa', level: mapIndependenceLevelToVietnamese(elderlyProfile?.independenceLevel?.bathing || 'independent') },
                  { activity: 'vệ sinh', level: mapIndependenceLevelToVietnamese(elderlyProfile?.independenceLevel?.toileting || 'independent') },
                  { activity: 'di chuyển', level: mapIndependenceLevelToVietnamese(elderlyProfile?.independenceLevel?.mobility || 'independent') },
                  { activity: 'mặc quần áo', level: mapIndependenceLevelToVietnamese(elderlyProfile?.independenceLevel?.dressing || 'independent') },
                ],
                hobbies: elderlyProfile?.preferences?.hobbies || [],
                favorite_activities: elderlyProfile?.preferences?.favoriteActivities || [],
                favorite_food: elderlyProfile?.preferences?.foodPreferences || [],
                emergency_contacts: extendedProfile?.emergencyContacts || [],
                care_needs: extendedProfile?.careRequirement || {},
              });
            }}
          >
            <Ionicons name="create-outline" size={24} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <ThemedText style={styles.saveButtonText}>Lưu</ThemedText>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Profile Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: elderlyProfile.avatar || 'https://via.placeholder.com/150' }} 
              style={styles.avatar} 
            />
            <View style={[styles.statusIndicator, { backgroundColor: getHealthStatusColor(elderlyProfile.healthStatus) }]} />
          </View>
          
          <View style={styles.profileInfo}>
            <ThemedText style={styles.profileName}>{elderlyProfile.name}</ThemedText>
            <ThemedText style={styles.profileAge}>{elderlyProfile.age} tuổi</ThemedText>
            
            <View style={styles.healthStatus}>
              <Ionicons name="heart" size={16} color={getHealthStatusColor(elderlyProfile.healthStatus)} />
              <ThemedText style={[styles.healthStatusText, { color: getHealthStatusColor(elderlyProfile.healthStatus) }]}>
                {getHealthStatusText(elderlyProfile.healthStatus)}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScrollView}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
              onPress={() => setActiveTab('overview')}
            >
              <ThemedText style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
                Tổng quan
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'medical' && styles.activeTab]}
              onPress={() => setActiveTab('medical')}
            >
              <ThemedText style={[styles.tabText, activeTab === 'medical' && styles.activeTabText]}>
                Y tế
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'independence' && styles.activeTab]}
              onPress={() => setActiveTab('independence')}
            >
              <ThemedText style={[styles.tabText, activeTab === 'independence' && styles.activeTabText]}>
                Tự lập
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'preferences' && styles.activeTab]}
              onPress={() => setActiveTab('preferences')}
            >
              <ThemedText style={[styles.tabText, activeTab === 'preferences' && styles.activeTabText]}>
                Sở thích
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, styles.lastTab, activeTab === 'environment' && styles.activeTab]}
              onPress={() => setActiveTab('environment')}
            >
              <ThemedText style={[styles.tabText, activeTab === 'environment' && styles.activeTabText]}>
                Yêu cầu
              </ThemedText>
            </TouchableOpacity>
            
          </ScrollView>
        </View>

        {/* Tab Content */}
        {activeTab === 'overview' && (isEditMode ? renderOverviewTabEdit(elderlyProfile, elderlyProfile as any, (elderlyProfile as any).emergencyContacts || []) : renderOverviewTab(elderlyProfile))}
        {activeTab === 'medical' && (isEditMode ? renderMedicalTabEdit(elderlyProfile) : renderMedicalTab(elderlyProfile))}
        {activeTab === 'independence' && (isEditMode ? renderIndependenceTabEdit(elderlyProfile) : renderIndependenceTab(elderlyProfile))}
        {activeTab === 'preferences' && (isEditMode ? renderPreferencesTabEdit(elderlyProfile) : renderPreferencesTab(elderlyProfile))}
        {activeTab === 'environment' && (isEditMode ? renderRequirementsTabEdit(elderlyProfile) : renderEnvironmentTab(elderlyProfile))}
      </ScrollView>

      {/* Navigation Bar */}
      <SimpleNavBar />

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title="Thành công"
        message={modalMessage}
        buttonText="Đóng"
        onPress={() => setShowSuccessModal(false)}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        title="Lỗi"
        message={modalMessage}
        buttonText="Đóng"
        onPress={() => setShowErrorModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingBottom: 100, // Space for navigation bar
  },
  header: {
    backgroundColor: '#68C2E8',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    padding: 8,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  editButton: {
    padding: 8,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: 'white',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  profileAge: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 4,
  },
  healthStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthStatusText: {
    fontSize: 14,
    marginLeft: 4,
  },
  tabContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tabScrollView: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  lastTab: {
    marginRight: 16,
  },
  activeTab: {
    borderBottomColor: '#68C2E8',
  },
  tabText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#68C2E8',
    fontWeight: 'bold',
  },
  tabContent: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  section: {
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f8f9fa',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'column',
    marginBottom: 8,
  },
  infoItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6c757d',
  },
  infoValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
    marginLeft: 24, // Align with text after icon
  },
  basicInfoSection: {
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  contactCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  contactRelation: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    color: '#68C2E8',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#68C2E8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
    marginLeft: 24,
    gap: 6,
    alignSelf: 'flex-start',
  },
  mapButtonText: {
    fontSize: 14,
    color: '#68C2E8',
    fontWeight: '600',
  },
  noteCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#68C2E8',
  },
  noteText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#2c3e50',
    backgroundColor: '#fff',
    marginLeft: 24,
    marginTop: 4,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 12,
    marginLeft: 24,
    marginTop: 4,
  },
  radioOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  radioOptionSelected: {
    borderColor: '#68C2E8',
    backgroundColor: '#F0F8FF',
  },
  radioText: {
    fontSize: 14,
    color: '#6c757d',
  },
  radioTextSelected: {
    color: '#68C2E8',
    fontWeight: '600',
  },
  // Edit mode styles (reused from add-elderly.tsx)
  editSection: {
    padding: 20,
  },
  editSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  editInputGroup: {
    marginBottom: 20,
  },
  editInputGroupHalf: {
    flex: 1,
    marginRight: 10,
  },
  editInputRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  editLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  editInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  editTextInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E8EBED',
    color: '#2C3E50',
  },
  editTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  editGenderContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  editGenderButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'white',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8EBED',
  },
  editGenderButtonActive: {
    backgroundColor: '#E8F6F3',
    borderColor: '#68C2E8',
  },
  editGenderText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  editGenderTextActive: {
    color: '#68C2E8',
  },
  editLocationDisplayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8EBED',
  },
  editLocationInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  editLocationTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  editLocationLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  editLocationTextDisplay: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  editUploadButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8EBED',
    borderStyle: 'dashed',
  },
  editUploadText: {
    marginTop: 8,
    fontSize: 14,
    color: '#68C2E8',
    fontWeight: '500',
  },
  editIndependenceItem: {
    marginBottom: 20,
  },
  editIndependenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  editIndependenceOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  editIndependenceButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8EBED',
  },
  editIndependenceButtonActive: {
    backgroundColor: '#E8F6F3',
    borderColor: '#68C2E8',
  },
  editIndependenceButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  editIndependenceButtonTextActive: {
    color: '#68C2E8',
  },
  editEmergencyContactsSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  editEmergencyContactsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  editEmergencyContactsCount: {
    fontSize: 14,
    color: '#6c757d',
  },
  editManageContactsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8EBED',
  },
  editManageContactsText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#2c3e50',
    fontWeight: '500',
  },
  editAgeRangeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  editAgeInputContainer: {
    flex: 1,
  },
  editAgeLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  editAgeInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E8EBED',
    color: '#2C3E50',
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    padding: 20,
  },
});
