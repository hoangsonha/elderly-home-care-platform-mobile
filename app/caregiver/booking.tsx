import { appointmentsDataMap } from "@/app/caregiver/appointment-detail";
import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { getAppointmentHasComplained, getAppointmentHasReviewed, getAppointmentStatus, subscribeToStatusChanges, updateAppointmentStatus } from "@/data/appointmentStore";
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
  avatar: string;
}

const mockBookings: Booking[] = [
  {
    id: "1",
    elderName: "Bà Nguyễn Thị Lan",
    age: 75,
    location: "Q7, TP.HCM",
    packageType: "Gói Cao Cấp",
    packageDetail: "Gói Cao Cấp",
    date: "Thứ 6, 25/10/2025",
    time: "8:00 - 16:00 (8 giờ)",
    address: "123 Nguyễn Văn Linh, P. Tân Phú, Q.7, TP.HCM",
    phone: "0909 123 456",
    price: 1100000,
    status: "Đang thực hiện",
    statusBadge: "Đang thực hiện",
    avatar: "👵",
  },
  {
    id: "2",
    elderName: "Ông Trần Văn Hùng",
    age: 68,
    location: "Q9, TP.HCM",
    packageType: "Gói Chuyên Nghiệp",
    packageDetail: "Gói Chuyên Nghiệp",
    date: "Thứ 7, 26/10/2025",
    time: "8:00 - 16:00 (8 giờ)",
    address: "456 Lê Văn Việt, P. Tăng Nhơn Phú A, Q.9, TP.HCM",
    phone: "0909 456 789",
    price: 750000,
    status: "Chờ thực hiện",
    statusBadge: "Chờ thực hiện",
    avatar: "👴",
  },
  {
    id: "3",
    elderName: "Bà Lê Thị Hoa",
    age: 82,
    location: "Q1, TP.HCM",
    packageType: "Gói Cơ Bản",
    packageDetail: "Gói Cơ Bản",
    date: "Chủ nhật, 27/10/2025",
    time: "8:00 - 12:00 (4 giờ)",
    address: "789 Pasteur, P. Bến Nghé, Q.1, TP.HCM",
    phone: "0909 789 123",
    price: 400000,
    status: "Mới",
    statusBadge: "Mới",
    avatar: "👵",
  },
  {
    id: "4",
    elderName: "Ông Phạm Văn Đức",
    age: 70,
    location: "Q2, TP.HCM",
    packageType: "Gói Chuyên Nghiệp",
    packageDetail: "Gói Chuyên Nghiệp",
    date: "Thứ 2, 20/10/2025",
    time: "8:00 - 16:00 (8 giờ)",
    address: "321 Nguyễn Duy Trinh, P. Bình Trưng Đông, Q.2, TP.HCM",
    phone: "0909 321 654",
    price: 750000,
    status: "Hoàn thành",
    statusBadge: "Hoàn thành",
    avatar: "👴",
  },
];

export default function BookingManagement() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as { initialTab?: BookingStatus } | undefined;
  
  const [activeTab, setActiveTab] = useState<BookingStatus>(params?.initialTab || "Mới");
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [refreshKey, setRefreshKey] = useState(0); // For triggering re-render when status changes
  
  // Map appointment status to booking status
  const mapStatusToBookingStatus = (status: string): BookingStatus => {
    switch (status) {
      case "new": return "Mới";
      case "pending": return "Chờ thực hiện";
      case "confirmed": return "Chờ thực hiện";
      case "in-progress": return "Đang thực hiện";
      case "completed": return "Hoàn thành";
      case "cancelled": return "Đã hủy";
      case "rejected": return "Đã hủy";
      default: return "Mới";
    }
  };

  // Update active tab when params change
  useEffect(() => {
    if (params?.initialTab) {
      setActiveTab(params.initialTab);
    }
  }, [params?.initialTab]);
  
  // Subscribe to status changes from global store
  useEffect(() => {
    const unsubscribe = subscribeToStatusChanges(() => {
      // Trigger re-render when appointment status changes
      setRefreshKey(prev => prev + 1);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  // Calculate tabs count using real-time status from global store
  // Re-calculate when refreshKey changes to ensure counts are updated
  const tabs: { label: BookingStatus; count: number }[] = React.useMemo(() => [
    { 
      label: "Mới", 
      count: bookings.filter((b) => {
        const globalStatus = getAppointmentStatus(b.id);
        const currentStatus = globalStatus ? mapStatusToBookingStatus(globalStatus) : b.status;
        return currentStatus === "Mới";
      }).length 
    },
    { 
      label: "Chờ thực hiện", 
      count: bookings.filter((b) => {
        const globalStatus = getAppointmentStatus(b.id);
        const currentStatus = globalStatus ? mapStatusToBookingStatus(globalStatus) : b.status;
        return currentStatus === "Chờ thực hiện";
      }).length 
    },
    { 
      label: "Đang thực hiện", 
      count: bookings.filter((b) => {
        const globalStatus = getAppointmentStatus(b.id);
        const currentStatus = globalStatus ? mapStatusToBookingStatus(globalStatus) : b.status;
        return currentStatus === "Đang thực hiện";
      }).length 
    },
    { 
      label: "Hoàn thành", 
      count: bookings.filter((b) => {
        const globalStatus = getAppointmentStatus(b.id);
        const currentStatus = globalStatus ? mapStatusToBookingStatus(globalStatus) : b.status;
        return currentStatus === "Hoàn thành";
      }).length 
    },
    { 
      label: "Đã hủy", 
      count: bookings.filter((b) => {
        const globalStatus = getAppointmentStatus(b.id);
        const currentStatus = globalStatus ? mapStatusToBookingStatus(globalStatus) : b.status;
        return currentStatus === "Đã hủy";
      }).length 
    },
  ], [bookings, refreshKey]);

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
          // Update global store
          updateAppointmentStatus(bookingId, "pending");
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
          // Update global store
          updateAppointmentStatus(bookingId, "rejected");
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
          // Update global store
          updateAppointmentStatus(bookingId, "cancelled");
          Alert.alert("Đã hủy", "Lịch hẹn đã được hủy");
        },
      },
    ]);
  };

  // Check if there's a conflict with other in-progress appointments
  const checkStartConflict = (targetAppointmentId: string) => {
    const targetAppointment = appointmentsDataMap[targetAppointmentId];
    if (!targetAppointment) return null;

    const targetContact = targetAppointment.elderly?.emergencyContact;
    const targetAddress = targetAppointment.elderly?.address;

    // Check all appointments (except current one) that are in-progress
    for (const [id, appointment] of Object.entries(appointmentsDataMap)) {
      if (id === targetAppointmentId) continue;

      const globalStatus = getAppointmentStatus(id);
      const currentStatus = globalStatus || appointment.status;

      // If another appointment is in-progress
      if (currentStatus === "in-progress") {
        const otherContact = appointment.elderly?.emergencyContact;
        const otherAddress = appointment.elderly?.address;

        // Check if same contact (prefer phone number, fallback to name)
        const sameContact = targetContact?.phone && otherContact?.phone
          ? targetContact.phone === otherContact.phone
          : targetContact?.name === otherContact?.name;
        
        // Normalize addresses for comparison (remove extra spaces, case insensitive)
        const normalizeAddress = (addr: string) => addr?.trim().toLowerCase() || "";
        const sameAddress = normalizeAddress(targetAddress) === normalizeAddress(otherAddress);

        // Only allow if same contact AND same address
        if (!(sameContact && sameAddress)) {
          return {
            conflictingAppointmentId: id,
            conflictingElderlyName: appointment.elderly?.name || "Không xác định",
            conflictingAddress: otherAddress || "Không xác định",
          };
        }
      }
    }

    return null; // No conflict
  };

  const handleStart = (bookingId: string) => {
    // Validate: Check if there's another in-progress appointment
    const conflict = checkStartConflict(bookingId);
    
    if (conflict) {
      Alert.alert(
        "Không thể bắt đầu lịch hẹn",
        `Bạn đang thực hiện lịch hẹn với ${conflict.conflictingElderlyName} tại ${conflict.conflictingAddress}.\n\nBạn chỉ có thể bắt đầu lịch hẹn mới khi:\n• Cùng người đặt (liên hệ khẩn cấp)\n• Cùng địa chỉ\n\nVui lòng hoàn thành lịch hẹn hiện tại trước.`,
        [{ text: "OK" }]
      );
      return;
    }

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
          // Update global store
          updateAppointmentStatus(bookingId, "in-progress");
          Alert.alert("Thành công", "Đã bắt đầu công việc");
        },
      },
    ]);
  };

  const handleComplete = (bookingId: string) => {
    // Helper function to get appointment tasks data
    // In real app, this would come from API or context
    const getAppointmentTasks = (id: string) => {
      // Mock task data - in real app, get from API/store
      const mockTasks: { [key: string]: any } = {
        "1": {
          fixed: [
            { id: "F1", title: "Đo huyết áp và đường huyết", completed: false },
            { id: "F2", title: "Hỗ trợ vệ sinh cá nhân", completed: false },
            { id: "F3", title: "Chuẩn bị bữa sáng", completed: false },
            { id: "F4", title: "Uống thuốc", completed: false },
          ],
          flexible: [
            { id: "FL1", title: "Vận động nhẹ", completed: false },
            { id: "FL2", title: "Dọn dẹp phòng ngủ", completed: false },
            { id: "FL3", title: "Giặt quần áo", completed: false },
          ],
        },
        "2": {
          fixed: [
            { id: "F1", title: "Đo huyết áp", completed: false },
            { id: "F2", title: "Hỗ trợ vận động nhẹ", completed: false },
            { id: "F3", title: "Uống thuốc", completed: false },
          ],
          flexible: [
            { id: "FL1", title: "Trò chuyện, đọc báo", completed: false },
          ],
        },
        "3": {
          fixed: [
            { id: "F1", title: "Hỗ trợ vệ sinh cá nhân", completed: false },
            { id: "F2", title: "Chuẩn bị bữa sáng", completed: false },
            { id: "F3", title: "Uống thuốc", completed: false },
          ],
          flexible: [
            { id: "FL1", title: "Trò chuyện, xem ảnh", completed: false },
            { id: "FL2", title: "Dọn dẹp phòng", completed: false },
          ],
        },
      };
      return mockTasks[id] || { fixed: [], flexible: [] };
    };

    // Validate tasks before completing
    const tasks = getAppointmentTasks(bookingId);
    const incompleteFixedTasks = tasks.fixed.filter((task: any) => !task.completed);
    const incompleteFlexibleTasks = tasks.flexible.filter((task: any) => !task.completed);

    if (incompleteFixedTasks.length > 0 || incompleteFlexibleTasks.length > 0) {
      const missingTasks = [];
      if (incompleteFixedTasks.length > 0) {
        missingTasks.push("Nhiệm vụ cố định:");
        incompleteFixedTasks.forEach((t: any) => missingTasks.push(`• ${t.title}`));
      }
      if (incompleteFlexibleTasks.length > 0) {
        missingTasks.push("Nhiệm vụ linh hoạt:");
        incompleteFlexibleTasks.forEach((t: any) => missingTasks.push(`• ${t.title}`));
      }

      Alert.alert(
        "Chưa hoàn thành nhiệm vụ",
        `Vui lòng hoàn thành tất cả nhiệm vụ cố định và linh hoạt trước khi kết thúc ca!\n\nCòn thiếu:\n${missingTasks.join("\n")}\n\nVui lòng vào trang chi tiết để hoàn thành các nhiệm vụ.`,
        [
          { text: "OK" },
          {
            text: "Xem chi tiết",
            onPress: () => {
              navigation.navigate("Appointment Detail" as never, { appointmentId: bookingId, fromScreen: "booking" } as never);
            },
          },
        ]
      );
      return;
    }

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
          // Update global store
          updateAppointmentStatus(bookingId, "completed");
          Alert.alert("Thành công", "Công việc đã hoàn thành");
        },
      },
    ]);
  };

  const handleReview = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      const hasReviewed = getAppointmentHasReviewed(bookingId);
      if (hasReviewed) {
        // Đã đánh giá rồi - Xem đánh giá
        (navigation.navigate as any)("View Review", {
          appointmentId: booking.id,
          elderlyName: booking.elderName,
          fromScreen: "booking",
        });
      } else {
        // Chưa đánh giá - Đánh giá mới
        (navigation.navigate as any)("Review", {
          appointmentId: booking.id,
          elderlyName: booking.elderName,
          fromScreen: "booking",
        });
      }
    }
  };

  const handleComplaint = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      const hasComplained = getAppointmentHasComplained(bookingId);
      if (hasComplained) {
        // Đã khiếu nại rồi - Xem khiếu nại (vẫn navigate đến complaint screen nhưng ở view mode)
        (navigation.navigate as any)("Complaint", {
          bookingId: booking.id,
          elderlyName: booking.elderName,
          date: booking.date,
          time: booking.time,
          packageName: booking.packageType,
          viewMode: true,
          fromScreen: "booking",
        });
      } else {
        // Chưa khiếu nại - Tạo khiếu nại mới
        (navigation.navigate as any)("Complaint", {
          bookingId: booking.id,
          elderlyName: booking.elderName,
          date: booking.date,
          time: booking.time,
          packageName: booking.packageType,
          fromScreen: "booking",
        });
      }
    }
  };

  const handleViewDetail = (bookingId: string) => {
    navigation.navigate("Appointment Detail" as never, { appointmentId: bookingId, fromScreen: "booking" } as never);
  };

  const renderBookingCard = ({ item, index }: { item: Booking; index: number }) => {
    // Get real-time status from global store
    const globalStatus = getAppointmentStatus(item.id);
    const currentStatus = globalStatus ? mapStatusToBookingStatus(globalStatus) : item.status;
    const hasComplained = getAppointmentHasComplained(item.id);
    
    return (
      <TouchableOpacity 
        style={[
          styles.card,
          hasComplained && styles.cardWithComplaint
        ]}
        onPress={() => handleViewDetail(item.id)}
        activeOpacity={0.7}
      >
        {/* Complaint Warning Badge */}
        {hasComplained && (
          <View style={styles.complaintWarningBadge}>
            <MaterialCommunityIcons name="alert-circle" size={16} color="#EF4444" />
            <Text style={styles.complaintWarningText}>Khiếu nại</Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>{item.avatar}</Text>
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
          {currentStatus === "Mới" && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleReject(item.id)}
              >
                <MaterialCommunityIcons name="close" size={16} color="#EF4444" />
                <Text style={styles.rejectButtonText}>Từ chối</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleAccept(item.id)}
              >
                <MaterialCommunityIcons name="check" size={16} color="#fff" />
                <Text style={styles.acceptButtonText}>Chấp nhận</Text>
              </TouchableOpacity>
            </>
          )}

          {currentStatus === "Chờ thực hiện" && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => handleCancel(item.id, item.date)}
              >
                <MaterialCommunityIcons name="close" size={16} color="#EF4444" />
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleStart(item.id)}
              >
                {/* <MaterialCommunityIcons name="play" size={16} color="#fff" /> */}
                <Text style={styles.acceptButtonText}>Bắt đầu</Text>
              </TouchableOpacity>
            </>
          )}

          {currentStatus === "Đang thực hiện" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleComplete(item.id)}
            >
              <MaterialCommunityIcons name="check-circle" size={16} color="#fff" />
              <Text style={styles.acceptButtonText}>Hoàn thành</Text>
            </TouchableOpacity>
          )}

          {currentStatus === "Hoàn thành" && (() => {
            const globalHasReviewed = getAppointmentHasReviewed(item.id);
            const globalHasComplained = getAppointmentHasComplained(item.id);
            return (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.complaintButton]}
                  onPress={() => handleComplaint(item.id)}
                >
                  <MaterialCommunityIcons name={globalHasComplained ? "eye" : "alert-circle"} size={16} color="#EF4444" />
                  <Text style={styles.complaintButtonText}>{globalHasComplained ? "Xem khiếu nại" : "Khiếu nại"}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.reviewButton]}
                  onPress={() => handleReview(item.id)}
                >
                  <MaterialCommunityIcons name={globalHasReviewed ? "eye" : "star"} size={16} color="#F59E0B" />
                  <Text style={styles.reviewButtonText}>{globalHasReviewed ? "Xem đánh giá" : "Đánh giá"}</Text>
                </TouchableOpacity>
              </>
            );
          })()}

          {currentStatus === "Đã hủy" && (
            <View style={styles.cancelledInfo}>
              <Text style={styles.cancelledText}>Lịch hẹn đã bị hủy</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Filter bookings by activeTab, using real-time status from global store
  // Re-calculate when refreshKey changes to ensure filtered list is updated
  const filteredBookings = React.useMemo(() => {
    return bookings.filter((b) => {
      const globalStatus = getAppointmentStatus(b.id);
      const currentStatus = globalStatus ? mapStatusToBookingStatus(globalStatus) : b.status;
      return currentStatus === activeTab;
    });
  }, [bookings, activeTab, refreshKey]);

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
                {tab.label}
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
        extraData={refreshKey}
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
  cardWithComplaint: {
    borderLeftColor: "#EF4444",
    borderWidth: 1,
    borderColor: "#FEE2E2",
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
  cancelledInfo: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  cancelledText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  complaintWarningBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    zIndex: 10,
  },
  complaintWarningText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#DC2626",
  },
});