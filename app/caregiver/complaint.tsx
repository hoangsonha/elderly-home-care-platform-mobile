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
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as {
    bookingId?: string;
    elderlyName?: string;
    date?: string;
    time?: string;
    packageName?: string;
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

  const toggleComplaintType = (typeId: string) => {
    if (selectedTypes.includes(typeId)) {
      setSelectedTypes(selectedTypes.filter((id) => id !== typeId));
    } else {
      setSelectedTypes([...selectedTypes, typeId]);
    }
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
            // TODO: Call API to submit complaint
            Alert.alert(
              "Đã gửi khiếu nại",
              "Khiếu nại của bạn đã được ghi nhận. Chúng tôi sẽ xem xét và phản hồi trong vòng 24-48 giờ.",
              [
                {
                  text: "OK",
                  onPress: () => navigation.goBack(),
                },
              ]
            );
          },
        },
      ]
    );
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Khiếu nại dịch vụ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
                ]}
                onPress={() => setUrgency(level as any)}
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
                ]}
                onPress={() => toggleComplaintType(type.id)}
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
            style={styles.textArea}
            placeholder="Nhập mô tả chi tiết về vấn đề bạn gặp phải..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
            maxLength={1000}
          />
          <Text style={styles.charCount}>{description.length}/1000 ký tự</Text>
        </View>

        {/* Evidence (Optional) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài liệu đính kèm (Tùy chọn)</Text>
          <Text style={styles.sectionSubtitle}>
            Ảnh, video hoặc file ghi âm minh chứng
          </Text>
          <TouchableOpacity style={styles.uploadButton}>
            <Ionicons name="cloud-upload" size={24} color="#6B7280" />
            <Text style={styles.uploadText}>Tải lên tài liệu</Text>
            <Text style={styles.uploadSubtext}>PNG, JPG, MP4 (Max 10MB)</Text>
          </TouchableOpacity>
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
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <MaterialCommunityIcons name="send" size={20} color="#fff" />
          <Text style={styles.submitButtonText}>Gửi khiếu nại</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  scrollView: {
    flex: 1,
  },
  warningBanner: {
    flexDirection: "row",
    backgroundColor: "#FEF2F2",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#DC2626",
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
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
    paddingHorizontal: 16,
    marginTop: 20,
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
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
    paddingVertical: 12,
    borderRadius: 8,
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
    padding: 16,
    borderRadius: 12,
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
    borderRadius: 8,
    padding: 12,
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
    borderRadius: 12,
    padding: 24,
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
  guidelinesCard: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#2563EB",
  },
  guidelinesContent: {
    flex: 1,
    marginLeft: 12,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
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
});
