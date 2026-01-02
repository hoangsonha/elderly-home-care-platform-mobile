import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useBottomNavPadding } from "@/hooks/useBottomNavPadding";
import { mainService, type MyCareServiceData } from "@/services/main.service";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

type TabStatus = "Tất cả" | "Mới" | "Chờ thực hiện" | "Đang thực hiện" | "Hoàn thành" | "Đã hủy" | "Đã hết hạn";

const STATUS_MAP: Record<TabStatus, string | null> = {
  "Tất cả": null,
  "Mới": "PENDING_CAREGIVER",
  "Chờ thực hiện": "CAREGIVER_APPROVED",
  "Đang thực hiện": "IN_PROGRESS",
  "Hoàn thành": "COMPLETED",
  "Đã hủy": "CANCELLED",
  "Đã hết hạn": "EXPIRED",
};

interface BookingItem {
  careServiceId: string;
  careSeekerName: string;
  careSeekerAge: number;
  careSeekerPhone: string;
  elderlyName: string;
  elderlyAge: number;
  elderlyGender: string;
  packageName: string;
  workDate: string;
  startTime: string;
  endTime: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  totalPrice: number;
  caregiverEarnings: number;
  status: string;
  bookingCode: string;
  responseDeadline: string | null;
  timeRemaining: string | null;
}

export default function BookingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const bottomNavPadding = useBottomNavPadding();
  
  const [activeTab, setActiveTab] = useState<TabStatus>(route.params?.initialTab || "Tất cả");
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // Calculate time remaining until deadline
  const calculateTimeRemaining = useCallback((deadline: string | null): string | null => {
    if (!deadline) return null;
    
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();
    
    if (diff <= 0) return "Đã hết hạn";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `Còn ${hours}h ${minutes.toString().padStart(2, '0')}m`;
  }, []);

  // Fetch bookings from API
  const fetchBookings = useCallback(async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const statusFilter = STATUS_MAP[activeTab];
      const response = await mainService.getMyCareServices(undefined, statusFilter || undefined);

      if (response.status === "Success" && response.data) {
        const mappedBookings: BookingItem[] = response.data.map((service: MyCareServiceData) => {
          // Parse location
          let locationObj = { address: "", latitude: 0, longitude: 0 };
          try {
            if (typeof service.location === "string") {
              locationObj = JSON.parse(service.location);
            } else {
              locationObj = service.location as any;
            }
          } catch (e) {
            locationObj = {
              address: service.elderlyProfile.location.address,
              latitude: service.elderlyProfile.location.latitude,
              longitude: service.elderlyProfile.location.longitude,
            };
          }

          return {
            careServiceId: service.careServiceId,
            careSeekerName: service.careSeekerProfile.fullName,
            careSeekerAge: service.careSeekerProfile.age,
            careSeekerPhone: service.careSeekerProfile.phoneNumber,
            elderlyName: service.elderlyProfile.fullName,
            elderlyAge: service.elderlyProfile.age,
            elderlyGender: service.elderlyProfile.gender,
            packageName: service.servicePackage.packageName,
            workDate: service.workDate,
            startTime: service.startTime.split(":").slice(0, 2).join(":"),
            endTime: service.endTime.split(":").slice(0, 2).join(":"),
            location: locationObj,
            totalPrice: service.totalPrice,
            caregiverEarnings: service.caregiverEarnings,
            status: service.status,
            bookingCode: service.bookingCode,
            responseDeadline: service.caregiverResponseDeadline || null,
            timeRemaining: calculateTimeRemaining(service.caregiverResponseDeadline),
          };
        });
        setBookings(mappedBookings);
      } else {
        setBookings([]);
      }
    } catch (error: any) {
      console.error("Error fetching bookings:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách yêu cầu. Vui lòng thử lại.");
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, calculateTimeRemaining]);

  // Refresh when screen is focused or tab changes
  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [fetchBookings])
  );

  // Handle accept booking
  const handleAccept = useCallback(async (booking: BookingItem) => {
    Alert.alert(
      "Xác nhận chấp nhận",
      `Bạn có chắc chắn muốn chấp nhận yêu cầu chăm sóc ${booking.elderlyName}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Chấp nhận",
          onPress: async () => {
            try {
              setProcessingIds((prev) => new Set(prev).add(booking.careServiceId));
              const response = await mainService.acceptCareService(booking.careServiceId);

              if (response.status === "Success") {
                Alert.alert("Thành công", "Bạn đã chấp nhận yêu cầu thành công!");
                fetchBookings(); // Refresh list
              } else {
                Alert.alert("Lỗi", response.message || "Không thể chấp nhận yêu cầu");
              }
            } catch (error: any) {
              Alert.alert("Lỗi", "Có lỗi xảy ra. Vui lòng thử lại.");
            } finally {
              setProcessingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(booking.careServiceId);
                return newSet;
              });
            }
          },
        },
      ]
    );
  }, [fetchBookings]);

  // Handle decline booking
  const handleDecline = useCallback(async (booking: BookingItem) => {
    Alert.prompt(
      "Từ chối yêu cầu",
      "Vui lòng nhập lý do từ chối (không bắt buộc):",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Từ chối",
          style: "destructive",
          onPress: async (note) => {
            try {
              setProcessingIds((prev) => new Set(prev).add(booking.careServiceId));
              const response = await mainService.declineCareService(booking.careServiceId, note);

              if (response.status === "Success") {
                Alert.alert("Thành công", "Bạn đã từ chối yêu cầu.");
                fetchBookings(); // Refresh list
              } else {
                Alert.alert("Lỗi", response.message || "Không thể từ chối yêu cầu");
              }
            } catch (error: any) {
              Alert.alert("Lỗi", "Có lỗi xảy ra. Vui lòng thử lại.");
            } finally {
              setProcessingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(booking.careServiceId);
                return newSet;
              });
            }
          },
        },
      ],
      "plain-text"
    );
  }, [fetchBookings]);

  // Open map view
  const handleShowMap = useCallback((location: { latitude: number; longitude: number; address: string }) => {
    setSelectedLocation(location);
    setShowMapModal(true);
  }, []);

  // Open phone dialer
  const handleCallPhone = useCallback((phone: string) => {
    const phoneUrl = Platform.OS === "ios" ? `telprompt:${phone}` : `tel:${phone}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        }
        Alert.alert("Lỗi", "Không thể mở ứng dụng gọi điện");
      })
      .catch((err) => console.error("Error opening phone:", err));
  }, []);

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const dayOfWeek = days[date.getDay()];
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${dayOfWeek}, ${day}/${month}/${year}`;
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING_CAREGIVER":
        return "#3B82F6";
      case "CAREGIVER_APPROVED":
        return "#F59E0B";
      case "IN_PROGRESS":
        return "#8B5CF6";
      case "COMPLETED":
        return "#10B981";
      case "CANCELLED":
        return "#EF4444";
      case "EXPIRED":
        return "#6B7280";
      default:
        return "#9CA3AF";
    }
  };

  // Get status text in Vietnamese
  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING_CAREGIVER":
        return "Mới";
      case "CAREGIVER_APPROVED":
        return "Chờ thực hiện";
      case "IN_PROGRESS":
        return "Đang thực hiện";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      case "EXPIRED":
        return "Đã hết hạn";
      default:
        return "Không xác định";
    }
  };

  // Render booking item
  const renderBookingItem = ({ item }: { item: BookingItem }) => {
    const isProcessing = processingIds.has(item.careServiceId);
    const isNew = item.status === "PENDING_CAREGIVER";

    return (
      <View style={styles.bookingCard}>
        {/* Booking Code at top */}
        <Text style={styles.bookingCodeTop}>Mã: {item.bookingCode}</Text>

        {/* Header with Name and Status */}
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={48} color="#68C2E8" />
          </View>
          <View style={styles.headerInfo}>
            <View style={styles.nameStatusRow}>
              <Text style={styles.careSeekerName}>{item.careSeekerName}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusBadgeText}>{getStatusText(item.status)}</Text>
              </View>
            </View>
            <Text style={styles.careSeekerAge}>{item.careSeekerAge} tuổi</Text>
            {isNew && item.timeRemaining && (
              <View style={styles.deadlineContainer}>
                <Ionicons name="time-outline" size={14} color="#EF4444" />
                <Text style={styles.deadlineText}>{item.timeRemaining}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Package Info */}
        <View style={styles.infoRow}>
          <Ionicons name="cube-outline" size={16} color="#6B7280" />
          <Text style={styles.infoText}>Gói dịch vụ: {item.packageName}</Text>
        </View>

        {/* Elderly Info */}
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={16} color="#6B7280" />
          <Text style={styles.infoText}>
            Chăm sóc: {item.elderlyName} ({item.elderlyAge} tuổi)
          </Text>
        </View>

        {/* Date & Time */}
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text style={styles.infoText}>
            {formatDate(item.workDate)} • {item.startTime} - {item.endTime}
          </Text>
        </View>

        {/* Action Buttons - Map and Phone */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleShowMap(item.location)}>
            <Ionicons name="location" size={18} color="#3B82F6" />
            <Text style={styles.actionButtonText}>Xem bản đồ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleCallPhone(item.careSeekerPhone)}>
            <Ionicons name="call" size={18} color="#10B981" />
            <Text style={styles.actionButtonText}>Gọi điện</Text>
          </TouchableOpacity>
        </View>

        {/* Price Info */}
        <View style={styles.priceContainer}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Giá gói:</Text>
            <Text style={styles.priceValue}>{formatPrice(item.totalPrice)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Bạn sẽ nhận sau khi hoàn thành:</Text>
            <Text style={styles.earningValue}>{formatPrice(item.caregiverEarnings)}</Text>
          </View>
        </View>

        {/* Actions for NEW status */}
        {isNew && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.declineButton]}
              onPress={() => handleDecline(item)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Text style={styles.declineButtonText}>Từ chối</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={() => handleAccept(item)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.acceptButtonText}>Chấp nhận</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const tabs: TabStatus[] = ["Tất cả", "Mới", "Chờ thực hiện", "Đang thực hiện", "Hoàn thành", "Đã hủy", "Đã hết hạn"];

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          data={tabs}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.tab, activeTab === item && styles.activeTab]}
              onPress={() => setActiveTab(item)}
            >
              <Text style={[styles.tabText, activeTab === item && styles.activeTabText]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Bookings List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#68C2E8" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.careServiceId}
          renderItem={renderBookingItem}
          contentContainerStyle={[styles.listContainer, { paddingBottom: bottomNavPadding }]}
          refreshing={refreshing}
          onRefresh={() => fetchBookings(true)}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>Chưa có yêu cầu nào</Text>
            </View>
          }
        />
      )}

      {/* Map Modal */}
      <Modal visible={showMapModal} animationType="slide" onRequestClose={() => setShowMapModal(false)}>
        <View style={styles.mapModalContainer}>
          <View style={styles.mapHeader}>
            <Text style={styles.mapHeaderTitle}>Vị trí chăm sóc</Text>
            <TouchableOpacity onPress={() => setShowMapModal(false)} style={styles.mapCloseButton}>
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>
          {selectedLocation && (
            <>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                  }}
                  title="Vị trí chăm sóc"
                  description={selectedLocation.address}
                />
              </MapView>
              <View style={styles.mapAddressContainer}>
                <Text style={styles.mapAddress}>{selectedLocation.address}</Text>
              </View>
            </>
          )}
        </View>
      </Modal>

      <CaregiverBottomNav activeTab="jobs" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  tabsContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  activeTab: {
    backgroundColor: "#68C2E8",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#9CA3AF",
  },
  bookingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingCodeTop: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 12,
    fontWeight: "500",
  },
  cardHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  nameStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  careSeekerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  careSeekerAge: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  deadlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  deadlineText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#EF4444",
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 8,
    flex: 1,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
    marginLeft: 6,
  },
  priceContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  priceLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  earningValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10B981",
  },
  actionsContainer: {
    flexDirection: "row",
    marginTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  declineButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#EF4444",
  },
  declineButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#EF4444",
  },
  acceptButton: {
    backgroundColor: "#10B981",
  },
  acceptButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  mapHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 45,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  mapHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  mapCloseButton: {
    padding: 4,
  },
  map: {
    flex: 1,
  },
  mapAddressContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  mapAddress: {
    fontSize: 14,
    color: "#1F2937",
  },
});
