"use client";

import { useRouter } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#FFD93D",
  "#6A4C93",
  "#FFA07A",
  "#20B2AA",
  "#FF69B4",
  "#87CEFA",
  "#F08080",
];

const features = [
  {
    id: "profile",
    title: "Hồ sơ chuyên gia",
    icon: "account-tie",
    route: "/expert-profile",
  },
  {
    id: "dashboard",
    title: "Dashboard",
    icon: "check-circle-outline",
    route: "/caregiver-dashboard",
  },
  {
    id: "availability",
    title: "Quản lý lịch",
    icon: "calendar-clock",
    route: "/availability",
  },
  {
    id: "booking",
    title: "Yêu cầu dịch vụ",
    icon: "clipboard-list",
    route: "/booking",
  },
  {
    id: "payments",
    title: "Thanh toán",
    icon: "credit-card-outline",
    route: "/payment",
  },

  { id: "chat", title: "Tin nhắn", icon: "chat-outline" },
  { id: "training", title: "Đào tạo liên tục", icon: "school" },
  { id: "analytics", title: "Hiệu suất", icon: "chart-line" },
];

const PlaceholderScreen = ({ title }: { title: string }) => (
  <SafeAreaView
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#F7F9FC",
    }}
  >
    <Text style={{ fontSize: 20, fontWeight: "700" }}>{title}</Text>
    <Text style={{ marginTop: 8, color: "#8A94A6" }}>Chưa có nội dung</Text>
  </SafeAreaView>
);

export default function CaregiverHomeScreen() {
  const router = useRouter();

  const handlePress = (feature: (typeof features)[number]) => {
    if (feature.route) {
      router.push(feature.route);
    } else {
      alert(`${feature.title} đang phát triển`);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F9FC" }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.title}>Caregiver App</Text>

        <View style={styles.grid}>
          {features.map((f, index) => (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.card,
                { backgroundColor: COLORS[index % COLORS.length] },
              ]}
              onPress={() => handlePress(f)}
            >
              <Icon
                name={f.icon}
                size={28}
                color="#fff"
                style={{ marginBottom: 8 }}
              />
              <Text style={styles.cardTitle}>{f.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "700", marginBottom: 4, color: "#222" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 16,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
