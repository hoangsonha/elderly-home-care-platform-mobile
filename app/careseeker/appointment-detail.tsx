import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SimpleNavBar } from "@/components/navigation/SimpleNavBar";

// Mock data
const appointmentsDataMap: { [key: string]: any } = {
  "1": {
    id: "APT001",
    status: "completed", // pending, confirmed, in-progress, completed, cancelled
    date: "2025-01-25",
    timeSlot: "08:00 - 12:00",
    duration: "4 giờ",
    packageType: "Gói Cơ Bản",
    
    // Caregiver Info
    caregiver: {
      id: "CG001",
      name: "Trần Văn Nam",
      age: 32,
      gender: "Nam",
      avatar: "https://via.placeholder.com/100",
      phone: "0901234567",
      rating: 4.8,
      experience: "5 năm kinh nghiệm",
      specialties: ["Chăm sóc người già", "Y tá"],
    },
    
    // Elderly Info
    elderly: {
      id: "E001",
      name: "Bà Nguyễn Thị Lan",
      age: 75,
      avatar: "https://via.placeholder.com/100",
      address: "123 Lê Lợi, P. Bến Thành, Q.1, TP.HCM",
    },
    
    // Service Details
    services: [
      "Hỗ trợ vệ sinh cá nhân",
      "Chuẩn bị bữa ăn",
      "Uống thuốc theo đơn",
      "Đo huyết áp, đường huyết",
      "Vận động nhẹ",
      "Dọn dẹp phòng ngủ",
    ],
    
    // Payment
    payment: {
      method: "Chuyển khoản",
      amount: 800000,
      status: "paid", // pending, paid
      transactionId: "TXN001234",
    },
    
    // Notes
    notes: [
      {
        id: "N1",
        time: "08:00",
        content: "Điều dưỡng đã đến nơi đúng giờ",
        author: "Hệ thống",
      },
      {
        id: "N2",
        time: "08:30",
        content: "Chỉ số sức khỏe: Huyết áp 130/85, Đường huyết 6.5 mmol/L",
        author: "Nguyễn Thị Mai",
      },
    ],
    
    specialInstructions: "Bà cần theo dõi đường huyết thường xuyên, chế độ ăn nhạt, ít đường.",
  },
  "2": {
    id: "APT002",
    status: "in-progress",
    date: "2025-01-26",
    timeSlot: "14:00 - 18:00",
    duration: "4 giờ",
    packageType: "Gói Tiêu Chuẩn",
    
    caregiver: {
      id: "CG002",
      name: "Nguyễn Thị Mai",
      age: 35,
      gender: "Nữ",
      avatar: "https://via.placeholder.com/100",
      phone: "0909876543",
      rating: 4.5,
      experience: "3 năm kinh nghiệm",
      specialties: ["Chăm sóc người già", "Vật lý trị liệu"],
    },
    
    elderly: {
      id: "E002",
      name: "Ông Trần Văn Minh",
      age: 82,
      avatar: "https://via.placeholder.com/100",
      address: "456 Đường XYZ, Quận 2, TP.HCM",
    },
    
    services: [
      "Hỗ trợ vệ sinh cá nhân",
      "Chuẩn bị bữa ăn",
      "Vận động nhẹ",
      "Trò chuyện, giải trí",
    ],
    
    payment: {
      method: "Quét mã QR",
      amount: 600000,
      status: "paid",
      transactionId: "TXN001235",
    },
    
    notes: [
      {
        id: "N1",
        time: "14:00",
        content: "Bắt đầu ca chăm sóc",
        author: "Hệ thống",
      },
    ],
    
    specialInstructions: "Ông cần hỗ trợ di chuyển, tránh để một mình.",
  },
  "3": {
    id: "APT003",
    status: "confirmed",
    date: "2025-01-27",
    timeSlot: "19:00 - 22:00",
    duration: "3 giờ",
    packageType: "Gói Cơ Bản",
    
    caregiver: {
      id: "CG003",
      name: "Lê Thị Hoa",
      age: 28,
      gender: "Nữ",
      avatar: "https://via.placeholder.com/100",
      phone: "0912345678",
      rating: 4.2,
      experience: "2 năm kinh nghiệm",
      specialties: ["Chăm sóc người già"],
    },
    
    elderly: {
      id: "E003",
      name: "Bà Phạm Thị Mai",
      age: 70,
      avatar: "https://via.placeholder.com/100",
      address: "789 Đường DEF, Quận 3, TP.HCM",
    },
    
    services: [
      "Chuẩn bị bữa tối",
      "Hỗ trợ uống thuốc",
      "Trò chuyện",
    ],
    
    payment: {
      method: "Chuyển khoản",
      amount: 450000,
      status: "pending",
      transactionId: "",
    },
    
    notes: [],
    
    specialInstructions: "Bà thích nghe nhạc trữ tình.",
  },
};

export default function AppointmentDetailScreen() {
  const { id } = useLocalSearchParams();
  const appointmentId = (id as string) || "1";
  const appointmentData = appointmentsDataMap[appointmentId] || appointmentsDataMap["1"];
  
  const [status, setStatus] = useState(appointmentData.status);
  const [notes, setNotes] = useState(appointmentData.notes);
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [ratingDetails, setRatingDetails] = useState({
    professionalism: 0,
    attitude: 0,
    punctuality: 0,
    quality: 0,
  });
  const [reviewErrors, setReviewErrors] = useState({
    rating: false,
    comment: false,
    professionalism: false,
    attitude: false,
    punctuality: false,
    quality: false,
  });

  // Status helpers
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "#F59E0B";
      case "confirmed": return "#3B82F6";
      case "in-progress": return "#10B981";
      case "completed": return "#6B7280";
      case "cancelled": return "#EF4444";
      default: return "#9CA3AF";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Chờ xác nhận";
      case "confirmed": return "Đã xác nhận";
      case "in-progress": return "Đang thực hiện";
      case "completed": return "Hoàn thành";
      case "cancelled": return "Đã hủy";
      default: return "Không xác định";
    }
  };

  // Add note
  const handleAddNote = () => {
    if (!newNoteContent.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập nội dung ghi chú");
      return;
    }

    const newNote = {
      id: `N${notes.length + 1}`,
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      content: newNoteContent,
      author: "Bạn",
    };

    setNotes([...notes, newNote]);
    setNewNoteContent("");
    setIsNoteModalVisible(false);
    Alert.alert("Thành công", "Đã thêm ghi chú mới");
  };

  // Submit review
  const handleSubmitReview = () => {
    // Reset errors
    const newErrors = {
      rating: false,
      comment: false,
      professionalism: false,
      attitude: false,
      punctuality: false,
      quality: false,
    };

    let hasError = false;

    // Validate rating
    if (rating === 0) {
      newErrors.rating = true;
      hasError = true;
    }

    // Comment is optional, no validation needed

    // Validate rating details
    if (ratingDetails.professionalism === 0) {
      newErrors.professionalism = true;
      hasError = true;
    }
    if (ratingDetails.attitude === 0) {
      newErrors.attitude = true;
      hasError = true;
    }
    if (ratingDetails.punctuality === 0) {
      newErrors.punctuality = true;
      hasError = true;
    }
    if (ratingDetails.quality === 0) {
      newErrors.quality = true;
      hasError = true;
    }

    setReviewErrors(newErrors);

    if (hasError) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng điền đầy đủ thông tin đánh giá:\n" +
        (newErrors.rating ? "• Đánh giá chung\n" : "") +
        (newErrors.professionalism ? "• Chuyên môn\n" : "") +
        (newErrors.attitude ? "• Thái độ\n" : "") +
        (newErrors.punctuality ? "• Đúng giờ\n" : "") +
        (newErrors.quality ? "• Chất lượng" : "")
      );
      return;
    }

    Alert.alert(
      "Thành công",
      "Cảm ơn bạn đã đánh giá!",
      [
        {
          text: "OK",
          onPress: () => {
            setHasReviewed(true);
            setShowReviewModal(false);
            // Reset form
            setRating(0);
            setReviewComment("");
            setRatingDetails({
              professionalism: 0,
              attitude: 0,
              punctuality: 0,
              quality: 0,
            });
            setReviewErrors({
              rating: false,
              comment: false,
              professionalism: false,
              attitude: false,
              punctuality: false,
              quality: false,
            });
            // TODO: Send review to API
          },
        },
      ]
    );
  };

  // Cancel appointment
  const handleCancelAppointment = () => {
    if (!cancelReason.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập lý do hủy");
      return;
    }

    Alert.alert(
      "Xác nhận hủy",
      "Bạn có chắc chắn muốn hủy lịch hẹn này?",
      [
        { text: "Không", style: "cancel" },
        {
          text: "Hủy lịch",
          style: "destructive",
          onPress: () => {
            setStatus("cancelled");
            setShowCancelModal(false);
            setCancelReason("");
            Alert.alert("Thành công", "Đã hủy lịch hẹn");
          },
        },
      ]
    );
  };

  // Contact caregiver
  const handleContact = () => {
    router.push({
      pathname: "/careseeker/chat",
      params: {
        caregiverId: appointmentData.caregiver.id,
        caregiverName: appointmentData.caregiver.name,
      },
    });
  };

  // Call caregiver
  const handleCall = () => {
    router.push("/careseeker/video-call");
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#12394A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết lịch hẹn</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusText(status)}</Text>
          </View>
          <Text style={styles.appointmentId}>#{appointmentData.id}</Text>
        </View>

        {/* Appointment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin lịch hẹn</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ngày</Text>
                <Text style={styles.infoValue}>{appointmentData.date}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Thời gian</Text>
                <Text style={styles.infoValue}>{appointmentData.timeSlot}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="package-variant" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Gói dịch vụ</Text>
                <Text style={styles.infoValue}>{appointmentData.packageType}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="hourglass-outline" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Thời lượng</Text>
                <Text style={styles.infoValue}>{appointmentData.duration}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Caregiver Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Điều dưỡng viên</Text>
          <View style={styles.card}>
            <View style={styles.caregiverHeader}>
              <Image
                source={{ uri: appointmentData.caregiver.avatar }}
                style={styles.avatar}
              />
              <View style={styles.caregiverInfo}>
                <Text style={styles.caregiverName}>{appointmentData.caregiver.name}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={16} color="#FFB648" />
                  <Text style={styles.ratingText}>{appointmentData.caregiver.rating}</Text>
                </View>
                <Text style={styles.caregiverMeta}>
                  {appointmentData.caregiver.age} tuổi • {appointmentData.caregiver.gender}
                </Text>
                <Text style={styles.experienceText}>{appointmentData.caregiver.experience}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.specialtiesContainer}>
              <Text style={styles.subsectionTitle}>Chuyên môn:</Text>
              <View style={styles.specialtyTags}>
                {appointmentData.caregiver.specialties.map((specialty: string, index: number) => (
                  <View key={index} style={styles.specialtyTag}>
                    <Text style={styles.specialtyText}>{specialty}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.contactRow}>
              <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
                <Ionicons name="call" size={20} color="#FFFFFF" />
                <Text style={styles.contactButtonText}>Gọi</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.messageButton} onPress={handleContact}>
                <Ionicons name="chatbubble" size={20} color="#68C2E8" />
                <Text style={styles.messageButtonText}>Nhắn tin</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Elderly Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Người được chăm sóc</Text>
          <View style={styles.card}>
            <View style={styles.elderlyHeader}>
              <Image
                source={{ uri: appointmentData.elderly.avatar }}
                style={styles.avatar}
              />
              <View style={styles.elderlyInfo}>
                <Text style={styles.elderlyName}>{appointmentData.elderly.name}</Text>
                <Text style={styles.elderlyAge}>{appointmentData.elderly.age} tuổi</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#6B7280" />
              <Text style={styles.infoText}>{appointmentData.elderly.address}</Text>
            </View>
          </View>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dịch vụ</Text>
          <View style={styles.card}>
            {appointmentData.services.map((service: string, index: number) => (
              <View key={index} style={styles.serviceItem}>
                <Ionicons name="checkmark-circle" size={20} color="#68C2E8" />
                <Text style={styles.serviceText}>{service}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Special Instructions */}
        {appointmentData.specialInstructions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lưu ý đặc biệt</Text>
            <View style={[styles.card, styles.instructionsCard]}>
              <Ionicons name="information-circle" size={20} color="#F59E0B" />
              <Text style={styles.instructionsText}>{appointmentData.specialInstructions}</Text>
            </View>
          </View>
        )}

        {/* Payment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thanh toán</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Ionicons name="card-outline" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phương thức</Text>
                <Text style={styles.infoValue}>{appointmentData.payment.method}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="cash-outline" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Số tiền</Text>
                <Text style={[styles.infoValue, styles.amountText]}>
                  {appointmentData.payment.amount.toLocaleString("vi-VN")} đ
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="checkmark-circle" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Trạng thái</Text>
                <View style={styles.paymentStatusBadge}>
                  <Text style={styles.paymentStatusText}>
                    {appointmentData.payment.status === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <View style={styles.notesHeader}>
            <Text style={styles.sectionTitle}>Ghi chú</Text>
            <TouchableOpacity
              style={styles.addNoteButton}
              onPress={() => setIsNoteModalVisible(true)}
            >
              <Ionicons name="add-circle" size={24} color="#68C2E8" />
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            {notes.length === 0 ? (
              <Text style={styles.emptyText}>Chưa có ghi chú nào</Text>
            ) : (
              notes.map((note: any) => (
                <View key={note.id} style={styles.noteItem}>
                  <View style={styles.noteHeader}>
                    <Text style={styles.noteTime}>{note.time}</Text>
                    <Text style={styles.noteAuthor}>{note.author}</Text>
                  </View>
                  <Text style={styles.noteContent}>{note.content}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Actions */}
        {(status === "pending" || status === "confirmed") && (
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCancelModal(true)}
            >
              <Ionicons name="close-circle" size={20} color="#FFFFFF" />
              <Text style={styles.cancelButtonText}>Hủy lịch hẹn</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Review Action for Completed Appointments */}
        {status === "completed" && !hasReviewed && (
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() => setShowReviewModal(true)}
            >
              <Ionicons name="star" size={20} color="#FFFFFF" />
              <Text style={styles.reviewButtonText}>Đánh giá dịch vụ</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Spacer for navbar */}
        {(status === "completed" && hasReviewed) && (
          <View style={{ height: 120 }} />
        )}
      </ScrollView>

      {/* Add Note Modal */}
      <Modal
        visible={isNoteModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsNoteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm ghi chú</Text>
              <TouchableOpacity onPress={() => setIsNoteModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.noteInput}
              placeholder="Nhập nội dung ghi chú..."
              value={newNoteContent}
              onChangeText={setNewNoteContent}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleAddNote}>
              <Text style={styles.saveButtonText}>Lưu ghi chú</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        visible={showCancelModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Hủy lịch hẹn</Text>
              <TouchableOpacity onPress={() => setShowCancelModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text style={styles.cancelWarning}>
              Vui lòng cho chúng tôi biết lý do bạn muốn hủy lịch hẹn
            </Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Nhập lý do hủy..."
              value={cancelReason}
              onChangeText={setCancelReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.saveButton, styles.confirmCancelButton]}
              onPress={handleCancelAppointment}
            >
              <Text style={styles.saveButtonText}>Xác nhận hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reviewModalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Đánh giá dịch vụ</Text>
                <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Caregiver Info */}
              <View style={styles.reviewCaregiverInfo}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewAvatarText}>
                    {appointmentData.caregiver.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.reviewCaregiverDetails}>
                  <Text style={styles.reviewCaregiverName}>
                    {appointmentData.caregiver.name}
                  </Text>
                  <Text style={styles.reviewCaregiverSpecialty}>
                    {appointmentData.caregiver.specialties[0]}
                  </Text>
                </View>
              </View>

              {/* Overall Rating */}
              <View style={[
                styles.overallRatingSection,
                reviewErrors.rating && styles.errorSection
              ]}>
                <Text style={styles.ratingLabel}>
                  Đánh giá chung
                  <Text style={styles.requiredStar}> *</Text>
                </Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => {
                        setRating(star);
                        setReviewErrors({ ...reviewErrors, rating: false });
                      }}
                      style={styles.starButton}
                    >
                      <Ionicons
                        name={star <= rating ? "star" : "star-outline"}
                        size={40}
                        color={star <= rating ? "#FFB648" : "#D1D5DB"}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                {rating > 0 && (
                  <Text style={styles.ratingText}>
                    {rating === 5 && "Xuất sắc"}
                    {rating === 4 && "Rất tốt"}
                    {rating === 3 && "Tốt"}
                    {rating === 2 && "Trung bình"}
                    {rating === 1 && "Cần cải thiện"}
                  </Text>
                )}
                {reviewErrors.rating && (
                  <Text style={styles.errorText}>Vui lòng chọn số sao đánh giá</Text>
                )}
              </View>

              {/* Detailed Ratings */}
              <View style={styles.detailedRatingsSection}>
                <Text style={styles.sectionTitle}>
                  Đánh giá chi tiết
                  <Text style={styles.requiredStar}> *</Text>
                </Text>

                {/* Professionalism */}
                <View style={[
                  styles.detailRatingItem,
                  reviewErrors.professionalism && styles.errorDetailItem
                ]}>
                  <View style={styles.detailRatingHeader}>
                    <Ionicons name="briefcase" size={20} color="#68C2E8" />
                    <Text style={styles.detailRatingLabel}>Chuyên môn</Text>
                  </View>
                  <View style={styles.smallStarsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => {
                          setRatingDetails({ ...ratingDetails, professionalism: star });
                          setReviewErrors({ ...reviewErrors, professionalism: false });
                        }}
                      >
                        <Ionicons
                          name={star <= ratingDetails.professionalism ? "star" : "star-outline"}
                          size={24}
                          color={star <= ratingDetails.professionalism ? "#FFB648" : "#D1D5DB"}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Attitude */}
                <View style={[
                  styles.detailRatingItem,
                  reviewErrors.attitude && styles.errorDetailItem
                ]}>
                  <View style={styles.detailRatingHeader}>
                    <Ionicons name="happy" size={20} color="#68C2E8" />
                    <Text style={styles.detailRatingLabel}>Thái độ</Text>
                  </View>
                  <View style={styles.smallStarsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => {
                          setRatingDetails({ ...ratingDetails, attitude: star });
                          setReviewErrors({ ...reviewErrors, attitude: false });
                        }}
                      >
                        <Ionicons
                          name={star <= ratingDetails.attitude ? "star" : "star-outline"}
                          size={24}
                          color={star <= ratingDetails.attitude ? "#FFB648" : "#D1D5DB"}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Punctuality */}
                <View style={[
                  styles.detailRatingItem,
                  reviewErrors.punctuality && styles.errorDetailItem
                ]}>
                  <View style={styles.detailRatingHeader}>
                    <Ionicons name="time" size={20} color="#68C2E8" />
                    <Text style={styles.detailRatingLabel}>Đúng giờ</Text>
                  </View>
                  <View style={styles.smallStarsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => {
                          setRatingDetails({ ...ratingDetails, punctuality: star });
                          setReviewErrors({ ...reviewErrors, punctuality: false });
                        }}
                      >
                        <Ionicons
                          name={star <= ratingDetails.punctuality ? "star" : "star-outline"}
                          size={24}
                          color={star <= ratingDetails.punctuality ? "#FFB648" : "#D1D5DB"}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Quality */}
                <View style={[
                  styles.detailRatingItem,
                  reviewErrors.quality && styles.errorDetailItem
                ]}>
                  <View style={styles.detailRatingHeader}>
                    <Ionicons name="checkmark-circle" size={20} color="#68C2E8" />
                    <Text style={styles.detailRatingLabel}>Chất lượng</Text>
                  </View>
                  <View style={styles.smallStarsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => {
                          setRatingDetails({ ...ratingDetails, quality: star });
                          setReviewErrors({ ...reviewErrors, quality: false });
                        }}
                      >
                        <Ionicons
                          name={star <= ratingDetails.quality ? "star" : "star-outline"}
                          size={24}
                          color={star <= ratingDetails.quality ? "#FFB648" : "#D1D5DB"}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Comment */}
              <View style={styles.commentSection}>
                <View style={styles.commentHeader}>
                  <Text style={styles.sectionTitle}>
                    Nhận xét của bạn
                    <Text style={styles.optionalText}> (Tùy chọn)</Text>
                  </Text>
                  <Text style={styles.charCount}>
                    {reviewComment.length} ký tự
                  </Text>
                </View>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ..."
                  value={reviewComment}
                  onChangeText={setReviewComment}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitReviewButton}
                onPress={handleSubmitReview}
              >
                <Text style={styles.submitReviewButtonText}>Gửi đánh giá</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <SimpleNavBar activeTab="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F9FD",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#12394A",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  appointmentId: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#12394A",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: "#12394A",
    fontWeight: "600",
  },
  infoText: {
    fontSize: 14,
    color: "#12394A",
    marginLeft: 12,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
  caregiverHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  caregiverInfo: {
    marginLeft: 12,
    flex: 1,
  },
  caregiverName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#12394A",
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#12394A",
    marginLeft: 4,
  },
  caregiverMeta: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  experienceText: {
    fontSize: 12,
    color: "#68C2E8",
    fontWeight: "500",
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#12394A",
    marginBottom: 8,
  },
  specialtiesContainer: {
    paddingVertical: 8,
  },
  specialtyTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  specialtyTag: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  specialtyText: {
    fontSize: 12,
    color: "#0284C7",
    fontWeight: "500",
  },
  contactRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#68C2E8",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  contactButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  messageButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#68C2E8",
    gap: 8,
  },
  messageButtonText: {
    color: "#68C2E8",
    fontSize: 14,
    fontWeight: "600",
  },
  elderlyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  elderlyInfo: {
    marginLeft: 12,
    flex: 1,
  },
  elderlyName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#12394A",
    marginBottom: 4,
  },
  elderlyAge: {
    fontSize: 14,
    color: "#6B7280",
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 12,
  },
  serviceText: {
    fontSize: 14,
    color: "#12394A",
    flex: 1,
  },
  instructionsCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#FEF3C7",
  },
  instructionsText: {
    flex: 1,
    fontSize: 14,
    color: "#92400E",
    lineHeight: 20,
  },
  amountText: {
    color: "#68C2E8",
    fontSize: 16,
  },
  paymentStatusBadge: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  paymentStatusText: {
    fontSize: 12,
    color: "#065F46",
    fontWeight: "600",
  },
  notesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  addNoteButton: {
    padding: 4,
  },
  noteItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  noteTime: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  noteAuthor: {
    fontSize: 12,
    color: "#68C2E8",
    fontWeight: "600",
  },
  noteContent: {
    fontSize: 14,
    color: "#12394A",
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    paddingVertical: 20,
  },
  actionsSection: {
    padding: 20,
    paddingBottom: 120,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EF4444",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#12394A",
  },
  noteInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: "#12394A",
    minHeight: 120,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: "#68C2E8",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelWarning: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
    lineHeight: 20,
  },
  confirmCancelButton: {
    backgroundColor: "#EF4444",
  },
  reviewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFB648",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  reviewButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  reviewModalContent: {
    width: "100%",
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  reviewCaregiverInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  reviewAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#68C2E8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  reviewAvatarText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  reviewCaregiverDetails: {
    flex: 1,
  },
  reviewCaregiverName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#12394A",
    marginBottom: 4,
  },
  reviewCaregiverSpecialty: {
    fontSize: 14,
    color: "#6B7280",
  },
  overallRatingSection: {
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 20,
    backgroundColor: "#FFFBF0",
    borderRadius: 12,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#12394A",
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  detailedRatingsSection: {
    marginBottom: 24,
  },
  detailRatingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    marginBottom: 12,
  },
  detailRatingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  detailRatingLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#12394A",
  },
  smallStarsContainer: {
    flexDirection: "row",
    gap: 4,
  },
  commentSection: {
    marginBottom: 24,
  },
  commentInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: "#12394A",
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  submitReviewButton: {
    backgroundColor: "#68C2E8",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  submitReviewButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  requiredStar: {
    color: "#EF4444",
    fontSize: 14,
  },
  optionalText: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "400",
  },
  errorSection: {
    borderWidth: 2,
    borderColor: "#EF4444",
  },
  errorDetailItem: {
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  errorInput: {
    borderWidth: 2,
    borderColor: "#EF4444",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
});

