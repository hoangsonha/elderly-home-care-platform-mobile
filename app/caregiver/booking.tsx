import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const tabs = [
  "Chờ xác nhận",
  "Chờ dời lịch",
  "Chờ thực hiện",
  "Đang thực hiện",
  "Đã hoàn thành",
  "Đã hủy",
  "Khiếu nại",
];

const bookings = [
  {
    id: "BK001",
    name: "Cụ Nguyen Văn A",
    location: "Q.1, TP.HCM",
    type: "Đặt ngay",
    date: "2025-09-20 08:00",
    status: "Chờ xác nhận",
    price: 480000,
  },
  {
    id: "BK005",
    name: "Bà Nguyen Thị E",
    location: "Q.10, TP.HCM",
    type: "Đặt trước",
    tag: "Video Call",
    date: "2025-09-21 07:30",
    status: "Chờ xác nhận",
    price: 600000,
  },
];

export default function BookingManagement() {
  const [activeTab, setActiveTab] = useState("Chờ xác nhận");

  const renderTab = (tab: string) => (
    <TouchableOpacity
      key={tab}
      style={[styles.tab, activeTab === tab && styles.tabActive]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
        {tab}
      </Text>
    </TouchableOpacity>
  );

  const renderBooking = ({ item }: { item: (typeof bookings)[0] }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.bookingId}>
          #{item.id} • {item.location}
        </Text>
        <Text style={styles.badge}>{item.type}</Text>
        {item.tag && (
          <Text style={[styles.badge, styles.badgeAlt]}>{item.tag}</Text>
        )}
      </View>

      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.date}>{item.date}</Text>

      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.status}>{item.status}</Text>
          <Text style={styles.price}>{item.price.toLocaleString()} đ</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, styles.reject]}>
            <Text style={styles.actionText}>Từ chối</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.suggest]}>
            <Text style={styles.actionText}>Đề nghị đổi lịch</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.accept]}>
            <Text style={[styles.actionText, { color: "#fff" }]}>
              Chấp nhận
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quản lý yêu cầu đặt lịch</Text>
        <Text style={styles.subtitle}>
          Theo dõi và xử lý các yêu cầu lịch chăm sóc theo trạng thái.
        </Text>
      </View>

      <View style={styles.tabRow}>{tabs.map(renderTab)}</View>

      <FlatList
        data={bookings.filter((b) => b.status === activeTab)}
        renderItem={renderBooking}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: Platform.OS === "android" ? 18 : 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 12,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  tabRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#f2f2f2",
    margin: 4,
  },
  tabActive: {
    backgroundColor: "#1F6FEB",
  },
  tabText: {
    fontSize: 12,
    color: "#333",
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 6,
  },
  bookingId: {
    fontSize: 12,
    color: "#444",
    marginRight: 6,
  },
  badge: {
    fontSize: 11,
    backgroundColor: "#E5F0FF",
    color: "#1F6FEB",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  badgeAlt: {
    backgroundColor: "#F9E5FF",
    color: "#B144D4",
  },
  name: {
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    color: "#666",
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  status: {
    fontSize: 12,
    color: "#F59E0B",
    marginBottom: 4,
  },
  price: {
    fontWeight: "700",
    fontSize: 15,
  },
  actions: {
    flexDirection: "row",
    gap: 6,
  },
  actionBtn: {
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginLeft: 6,
  },
  reject: {
    backgroundColor: "#f2f2f2",
  },
  suggest: {
    backgroundColor: "#f2f2f2",
  },
  accept: {
    backgroundColor: "#1F6FEB",
  },
  actionText: {
    fontSize: 12,
    color: "#333",
  },
});