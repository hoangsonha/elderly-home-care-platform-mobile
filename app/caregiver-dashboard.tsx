import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const CaregiverDashboardScreen = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Chào mừng, Nguyễn Văn A!</Text>
        <Text style={styles.subText}>
          Dưới đây là thông tin tổng quan về tình trạng chăm sóc của bạn
        </Text>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <TouchableOpacity style={[styles.statBox, styles.bgBlueLight]}>
          <Text style={styles.statNumber}>10</Text>
          <Text style={styles.statLabel}>Đã hoàn thành</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.statBox, styles.bgPurpleLight]}>
          <Text style={styles.statNumber}>1</Text>
          <Text style={styles.statLabel}>Đang diễn ra</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.statBox, styles.bgYellowLight]}>
          <Text style={styles.statNumber}>2</Text>
          <Text style={styles.statLabel}>Sắp tới</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.statBox, styles.bgGreenLight]}>
          <Text style={styles.statNumber}>4</Text>
          <Text style={styles.statLabel}>Khác</Text>
        </TouchableOpacity>
      </View>

      {/* Section: Gợi ý người chăm sóc */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👥 Gợi ý người chăm sóc phù hợp</Text>

        {/* Mỗi người thân */}
        <View style={styles.personCard}>
          <View style={styles.personHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.personName}>Nguyễn Văn Bố</Text>
              <Text style={styles.personInfo}>72 tuổi - Bố</Text>
              <View style={styles.tagRow}>
                <View style={styles.tagRed}>
                  <Text style={styles.tagText}>Huyết áp cao</Text>
                </View>
                <View style={styles.tagPink}>
                  <Text style={styles.tagText}>Tiểu đường</Text>
                </View>
              </View>
            </View>
          </View>

          <Text style={styles.suggestionTitle}>Gợi ý phù hợp:</Text>

          {/* Caregiver Item */}
          <View style={styles.caregiverItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.caregiverName}>Trần Thị Mai</Text>
              <Text style={styles.caregiverDesc}>
                Chăm sóc người cao tuổi, phù hợp với bệnh huyết áp cao & tiểu
                đường
              </Text>
              <Text style={styles.matchRate}>✅ 95% phù hợp • ⭐ 4.8</Text>
            </View>
            <View style={styles.btnGroup}>
              <TouchableOpacity style={styles.detailBtn}>
                <Text style={styles.detailText}>Xem chi tiết</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bookBtn}>
                <Text style={styles.bookText}>Đặt lịch</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Section: Cảnh báo gần đây */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚠️ Cảnh báo gần đây</Text>

        {/* Cảnh báo mức cao */}
        <View style={[styles.alertCard, styles.alertHigh]}>
          <View style={styles.alertRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>
                Nguyễn Văn Bố (72 tuổi - Bố)
              </Text>
              <Text style={styles.alertContent}>
                Huyết áp cao bất thường - CẦN XỬ LÝ NGAY
              </Text>
              <Text style={styles.alertReporter}>Báo bởi: Trần Thị Mai</Text>
            </View>
            <Text style={styles.alertTime}>14:32</Text>
          </View>
        </View>

        {/* Cảnh báo mức trung bình */}
        <View style={[styles.alertCard, styles.alertMedium]}>
          <View style={styles.alertRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Trần Thị Mẹ (68 tuổi - Mẹ)</Text>
              <Text style={styles.alertContent}>
                Nhắc nhở uống thuốc buổi sáng
              </Text>
              <Text style={styles.alertReporter}>Báo bởi: Lê Văn Hùng</Text>
            </View>
            <Text style={styles.alertTime}>09:15</Text>
          </View>
        </View>

        {/* Cảnh báo mức thấp */}
        <View style={[styles.alertCard, styles.alertLow]}>
          <View style={styles.alertRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Trần Thị Mẹ (68 tuổi - Mẹ)</Text>
              <Text style={styles.alertContent}>
                Tình trạng sức khỏe ổn định
              </Text>
              <Text style={styles.alertReporter}>Báo bởi: Phạm Thu Hà</Text>
            </View>
            <Text style={styles.alertTime}>11:30</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 16 },
  header: { marginBottom: 20 },
  welcomeText: { fontSize: 22, fontWeight: "700", color: "#1E293B" },
  subText: { fontSize: 15, color: "#64748B", marginTop: 6 },

  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statBox: {
    width: "48%",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  statNumber: { fontSize: 26, fontWeight: "bold", color: "#1E293B" },
  statLabel: {
    fontSize: 15,
    color: "#475569",
    marginTop: 6,
    fontWeight: "500",
  },

  bgBlueLight: { backgroundColor: "#E0F2FE" },
  bgPurpleLight: { backgroundColor: "#F1EAFE" },
  bgYellowLight: { backgroundColor: "#FEF3C7" },
  bgGreenLight: { backgroundColor: "#DCFCE7" },

  section: { marginTop: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#1E293B",
  },

  personCard: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  personHeader: { flexDirection: "row", marginBottom: 10 },
  personAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: 14 },
  personName: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
  personInfo: { color: "#64748B", marginTop: 2 },
  tagRow: { flexDirection: "row", marginTop: 6 },
  tagRed: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  tagPink: {
    backgroundColor: "#FCE7F3",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: { fontSize: 12, color: "#991B1B" },

  suggestionTitle: {
    marginTop: 6,
    marginBottom: 10,
    fontWeight: "600",
    color: "#1E293B",
  },

  caregiverItem: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  caregiverAvatar: { width: 46, height: 46, borderRadius: 23, marginRight: 10 },
  caregiverName: { fontWeight: "700", fontSize: 15, color: "#1E293B" },
  caregiverDesc: { color: "#64748B", fontSize: 13, marginTop: 2 },
  matchRate: { marginTop: 4, color: "#16A34A", fontWeight: "600" },
  btnGroup: { justifyContent: "center", marginLeft: 8 },
  detailBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#E2E8F0",
    borderRadius: 8,
    marginBottom: 6,
  },
  detailText: { fontSize: 13, color: "#334155" },
  bookBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#10B981",
    borderRadius: 8,
  },
  bookText: { fontSize: 13, color: "#FFF" },

  alertCard: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
  },
  alertHigh: { backgroundColor: "#FEE2E2" },
  alertMedium: { backgroundColor: "#FEF9C3" },
  alertLow: { backgroundColor: "#DCFCE7" },
  alertRow: { flexDirection: "row" },
  alertAvatar: { width: 42, height: 42, borderRadius: 21, marginRight: 12 },
  alertTitle: { fontWeight: "700", fontSize: 15, color: "#1E293B" },
  alertContent: { marginTop: 2, color: "#374151" },
  alertReporter: { marginTop: 4, fontSize: 12, color: "#6B7280" },
  alertTime: { fontSize: 13, color: "#475569" },
});

export default CaregiverDashboardScreen;
