import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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

const MOCK_SKILLS = [
  { id: 1, name: "Quản lý thuốc", description: "Nhắc nhở và hỗ trợ uống thuốc", icon: "pill", selected: true },
  { id: 2, name: "Đo sinh hiệu", description: "Đo huyết áp, nhiệt độ, nhịp tim", icon: "heart-pulse", selected: true },
  { id: 3, name: "Sơ cấp cứu", description: "Xử lý tình huống khẩn cấp", icon: "ambulance", selected: false },
  { id: 4, name: "Dinh dưỡng", description: "Chuẩn bị bữa ăn lành mạnh", icon: "food-variant", selected: true },
  { id: 5, name: "Vật lý trị liệu", description: "Hỗ trợ phục hồi chức năng", icon: "human-handsup", selected: false },
  { id: 6, name: "Alzheimer Care", description: "Chăm sóc người mất trí nhớ", icon: "brain", selected: true },
  { id: 7, name: "Vệ sinh cá nhân", description: "Hỗ trợ tắm rửa, thay quần áo", icon: "shower", selected: false },
  { id: 8, name: "Chăm sóc vết thương", description: "Thay băng, vệ sinh vết thương", icon: "bandage", selected: false },
  { id: 9, name: "Hỗ trợ giao tiếp", description: "Trò chuyện, đồng hành tinh thần", icon: "chat", selected: false },
  { id: 10, name: "Hỗ trợ y tế", description: "Đi khám, mua thuốc", icon: "hospital-box", selected: false },
];

export default function CertificatesScreen() {
  const [activeTab, setActiveTab] = useState<"certificates" | "skills">("certificates");
  const [certificates, setCertificates] = useState<any[]>(MOCK_CERTIFICATES);
  const [skills, setSkills] = useState<any[]>(MOCK_SKILLS);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageSourceModal, setImageSourceModal] = useState(false);
  const [skillModalVisible, setSkillModalVisible] = useState(false);

  const [form, setForm] = useState({
    name: "",
    organization: "",
    issueDate: "",
    expiryDate: "",
    certificateNumber: "",
    image: null as any,
  });

  const [skillForm, setSkillForm] = useState({
    name: "",
    description: "",
    icon: "star", // Default icon
  });

  const [skillError, setSkillError] = useState("");

  const [errors, setErrors] = useState({
    name: "",
    organization: "",
    issueDate: "",
    expiryDate: "",
    image: "",
  });

  const validateForm = () => {
    const newErrors: any = {};
    
    // Tên chứng chỉ
    if (!form.name) {
      newErrors.name = "Tên chứng chỉ là bắt buộc";
    } else if (form.name.length < 5) {
      newErrors.name = "Tên chứng chỉ phải có ít nhất 5 ký tự";
    } else if (form.name.length > 100) {
      newErrors.name = "Tên chứng chỉ không được quá 100 ký tự";
    }

    // Tổ chức cấp
    if (!form.organization) {
      newErrors.organization = "Tổ chức cấp là bắt buộc";
    } else if (form.organization.length < 3) {
      newErrors.organization = "Tổ chức cấp phải có ít nhất 3 ký tự";
    } else if (form.organization.length > 100) {
      newErrors.organization = "Tổ chức cấp không được quá 100 ký tự";
    }

    // Ngày cấp
    if (!form.issueDate) {
      newErrors.issueDate = "Ngày cấp là bắt buộc";
    } else {
      const issueDate = new Date(form.issueDate);
      const today = new Date();
      if (issueDate > today) {
        newErrors.issueDate = "Ngày cấp không được sau ngày hiện tại";
      }
    }

    // Ngày hết hạn (optional)
    if (form.expiryDate && form.issueDate) {
      const issueDate = new Date(form.issueDate);
      const expiryDate = new Date(form.expiryDate);
      if (expiryDate <= issueDate) {
        newErrors.expiryDate = "Ngày hết hạn phải sau ngày cấp";
      }
    }

    // Số chứng chỉ (optional)
    if (form.certificateNumber && form.certificateNumber.length > 50) {
      newErrors.certificateNumber = "Số chứng chỉ không được quá 50 ký tự";
    }

    // Hình ảnh
    if (!form.image) {
      newErrors.image = "Hình ảnh chứng chỉ là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    if (!validateForm()) {
      return;
    }
    
    const newCert = {
      id: certificates.length + 1,
      name: form.name,
      organization: form.organization,
      issueDate: form.issueDate,
      expiryDate: form.expiryDate || "Vô thời hạn",
      certificateNumber: form.certificateNumber || "Chưa có",
      status: "pending",
      image: form.image,
    };
    
    setCertificates([...certificates, newCert]);
    setModalVisible(false);
    setForm({ 
      name: "", 
      organization: "", 
      issueDate: "", 
      expiryDate: "", 
      certificateNumber: "", 
      image: null 
    });
    setErrors({
      name: "",
      organization: "",
      issueDate: "",
      expiryDate: "",
      image: "",
    });
    alert("Chứng chỉ đã được gửi để xác minh!");
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
      console.error("Error picking image:", error);
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
      console.error("Error selecting from library:", error);
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
      console.error("Error taking photo:", error);
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
      console.error("Error selecting document:", error);
    }
  };

  const toggleSkill = (id: number) => {
    setSkills(skills.map(skill => 
      skill.id === id ? { ...skill, selected: !skill.selected } : skill
    ));
  };

  const handleDeleteSkill = (id: number, skillName: string) => {
    Alert.alert(
      "Xóa kỹ năng",
      `Bạn có chắc muốn xóa kỹ năng "${skillName}"?`,
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => {
            setSkills(skills.filter(skill => skill.id !== id));
            Alert.alert("Đã xóa", `Đã xóa kỹ năng "${skillName}"`);
          }
        }
      ]
    );
  };

  // Available icons for skills
  const availableIcons = [
    "pill", "heart-pulse", "ambulance", "food-variant", "human-handsup", "brain",
    "shower", "bandage", "chat", "hospital-box", "stethoscope", "needle",
    "medical-bag", "thermometer", "clipboard-pulse", "hand-heart", "spa", "flower"
  ];

  const handleAddSkill = () => {
    // Validate
    if (!skillForm.name || skillForm.name.trim().length < 3) {
      setSkillError("Vui lòng nhập tên kỹ năng (tối thiểu 3 ký tự)");
      return;
    }

    if (skillForm.name.length > 50) {
      setSkillError("Tên kỹ năng không được quá 50 ký tự");
      return;
    }

    // Create new skill
    const newSkill = {
      id: skills.length + 1,
      name: skillForm.name.trim(),
      description: skillForm.description.trim() || "Kỹ năng chăm sóc",
      icon: skillForm.icon,
      selected: true, // Auto-select new skill
    };

    // Add to skills list
    setSkills([...skills, newSkill]);

    // Reset form
    setSkillForm({ name: "", description: "", icon: "star" });
    setSkillError("");
    setSkillModalVisible(false);

    // Show success alert
    Alert.alert("Thành công", "✓ Đã thêm kỹ năng mới");
  };

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "certificates" && styles.tabActive]}
          onPress={() => setActiveTab("certificates")}
        >
          <Text style={[styles.tabText, activeTab === "certificates" && styles.tabTextActive]}>
            Chứng chỉ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "skills" && styles.tabActive]}
          onPress={() => setActiveTab("skills")}
        >
          <Text style={[styles.tabText, activeTab === "skills" && styles.tabTextActive]}>
            Kỹ năng
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === "certificates" ? (
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
              const isVerified = cert.status === "verified";
              const isPending = cert.status === "pending";
              const isRejected = cert.status === "rejected";

              return (
                <View
                  key={cert.id}
                  style={[
                    styles.certCard,
                    isVerified && styles.certVerified,
                    isPending && styles.certPending,
                    isRejected && styles.certRejected,
                  ]}
                >
                  <View style={styles.certHeader}>
                    <View style={styles.certIcon}>
                      <MaterialCommunityIcons 
                        name={isVerified ? "certificate" : "alert-circle"} 
                        size={36} 
                        color={isVerified ? "#4CAF50" : "#FF9800"} 
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

                  {isVerified && (
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusVerified}>
                        <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" /> Đã xác minh
                      </Text>
                    </View>
                  )}

                  {isPending && (
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusPending}>
                        <MaterialCommunityIcons name="clock-outline" size={16} color="#FF9800" /> Đang chờ duyệt
                      </Text>
                    </View>
                  )}

                  {isRejected && (
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

                  <View style={styles.certActions}>
                    <TouchableOpacity style={styles.btnView}>
                      <Text style={styles.btnViewText}>Xem ảnh</Text>
                    </TouchableOpacity>
                    {isRejected && (
                      <TouchableOpacity style={styles.btnDelete}>
                        <Text style={styles.btnDeleteText}>Xóa</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                <MaterialCommunityIcons name="star-circle" size={22} color="#333" /> Chọn kỹ năng của bạn
              </Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => setSkillModalVisible(true)}
              >
                <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.selectedBanner}>
              <Text style={styles.selectedText}>
                <MaterialCommunityIcons name="check-circle" size={18} color="#1976D2" /> Đã chọn {skills.filter(s => s.selected).length} kỹ năng
              </Text>
              <Text style={styles.selectedList}>
                {skills.filter(s => s.selected).map(s => s.name).join(", ")}
              </Text>
            </View>

            <TouchableOpacity style={styles.saveSkillBtn}>
              <Text style={styles.saveSkillText}>Lưu kỹ năng</Text>
            </TouchableOpacity>

            <View style={styles.skillsGrid}>
              {skills.map((skill) => (
                <TouchableOpacity
                  key={skill.id}
                  style={[styles.skillCard, skill.selected && styles.skillSelected]}
                  onPress={() => toggleSkill(skill.id)}
                  onLongPress={() => handleDeleteSkill(skill.id, skill.name)}
                  delayLongPress={500}
                >
                  <View style={styles.skillIcon}>
                    <MaterialCommunityIcons 
                      name={skill.icon as any} 
                      size={32} 
                      color={skill.selected ? "#2196F3" : "#757575"} 
                    />
                  </View>
                  <Text style={[styles.skillName, skill.selected && styles.skillNameSelected]}>
                    {skill.name}
                  </Text>
                  <Text style={[styles.skillDesc, skill.selected && styles.skillDescSelected]}>
                    {skill.description}
                  </Text>
                  {skill.selected && (
                    <View style={styles.checkMark}>
                      <MaterialCommunityIcons name="check" size={16} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
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

              {/* Tên chứng chỉ */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Tên chứng chỉ <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  placeholder="VD: Chứng chỉ Điều dưỡng viên"
                  value={form.name}
                  onChangeText={(t) => {
                    setForm({ ...form, name: t });
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  style={[styles.input, errors.name && styles.inputError]}
                />
                {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
              </View>

              {/* Tổ chức cấp */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Tổ chức cấp <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  placeholder="VD: Bộ Y tế, Trường Y Hà Nội"
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
                  Ngày cấp <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  placeholder="10/20/2023"
                  value={form.issueDate}
                  onChangeText={(t) => {
                    setForm({ ...form, issueDate: t });
                    if (errors.issueDate) setErrors({ ...errors, issueDate: "" });
                  }}
                  style={[styles.input, errors.issueDate && styles.inputError]}
                />
                {errors.issueDate ? <Text style={styles.errorText}>{errors.issueDate}</Text> : null}
              </View>

              {/* Ngày hết hạn */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Ngày hết hạn <Text style={styles.optional}>(nếu có)</Text>
                </Text>
                <TextInput
                  placeholder="mm/dd/yyyy"
                  value={form.expiryDate}
                  onChangeText={(t) => {
                    setForm({ ...form, expiryDate: t });
                    if (errors.expiryDate) setErrors({ ...errors, expiryDate: "" });
                  }}
                  style={[styles.input, errors.expiryDate && styles.inputError]}
                />
                {errors.expiryDate ? <Text style={styles.errorText}>{errors.expiryDate}</Text> : null}
              </View>

              {/* Số chứng chỉ */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Số chứng chỉ <Text style={styles.optional}>(nếu có)</Text>
                </Text>
                <TextInput
                  placeholder="VD: CC-2023-12345"
                  value={form.certificateNumber}
                  onChangeText={(t) => setForm({ ...form, certificateNumber: t })}
                  style={styles.input}
                  maxLength={50}
                />
              </View>

              {/* Hình ảnh chứng chỉ */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Hình ảnh chứng chỉ <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity 
                  style={styles.uploadBox} 
                  onPress={handlePickImage}
                >
                  <MaterialCommunityIcons name="file-document" size={48} color="#CCC" />
                  <Text style={styles.uploadTitle}>Tải lên hình ảnh chứng chỉ</Text>
                  <Text style={styles.uploadSubtitle}>PDF, JPG, PNG - Tối đa 5MB</Text>
                  <View style={styles.uploadButton}>
                    <MaterialCommunityIcons name="folder" size={18} color="#FFF" />
                    <Text style={styles.uploadButtonText}>Chọn file</Text>
                  </View>
                </TouchableOpacity>
                {form.image && (
                  <View style={styles.filePreview}>
                    <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
                    <Text style={styles.fileName}>{form.image.name}</Text>
                  </View>
                )}
                {errors.image ? <Text style={styles.errorText}>{errors.image}</Text> : null}
                
                <View style={styles.warningBox}>
                  <Text style={styles.warningText}>
                    Meo: Chụp ảnh rõ ràng, đầy đủ 4 góc để tăng tỷ lệ duyệt
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <TouchableOpacity style={styles.submitBtn} onPress={handleAdd}>
                <MaterialCommunityIcons name="check" size={20} color="#FFF" />
                <Text style={styles.submitBtnText}>Gửi chứng chỉ để xác minh</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setModalVisible(false);
                  setErrors({
                    name: "",
                    organization: "",
                    issueDate: "",
                    expiryDate: "",
                    image: "",
                  });
                }}
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

      {/* Modal thêm kỹ năng */}
      <Modal visible={skillModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.skillModalContent}>
            {/* Header */}
            <View style={styles.skillModalHeader}>
              <MaterialCommunityIcons name="plus-circle" size={24} color="#2196F3" />
              <Text style={styles.skillModalTitle}>Thêm kỹ năng mới</Text>
              <TouchableOpacity onPress={() => setSkillModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Tên kỹ năng */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Tên kỹ năng <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  placeholder="VD: Trị liệu âm nhạc"
                  value={skillForm.name}
                  onChangeText={(text) => {
                    setSkillForm({ ...skillForm, name: text });
                    if (skillError) setSkillError("");
                  }}
                  style={[styles.input, skillError && styles.inputError]}
                  maxLength={50}
                />
                {skillError ? <Text style={styles.errorText}>{skillError}</Text> : null}
              </View>

              {/* Mô tả ngắn */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mô tả ngắn</Text>
                <TextInput
                  placeholder="VD: Sử dụng âm nhạc để cải thiện tâm trạng"
                  value={skillForm.description}
                  onChangeText={(text) => setSkillForm({ ...skillForm, description: text })}
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={3}
                  maxLength={100}
                />
              </View>

              {/* Chọn biểu tượng */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Chọn biểu tượng <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.iconGrid}>
                  {availableIcons.map((icon, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.iconOption,
                        skillForm.icon === icon && styles.iconOptionSelected
                      ]}
                      onPress={() => setSkillForm({ ...skillForm, icon })}
                    >
                      <MaterialCommunityIcons 
                        name={icon as any} 
                        size={28} 
                        color={skillForm.icon === icon ? "#2196F3" : "#757575"} 
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Preview */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Xem trước</Text>
                <View style={styles.skillPreview}>
                  <View style={styles.skillPreviewIcon}>
                    <MaterialCommunityIcons 
                      name={skillForm.icon as any} 
                      size={36} 
                      color="#2196F3" 
                    />
                  </View>
                  <Text style={styles.skillPreviewName}>
                    {skillForm.name || "Tên kỹ năng"}
                  </Text>
                  <Text style={styles.skillPreviewDesc}>
                    {skillForm.description || "Mô tả ngắn"}
                  </Text>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitSkillBtn}
                onPress={handleAddSkill}
              >
                <MaterialCommunityIcons name="check" size={20} color="#FFF" />
                <Text style={styles.submitSkillBtnText}>Thêm kỹ năng</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <CaregiverBottomNav activeTab="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "transparent",
  },
  tabActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFA726",
    borderWidth: 3,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#999999",
  },
  tabTextActive: {
    color: "#6B4CE6",
  },
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
  btnDeleteText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 14,
  },
  // Skills Styles
  selectedBanner: {
    backgroundColor: "#E3F2FD",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  selectedText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1976D2",
    marginBottom: 4,
  },
  selectedList: {
    fontSize: 14,
    color: "#42A5F5",
  },
  saveSkillBtn: {
    backgroundColor: "#2196F3",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  saveSkillText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  skillCard: {
    width: "48%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    position: "relative",
  },
  skillSelected: {
    backgroundColor: "#E3F2FD",
    borderColor: "#2196F3",
  },
  skillIcon: {
    width: 50,
    height: 50,
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  skillIconText: {
    fontSize: 28,
  },
  skillName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 4,
  },
  skillNameSelected: {
    color: "#1976D2",
  },
  skillDesc: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  skillDescSelected: {
    color: "#42A5F5",
  },
  checkMark: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
  },
  checkMarkText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
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
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#F9F9F9",
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
  uploadBox: {
    borderWidth: 2,
    borderColor: "#DDD",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 12,
  },
  uploadSubtitle: {
    fontSize: 13,
    color: "#999",
    marginTop: 4,
    marginBottom: 16,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 6,
  },
  uploadButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
  filePreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  fileName: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
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
  // Add Skill Button Styles
  addSkillButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E3F2FD",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: "#2196F3",
    borderStyle: "dashed",
  },
  addSkillButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2196F3",
  },
  // Skill Modal Styles
  skillModalContent: {
    backgroundColor: "#FFF",
    marginTop: 80,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "90%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  skillModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  skillModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    flex: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  iconOption: {
    width: 56,
    height: 56,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  iconOptionSelected: {
    backgroundColor: "#E3F2FD",
    borderColor: "#2196F3",
    borderWidth: 3,
  },
  iconOptionText: {
    fontSize: 28,
  },
  skillPreview: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  skillPreviewIcon: {
    width: 64,
    height: 64,
    backgroundColor: "#FFF",
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  skillPreviewIconText: {
    fontSize: 32,
  },
  skillPreviewName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
    textAlign: "center",
  },
  skillPreviewDesc: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
  },
  submitSkillBtn: {
    flexDirection: "row",
    backgroundColor: "#2196F3",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    gap: 8,
  },
  submitSkillBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
