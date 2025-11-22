import { appointmentsDataMap } from "@/app/caregiver/appointment-detail";
import { CustomAlert } from "@/components/alerts/CustomAlert";
import { PaymentModal } from "@/components/caregiver/PaymentModal";
import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { getAppointmentHasComplained, getAppointmentHasReviewed, getAppointmentStatus, subscribeToStatusChanges, updateAppointmentStatus } from "@/data/appointmentStore";
import { useAppointments } from "@/hooks/useDatabaseEntities";
import * as AppointmentRepository from "@/services/appointment.repository";
import * as ElderlyRepository from "@/services/elderly.repository";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Linking,
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
  gender?: 'male' | 'female';
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
  responseDeadline?: string; // ISO string for deadline
}

// Parse Vietnamese date format "T5, 13 Thg 11 2025" to "YYYY-MM-DD"
const parseVietnameseDate = (dateStr: string): string | null => {
  if (!dateStr) return null;
  
  // Match pattern: "T5, 13 Thg 11 2025" or "CN, 16 Thg 11 2025"
  const match = dateStr.match(/(\d{1,2})\s+Thg\s+(\d{1,2})\s+(\d{4})/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    const year = match[3];
    return `${year}-${month}-${day}`;
  }
  
  // If already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  return null;
};

const mockBookings: Booking[] = [
  {
    id: "1",
    elderName: "Bà Nguyễn Thị Lan",
    age: 75,
    gender: 'female',
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
    gender: 'male',
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
    gender: 'female',
    location: "Q1, TP.HCM",
    packageType: "Gói Cơ Bản",
    packageDetail: "Gói Cơ Bản",
    date: "Thứ ba, 11/11/2025",
    time: "8:00 - 12:00 (4 giờ)",
    address: "789 Pasteur, P. Bến Nghé, Q.1, TP.HCM",
    phone: "0909 789 123",
    price: 400000,
    status: "Mới",
    statusBadge: "Mới",
    avatar: "👵",
    // Calculate deadline: 3 days before appointment date at 23:59:59
    responseDeadline: (() => {
      const appointmentDate = new Date(2025, 10, 11); // Month is 0-indexed, so 10 = November
      const deadline = new Date(appointmentDate);
      deadline.setDate(deadline.getDate() - 3);
      deadline.setHours(23, 59, 59, 999);
      return deadline.toISOString();
    })(),
  },
  {
    id: "4",
    elderName: "Ông Phạm Văn Đức",
    age: 70,
    gender: 'male',
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
  const { user } = useAuth();
  const { appointments, loading, error, refresh } = useAppointments(user?.id || '', user?.role);
  
  const [activeTab, setActiveTab] = useState<BookingStatus>(params?.initialTab || "Mới");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [refreshKey, setRefreshKey] = useState(0); // For triggering re-render when status changes
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<Booking | null>(null);
  
  // Alert state
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    icon?: any;
    iconColor?: string;
    buttons?: { text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }[];
  }>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });
  
  // Helper to show custom alert
  const showAlert = (
    title: string,
    message: string,
    buttons?: { text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }[],
    options?: { icon?: any; iconColor?: string }
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons: buttons || [{ text: 'OK', style: 'default' }],
      icon: options?.icon || 'information',
      iconColor: options?.iconColor || '#70C1F1',
    });
  };
  
  // Helper to map database status to booking status
  const mapDbStatusToBookingStatus = (status: string): BookingStatus => {
    switch (status) {
      case 'pending': return 'Mới';
      case 'confirmed': return 'Chờ thực hiện';
      case 'in-progress': return 'Đang thực hiện';
      case 'completed': return 'Hoàn thành';
      case 'cancelled':
      case 'rejected': return 'Đã hủy';
      default: return 'Mới';
    }
  };
  
  // Refresh appointments when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        refresh();
      }
    }, [user?.id, refresh])
  );
  
  // Convert appointments to bookings format with elderly profile data
  useEffect(() => {
    const loadBookingsWithElderlyInfo = async () => {
      const convertedBookings: Booking[] = await Promise.all(
        appointments.map(async (apt) => {
          let elderName = 'Đang tải...';
          let age = 0;
          let gender: 'male' | 'female' | undefined = undefined;
          let phone = '0909 123 456';
          
          // Fetch elderly profile info
          if (apt.elderly_profile_id) {
            try {
              const elderlyProfile = await ElderlyRepository.getElderlyProfileById(apt.elderly_profile_id);
              if (elderlyProfile) {
                elderName = elderlyProfile.name || 'Không có tên';
                age = elderlyProfile.age || 0;
                phone = elderlyProfile.phone || '0909 123 456';
                gender = elderlyProfile.gender as 'male' | 'female' | undefined;
              }
            } catch (error) {
              console.error('Error fetching elderly profile:', error);
              elderName = apt.elderly_profile_id;
            }
          }
          
          const responseDeadline = (apt.start_date && apt.package_type) 
            ? calculateResponseDeadline(apt.package_type, apt.start_date)
            : null;
          
          return {
            id: apt.id,
            elderName,
            age,
            gender,
            location: apt.work_location || 'Không xác định',
            packageType: apt.package_type || 'Gói cơ bản',
            packageDetail: apt.package_type || 'Gói cơ bản',
            date: apt.start_date || 'Chưa xác định',
            time: apt.start_time || 'Chưa xác định',
            address: apt.work_location || 'Chưa có địa chỉ',
            phone,
            price: apt.total_amount || 0,
            status: mapDbStatusToBookingStatus(apt.status),
            statusBadge: mapDbStatusToBookingStatus(apt.status),
            avatar: '👤',
            responseDeadline: responseDeadline || undefined,
          };
        })
      );
      setBookings(convertedBookings);
    };
    
    loadBookingsWithElderlyInfo();
  }, [appointments]);
  
  // Map appointment status to booking status (legacy function)
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

  // Calculate time remaining for deadline
  const calculateTimeRemaining = (deadline: string) => {
    const now = new Date().getTime();
    const deadlineTime = new Date(deadline).getTime();
    const diff = deadlineTime - now;

    if (diff <= 0) {
      return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds, isExpired: false };
  };

  const handleAccept = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking?.responseDeadline) {
      const remaining = calculateTimeRemaining(booking.responseDeadline);
      if (remaining.isExpired) {
        showAlert(
          "Đã quá hạn", 
          "Thời gian chấp nhận/từ chối lịch hẹn đã hết. Lịch hẹn này sẽ tự động bị hủy.",
          [{ text: 'OK', style: 'default' }],
          { icon: 'clock-alert', iconColor: '#EF4444' }
        );
        return;
      }
    }
    
    showAlert(
      "Xác nhận", 
      "Bạn có chắc chắn muốn chấp nhận yêu cầu này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Chấp nhận",
          style: "default",
          onPress: async () => {
            try {
              await AppointmentRepository.updateAppointmentStatus(bookingId, 'confirmed');
              updateAppointmentStatus(bookingId, "confirmed");
              await refresh();
              showAlert(
                "Thành công", 
                "Đã chấp nhận yêu cầu",
                [{ text: 'OK', style: 'default' }],
                { icon: 'check-circle', iconColor: '#10B981' }
              );
            } catch (error) {
              console.error('Error accepting appointment:', error);
              showAlert(
                "Lỗi", 
                "Không thể chấp nhận yêu cầu",
                [{ text: 'OK', style: 'default' }],
                { icon: 'alert-circle', iconColor: '#EF4444' }
              );
            }
          },
        },
      ],
      { icon: 'help-circle', iconColor: '#70C1F1' }
    );
  };

  const handleReject = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking?.responseDeadline) {
      const remaining = calculateTimeRemaining(booking.responseDeadline);
      if (remaining.isExpired) {
        showAlert(
          "Đã quá hạn", 
          "Thời gian chấp nhận/từ chối lịch hẹn đã hết. Lịch hẹn này sẽ tự động bị hủy.",
          [{ text: 'OK', style: 'default' }],
          { icon: 'clock-alert', iconColor: '#EF4444' }
        );
        return;
      }
    }
    
    showAlert(
      "Từ chối", 
      "Bạn có chắc chắn muốn từ chối yêu cầu này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Từ chối",
          style: "destructive",
          onPress: async () => {
            try {
              await AppointmentRepository.updateAppointmentStatus(bookingId, 'rejected');
              updateAppointmentStatus(bookingId, "rejected");
              await refresh();
              showAlert(
                "Đã từ chối", 
                "Yêu cầu đã bị từ chối",
                [{ text: 'OK', style: 'default' }],
                { icon: 'close-circle', iconColor: '#EF4444' }
              );
            } catch (error) {
              console.error('Error rejecting appointment:', error);
              showAlert(
                "Lỗi", 
                "Không thể từ chối yêu cầu",
                [{ text: 'OK', style: 'default' }],
                { icon: 'alert-circle', iconColor: '#EF4444' }
              );
            }
          },
        },
      ],
      { icon: 'help-circle', iconColor: '#EF4444' }
    );
  };

  const handleCancel = (bookingId: string, dateStr: string) => {
    if (!canCancelBooking(dateStr)) {
      showAlert(
        "Không thể hủy",
        "Bạn chỉ có thể hủy lịch hẹn trước 3 ngày. Lịch hẹn này còn ít hơn 3 ngày nên không thể hủy.",
        [{ text: 'OK', style: 'default' }],
        { icon: 'calendar-remove', iconColor: '#EF4444' }
      );
      return;
    }

    showAlert(
      "Hủy lịch hẹn", 
      "Bạn có chắc chắn muốn hủy lịch hẹn này?",
      [
        { text: "Không", style: "cancel" },
        {
          text: "Hủy lịch",
          style: "destructive",
          onPress: async () => {
            try {
              await AppointmentRepository.updateAppointmentStatus(bookingId, 'cancelled');
              updateAppointmentStatus(bookingId, "cancelled");
              await refresh();
              showAlert(
                "Đã hủy", 
                "Lịch hẹn đã được hủy",
                [{ text: 'OK', style: 'default' }],
                { icon: 'check-circle', iconColor: '#70C1F1' }
              );
            } catch (error) {
              console.error('Error cancelling appointment:', error);
              showAlert(
                "Lỗi", 
                "Không thể hủy lịch hẹn",
                [{ text: 'OK', style: 'default' }],
                { icon: 'alert-circle', iconColor: '#EF4444' }
              );
            }
          },
        },
      ],
      { icon: 'help-circle', iconColor: '#EF4444' }
    );
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

  const handleStart = async (bookingId: string) => {
    // Validate: Check if today is the appointment date
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      // Parse Vietnamese date format to YYYY-MM-DD
      const parsedDate = parseVietnameseDate(booking.date);
      
      if (parsedDate !== todayStr) {
        showAlert(
          "Chưa đến ngày thực hiện",
          `Lịch hẹn này được đặt vào ngày ${booking.date}. Bạn chỉ có thể bắt đầu vào đúng ngày thực hiện.`,
          [{ text: "OK", style: "default" }],
          { icon: 'calendar-clock', iconColor: '#F59E0B' }
        );
        return;
      }
    }
    
    // Validate: Check if there's another in-progress appointment
    const conflict = checkStartConflict(bookingId);
    
    if (conflict) {
      showAlert(
        "Không thể bắt đầu lịch hẹn",
        `Bạn đang thực hiện lịch hẹn với ${conflict.conflictingElderlyName} tại ${conflict.conflictingAddress}.\n\nBạn chỉ có thể bắt đầu lịch hẹn mới khi:\n• Cùng người đặt (liên hệ khẩn cấp)\n• Cùng địa chỉ\n\nVui lòng hoàn thành lịch hẹn hiện tại trước.`,
        [{ text: "OK", style: "default" }],
        { icon: 'alert-circle', iconColor: '#EF4444' }
      );
      return;
    }

    // Navigate to check-in verification screen
    if (booking) {
      (navigation as any).navigate("Check-in Verification", {
        appointmentId: bookingId,
        elderlyName: booking.elderName,
        address: booking.address,
        amount: booking.price || 0,
        fromScreen: "booking",
        // Mock coordinates - in real app, get from appointment data
        elderlyLat: 10.7769,
        elderlyLng: 106.7009,
      });
    }
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

      showAlert(
        "Chưa hoàn thành nhiệm vụ",
        `Vui lòng hoàn thành tất cả nhiệm vụ cố định và linh hoạt trước khi kết thúc ca!\n\nCòn thiếu:\n${missingTasks.join("\n")}\n\nVui lòng vào trang chi tiết để hoàn thành các nhiệm vụ.`,
        [
          { text: "OK", style: "cancel" },
          {
            text: "Xem chi tiết",
            style: "default",
            onPress: () => {
              (navigation as any).navigate("Appointment Detail", { appointmentId: bookingId, fromScreen: "booking" });
            },
          },
        ],
        { icon: 'clipboard-list-outline', iconColor: '#F59E0B' }
      );
      return;
    }

    // Show payment modal instead of completing directly
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      setSelectedBookingForPayment(booking);
      setShowPaymentModal(true);
    }
  };

  const handlePaymentComplete = async () => {
    if (!selectedBookingForPayment) return;

    try {
      await AppointmentRepository.updateAppointmentStatus(selectedBookingForPayment.id, 'completed');
      updateAppointmentStatus(selectedBookingForPayment.id, "completed");
      await refresh();
      setShowPaymentModal(false);
      setSelectedBookingForPayment(null);
      showAlert(
        "Thành công", 
        "Công việc đã hoàn thành và thanh toán đã được xác nhận",
        [{ text: 'OK', style: 'default' }],
        { icon: 'check-circle', iconColor: '#10B981' }
      );
    } catch (error) {
      console.error('Error completing appointment:', error);
      showAlert(
        "Lỗi", 
        "Không thể hoàn thành công việc",
        [{ text: 'OK', style: 'default' }],
        { icon: 'alert-circle', iconColor: '#EF4444' }
      );
    }
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
    (navigation as any).navigate("Appointment Detail", { appointmentId: bookingId, fromScreen: "booking" });
  };

  // Calculate response deadline based on package type and booking time
  const calculateResponseDeadline = (packageType: string, appointmentDateStr: string): string | null => {
    try {
      const parsedDate = parseVietnameseDate(appointmentDateStr);
      if (!parsedDate) return null;
      
      const [year, month, day] = parsedDate.split('-').map(Number);
      const appointmentDate = new Date(year, month - 1, day);
      const now = new Date();
      
      // Calculate days until appointment
      const diffTime = appointmentDate.getTime() - now.getTime();
      const daysUntilAppointment = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Determine response time based on RULE 2
      let responseHours = 6; // Default: <24h before
      if (daysUntilAppointment >= 3) {
        responseHours = 24; // ≥3 days: 24h to respond
      } else if (daysUntilAppointment >= 1) {
        responseHours = 12; // 1-2 days: 12h to respond
      }
      
      // Response deadline = now + responseHours
      const deadline = new Date(now.getTime() + (responseHours * 60 * 60 * 1000));
      return deadline.toISOString();
    } catch (error) {
      console.error('Error calculating response deadline:', error);
      return null;
    }
  };

  // Format countdown timer (excluding seconds)
  const formatCountdown = (deadline: string) => {
    const now = new Date().getTime();
    const deadlineTime = new Date(deadline).getTime();
    const diff = deadlineTime - now;

    if (diff <= 0) return 'Hết hạn';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `Còn ${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `Còn ${hours}h ${minutes}m`;
    } else {
      return `Còn ${minutes}m`;
    }
  };

  // Format deadline to "Phản hồi trước DD/MM"
  const formatDeadlineDisplay = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const day = deadlineDate.getDate();
    const month = deadlineDate.getMonth() + 1; // Month is 0-indexed
    return `Phản hồi trước ${day}/${month}`;
  };

  // Booking Card Component
  const BookingCard = ({ item }: { item: Booking }) => {
    // Get real-time status from global store
    const globalStatus = getAppointmentStatus(item.id);
    const currentStatus = globalStatus ? mapStatusToBookingStatus(globalStatus) : item.status;
    const hasComplained = getAppointmentHasComplained(item.id);
    
    // Check if deadline is expired (simple check, no countdown)
    const isDeadlineExpired = item.responseDeadline 
      ? new Date(item.responseDeadline).getTime() <= new Date().getTime()
      : false;
    
    // Check if appointment is starting soon (within 1 hour)
    const isStartingSoon = () => {
      // Only check for "Chờ thực hiện" status
      if (currentStatus !== "Chờ thực hiện") return false;
      
      try {
        const now = new Date();
        const parsedDate = parseVietnameseDate(item.date);
        if (!parsedDate) return false;
        
        // Parse start time from "8:00 - 16:00 (8 giờ)" -> "8:00"
        const timeMatch = item.time.match(/^(\d{1,2}):(\d{2})/);
        if (!timeMatch) return false;
        
        const [_, hours, minutes] = timeMatch;
        const [year, month, day] = parsedDate.split('-').map(Number);
        
        const appointmentStart = new Date(year, month - 1, day, parseInt(hours), parseInt(minutes));
        const diffMs = appointmentStart.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        
        // Return true if appointment starts within 1 hour (and hasn't started yet)
        return diffHours > 0 && diffHours <= 1;
      } catch (error) {
        console.error('Error checking if starting soon:', error);
        return false;
      }
    };
    
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

        {/* Starting Soon Badge - For appointments starting within 1 hour */}
        {!hasComplained && isStartingSoon() && (
          <View style={styles.startingSoonBadge}>
            <Text style={styles.startingSoonText}>Sắp bắt đầu</Text>
          </View>
        )}

        {/* Countdown Timer - Only for new bookings */}
        {currentStatus === "Mới" && item.responseDeadline && !isDeadlineExpired && (
          <View style={styles.countdownBadge}>
            <MaterialCommunityIcons name="clock-outline" size={12} color="#DC2626" />
            <Text style={styles.countdownText}>{formatCountdown(item.responseDeadline)}</Text>
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
        {currentStatus === "Mới" && (
          <View style={styles.actionButtonsContainer}>
            {/* Map and Message buttons */}
            <View style={styles.utilityButtonsRow}>
              <TouchableOpacity
                style={styles.utilityButton}
                onPress={async () => {
                  // Open Google Maps with full address
                  const fullAddress = `${item.address}, Việt Nam`;
                  const encodedAddress = encodeURIComponent(fullAddress);
                  
                  // Use search query format for better accuracy
                  const url = Platform.select({
                    ios: `maps://maps.apple.com/?q=${encodedAddress}`,
                    android: `geo:0,0?q=${encodedAddress}`,
                  });
                  
                  // Fallback to web URL
                  const webUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
                  
                  try {
                    const canOpen = url ? await Linking.canOpenURL(url) : false;
                    if (canOpen && url) {
                      await Linking.openURL(url);
                    } else {
                      await Linking.openURL(webUrl);
                    }
                  } catch (error) {
                    console.error('Error opening maps:', error);
                    showAlert(
                      "Lỗi",
                      "Không thể mở bản đồ. Vui lòng thử lại.",
                      [{ text: 'OK', style: 'default' }],
                      { icon: 'alert-circle', iconColor: '#EF4444' }
                    );
                  }
                }}
              >
                <MaterialCommunityIcons name="map-marker" size={18} color="#6B7280" />
                <Text style={styles.utilityButtonText}>Xem bản đồ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.utilityButton}
                onPress={() => {
                  // Navigate to chat with booking client
                  (navigation as any).navigate("Tin nhắn", {
                    chatName: item.elderName,
                    chatAvatar: item.avatar,
                    clientName: item.elderName,
                    clientAvatar: item.avatar,
                    fromScreen: "booking",
                    appointmentId: item.id,
                  });
                }}
              >
                <MaterialCommunityIcons name="message-text" size={18} color="#6B7280" />
                <Text style={styles.utilityButtonText}>Nhắn tin</Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.buttonDivider} />

            {/* Reject and Accept buttons */}
            <View style={styles.mainButtonsRow}>
              <TouchableOpacity
                style={[
                  styles.actionButton, 
                  styles.rejectButton,
                  isDeadlineExpired && styles.actionButtonDisabled
                ]}
                onPress={() => handleReject(item.id)}
                disabled={isDeadlineExpired}
              >
                <MaterialCommunityIcons name="close" size={16} color="#EF4444" />
                <Text style={styles.rejectButtonText}>Từ chối</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionButton, 
                  styles.acceptButton,
                  isDeadlineExpired && styles.actionButtonDisabled
                ]}
                onPress={() => handleAccept(item.id)}
                disabled={isDeadlineExpired}
              >
                <MaterialCommunityIcons name="check" size={16} color="#fff" />
                <Text style={styles.acceptButtonText}>Chấp nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {currentStatus !== "Mới" && (
          <>
            {currentStatus === "Chờ thực hiện" && (
              <View style={styles.actionButtonsContainer}>
                {/* Map and Message buttons */}
                <View style={styles.utilityButtonsRow}>
                  <TouchableOpacity
                    style={styles.utilityButton}
                    onPress={async () => {
                      // Open Google Maps with full address
                      const fullAddress = `${item.address}, Việt Nam`;
                      const encodedAddress = encodeURIComponent(fullAddress);
                      
                      // Use search query format for better accuracy
                      const url = Platform.select({
                        ios: `maps://maps.apple.com/?q=${encodedAddress}`,
                        android: `geo:0,0?q=${encodedAddress}`,
                      });
                      
                      // Fallback to web URL
                      const webUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
                      
                      try {
                        const canOpen = url ? await Linking.canOpenURL(url) : false;
                        if (canOpen && url) {
                          await Linking.openURL(url);
                        } else {
                          await Linking.openURL(webUrl);
                        }
                      } catch (error) {
                        console.error('Error opening maps:', error);
                        showAlert(
                          "Lỗi",
                          "Không thể mở bản đồ. Vui lòng thử lại.",
                          [{ text: 'OK', style: 'default' }],
                          { icon: 'alert-circle', iconColor: '#EF4444' }
                        );
                      }
                    }}
                  >
                    <MaterialCommunityIcons name="map-marker" size={18} color="#6B7280" />
                    <Text style={styles.utilityButtonText}>Xem bản đồ</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.utilityButton}
                    onPress={() => {
                      // Navigate to chat with booking client
                      (navigation as any).navigate("Tin nhắn", {
                        chatName: item.elderName,
                        chatAvatar: item.avatar,
                        clientName: item.elderName,
                        clientAvatar: item.avatar,
                        fromScreen: "booking",
                        appointmentId: item.id,
                      });
                    }}
                  >
                    <MaterialCommunityIcons name="message-text" size={18} color="#6B7280" />
                    <Text style={styles.utilityButtonText}>Nhắn tin</Text>
                  </TouchableOpacity>
                </View>

                {/* Divider */}
                <View style={styles.buttonDivider} />

                {/* Cancel and Start buttons */}
                <View style={styles.mainButtonsRow}>
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
                </View>
              </View>
            )}

            {currentStatus === "Đang thực hiện" && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.utilityButton]}
                  onPress={() => {
                    (navigation as any).navigate("Tin nhắn", {
                      chatId: item.id,
                      chatName: item.elderName,
                      chatAvatar: item.avatar,
                    });
                  }}
                >
                  <MaterialCommunityIcons name="message-text" size={16} color="#6B7280" />
                  <Text style={styles.utilityButtonText}>Nhắn tin</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={() => handleComplete(item.id)}
                >
                  <MaterialCommunityIcons name="check-circle" size={16} color="#fff" />
                  <Text style={styles.acceptButtonText}>Hoàn thành</Text>
                </TouchableOpacity>
              </View>
            )}

            {currentStatus === "Hoàn thành" && (() => {
              const globalHasReviewed = getAppointmentHasReviewed(item.id);
              const globalHasComplained = getAppointmentHasComplained(item.id);
              return (
                <View style={styles.actionButtons}>
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
                </View>
              );
            })()}

            {currentStatus === "Đã hủy" && (
              <View style={styles.actionButtons}>
                <View style={styles.cancelledInfo}>
                  <Text style={styles.cancelledText}>Lịch hẹn đã bị hủy</Text>
                </View>
              </View>
            )}
          </>
        )}
      </TouchableOpacity>
    );
  };

  const renderBookingCard = ({ item, index }: { item: Booking; index: number }) => {
    return <BookingCard item={item} />;
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

      {/* Payment Modal */}
      {selectedBookingForPayment && (
        <PaymentModal
          visible={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedBookingForPayment(null);
          }}
          onComplete={handlePaymentComplete}
          appointmentId={selectedBookingForPayment.id}
          amount={selectedBookingForPayment.price}
        />
      )}

      {/* Custom Alert Modal */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon}
        iconColor={alertConfig.iconColor}
        buttons={alertConfig.buttons}
        onClose={() => setAlertConfig({ visible: false, title: '', message: '', buttons: [] })}
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
  actionButtonsContainer: {
    gap: 0,
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
  startingSoonBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#F59E0B",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 10,
  },
  startingSoonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  deadlineWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
    gap: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#F59E0B",
  },
  deadlineExpired: {
    backgroundColor: "#FEE2E2",
    borderLeftColor: "#EF4444",
  },
  deadlineText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#92400E",
  },
  deadlineTextExpired: {
    color: "#991B1B",
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  deadlineDisplay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 12,
    gap: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#F59E0B",
  },
  deadlineDisplayExpired: {
    backgroundColor: "#FEE2E2",
    borderLeftColor: "#EF4444",
  },
  deadlineDisplayText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#92400E",
  },
  deadlineDisplayTextExpired: {
    color: "#991B1B",
  },
  countdownBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    zIndex: 5,
  },
  countdownText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DC2626',
  },
  utilityButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  utilityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  utilityButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  buttonDivider: {
    height: 1,
    backgroundColor: '#D1D5DB',
    marginVertical: 8,
  },
  mainButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
});