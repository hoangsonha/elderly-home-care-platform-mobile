import {
  CareSeekerStatistics,
  CareSeekerStatisticsService,
} from "@/services/careseeker-statistics.service";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const formatMoney = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
};

export default function CareSeekerDashboard() {
  const [statistics, setStatistics] = useState<CareSeekerStatistics | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response =
        await CareSeekerStatisticsService.getCaregiverPersonalStatistics();

      if (response.status === "Success") {
        setStatistics(response.data);
      } else {
        setError("Không thể tải dữ liệu thống kê");
      }
    } catch (err) {
      console.error("CareSeeker dashboard error:", err);
      setError("Có lỗi xảy ra khi gọi API");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchStatistics();
    }, [fetchStatistics])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Đang tải dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  /* ============== UI ============== */

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.header}>Dashboard Care Seeker</Text>

      <View style={styles.grid}>
        <StatCard
          icon="👴"
          label="Hồ sơ người già"
          value={statistics?.totalElderlyProfiles ?? 0}
          bg="#E3F2FD"
        />

        <StatCard
          icon="📅"
          label="Lịch hẹn tháng này"
          value={statistics?.totalCareServicesThisMonth ?? 0}
          bg="#E8F5E9"
        />

        <StatCard
          icon="💰"
          label="Chi tiêu tháng"
          value={formatMoney(statistics?.totalSpendingThisMonth ?? 0)}
          bg="#FFF3E0"
        />

        <StatCard
          icon="🔄"
          label="Đang thực hiện"
          value={statistics?.totalInProgressServices ?? 0}
          bg="#FCE4EC"
        />

        <StatCard
          icon="✅"
          label="Đã hoàn thành"
          value={statistics?.totalCompletedBookings ?? 0}
          bg="#EDE7F6"
        />
      </View>
    </ScrollView>
  );
}

/* ================= COMPONENT ================= */

function StatCard({
  icon,
  label,
  value,
  bg,
}: {
  icon: string;
  label: string;
  value: string | number;
  bg: string;
}) {
  return (
    <View style={[styles.card, { backgroundColor: bg }]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginTop: 20,
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: "48%",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 130,
  },
  icon: {
    fontSize: 30,
    marginBottom: 6,
  },
  value: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
  },
  label: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 6,
    textAlign: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 15,
    color: "#6B7280",
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
