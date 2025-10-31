import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type BookingStatus = "Mới" | "Chờ thực hiện" | "Đang thực hiện" | "Hoàn thành" | "Đã hủy";

interface Booking {
  id: string;
  elderName: string;
  age: number;
  location: string;
  packageType: string;
  packageDetail: string;
  date: string;
  time: string;
  address: string;
  phone: string;
  price: number;
  status: BookingStatus;
  statusBadge: string;
}

const mockBookings: Booking[] = [
  {
    id: "1",
    elderName: "Bà Nguyễn Thị Lan",
    age: 75,
    location: "Q7, TP.HCM",
    packageType: "Gói Cơ bản",
    packageDetail: "Gói Cơ bản",
    date: "Thứ 6, 25/10/2025",
    time: "8:00 - 12:00 (4 giờ)",
    address: "123 Nguyễn Văn Linh, P. Tân Phú, Q.7, TP.HCM",
    phone: "0909 123 456",
    price: 800000,
    status: "Mới",
    statusBadge: "Mới",
  },
  {
    id: "2",
    elderName: "Ông Trần Văn Hùng",
    age: 68,
    location: "Q9, TP.HCM",
    packageType: "Gói Chuyên sâu",
    packageDetail: "Gói Chuyên sâu",
    date: "Thứ 7, 26/10/2025",
    time: "8:00 - 12:00 (4 giờ)",
    address: "456 Lê Văn Việt, P. Tăng Nhơn Phú A, Q.9, TP.HCM",
    phone: "0909 456 789",
    price: 900000,
    status: "Chờ thực hiện",
    statusBadge: "Mới",
  },
  {
    id: "3",
    elderName: "Bà Lê Thị Hoa",
    age: 82,
    location: "Q1, TP.HCM",
    packageType: "Gói Đặc biệt",
    packageDetail: "Gói Đặc biệt",
    date: "Chủ nhật, 27/10/2025",
    time: "8:00 - 16:00 (8 giờ)",
    address: "789 Pasteur, P. Bến Nghé, Q.1, TP.HCM",
    phone: "0909 789 123",
    price: 1600000,
    status: "Mới",
    statusBadge: "Mới",
  },
];

export default function BookingManagement() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as { initialTab?: BookingStatus } | undefined;
  
  const [activeTab, setActiveTab] = useState<BookingStatus>(params?.initialTab || "Mới");
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);

  // Update active tab when params change
  useEffect(() => {
    if (params?.initialTab) {
      setActiveTab(params.initialTab);
    }
  }, [params?.initialTab]);

  const tabs: { label: BookingStatus; count: number }[] = [
    { label: "Mới", count: bookings.filter((b) => b.status === "Mới").length },
    { label: "Chờ thực hiện", count: bookings.filter((b) => b.status === "Chờ thực hiện").length },
    { label: "Đang thực hiện", count: bookings.filter((b) => b.status === "Đang thực hiện").length },
    { label: "Hoàn thành", count: bookings.filter((b) => b.status === "Hoàn thành").length },
    { label: "Đã hủy", count: bookings.filter((b) => b.status === "Đã hủy").length },
  ];

  const canCancelBooking = (dateStr: string): boolean => {
    const bookingDate = new Date(dateStr.split(", ")[1].split("/").reverse().join("-"));
    const today = new Date();
    const diffTime = bookingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 3;
  };

  const handleAccept = (bookingId: string) => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn chấp nhận yêu cầu này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Chấp nhận",
        onPress: () => {
          setBookings((prev) =>
            prev.map((b) =>
              b.id === bookingId ? { ...b, status: "Chờ thực hiện" } : b
            )
          );
          Alert.alert("Thành công", "Đã chấp nhận yêu cầu");
        },
      },
    ]);
  };

  const handleReject = (bookingId: string) => {
    Alert.alert("Từ chối", "Bạn có chắc chắn muốn từ chối yêu cầu này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Từ chối",
        style: "destructive",
        onPress: () => {
          setBookings((prev) =>
            prev.map((b) => (b.id === bookingId ? { ...b, status: "Đã hủy" } : b))
          );
          Alert.alert("Đã từ chối", "Yêu cầu đã bị từ chối");
        },
      },
    ]);
  };

  const handleCancel = (bookingId: string, dateStr: string) => {
    if (!canCancelBooking(dateStr)) {
      Alert.alert(
        "Không thể hủy",
        "Bạn chỉ có thể hủy lịch hẹn trước 3 ngày. Lịch hẹn này còn ít hơn 3 ngày nên không thể hủy."
      );
      return;
    }

    Alert.alert("Hủy lịch hẹn", "Bạn có chắc chắn muốn hủy lịch hẹn này?", [
      { text: "Không", style: "cancel" },
      {
        text: "Hủy lịch",
        style: "destructive",
        onPress: () => {
          setBookings((prev) =>
            prev.map((b) => (b.id === bookingId ? { ...b, status: "Đã hủy" } : b))
          );
          Alert.alert("Đã hủy", "Lịch hẹn đã được hủy");
        },
      },
    ]);
  };

  const handleStart = (bookingId: string) => {
    Alert.alert("Bắt đầu công việc", "Xác nhận bắt đầu thực hiện công việc?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Bắt đầu",
        onPress: () => {
          setBookings((prev) =>
            prev.map((b) =>
              b.id === bookingId ? { ...b, status: "Đang thực hiện" } : b
            )
          );
          Alert.alert("Thành công", "Đã bắt đầu công việc");
        },
      },
    ]);
  };

  const handleComplete = (bookingId: string) => {
    Alert.alert("Hoàn thành", "Xác nhận hoàn thành công việc?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Hoàn thành",
        onPress: () => {
          setBookings((prev) =>
            prev.map((b) =>
              b.id === bookingId ? { ...b, status: "Hoàn thành" } : b
            )
          );
          Alert.alert("Thành công", "Công việc đã hoàn thành");
        },
      },
    ]);
  };

  const handleReview = (bookingId: string) => {
    Alert.alert("Đánh giá", "Tính năng đánh giá đang được phát triển");
  };

  const handleComplaint = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      (navigation.navigate as any)("Complaint", {
        bookingId: booking.id,
        elderlyName: booking.elderName,
        date: booking.date,
        time: booking.time,
        packageName: booking.packageType,
      });
    }
  };

  const handleViewDetail = (bookingId: string) => {
    navigation.navigate("Appointment Detail" as never);
  };

  const renderBookingCard = ({ item, index }: { item: Booking; index: number }) => {
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => handleViewDetail(item.id)}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>👵</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.elderName}>{item.elderName}</Text>
            <View style={styles.elderMeta}>
              <MaterialCommunityIcons name="account" size={14} color="#6B7280" />
              <Text style={styles.metaText}>{item.age} tuổi</Text>
            </View>
          </View>
        </View>

        {/* Package Detail */}
        <View style={styles.packageDetail}>
          <MaterialCommunityIcons name="calendar-clock" size={16} color="#8B5CF6" />
          <Text style={styles.packageDetailText}>{item.packageDetail}</Text>
        </View>

        {/* Date & Time */}
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="calendar" size={18} color="#6B7280" />
          <Text style={styles.infoText}>{item.date}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="clock-outline" size={18} color="#6B7280" />
          <Text style={styles.infoText}>{item.time}</Text>
        </View>

        {/* Address */}
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="map-marker" size={18} color="#6B7280" />
          <Text style={styles.infoText}>{item.address}</Text>
        </View>

        {/* Phone */}
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="phone" size={18} color="#6B7280" />
          <Text style={styles.infoText}>{item.phone}</Text>
        </View>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.priceIcon}>💰</Text>
          <Text style={styles.priceText}>{item.price.toLocaleString()}đ</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {item.status === "Mới" && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleAccept(item.id)}
              >
                <MaterialCommunityIcons name="check" size={16} color="#fff" />
                <Text style={styles.acceptButtonText}>Chấp nhận</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleReject(item.id)}
              >
                <MaterialCommunityIcons name="close" size={16} color="#EF4444" />
                <Text style={styles.rejectButtonText}>Từ chối</Text>
              </TouchableOpacity>
            </>
          )}

          {item.status === "Chờ thực hiện" && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleStart(item.id)}
              >
                {/* <MaterialCommunityIcons name="play" size={16} color="#fff" /> */}
                <Text style={styles.acceptButtonText}>Bắt đầu</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => handleCancel(item.id, item.date)}
              >
                <MaterialCommunityIcons name="close" size={16} color="#EF4444" />
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
            </>
          )}

          {item.status === "Đang thực hiện" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleComplete(item.id)}
            >
              <MaterialCommunityIcons name="check-circle" size={16} color="#fff" />
              <Text style={styles.acceptButtonText}>Hoàn thành</Text>
            </TouchableOpacity>
          )}

          {item.status === "Hoàn thành" && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.reviewButton]}
                onPress={() => handleReview(item.id)}
              >
                <MaterialCommunityIcons name="star" size={16} color="#F59E0B" />
                <Text style={styles.reviewButtonText}>Đánh giá</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.complaintButton]}
                onPress={() => handleComplaint(item.id)}
              >
                <MaterialCommunityIcons name="alert-circle" size={16} color="#EF4444" />
                <Text style={styles.complaintButtonText}>Khiếu nại</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const filteredBookings = bookings.filter((b) => b.status === activeTab);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* <Text style={styles.title}>Quản lý yêu cầu đặt lịch</Text> */}
        <Text style={styles.subtitle}>
          Theo dõi và xử lý các yêu cầu lịch chăm sóc theo trạng thái.
        </Text>
      </View>

      {/* 5 Status Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.label}
              style={[styles.tab, activeTab === tab.label && styles.tabActive]}
              onPress={() => setActiveTab(tab.label)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.label && styles.tabTextActive,
                ]}
              >
                {tab.label} ({tab.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Booking List */}
      <FlatList
        data={filteredBookings}
        renderItem={renderBookingCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 40,
            }}
          >
            <Text style={{ fontSize: 14, color: "#9CA3AF" }}>
              Không có yêu cầu nào
            </Text>
          </View>
        }
      />

      {/* Bottom Navigation */}
      <CaregiverBottomNav activeTab="jobs" />
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
  tabContainer: {
    marginBottom: 16,
  },
  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 8,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#f2f2f2",
    margin: 4,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 160,
    height: 40,
  },
  tabActive: {
    backgroundColor: "#1F6FEB",
  },
  tabText: {
    fontSize: 13,
    color: "#333",
    fontWeight: "600",
    textAlign: "center",
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#1F6FEB",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 28,
  },
  headerInfo: {
    flex: 1,
  },
  elderName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  elderMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: "#6B7280",
  },
  metaDot: {
    fontSize: 13,
    color: "#6B7280",
    marginHorizontal: 2,
  },
  statusBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#D97706",
  },
  packageBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
    gap: 6,
  },
  packageUrgent: {
    backgroundColor: "#FEE2E2",
  },
  packageText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  packageTextUrgent: {
    color: "#EF4444",
  },
  packageDetail: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F3FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
    gap: 6,
  },
  packageDetailText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8B5CF6",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#374151",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 12,
    gap: 6,
  },
  priceIcon: {
    fontSize: 18,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10B981",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: "#10B981",
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  rejectButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
  },
  detailButton: {
    backgroundColor: "#1F6FEB",
  },
  detailButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
  },
  reviewButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F59E0B",
  },
  complaintButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  complaintButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
  },
});