import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Chip, Divider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

type Booking = {
  id: string;
  code: string;
  name: string;
  type: string; // Đặt ngay / đặt trước
  mode?: string; // Video Call
  date: string;
  time: string;
  status: string;
  total: number;
  note?: string;
};

const TAB_STATUS = [
  { key: "pending", label: "Chờ xác nhận" },
  { key: "reschedule", label: "Chờ đổi lịch" },
  { key: "ready", label: "Chờ thực hiện" },
  { key: "inprogress", label: "Đang thực hiện" },
  { key: "completed", label: "Đã hoàn thành" },
  { key: "cancelled", label: "Đã hủy" },
  { key: "complaint", label: "Khiếu nại" },
];

const initialBookings: Booking[] = [
  {
    id: "1",
    code: "BK001",
    name: "Cụ Nguyễn Văn A",
    type: "Đặt ngay",
    date: "2025-09-20",
    time: "08:00",
    status: "pending",
    total: 480000,
  },
  {
    id: "2",
    code: "BK005",
    name: "Bà Nguyễn Thị E",
    type: "Đặt trước",
    mode: "Video Call",
    date: "2025-09-21",
    time: "07:30",
    status: "pending",
    total: 600000,
    note: "Yêu cầu video: Chờ người chăm sóc xác nhận",
  },
];

export default function BookingScreen() {
  const [activeTab, setActiveTab] = useState("pending");

  const filteredBookings = initialBookings.filter(
    (b) => b.status === activeTab
  );

  const renderBooking = ({ item }: { item: Booking }) => (
    <View style={styles.bookingCard}>
      <View style={styles.header}>
        <Text style={styles.code}>{item.code} • Q.1, TP.HCM</Text>
        <Chip mode="outlined" style={styles.typeChip}>
          {item.type}
        </Chip>
        {item.mode && (
          <Chip mode="flat" style={styles.modeChip}>
            {item.mode}
          </Chip>
        )}
      </View>

      <Text style={styles.name}>{item.name}</Text>

      <View style={styles.dateRow}>
        <MaterialCommunityIcons name="clock-outline" size={16} color="#555" />
        <Text style={styles.dateText}>
          {item.date} {item.time}
        </Text>
      </View>

      {item.note && <Text style={styles.note}>{item.note}</Text>}

      <View style={styles.footer}>
        <Text style={styles.total}>
          Tổng tạm tính: {item.total.toLocaleString("vi-VN")} ₫
        </Text>
        <View style={styles.buttonsRow}>
          <Button mode="outlined" onPress={() => {}} style={styles.actionBtn}>
            Từ chối
          </Button>
          <Button mode="outlined" onPress={() => {}} style={styles.actionBtn}>
            Đề nghị đổi lịch
          </Button>
          <Button mode="contained" onPress={() => {}} style={styles.actionBtn}>
            Chấp nhận
          </Button>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Quản lý yêu cầu đặt lịch</Text>
      <Text style={styles.subtitle}>
        Theo dõi và xử lý các yêu cầu theo trạng thái
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabRow}
      >
        {TAB_STATUS.map((tab) => (
          <Chip
            key={tab.key}
            mode={activeTab === tab.key ? "flat" : "outlined"}
            onPress={() => setActiveTab(tab.key)}
            style={activeTab === tab.key ? styles.activeTab : styles.tab}
          >
            {tab.label}
          </Chip>
        ))}
      </ScrollView>

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBooking}
        ItemSeparatorComponent={() => <Divider style={{ marginVertical: 8 }} />}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#555", marginBottom: 16 },
  tabRow: { flexDirection: "row", marginBottom: 16, maxHeight: 60 },
  tab: { marginRight: 8, height: 45 },
  activeTab: {
    marginRight: 8,
    backgroundColor: "#007bff",
    color: "#fff",
    height: 45,
  },
  bookingCard: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: 8,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  code: { fontWeight: "bold", marginRight: 8 },
  typeChip: { marginRight: 4, backgroundColor: "#e6f0ff" },
  modeChip: { backgroundColor: "#f8e6ff" },
  name: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  dateRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  dateText: { marginLeft: 4, color: "#555" },
  note: { fontStyle: "italic", color: "#777", marginBottom: 8 },
  footer: { marginTop: 8 },
  total: { fontWeight: "bold", marginBottom: 8 },
  buttonsRow: { flexDirection: "row", justifyContent: "space-between" },
  actionBtn: { flex: 1, marginHorizontal: 4 },
});
