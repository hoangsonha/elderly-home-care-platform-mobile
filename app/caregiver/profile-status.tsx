import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import {
  approveProfile,
  getProfileStatus,
  rejectProfile,
  setProfileStatus,
} from "@/data/profileStore";

type ProfileStatusType = "pending" | "rejected" | "approved";

export default function ProfileStatusScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { user, logout } = useAuth();
  const [status, setStatus] = useState<ProfileStatusType>("pending");
  const [rejectionReason, setRejectionReason] = useState<string>("");

  useEffect(() => {
    if (user?.id) {
      const profileStatus = getProfileStatus(user.id);
      setStatus(profileStatus.status);
      setRejectionReason(profileStatus.rejectionReason || "");

      // If approved, navigate to home after a short delay
      if (profileStatus.status === "approved") {
        setTimeout(() => {
          navigation.navigate("Trang chủ");
        }, 2000);
      }
    }
  }, [user, navigation]);

  // For testing: allow changing status via route params
  useEffect(() => {
    const params = route.params as any;
    if (params?.testStatus && user?.id) {
      if (params.testStatus === "rejected") {
        rejectProfile(user.id, params.rejectionReason || "Thông tin không đầy đủ");
      } else if (params.testStatus === "approved") {
        approveProfile(user.id);
      } else {
        setProfileStatus(user.id, "pending");
      }
      const profileStatus = getProfileStatus(user.id);
      setStatus(profileStatus.status);
      setRejectionReason(profileStatus.rejectionReason || "");
    }
  }, [route.params, user]);

  const handleEditProfile = () => {
    navigation.navigate("Hoàn thiện hồ sơ", {
      email: user?.email,
      fullName: user?.name || "",
    });
  };

  const handleBackToDashboard = () => {
    // Logout and navigate to guest home screen
    logout();
    setTimeout(() => {
      router.replace("/(tabs)");
    }, 100);
  };

  const renderPendingStatus = () => (
    <View style={styles.statusCard}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, styles.iconCirclePending]}>
          <MaterialCommunityIcons name="clock-outline" size={48} color="#F59E0B" />
        </View>
      </View>
      <Text style={styles.statusTitle}>Đang chờ duyệt</Text>
      <Text style={styles.statusDescription}>
        Hồ sơ của bạn đang được xem xét. Chúng tôi sẽ thông báo kết quả trong vòng 24-48 giờ.
      </Text>
      <View style={styles.noteContainer}>
        <Text style={styles.noteLabel}>Lưu ý:</Text>
        <Text style={styles.noteText}>
          Vui lòng kiểm tra email thường xuyên để nhận thông báo cập nhật về hồ sơ của bạn.
        </Text>
      </View>
    </View>
  );

  const renderRejectedStatus = () => (
    <View style={styles.statusCard}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, styles.iconCircleRejected]}>
          <MaterialCommunityIcons name="close-circle" size={48} color="#EF4444" />
        </View>
      </View>
      <Text style={styles.statusTitle}>Hồ sơ bị từ chối</Text>
      <Text style={styles.statusDescription}>
        {rejectionReason || "Hồ sơ của bạn không đáp ứng yêu cầu của chúng tôi."}
      </Text>
      {rejectionReason && (
        <View style={styles.reasonContainer}>
          <Text style={styles.reasonLabel}>Lý do từ chối:</Text>
          <Text style={styles.reasonText}>{rejectionReason}</Text>
        </View>
      )}
      <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
        <MaterialCommunityIcons name="pencil" size={20} color="#fff" />
        <Text style={styles.editButtonText}>Chỉnh sửa hồ sơ</Text>
      </TouchableOpacity>
    </View>
  );

  const renderApprovedStatus = () => (
    <View style={styles.statusCard}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, styles.iconCircleApproved]}>
          <MaterialCommunityIcons name="check-circle" size={48} color="#10B981" />
        </View>
      </View>
      <Text style={styles.statusTitle}>Hồ sơ đã được duyệt</Text>
      <Text style={styles.statusDescription}>
        Chúc mừng! Hồ sơ của bạn đã được phê duyệt. Bạn có thể bắt đầu sử dụng dịch vụ ngay bây giờ.
      </Text>
      <Text style={styles.approvedMessage}>
        Đang chuyển hướng đến trang chủ...
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#70C1F1", "#70C1F1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToDashboard}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Trạng thái hồ sơ</Text>
            <Text style={styles.headerSubtitle}>
              Kiểm tra tình trạng đăng ký của bạn
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {status === "pending" && renderPendingStatus()}
        {status === "rejected" && renderRejectedStatus()}
        {status === "approved" && renderApprovedStatus()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
    marginLeft: -40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    alignItems: "center",
  },
  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCirclePending: {
    backgroundColor: "#FEF3C7",
  },
  iconCircleRejected: {
    backgroundColor: "#FEE2E2",
  },
  iconCircleApproved: {
    backgroundColor: "#D1FAE5",
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
    textAlign: "center",
  },
  statusDescription: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 20,
  },
  noteContainer: {
    width: "100%",
    marginTop: 8,
    padding: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8B5CF6",
    marginBottom: 6,
  },
  noteText: {
    fontSize: 14,
    color: "#8B5CF6",
    lineHeight: 20,
  },
  reasonContainer: {
    width: "100%",
    marginTop: 12,
    padding: 16,
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#991B1B",
    marginBottom: 6,
  },
  reasonText: {
    fontSize: 14,
    color: "#991B1B",
    lineHeight: 20,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#70C1F1",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
    width: "100%",
    shadowColor: "#70C1F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  approvedMessage: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "600",
    marginTop: 12,
    textAlign: "center",
  },
});

