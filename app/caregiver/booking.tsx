import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useBottomNavPadding } from "@/hooks/useBottomNavPadding";
import { mainService, type MyCareServiceData } from "@/services/main.service";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectSuccessModal, setShowRejectSuccessModal] = useState(false);
  
  // Ref for FlatList to scroll to specific item
  const flatListRef = useRef<FlatList>(null);
  
  // Get careServiceId from route params (for scrolling to specific item from notification)
  const targetCareServiceId = route.params?.careServiceId;

  // Update activeTab when route params change (from notification)
  useEffect(() => {
    if (route.params?.initialTab) {
      const newTab = route.params.initialTab as TabStatus;
      if (newTab !== activeTab) {
        console.log('Booking: Updating activeTab from params:', newTab);
        setActiveTab(newTab);
      }
    }
  }, [route.params?.initialTab]);

  // If targetCareServiceId is provided but not found in current tab, switch to "Tất cả" tab to find it
  useEffect(() => {
    if (targetCareServiceId && bookings.length > 0 && activeTab !== "Tất cả") {
      const found = bookings.find(item => item.careServiceId === targetCareServiceId);
      if (!found) {
        console.log('Booking: Item not found in current tab, switching to "Tất cả" tab. Current tab:', activeTab, 'careServiceId:', targetCareServiceId);
        // Item không có trong tab hiện tại - có thể status đã thay đổi
        // Tự động switch sang tab "Tất cả" để tìm item
        setActiveTab("Tất cả");
      }
    }
  }, [targetCareServiceId, bookings, activeTab]);

  // If targetCareServiceId is provided but not found in current tab, try fetching all items
  useEffect(() => {
    if (targetCareServiceId && bookings.length > 0) {
      const found = bookings.find(item => item.careServiceId === targetCareServiceId);
      if (!found && activeTab !== "Tất cả") {
        console.log('Booking: Item not found in current tab, but careServiceId provided. Current tab:', activeTab);
        // Item không có trong tab hiện tại - có thể status đã thay đổi
        // Có thể tự động switch sang tab "Tất cả" để tìm item
        // Hoặc giữ nguyên và để user tự tìm
      }
    }
  }, [targetCareServiceId, bookings, activeTab]);

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
        
        // Log booking statuses
        console.log('Booking Statuses after fetch:');
        mappedBookings.forEach((booking) => {
          console.log(`  - careServiceId: ${booking.careServiceId}, status: ${booking.status}`);
        });
        
        // Scroll to specific item if careServiceId is provided (from notification)
        if (targetCareServiceId && !isRefreshing && flatListRef.current) {
          setTimeout(() => {
            const index = mappedBookings.findIndex(
              (item) => item.careServiceId === targetCareServiceId
            );
            if (index !== -1) {
              console.log('Booking: Scrolling to item at index:', index, 'careServiceId:', targetCareServiceId);
              try {
              flatListRef.current?.scrollToIndex({
                index,
                animated: true,
                viewPosition: 0.5, // Center the item
              });
              } catch (error) {
                console.error('Booking: Error scrolling to index:', error);
                // Fallback: scroll to offset
                flatListRef.current?.scrollToOffset({
                  offset: index * 200, // Approximate item height
                  animated: true,
                });
              }
            } else {
              console.log('Booking: Item not found in current tab. careServiceId:', targetCareServiceId, 'activeTab:', activeTab, 'totalItems:', mappedBookings.length);
              // Item không có trong tab hiện tại - có thể status đã thay đổi
              // Có thể hiển thị thông báo hoặc tự động switch sang tab "Tất cả" để tìm
            }
          }, 500); // Tăng delay để đảm bảo FlatList đã render xong
        }
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
  }, [activeTab, calculateTimeRemaining, targetCareServiceId]);

  // Refresh when screen is focused or tab changes
  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [fetchBookings])
  );

  // Handle accept booking - show modal
  const handleAccept = useCallback((booking: BookingItem) => {
    setSelectedBooking(booking);
    setShowAcceptModal(true);
  }, []);

  // Confirm accept booking
  const confirmAccept = useCallback(async () => {
    if (!selectedBooking) return;

    try {
      setShowAcceptModal(false);
      setProcessingIds((prev) => new Set(prev).add(selectedBooking.careServiceId));
      const response = await mainService.acceptCareService(selectedBooking.careServiceId);

      if (response.status === "Success") {
        setShowSuccessModal(true);
        fetchBookings(); // Refresh list
      } else {
        setErrorMessage(response.message || "Không thể chấp nhận yêu cầu");
        setShowErrorModal(true);
      }
    } catch (error: any) {
      setErrorMessage("Có lỗi xảy ra. Vui lòng thử lại.");
      setShowErrorModal(true);
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(selectedBooking.careServiceId);
        return newSet;
      });
    }
  }, [selectedBooking, fetchBookings]);

  // Handle decline booking - show modal
  const handleDecline = useCallback((booking: BookingItem) => {
    setSelectedBooking(booking);
    setRejectReason("");
    setShowRejectModal(true);
  }, []);

  // Confirm decline booking
  const confirmDecline = useCallback(async () => {
    if (!selectedBooking) return;

    try {
      setShowRejectModal(false);
      setProcessingIds((prev) => new Set(prev).add(selectedBooking.careServiceId));
      const response = await mainService.declineCareService(selectedBooking.careServiceId, rejectReason || undefined);

      if (response.status === "Success") {
        setShowRejectSuccessModal(true);
        fetchBookings(); // Refresh list
      } else {
        setErrorMessage(response.message || "Không thể từ chối yêu cầu");
        setShowErrorModal(true);
      }
    } catch (error: any) {
      Alert.alert("Lỗi", "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(selectedBooking.careServiceId);
        return newSet;
      });
    }
  }, [selectedBooking, rejectReason, fetchBookings]);

  // Open map view in external app
  const handleShowMap = useCallback((location: { latitude: number; longitude: number; address: string }) => {
    if (!location.latitude || !location.longitude || location.latitude === 0 || location.longitude === 0) {
      Alert.alert("Thông báo", "Chưa có tọa độ địa điểm");
      return;
    }

    const lat = location.latitude;
    const lng = location.longitude;
    
    const url = Platform.select({
      ios: `maps://maps.apple.com/?q=${lat},${lng}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}`,
    });

    const webUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    Linking.openURL(url || webUrl).catch((err) => {
      console.error("Error opening maps:", err);
      Alert.alert("Lỗi", "Không thể mở bản đồ");
    });
  }, []);

  // Open phone dialer
  const handleCallPhone = useCallback((phone: string) => {
    console.log("handleCallPhone called with:", phone);
    
    if (!phone || phone.trim() === "") {
      Alert.alert("Thông báo", "Chưa có số điện thoại");
      return;
    }

    // Remove all spaces, dashes, parentheses, and other formatting characters
    // Keep only digits and + sign
    let cleanPhone = phone.replace(/[\s\-\(\)\.]/g, "");
    
    // If phone starts with +84 (Vietnam country code), keep it
    // If phone starts with 84 (without +), add +
    // If phone starts with 0, remove 0 and add +84
    if (cleanPhone.startsWith("+84")) {
      // Already in international format
    } else if (cleanPhone.startsWith("84") && cleanPhone.length >= 10) {
      cleanPhone = "+" + cleanPhone;
    } else if (cleanPhone.startsWith("0")) {
      cleanPhone = "+84" + cleanPhone.substring(1);
    } else if (cleanPhone.length >= 9 && cleanPhone.length <= 10) {
      // Assume it's a Vietnamese phone number without country code
      cleanPhone = "+84" + cleanPhone;
    }
    
    // Final cleanup: remove any remaining non-digit characters except +
    cleanPhone = cleanPhone.replace(/[^\d+]/g, "");
    
    // Ensure it starts with + for international format
    if (!cleanPhone.startsWith("+")) {
      cleanPhone = "+" + cleanPhone;
    }
    
    console.log("Cleaned phone:", cleanPhone);
    
    // For Android, use tel: scheme (works better)
    // For iOS, use telprompt: to show confirmation dialog
    const phoneUrl = Platform.OS === "ios" ? `telprompt:${cleanPhone}` : `tel:${cleanPhone}`;
    
    console.log("Phone URL:", phoneUrl);
    
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        console.log("Can open URL:", supported);
        if (supported) {
          return Linking.openURL(phoneUrl);
        } else {
          // Try with tel: scheme for both platforms
          const fallbackUrl = `tel:${cleanPhone}`;
          console.log("Trying fallback URL:", fallbackUrl);
          return Linking.openURL(fallbackUrl).catch((err) => {
            console.error("Fallback URL also failed:", err);
            Alert.alert("Lỗi", "Không thể mở ứng dụng gọi điện. Vui lòng kiểm tra số điện thoại.");
          });
        }
      })
      .catch((err) => {
        console.error("Error opening phone:", err);
        Alert.alert("Lỗi", `Không thể mở ứng dụng gọi điện. Lỗi: ${err.message || "Không xác định"}`);
      });
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

  // Handle card press to view details
  const handleCardPress = useCallback((item: BookingItem) => {
    console.log('Navigating to appointment detail with ID:', item.careServiceId);
    
    // Use React Navigation since CaregiverSidebar uses Drawer Navigator
    (navigation.navigate as any)("Appointment Detail", {
      appointmentId: item.careServiceId,
      fromScreen: "booking",
    });
  }, [navigation]);

  // Render booking item
  const renderBookingItem = ({ item }: { item: BookingItem }) => {
    const isProcessing = processingIds.has(item.careServiceId);
    const isNew = item.status === "PENDING_CAREGIVER";

    return (
      <TouchableOpacity
        style={styles.bookingCard}
        onPress={() => handleCardPress(item)}
        activeOpacity={0.7}
      >
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
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              handleShowMap(item.location);
            }}
          >
            <Ionicons name="location" size={18} color="#3B82F6" />
            <Text style={styles.actionButtonText}>Xem bản đồ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              handleCallPhone(item.careSeekerPhone);
            }}
          >
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
              style={[styles.button, styles.declineButton, isProcessing && styles.buttonDisabled]}
              onPress={(e) => {
                e.stopPropagation();
                if (!isProcessing) {
                  handleDecline(item);
                }
              }}
              disabled={isProcessing}
              activeOpacity={0.7}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Text style={styles.declineButtonText}>Từ chối</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={(e) => {
                e.stopPropagation();
                handleAccept(item);
              }}
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
      </TouchableOpacity>
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
          ref={flatListRef}
          data={bookings}
          keyExtractor={(item) => item.careServiceId}
          renderItem={renderBookingItem}
          contentContainerStyle={[styles.listContainer, { paddingBottom: bottomNavPadding }]}
          refreshing={refreshing}
          onRefresh={() => fetchBookings(true)}
          onScrollToIndexFailed={(info) => {
            // Handle scroll failure gracefully
            console.warn("Failed to scroll to index:", info);
            // Try scrolling to offset instead
            setTimeout(() => {
              flatListRef.current?.scrollToOffset({
                offset: info.averageItemLength * info.index,
                animated: true,
              });
            }, 100);
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>Chưa có yêu cầu nào</Text>
            </View>
          }
        />
      )}

      {/* Accept Confirmation Modal */}
      <Modal
        visible={showAcceptModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAcceptModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContent}>
            <View style={styles.confirmIconContainer}>
              <View style={styles.confirmIconCircle}>
                <Ionicons name="checkmark-circle" size={48} color="#10B981" />
              </View>
            </View>
            <Text style={styles.confirmModalTitle}>Xác nhận chấp nhận</Text>
            <Text style={styles.confirmModalMessage}>
              Bạn có chắc chắn muốn chấp nhận yêu cầu chăm sóc{" "}
              <Text style={styles.confirmModalHighlight}>{selectedBooking?.elderlyName}</Text>?
            </Text>
            <View style={styles.confirmModalInfo}>
              <View style={styles.confirmInfoRow}>
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Text style={styles.confirmInfoText}>
                  {selectedBooking && formatDate(selectedBooking.workDate)} • {selectedBooking?.startTime} - {selectedBooking?.endTime}
                </Text>
              </View>
              <View style={styles.confirmInfoRow}>
                <Ionicons name="cube-outline" size={16} color="#6B7280" />
                <Text style={styles.confirmInfoText}>{selectedBooking?.packageName}</Text>
              </View>
              <View style={styles.confirmInfoRow}>
                <Ionicons name="cash-outline" size={16} color="#6B7280" />
                <Text style={styles.confirmInfoText}>
                  Bạn sẽ nhận: <Text style={styles.confirmEarningText}>{selectedBooking && formatPrice(selectedBooking.caregiverEarnings)}</Text>
                </Text>
              </View>
            </View>
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity
                style={styles.confirmCancelButton}
                onPress={() => setShowAcceptModal(false)}
              >
                <Text style={styles.confirmCancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmAcceptButton}
                onPress={confirmAccept}
              >
                <Text style={styles.confirmAcceptButtonText}>Chấp nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIconContainer}>
              <View style={styles.successIconCircle}>
                <Ionicons name="checkmark-circle" size={64} color="#10B981" />
              </View>
            </View>
            <Text style={styles.successModalTitle}>Thành công!</Text>
            <Text style={styles.successModalMessage}>
              Bạn đã chấp nhận yêu cầu chăm sóc thành công.
            </Text>
            <TouchableOpacity
              style={styles.successModalButton}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.successModalButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.errorModalContent}>
            <View style={styles.errorIconContainer}>
              <View style={styles.errorIconCircle}>
                <Ionicons name="close-circle" size={64} color="#EF4444" />
              </View>
            </View>
            <Text style={styles.errorModalTitle}>Lỗi</Text>
            <Text style={styles.errorModalMessage}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.errorModalButton}
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.errorModalButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Reject Modal with Reason Input */}
      <Modal
        visible={showRejectModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRejectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.rejectModalContent}>
            <View style={styles.rejectIconContainer}>
              <View style={styles.rejectIconCircle}>
                <Ionicons name="close-circle" size={48} color="#EF4444" />
              </View>
            </View>
            <Text style={styles.rejectModalTitle}>Từ chối yêu cầu</Text>
            <Text style={styles.rejectModalMessage}>
              Vui lòng nhập lý do từ chối (không bắt buộc):
            </Text>
            <TextInput
              style={styles.rejectReasonInput}
              placeholder="Nhập lý do từ chối..."
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#9CA3AF"
            />
            <View style={styles.rejectModalButtons}>
              <TouchableOpacity
                style={styles.rejectCancelButton}
                onPress={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
              >
                <Text style={styles.rejectCancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectConfirmButton}
                onPress={confirmDecline}
                disabled={processingIds.has(selectedBooking?.careServiceId || "")}
              >
                <Text style={styles.rejectConfirmButtonText}>
                  {processingIds.has(selectedBooking?.careServiceId || "") ? "Đang xử lý..." : "Xác nhận"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reject Success Modal */}
      <Modal
        visible={showRejectSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRejectSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.rejectSuccessModalContent}>
            <View style={styles.rejectSuccessIconContainer}>
              <View style={styles.rejectSuccessIconCircle}>
                <Ionicons name="checkmark-circle" size={64} color="#10B981" />
              </View>
            </View>
            <Text style={styles.rejectSuccessModalTitle}>Đã từ chối yêu cầu</Text>
            <Text style={styles.rejectSuccessModalMessage}>
              Bạn đã từ chối yêu cầu chăm sóc thành công.
            </Text>
            <TouchableOpacity
              style={styles.rejectSuccessModalButton}
              onPress={() => setShowRejectSuccessModal(false)}
            >
              <Text style={styles.rejectSuccessModalButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  confirmModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  confirmIconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  confirmIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmModalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 12,
  },
  confirmModalMessage: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },
  confirmModalHighlight: {
    fontWeight: "700",
    color: "#10B981",
  },
  confirmModalInfo: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  confirmInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  confirmInfoText: {
    fontSize: 14,
    color: "#4B5563",
    flex: 1,
  },
  confirmEarningText: {
    fontWeight: "700",
    color: "#10B981",
  },
  confirmModalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  confirmCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  confirmCancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  confirmAcceptButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#10B981",
    alignItems: "center",
  },
  confirmAcceptButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  successModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    width: "100%",
    maxWidth: 350,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },
  successModalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  successModalMessage: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  successModalButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#10B981",
    alignItems: "center",
  },
  successModalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  errorModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    width: "100%",
    maxWidth: 350,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  errorIconContainer: {
    marginBottom: 20,
  },
  errorIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  errorModalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  errorModalMessage: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  errorModalButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    alignItems: "center",
  },
  errorModalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Reject modal styles
  rejectModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  rejectIconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  rejectIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  rejectModalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 12,
  },
  rejectModalMessage: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 16,
  },
  rejectReasonInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minHeight: 100,
    marginBottom: 24,
  },
  rejectModalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  rejectCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  rejectCancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  rejectConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    alignItems: "center",
  },
  rejectConfirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Reject success modal styles
  rejectSuccessModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    width: "100%",
    maxWidth: 350,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  rejectSuccessIconContainer: {
    marginBottom: 20,
  },
  rejectSuccessIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },
  rejectSuccessModalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  rejectSuccessModalMessage: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  rejectSuccessModalButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#10B981",
    alignItems: "center",
  },
  rejectSuccessModalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
