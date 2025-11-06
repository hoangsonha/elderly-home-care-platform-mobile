import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { getComplaintFeedback, markComplaintFeedbackSubmitted } from "@/data/appointmentStore";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Star Rating Component
interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  maxStars?: number;
}

const StarRating: React.FC<StarRatingProps & { disabled?: boolean }> = ({
  rating,
  onRatingChange,
  maxStars = 5,
  disabled = false,
}) => {
  return (
    <View style={styles.starContainer}>
      {Array.from({ length: maxStars }, (_, index) => {
        const starValue = index + 1;
        return (
          <TouchableOpacity
            key={index}
            onPress={() => !disabled && onRatingChange(starValue)}
            activeOpacity={disabled ? 1 : 0.7}
            style={styles.starButton}
            disabled={disabled}
          >
            <MaterialCommunityIcons
              name={starValue <= rating ? "star" : "star-outline"}
              size={32}
              color={starValue <= rating ? "#FCD34D" : "#D1D5DB"}
            />
          </TouchableOpacity>
        );
      })}
      {rating > 0 && (
        <Text style={styles.ratingText}>{rating} / {maxStars}</Text>
      )}
    </View>
  );
};

interface ComplaintFeedbackData {
  complaintType: string;
  responseSpeed: number;
  resolutionTime: string;
  professionalism: number;
  clarity: number;
  resolutionQuality: number;
  fairness: string;
  followUp: string;
  overallSatisfaction: number;
  experienceDetails: string;
  improvementSuggestions: string;
}

export default function ComplaintFeedbackScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as {
    appointmentId?: string;
    complaintId?: string;
    fromScreen?: string;
    viewMode?: boolean;
  } | undefined;

  const viewMode = params?.viewMode || false;
  
  // Load existing feedback if in view mode
  const existingFeedback = params?.appointmentId ? getComplaintFeedback(params.appointmentId) : null;

  const [feedbackData, setFeedbackData] = useState<ComplaintFeedbackData>(
    viewMode && existingFeedback ? existingFeedback : {
      complaintType: "",
      responseSpeed: 0,
      resolutionTime: "",
      professionalism: 0,
      clarity: 0,
      resolutionQuality: 0,
      fairness: "",
      followUp: "",
      overallSatisfaction: 0,
      experienceDetails: "",
      improvementSuggestions: "",
    }
  );

  const complaintTypes = [
    "Vấn đề thanh toán/hoa hồng",
    "Hành vi không phù hợp từ khách hàng",
    "Vấn đề an toàn/bảo mật",
    "Lỗi kỹ thuật hệ thống",
    "Khác",
  ];

  const resolutionTimeOptions = [
    "Trong ngày - Dưới 24 giờ",
    "1-3 ngày làm việc",
    "4-7 ngày làm việc",
    "Hơn 1 tuần",
    "Chưa được giải quyết",
  ];

  const fairnessOptions = [
    "Rất công bằng - Lắng nghe và cân nhắc đầy đủ",
    "Công bằng - Xem xét hai phía",
    "Trung lập - Không rõ ràng",
    "Không công bằng - Thiên vị một phía",
  ];

  const followUpOptions = [
    "Xuất sắc - Nhiều lần kiểm tra và hỏi thăm",
    "Tốt - Có kiểm tra một lần",
    "Tối thiểu - Gửi email tự động",
    "Không có - Không theo dõi gì cả",
  ];

  const handleBack = () => {
    if (params?.fromScreen) {
      switch (params.fromScreen) {
        case "complaint":
          // Navigate về complaint với appointmentId và bookingId
          if (params.appointmentId) {
            navigation.navigate("Complaint", {
              bookingId: params.appointmentId,
              viewMode: true,
              fromScreen: params.fromScreen,
            });
          } else {
            navigation.goBack();
          }
          break;
        default:
          navigation.goBack();
      }
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = () => {
    // Validation
    if (!feedbackData.complaintType) {
      Alert.alert("Lỗi", "Vui lòng chọn loại khiếu nại");
      return;
    }

    if (feedbackData.responseSpeed === 0) {
      Alert.alert("Lỗi", "Vui lòng đánh giá tốc độ phản hồi");
      return;
    }

    if (!feedbackData.resolutionTime) {
      Alert.alert("Lỗi", "Vui lòng chọn thời gian giải quyết");
      return;
    }

    if (feedbackData.professionalism === 0) {
      Alert.alert("Lỗi", "Vui lòng đánh giá tính chuyên nghiệp");
      return;
    }

    if (feedbackData.clarity === 0) {
      Alert.alert("Lỗi", "Vui lòng đánh giá tính rõ ràng trong giao tiếp");
      return;
    }

    if (feedbackData.resolutionQuality === 0) {
      Alert.alert("Lỗi", "Vui lòng đánh giá chất lượng giải quyết");
      return;
    }

    if (!feedbackData.fairness) {
      Alert.alert("Lỗi", "Vui lòng đánh giá tính công bằng");
      return;
    }

    if (!feedbackData.followUp) {
      Alert.alert("Lỗi", "Vui lòng đánh giá theo dõi sau xử lý");
      return;
    }

    if (feedbackData.overallSatisfaction === 0) {
      Alert.alert("Lỗi", "Vui lòng đánh giá mức độ hài lòng tổng thể");
      return;
    }

    Alert.alert(
      "Xác nhận gửi đánh giá",
      "Bạn có chắc chắn muốn gửi đánh giá này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Gửi đánh giá",
          onPress: () => {
            // TODO: Call API to submit feedback
            console.log("Complaint feedback data:", feedbackData);
            
            // Lưu feedback vào store
            if (params?.appointmentId) {
              markComplaintFeedbackSubmitted(params.appointmentId, {
                ...feedbackData,
                submittedAt: new Date().toISOString(),
              });
            }
            
            Alert.alert(
              "Thành công",
              "Cảm ơn bạn đã đánh giá! Đánh giá của bạn sẽ giúp chúng tôi cải thiện dịch vụ.",
              [
                {
                  text: "OK",
                  onPress: () => {
                    // Navigate về trang complaint với viewMode
                    if (params?.appointmentId) {
                      navigation.navigate("Complaint", {
                        bookingId: params.appointmentId,
                        viewMode: true,
                        fromScreen: "complaint-feedback",
                      });
                    } else {
                      handleBack();
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons name="shield-check" size={48} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Đánh giá Quy trình Khiếu nại</Text>
          <Text style={styles.headerSubtitle}>
            Chia sẻ trải nghiệm của bạn về cách hệ thống xử lý và giải quyết khiếu nại
          </Text>
        </View>

        {/* Complaint Type Selection */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Loại khiếu nại</Text>
          <Text style={styles.cardQuestion}>
            Khiếu nại của bạn thuộc nhóm nào?
          </Text>
          <View style={styles.radioGroup}>
            {complaintTypes.map((type, index) => (
              <TouchableOpacity
                key={index}
                style={styles.radioOption}
                onPress={() => !viewMode && setFeedbackData({ ...feedbackData, complaintType: type })}
                disabled={viewMode}
                activeOpacity={viewMode ? 1 : 0.7}
              >
                <View
                  style={[
                    styles.radioButton,
                    feedbackData.complaintType === type && styles.radioButtonSelected,
                    viewMode && styles.radioButtonDisabled,
                  ]}
                >
                  {feedbackData.complaintType === type && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text style={[styles.radioLabel, viewMode && styles.disabledText]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Response Speed */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: "#DBEAFE" }]}>
              <Ionicons name="time-outline" size={24} color="#2563EB" />
            </View>
            <Text style={styles.cardTitle}>Tốc độ phản hồi</Text>
          </View>
          <Text style={styles.cardQuestion}>
            Đội ngũ hỗ trợ phản hồi khiếu nại của bạn nhanh như thế nào?
          </Text>
          <StarRating
            rating={feedbackData.responseSpeed}
            onRatingChange={(rating) =>
              setFeedbackData({ ...feedbackData, responseSpeed: rating })
            }
            disabled={viewMode}
          />
          <View style={styles.ratingLabels}>
            <Text style={styles.ratingLabelLeft}>Rất chậm</Text>
            <Text style={styles.ratingLabelRight}>Rất nhanh</Text>
          </View>
        </View>

        {/* Resolution Time */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thời gian giải quyết</Text>
          <Text style={styles.cardQuestion}>
            Khiếu nại của bạn được giải quyết trong bao lâu?
          </Text>
          <View style={styles.radioGroup}>
            {resolutionTimeOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.radioOption}
                onPress={() => !viewMode && setFeedbackData({ ...feedbackData, resolutionTime: option })}
                disabled={viewMode}
                activeOpacity={viewMode ? 1 : 0.7}
              >
                <View
                  style={[
                    styles.radioButton,
                    feedbackData.resolutionTime === option && styles.radioButtonSelected,
                    viewMode && styles.radioButtonDisabled,
                  ]}
                >
                  {feedbackData.resolutionTime === option && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text style={[styles.radioLabel, viewMode && styles.disabledText]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Professionalism */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: "#D1FAE5" }]}>
              <MaterialCommunityIcons name="shield-check" size={24} color="#10B981" />
            </View>
            <Text style={styles.cardTitle}>Tính chuyên nghiệp</Text>
          </View>
          <Text style={styles.cardQuestion}>
            Đội ngũ xử lý khiếu nại có thái độ chuyên nghiệp không?
          </Text>
          <StarRating
            rating={feedbackData.professionalism}
            onRatingChange={(rating) =>
              setFeedbackData({ ...feedbackData, professionalism: rating })
            }
            disabled={viewMode}
          />
          <View style={styles.ratingLabels}>
            <Text style={styles.ratingLabelLeft}>Thiếu chuyên nghiệp</Text>
            <Text style={styles.ratingLabelRight}>Rất chuyên nghiệp</Text>
          </View>
        </View>

        {/* Clarity */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="chatbubble-outline" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.cardTitle}>Tính rõ ràng trong giao tiếp</Text>
          </View>
          <Text style={styles.cardQuestion}>
            Thông tin và giải thích có rõ ràng, dễ hiểu không?
          </Text>
          <StarRating
            rating={feedbackData.clarity}
            onRatingChange={(rating) =>
              setFeedbackData({ ...feedbackData, clarity: rating })
            }
            disabled={viewMode}
          />
          <View style={styles.ratingLabels}>
            <Text style={styles.ratingLabelLeft}>Khó hiểu</Text>
            <Text style={styles.ratingLabelRight}>Rất rõ ràng</Text>
          </View>
        </View>

        {/* Resolution Quality */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: "#DBEAFE" }]}>
              <MaterialCommunityIcons name="check-circle" size={24} color="#2563EB" />
            </View>
            <Text style={styles.cardTitle}>Chất lượng giải quyết</Text>
          </View>
          <Text style={styles.cardQuestion}>
            Giải pháp đưa ra có giải quyết được vấn đề của bạn không?
          </Text>
          <StarRating
            rating={feedbackData.resolutionQuality}
            onRatingChange={(rating) =>
              setFeedbackData({ ...feedbackData, resolutionQuality: rating })
            }
            disabled={viewMode}
          />
          <View style={styles.ratingLabels}>
            <Text style={styles.ratingLabelLeft}>Không giải quyết được</Text>
            <Text style={styles.ratingLabelRight}>Giải quyết hoàn toàn</Text>
          </View>
        </View>

        {/* Fairness */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tính công bằng</Text>
          <Text style={styles.cardQuestion}>
            Bạn cảm thấy được đối xử công bằng trong quá trình xử lý không?
          </Text>
          <View style={styles.radioGroup}>
            {fairnessOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.radioOption}
                onPress={() => !viewMode && setFeedbackData({ ...feedbackData, fairness: option })}
                disabled={viewMode}
                activeOpacity={viewMode ? 1 : 0.7}
              >
                <View
                  style={[
                    styles.radioButton,
                    feedbackData.fairness === option && styles.radioButtonSelected,
                    viewMode && styles.radioButtonDisabled,
                  ]}
                >
                  {feedbackData.fairness === option && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text style={[styles.radioLabel, viewMode && styles.disabledText]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Follow-up */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Theo dõi sau xử lý</Text>
          <Text style={styles.cardQuestion}>
            Sau khi giải quyết, có ai theo dõi để đảm bảo vấn đề được khắc phục không?
          </Text>
          <View style={styles.radioGroup}>
            {followUpOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.radioOption}
                onPress={() => !viewMode && setFeedbackData({ ...feedbackData, followUp: option })}
                disabled={viewMode}
                activeOpacity={viewMode ? 1 : 0.7}
              >
                <View
                  style={[
                    styles.radioButton,
                    feedbackData.followUp === option && styles.radioButtonSelected,
                    viewMode && styles.radioButtonDisabled,
                  ]}
                >
                  {feedbackData.followUp === option && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text style={[styles.radioLabel, viewMode && styles.disabledText]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Overall Satisfaction */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: "#D1FAE5" }]}>
              <MaterialCommunityIcons name="check-circle" size={24} color="#10B981" />
            </View>
            <Text style={styles.cardTitle}>Mức độ hài lòng tổng thể</Text>
          </View>
          <Text style={styles.cardQuestion}>
            Đánh giá chung về toàn bộ quy trình xử lý khiếu nại
          </Text>
          <StarRating
            rating={feedbackData.overallSatisfaction}
            onRatingChange={(rating) =>
              setFeedbackData({ ...feedbackData, overallSatisfaction: rating })
            }
            disabled={viewMode}
          />
          <View style={styles.ratingLabels}>
            <Text style={styles.ratingLabelLeft}>Rất không hài lòng</Text>
            <Text style={styles.ratingLabelRight}>Rất hài lòng</Text>
          </View>
        </View>

        {/* Experience Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Chi tiết trải nghiệm</Text>
          <Text style={styles.cardQuestion}>
            Mô tả chi tiết về trải nghiệm của bạn trong quá trình khiếu nại
          </Text>
          <TextInput
            style={[styles.textArea, viewMode && styles.textAreaReadOnly]}
            placeholder="Chia sẻ những điểm tốt, điểm chưa tốt, hoặc bất kỳ chi tiết nào bạn muốn thêm..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={feedbackData.experienceDetails}
            onChangeText={(text) =>
              !viewMode && setFeedbackData({ ...feedbackData, experienceDetails: text })
            }
            maxLength={1000}
            editable={!viewMode}
          />
          <Text style={styles.charCount}>
            {feedbackData.experienceDetails.length}/1000 ký tự
          </Text>
        </View>

        {/* Improvement Suggestions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Đề xuất cải thiện</Text>
          <Text style={styles.cardQuestion}>
            Quy trình xử lý khiếu nại có thể được cải thiện như thế nào?
          </Text>
          <TextInput
            style={[styles.textArea, viewMode && styles.textAreaReadOnly]}
            placeholder="Đề xuất cách cải thiện quy trình, công cụ, hoặc cách giao tiếp..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={feedbackData.improvementSuggestions}
            onChangeText={(text) =>
              !viewMode && setFeedbackData({ ...feedbackData, improvementSuggestions: text })
            }
            maxLength={1000}
            editable={!viewMode}
          />
          <Text style={styles.charCount}>
            {feedbackData.improvementSuggestions.length}/1000 ký tự
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action */}
      {!viewMode && (
        <View style={styles.bottomAction}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleBack}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <MaterialCommunityIcons name="send" size={20} color="#fff" />
            <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Navigation */}
      <CaregiverBottomNav activeTab="jobs" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    flex: 1,
  },
  cardQuestion: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
    lineHeight: 20,
  },
  radioGroup: {
    gap: 12,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioButtonSelected: {
    borderColor: "#2563EB",
  },
  radioButtonDisabled: {
    opacity: 0.6,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2563EB",
  },
  radioLabel: {
    fontSize: 14,
    color: "#1F2937",
    flex: 1,
  },
  disabledText: {
    color: "#9CA3AF",
  },
  starContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 8,
  },
  ratingLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  ratingLabelLeft: {
    fontSize: 12,
    color: "#6B7280",
  },
  ratingLabelRight: {
    fontSize: 12,
    color: "#6B7280",
  },
  textArea: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#1F2937",
    minHeight: 120,
    textAlignVertical: "top",
  },
  textAreaReadOnly: {
    backgroundColor: "#F3F4F6",
    color: "#6B7280",
    opacity: 0.8,
  },
  charCount: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "right",
    marginTop: 4,
  },
  bottomAction: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
    marginBottom: 90,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
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
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});

