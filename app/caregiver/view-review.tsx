import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { getAppointmentReview } from "@/data/appointmentStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import React from "react";
import {
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

const familySupportLabels: { [key: string]: string } = {
  "very-good": "Rất tốt - Gia đình luôn hỗ trợ và phối hợp tích cực",
  "good": "Tốt - Gia đình phối hợp khi cần thiết",
  "average": "Trung bình - Ít hỗ trợ nhưng không gây trở ngại",
  "poor": "Kém - Thiếu sự quan tâm và hỗ trợ",
  "difficult": "Khó khăn - Gia đình can thiệp tiêu cực hoặc gây khó khăn",
};

const recommendationLabels: { [key: string]: string } = {
  "highly-recommend": "Rất muốn giới thiệu - Khách hàng lý tưởng, dễ chăm sóc",
  "can-recommend": "Có thể giới thiệu - Khách hàng tốt với một số lưu ý nhỏ",
  "neutral": "Trung lập - Tùy thuộc vào người chăm sóc",
  "not-recommend": "Không giới thiệu - Có nhiều khó khăn",
};

const issuesLabels: { [key: string]: string } = {
  "mobility": "Các vấn đề về di chuyển cần được chú ý đặc biệt",
  "memory": "Các thách thức về trí nhớ/nhận thức",
  "medication": "Các lo ngại về tuân thủ thuốc",
  "dietary": "Tuân thủ các hạn chế về chế độ ăn uống",
  "communication": "Khó khăn trong giao tiếp",
  "safety": "Các mối nguy hiểm về an toàn trong môi trường gia đình",
};

export default function ViewReviewScreen() {
  const route = useRoute();
  const params = route.params as { appointmentId?: string; elderlyName?: string; fromScreen?: string } | undefined;
  const appointmentId = params?.appointmentId || "";
  const elderlyName = params?.elderlyName || "Người được chăm sóc";
  const reviewData = getAppointmentReview(appointmentId);

  if (!reviewData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="star-off" size={64} color="#9CA3AF" />
          <Text style={styles.emptyText}>Chưa có đánh giá</Text>
        </View>
        <CaregiverBottomNav activeTab="jobs" />
      </SafeAreaView>
    );
  }

  const renderStarRating = (rating: number, maxStars: number = 5) => {
    return (
      <View style={styles.starContainer}>
        {Array.from({ length: maxStars }, (_, index) => {
          const starValue = index + 1;
          return (
            <MaterialCommunityIcons
              key={index}
              name={starValue <= rating ? "star" : "star-outline"}
              size={24}
              color={starValue <= rating ? "#FCD34D" : "#D1D5DB"}
            />
          );
        })}
        <Text style={styles.ratingText}>{rating} / {maxStars}</Text>
      </View>
    );
  };

  const renderRatingCard = (
    title: string,
    description: string,
    rating: number,
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
          {renderStarRating(rating)}
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
              <MaterialCommunityIcons name="star" size={32} color="#FCD34D" />
            </View>
          </View>
          <Text style={styles.headerTitle}>Đánh giá đã gửi</Text>
          <Text style={styles.headerSubtitle}>
            Đánh giá của bạn cho {elderlyName}
          </Text>
          {reviewData.submittedAt && (
            <Text style={styles.submittedDate}>
              Gửi lúc: {new Date(reviewData.submittedAt).toLocaleString("vi-VN")}
            </Text>
          )}
        </View>

        {/* Rating Cards */}
        {renderRatingCard(
          "Mức độ hợp tác",
          "Đánh giá mức độ hợp tác và tuân thủ kế hoạch chăm sóc của người được chăm sóc",
          reviewData.cooperation,
          "trending-up",
          "#3B82F6"
        )}

        {renderRatingCard(
          "Chất lượng giao tiếp",
          "Khả năng giao tiếp và diễn đạt nhu cầu của người được chăm sóc",
          reviewData.communication,
          "message-text-outline",
          "#10B981"
        )}

        {renderRatingCard(
          "Thái độ tôn trọng",
          "Thái độ tôn trọng và đối xử với người chăm sóc",
          reviewData.respect,
          "heart",
          "#F97316"
        )}

        {renderRatingCard(
          "Tính sẵn sàng",
          "Sẵn sàng theo lịch trình và không hủy/thay đổi đột ngột",
          reviewData.readiness,
          "clock-outline",
          "#3B82F6"
        )}

        {renderRatingCard(
          "Môi trường làm việc",
          "Điều kiện và môi trường tại nhà của người được chăm sóc",
          reviewData.workingEnvironment,
          "home",
          "#10B981"
        )}

        {/* Family Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sự hỗ trợ từ gia đình</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              {familySupportLabels[reviewData.familySupport] || reviewData.familySupport}
            </Text>
          </View>
        </View>

        {/* Issues */}
        {reviewData.issues.length > 0 && (
          <View style={styles.section}>
            <View style={styles.issuesHeader}>
              <View style={styles.issuesIcon}>
                <MaterialCommunityIcons name="alert-circle" size={20} color="#EF4444" />
              </View>
              <Text style={styles.sectionTitle}>Các vấn đề cần lưu ý</Text>
            </View>
            <View style={styles.infoCard}>
              {reviewData.issues.map((issueId, index) => (
                <View key={index} style={styles.issueItem}>
                  <MaterialCommunityIcons name="circle-small" size={16} color="#EF4444" />
                  <Text style={styles.issueText}>
                    {issuesLabels[issueId] || issueId}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recommendation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mức độ giới thiệu</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              {recommendationLabels[reviewData.recommendation] || reviewData.recommendation}
            </Text>
          </View>
        </View>

        {/* Additional Notes */}
        {reviewData.additionalNotes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ghi chú bổ sung</Text>
            <View style={styles.infoCard}>
              <Text style={styles.notesText}>{reviewData.additionalNotes}</Text>
            </View>
          </View>
        )}

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
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
    marginTop: 16,
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
    backgroundColor: "#FEF3C7",
    borderWidth: 2,
    borderColor: "#FCD34D",
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
  submittedDate: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
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
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoText: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
  },
  issuesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
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
  issueItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  issueText: {
    fontSize: 14,
    color: "#1F2937",
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  notesText: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
  },
});

