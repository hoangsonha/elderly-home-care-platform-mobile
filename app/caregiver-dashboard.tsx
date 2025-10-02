import React, { useMemo, useState } from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";
import {
  Avatar,
  Button,
  Divider,
  RadioButton,
  TextInput,
} from "react-native-paper";

const { width } = Dimensions.get("window");

const sampleWeek = [
  { day: "T2", date: 29, count: 0 },
  { day: "T3", date: 30, count: 0 },
  { day: "T4", date: 1, count: 0 },
  { day: "T5", date: 2, count: 0 },
  { day: "T6", date: 3, count: 2 },
  { day: "T7", date: 4, count: 0 },
  { day: "CN", date: 5, count: 1 },
];

const todayAppointments = [
  {
    id: "a1",
    client: "Bà Nguyễn Thị B",
    type: "Chăm sóc cá nhân",
    time: "14:00 - 16:00",
    place: "Q.1, TP.HCM",
    status: "Sắp tới",
  },
  {
    id: "a2",
    client: "Ông Trần Văn C",
    type: "Vận động trị liệu",
    time: "08:00 - 10:00",
    place: "Q.3, TP.HCM",
    status: "Đang thực hiện",
  },
];

const quickActions = [
  { id: "q1", title: "Xem lịch làm việc", desc: "Quản lý lịch hẹn sắp tới" },
  { id: "q2", title: "Gửi báo cáo", desc: "Hoàn thành biên bản lịch hẹn" },
  { id: "q3", title: "Xem yêu cầu booking", desc: "Nhận lịch hẹn phù hợp" },
  {
    id: "q4",
    title: "Thiết lập lịch rảnh",
    desc: "Cấu hình khung giờ rảnh trong tuần",
  },
  { id: "q5", title: "Truy cập đào tạo", desc: "Cập nhật kiến thức" },
];

const trainingSuggestions = [
  {
    id: "t1",
    title: "Kỹ năng chăm sóc người cao tuổi",
    duration: "2 giờ",
    level: "Cơ bản",
  },
  {
    id: "t2",
    title: "Xử lý tình huống khẩn cấp",
    duration: "1.5 giờ",
    level: "Nâng cao",
  },
];

const caregiver = {
  id: "c1",
  name: "Trần Thị Mai",
  title: "Chăm sóc người cao tuổi",
  rating: 4.8,
  years: 5,
  price: 150000,
  location: "Quận 1, TP.HCM",
  phone: "0901 234 567",
  email: "tranthimai@example.com",
  workHours: "Thứ 2 - Thứ 6: 8:00 - 17:00",
  description:
    "Chuyên gia chăm sóc người cao tuổi với 5 năm kinh nghiệm. Tôi có khả năng chăm sóc toàn diện cho người già, bao gồm hỗ trợ sinh hoạt hàng ngày, quản lý thuốc men và theo dõi sức khỏe.",
  certifications: ["Chứng chỉ Y tá", "Chăm sóc người cao tuổi", "CPR"],
  languages: ["Tiếng Việt", "Tiếng Anh"],
};

export default function CaregiverDashboardScreen() {
  const [detailVisible, setDetailVisible] = useState(false);
  const [bookingVisible, setBookingVisible] = useState(false);

  // Booking states
  const [dateText, setDateText] = useState("");
  const [timeText, setTimeText] = useState("");
  const [duration, setDuration] = useState("4");
  const [serviceType, setServiceType] = useState(caregiver.title);
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const totalPrice = useMemo(() => {
    const hours = parseFloat(duration) || 0;
    return hours * caregiver.price;
  }, [duration]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Chào mừng, Nguyễn Văn A!</Text>
        <Text style={styles.subText}>
          Dưới đây là thông tin tổng quan về tình trạng chăm sóc của bạn
        </Text>
      </View>

      {/* Weekly schedule */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>📅 Lịch làm việc tuần này</Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>Chi tiết ›</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 12 }}
        >
          {sampleWeek.map((w, idx) => {
            const isActive = w.day === "T6";
            return (
              <View
                key={idx}
                style={[styles.weekBox, isActive && styles.weekBoxActive]}
              >
                <Text style={styles.weekDay}>{w.day}</Text>
                <Text style={styles.weekDate}>{w.date}</Text>
                <Text style={styles.weekCount}>{w.count} lịch hẹn</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Today's appointments */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>📌 Cuộc hẹn hôm nay</Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>Chi tiết ›</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 12 }}>
          {todayAppointments.map((a) => (
            <View key={a.id} style={styles.appItem}>
              <View>
                <Text style={styles.appClient}>
                  {a.client} <Text style={styles.appBadge}>{a.status}</Text>
                </Text>
                <Text style={styles.appSub}>
                  {a.type} • {a.time} • {a.place}
                </Text>
              </View>
              <Button
                mode="contained"
                compact
                onPress={() => alert("Bắt đầu cuộc hẹn: " + a.client)}
                contentStyle={{ paddingHorizontal: 10 }}
              >
                Bắt đầu
              </Button>
            </View>
          ))}
        </View>
      </View>

      {/* Quick actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚡ Thao tác nhanh</Text>
        <View style={styles.quickRow}>
          {quickActions.map((q) => (
            <TouchableOpacity key={q.id} style={styles.quickBox}>
              <Text style={styles.quickTitle}>{q.title}</Text>
              <Text style={styles.quickDesc}>{q.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Training suggestions */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>🎓 Gợi ý đào tạo</Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>Xem tất cả ›</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 12 }}>
          {trainingSuggestions.map((t) => (
            <View key={t.id} style={styles.trainingItem}>
              <View>
                <Text style={styles.trainingTitle}>{t.title}</Text>
                <Text style={styles.trainingMeta}>
                  {t.duration} • {t.level}
                </Text>
              </View>
              <Button
                mode="contained"
                onPress={() => alert("Mở khoá: " + t.title)}
              >
                Xem
              </Button>
            </View>
          ))}
        </View>
      </View>

      {/* Suggest caregivers (reuse earlier) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>👥 Gợi ý người chăm sóc phù hợp</Text>

        <View style={styles.personCard}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Avatar.Text
              size={46}
              label={caregiver.name
                .split(" ")
                .map((n) => n[0])
                .slice(-2)
                .join("")}
              style={{ backgroundColor: "#FDE68A", marginRight: 12 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.personName}>Nguyễn Văn Bố</Text>
              <Text style={styles.personInfo}>72 tuổi - Bố</Text>
            </View>
          </View>

          <View style={{ marginTop: 12 }}>
            <View style={styles.caregiverRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.caregiverName}>{caregiver.name}</Text>
                <Text style={styles.caregiverDesc}>{caregiver.title}</Text>
                <Text style={styles.caregiverMeta}>
                  ⭐ {caregiver.rating} • {caregiver.years} năm kinh nghiệm
                </Text>
              </View>

              <View style={{ alignItems: "flex-end" }}>
                <TouchableOpacity
                  style={styles.ghostBtn}
                  onPress={() => setDetailVisible(true)}
                >
                  <Text style={styles.ghostBtnText}>Xem chi tiết</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => setBookingVisible(true)}
                >
                  <Text style={styles.primaryBtnText}>Đặt lịch</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* ----- DETAIL MODAL (giống web style) ----- */}
      <Modal
        isVisible={detailVisible}
        onBackdropPress={() => setDetailVisible(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        style={styles.modalContainer}
      >
        <View style={styles.detailModal}>
          <View style={styles.detailHeader}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Avatar.Text
                size={60}
                label="TM"
                style={{ backgroundColor: "#FDE68A", marginRight: 12 }}
              />
              <View>
                <Text style={styles.detailName}>{caregiver.name}</Text>
                <Text style={styles.detailTitle}>{caregiver.title}</Text>
                <Text style={styles.detailRating}>
                  ⭐ {caregiver.rating} ({caregiver.years} năm)
                </Text>
              </View>
            </View>
            <Text style={styles.detailPrice}>
              {caregiver.price.toLocaleString()} đ/giờ
            </Text>
          </View>

          <Divider style={{ marginVertical: 8 }} />

          <View style={styles.contactRow}>
            <Text style={styles.contactItem}>📍 {caregiver.location}</Text>
            <Text style={styles.contactItem}>📞 {caregiver.phone}</Text>
          </View>
          <Text style={styles.contactItem}>✉️ {caregiver.email}</Text>
          <Text style={styles.contactItem}>🕒 {caregiver.workHours}</Text>

          <Text style={styles.sectionLabel}>Giới thiệu</Text>
          <Text style={styles.sectionText}>{caregiver.description}</Text>

          <Text style={styles.sectionLabel}>Chứng chỉ & Bằng cấp</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {caregiver.certifications.map((c, i) => (
              <View key={i} style={styles.pill}>
                <Text style={styles.pillText}>{c}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Ngôn ngữ</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {caregiver.languages.map((l, i) => (
              <View key={i} style={styles.langPill}>
                <Text style={styles.pillText}>{l}</Text>
              </View>
            ))}
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              marginTop: 14,
            }}
          >
            <Button
              mode="outlined"
              onPress={() => setDetailVisible(false)}
              style={{ marginRight: 8 }}
            >
              Đóng
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                setDetailVisible(false);
                setBookingVisible(true);
              }}
            >
              Đặt lịch ngay
            </Button>
          </View>
        </View>
      </Modal>

      {/* ----- BOOKING MODAL (giống web form) ----- */}
      <Modal
        isVisible={bookingVisible}
        onBackdropPress={() => setBookingVisible(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        style={styles.modalContainer}
      >
        <View style={styles.bookingModal}>
          <View style={styles.bookingHeader}>
            <Text style={styles.bookingTitle}>📅 Đặt lịch chăm sóc</Text>
            <TouchableOpacity onPress={() => setBookingVisible(false)}>
              <Text style={styles.linkText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bookingInfoCard}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Avatar.Text
                size={46}
                label="TM"
                style={{ backgroundColor: "#FDE68A", marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "700" }}>{caregiver.name}</Text>
                <Text style={{ color: "#64748B" }}>{caregiver.title}</Text>
              </View>
            </View>

            <Divider style={{ marginVertical: 10 }} />
            <View>
              <Text style={styles.smallLabel}>Người được chăm sóc</Text>
              <Text style={{ fontWeight: "600" }}>Nguyễn Văn Bố • 72 tuổi</Text>
            </View>
          </View>

          {/* Form */}
          <View style={{ marginTop: 12 }}>
            <Text style={styles.smallLabel}>Ngày chăm sóc</Text>
            <TextInput
              mode="outlined"
              placeholder="mm/dd/yyyy"
              value={dateText}
              onChangeText={setDateText}
              style={styles.input}
            />

            <Text style={[styles.smallLabel, { marginTop: 8 }]}>
              Giờ bắt đầu
            </Text>
            <TextInput
              mode="outlined"
              placeholder="--:--"
              value={timeText}
              onChangeText={setTimeText}
              style={styles.input}
            />

            <View style={{ flexDirection: "row", marginTop: 8 }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.smallLabel}>Thời lượng (giờ)</Text>
                <TextInput
                  mode="outlined"
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.smallLabel}>Loại dịch vụ</Text>
                <TextInput
                  value={serviceType}
                  onChangeText={setServiceType}
                  mode="outlined"
                  style={styles.input}
                />
              </View>
            </View>

            <Text style={[styles.smallLabel, { marginTop: 8 }]}>
              Ghi chú thêm
            </Text>
            <TextInput
              mode="outlined"
              placeholder="Mô tả chi tiết về nhu cầu chăm sóc..."
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              style={[styles.input, { height: 90 }]}
            />

            <Text style={[styles.smallLabel, { marginTop: 8 }]}>
              Phương thức thanh toán
            </Text>
            <RadioButton.Group
              onValueChange={(v) => setPaymentMethod(v)}
              value={paymentMethod}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <RadioButton value="cash" />
                <Text style={{ marginRight: 18 }}>Tiền mặt</Text>
                <RadioButton value="bank" />
                <Text>Chuyển khoản</Text>
              </View>
            </RadioButton.Group>

            {/* Price summary */}
            <View style={styles.priceBox}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text>Giá dịch vụ:</Text>
                <Text>{caregiver.price.toLocaleString()} VND/giờ</Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 8,
                }}
              >
                <Text style={{ fontWeight: "700" }}>
                  Tổng cộng ({duration} giờ):
                </Text>
                <Text style={{ fontWeight: "700", color: "#065F46" }}>
                  {totalPrice.toLocaleString()} VND
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginTop: 12,
              }}
            >
              <Button
                mode="outlined"
                onPress={() => setBookingVisible(false)}
                style={{ marginRight: 8 }}
              >
                Hủy
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  // mock confirm
                  alert(
                    "Đã đặt lịch: " +
                      caregiver.name +
                      "\nTổng: " +
                      totalPrice.toLocaleString() +
                      " VND"
                  );
                  setBookingVisible(false);
                }}
              >
                Xác nhận đặt lịch
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 16 },
  header: { marginBottom: 16 },
  welcomeText: { fontSize: 22, fontWeight: "700", color: "#0F172A" },
  subText: { fontSize: 14, color: "#475569", marginTop: 6 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    // web-like subtle border
    borderWidth: 1,
    borderColor: "#EEF2F7",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: { fontWeight: "700", fontSize: 16, color: "#0F172A" },
  linkText: { color: "#2563EB" },

  weekBox: {
    width: Math.round(width * 0.24),
    marginRight: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#EEF2F7",
    alignItems: "center",
  },
  weekBoxActive: { backgroundColor: "#EFF6FF", borderColor: "#93C5FD" },
  weekDay: { color: "#94A3B8", fontSize: 12 },
  weekDate: { fontSize: 18, fontWeight: "700", marginTop: 6 },
  weekCount: { color: "#94A3B8", fontSize: 12, marginTop: 6 },

  appItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomColor: "#EEF2F7",
    borderBottomWidth: 1,
  },
  appClient: { fontWeight: "700" },
  appSub: { color: "#64748B", marginTop: 6 },
  appBadge: {
    backgroundColor: "#FEEBC8",
    color: "#92400E",
    paddingHorizontal: 8,
    borderRadius: 8,
    fontSize: 12,
  },

  quickRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 12 },
  quickBox: {
    width: (width - 64) / 2,
    backgroundColor: "#FAFAFB",
    borderRadius: 10,
    padding: 12,
    marginRight: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  quickTitle: { fontWeight: "700" },
  quickDesc: { color: "#64748B", marginTop: 6, fontSize: 13 },

  trainingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomColor: "#EEF2F7",
    borderBottomWidth: 1,
  },
  trainingTitle: { fontWeight: "700" },
  trainingMeta: { color: "#64748B", marginTop: 6 },

  personCard: {
    marginTop: 12,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EEF2F7",
  },
  personName: { fontWeight: "700" },
  personInfo: { color: "#64748B", marginTop: 4 },

  caregiverRow: { flexDirection: "row", alignItems: "center" },
  caregiverName: { fontWeight: "700", fontSize: 15 },
  caregiverDesc: { color: "#64748B", fontSize: 13, marginTop: 4 },
  caregiverMeta: { color: "#6B7280", marginTop: 6 },

  ghostBtn: {
    borderWidth: 1,
    borderColor: "#E6EEF8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  ghostBtnText: { color: "#334155" },

  primaryBtn: {
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },

  // DETAIL MODAL
  modalContainer: { margin: 0, justifyContent: "flex-end" },
  detailModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: Platform.OS === "ios" ? "88%" : "92%",
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailName: { fontSize: 18, fontWeight: "700" },
  detailTitle: { color: "#3B82F6", marginTop: 4 },
  detailRating: { color: "#6B7280", marginTop: 6 },
  detailPrice: { color: "#16A34A", fontWeight: "700" },

  contactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  contactItem: { color: "#475569", marginTop: 6 },

  sectionLabel: { marginTop: 12, fontWeight: "700", color: "#0F172A" },
  sectionText: { color: "#475569", marginTop: 6 },

  pill: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginTop: 8,
  },
  langPill: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginTop: 8,
  },
  pillText: { color: "#0F172A" },

  // BOOKING modal
  bookingModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: Platform.OS === "ios" ? "92%" : "96%",
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bookingTitle: { fontWeight: "700", fontSize: 16 },
  bookingInfoCard: {
    backgroundColor: "#FAFAFB",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEF2F7",
    marginTop: 12,
  },

  smallLabel: { color: "#334155", fontWeight: "700", marginBottom: 6 },
  input: { backgroundColor: "#fff", height: 44 },

  priceBox: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E6EEF8",
  },

  // other helpers
  sectionTitleBig: { fontWeight: "700", fontSize: 18 },
});
