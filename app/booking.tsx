import { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

type Booking = {
  id: string;
  customer: string;
  service: string;
  date: string;
  status: "pending" | "in_progress" | "completed";
};

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: "1",
      customer: "Nguyễn Văn A",
      service: "Chăm sóc người già",
      date: "2025-09-24 10:00",
      status: "pending",
    },
    {
      id: "2",
      customer: "Trần Thị B",
      service: "Chăm sóc trẻ em",
      date: "2025-09-25 14:00",
      status: "in_progress",
    },
    {
      id: "3",
      customer: "Lê Văn C",
      service: "Chăm sóc người bệnh",
      date: "2025-09-26 09:00",
      status: "completed",
    },
  ]);

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "pending":
        return "#FFD93D";
      case "in_progress":
        return "#4ECDC4";
      case "completed":
        return "#6A4C93";
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F9FC", paddingBottom: 100 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <Text style={styles.title}>Yêu cầu dịch vụ</Text>

        {bookings.length === 0 ? (
          <Text style={{ color: "#555", marginTop: 20 }}>
            Chưa có yêu cầu nào
          </Text>
        ) : (
          bookings.map((b) => (
            <View
              key={b.id}
              style={[
                styles.card,
                { borderLeftColor: getStatusColor(b.status) },
              ]}
            >
              <Text style={styles.customer}>{b.customer}</Text>
              <Text style={styles.service}>{b.service}</Text>
              <Text style={styles.date}>{b.date}</Text>
              <Text
                style={[styles.status, { color: getStatusColor(b.status) }]}
              >
                {b.status === "pending"
                  ? "Chờ"
                  : b.status === "in_progress"
                  ? "Đang thực hiện"
                  : "Hoàn thành"}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "700", marginBottom: 16, color: "#222" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 6,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  customer: { fontSize: 18, fontWeight: "600", marginBottom: 4, color: "#222" },
  service: { fontSize: 16, color: "#555", marginBottom: 4 },
  date: { fontSize: 14, color: "#888", marginBottom: 4 },
  status: { fontSize: 14, fontWeight: "600" },
});
