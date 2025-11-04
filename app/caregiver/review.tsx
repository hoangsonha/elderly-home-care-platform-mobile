import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { markAppointmentAsReviewed, ReviewData as ReviewDataType } from "@/data/appointmentStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import {
    Alert,
    Platform,
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

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  maxStars = 5,
}) => {
  return (
    <View style={styles.starContainer}>
      {Array.from({ length: maxStars }, (_, index) => {
        const starValue = index + 1;
        return (
          <TouchableOpacity
            key={index}
            onPress={() => onRatingChange(starValue)}
            activeOpacity={0.7}
            style={styles.starButton}
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

interface ReviewData {
  cooperation: number; // Mức độ hợp tác
  communication: number; // Chất lượng giao tiếp
  respect: number; // Thái độ tôn trọng
  readiness: number; // Tính sẵn sàng
  workingEnvironment: number; // Môi trường làm việc
  familySupport: string; // Sự hỗ trợ từ gia đình
  issues: string[]; // Các vấn đề cần lưu ý
  recommendation: string; // Mức độ giới thiệu
  additionalNotes: string; // Ghi chú bổ sung
}

export default function ReviewScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as { appointmentId?: string; elderlyName?: string; fromScreen?: string } | undefined;
  const appointmentId = params?.appointmentId || "";
  const elderlyName = params?.elderlyName || "Người được chăm sóc";
  const fromScreen = params?.fromScreen;

  // Handle navigation back based on fromScreen
  const handleNavigateBack = () => {
    if (fromScreen) {
      switch (fromScreen) {
        case "booking":
          (navigation.navigate as any)("Yêu cầu dịch vụ");
          break;
        case "appointment-detail":
          navigation.goBack();
          break;
        default:
          navigation.goBack();
      }
    } else {
      navigation.goBack();
    }
  };

  const [reviewData, setReviewData] = useState<ReviewData>({
    cooperation: 0,
    communication: 0,
    respect: 0,
    readiness: 0,
    workingEnvironment: 0,
    familySupport: "",
    issues: [],
    recommendation: "",
    additionalNotes: "",
  });

  const familySupportOptions = [
    {
      value: "very-good",
      label: "Rất tốt",
      description: "Gia đình luôn hỗ trợ và phối hợp tích cực",
    },
    {
      value: "good",
      label: "Tốt",
      description: "Gia đình phối hợp khi cần thiết",
    },
    {
      value: "average",
      label: "Trung bình",
      description: "Ít hỗ trợ nhưng không gây trở ngại",
    },
    {
      value: "poor",
      label: "Kém",
      description: "Thiếu sự quan tâm và hỗ trợ",
    },
    {
      value: "difficult",
      label: "Khó khăn",
      description: "Gia đình can thiệp tiêu cực hoặc gây khó khăn",
    },
  ];

  const issuesOptions = [
    {
      id: "mobility",
      label: "Các vấn đề về di chuyển cần được chú ý đặc biệt",
    },
    {
      id: "memory",
      label: "Các thách thức về trí nhớ/nhận thức",
    },
    {
      id: "medication",
      label: "Các lo ngại về tuân thủ thuốc",
    },
    {
      id: "dietary",
      label: "Tuân thủ các hạn chế về chế độ ăn uống",
    },
    {
      id: "communication",
      label: "Khó khăn trong giao tiếp",
    },
    {
      id: "safety",
      label: "Các mối nguy hiểm về an toàn trong môi trường gia đình",
    },
  ];

  const recommendationOptions = [
    {
      value: "highly-recommend",
      label: "Rất muốn giới thiệu",
      description: "Khách hàng lý tưởng, dễ chăm sóc",
    },
    {
      value: "can-recommend",
      label: "Có thể giới thiệu",
      description: "Khách hàng tốt với một số lưu ý nhỏ",
    },
    {
      value: "neutral",
      label: "Trung lập",
      description: "Tùy thuộc vào người chăm sóc",
    },
    {
      value: "not-recommend",
      label: "Không giới thiệu",
      description: "Có nhiều khó khăn",
    },
  ];

  const handleRatingChange = (key: keyof ReviewData, value: number) => {
    setReviewData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFamilySupportChange = (value: string) => {
    setReviewData((prev) => ({ ...prev, familySupport: value }));
  };

  const handleIssueToggle = (issueId: string) => {
    setReviewData((prev) => {
      const issues = [...prev.issues];
      const index = issues.indexOf(issueId);
      if (index > -1) {
        issues.splice(index, 1);
      } else {
        issues.push(issueId);
      }
      return { ...prev, issues };
    });
  };

  const handleRecommendationChange = (value: string) => {
    setReviewData((prev) => ({ ...prev, recommendation: value }));
  };

  const handleSubmit = () => {
    // Validate required fields
    if (reviewData.cooperation === 0) {
      Alert.alert("Thiếu thông tin", "Vui lòng đánh giá mức độ hợp tác");
      return;
    }

    if (reviewData.communication === 0) {
      Alert.alert("Thiếu thông tin", "Vui lòng đánh giá chất lượng giao tiếp");
      return;
    }

    if (reviewData.respect === 0) {
      Alert.alert("Thiếu thông tin", "Vui lòng đánh giá thái độ tôn trọng");
      return;
    }

    if (reviewData.readiness === 0) {
      Alert.alert("Thiếu thông tin", "Vui lòng đánh giá tính sẵn sàng");
      return;
    }

    if (reviewData.workingEnvironment === 0) {
      Alert.alert("Thiếu thông tin", "Vui lòng đánh giá môi trường làm việc");
      return;
    }

    if (!reviewData.familySupport) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn mức độ hỗ trợ từ gia đình");
      return;
    }

    if (!reviewData.recommendation) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn mức độ giới thiệu");
      return;
    }

    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn gửi đánh giá này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Gửi đánh giá",
          onPress: () => {
            // TODO: Gửi đánh giá lên server ở đây
            // Tạm thời chỉ lưu local
            console.log("Review data:", reviewData);
            
            // Mark appointment as reviewed BEFORE showing success alert
            if (appointmentId) {
              const reviewDataToSave: ReviewDataType = {
                ...reviewData,
                submittedAt: new Date().toISOString(),
              };
              markAppointmentAsReviewed(appointmentId, reviewDataToSave);
            }
            
            Alert.alert("Thành công", "Đánh giá đã được gửi thành công", [
              {
                text: "OK",
                onPress: () => {
                  // Navigate back to the previous screen
                  handleNavigateBack();
                },
              },
            ]);
          },
        },
      ]
    );
  };

  const renderStarRating = (
    title: string,
    description: string,
    value: number,
    onChange: (value: number) => void,
    icon: string,
    iconColor: string
  ) => {
    return (
      <View style={styles.ratingCard}>
        <View style={styles.ratingHeader}>
          <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
            <MaterialCommunityIcons name={icon as any} size={20} color="#fff" />
          </View>
          <Text style={styles.ratingTitle}>{title}</Text>
        </View>
        <Text style={styles.ratingDescription}>{description}</Text>
        <View style={styles.ratingWrapper}>
          <StarRating rating={value} onRatingChange={onChange} maxStars={5} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIconContainer}>
            <View style={styles.headerIcon}>
              <MaterialCommunityIcons name="heart-outline" size={32} color="#10B981" />
            </View>
          </View>
          <Text style={styles.headerTitle}>Đánh giá Dịch vụ Chăm sóc</Text>
          <Text style={styles.headerSubtitle}>
            Chia sẻ trải nghiệm của bạn với khách hàng/người cần chăm sóc để giúp cải thiện chất lượng dịch vụ
          </Text>
        </View>

        {/* Rating 1: Mức độ hợp tác */}
        {renderStarRating(
          "Mức độ hợp tác",
          "Đánh giá mức độ hợp tác và tuân thủ kế hoạch chăm sóc của người được chăm sóc",
          reviewData.cooperation,
          (value) => handleRatingChange("cooperation", value),
          "trending-up",
          "#3B82F6"
        )}

        {/* Rating 2: Chất lượng giao tiếp */}
        {renderStarRating(
          "Chất lượng giao tiếp",
          "Khả năng giao tiếp và diễn đạt nhu cầu của người được chăm sóc",
          reviewData.communication,
          (value) => handleRatingChange("communication", value),
          "message-text-outline",
          "#10B981"
        )}

        {/* Rating 3: Thái độ tôn trọng */}
        {renderStarRating(
          "Thái độ tôn trọng",
          "Thái độ tôn trọng và đối xử với người chăm sóc",
          reviewData.respect,
          (value) => handleRatingChange("respect", value),
          "heart",
          "#F97316"
        )}

        {/* Rating 4: Tính sẵn sàng */}
        {renderStarRating(
          "Tính sẵn sàng",
          "Sẵn sàng theo lịch trình và không hủy/thay đổi đột ngột",
          reviewData.readiness,
          (value) => handleRatingChange("readiness", value),
          "clock-outline",
          "#3B82F6"
        )}

        {/* Rating 5: Môi trường làm việc */}
        {renderStarRating(
          "Môi trường làm việc",
          "Điều kiện và môi trường tại nhà của người được chăm sóc",
          reviewData.workingEnvironment,
          (value) => handleRatingChange("workingEnvironment", value),
          "home",
          "#10B981"
        )}

        {/* Family Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sự hỗ trợ từ gia đình</Text>
          <Text style={styles.sectionDescription}>
            Đánh giá mức độ hỗ trợ và phối hợp từ gia đình người được chăm sóc
          </Text>
          <View style={styles.radioCard}>
            {familySupportOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.radioOption}
                onPress={() => handleFamilySupportChange(option.value)}
              >
                <View style={styles.radioButton}>
                  {reviewData.familySupport === option.value && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <View style={styles.radioContent}>
                  <Text style={styles.radioLabel}>{option.label}</Text>
                  <Text style={styles.radioDescription}>{option.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Issues Section */}
        <View style={styles.section}>
          <View style={styles.issuesHeader}>
            <View style={styles.issuesIcon}>
              <MaterialCommunityIcons name="alert-circle" size={20} color="#EF4444" />
            </View>
            <Text style={styles.sectionTitle}>Các vấn đề cần lưu ý</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Chọn các vấn đề mà bạn cho rằng cần được quan tâm đặc biệt (có thể chọn nhiều)
          </Text>
          <View style={styles.checkboxCard}>
            {issuesOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.checkboxOption}
                onPress={() => handleIssueToggle(option.id)}
              >
                <View style={styles.checkbox}>
                  {reviewData.issues.includes(option.id) && (
                    <MaterialCommunityIcons name="check" size={16} color="#10B981" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recommendation Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mức độ giới thiệu</Text>
          <Text style={styles.sectionDescription}>
            Bạn có sẵn sàng tiếp tục làm việc hoặc giới thiệu khách hàng này cho đồng nghiệp không?
          </Text>
          <View style={styles.radioCard}>
            {recommendationOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.radioOption}
                onPress={() => handleRecommendationChange(option.value)}
              >
                <View style={styles.radioButton}>
                  {reviewData.recommendation === option.value && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <View style={styles.radioContent}>
                  <Text style={styles.radioLabel}>{option.label}</Text>
                  <Text style={styles.radioDescription}>{option.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Additional Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ghi chú bổ sung</Text>
          <Text style={styles.sectionDescription}>
            Chia sẻ thêm bất kỳ thông tin nào bạn cho là hữu ích cho các caregiver khác
          </Text>
          <View style={styles.textAreaCard}>
            <TextInput
              style={styles.textArea}
              placeholder="Ví dụ: Điểm mạnh/yếu đặc biệt, các tình huống cần lưu ý, khuyến nghị cho đồng nghiệp..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={reviewData.additionalNotes}
              onChangeText={(text) =>
                setReviewData((prev) => ({ ...prev, additionalNotes: text }))
              }
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <CaregiverBottomNav activeTab="jobs" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? 18 : 8,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  headerIconContainer: {
    marginBottom: 16,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E0F2FE",
    borderWidth: 2,
    borderColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
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
    paddingHorizontal: 8,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
    lineHeight: 20,
  },
  ratingCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  ratingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  ratingDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 16,
    lineHeight: 18,
  },
  ratingWrapper: {
    marginTop: 8,
    alignItems: "center",
  },
  starContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  starButton: {
    marginHorizontal: 4,
    padding: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginLeft: 12,
  },
  radioCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10B981",
  },
  radioContent: {
    flex: 1,
  },
  radioLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  radioDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  issuesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  issuesIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  checkboxOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#1F2937",
    flex: 1,
    lineHeight: 20,
  },
  textAreaCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  textArea: {
    fontSize: 14,
    color: "#1F2937",
    minHeight: 120,
    textAlignVertical: "top",
  },
  submitButton: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});

