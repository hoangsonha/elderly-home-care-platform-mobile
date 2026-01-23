import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as Linking from 'expo-linking';
import * as ImagePicker from 'expo-image-picker';
import { Platform, Dimensions } from 'react-native';
import React, { useEffect, useState } from "react";
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
import { useBottomNavPadding } from "@/hooks/useBottomNavPadding";
import { mainService, type MyCareServiceData } from "@/services/main.service";
import { caregiverService } from "@/services/caregiver.service";

// Mock data
const appointmentsDataMap: { [key: string]: any } = {
  "1": {
    id: "APT001",
    status: "completed", // pending, confirmed, in-progress, completed, cancelled
    date: "2025-01-25",
    timeSlot: "08:00 - 12:00",
    duration: "4 giờ",
    packageType: "Gói cơ bản",
    
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
      amount: 400000, // Gói cơ bản 4h
      status: "paid", // Luôn là "paid" - bắt buộc thanh toán trước khi book
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
    timeSlot: "14:00 - 22:00",
    duration: "8 giờ",
    packageType: "Gói chuyên nghiệp",
    
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
      amount: 750000, // Gói chuyên nghiệp 8h
      status: "paid", // Luôn là "paid" - bắt buộc thanh toán trước khi book
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
    timeSlot: "08:00 - 12:00",
    duration: "4 giờ",
    packageType: "Gói cơ bản",
    
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
      amount: 400000, // Gói cơ bản 4h
      status: "paid", // Đã thanh toán - bắt buộc phải thanh toán trước khi book
      transactionId: "TXN001236",
    },
    
    notes: [],
    
    specialInstructions: "Bà thích nghe nhạc trữ tình.",
  },
};

export default function AppointmentDetailScreen() {
  const { id } = useLocalSearchParams();
  const bottomNavPadding = useBottomNavPadding();
  const appointmentId = (id as string) || "";
  
  const [appointmentData, setAppointmentData] = useState<MyCareServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState<any[]>([]);
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [selectedTab, setSelectedTab] = useState<"tasks" | "notes">("tasks");
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelSuccessModal, setShowCancelSuccessModal] = useState(false);
  const [showCancelErrorModal, setShowCancelErrorModal] = useState(false);
  const [cancelErrorMessage, setCancelErrorMessage] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
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
  const [remainingMinutes, setRemainingMinutes] = useState<number | null>(null);
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [selectedFeedbackImage, setSelectedFeedbackImage] = useState<string | null>(null);

  // Calculate remaining minutes until deadline
  const calculateRemainingMinutes = (deadline: string): number | null => {
    try {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      const diffMs = deadlineDate.getTime() - now.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes > 0 ? diffMinutes : 0;
    } catch (error) {
      return null;
    }
  };

  // Update remaining minutes every minute
  useEffect(() => {
    if (appointmentData?.caregiverResponseDeadline && status === "PENDING_CAREGIVER") {
      const updateRemaining = () => {
        const minutes = calculateRemainingMinutes(appointmentData.caregiverResponseDeadline);
        setRemainingMinutes(minutes);
      };
      
      updateRemaining();
      const interval = setInterval(updateRemaining, 60000); // Update every minute
      
      return () => clearInterval(interval);
    }
  }, [appointmentData?.caregiverResponseDeadline, status]);

  // Fetch appointment data
  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const response = await mainService.getMyCareServices();
      
      if (response.status === 'Success' && response.data) {
        const appointment = response.data.find((service: MyCareServiceData) => 
          service.careServiceId === appointmentId
        );
        
        if (appointment) {
          setAppointmentData(appointment);
          setStatus(appointment.status);
          // Calculate remaining minutes if status is PENDING_CAREGIVER
          if (appointment.status === "PENDING_CAREGIVER" && appointment.caregiverResponseDeadline) {
            const minutes = calculateRemainingMinutes(appointment.caregiverResponseDeadline);
            setRemainingMinutes(minutes);
          }
        } else {
          Alert.alert('Lỗi', 'Không tìm thấy lịch hẹn');
          router.back();
        }
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể tải thông tin lịch hẹn');
        router.back();
      }
    } catch (error: any) {
      Alert.alert('Lỗi', 'Không thể tải thông tin lịch hẹn');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appointmentId) {
      fetchAppointment();
    }
  }, [appointmentId]);

  if (loading || !appointmentData) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
        <SimpleNavBar activeTab="home" />
      </SafeAreaView>
    );
  }

  // Parse location if it's a JSON string
  let locationObj = { address: '', latitude: 0, longitude: 0 };
  try {
    if (typeof appointmentData.location === 'string') {
      locationObj = JSON.parse(appointmentData.location);
    } else {
      locationObj = appointmentData.location as any;
    }
  } catch (e) {
    locationObj = {
      address: appointmentData.elderlyProfile.location.address,
      latitude: appointmentData.elderlyProfile.location.latitude,
      longitude: appointmentData.elderlyProfile.location.longitude,
    };
  }

  // Format time from "06:20:00" to "06:20"
  const formatTime = (timeStr: string) => {
    return timeStr.split(':').slice(0, 2).join(':');
  };

  // Get caregiver rating from profileData
  const getCaregiverRating = (): number => {
    try {
      if (!appointmentData?.caregiverProfile?.profileData) {
        console.log('No profileData found');
        return 0;
      }

      let profileData = appointmentData.caregiverProfile.profileData;
      
      // Parse if it's a string
      if (typeof profileData === 'string') {
        profileData = JSON.parse(profileData);
      }

      console.log('ProfileData:', JSON.stringify(profileData, null, 2));
      console.log('Ratings reviews:', profileData?.ratings_reviews);

      // Get overall_rating from ratings_reviews
      const overallRating = profileData?.ratings_reviews?.overall_rating;
      
      console.log('Overall rating:', overallRating);
      
      if (overallRating !== null && overallRating !== undefined) {
        const rating = parseFloat(overallRating.toString()) || 0;
        console.log('Parsed rating:', rating);
        return rating;
      }
      
      return 0;
    } catch (error) {
      console.error('Error parsing caregiver rating:', error);
      return 0;
    }
  };

  // Calculate caregiver rating when appointmentData is available
  const caregiverRating = appointmentData ? getCaregiverRating() : 0;

  // Get payment status text
  const getPaymentStatusText = () => {
    return appointmentData.status === 'COMPLETED' ? 'Đã thanh toán' : 'Chờ thanh toán';
  };

  // Get payment status color
  const getPaymentStatusColor = () => {
    return appointmentData.status === 'COMPLETED' ? '#D1FAE5' : '#FEF3C7';
  };

  const getPaymentStatusTextColor = () => {
    return appointmentData.status === 'COMPLETED' ? '#065F46' : '#92400E';
  };

  // Status helpers
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING_CAREGIVER": return "#F59E0B";
      case "CAREGIVER_APPROVED": return "#3B82F6";
      case "IN_PROGRESS": return "#10B981";
      case "COMPLETED_WAITING_REVIEW": return "#8B5CF6";
      case "COMPLETED": return "#6B7280";
      case "CANCELLED": return "#EF4444";
      case "EXPIRED": return "#9CA3AF";
      default: return "#9CA3AF";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING_CAREGIVER": return "Chờ phản hồi";
      case "CAREGIVER_APPROVED": return "Đã xác nhận";
      case "IN_PROGRESS": return "Đang thực hiện";
      case "COMPLETED_WAITING_REVIEW": return "Chờ đánh giá";
      case "COMPLETED": return "Hoàn thành";
      case "CANCELLED": return "Đã hủy";
      case "EXPIRED": return "Đã hết hạn";
      default: return "Không xác định";
    }
  };

  const getHealthStatusText = (healthStatus: string | null | undefined): string => {
    if (!healthStatus) return "Chưa cập nhật";
    
    const status = String(healthStatus).toUpperCase().trim();
    
    // Handle exact matches first
    if (status === "GOOD") return "Tốt";
    if (status === "MODERATE" || status === "MODERRATE") return "Trung bình";
    if (status === "WEAK") return "Yếu";
    
    // Handle partial matches
    if (status.includes("GOOD")) return "Tốt";
    if (status.includes("MODERATE") || status.includes("MODERRATE")) return "Trung bình";
    if (status.includes("WEAK")) return "Yếu";
    
    // Fallback: return original value
    return healthStatus;
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

  // Handle image picker
  const handleImagePicker = () => {
    setShowImagePickerModal(true);
  };

  const handlePickFromLibrary = async () => {
    setShowImagePickerModal(false);
    if (reviewImages.length >= 5) {
      Alert.alert('Thông báo', 'Bạn chỉ có thể thêm tối đa 5 ảnh');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Thông báo', 'Cần quyền truy cập thư viện ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (!result.canceled && result.assets[0]) {
      setReviewImages([...reviewImages, result.assets[0].uri]);
    }
  };

  const handleTakePhoto = async () => {
    setShowImagePickerModal(false);
    if (reviewImages.length >= 5) {
      Alert.alert('Thông báo', 'Bạn chỉ có thể thêm tối đa 5 ảnh');
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Thông báo', 'Cần quyền truy cập camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setReviewImages([...reviewImages, result.assets[0].uri]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setReviewImages(reviewImages.filter((_, i) => i !== index));
  };

  // Submit review
  const handleSubmitReview = async () => {
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

    if (!appointmentData) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin lịch hẹn");
      return;
    }

    setIsSubmittingReview(true);

    try {
      // Prepare feedback data
      const feedbackData = {
        targetType: "SERVICE",
        targetId: appointmentData.careServiceId,
        rating: rating,
        professionalism: ratingDetails.professionalism,
        attitude: ratingDetails.attitude,
        punctuality: ratingDetails.punctuality,
        quality: ratingDetails.quality,
        comment: reviewComment.trim() || undefined,
      };

      // Prepare images
      const imageFiles = reviewImages.map((uri) => ({
        uri: uri,
        type: 'image/jpeg',
        name: `feedback_image_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`,
      }));

      // Call API
      const response = await mainService.createFeedback(feedbackData, imageFiles);

      if (response.status === 'Success') {
        Alert.alert(
          "Thành công",
          "Cảm ơn bạn đã đánh giá!",
          [
            {
              text: "OK",
              onPress: async () => {
                setShowReviewModal(false);
                // Reset form
                setRating(0);
                setReviewComment("");
                setReviewImages([]);
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
                // Reload appointment data to get feedback
                await fetchAppointment();
              },
            },
          ]
        );
      } else {
        Alert.alert("Lỗi", response.message || "Có lỗi xảy ra khi gửi đánh giá");
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      const errorMessage = error.response?.data?.message || error.message || "Có lỗi xảy ra khi gửi đánh giá";
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Cancel appointment
  const handleCancelAppointment = async () => {
    if (!cancelReason.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập lý do hủy");
      return;
    }

    if (!appointmentData) return;
    
    setIsCancelling(true);
    try {
      const response = await mainService.declineCareService(appointmentData.careServiceId, cancelReason);
      
      if (response.status === "Success") {
        setShowCancelModal(false);
        setCancelReason("");
        setShowCancelSuccessModal(true);
        // Refresh appointment data
        const refreshResponse = await mainService.getMyCareServices();
        if (refreshResponse.status === 'Success' && refreshResponse.data) {
          const updatedAppointment = refreshResponse.data.find((service: MyCareServiceData) => 
            service.careServiceId === appointmentId
          );
          if (updatedAppointment) {
            setAppointmentData(updatedAppointment);
            setStatus(updatedAppointment.status);
          }
        }
      } else {
        setCancelErrorMessage(response.message || "Không thể hủy lịch hẹn. Vui lòng thử lại.");
        setShowCancelErrorModal(true);
      }
    } catch (error: any) {
      setCancelErrorMessage("Không thể kết nối đến server. Vui lòng thử lại sau.");
      setShowCancelErrorModal(true);
    } finally {
      setIsCancelling(false);
    }
  };

  // Contact caregiver
  const handleContact = () => {
    router.push({
      pathname: "/careseeker/chat",
      params: {
        caregiverId: appointmentData.caregiverProfile.caregiverProfileId,
        caregiverName: appointmentData.caregiverProfile.fullName,
        caregiverAvatar: appointmentData.caregiverProfile.avatarUrl,
      },
    });
  };

  // Call caregiver
  const handleCall = () => {
    router.push("/careseeker/video-call");
  };

  // View caregiver detail
  const handleViewCaregiverDetail = async () => {
    try {
      if (!appointmentData?.caregiverProfile?.caregiverProfileId) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin người chăm sóc');
        return;
      }

      // Gọi API để lấy full caregiver data
      const caregiverDetail = await caregiverService.getPublicCaregiverById(
        appointmentData.caregiverProfile.caregiverProfileId
      );

      // Navigate đến caregiver detail với full data
      router.push({
        pathname: '/careseeker/caregiver-detail',
        params: {
          id: caregiverDetail.caregiverProfileId,
          caregiver: JSON.stringify(caregiverDetail),
          avatarUrl: caregiverDetail.avatarUrl || '',
        }
      });
    } catch (error: any) {
      console.error('Error fetching caregiver detail:', error);
      // Fallback: navigate với basic info
      router.push({
        pathname: '/careseeker/caregiver-detail',
        params: {
          id: appointmentData.caregiverProfile.caregiverProfileId,
          caregiver: JSON.stringify({
            caregiverProfileId: appointmentData.caregiverProfile.caregiverProfileId,
            fullName: appointmentData.caregiverProfile.fullName,
            avatarUrl: appointmentData.caregiverProfile.avatarUrl,
            age: appointmentData.caregiverProfile.age,
            gender: appointmentData.caregiverProfile.gender,
            bio: appointmentData.caregiverProfile.bio,
            phoneNumber: appointmentData.caregiverProfile.phoneNumber,
            email: appointmentData.caregiverProfile.email,
            isVerified: appointmentData.caregiverProfile.isVerified,
            location: appointmentData.caregiverProfile.location,
            profileData: appointmentData.caregiverProfile.profileData,
            qualifications: appointmentData.caregiverProfile.qualifications || [],
          }),
          avatarUrl: appointmentData.caregiverProfile.avatarUrl || '',
        }
      });
    }
  };

  // View elderly detail
  const handleViewElderlyDetail = () => {
    if (!appointmentData?.elderlyProfile?.elderlyProfileId) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin người được chăm sóc');
      return;
    }

    router.push({
      pathname: '/careseeker/elderly-detail',
      params: {
        id: appointmentData.elderlyProfile.elderlyProfileId,
      }
    });
  };

  // Handle view map
  const handleViewMap = () => {
    if (!locationObj.latitude || !locationObj.longitude || locationObj.latitude === 0 || locationObj.longitude === 0) {
      Alert.alert('Thông báo', 'Chưa có tọa độ địa điểm');
      return;
    }

    const lat = locationObj.latitude;
    const lng = locationObj.longitude;
    
    const url = Platform.select({
      ios: `maps://maps.apple.com/?q=${lat},${lng}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}`,
    });

    const webUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    Linking.openURL(url || webUrl).catch((err) => {
      console.error('Error opening maps:', err);
      Alert.alert('Lỗi', 'Không thể mở bản đồ');
    });
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

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomNavPadding }}
      >
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
          <Text style={styles.appointmentId}>#{appointmentData.bookingCode}</Text>
        </View>

        {/* Caregiver Response Deadline Warning */}
        {status === "PENDING_CAREGIVER" && appointmentData?.caregiverResponseDeadline && remainingMinutes !== null && remainingMinutes > 0 && (
          <View style={styles.section}>
            <View style={styles.deadlineCard}>
              <View style={styles.deadlineHeader}>
                <Ionicons name="time-outline" size={24} color="#F59E0B" />
                <Text style={styles.deadlineTitle}>Đang đợi phản hồi</Text>
              </View>
              <Text style={styles.deadlineMessage}>
                Đang đợi người chăm sóc phản hồi dịch vụ, nếu trong vòng{" "}
                <Text style={styles.deadlineMinutes}>{remainingMinutes} phút</Text> nữa người chăm sóc không có phản hồi thì sẽ tự động hủy dịch vụ
              </Text>
            </View>
          </View>
        )}

        {/* Appointment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin lịch hẹn</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ngày</Text>
                <Text style={styles.infoValue}>{appointmentData.workDate}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Thời gian</Text>
                <Text style={styles.infoValue}>
                  {formatTime(appointmentData.startTime)} - {formatTime(appointmentData.endTime)}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="package-variant" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Gói dịch vụ</Text>
                <Text style={styles.infoValue}>{appointmentData.servicePackage.packageName}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="hourglass-outline" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Thời lượng</Text>
                <Text style={styles.infoValue}>{appointmentData.servicePackage.durationHours} giờ</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Vị trí làm việc</Text>
                {locationObj.latitude && locationObj.longitude && locationObj.latitude !== 0 && locationObj.longitude !== 0 ? (
                  <TouchableOpacity
                    style={styles.mapButton}
                    onPress={handleViewMap}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.mapButtonText}>Xem bản đồ</Text>
                    <Ionicons name="map-outline" size={16} color="#68C2E8" />
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.infoValue}>Chưa có địa điểm</Text>
                )}
              </View>
            </View>
            
            {/* Check In - Check Out Section */}
            <View style={styles.divider} />
            <View style={styles.checkInOutSection}>
              <Text style={styles.checkInOutTitle}>Check In - Check Out</Text>
              
              {/* CI and CO in horizontal layout */}
              <View style={styles.checkInOutRow}>
                {/* Check In */}
                <View style={styles.checkInOutItem}>
                  <View style={styles.checkInOutHeader}>
                    <MaterialCommunityIcons name="login" size={18} color="#10B981" />
                    <Text style={styles.checkInOutLabel}>Check In</Text>
                  </View>
                  {appointmentData.workSchedule?.checkInImageUrl ? (
                    <View style={styles.checkInOutContent}>
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedImageUrl(appointmentData.workSchedule?.checkInImageUrl || null);
                          setShowImageModal(true);
                        }}
                        activeOpacity={0.8}
                      >
                        <Image 
                          source={{ uri: appointmentData.workSchedule.checkInImageUrl }} 
                          style={styles.checkInOutImage}
                        />
                      </TouchableOpacity>
                      {appointmentData.workSchedule?.startTime && (
                        <Text style={styles.checkInOutTime}>
                          {appointmentData.workSchedule.startTime.substring(0, 5)}
                        </Text>
                      )}
                    </View>
                  ) : (
                    <Text style={styles.checkInOutPlaceholder}>Chưa CI</Text>
                  )}
                </View>
                
                {/* Check Out */}
                <View style={styles.checkInOutItem}>
                  <View style={styles.checkInOutHeader}>
                    <MaterialCommunityIcons name="logout" size={18} color="#EF4444" />
                    <Text style={styles.checkInOutLabel}>Check Out</Text>
                  </View>
                  {appointmentData.workSchedule?.checkOutImageUrl ? (
                    <View style={styles.checkInOutContent}>
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedImageUrl(appointmentData.workSchedule?.checkOutImageUrl || null);
                          setShowImageModal(true);
                        }}
                        activeOpacity={0.8}
                      >
                        <Image 
                          source={{ uri: appointmentData.workSchedule.checkOutImageUrl }} 
                          style={styles.checkInOutImage}
                        />
                      </TouchableOpacity>
                      {appointmentData.workSchedule?.endTime && (
                        <Text style={styles.checkInOutTime}>
                          {appointmentData.workSchedule.endTime.substring(0, 5)}
                        </Text>
                      )}
                    </View>
                  ) : (
                    <Text style={styles.checkInOutPlaceholder}>Chưa CO</Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Caregiver Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Người chăm sóc</Text>
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.caregiverHeader}
              onPress={handleViewCaregiverDetail}
              activeOpacity={0.7}
            >
              {appointmentData.caregiverProfile.avatarUrl ? (
                <Image
                  source={{ uri: appointmentData.caregiverProfile.avatarUrl }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, { backgroundColor: '#68C2E8', alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={styles.avatarText}>
                    {appointmentData.caregiverProfile.fullName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.caregiverInfo}>
                <View style={styles.caregiverNameRow}>
                  <View style={styles.caregiverNameContainer}>
                    <Text style={styles.caregiverName}>{appointmentData.caregiverProfile.fullName}</Text>
                    {appointmentData.caregiverProfile.isVerified && (
                      <View style={styles.verifiedLabel}>
                        <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                        <Text style={styles.verifiedText}>Đã xác thực</Text>
                      </View>
                    )}
                  </View>
                  {caregiverRating > 0 && (
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={16} color="#FFB648" />
                      <Text style={styles.ratingText}>{caregiverRating.toFixed(1)}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.caregiverMeta}>
                  {appointmentData.caregiverProfile.age} tuổi • {appointmentData.caregiverProfile.gender === 'MALE' ? 'Nam' : 'Nữ'}
                </Text>
              </View>
            </TouchableOpacity>
            
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
            <TouchableOpacity 
              style={styles.elderlyHeader}
              onPress={handleViewElderlyDetail}
              activeOpacity={0.7}
            >
              {appointmentData.elderlyProfile.avatarUrl ? (
                <Image
                  source={{ uri: appointmentData.elderlyProfile.avatarUrl }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, { backgroundColor: '#68C2E8', alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={styles.avatarText}>
                    {appointmentData.elderlyProfile.fullName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.elderlyInfo}>
                <Text style={styles.elderlyName}>{appointmentData.elderlyProfile.fullName}</Text>
                <Text style={styles.elderlyAge}>{appointmentData.elderlyProfile.age} tuổi</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="medical-outline" size={20} color="#6B7280" />
              <Text style={styles.infoText}>
                <Text style={styles.healthStatusLabel}>Tình trạng sức khỏe: </Text>
                <Text style={styles.healthStatusValue}>
                  {getHealthStatusText(appointmentData.elderlyProfile.healthStatus)}
                </Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "tasks" && styles.tabActive]}
            onPress={() => setSelectedTab("tasks")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "tasks" && styles.tabTextActive,
              ]}
            >
              Nhiệm vụ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "notes" && styles.tabActive]}
            onPress={() => setSelectedTab("notes")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "notes" && styles.tabTextActive,
              ]}
            >
              Ghi chú
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tasks Tab */}
        {selectedTab === "tasks" && (
          <View style={styles.section}>
            <View style={styles.taskSection}>
              <View style={styles.taskSectionHeader}>
                <MaterialCommunityIcons name="package-variant" size={20} color="#10B981" />
                <Text style={styles.taskSectionTitle}>Dịch vụ {appointmentData.servicePackage.packageName}</Text>
                <View style={styles.taskBadge}>
                  <Text style={styles.taskBadgeText}>
                    {appointmentData.workSchedule?.workTasks?.filter((t: any) => t.status === 'DONE').length || 0}/{appointmentData.workSchedule?.workTasks?.length || appointmentData.servicePackage.serviceTasks.length}
                  </Text>
                </View>
              </View>
              <Text style={styles.taskSectionDesc}>
                Các dịch vụ cần thực hiện trong ca làm việc
              </Text>
              {(appointmentData.workSchedule?.workTasks || appointmentData.servicePackage.serviceTasks).map((task: any, index: number) => {
                const isCompleted = task.status === 'DONE' || (task.completed === true);
                const isNotCompleted = task.status === 'NOT_COMPLETED';
                const isCompletedStatus = status === "COMPLETED" || status === "Hoàn thành";
                
                return (
                  <View
                    key={task.workTaskId || task.serviceTaskId || index}
                    style={[
                      styles.taskCard,
                      isCompletedStatus && isCompleted && styles.taskCardCompletedGreen,
                      isCompletedStatus && isNotCompleted && styles.taskCardNotCompletedRed,
                    ]}
                  >
                    <View style={styles.taskHeader}>
                      <View style={styles.taskLeft}>
                        <View
                          style={[
                            styles.checkbox,
                            isCompleted && (isCompletedStatus ? styles.checkboxCompletedGreen : styles.checkboxCompleted),
                            isCompletedStatus && isNotCompleted && styles.checkboxNotCompletedRed,
                          ]}
                        >
                          {isCompleted && (
                            <Ionicons name="checkmark" size={16} color="#fff" />
                          )}
                          {isCompletedStatus && isNotCompleted && (
                            <Ionicons name="close" size={16} color="#fff" />
                          )}
                        </View>
                        <View style={styles.taskInfo}>
                          <Text
                            style={[
                              styles.taskTitle,
                              isCompletedStatus && isCompleted && styles.taskTitleCompletedGreen,
                              isCompletedStatus && isNotCompleted && styles.taskTitleNotCompletedRed,
                            ]}
                          >
                            {task.name || task.taskName}
                          </Text>
                          {task.description && (
                            <Text
                              style={[
                                styles.taskDescription,
                                isCompletedStatus && isCompleted && styles.taskDescriptionCompletedGreen,
                                isCompletedStatus && isNotCompleted && styles.taskDescriptionNotCompletedRed,
                              ]}
                            >
                              {task.description}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Notes Tab */}
        {selectedTab === "notes" && (
          <View style={styles.section}>
            {appointmentData.note && (
              <View style={styles.noteCard}>
                <View style={styles.noteHeader}>
                  <View style={styles.noteAuthor}>
                    <Ionicons name="information-circle" size={16} color="#6B7280" />
                    <Text style={styles.noteAuthorText}>Ghi chú ban đầu</Text>
                  </View>
                </View>
                <Text style={styles.noteContent}>{appointmentData.note}</Text>
              </View>
            )}
            {appointmentData.status === 'IN_PROGRESS' && appointmentData.work_note && (
              <View style={styles.noteCard}>
                <View style={styles.noteHeader}>
                  <View style={styles.noteAuthor}>
                    <Ionicons name="medical" size={16} color="#6B7280" />
                    <Text style={styles.noteAuthorText}>Ghi chú trong thời gian làm việc</Text>
                  </View>
                </View>
                <Text style={styles.noteContent}>{appointmentData.work_note}</Text>
              </View>
            )}
            {notes.map((note: any) => (
              <View key={note.id} style={styles.noteCard}>
                <View style={styles.noteHeader}>
                  <View style={styles.noteAuthor}>
                    <Ionicons
                      name={note.type === "health" ? "medical" : "person-circle"}
                      size={16}
                      color="#6B7280"
                    />
                    <Text style={styles.noteAuthorText}>{note.author}</Text>
                  </View>
                  <Text style={styles.noteTime}>{note.time}</Text>
                </View>
                <Text style={styles.noteContent}>{note.content}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Payment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thanh toán</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Ionicons name="cash-outline" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Số tiền</Text>
                <Text style={[styles.infoValue, styles.amountText]}>
                  {appointmentData.servicePackage.price.toLocaleString("vi-VN")} đ
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="checkmark-circle" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Trạng thái</Text>
                <View style={[styles.paymentStatusBadge, { backgroundColor: getPaymentStatusColor() }]}>
                  <Text style={[styles.paymentStatusText, { color: getPaymentStatusTextColor() }]}>
                    {getPaymentStatusText()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Feedback Section - Only show if feedback exists */}
        {appointmentData.feedback && appointmentData.feedback !== null && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Đánh giá của bạn</Text>
            <View style={styles.card}>
              {/* Submission Time - Moved to top */}
              {appointmentData.feedback.submissionTime && (
                <View style={styles.feedbackTime}>
                  <Ionicons name="time-outline" size={16} color="#6B7280" />
                  <Text style={styles.feedbackTimeText}>
                    {new Date(appointmentData.feedback.submissionTime).toLocaleString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              )}

              {appointmentData.feedback.submissionTime && <View style={styles.divider} />}

              {/* Overall Rating */}
              <View style={styles.feedbackOverallRating}>
                <Text style={styles.feedbackOverallRatingLabel}>Đánh giá tổng thể</Text>
                <View style={styles.feedbackStarsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= appointmentData.feedback.rating ? "star" : "star-outline"}
                      size={24}
                      color={star <= appointmentData.feedback.rating ? "#FFB648" : "#D1D5DB"}
                    />
                  ))}
                  <Text style={styles.feedbackRatingText}>{appointmentData.feedback.rating}/5</Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Detailed Ratings */}
              <View style={styles.feedbackDetailedRatings}>
                <Text style={styles.feedbackDetailedRatingsTitle}>Đánh giá chi tiết</Text>
                
                <View style={styles.feedbackDetailItem}>
                  <View style={styles.feedbackDetailHeader}>
                    <Ionicons name="briefcase" size={18} color="#68C2E8" />
                    <Text style={styles.feedbackDetailLabel}>Chuyên môn</Text>
                  </View>
                  <View style={styles.feedbackDetailStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= appointmentData.feedback.detailedRatings.professionalism ? "star" : "star-outline"}
                        size={18}
                        color={star <= appointmentData.feedback.detailedRatings.professionalism ? "#FFB648" : "#D1D5DB"}
                      />
                    ))}
                    <Text style={styles.feedbackDetailRatingText}>
                      {appointmentData.feedback.detailedRatings.professionalism}/5
                    </Text>
                  </View>
                </View>

                <View style={styles.feedbackDetailItem}>
                  <View style={styles.feedbackDetailHeader}>
                    <Ionicons name="happy" size={18} color="#68C2E8" />
                    <Text style={styles.feedbackDetailLabel}>Thái độ</Text>
                  </View>
                  <View style={styles.feedbackDetailStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= appointmentData.feedback.detailedRatings.attitude ? "star" : "star-outline"}
                        size={18}
                        color={star <= appointmentData.feedback.detailedRatings.attitude ? "#FFB648" : "#D1D5DB"}
                      />
                    ))}
                    <Text style={styles.feedbackDetailRatingText}>
                      {appointmentData.feedback.detailedRatings.attitude}/5
                    </Text>
                  </View>
                </View>

                <View style={styles.feedbackDetailItem}>
                  <View style={styles.feedbackDetailHeader}>
                    <Ionicons name="time" size={18} color="#68C2E8" />
                    <Text style={styles.feedbackDetailLabel}>Đúng giờ</Text>
                  </View>
                  <View style={styles.feedbackDetailStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= appointmentData.feedback.detailedRatings.punctuality ? "star" : "star-outline"}
                        size={18}
                        color={star <= appointmentData.feedback.detailedRatings.punctuality ? "#FFB648" : "#D1D5DB"}
                      />
                    ))}
                    <Text style={styles.feedbackDetailRatingText}>
                      {appointmentData.feedback.detailedRatings.punctuality}/5
                    </Text>
                  </View>
                </View>

                <View style={styles.feedbackDetailItem}>
                  <View style={styles.feedbackDetailHeader}>
                    <Ionicons name="checkmark-circle" size={18} color="#68C2E8" />
                    <Text style={styles.feedbackDetailLabel}>Chất lượng</Text>
                  </View>
                  <View style={styles.feedbackDetailStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= appointmentData.feedback.detailedRatings.quality ? "star" : "star-outline"}
                        size={18}
                        color={star <= appointmentData.feedback.detailedRatings.quality ? "#FFB648" : "#D1D5DB"}
                      />
                    ))}
                    <Text style={styles.feedbackDetailRatingText}>
                      {appointmentData.feedback.detailedRatings.quality}/5
                    </Text>
                  </View>
                </View>
              </View>

              {/* Comment */}
              {appointmentData.feedback.comment && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.feedbackComment}>
                    <Text style={styles.feedbackCommentLabel}>Nhận xét</Text>
                    <Text style={styles.feedbackCommentText}>{appointmentData.feedback.comment}</Text>
                  </View>
                </>
              )}

              {/* Images */}
              {appointmentData.feedback.attachmentUrls && appointmentData.feedback.attachmentUrls.length > 0 && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.feedbackImages}>
                    <Text style={styles.feedbackImagesLabel}>Hình ảnh đánh giá</Text>
                    <View style={styles.feedbackImagesGrid}>
                      {appointmentData.feedback.attachmentUrls.map((url: string, index: number) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.feedbackImageItem}
                          onPress={() => setSelectedFeedbackImage(url)}
                        >
                          <Image source={{ uri: url }} style={styles.feedbackImage} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {/* Actions */}
        {(status === "PENDING_CAREGIVER" || status === "CAREGIVER_APPROVED") && (
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
        {status === "COMPLETED" && (
          <View style={styles.actionsSection}>
            {appointmentData.feedback && appointmentData.feedback !== null ? (
              <View style={styles.reviewedButton}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.reviewedButtonText}>Đã đánh giá</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.reviewButton}
                onPress={() => setShowReviewModal(true)}
              >
                <Ionicons name="star" size={20} color="#FFFFFF" />
                <Text style={styles.reviewButtonText}>Đánh giá dịch vụ</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {/* Spacer for navbar */}
        {status === "COMPLETED" && (
          <View style={{ height: 120 }} />
        )}
      </ScrollView>

      {/* Image Modal for Check In/Out */}
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
          >
            <Ionicons name="close" size={32} color="#FFFFFF" />
          </TouchableOpacity>
          {selectedImageUrl && (
            <Image
              source={{ uri: selectedImageUrl }}
              style={styles.imageModalImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

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
        onRequestClose={() => {
          setShowReviewModal(false);
          // Reset form when closing
          setRating(0);
          setReviewComment("");
          setReviewImages([]);
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
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reviewModalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Đánh giá dịch vụ</Text>
                <TouchableOpacity onPress={() => {
                  setShowReviewModal(false);
                  // Reset form when closing
                  setRating(0);
                  setReviewComment("");
                  setReviewImages([]);
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
                }}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Caregiver Info */}
              <View style={styles.reviewCaregiverInfo}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewAvatarText}>
                    {appointmentData.caregiverProfile.fullName.charAt(0)}
                  </Text>
                </View>
                <View style={styles.reviewCaregiverDetails}>
                  <Text style={styles.reviewCaregiverName}>
                    {appointmentData.caregiverProfile.fullName}
                  </Text>
                  {appointmentData.caregiverProfile.bio && (
                    <Text style={styles.reviewCaregiverSpecialty}>
                      {appointmentData.caregiverProfile.bio}
                    </Text>
                  )}
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

              {/* Images Section */}
              <View style={styles.imagesSection}>
                <View style={styles.imagesSectionHeader}>
                  <Text style={styles.sectionTitle}>
                    Hình ảnh
                    <Text style={styles.optionalText}> (Tùy chọn, tối đa 5)</Text>
                  </Text>
                  <Text style={styles.imagesCount}>
                    {reviewImages.length}/5
                  </Text>
                </View>
                
                {/* Images Grid */}
                <View style={styles.imagesGrid}>
                  {reviewImages.map((uri, index) => (
                    <View key={index} style={styles.imageItem}>
                      <Image source={{ uri }} style={styles.reviewImage} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => handleRemoveImage(index)}
                      >
                        <Ionicons name="close-circle" size={24} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  
                  {reviewImages.length < 5 && (
                    <TouchableOpacity
                      style={styles.addImageButton}
                      onPress={handleImagePicker}
                    >
                      <Ionicons name="add" size={32} color="#68C2E8" />
                      <Text style={styles.addImageText}>Thêm ảnh</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitReviewButton, isSubmittingReview && styles.submitReviewButtonDisabled]}
                onPress={handleSubmitReview}
                disabled={isSubmittingReview}
              >
                {isSubmittingReview ? (
                  <Text style={styles.submitReviewButtonText}>Đang gửi...</Text>
                ) : (
                  <Text style={styles.submitReviewButtonText}>Gửi đánh giá</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Cancel Success Modal */}
      <Modal
        visible={showCancelSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelSuccessModal(false)}
      >
        <View style={styles.modalOverlayCenter}>
          <View style={styles.successModalContent}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={64} color="#10B981" />
            </View>
            <Text style={styles.successTitle}>Hủy lịch hẹn thành công</Text>
            <Text style={styles.successMessage}>
              Lịch hẹn đã được hủy thành công.
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                setShowCancelSuccessModal(false);
                router.back();
              }}
            >
              <Text style={styles.successButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Cancel Error Modal */}
      <Modal
        visible={showCancelErrorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelErrorModal(false)}
      >
        <View style={styles.modalOverlayCenter}>
          <View style={styles.errorModalContent}>
            <View style={styles.errorIconContainer}>
              <Ionicons name="close-circle" size={64} color="#EF4444" />
            </View>
            <Text style={styles.errorTitle}>Hủy lịch hẹn thất bại</Text>
            <Text style={styles.errorMessage}>{cancelErrorMessage}</Text>
            <TouchableOpacity
              style={styles.errorButton}
              onPress={() => setShowCancelErrorModal(false)}
            >
              <Text style={styles.errorButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Image Picker Modal for Review */}
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
              <Text style={styles.imagePickerModalTitle}>Chọn ảnh</Text>
              <TouchableOpacity onPress={() => setShowImagePickerModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text style={styles.imagePickerModalSubtitle}>
              Chọn nguồn ảnh
            </Text>

            <View style={styles.imagePickerOptionsContainer}>
              <TouchableOpacity style={styles.imagePickerOption} onPress={handleTakePhoto}>
                <View style={styles.imagePickerOptionIcon}>
                  <Ionicons name="camera" size={32} color="#68C2E8" />
                </View>
                <Text style={styles.imagePickerOptionText}>Chụp ảnh</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imagePickerOption} onPress={handlePickFromLibrary}>
                <View style={styles.imagePickerOptionIcon}>
                  <Ionicons name="images" size={32} color="#68C2E8" />
                </View>
                <Text style={styles.imagePickerOptionText}>Thư viện</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.imagePickerCancelButton}
              onPress={() => setShowImagePickerModal(false)}
            >
              <Text style={styles.imagePickerCancelButtonText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Feedback Image Viewer Modal */}
      <Modal
        visible={selectedFeedbackImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedFeedbackImage(null)}
      >
        <View style={styles.imageModalOverlay}>
          <TouchableOpacity
            style={styles.imageModalCloseButton}
            onPress={() => setSelectedFeedbackImage(null)}
          >
            <Ionicons name="close" size={32} color="#FFFFFF" />
          </TouchableOpacity>
          {selectedFeedbackImage && (
            <Image
              source={{ uri: selectedFeedbackImage }}
              style={styles.imageModalImage}
              resizeMode="contain"
            />
          )}
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
  deadlineCard: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FCD34D",
  },
  deadlineHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  deadlineTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#92400E",
  },
  deadlineMessage: {
    fontSize: 14,
    color: "#78350F",
    lineHeight: 20,
  },
  deadlineMinutes: {
    fontWeight: "700",
    color: "#B45309",
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
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  caregiverInfo: {
    flex: 1,
  },
  caregiverNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  caregiverNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    flex: 1,
  },
  caregiverName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#12394A",
  },
  verifiedLabel: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#065F46",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
  healthStatusLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  healthStatusValue: {
    fontSize: 14,
    color: "#12394A",
    fontWeight: "600",
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
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#E0F2FE",
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  mapButtonText: {
    fontSize: 14,
    color: "#68C2E8",
    fontWeight: "600",
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
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
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
  reviewedButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D1FAE5",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#10B981",
  },
  reviewedButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#065F46",
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
  imagesSection: {
    marginBottom: 24,
  },
  imagesSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  imagesCount: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
  },
  imagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  imageItem: {
    width: 100,
    height: 100,
    borderRadius: 12,
    position: "relative",
    overflow: "hidden",
  },
  reviewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#68C2E8",
    borderStyle: "dashed",
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  addImageText: {
    fontSize: 12,
    color: "#68C2E8",
    fontWeight: "600",
  },
  imagePickerModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePickerModalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "85%",
    maxWidth: 400,
  },
  imagePickerModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  imagePickerModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C3E50",
  },
  imagePickerModalSubtitle: {
    fontSize: 14,
    color: "#7F8C8D",
    marginBottom: 24,
  },
  imagePickerOptionsContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  imagePickerOption: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E8EBED",
  },
  imagePickerOptionIcon: {
    marginBottom: 12,
  },
  imagePickerOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
  },
  imagePickerCancelButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
  },
  imagePickerCancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7F8C8D",
  },
  submitReviewButton: {
    backgroundColor: "#68C2E8",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  submitReviewButtonDisabled: {
    opacity: 0.6,
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
  // Check In/Out styles
  checkInOutSection: {
    marginTop: 8,
  },
  checkInOutTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  checkInOutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  checkInOutItem: {
    flex: 1,
    marginBottom: 8,
  },
  checkInOutHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  checkInOutLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 6,
  },
  checkInOutContent: {
    alignItems: "center",
  },
  checkInOutImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: "#F3F4F6",
  },
  checkInOutTime: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  checkInOutPlaceholder: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
    paddingVertical: 8,
    textAlign: "center",
  },
  // Tab styles
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: "#10B981",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  tabTextActive: {
    color: "#fff",
  },
  // Task styles
  taskSection: {
    marginBottom: 24,
  },
  taskSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  taskSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 8,
    flex: 1,
  },
  taskBadge: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  taskSectionDesc: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 12,
    marginLeft: 28,
  },
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  taskCardCompletedGreen: {
    backgroundColor: "#D1FAE5",
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  taskCardNotCompletedRed: {
    backgroundColor: "#FEE2E2",
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  taskLeft: {
    flexDirection: "row",
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  checkboxCompletedGreen: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  checkboxNotCompletedRed: {
    backgroundColor: "#EF4444",
    borderColor: "#EF4444",
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  taskTitleCompletedGreen: {
    color: "#059669",
    fontWeight: "700",
  },
  taskTitleNotCompletedRed: {
    color: "#DC2626",
    fontWeight: "700",
  },
  taskDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  taskDescriptionCompletedGreen: {
    color: "#047857",
  },
  taskDescriptionNotCompletedRed: {
    color: "#B91C1C",
  },
  // Note styles
  noteCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  noteAuthor: {
    flexDirection: "row",
    alignItems: "center",
  },
  noteAuthorText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
    marginLeft: 6,
  },
  noteTime: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  // Image Modal styles
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
  },
  imageModalImage: {
    width: "90%",
    height: "80%",
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
  disabledButton: {
    opacity: 0.6,
  },
  // Success Modal Styles
  successModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    width: "85%",
    maxWidth: 400,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#12394A",
    marginBottom: 12,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  successButton: {
    backgroundColor: "#10B981",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  successButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  // Error Modal Styles
  errorModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    width: "85%",
    maxWidth: 400,
  },
  errorIconContainer: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#12394A",
    marginBottom: 12,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  errorButton: {
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  errorButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  // Feedback styles
  feedbackOverallRating: {
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: "#FFFBF0",
    borderRadius: 12,
    marginBottom: 16,
  },
  feedbackOverallRatingLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
  },
  feedbackStarsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  feedbackRatingText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#12394A",
    marginLeft: 8,
  },
  feedbackDetailedRatings: {
    marginBottom: 16,
  },
  feedbackDetailedRatingsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#12394A",
    marginBottom: 12,
  },
  feedbackDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    marginBottom: 8,
  },
  feedbackDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  feedbackDetailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#12394A",
  },
  feedbackDetailStars: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  feedbackDetailRatingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#12394A",
    marginLeft: 6,
  },
  feedbackComment: {
    marginBottom: 16,
  },
  feedbackCommentLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#12394A",
    marginBottom: 8,
  },
  feedbackCommentText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  feedbackTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  feedbackTimeText: {
    fontSize: 12,
    color: "#6B7280",
  },
  feedbackImages: {
    marginBottom: 16,
  },
  feedbackImagesLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#12394A",
    marginBottom: 12,
  },
  feedbackImagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  feedbackImageItem: {
    width: (Dimensions.get('window').width - 40 - 32 - 24) / 3, // 3 images per row: (screen width - section padding - card padding - gaps) / 3
    height: (Dimensions.get('window').width - 40 - 32 - 24) / 3,
    borderRadius: 12,
    overflow: "hidden",
  },
  feedbackImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
});

