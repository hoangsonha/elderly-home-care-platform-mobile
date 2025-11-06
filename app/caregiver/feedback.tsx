import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
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

interface FeedbackData {
  usageFrequency: string;
  mainDevice: string;
  easeOfUse: number;
  performance: number;
  reliability: number;
  interfaceDesign: number;
  supportQuality: number;
  usefulFeatures: string[];
  missingFeatures: string;
  annoyingPoints: string;
  positiveExperience: string;
  recommendationLevel: string;
  specificFeatureRequest: string;
}

export default function FeedbackScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as { fromScreen?: string } | undefined;
  
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    usageFrequency: "",
    mainDevice: "",
    easeOfUse: 0,
    performance: 0,
    reliability: 0,
    interfaceDesign: 0,
    supportQuality: 0,
    usefulFeatures: [],
    missingFeatures: "",
    annoyingPoints: "",
    positiveExperience: "",
    recommendationLevel: "",
    specificFeatureRequest: "",
  });

  const usageFrequencyOptions = [
    "Hàng ngày - Nhiều lần mỗi ngày",
    "Nhiều lần/tuần - 3-6 lần/tuần",
    "Hàng tuần - 1-2 lần/tuần",
    "Hàng tháng - Vài lần/tháng",
    "Hiếm khi - Ít hơn 1 lần/tháng",
  ];

  const mainDeviceOptions = [
    "Điện thoại iOS (iPhone)",
    "Điện thoại Android",
    "Máy tính bảng (iPad/Android Tablet)",
    "Máy tính (Desktop/Laptop)",
  ];

  const usefulFeaturesOptions = [
    "Lịch làm việc và quản lý ca",
    "Hệ thống video giám sát",
    "Tính năng thanh toán",
    "Hồ sơ và thông tin khách hàng",
    "Hệ thống đánh giá",
    "Chat và nhắn tin",
    "Thông báo và nhắc nhở",
    "Báo cáo và thống kê",
  ];

  const recommendationOptions = [
    "Chắc chắn - Tôi đã giới thiệu hoặc sẽ giới thiệu",
    "Có thể - Nếu có người hỏi",
    "Trung lập - Chưa chắc chắn",
    "Không chắc - Cần cải thiện nhiều",
    "Không - Không hài lòng với hệ thống",
  ];

  const toggleUsefulFeature = (feature: string) => {
    setFeedbackData((prev) => ({
      ...prev,
      usefulFeatures: prev.usefulFeatures.includes(feature)
        ? prev.usefulFeatures.filter((f) => f !== feature)
        : [...prev.usefulFeatures, feature],
    }));
  };

  const handleSubmit = () => {
    // Validation
    if (!feedbackData.usageFrequency || !feedbackData.mainDevice) {
      Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ các thông tin bắt buộc");
      return;
    }

    Alert.alert(
      "Xác nhận gửi góp ý",
      "Bạn có chắc chắn muốn gửi góp ý này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Gửi góp ý",
          onPress: () => {
            // TODO: Call API to submit feedback
            console.log("Feedback data:", feedbackData);
            Alert.alert(
              "Thành công",
              "Cảm ơn bạn đã góp ý! Góp ý của bạn sẽ giúp chúng tôi cải thiện hệ thống.",
              [
                {
                  text: "OK",
                  onPress: () => {
                    // Navigate về FAQ nếu đến từ FAQ, ngược lại goBack
                    if (params?.fromScreen === "faq") {
                      navigation.navigate("Câu hỏi thường gặp" as never);
                    } else {
                      navigation.goBack();
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
            <MaterialCommunityIcons name="cog" size={48} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Góp ý & Đánh giá Hệ thống</Text>
          <Text style={styles.headerSubtitle}>
            Chia sẻ trải nghiệm và đề xuất của bạn để giúp chúng tôi cải thiện nền tảng
          </Text>
        </View>

        {/* Tần suất sử dụng */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tần suất sử dụng</Text>
          <Text style={styles.cardQuestion}>
            Bạn sử dụng hệ thống này bao nhiêu lần?
          </Text>
          <View style={styles.radioGroup}>
            {usageFrequencyOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.radioOption}
                onPress={() =>
                  setFeedbackData({ ...feedbackData, usageFrequency: option })
                }
              >
                <View
                  style={[
                    styles.radioButton,
                    feedbackData.usageFrequency === option &&
                      styles.radioButtonSelected,
                  ]}
                >
                  {feedbackData.usageFrequency === option && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text style={styles.radioLabel}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Thiết bị chính */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: "#DBEAFE" }]}>
              <MaterialCommunityIcons name="cellphone" size={24} color="#2563EB" />
            </View>
            <Text style={styles.cardTitle}>Thiết bị chính</Text>
          </View>
          <Text style={styles.cardQuestion}>
            Bạn thường sử dụng hệ thống trên thiết bị nào?
          </Text>
          <View style={styles.radioGroup}>
            {mainDeviceOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.radioOption}
                onPress={() =>
                  setFeedbackData({ ...feedbackData, mainDevice: option })
                }
              >
                <View
                  style={[
                    styles.radioButton,
                    feedbackData.mainDevice === option &&
                      styles.radioButtonSelected,
                  ]}
                >
                  {feedbackData.mainDevice === option && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text style={styles.radioLabel}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tính dễ sử dụng */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: "#D1FAE5" }]}>
              <MaterialCommunityIcons name="star-outline" size={24} color="#10B981" />
            </View>
            <Text style={styles.cardTitle}>Tính dễ sử dụng</Text>
          </View>
          <Text style={styles.cardQuestion}>
            Giao diện và tính năng có dễ hiểu và sử dụng không?
          </Text>
          <StarRating
            rating={feedbackData.easeOfUse}
            onRatingChange={(rating) =>
              setFeedbackData({ ...feedbackData, easeOfUse: rating })
            }
          />
          <View style={styles.ratingLabels}>
            <Text style={styles.ratingLabelLeft}>Rất khó sử dụng</Text>
            <Text style={styles.ratingLabelRight}>Rất dễ sử dụng</Text>
          </View>
        </View>

        {/* Hiệu suất */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: "#FEF3C7" }]}>
              <MaterialCommunityIcons name="lightning-bolt" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.cardTitle}>Hiệu suất</Text>
          </View>
          <Text style={styles.cardQuestion}>
            Tốc độ tải trang, phản hồi của hệ thống
          </Text>
          <StarRating
            rating={feedbackData.performance}
            onRatingChange={(rating) =>
              setFeedbackData({ ...feedbackData, performance: rating })
            }
          />
          <View style={styles.ratingLabels}>
            <Text style={styles.ratingLabelLeft}>Rất chậm</Text>
            <Text style={styles.ratingLabelRight}>Rất nhanh</Text>
          </View>
        </View>

        {/* Độ tin cậy */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: "#DBEAFE" }]}>
              <MaterialCommunityIcons name="shield-check" size={24} color="#2563EB" />
            </View>
            <Text style={styles.cardTitle}>Độ tin cậy</Text>
          </View>
          <Text style={styles.cardQuestion}>
            Hệ thống có ổn định, ít lỗi và sự cố không?
          </Text>
          <StarRating
            rating={feedbackData.reliability}
            onRatingChange={(rating) =>
              setFeedbackData({ ...feedbackData, reliability: rating })
            }
          />
          <View style={styles.ratingLabels}>
            <Text style={styles.ratingLabelLeft}>Thường xuyên lỗi</Text>
            <Text style={styles.ratingLabelRight}>Rất ổn định</Text>
          </View>
        </View>

        {/* Thiết kế giao diện */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: "#D1FAE5" }]}>
              <MaterialCommunityIcons name="star-outline" size={24} color="#10B981" />
            </View>
            <Text style={styles.cardTitle}>Thiết kế giao diện</Text>
          </View>
          <Text style={styles.cardQuestion}>
            Giao diện có đẹp, hiện đại và chuyên nghiệp không?
          </Text>
          <StarRating
            rating={feedbackData.interfaceDesign}
            onRatingChange={(rating) =>
              setFeedbackData({ ...feedbackData, interfaceDesign: rating })
            }
          />
          <View style={styles.ratingLabels}>
            <Text style={styles.ratingLabelLeft}>Cần cải thiện nhiều</Text>
            <Text style={styles.ratingLabelRight}>Xuất sắc</Text>
          </View>
        </View>

        {/* Chất lượng hỗ trợ */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: "#FEE2E2" }]}>
              <MaterialCommunityIcons name="account-group" size={24} color="#EF4444" />
            </View>
            <Text style={styles.cardTitle}>Chất lượng hỗ trợ</Text>
          </View>
          <Text style={styles.cardQuestion}>
            Đội ngũ hỗ trợ có nhiệt tình và giải quyết vấn đề tốt không?
          </Text>
          <StarRating
            rating={feedbackData.supportQuality}
            onRatingChange={(rating) =>
              setFeedbackData({ ...feedbackData, supportQuality: rating })
            }
          />
          <View style={styles.ratingLabels}>
            <Text style={styles.ratingLabelLeft}>Rất kém</Text>
            <Text style={styles.ratingLabelRight}>Xuất sắc</Text>
          </View>
        </View>

        {/* Tính năng hữu ích nhất */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tính năng hữu ích nhất</Text>
          <Text style={styles.cardQuestion}>
            Những tính năng nào bạn sử dụng và thấy hữu ích nhất? (chọn nhiều)
          </Text>
          <View style={styles.checkboxGroup}>
            {usefulFeaturesOptions.map((feature, index) => (
              <TouchableOpacity
                key={index}
                style={styles.checkboxOption}
                onPress={() => toggleUsefulFeature(feature)}
              >
                <View
                  style={[
                    styles.checkbox,
                    feedbackData.usefulFeatures.includes(feature) &&
                      styles.checkboxSelected,
                  ]}
                >
                  {feedbackData.usefulFeatures.includes(feature) && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>{feature}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tính năng còn thiếu */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tính năng còn thiếu</Text>
          <Text style={styles.cardQuestion}>
            Những tính năng nào bạn mong muốn có trong hệ thống?
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="Ví dụ: Tính năng tự động điền ca, thống kê thu nhập chi tiết hơn, tích hợp thanh toán điện tử..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={feedbackData.missingFeatures}
            onChangeText={(text) =>
              setFeedbackData({ ...feedbackData, missingFeatures: text })
            }
            maxLength={1000}
          />
          <Text style={styles.charCount}>
            {feedbackData.missingFeatures.length}/1000 ký tự
          </Text>
        </View>

        {/* Điểm khó chịu */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Điểm khó chịu</Text>
          <Text style={styles.cardQuestion}>
            Những vấn đề nào làm bạn khó chịu hoặc cản trở công việc?
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="Chia sẻ những điều bạn cảm thấy khó chịu khi sử dụng hệ thống..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={feedbackData.annoyingPoints}
            onChangeText={(text) =>
              setFeedbackData({ ...feedbackData, annoyingPoints: text })
            }
            maxLength={1000}
          />
          <Text style={styles.charCount}>
            {feedbackData.annoyingPoints.length}/1000 ký tự
          </Text>
        </View>

        {/* Trải nghiệm tích cực */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trải nghiệm tích cực</Text>
          <Text style={styles.cardQuestion}>
            Những điều bạn thích nhất về hệ thống này?
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="Chia sẻ những điểm mạnh và trải nghiệm tốt của bạn..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={feedbackData.positiveExperience}
            onChangeText={(text) =>
              setFeedbackData({ ...feedbackData, positiveExperience: text })
            }
            maxLength={1000}
          />
          <Text style={styles.charCount}>
            {feedbackData.positiveExperience.length}/1000 ký tự
          </Text>
        </View>

        {/* Mức độ giới thiệu */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mức độ giới thiệu</Text>
          <Text style={styles.cardQuestion}>
            Bạn có sẵn sàng giới thiệu hệ thống này cho đồng nghiệp không?
          </Text>
          <View style={styles.radioGroup}>
            {recommendationOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.radioOption}
                onPress={() =>
                  setFeedbackData({ ...feedbackData, recommendationLevel: option })
                }
              >
                <View
                  style={[
                    styles.radioButton,
                    feedbackData.recommendationLevel === option &&
                      styles.radioButtonSelected,
                  ]}
                >
                  {feedbackData.recommendationLevel === option && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text style={styles.radioLabel}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Yêu cầu tính năng cụ thể */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Yêu cầu tính năng cụ thể</Text>
          <Text style={styles.cardQuestion}>
            Nếu bạn có thể thêm một tính năng, đó sẽ là gì và tại sao?
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="Mô tả chi tiết tính năng bạn muốn và lý do tại sao nó quan trọng với bạn..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={feedbackData.specificFeatureRequest}
            onChangeText={(text) =>
              setFeedbackData({ ...feedbackData, specificFeatureRequest: text })
            }
            maxLength={1000}
          />
          <Text style={styles.charCount}>
            {feedbackData.specificFeatureRequest.length}/1000 ký tự
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            // Navigate về FAQ nếu đến từ FAQ, ngược lại goBack
            if (params?.fromScreen === "faq") {
              navigation.navigate("Câu hỏi thường gặp" as never);
            } else {
              navigation.goBack();
            }
          }}
        >
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <MaterialCommunityIcons name="send" size={20} color="#fff" />
          <Text style={styles.submitButtonText}>Gửi góp ý</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <CaregiverBottomNav activeTab="profile" />
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
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
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
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  cardQuestion: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
    lineHeight: 20,
  },
  radioGroup: {
    gap: 8,
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
  checkboxGroup: {
    gap: 8,
  },
  checkboxOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#1F2937",
    flex: 1,
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

