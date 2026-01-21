import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { getAppointmentComplaint, getAppointmentHasComplained, getHasComplaintFeedback, markAppointmentAsComplained } from "@/data/appointmentStore";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  Image,
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

const complaintTypes = [
  { id: "behavior", label: "Thái độ không phù hợp", icon: "emoticon-angry" },
  { id: "quality", label: "Chất lượng dịch vụ kém", icon: "star-off" },
  { id: "unprofessional", label: "Thiếu chuyên nghiệp", icon: "account-alert" },
  { id: "late", label: "Đến trễ/Bỏ ca", icon: "clock-alert" },
  { id: "health", label: "Vấn đề sức khỏe người già", icon: "medical-bag" },
  { id: "payment", label: "Vấn đề thanh toán", icon: "cash" },
  { id: "other", label: "Khác", icon: "help-circle" },
];

export default function ComplaintScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as {
    bookingId?: string;
    elderlyName?: string;
    date?: string;
    time?: string;
    packageName?: string;
    viewMode?: boolean;
    fromScreen?: string;
  } | undefined;

  // Use params if available, otherwise use mock data
  const appointmentInfo = {
    id: params?.bookingId || "APT001",
    elderName: params?.elderlyName || "Bà Nguyễn Thị Lan",
    date: params?.date || "2024-01-15",
    timeSlot: params?.time || "08:00 - 12:00",
    packageName: params?.packageName || "Gói chăm sóc cơ bản",
  };

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<"low" | "medium" | "high">("medium");
  const [uploadedFiles, setUploadedFiles] = useState<{ uri: string; type: string; name: string; size?: number }[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<{
    selectedTypes: string[];
    description: string;
    urgency: "low" | "medium" | "high";
    uploadedFiles: { uri: string; type: string; name: string; size?: number }[];
    submittedAt: string;
    status?: "pending" | "reviewing" | "need_more_info" | "resolved" | "refunded" | "rejected";
  } | null>(null);
  const [viewMode, setViewMode] = useState(params?.viewMode || false);
  const [hasComplaintFeedback, setHasComplaintFeedback] = useState(
    appointmentInfo.id ? getHasComplaintFeedback(appointmentInfo.id) : false
  );
  const [showFilePickerModal, setShowFilePickerModal] = useState(false);
  
  // Sync complaint feedback status when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      if (appointmentInfo.id) {
        const hasFeedback = getHasComplaintFeedback(appointmentInfo.id);
        setHasComplaintFeedback(hasFeedback);
      }
    }, [appointmentInfo.id])
  );

  // Nếu có viewMode từ params và có complaint data, load complaint data
  React.useEffect(() => {
    if (params?.viewMode && appointmentInfo.id) {
      const hasComplained = getAppointmentHasComplained(appointmentInfo.id);
      if (hasComplained) {
        const complaintData = getAppointmentComplaint(appointmentInfo.id);
        if (complaintData) {
          setSubmittedComplaint(complaintData);
          setIsSubmitted(true);
          setViewMode(true);
        }
      }
    }
  }, [params?.viewMode, appointmentInfo.id]);

  const toggleComplaintType = (typeId: string) => {
    if (selectedTypes.includes(typeId)) {
      setSelectedTypes(selectedTypes.filter((id) => id !== typeId));
    } else {
      setSelectedTypes([...selectedTypes, typeId]);
    }
  };

  const handlePickDocument = async () => {
    setShowFilePickerModal(true);
  };

  const requestMediaLibraryPermission = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Quyền truy cập",
          "Cần quyền truy cập thư viện để chọn ảnh/video."
        );
        return false;
      }
    }
    return true;
  };

  const requestCameraPermission = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Quyền truy cập",
          "Cần quyền truy cập camera để chụp ảnh."
        );
        return false;
      }
    }
    return true;
  };

  const handlePickImageOrVideo = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const newFiles = result.assets
          .filter((asset) => {
            const fileSizeInMB = (asset.fileSize || 0) / (1024 * 1024);
            if (fileSizeInMB > 10) {
              Alert.alert(
                "File quá lớn",
                `File ${asset.fileName || "không tên"} vượt quá 10MB. Vui lòng chọn file nhỏ hơn.`
              );
              return false;
            }
            return true;
          })
          .map((asset) => ({
            uri: asset.uri,
            type: asset.type || "image",
            name: asset.fileName || `file_${Date.now()}.${asset.type === "video" ? "mp4" : "jpg"}`,
            size: asset.fileSize,
          }));

        setUploadedFiles((prev) => [...prev, ...newFiles]);
      }
    } catch (error) {
      console.error("Error picking image/video:", error);
      Alert.alert("Lỗi", "Không thể chọn file. Vui lòng thử lại.");
    }
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fileSizeInMB = (asset.fileSize || 0) / (1024 * 1024);
        
        if (fileSizeInMB > 10) {
          Alert.alert("File quá lớn", "File vượt quá 10MB. Vui lòng chụp lại.");
          return;
        }

        const newFile = {
          uri: asset.uri,
          type: "image",
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          size: asset.fileSize,
        };

        setUploadedFiles((prev) => [...prev, newFile]);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Lỗi", "Không thể chụp ảnh. Vui lòng thử lại.");
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const handleSubmit = () => {
    if (selectedTypes.length === 0) {
      Alert.alert("Lỗi", "Vui lòng chọn ít nhất một loại khiếu nại");
      return;
    }

    if (description.trim().length < 20) {
      Alert.alert("Lỗi", "Vui lòng mô tả chi tiết ít nhất 20 ký tự");
      return;
    }

    Alert.alert(
      "Xác nhận gửi khiếu nại",
      "Khiếu nại của bạn sẽ được gửi đến bộ phận hỗ trợ. Bạn có chắc chắn muốn tiếp tục?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Gửi",
          style: "destructive",
          onPress: () => {
            // TODO: Call API to submit complaint with uploadedFiles
            console.log("Complaint data:", {
              appointmentInfo,
              selectedTypes,
              description,
              urgency,
              uploadedFiles,
            });
            
            // Lưu thông tin khiếu nại đã gửi
            // Nếu đang sửa lại khiếu nại (có submittedComplaint và status là need_more_info), đổi về reviewing
            // Nếu là khiếu nại mới, status mặc định là reviewing
            const newStatus: "reviewing" = "reviewing";
            
            const complaintData = {
              selectedTypes,
              description,
              urgency,
              uploadedFiles,
              submittedAt: submittedComplaint?.submittedAt || new Date().toISOString(), // Giữ nguyên thời gian gửi ban đầu nếu đang sửa
              status: newStatus,
            };
            setSubmittedComplaint(complaintData);
            setIsSubmitted(true);
            // Đánh dấu appointment đã khiếu nại
            if (appointmentInfo.id) {
              markAppointmentAsComplained(appointmentInfo.id, complaintData);
            }
            // Không tự động chuyển sang view mode, để user có thể thấy nút "Xem khiếu nại"
            // setViewMode(true);
            
            Alert.alert(
              "Đã gửi khiếu nại",
              "Khiếu nại của bạn đã được ghi nhận. Chúng tôi sẽ xem xét và phản hồi trong vòng 24-48 giờ.",
              [
                {
                  text: "OK",
                  onPress: () => {},
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleViewComplaint = () => {
    setViewMode(true);
  };

  const handleBack = () => {
    if (params?.fromScreen) {
      switch (params.fromScreen) {
        case "booking":
          navigation.navigate("Yêu cầu dịch vụ");
          break;
        case "appointment-detail":
          // Navigate về appointment detail với appointmentId
          if (appointmentInfo.id) {
            navigation.navigate("Appointment Detail", { 
              appointmentId: appointmentInfo.id,
              fromScreen: "complaint" 
            });
          } else {
            navigation.goBack();
          }
          break;
        case "complaint-feedback":
          // Đã ở trang complaint rồi, không cần làm gì
          navigation.goBack();
          break;
        default:
          navigation.goBack();
      }
    } else {
      navigation.goBack();
    }
  };

  const handleCancelComplaint = () => {
    Alert.alert(
      "Hủy khiếu nại",
      "Bạn có chắc chắn muốn hủy khiếu nại này?",
      [
        { text: "Không", style: "cancel" },
        {
          text: "Hủy khiếu nại",
          style: "destructive",
          onPress: () => {
            // Xóa khiếu nại khỏi store
            if (appointmentInfo.id) {
              // TODO: Call API to cancel complaint
              // Tạm thời chỉ xóa khỏi local state
              setIsSubmitted(false);
              setSubmittedComplaint(null);
              setSelectedTypes([]);
              setDescription("");
              setUploadedFiles([]);
              setViewMode(false);
              // Có thể cần thêm hàm để xóa khỏi store
              Alert.alert("Thành công", "Đã hủy khiếu nại");
            }
          },
        },
      ]
    );
  };

  const handleEditComplaint = () => {
    // Chuyển sang chế độ chỉnh sửa
    setViewMode(false);
    setIsSubmitted(false); // Cho phép chỉnh sửa lại form
    // Form đã có sẵn dữ liệu từ submittedComplaint
    if (submittedComplaint) {
      setSelectedTypes(submittedComplaint.selectedTypes);
      setDescription(submittedComplaint.description);
      setUrgency(submittedComplaint.urgency);
      setUploadedFiles(submittedComplaint.uploadedFiles);
    }
  };

  const handleRateComplaint = () => {
    if (hasComplaintFeedback) {
      // Đã đánh giá rồi - Xem đánh giá (navigate với viewMode)
      navigation.navigate("Complaint Feedback", {
        appointmentId: appointmentInfo.id,
        complaintId: appointmentInfo.id,
        fromScreen: "complaint",
        viewMode: true,
      });
    } else {
      // Chưa đánh giá - Đánh giá mới
      navigation.navigate("Complaint Feedback", {
        appointmentId: appointmentInfo.id,
        complaintId: appointmentInfo.id,
        fromScreen: "complaint",
      });
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "low":
        return "#10B981";
      case "medium":
        return "#F59E0B";
      case "high":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getUrgencyText = (level: string) => {
    switch (level) {
      case "low":
        return "Thấp";
      case "medium":
        return "Trung bình";
      case "high":
        return "Cao";
      default:
        return "";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const getComplaintStatusText = (status?: string) => {
    switch (status) {
      case "pending":
        return "Đang chờ";
      case "reviewing":
        return "Đang xem xét";
      case "need_more_info":
        return "Chờ bổ sung";
      case "resolved":
        return "Đã giải quyết";
      case "refunded":
        return "Đã hoàn tiền";
      case "rejected":
        return "Từ chối";
      default:
        return "Đang xem xét";
    }
  };

  const getComplaintStatusColor = (status?: string) => {
    switch (status) {
      case "pending":
        return "#6B7280"; // Gray
      case "reviewing":
        return "#3B82F6"; // Blue
      case "need_more_info":
        return "#F59E0B"; // Orange
      case "resolved":
        return "#10B981"; // Green
      case "refunded":
        return "#10B981"; // Green
      case "rejected":
        return "#EF4444"; // Red
      default:
        return "#3B82F6"; // Blue
    }
  };

  const getComplaintStatusBgColor = (status?: string) => {
    switch (status) {
      case "pending":
        return "#F3F4F6"; // Light gray
      case "reviewing":
        return "#DBEAFE"; // Light blue
      case "need_more_info":
        return "#FEF3C7"; // Light orange
      case "resolved":
        return "#D1FAE5"; // Light green
      case "refunded":
        return "#D1FAE5"; // Light green
      case "rejected":
        return "#FEE2E2"; // Light red
      default:
        return "#DBEAFE"; // Light blue
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Khiếu nại dịch vụ</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {viewMode && submittedComplaint ? (
          /* View Mode - Hiển thị khiếu nại đã gửi */
          <>
            {/* Success Banner */}
            <View style={styles.successBanner}>
              <MaterialCommunityIcons name="check-circle" size={24} color="#10B981" />
              <View style={styles.successContent}>
                <Text style={styles.successTitle}>Đã gửi khiếu nại</Text>
                <Text style={styles.successText}>
                  Khiếu nại của bạn đã được ghi nhận. Chúng tôi sẽ xem xét và phản hồi trong vòng 24-48 giờ.
                </Text>
              </View>
            </View>

            {/* Status Badge */}
            <View style={styles.section}>
              <View style={[
                styles.statusBadge,
                {
                  backgroundColor: getComplaintStatusBgColor(submittedComplaint.status),
                  borderColor: getComplaintStatusColor(submittedComplaint.status),
                }
              ]}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: getComplaintStatusColor(submittedComplaint.status) }
                ]} />
                <Text style={[
                  styles.statusText,
                  { color: getComplaintStatusColor(submittedComplaint.status) }
                ]}>
                  {getComplaintStatusText(submittedComplaint.status)}
                </Text>
              </View>
            </View>

            {/* Appointment Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin lịch hẹn</Text>
              <View style={styles.appointmentCard}>
                <View style={styles.appointmentDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="document-text" size={16} color="#6B7280" />
                    <Text style={styles.detailText}>Mã: #{appointmentInfo.id}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="person" size={16} color="#6B7280" />
                    <Text style={styles.detailText}>Người cao tuổi: {appointmentInfo.elderName}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar" size={16} color="#6B7280" />
                    <Text style={styles.detailText}>Ngày: {appointmentInfo.date}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="time" size={16} color="#6B7280" />
                    <Text style={styles.detailText}>Giờ: {appointmentInfo.timeSlot}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="package-variant" size={16} color="#6B7280" />
                    <Text style={styles.detailText}>Gói dịch vụ: {appointmentInfo.packageName}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Submitted Complaint Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin khiếu nại</Text>
              
              {/* Urgency Level */}
              <View style={styles.section}>
                <Text style={styles.sectionSubtitle}>Mức độ khẩn cấp</Text>
                <View style={styles.urgencyContainer}>
                  <View
                    style={[
                      styles.urgencyButton,
                      {
                        backgroundColor: getUrgencyColor(submittedComplaint.urgency),
                        borderColor: getUrgencyColor(submittedComplaint.urgency),
                      },
                    ]}
                  >
                    <Text style={styles.urgencyTextActive}>
                      {getUrgencyText(submittedComplaint.urgency)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Complaint Types */}
              <View style={styles.section}>
                <Text style={styles.sectionSubtitle}>Loại khiếu nại</Text>
                <View style={styles.typesGrid}>
                  {submittedComplaint.selectedTypes.map((typeId) => {
                    const type = complaintTypes.find((t) => t.id === typeId);
                    return (
                      <View key={typeId} style={[styles.typeCard, styles.typeCardActive]}>
                        <MaterialCommunityIcons
                          name={type?.icon as any}
                          size={24}
                          color="#10B981"
                        />
                        <Text style={[styles.typeLabel, styles.typeLabelActive]}>
                          {type?.label || typeId}
                        </Text>
                        <View style={styles.checkmark}>
                          <Ionicons name="checkmark" size={16} color="#fff" />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Description */}
              <View style={styles.section}>
                <Text style={styles.sectionSubtitle}>Mô tả chi tiết</Text>
                <View style={[styles.textArea, styles.textAreaReadOnly]}>
                  <Text style={styles.descriptionText}>{submittedComplaint.description}</Text>
                </View>
              </View>

              {/* Evidence */}
              {submittedComplaint.uploadedFiles.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionSubtitle}>Tài liệu đính kèm</Text>
                  <View style={styles.uploadedFilesContainer}>
                    {submittedComplaint.uploadedFiles.map((file, index) => (
                      <View key={index} style={styles.fileItem}>
                        {file.type === "image" ? (
                          <Image source={{ uri: file.uri }} style={styles.filePreview} />
                        ) : (
                          <View style={styles.videoPreview}>
                            <Ionicons name="videocam" size={32} color="#6B7280" />
                          </View>
                        )}
                        <View style={styles.fileInfo}>
                          <Text style={styles.fileName} numberOfLines={1}>
                            {file.name}
                          </Text>
                          {file.size && (
                            <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Submitted Date */}
              <View style={styles.section}>
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>
                    Thời gian gửi: {formatDate(submittedComplaint.submittedAt)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Guidelines */}
            <View style={styles.guidelinesCard}>
              <MaterialCommunityIcons name="information" size={20} color="#2563EB" />
              <View style={styles.guidelinesContent}>
                <Text style={styles.guidelinesTitle}>Quy trình xử lý</Text>
                <Text style={styles.guidelinesText}>
                  • Khiếu nại sẽ được xem xét trong vòng 24-48 giờ{"\n"}
                  • Bạn sẽ nhận được thông báo qua email và ứng dụng{"\n"}
                  • Chúng tôi có thể liên hệ để xác minh thông tin{"\n"}
                  • Kết quả xử lý sẽ được thông báo qua hệ thống
                </Text>
              </View>
            </View>

            <View style={{ height: 100 }} />
          </>
        ) : (
          /* Form Mode - Hiển thị form khiếu nại */
          <>
            {/* Warning Banner */}
            <View style={styles.warningBanner}>
              <MaterialCommunityIcons name="alert-circle" size={24} color="#DC2626" />
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>Lưu ý quan trọng</Text>
                <Text style={styles.warningText}>
                  Khiếu nại sẽ được xem xét kỹ lưỡng. Vui lòng cung cấp thông tin chính xác và chi tiết.
                </Text>
              </View>
            </View>

            {/* Status Badge - Hiển thị khi đã submit */}
            {isSubmitted && submittedComplaint && (
              <View style={styles.section}>
                <View style={[
                  styles.statusBadge,
                  {
                    backgroundColor: getComplaintStatusBgColor(submittedComplaint.status),
                    borderColor: getComplaintStatusColor(submittedComplaint.status),
                  }
                ]}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: getComplaintStatusColor(submittedComplaint.status) }
                  ]} />
                  <Text style={[
                    styles.statusText,
                    { color: getComplaintStatusColor(submittedComplaint.status) }
                  ]}>
                    {getComplaintStatusText(submittedComplaint.status)}
                  </Text>
                </View>
              </View>
            )}

        {/* Appointment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin lịch hẹn</Text>
          <View style={styles.appointmentCard}>
            <View style={styles.appointmentDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="document-text" size={16} color="#6B7280" />
                <Text style={styles.detailText}>Mã: #{appointmentInfo.id}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="person" size={16} color="#6B7280" />
                <Text style={styles.detailText}>Người cao tuổi: {appointmentInfo.elderName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="calendar" size={16} color="#6B7280" />
                <Text style={styles.detailText}>Ngày: {appointmentInfo.date}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="time" size={16} color="#6B7280" />
                <Text style={styles.detailText}>Giờ: {appointmentInfo.timeSlot}</Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="package-variant" size={16} color="#6B7280" />
                <Text style={styles.detailText}>Gói dịch vụ: {appointmentInfo.packageName}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Urgency Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mức độ khẩn cấp</Text>
          <View style={styles.urgencyContainer}>
            {["low", "medium", "high"].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.urgencyButton,
                  urgency === level && {
                    backgroundColor: getUrgencyColor(level),
                    borderColor: getUrgencyColor(level),
                  },
                  isSubmitted && !viewMode && styles.disabledButton,
                ]}
                onPress={() => !isSubmitted && setUrgency(level as any)}
                disabled={isSubmitted && !viewMode}
              >
                <Text
                  style={[
                    styles.urgencyText,
                    urgency === level && styles.urgencyTextActive,
                  ]}
                >
                  {getUrgencyText(level)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Complaint Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loại khiếu nại *</Text>
          <Text style={styles.sectionSubtitle}>Chọn một hoặc nhiều loại</Text>
          <View style={styles.typesGrid}>
            {complaintTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeCard,
                  selectedTypes.includes(type.id) && styles.typeCardActive,
                  isSubmitted && !viewMode && styles.disabledButton,
                ]}
                onPress={() => !isSubmitted && toggleComplaintType(type.id)}
                disabled={isSubmitted && !viewMode}
              >
                <MaterialCommunityIcons
                  name={type.icon as any}
                  size={24}
                  color={selectedTypes.includes(type.id) ? "#10B981" : "#6B7280"}
                />
                <Text
                  style={[
                    styles.typeLabel,
                    selectedTypes.includes(type.id) && styles.typeLabelActive,
                  ]}
                >
                  {type.label}
                </Text>
                {selectedTypes.includes(type.id) && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả chi tiết *</Text>
          <Text style={styles.sectionSubtitle}>
            Vui lòng mô tả chi tiết vấn đề (tối thiểu 20 ký tự)
          </Text>
          <TextInput
            style={[
              styles.textArea,
              isSubmitted && !viewMode && styles.textAreaReadOnly,
            ]}
            placeholder="Nhập mô tả chi tiết về vấn đề bạn gặp phải..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
            maxLength={1000}
            editable={!isSubmitted || viewMode}
          />
          <Text style={styles.charCount}>{description.length}/1000 ký tự</Text>
        </View>

        {/* Evidence (Optional) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài liệu đính kèm (Tùy chọn)</Text>
          <Text style={styles.sectionSubtitle}>
            Ảnh, video hoặc file ghi âm minh chứng
          </Text>
          <TouchableOpacity
            style={[
              styles.uploadButton,
              isSubmitted && !viewMode && styles.disabledButton,
            ]}
            onPress={handlePickDocument}
            disabled={isSubmitted && !viewMode}
          >
            <Ionicons name="cloud-upload" size={24} color="#6B7280" />
            <Text style={styles.uploadText}>Tải lên tài liệu</Text>
            <Text style={styles.uploadSubtext}>PNG, JPG, MP4 (Max 10MB)</Text>
          </TouchableOpacity>

          {/* Display uploaded files */}
          {uploadedFiles.length > 0 && (
            <View style={styles.uploadedFilesContainer}>
              {uploadedFiles.map((file, index) => (
                <View key={index} style={styles.fileItem}>
                  {file.type === "image" ? (
                    <Image source={{ uri: file.uri }} style={styles.filePreview} />
                  ) : (
                    <View style={styles.videoPreview}>
                      <Ionicons name="videocam" size={32} color="#6B7280" />
                    </View>
                  )}
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName} numberOfLines={1}>
                      {file.name}
                    </Text>
                    {file.size && (
                      <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveFile(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

            {/* Guidelines */}
            <View style={styles.guidelinesCard}>
              <MaterialCommunityIcons name="information" size={20} color="#2563EB" />
              <View style={styles.guidelinesContent}>
                <Text style={styles.guidelinesTitle}>Quy trình xử lý</Text>
                <Text style={styles.guidelinesText}>
                  • Khiếu nại sẽ được xem xét trong vòng 24-48 giờ{"\n"}
                  • Bạn sẽ nhận được thông báo qua email và ứng dụng{"\n"}
                  • Chúng tôi có thể liên hệ để xác minh thông tin{"\n"}
                  • Kết quả xử lý sẽ được thông báo qua hệ thống
                </Text>
              </View>
            </View>

            <View style={{ height: 100 }} />
          </>
        )}
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        {isSubmitted && viewMode ? (
          /* Nút khi đã gửi và đang xem - Thay đổi theo trạng thái */
          (() => {
            const status = submittedComplaint?.status;
            let buttonText = "Đánh giá khiếu nại";
            let buttonIcon: "star-outline" | "close-circle-outline" | "create-outline" | "eye-outline" = "star-outline";
            let buttonColor = "#2563EB";
            let onPressHandler = handleRateComplaint;

            if (status === "pending" || status === "reviewing") {
              // Đang chờ duyệt hoặc đang xem xét -> Hủy khiếu nại
              buttonText = "Hủy khiếu nại";
              buttonIcon = "close-circle-outline";
              buttonColor = "#EF4444";
              onPressHandler = handleCancelComplaint;
            } else if (status === "need_more_info") {
              // Chờ bổ sung -> Sửa khiếu nại
              buttonText = "Sửa khiếu nại";
              buttonIcon = "create-outline";
              buttonColor = "#F59E0B";
              onPressHandler = handleEditComplaint;
            } else if (hasComplaintFeedback) {
              // Đã đánh giá -> Xem đánh giá
              buttonText = "Xem đánh giá";
              buttonIcon = "eye-outline";
              buttonColor = "#2563EB";
              onPressHandler = handleRateComplaint;
            } else {
              // Chưa đánh giá -> Đánh giá khiếu nại
              buttonText = "Đánh giá khiếu nại";
              buttonIcon = "star-outline";
              buttonColor = "#2563EB";
              onPressHandler = handleRateComplaint;
            }

            return (
              <TouchableOpacity
                style={[styles.submitButton, { flex: 1, backgroundColor: buttonColor }]}
                onPress={onPressHandler}
              >
                <Ionicons name={buttonIcon} size={20} color="#fff" />
                <Text style={styles.submitButtonText}>{buttonText}</Text>
              </TouchableOpacity>
            );
          })()
        ) : isSubmitted && !viewMode ? (
          /* Nút khi đã gửi nhưng đang ở form - Xem khiếu nại */
          <>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleBack}
            >
              <Text style={styles.cancelButtonText}>Quay lại</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: "#2563EB" }]}
              onPress={handleViewComplaint}
            >
              <MaterialCommunityIcons name="eye" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Xem khiếu nại</Text>
            </TouchableOpacity>
          </>
        ) : (
          /* Nút khi chưa gửi - Gửi khiếu nại */
          <>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleBack}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <MaterialCommunityIcons name="send" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Gửi khiếu nại</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Bottom Navigation */}
      <CaregiverBottomNav activeTab="jobs" />

      {/* Custom File Picker Modal */}
      <Modal
        transparent
        visible={showFilePickerModal}
        animationType="fade"
        onRequestClose={() => setShowFilePickerModal(false)}
      >
        <TouchableOpacity 
          style={styles.filePickerOverlay}
          activeOpacity={1}
          onPress={() => setShowFilePickerModal(false)}
        >
          <View style={styles.filePickerContainer}>
            <View style={styles.filePickerHeader}>
              <Text style={styles.filePickerTitle}>Chọn tài liệu</Text>
              <Text style={styles.filePickerSubtitle}>Bạn muốn chọn loại tài liệu nào?</Text>
            </View>
            
            <View style={styles.filePickerOptions}>
              <TouchableOpacity
                style={styles.filePickerOption}
                onPress={() => {
                  setShowFilePickerModal(false);
                  handlePickImageOrVideo();
                }}
              >
                <View style={[styles.filePickerIconContainer, { backgroundColor: "#DBEAFE" }]}>
                  <Ionicons name="images" size={28} color="#2563EB" />
                </View>
                <Text style={styles.filePickerOptionText}>Ảnh/Video</Text>
                <Text style={styles.filePickerOptionDesc}>Chọn từ thư viện</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.filePickerOption}
                onPress={() => {
                  setShowFilePickerModal(false);
                  handleTakePhoto();
                }}
              >
                <View style={[styles.filePickerIconContainer, { backgroundColor: "#DBEAFE" }]}>
                  <Ionicons name="camera" size={28} color="#2563EB" />
                </View>
                <Text style={styles.filePickerOptionText}>Chụp ảnh</Text>
                <Text style={styles.filePickerOptionDesc}>Mở camera</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.filePickerCancelButton}
              onPress={() => setShowFilePickerModal(false)}
            >
              <Text style={styles.filePickerCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    backgroundColor: "#68C2E8",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  warningBanner: {
    flexDirection: "row",
    backgroundColor: "#FEF2F2",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#DC2626",
  },
  warningContent: {
    flex: 1,
    marginLeft: 14,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#DC2626",
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: "#991B1B",
    lineHeight: 18,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 12,
  },
  appointmentCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 3,
  },
  appointmentDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#4B5563",
  },
  urgencyContainer: {
    flexDirection: "row",
    gap: 12,
  },
  urgencyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  urgencyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  urgencyTextActive: {
    color: "#fff",
  },
  typesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  typeCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    alignItems: "center",
    position: "relative",
  },
  typeCardActive: {
    borderColor: "#10B981",
    backgroundColor: "#ECFDF5",
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
  },
  typeLabelActive: {
    color: "#10B981",
  },
  checkmark: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  textArea: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: "#1F2937",
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "right",
    marginTop: 4,
  },
  uploadButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
  },
  uploadText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 8,
  },
  uploadSubtext: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  uploadedFilesContainer: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  filePreview: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  videoPreview: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: "#6B7280",
  },
  removeButton: {
    padding: 4,
  },
  guidelinesCard: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    marginHorizontal: 20,
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#2563EB",
  },
  guidelinesContent: {
    flex: 1,
    marginLeft: 14,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 8,
  },
  guidelinesText: {
    fontSize: 13,
    color: "#1E40AF",
    lineHeight: 20,
  },
  bottomAction: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
    marginBottom: 90, // Để không bị che bởi bottom nav
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  submitButton: {
    flex: 2,
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  successBanner: {
    flexDirection: "row",
    backgroundColor: "#ECFDF5",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  successContent: {
    flex: 1,
    marginLeft: 14,
  },
  successTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10B981",
    marginBottom: 4,
  },
  successText: {
    fontSize: 13,
    color: "#065F46",
    lineHeight: 18,
  },
  textAreaReadOnly: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
  descriptionText: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "700",
  },
  // Custom File Picker Modal Styles
  filePickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  filePickerContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  filePickerHeader: {
    marginBottom: 24,
  },
  filePickerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  filePickerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  filePickerOptions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  filePickerOption: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  filePickerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  filePickerOptionText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  filePickerOptionDesc: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  filePickerCancelButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  filePickerCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
});
