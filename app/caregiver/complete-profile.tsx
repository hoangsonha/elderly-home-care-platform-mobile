import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { submitProfileForReview } from "@/data/profileStore";
import { AuthService } from "@/services/auth.service";
import { router } from "expo-router";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface PersonalInfo {
  fullName: string;
  phone: string;
  permanentAddress: string;
  temporaryAddress: string;
  dateOfBirth: string;
  gender: string;
  idCard: string;
  idCardFront: string | null;
  idCardBack: string | null;
}

interface Certificate {
  name: string;
  issueDate: string;
  issuingOrganization: string;
  type: string;
  image: string | null;
}

interface ProfessionalInfo {
  yearsOfExperience: string;
  previousWorkplace: string;
  education: string;
  educationCertificate: string | null;
  certificates: Certificate[];
}

interface AdditionalInfo {
  profileImage: string | null;
  videoLink: string;
  introduction: string;
}

interface CommitmentInfo {
  ethicalCommitment: boolean;
  termsAgreement: boolean;
}

export default function CompleteProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { user, updateProfile } = useAuth();
  const params = route.params as { email?: string; fullName?: string } | undefined;

  // Registration info (pre-filled)
  const [registrationInfo, setRegistrationInfo] = useState({
    fullName: params?.fullName || "",
    email: params?.email || "",
  });

  // Personal info
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: params?.fullName || "",
    phone: "",
    permanentAddress: "",
    temporaryAddress: "",
    dateOfBirth: "",
    gender: "",
    idCard: "",
    idCardFront: null,
    idCardBack: null,
  });

  // Professional info
  const [professionalInfo, setProfessionalInfo] = useState<ProfessionalInfo>({
    yearsOfExperience: "0",
    previousWorkplace: "",
    education: "",
    educationCertificate: null,
    certificates: [],
  });

  // Date picker states
  const [showDateOfBirthPicker, setShowDateOfBirthPicker] = useState(false);
  const [showCertificateDatePicker, setShowCertificateDatePicker] = useState(false);
  const [currentCertificateIndex, setCurrentCertificateIndex] = useState<number | null>(null);
  const [tempDateOfBirth, setTempDateOfBirth] = useState<Date>(
    personalInfo.dateOfBirth ? new Date(personalInfo.dateOfBirth) : new Date(new Date().setFullYear(new Date().getFullYear() - 20))
  );
  const [tempCertificateDate, setTempCertificateDate] = useState<Date>(new Date());

  // Picker modals
  const [showEducationPicker, setShowEducationPicker] = useState(false);
  const [showCertificateTypePicker, setShowCertificateTypePicker] = useState(false);

  // New certificate form
  const [newCertificate, setNewCertificate] = useState<Certificate>({
    name: "",
    issueDate: "",
    issuingOrganization: "",
    type: "",
    image: null,
  });

  // Additional info
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfo>({
    profileImage: null,
    videoLink: "",
    introduction: "",
  });

  // Commitment info
  const [commitmentInfo, setCommitmentInfo] = useState<CommitmentInfo>({
    ethicalCommitment: false,
    termsAgreement: false,
  });

  const educationLevels = [
    "Chọn trình độ",
    "Trung học cơ sở",
    "Trung học phổ thông",
    "Đại học",
    "Sau đại học",
  ];

  const certificateTypes = [
    "Chọn loại chứng chỉ",
    "Chứng chỉ chăm sóc người già",
    "Chứng chỉ y tá",
    "Chứng chỉ điều dưỡng",
    "Chứng chỉ sơ cứu",
    "Chứng chỉ dinh dưỡng",
    "Chứng chỉ vật lý trị liệu",
    "Chứng chỉ khác",
  ];

  const handleImagePicker = async (type: "profile" | "idCardFront" | "idCardBack" | "certificate" | "education", certificateIndex?: number) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Quyền truy cập", "Vui lòng cấp quyền truy cập thư viện ảnh");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: type === "profile",
      aspect: type === "profile" ? [1, 1] : undefined,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (type === "profile") {
        setAdditionalInfo({
          ...additionalInfo,
          profileImage: result.assets[0].uri,
        });
      } else if (type === "idCardFront") {
        setPersonalInfo({
          ...personalInfo,
          idCardFront: result.assets[0].uri,
        });
      } else if (type === "idCardBack") {
        setPersonalInfo({
          ...personalInfo,
          idCardBack: result.assets[0].uri,
        });
      } else if (type === "certificate" && certificateIndex !== undefined) {
        const updatedCertificates = [...professionalInfo.certificates];
        updatedCertificates[certificateIndex].image = result.assets[0].uri;
        setProfessionalInfo({
          ...professionalInfo,
          certificates: updatedCertificates,
        });
      } else if (type === "certificate" && certificateIndex === undefined) {
        setNewCertificate({
          ...newCertificate,
          image: result.assets[0].uri,
        });
      } else if (type === "education") {
        setProfessionalInfo({
          ...professionalInfo,
          educationCertificate: result.assets[0].uri,
        });
      }
    }
  };

  const handleAddCertificate = () => {
    if (!newCertificate.name.trim() || !newCertificate.issueDate || !newCertificate.issuingOrganization.trim() || !newCertificate.type || newCertificate.type === certificateTypes[0]) {
      Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ thông tin chứng chỉ");
      return;
    }
    setProfessionalInfo({
      ...professionalInfo,
      certificates: [...professionalInfo.certificates, { ...newCertificate }],
    });
    setNewCertificate({
      name: "",
      issueDate: "",
      issuingOrganization: "",
      type: "",
      image: null,
    });
  };

  const handleRemoveCertificate = (index: number) => {
    setProfessionalInfo({
      ...professionalInfo,
      certificates: professionalInfo.certificates.filter((_, i) => i !== index),
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDateSelect = (date: string, type: "birth" | "certificate", index?: number) => {
    if (type === "birth") {
      setPersonalInfo({
        ...personalInfo,
        dateOfBirth: date,
      });
      setShowDateOfBirthPicker(false);
    } else if (type === "certificate") {
      if (index !== undefined) {
        const updatedCertificates = [...professionalInfo.certificates];
        updatedCertificates[index].issueDate = date;
        setProfessionalInfo({
          ...professionalInfo,
          certificates: updatedCertificates,
        });
      } else {
        setNewCertificate({
          ...newCertificate,
          issueDate: date,
        });
      }
      setShowCertificateDatePicker(false);
      setCurrentCertificateIndex(null);
    }
  };

  const handleDateOfBirthChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDateOfBirthPicker(false);
      if (selectedDate) {
        const dateString = selectedDate.toISOString().split("T")[0];
        handleDateSelect(dateString, "birth");
      }
    } else {
      if (selectedDate) {
        setTempDateOfBirth(selectedDate);
      }
    }
  };

  const handleDateOfBirthConfirm = () => {
    const dateString = tempDateOfBirth.toISOString().split("T")[0];
    handleDateSelect(dateString, "birth");
  };

  const handleCertificateDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowCertificateDatePicker(false);
      if (selectedDate) {
        const dateString = selectedDate.toISOString().split("T")[0];
        handleDateSelect(dateString, "certificate", currentCertificateIndex ?? undefined);
      }
    } else {
      if (selectedDate) {
        setTempCertificateDate(selectedDate);
      }
    }
  };

  const handleCertificateDateConfirm = () => {
    const dateString = tempCertificateDate.toISOString().split("T")[0];
    handleDateSelect(dateString, "certificate", currentCertificateIndex ?? undefined);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleComplete = async () => {
    if (!commitmentInfo.ethicalCommitment || !commitmentInfo.termsAgreement) {
      Alert.alert("Thiếu thông tin", "Vui lòng đồng ý với tất cả các cam kết");
      return;
    }

    if (!user?.id) {
      Alert.alert("Lỗi", "Không tìm thấy người dùng. Vui lòng đăng nhập lại.");
      return;
    }

    // Build a minimal profile payload to persist
    const profilePayload = {
      name: registrationInfo.fullName || personalInfo.fullName || "",
      phone: personalInfo.phone || null,
      address: personalInfo.permanentAddress || personalInfo.temporaryAddress || null,
      dateOfBirth: personalInfo.dateOfBirth || null,
      gender: personalInfo.gender || null,
      idCard: personalInfo.idCard || null,
      yearsOfExperience: professionalInfo.yearsOfExperience || null,
      education: professionalInfo.education || null,
      previousWorkplace: professionalInfo.previousWorkplace || null,
      introduction: additionalInfo.introduction || null,
      videoLink: additionalInfo.videoLink || null,
      profileImage: additionalInfo.profileImage || null,
      idCardFront: personalInfo.idCardFront || null,
      idCardBack: personalInfo.idCardBack || null,
      certificates: professionalInfo.certificates || [],
    };

    try {
      console.log('📝 Submitting profile for user:', user.id);
      console.log('📦 Profile data:', profilePayload);
      
      // Save profile to database
      await AuthService.updateProfile(user.id, profilePayload);
      console.log('✅ Profile saved to database successfully');

      // Update in-memory auth context so UI reflects the change
      if (updateProfile) {
        console.log('🔄 Updating AuthContext with new profile data');
        updateProfile({
          hasCompletedProfile: true,
          name: profilePayload.name,
          phone: profilePayload.phone ?? undefined,
          address: profilePayload.address ?? undefined,
          avatar: profilePayload.profileImage ?? undefined,
        });
      }

      // Mark profile as submitted for review
      console.log('📋 Setting profile status to pending in profileStore');
      submitProfileForReview(user.id);

      // Show success message
      Alert.alert(
        'Thành công!',
        'Hồ sơ của bạn đã được gửi để xét duyệt. Chúng tôi sẽ thông báo kết quả trong vòng 24-48 giờ.',
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('➡️ Navigating to profile-status screen');
              router.replace('/caregiver/profile-status');
            }
          }
        ]
      );
    } catch (err: any) {
      console.error('❌ Failed to save profile:', err);
      Alert.alert(
        'Lỗi',
        `Không thể lưu hồ sơ: ${err?.message || 'Lỗi không xác định'}. Vui lòng thử lại sau.`
      );
    }
  };

  // Initialize date picker when opening
  useEffect(() => {
    if (showDateOfBirthPicker) {
      if (personalInfo.dateOfBirth) {
        setTempDateOfBirth(new Date(personalInfo.dateOfBirth));
      } else {
        const defaultDate = new Date();
        defaultDate.setFullYear(defaultDate.getFullYear() - 20);
        setTempDateOfBirth(defaultDate);
      }
    }
  }, [showDateOfBirthPicker, personalInfo.dateOfBirth]);

  useEffect(() => {
    if (showCertificateDatePicker) {
      const selectedDate = currentCertificateIndex !== null 
        ? professionalInfo.certificates[currentCertificateIndex]?.issueDate 
        : newCertificate.issueDate;
      if (selectedDate) {
        setTempCertificateDate(new Date(selectedDate));
      } else {
        setTempCertificateDate(new Date());
      }
    }
  }, [showCertificateDatePicker, currentCertificateIndex, professionalInfo.certificates, newCertificate.issueDate]);


  const renderPersonalInfo = () => (
    <View style={[styles.contentCard, styles.firstContentCard]}>
      <View style={styles.contentTitleContainer}>
        <MaterialCommunityIcons name="account" size={24} color="#70C1F1" />
        <Text style={styles.contentTitle}>Thông tin cá nhân</Text>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Số điện thoại <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập số điện thoại"
            placeholderTextColor="#9CA3AF"
            value={personalInfo.phone}
            onChangeText={(text) =>
              setPersonalInfo({ ...personalInfo, phone: text })
            }
            keyboardType="phone-pad"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Ngày sinh <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.input,
              styles.dateInputContainer,
              !personalInfo.dateOfBirth && styles.dateInputContainerEmpty,
            ]}
            onPress={() => setShowDateOfBirthPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.dateInputText, !personalInfo.dateOfBirth && styles.dateInputPlaceholder]}>
              {personalInfo.dateOfBirth ? formatDate(personalInfo.dateOfBirth) : "Chọn ngày sinh"}
            </Text>
            <MaterialCommunityIcons
              name="calendar"
              size={20}
              color={personalInfo.dateOfBirth ? "#6B7280" : "#9CA3AF"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Giới tính <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.radioGroup}>
          {["Nam", "Nữ"].map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[
                styles.radioOption,
                personalInfo.gender === gender && styles.radioOptionSelected,
              ]}
              onPress={() => setPersonalInfo({ ...personalInfo, gender })}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.radioButton,
                  personalInfo.gender === gender && styles.radioButtonSelected,
                ]}
              >
                {personalInfo.gender === gender && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <Text
                style={[
                  styles.radioLabel,
                  personalInfo.gender === gender && styles.radioLabelSelected,
                ]}
              >
                {gender}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Địa chỉ thường trú <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập địa chỉ thường trú"
          placeholderTextColor="#9CA3AF"
          value={personalInfo.permanentAddress}
          onChangeText={(text) =>
            setPersonalInfo({ ...personalInfo, permanentAddress: text })
          }
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Địa chỉ tạm trú</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập địa chỉ tạm trú (nếu có)"
          placeholderTextColor="#9CA3AF"
          value={personalInfo.temporaryAddress}
          onChangeText={(text) =>
            setPersonalInfo({ ...personalInfo, temporaryAddress: text })
          }
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          CMND/CCCD <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập số CMND/CCCD"
          placeholderTextColor="#9CA3AF"
          value={personalInfo.idCard}
          onChangeText={(text) =>
            setPersonalInfo({ ...personalInfo, idCard: text })
          }
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Ảnh CCCD mặt trước <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={styles.fileUploadContainer}
          onPress={() => handleImagePicker("idCardFront")}
          activeOpacity={0.7}
        >
          <View style={styles.fileUploadContent}>
            <MaterialCommunityIcons
              name={personalInfo.idCardFront ? "check-circle" : "id-card"}
              size={24}
              color={personalInfo.idCardFront ? "#10B981" : "#6B7280"}
            />
            <Text
              style={[
                styles.fileText,
                personalInfo.idCardFront && styles.fileTextSuccess,
              ]}
            >
              {personalInfo.idCardFront ? "Đã chọn ảnh" : "Chọn ảnh CCCD mặt trước"}
            </Text>
          </View>
          <View style={styles.fileButton}>
            <Text style={styles.fileButtonText}>Chọn tệp</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Ảnh CCCD mặt sau <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={styles.fileUploadContainer}
          onPress={() => handleImagePicker("idCardBack")}
          activeOpacity={0.7}
        >
          <View style={styles.fileUploadContent}>
            <MaterialCommunityIcons
              name={personalInfo.idCardBack ? "check-circle" : "id-card"}
              size={24}
              color={personalInfo.idCardBack ? "#10B981" : "#6B7280"}
            />
            <Text
              style={[
                styles.fileText,
                personalInfo.idCardBack && styles.fileTextSuccess,
              ]}
            >
              {personalInfo.idCardBack ? "Đã chọn ảnh" : "Chọn ảnh CCCD mặt sau"}
            </Text>
          </View>
          <View style={styles.fileButton}>
            <Text style={styles.fileButtonText}>Chọn tệp</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Date of Birth Calendar Picker */}
      {Platform.OS === "ios" ? (
        <Modal visible={showDateOfBirthPicker} transparent={true} animationType="slide">
          <View style={styles.calendarModalOverlay}>
            <View style={styles.calendarModalContent}>
              <View style={styles.calendarModalHeader}>
                <TouchableOpacity onPress={() => setShowDateOfBirthPicker(false)}>
                  <Text style={styles.calendarModalCancel}>Hủy</Text>
                </TouchableOpacity>
                <Text style={styles.calendarModalTitle}>Chọn ngày sinh</Text>
                <TouchableOpacity onPress={handleDateOfBirthConfirm}>
                  <Text style={styles.calendarModalConfirm}>Xác nhận</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDateOfBirth}
                mode="date"
                display="spinner"
                onChange={handleDateOfBirthChange}
                maximumDate={new Date()}
                textColor="#1F2937"
              />
            </View>
          </View>
        </Modal>
      ) : (
        showDateOfBirthPicker && (
          <DateTimePicker
            value={tempDateOfBirth}
            mode="date"
            display="default"
            onChange={handleDateOfBirthChange}
            maximumDate={new Date()}
          />
        )
      )}
    </View>
  );

  const renderProfessionalInfo = () => (
    <View style={styles.contentCard}>
      <View style={styles.contentTitleContainer}>
        <MaterialCommunityIcons name="briefcase" size={24} color="#70C1F1" />
        <Text style={styles.contentTitle}>Thông tin nghề nghiệp</Text>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Số năm kinh nghiệm <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor="#9CA3AF"
            value={professionalInfo.yearsOfExperience}
            onChangeText={(text) =>
              setProfessionalInfo({
                ...professionalInfo,
                yearsOfExperience: text,
              })
            }
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nơi từng làm việc</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập nơi từng làm việc"
            placeholderTextColor="#9CA3AF"
            value={professionalInfo.previousWorkplace}
            onChangeText={(text) =>
              setProfessionalInfo({
                ...professionalInfo,
                previousWorkplace: text,
              })
            }
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Học vấn</Text>
        <TouchableOpacity 
          style={styles.pickerContainer} 
          activeOpacity={0.7}
          onPress={() => setShowEducationPicker(true)}
        >
          <Text
            style={[
              styles.pickerText,
              !professionalInfo.education && styles.pickerTextPlaceholder,
            ]}
          >
            {professionalInfo.education || educationLevels[0]}
          </Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={20}
            color="#6B7280"
          />
        </TouchableOpacity>
        {(professionalInfo.education === "Đại học" || professionalInfo.education === "Sau đại học") && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Bằng đại học <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.fileUploadContainer}
              onPress={() => handleImagePicker("education")}
              activeOpacity={0.7}
            >
              <View style={styles.fileUploadContent}>
                <MaterialCommunityIcons
                  name={professionalInfo.educationCertificate ? "check-circle" : "file-document-outline"}
                  size={24}
                  color={professionalInfo.educationCertificate ? "#10B981" : "#6B7280"}
                />
                <Text
                  style={[
                    styles.fileText,
                    professionalInfo.educationCertificate && styles.fileTextSuccess,
                  ]}
                >
                  {professionalInfo.educationCertificate ? "Đã chọn ảnh" : "Chọn ảnh bằng đại học"}
                </Text>
              </View>
              <View style={styles.fileButton}>
                <Text style={styles.fileButtonText}>Chọn tệp</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Bằng cấp, chứng chỉ liên quan</Text>
        
        {/* New Certificate Form */}
        <View style={styles.certificateForm}>
          <TextInput
            style={styles.input}
            placeholder="Tên chứng chỉ *"
            placeholderTextColor="#9CA3AF"
            value={newCertificate.name}
            onChangeText={(text) => setNewCertificate({ ...newCertificate, name: text })}
          />
          
          <TouchableOpacity
            style={[styles.input, styles.dateInputContainer]}
            onPress={() => {
              setCurrentCertificateIndex(null);
              setShowCertificateDatePicker(true);
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.dateInputText, !newCertificate.issueDate && styles.dateInputPlaceholder]}>
              {newCertificate.issueDate ? formatDate(newCertificate.issueDate) : "Ngày cấp *"}
            </Text>
            <MaterialCommunityIcons name="calendar" size={20} color="#6B7280" />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Tổ chức cấp *"
            placeholderTextColor="#9CA3AF"
            value={newCertificate.issuingOrganization}
            onChangeText={(text) => setNewCertificate({ ...newCertificate, issuingOrganization: text })}
          />

          <TouchableOpacity 
            style={styles.pickerContainer} 
            activeOpacity={0.7}
            onPress={() => setShowCertificateTypePicker(true)}
          >
            <Text
              style={[
                styles.pickerText,
                (!newCertificate.type || newCertificate.type === certificateTypes[0]) && styles.pickerTextPlaceholder,
              ]}
            >
              {newCertificate.type || certificateTypes[0]}
            </Text>
            <MaterialCommunityIcons
              name="chevron-down"
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fileUploadContainer}
            onPress={() => handleImagePicker("certificate")}
            activeOpacity={0.7}
          >
            <View style={styles.fileUploadContent}>
              <MaterialCommunityIcons
                name={newCertificate.image ? "check-circle" : "file-image-outline"}
                size={24}
                color={newCertificate.image ? "#10B981" : "#6B7280"}
              />
              <Text
                style={[
                  styles.fileText,
                  newCertificate.image && styles.fileTextSuccess,
                ]}
              >
                {newCertificate.image ? "Đã chọn ảnh" : "Ảnh chứng chỉ *"}
              </Text>
            </View>
            <View style={styles.fileButton}>
              <Text style={styles.fileButtonText}>Chọn tệp</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddCertificate}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="plus" size={18} color="#fff" />
            <Text style={styles.addButtonText}>Thêm chứng chỉ</Text>
          </TouchableOpacity>
        </View>

        {/* Certificate List */}
        {professionalInfo.certificates.length > 0 && (
          <View style={styles.certificateList}>
            {professionalInfo.certificates.map((cert, index) => (
              <View key={index} style={styles.certificateCard}>
                <View style={styles.certificateHeader}>
                  <MaterialCommunityIcons
                    name="certificate"
                    size={20}
                    color="#8B5CF6"
                  />
                  <Text style={styles.certificateName}>{cert.name}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveCertificate(index)}
                    style={styles.certificateClose}
                  >
                    <MaterialCommunityIcons
                      name="close-circle"
                      size={20}
                      color="#EF4444"
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.certificateDetail}>Ngày cấp: {formatDate(cert.issueDate)}</Text>
                <Text style={styles.certificateDetail}>Tổ chức: {cert.issuingOrganization}</Text>
                <Text style={styles.certificateDetail}>Loại: {cert.type}</Text>
                {cert.image && (
                  <View style={styles.certificateImageContainer}>
                    <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" />
                    <Text style={styles.certificateImageText}>Đã có ảnh</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Certificate Date Calendar Picker */}
        {Platform.OS === "ios" ? (
          <Modal visible={showCertificateDatePicker} transparent={true} animationType="slide">
            <View style={styles.calendarModalOverlay}>
              <View style={styles.calendarModalContent}>
                <View style={styles.calendarModalHeader}>
                  <TouchableOpacity
                    onPress={() => {
                      setShowCertificateDatePicker(false);
                      setCurrentCertificateIndex(null);
                    }}
                  >
                    <Text style={styles.calendarModalCancel}>Hủy</Text>
                  </TouchableOpacity>
                  <Text style={styles.calendarModalTitle}>Chọn ngày cấp</Text>
                  <TouchableOpacity onPress={handleCertificateDateConfirm}>
                    <Text style={styles.calendarModalConfirm}>Xác nhận</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={tempCertificateDate}
                  mode="date"
                  display="spinner"
                  onChange={handleCertificateDateChange}
                  maximumDate={new Date()}
                  textColor="#1F2937"
                />
              </View>
            </View>
          </Modal>
        ) : (
          showCertificateDatePicker && (
            <DateTimePicker
              value={tempCertificateDate}
              mode="date"
              display="default"
              onChange={handleCertificateDateChange}
              maximumDate={new Date()}
            />
          )
        )}

        {/* Education Picker Modal */}
        <Modal visible={showEducationPicker} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setShowEducationPicker(false)}
            />
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Chọn trình độ học vấn</Text>
              {educationLevels.slice(1).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={styles.modalOption}
                  onPress={() => {
                    setProfessionalInfo({ ...professionalInfo, education: level });
                    setShowEducationPicker(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      professionalInfo.education === level && styles.modalOptionTextSelected,
                    ]}
                  >
                    {level}
                  </Text>
                  {professionalInfo.education === level && (
                    <MaterialCommunityIcons name="check" size={20} color="#70C1F1" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>

        {/* Certificate Type Picker Modal */}
        <Modal visible={showCertificateTypePicker} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setShowCertificateTypePicker(false)}
            />
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Chọn loại chứng chỉ</Text>
              {certificateTypes.slice(1).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.modalOption}
                  onPress={() => {
                    setNewCertificate({ ...newCertificate, type });
                    setShowCertificateTypePicker(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      newCertificate.type === type && styles.modalOptionTextSelected,
                    ]}
                  >
                    {type}
                  </Text>
                  {newCertificate.type === type && (
                    <MaterialCommunityIcons name="check" size={20} color="#70C1F1" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );

  const renderAdditionalInfo = () => (
    <View style={styles.contentCard}>
      <View style={styles.contentTitleContainer}>
        <MaterialCommunityIcons name="file-document" size={24} color="#70C1F1" />
        <Text style={styles.contentTitle}>Hồ sơ bổ sung</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Ảnh đại diện</Text>
        <TouchableOpacity
          style={styles.fileUploadContainer}
          onPress={() => handleImagePicker("profile")}
          activeOpacity={0.7}
        >
          <View style={styles.fileUploadContent}>
            <MaterialCommunityIcons
              name={additionalInfo.profileImage ? "check-circle" : "image-outline"}
              size={24}
              color={additionalInfo.profileImage ? "#10B981" : "#6B7280"}
            />
            <Text
              style={[
                styles.fileText,
                additionalInfo.profileImage && styles.fileTextSuccess,
              ]}
            >
              {additionalInfo.profileImage
                ? "Đã chọn ảnh"
                : "Không có tệp nào được chọn"}
            </Text>
          </View>
          <View style={styles.fileButton}>
            <Text style={styles.fileButtonText}>Chọn tệp</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Video giới thiệu (link YouTube hoặc upload)
        </Text>
        <View style={styles.inputWithIcon}>
          <MaterialCommunityIcons
            name="video-outline"
            size={20}
            color="#6B7280"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.inputWithIconText}
            placeholder="Nhập link YouTube, Vimeo hoặc Dailymotion"
            placeholderTextColor="#9CA3AF"
            value={additionalInfo.videoLink}
            onChangeText={(text) =>
              setAdditionalInfo({ ...additionalInfo, videoLink: text })
            }
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Giới thiệu</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Giới thiệu về bản thân, kinh nghiệm, điểm mạnh..."
          placeholderTextColor="#9CA3AF"
          value={additionalInfo.introduction}
          onChangeText={(text) =>
            setAdditionalInfo({ ...additionalInfo, introduction: text })
          }
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  const renderCommitment = () => (
    <View style={styles.contentCard}>
      <View style={styles.contentTitleContainer}>
        <MaterialCommunityIcons name="shield-check" size={24} color="#70C1F1" />
        <Text style={styles.contentTitle}>Cam kết</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.commitmentOption,
          commitmentInfo.ethicalCommitment && styles.commitmentOptionSelected,
        ]}
        onPress={() =>
          setCommitmentInfo({
            ...commitmentInfo,
            ethicalCommitment: !commitmentInfo.ethicalCommitment,
          })
        }
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.radioButton,
            commitmentInfo.ethicalCommitment && styles.radioButtonSelected,
          ]}
        >
          {commitmentInfo.ethicalCommitment && (
            <View style={styles.radioButtonInner} />
          )}
        </View>
        <Text
          style={[
            styles.commitmentText,
            commitmentInfo.ethicalCommitment && styles.commitmentTextSelected,
          ]}
        >
          Tôi cam kết tuân thủ các nguyên tắc đạo đức nghề nghiệp và cung cấp
          dịch vụ chăm sóc chất lượng cao.{" "}
          <Text style={styles.required}>*</Text>
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.commitmentOption,
          commitmentInfo.termsAgreement && styles.commitmentOptionSelected,
        ]}
        onPress={() =>
          setCommitmentInfo({
            ...commitmentInfo,
            termsAgreement: !commitmentInfo.termsAgreement,
          })
        }
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.radioButton,
            commitmentInfo.termsAgreement && styles.radioButtonSelected,
          ]}
        >
          {commitmentInfo.termsAgreement && (
            <View style={styles.radioButtonInner} />
          )}
        </View>
        <Text
          style={[
            styles.commitmentText,
            commitmentInfo.termsAgreement && styles.commitmentTextSelected,
          ]}
        >
          Tôi đồng ý với các điều khoản và điều kiện sử dụng hệ thống{" "}
          <Text style={styles.required}>*</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );


  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Gradient */}
          <LinearGradient
            colors={["#70C1F1", "#70C1F1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerGradient}
          >
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Hoàn thiện hồ sơ đăng ký</Text>
              <Text style={styles.headerSubtitle}>
                Vui lòng điền đầy đủ thông tin để hoàn thiện hồ sơ chuyên nghiệp
                của bạn.
              </Text>
            </View>
          </LinearGradient>

        {/* Registration Info Card */}
        <View style={styles.registrationCard}>
          <View style={styles.registrationHeader}>
            <MaterialCommunityIcons name="account-circle" size={24} color="#70C1F1" />
            <Text style={styles.registrationTitle}>Thông tin đăng ký</Text>
          </View>
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Họ và tên</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập họ và tên"
                placeholderTextColor="#9CA3AF"
                value={registrationInfo.fullName}
                onChangeText={(text) =>
                  setRegistrationInfo({ ...registrationInfo, fullName: text })
                }
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputDisabled}>
                <Text style={styles.inputDisabledText}>{registrationInfo.email || "email@gmail.com"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Personal Info */}
        {renderPersonalInfo()}

        {/* Professional Info */}
        {renderProfessionalInfo()}

        {/* Additional Info */}
        {renderAdditionalInfo()}

        {/* Commitment */}
        {renderCommitment()}

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color="#6B7280" />
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleComplete}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="check" size={20} color="#fff" />
          <Text style={styles.completeButtonText}>Hoàn tất hồ sơ</Text>
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 0 : 20,
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
    lineHeight: 36,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#fff",
    lineHeight: 22,
    opacity: 0.95,
  },
  registrationCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: -12,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  registrationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  registrationTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputGroup: {
    flex: 1,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 10,
  },
  required: {
    color: "#EF4444",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1F2937",
    minHeight: 48,
  },
  inputDisabled: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputDisabledText: {
    fontSize: 15,
    color: "#6B7280",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputWithIconText: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
    padding: 0,
  },
  contentCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 20,
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  firstContentCard: {
    marginTop: 16,
  },
  contentTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  radioGroup: {
    flexDirection: "row",
    gap: 20,
    flexWrap: "wrap",
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  radioOptionSelected: {
    borderColor: "#70C1F1",
    backgroundColor: "#EFF6FF",
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    borderColor: "#70C1F1",
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#70C1F1",
  },
  radioLabel: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
  },
  radioLabelSelected: {
    color: "#70C1F1",
    fontWeight: "600",
  },
  addButtonContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  addInput: {
    flex: 1,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#70C1F1",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: "center",
    shadowColor: "#70C1F1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tagText: {
    fontSize: 13,
    color: "#1F2937",
    fontWeight: "500",
  },
  tagClose: {
    marginLeft: 2,
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pickerText: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
  },
  pickerTextPlaceholder: {
    color: "#9CA3AF",
  },
  fileUploadContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  fileUploadContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  fileText: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
  },
  fileTextSuccess: {
    color: "#10B981",
    fontWeight: "600",
  },
  fileButton: {
    backgroundColor: "#70C1F1",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: "#70C1F1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  fileButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  textArea: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1F2937",
    minHeight: 140,
    textAlignVertical: "top",
    lineHeight: 22,
  },
  commitmentOption: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  commitmentOptionSelected: {
    borderColor: "#70C1F1",
    backgroundColor: "#EFF6FF",
  },
  commitmentText: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
    lineHeight: 22,
    fontWeight: "500",
  },
  commitmentTextSelected: {
    color: "#70C1F1",
    fontWeight: "600",
  },
  bottomActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  nextButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#70C1F1",
    shadowColor: "#70C1F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  completeButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#70C1F1",
    shadowColor: "#70C1F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
    height: 48,
  },
  dateInputContainerEmpty: {
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    minHeight: 48,
    height: 48,
  },
  dateInputText: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
  },
  dateInputPlaceholder: {
    color: "#6B7280",
    fontWeight: "400",
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  datePickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "90%",
    maxHeight: "80%",
    padding: 20,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  datePickerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  datePickerContent: {
    maxHeight: 400,
  },
  datePickerScroll: {
    maxHeight: 400,
  },
  datePickerRow: {
    flexDirection: "row",
    gap: 12,
  },
  datePickerColumn: {
    flex: 1,
  },
  datePickerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
    textAlign: "center",
  },
  datePickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: "#F9FAFB",
  },
  datePickerItemSelected: {
    backgroundColor: "#70C1F1",
  },
  datePickerItemText: {
    fontSize: 14,
    color: "#1F2937",
    textAlign: "center",
  },
  datePickerItemTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  datePickerButton: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#70C1F1",
    alignItems: "center",
  },
  datePickerButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  certificateForm: {
    gap: 12,
    marginBottom: 16,
  },
  certificateList: {
    gap: 12,
    marginTop: 16,
  },
  certificateCard: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  certificateHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  certificateName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  certificateClose: {
    marginLeft: "auto",
  },
  certificateDetail: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  certificateImageContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  certificateImageText: {
    fontSize: 13,
    color: "#10B981",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "85%",
    maxHeight: "70%",
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: "#F9FAFB",
  },
  modalOptionText: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
  },
  modalOptionTextSelected: {
    color: "#70C1F1",
    fontWeight: "600",
  },
  calendarModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  calendarModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  calendarModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  calendarModalCancel: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  calendarModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  calendarModalConfirm: {
    fontSize: 16,
    color: "#70C1F1",
    fontWeight: "600",
  },
});

