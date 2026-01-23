import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "@react-navigation/native";
import React, { useState, useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { mainService } from "@/services/main.service";

// Mock data
const MOCK_CERTIFICATES = [
  {
    id: 1,
    name: "Chứng chỉ Điều dưỡng viên",
    organization: "Bộ Y tế",
    issueDate: "15/03/2020",
    expiryDate: "15/03/2025",
    certificateNumber: "DDV-2020-00156",
    status: "verified",
  },
  {
    id: 2,
    name: "Chứng chỉ Chăm sóc người cao tuổi",
    organization: "Trường Y Hà Nội",
    issueDate: "20/10/2023",
    expiryDate: "Vô thời hạn",
    certificateNumber: "CSNT-2023-0892",
    status: "pending",
  },
  {
    id: 3,
    name: "Chứng chỉ Sơ cấp cứu",
    organization: "Hội Chữ thập đỏ",
    issueDate: "10/05/2022",
    expiryDate: "10/05/2024",
    certificateNumber: "SCC-2022-1345",
    status: "rejected",
    rejectReason: "Hình ảnh không rõ ràng. Vui lòng tải lên bản scan/chụp ảnh chất lượng cao hơn với đầy đủ 4 góc chứng chỉ.",
  },
];


interface QualificationType {
  qualificationTypeId: string;
  typeName: string;
  description?: string;
  isActive?: boolean;
}

export default function CertificatesScreen() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageSourceModal, setImageSourceModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qualificationTypes, setQualificationTypes] = useState<QualificationType[]>([]);
  const [showQualificationPicker, setShowQualificationPicker] = useState(false);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDateField, setCurrentDateField] = useState<'issueDate' | 'expiryDate' | null>(null);
  const [datePickerValue, setDatePickerValue] = useState(new Date());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [certificateToDelete, setCertificateToDelete] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({
    qualificationTypeId: "",
    organization: "",
    issueDate: "",
    expiryDate: "",
    certificateNumber: "",
    notes: "",
    image: null as any,
  });

  const [errors, setErrors] = useState({
    qualificationTypeId: "",
    organization: "",
    issueDate: "",
    expiryDate: "",
    image: "",
  });

  // Load qualification types
  useEffect(() => {
    const loadQualificationTypes = async () => {
      try {
        const types = await mainService.getQualificationTypes();
        setQualificationTypes(types);
      } catch (error) {
        // Error loading qualification types
      }
    };
    loadQualificationTypes();
  }, []);

  // Map qualifications to certificates format
  const mapQualificationsToCertificates = (qualifications: any[]) => {
    return qualifications.map((qual: any, index: number) => {
          
          // Format dates
          const formatDate = (dateString: string | null) => {
            if (!dateString) return 'Vô thời hạn';
            try {
              const date = new Date(dateString);
              return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
            } catch {
              return dateString;
            }
          };

          // Map status - check deleted first
          let status = 'pending';
          
          // Get raw status value
          const rawStatus = qual.status;
          
          // Debug: Log raw status before processing
          console.log('=== MAPPING STATUS ===', {
            qualificationId: qual.qualificationId,
            rawStatus: rawStatus,
            rawStatusType: typeof rawStatus,
            rawStatusValue: JSON.stringify(rawStatus),
            deleted: qual.deleted
          });
          
          if (qual.deleted === true || qual.deleted === 'true') {
            status = 'deleted';
          } else if (rawStatus === 'APPROVED' || rawStatus === 'Approved' || rawStatus === 'approved') {
            status = 'verified';
          } else if (rawStatus === 'REJECTED' || rawStatus === 'Rejected' || rawStatus === 'rejected') {
            status = 'rejected';
          } else if (rawStatus === 'PENDING' || rawStatus === 'Pending' || rawStatus === 'pending') {
            status = 'pending';
          }
          
          console.log('=== MAPPED STATUS ===', {
            qualificationId: qual.qualificationId,
            rawStatus: rawStatus,
            mappedStatus: status
          });

          return {
            id: qual.qualificationId || index + 1,
            qualificationId: qual.qualificationId,
            name: qual.qualificationTypeName || 'Chứng chỉ',
            organization: qual.issuingOrganization || 'Chưa có',
            issueDate: formatDate(qual.issueDate),
            expiryDate: formatDate(qual.expiryDate),
            certificateNumber: qual.certificateNumber || 'Chưa có',
            status: status,
            deleted: qual.deleted === true || qual.deleted === 'true',
            rejectReason: qual.rejection_reason || qual.rejectionReason || null,
            certificateUrl: qual.certificateUrl || null,
          };
    });
  };

  // Load certificates from API
  const loadCertificates = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      // Always load from API
      const response = await mainService.getCaregiverProfile();
      
      if (response.status === 'Success' && response.data) {
        // Map qualifications to certificates format
        const mappedCertificates = mapQualificationsToCertificates(response.data.qualifications || []);
        
        setCertificates(mappedCertificates);
      } else {
        setError(response.message || 'Không thể tải dữ liệu');
        setCertificates([]);
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
      setCertificates([]);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  // Load certificates when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadCertificates();
    }, [])
  );

  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    loadCertificates(true);
  }, []);

  const validateForm = () => {
    const newErrors: any = {};
    
    // Qualification type
    if (!form.qualificationTypeId) {
      newErrors.qualificationTypeId = "Vui lòng chọn loại chứng chỉ";
    }

    // Hình ảnh
    if (!form.image) {
      newErrors.image = "Hình ảnh chứng chỉ là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setAdding(true);

      // Format dates to yyyy-MM-dd
      const formatDateForAPI = (dateString: string) => {
        if (!dateString) return undefined;
        try {
          const date = new Date(dateString);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        } catch {
          return undefined;
        }
      };

      const qualificationData = {
        qualification_type_id: form.qualificationTypeId,
        certificate_number: form.certificateNumber || undefined,
        issuing_organization: form.organization || undefined,
        issue_date: formatDateForAPI(form.issueDate),
        expiry_date: formatDateForAPI(form.expiryDate),
        notes: form.notes || undefined,
      };

      const response = await mainService.addCaregiverQualification(
        qualificationData,
        form.image
      );

      if (response.status === 'Success') {
        setModalVisible(false);
        setForm({ 
          qualificationTypeId: "", 
          organization: "", 
          issueDate: "", 
          expiryDate: "", 
          certificateNumber: "",
          notes: "",
          image: null 
        });
        setErrors({
          qualificationTypeId: "",
          organization: "",
          issueDate: "",
          expiryDate: "",
          image: "",
        });
        // Reload certificates
        await loadCertificates();
        // Show success modal
        setSuccessMessage("Chứng chỉ đã được gửi để xác minh!");
        setShowSuccessModal(true);
      } else {
        Alert.alert("Lỗi", response.message || "Không thể thêm chứng chỉ");
      }
    } catch (err: any) {
      Alert.alert("Lỗi", err.message || "Có lỗi xảy ra khi thêm chứng chỉ");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = (qualificationId: string) => {
    setCertificateToDelete(qualificationId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!certificateToDelete) return;
    
    try {
      setDeleting(certificateToDelete);
      const response = await mainService.deleteCaregiverQualification(certificateToDelete);
      
      if (response.status === 'Success') {
        // Reload certificates
        await loadCertificates();
        // Show success modal
        setSuccessMessage("Đã xóa chứng chỉ");
        setShowSuccessModal(true);
      } else {
        Alert.alert("Lỗi", response.message || "Không thể xóa chứng chỉ");
      }
    } catch (err: any) {
      Alert.alert("Lỗi", err.message || "Có lỗi xảy ra khi xóa chứng chỉ");
    } finally {
      setDeleting(null);
      setShowDeleteModal(false);
      setCertificateToDelete(null);
    }
  };

  const handlePickImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("Cần quyền truy cập", "Vui lòng cho phép truy cập thư viện ảnh!");
        return;
      }

      // Show custom modal instead of Alert
      setImageSourceModal(true);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chọn file. Vui lòng thử lại!");
    }
  };

  const handleSelectLibrary = async () => {
    setImageSourceModal(false);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fileSizeInMB = (asset.fileSize || 0) / (1024 * 1024);
        
        if (fileSizeInMB > 5) {
          Alert.alert("File quá lớn", "Vui lòng chọn file nhỏ hơn 5MB");
          return;
        }

        setForm({ 
          ...form, 
          image: { 
            uri: asset.uri, 
            name: asset.fileName || "certificate.jpg",
            size: asset.fileSize || 0,
            type: asset.type || "image"
          } 
        });
        setErrors({ ...errors, image: "" });
      }
    } catch (error) {
      // Error selecting from library
    }
  };

  const handleSelectCamera = async () => {
    setImageSourceModal(false);
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      if (!cameraPermission.granted) {
        Alert.alert("Cần quyền truy cập", "Vui lòng cho phép sử dụng máy ảnh!");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fileSizeInMB = (asset.fileSize || 0) / (1024 * 1024);
        
        if (fileSizeInMB > 5) {
          Alert.alert("File quá lớn", "Vui lòng chọn file nhỏ hơn 5MB");
          return;
        }

        setForm({ 
          ...form, 
          image: { 
            uri: asset.uri, 
            name: "certificate.jpg",
            size: asset.fileSize || 0,
            type: "image"
          } 
        });
        setErrors({ ...errors, image: "" });
      }
    } catch (error) {
      // Error taking photo
    }
  };

  const handleSelectDocument = async () => {
    setImageSourceModal(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const fileSizeInMB = (asset.size || 0) / (1024 * 1024);
        
        if (fileSizeInMB > 5) {
          Alert.alert("File quá lớn", "Vui lòng chọn file nhỏ hơn 5MB");
          return;
        }

        setForm({ 
          ...form, 
          image: { 
            uri: asset.uri, 
            name: asset.name,
            size: asset.size || 0,
            type: "document"
          } 
        });
        setErrors({ ...errors, image: "" });
      }
    } catch (error) {
      // Error selecting document
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3FD2CD" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
        <CaregiverBottomNav activeTab="profile" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              setError(null);
              // Reload will be triggered by useEffect
            }}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
        <CaregiverBottomNav activeTab="profile" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3FD2CD']}
            tintColor="#3FD2CD"
          />
        }
      >
        <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                <MaterialCommunityIcons name="certificate" size={22} color="#333" /> Chứng chỉ của tôi
              </Text>
              <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            
            {certificates.map((cert) => {
              console.log('Rendering certificate:', {
                id: cert.id,
                name: cert.name,
                status: cert.status,
                deleted: cert.deleted,
                statusType: typeof cert.status
              });
              
              const isVerified = cert.status === "verified";
              const isPending = cert.status === "pending";
              const isRejected = cert.status === "rejected";
              const isDeleted = cert.status === "deleted" || cert.deleted === true;
              
              console.log('Status flags:', { isVerified, isPending, isRejected, isDeleted });

              return (
                <View
                  key={cert.id}
                  style={[
                    styles.certCard,
                    isVerified && styles.certVerified,
                    isPending && styles.certPending,
                    isRejected && styles.certRejected,
                    isDeleted && styles.certDeleted,
                  ]}
                >
                  <View style={styles.certHeader}>
                    <View style={styles.certIcon}>
                      <MaterialCommunityIcons 
                        name={
                          isDeleted ? "delete-circle" :
                          isRejected ? "close-circle" :
                          isPending ? "clock-outline" :
                          isVerified ? "certificate" : "certificate-outline"
                        } 
                        size={36} 
                        color={
                          isDeleted ? "#9E9E9E" :
                          isRejected ? "#F44336" :
                          isPending ? "#FF9800" :
                          isVerified ? "#4CAF50" : "#FF9800"
                        } 
                      />
                    </View>
                    <View style={styles.certInfo}>
                      <Text style={styles.certName}>{cert.name}</Text>
                      <Text style={styles.certDetail}>
                        <MaterialCommunityIcons name="office-building" size={14} color="#666" /> {cert.organization}
                      </Text>
                      <Text style={styles.certDetail}>
                        <MaterialCommunityIcons name="calendar" size={14} color="#666" /> Cấp: {cert.issueDate}
                      </Text>
                      <Text style={styles.certDetail}>
                        <MaterialCommunityIcons name="clock-outline" size={14} color="#666" /> HSD: {cert.expiryDate}
                      </Text>
                      <Text style={styles.certDetail}>
                        <MaterialCommunityIcons name="identifier" size={14} color="#666" /> Số CC: {cert.certificateNumber}
                      </Text>
                    </View>
                  </View>


                  {isDeleted && (
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusDeleted}>
                        <MaterialCommunityIcons name="delete-circle" size={16} color="#9E9E9E" /> Đã xóa
                      </Text>
                    </View>
                  )}

                  {isRejected && !isDeleted && (
                    <>
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusRejected}>
                          <MaterialCommunityIcons name="close-circle" size={16} color="#F44336" /> Bị từ chối
                        </Text>
                      </View>
                      <View style={styles.rejectBox}>
                        <Text style={styles.rejectTitle}>Lý do từ chối</Text>
                        <Text style={styles.rejectText}>{cert.rejectReason}</Text>
                      </View>
                    </>
                  )}

                  {isPending && !isDeleted && (
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusPending}>
                        <MaterialCommunityIcons name="clock-outline" size={16} color="#FF9800" /> Đang chờ duyệt
                      </Text>
                    </View>
                  )}

                  {isVerified && !isDeleted && (
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusVerified}>
                        <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" /> Đã xác minh
                      </Text>
                    </View>
                  )}

                  <View style={styles.certActions}>
                    {cert.certificateUrl && !isDeleted && (
                      <TouchableOpacity 
                        style={styles.btnView}
                        onPress={() => {
                          setSelectedImageUrl(cert.certificateUrl);
                          setShowImageModal(true);
                        }}
                      >
                        <Text style={styles.btnViewText}>Xem ảnh</Text>
                      </TouchableOpacity>
                    )}
                    {!isDeleted && (
                      <TouchableOpacity 
                        style={[styles.btnDelete, deleting === cert.qualificationId && styles.btnDeleteDisabled]}
                        onPress={() => cert.qualificationId && handleDelete(cert.qualificationId)}
                        disabled={deleting === cert.qualificationId}
                      >
                        {deleting === cert.qualificationId ? (
                          <ActivityIndicator size="small" color="#666" />
                        ) : (
                          <Text style={styles.btnDeleteText}>Xóa</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
      </ScrollView>

      {/* Modal thêm chứng chỉ */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScrollView}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <MaterialCommunityIcons name="certificate" size={24} color="#3FD2CD" />
                <Text style={styles.modalTitle}>Thêm chứng chỉ mới</Text>
              </View>
              
              <Text style={styles.modalSubtitle}>
                Vui lòng điền đầy đủ thông tin và tải lên hình ảnh chứng chỉ.
              </Text>

              {/* Loại chứng chỉ */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Loại chứng chỉ <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[styles.pickerButton, errors.qualificationTypeId && styles.inputError]}
                  onPress={() => setShowQualificationPicker(true)}
                >
                  <Text style={[
                    styles.pickerText,
                    !form.qualificationTypeId && styles.pickerPlaceholder
                  ]}>
                    {form.qualificationTypeId
                      ? qualificationTypes.find(t => t.qualificationTypeId === form.qualificationTypeId)?.typeName || 'Chọn loại chứng chỉ'
                      : 'Chọn loại chứng chỉ'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#68C2E8" />
                </TouchableOpacity>
                {errors.qualificationTypeId ? <Text style={styles.errorText}>{errors.qualificationTypeId}</Text> : null}
              </View>

              {/* Tổ chức cấp */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Nơi cấp
                </Text>
                <TextInput
                  placeholder="Nơi cấp"
                  placeholderTextColor="#999"
                  value={form.organization}
                  onChangeText={(t) => {
                    setForm({ ...form, organization: t });
                    if (errors.organization) setErrors({ ...errors, organization: "" });
                  }}
                  style={[styles.input, errors.organization && styles.inputError]}
                />
                {errors.organization ? <Text style={styles.errorText}>{errors.organization}</Text> : null}
              </View>

              {/* Ngày cấp */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Ngày cấp
                </Text>
                <TouchableOpacity
                  style={[styles.birthYearInput, errors.issueDate && styles.inputError]}
                  onPress={() => {
                    setCurrentDateField('issueDate');
                    setDatePickerValue(form.issueDate ? new Date(form.issueDate) : new Date());
                    setShowDatePicker(true);
                  }}
                >
                  <Text style={form.issueDate ? styles.dateText : styles.placeholderText}>
                    {form.issueDate ? new Date(form.issueDate).toLocaleDateString('vi-VN') : 'Chọn ngày cấp'}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color="#68C2E8" />
                </TouchableOpacity>
                {errors.issueDate ? <Text style={styles.errorText}>{errors.issueDate}</Text> : null}
              </View>

              {/* Ngày hết hạn */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Ngày hết hạn
                </Text>
                <TouchableOpacity
                  style={[styles.birthYearInput, errors.expiryDate && styles.inputError]}
                  onPress={() => {
                    setCurrentDateField('expiryDate');
                    setDatePickerValue(form.expiryDate ? new Date(form.expiryDate) : new Date());
                    setShowDatePicker(true);
                  }}
                >
                  <Text style={form.expiryDate ? styles.dateText : styles.placeholderText}>
                    {form.expiryDate ? new Date(form.expiryDate).toLocaleDateString('vi-VN') : 'Chọn ngày hết hạn'}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color="#68C2E8" />
                </TouchableOpacity>
                {errors.expiryDate ? <Text style={styles.errorText}>{errors.expiryDate}</Text> : null}
              </View>

              {/* Ghi chú */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ghi chú</Text>
                <TextInput
                  placeholder="Ghi chú"
                  placeholderTextColor="#999"
                  value={form.notes}
                  onChangeText={(t) => setForm({ ...form, notes: t })}
                  style={[styles.input, styles.textArea, styles.textAreaTop]}
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                />
              </View>

              {/* Số chứng chỉ */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Số chứng chỉ
                </Text>
                <TextInput
                  placeholder="Số chứng chỉ"
                  placeholderTextColor="#999"
                  value={form.certificateNumber}
                  onChangeText={(t) => setForm({ ...form, certificateNumber: t })}
                  style={styles.input}
                  maxLength={50}
                />
              </View>

              {/* File chứng chỉ */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  File chứng chỉ <Text style={styles.required}>*</Text>
                </Text>
                {form.image ? (
                  <View style={styles.filePreviewContainer}>
                    <TouchableOpacity
                      style={styles.filePreviewButton}
                      onPress={() => {
                        // Show image preview if needed
                        setSelectedImageUrl(form.image.uri);
                        setShowImageModal(true);
                      }}
                    >
                      <Ionicons name="document-text" size={24} color="#68C2E8" />
                      <View style={styles.filePreviewInfo}>
                        <Text style={styles.filePreviewName} numberOfLines={1}>
                          {form.image.name}
                        </Text>
                        <Text style={styles.filePreviewType}>
                          {form.image.type?.includes('pdf') ? 'PDF' : 'Image'}
                        </Text>
                      </View>
                      <Ionicons name="eye-outline" size={20} color="#68C2E8" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeFileButton}
                      onPress={() => setForm({ ...form, image: null })}
                    >
                      <Ionicons name="close-circle" size={24} color="#dc3545" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.fileButton}
                    onPress={handlePickImage}
                  >
                    <Ionicons name="document" size={20} color="#68C2E8" />
                    <Text style={styles.fileButtonText}>
                      Chọn file chứng chỉ
                    </Text>
                  </TouchableOpacity>
                )}
                {errors.image ? <Text style={styles.errorText}>{errors.image}</Text> : null}
              </View>

              {/* Actions */}
              <TouchableOpacity 
                style={[styles.submitBtn, adding && styles.submitBtnDisabled]} 
                onPress={handleAdd}
                disabled={adding}
              >
                {adding ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="check" size={20} color="#FFF" />
                    <Text style={styles.submitBtnText}>Gửi chứng chỉ để xác minh</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setModalVisible(false);
                  setForm({
                    qualificationTypeId: "",
                    organization: "",
                    issueDate: "",
                    expiryDate: "",
                    certificateNumber: "",
                    notes: "",
                    image: null,
                  });
                  setErrors({
                    qualificationTypeId: "",
                    organization: "",
                    issueDate: "",
                    expiryDate: "",
                    image: "",
                  });
                }}
                disabled={adding}
              >
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal chọn nguồn ảnh */}
      <Modal visible={imageSourceModal} animationType="fade" transparent>
        <TouchableOpacity 
          style={styles.sourceModalOverlay}
          activeOpacity={1}
          onPress={() => setImageSourceModal(false)}
        >
          <View style={styles.sourceModalContent}>
            {/* Header với nút X */}
            <View style={styles.sourceModalHeader}>
              <Text style={styles.sourceModalTitle}>Chọn nguồn</Text>
              <TouchableOpacity 
                onPress={() => setImageSourceModal(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons name="close-circle" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.sourceModalSubtitle}>Bạn muốn chọn ảnh từ đâu?</Text>

            {/* Options */}
            <View style={styles.sourceOptions}>
              <TouchableOpacity 
                style={styles.sourceOption}
                onPress={handleSelectLibrary}
              >
                <View style={styles.sourceIconBox}>
                  <MaterialCommunityIcons name="image-multiple" size={32} color="#2196F3" />
                </View>
                <Text style={styles.sourceOptionText}>Thư viện</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.sourceOption}
                onPress={handleSelectCamera}
              >
                <View style={styles.sourceIconBox}>
                  <MaterialCommunityIcons name="camera" size={32} color="#4CAF50" />
                </View>
                <Text style={styles.sourceOptionText}>Máy ảnh</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.sourceOption}
                onPress={handleSelectDocument}
              >
                <View style={styles.sourceIconBox}>
                  <MaterialCommunityIcons name="file-pdf-box" size={32} color="#F44336" />
                </View>
                <Text style={styles.sourceOptionText}>Chọn PDF</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal chọn loại chứng chỉ */}
      <Modal visible={showQualificationPicker} animationType="slide" transparent>
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModalContent}>
            <View style={styles.pickerModalHeader}>
              <Text style={styles.pickerModalTitle}>Chọn loại chứng chỉ</Text>
              <TouchableOpacity onPress={() => setShowQualificationPicker(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerModalList}>
              {qualificationTypes.map((type) => (
                <TouchableOpacity
                  key={type.qualificationTypeId}
                  style={[
                    styles.pickerOption,
                    form.qualificationTypeId === type.qualificationTypeId && styles.pickerOptionSelected
                  ]}
                  onPress={() => {
                    setForm({ ...form, qualificationTypeId: type.qualificationTypeId });
                    setErrors({ ...errors, qualificationTypeId: "" });
                    setShowQualificationPicker(false);
                  }}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    form.qualificationTypeId === type.qualificationTypeId && styles.pickerOptionTextSelected
                  ]}>
                    {type.typeName}
                  </Text>
                  {form.qualificationTypeId === type.qualificationTypeId && (
                    <Ionicons name="checkmark" size={20} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.datePickerModalContainer}>
              <View style={styles.datePickerModalHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.birthYearPickerCancel}>Hủy</Text>
                </TouchableOpacity>
                <Text style={styles.birthYearPickerTitle}>
                  {currentDateField === 'issueDate' ? 'Chọn ngày cấp' : 'Chọn ngày hết hạn'}
                </Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.birthYearPickerDone}>Xong</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={datePickerValue}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={currentDateField === 'issueDate' ? new Date() : undefined}
                minimumDate={currentDateField === 'expiryDate' ? new Date() : undefined}
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const selected = new Date(selectedDate);
                    selected.setHours(0, 0, 0, 0);
                    
                    // Validate ngày cấp: không được sau hôm nay
                    if (currentDateField === 'issueDate' && selected > today) {
                      Alert.alert("Lỗi", "Ngày cấp không được sau ngày hiện tại");
                      return;
                    }
                    
                    // Validate ngày hết hạn: không được trước hôm nay
                    if (currentDateField === 'expiryDate' && selected < today) {
                      Alert.alert("Lỗi", "Ngày hết hạn không được trong quá khứ");
                      return;
                    }
                    
                    setDatePickerValue(selectedDate);
                    if (Platform.OS === 'android') {
                      if (currentDateField) {
                        const dateStr = selectedDate.toISOString().split('T')[0];
                        setForm({ ...form, [currentDateField]: dateStr });
                        setErrors({ ...errors, [currentDateField]: "" });
                        setShowDatePicker(false);
                      }
                    }
                  } else if (Platform.OS === 'android') {
                    setShowDatePicker(false);
                  }
                }}
              />
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.datePickerDoneButton}
                  onPress={() => {
                    if (currentDateField) {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const selected = new Date(datePickerValue);
                      selected.setHours(0, 0, 0, 0);
                      
                      // Validate ngày cấp: không được sau hôm nay
                      if (currentDateField === 'issueDate' && selected > today) {
                        Alert.alert("Lỗi", "Ngày cấp không được sau ngày hiện tại");
                        return;
                      }
                      
                      // Validate ngày hết hạn: không được trước hôm nay
                      if (currentDateField === 'expiryDate' && selected < today) {
                        Alert.alert("Lỗi", "Ngày hết hạn không được trong quá khứ");
                        return;
                      }
                      
                      const dateStr = datePickerValue.toISOString().split('T')[0];
                      setForm({ ...form, [currentDateField]: dateStr });
                      setErrors({ ...errors, [currentDateField]: "" });
                    }
                    setShowDatePicker(false);
                  }}
                >
                  <Text style={styles.datePickerDoneButtonText}>Xong</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      )}

      {/* Modal xác nhận xóa */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowDeleteModal(false);
          setCertificateToDelete(null);
        }}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <View style={styles.deleteModalIconContainer}>
              <MaterialCommunityIcons name="alert-circle" size={48} color="#F44336" />
            </View>
            <Text style={styles.deleteModalTitle}>Xác nhận xóa</Text>
            <Text style={styles.deleteModalMessage}>
              Bạn có chắc chắn muốn xóa chứng chỉ này? Hành động này không thể hoàn tác.
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.deleteModalCancelButton}
                onPress={() => {
                  setShowDeleteModal(false);
                  setCertificateToDelete(null);
                }}
              >
                <Text style={styles.deleteModalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteModalConfirmButton, deleting && styles.deleteModalConfirmButtonDisabled]}
                onPress={confirmDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.deleteModalConfirmText}>Xóa</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal thành công */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successModalIconContainer}>
              <MaterialCommunityIcons name="check-circle" size={64} color="#4CAF50" />
            </View>
            <Text style={styles.successModalTitle}>Thành công</Text>
            <Text style={styles.successModalMessage}>
              {successMessage}
            </Text>
            <TouchableOpacity
              style={styles.successModalButton}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.successModalButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal xem ảnh chứng chỉ */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.imageModalOverlay}>
          <TouchableOpacity
            style={styles.imageModalCloseButton}
            onPress={() => setShowImageModal(false)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="close-circle" size={32} color="#fff" />
          </TouchableOpacity>
          {selectedImageUrl && (
            <ScrollView
              style={styles.imageModalScrollView}
              contentContainerStyle={styles.imageModalScrollContent}
              showsVerticalScrollIndicator={true}
              showsHorizontalScrollIndicator={true}
              bounces={true}
              centerContent={true}
            >
              <Image
                source={{ uri: selectedImageUrl }}
                style={styles.imageModalImage}
                resizeMode="contain"
              />
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <CaregiverBottomNav activeTab="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  scrollContent: {
    padding: 16,
    paddingBottom: 200, // Large padding to ensure bottom content is visible
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    flex: 1,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3FD2CD",
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 24,
    color: "#FFF",
    fontWeight: "600",
  },
  // Certificate Styles
  certCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  certVerified: {
    borderLeftWidth: 6,
    borderLeftColor: "#4CAF50",
  },
  certPending: {
    borderLeftWidth: 6,
    borderLeftColor: "#FF9800",
  },
  certRejected: {
    borderLeftWidth: 6,
    borderLeftColor: "#F44336",
  },
  certDeleted: {
    borderLeftWidth: 6,
    borderLeftColor: "#9E9E9E",
    opacity: 0.7,
  },
  certHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  certIcon: {
    width: 60,
    height: 60,
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  certIconText: {
    fontSize: 30,
  },
  certInfo: {
    flex: 1,
  },
  certName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
  },
  certDetail: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  statusBadge: {
    marginVertical: 8,
  },
  statusVerified: {
    color: "#4CAF50",
    fontWeight: "600",
    fontSize: 13,
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  statusPending: {
    color: "#FF9800",
    fontWeight: "600",
    fontSize: 13,
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  statusRejected: {
    color: "#F44336",
    fontWeight: "600",
    fontSize: 13,
    backgroundColor: "#FFEBEE",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  statusDeleted: {
    color: "#9E9E9E",
    fontWeight: "600",
    fontSize: 13,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  rejectBox: {
    backgroundColor: "#FFF9E6",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#FFB300",
  },
  rejectTitle: {
    fontWeight: "600",
    color: "#F57C00",
    marginBottom: 6,
    fontSize: 13,
  },
  rejectText: {
    color: "#666",
    fontSize: 12,
    lineHeight: 18,
  },
  certActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  btnView: {
    flex: 1,
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  btnViewText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  btnDelete: {
    flex: 1,
    backgroundColor: "#FFE5E5",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  btnDeleteDisabled: {
    opacity: 0.6,
  },
  btnDeleteText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 14,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalScrollView: {
    flex: 1,
    width: "100%",
  },
  modalBox: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginVertical: 40,
    marginHorizontal: "5%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  required: {
    color: "#F44336",
  },
  optional: {
    color: "#999",
    fontWeight: "400",
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
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E8EBED',
  },
  pickerText: {
    fontSize: 15,
    color: '#2C3E50',
    flex: 1,
  },
  pickerPlaceholder: {
    fontSize: 15,
    color: '#999',
  },
  birthYearInput: {
    height: 50,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
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
  textArea: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
  },
  textAreaTop: {
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: "#F44336",
    backgroundColor: "#FFEBEE",
  },
  errorText: {
    color: "#F44336",
    fontSize: 12,
    marginTop: 4,
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#68C2E8',
    marginTop: 8,
  },
  fileButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#68C2E8',
  },
  filePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  filePreviewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8EBED',
  },
  filePreviewInfo: {
    flex: 1,
  },
  filePreviewName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
    marginBottom: 4,
  },
  filePreviewType: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  removeFileButton: {
    padding: 4,
  },
  warningBox: {
    backgroundColor: "#FFF9E6",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FFB300",
  },
  warningText: {
    fontSize: 13,
    color: "#F57C00",
    lineHeight: 18,
  },
  submitBtn: {
    flexDirection: "row",
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    gap: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelBtn: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  cancelBtnText: {
    color: "#666",
    fontSize: 15,
    fontWeight: "600",
  },
  // Image Source Modal Styles
  sourceModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  sourceModalContent: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  sourceModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sourceModalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  sourceModalSubtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 24,
  },
  sourceOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  sourceOption: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  sourceIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sourceOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
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
    color: '#666',
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
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3FD2CD',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Picker Modal Styles
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerModalContent: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 24,
    width: "90%",
    maxHeight: "70%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  pickerModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  pickerModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  pickerModalList: {
    maxHeight: 400,
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  pickerOptionSelected: {
    backgroundColor: "#E3F2FD",
    borderColor: "#2196F3",
    borderWidth: 2,
  },
  pickerOptionText: {
    fontSize: 15,
    color: "#333",
    flex: 1,
  },
  pickerOptionTextSelected: {
    color: "#1976D2",
    fontWeight: "600",
  },
  // Image Modal Styles
  imageModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageModalCloseButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
    padding: 8,
  },
  imageModalScrollView: {
    flex: 1,
    width: "100%",
  },
  imageModalScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  imageModalImage: {
    width: "100%",
    height: "100%",
    minHeight: 400,
  },
  // Date Picker Modal Styles
  datePickerModalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '80%',
  },
  datePickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EBED',
  },
  birthYearPickerCancel: {
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  birthYearPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  birthYearPickerDone: {
    fontSize: 16,
    color: '#68C2E8',
    fontWeight: '600',
  },
  datePickerDoneButton: {
    backgroundColor: '#68C2E8',
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  datePickerDoneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Delete Modal Styles
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  deleteModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  deleteModalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
    textAlign: 'center',
  },
  deleteModalMessage: {
    fontSize: 15,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  deleteModalCancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EBED',
  },
  deleteModalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  deleteModalConfirmButton: {
    flex: 1,
    backgroundColor: '#F44336',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteModalConfirmButtonDisabled: {
    opacity: 0.6,
  },
  deleteModalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  // Success Modal Styles
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  successModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  successModalIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
    textAlign: 'center',
  },
  successModalMessage: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  successModalButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  successModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
