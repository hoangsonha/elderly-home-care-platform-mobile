import { CustomAlert } from "@/components/alerts/CustomAlert";
import { PaymentCode } from "@/components/caregiver/PaymentCode";
import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { NavigationHelper } from "@/components/navigation/NavigationHelper";
import { getAppointmentHasComplained, getAppointmentHasReviewed, getAppointmentStatus, subscribeToStatusChanges, updateAppointmentStatus } from "@/data/appointmentStore";
import { mainService, MyCareServiceData } from "@/services/main.service";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

// Mock data - Multiple appointments
export const appointmentsDataMap: { [key: string]: any } = {
  "1": {
    id: "APT001",
    status: "in-progress", // new, pending, confirmed, in-progress, completed, cancelled, rejected
    date: "2025-10-25",
    timeSlot: "08:00 - 16:00",
    duration: "8 giờ",
    packageType: "Gói Cao Cấp",
    
    // Elderly Info
    elderly: {
      id: "E001",
      name: "Bà Nguyễn Thị Lan",
    age: 75,
    gender: "Nữ",
    avatar: "https://via.placeholder.com/100",
    address: "123 Lê Lợi, P. Bến Thành, Q.1, TP.HCM",
    phone: "0901234567",
    
    // Medical Information
    bloodType: "O+",
    healthCondition: "Tiểu đường, Huyết áp cao",
    underlyingDiseases: ["Tiểu đường type 2", "Huyết áp cao"],
    medications: [
      {
        name: "Metformin 500mg",
        dosage: "1 viên",
        frequency: "2 lần/ngày (sáng, tối)",
      },
      {
        name: "Losartan 50mg",
        dosage: "1 viên",
        frequency: "1 lần/ngày (sáng)",
      },
    ],
    allergies: ["Penicillin"],
    specialConditions: ["Cần theo dõi đường huyết thường xuyên", "Chế độ ăn ít muối, ít đường"],
    
    // Independence Level
    independenceLevel: {
      eating: "assisted", // independent, assisted, dependent
      bathing: "dependent",
      mobility: "assisted",
      toileting: "assisted",
      dressing: "dependent",
    },
    
    // Living Environment
    livingEnvironment: {
      houseType: "apartment", // private_house, apartment, nursing_home
      livingWith: ["Con trai", "Con dâu"],
      accessibility: ["Có thang máy", "Không có bậc thềm", "Tay vịn phòng tắm"],
    },
    
    // Preferences
    hobbies: ["Nghe nhạc trữ tình", "Xem truyền hình", "Làm vườn"],
    favoriteActivities: ["Trò chuyện", "Đọc báo"],
    foodPreferences: ["Cháo", "Rau luộc", "Cá hấp"],
    
    emergencyContact: {
      name: "Nguyễn Văn A",
      relationship: "Con trai",
      phone: "0912345678",
    },
  },
  
  // Tasks
  tasks: {
    fixed: [
      {
        id: "F1",
        time: "08:00",
        title: "Đo huyết áp và đường huyết",
        description: "Đo và ghi chép chỉ số huyết áp, đường huyết buổi sáng",
        completed: false,
        required: true,
      },
      {
        id: "F2",
        time: "08:30",
        title: "Hỗ trợ vệ sinh cá nhân",
        description: "Giúp đỡ tắm rửa, thay quần áo sạch sẽ",
        completed: false,
        required: true,
      },
      {
        id: "F3",
        time: "09:00",
        title: "Chuẩn bị bữa sáng",
        description: "Cháo thịt băm, rau luộc theo thực đơn",
        completed: false,
        required: true,
      },
      {
        id: "F4",
        time: "10:00",
        title: "Uống thuốc",
        description: "Nhắc nhở và hỗ trợ uống thuốc theo đơn bác sĩ",
        completed: false,
        required: true,
      },
    ],
    flexible: [
      {
        id: "FL1",
        title: "Vận động nhẹ",
        description: "Hướng dẫn các bài tập vận động nhẹ nhàng trong 15-20 phút",
        completed: false,
      },
      {
        id: "FL2",
        title: "Dọn dẹp phòng ngủ",
        description: "Lau dọn, thay ga giường, sắp xếp đồ đạc gọn gàng",
        completed: false,
      },
      {
        id: "FL3",
        title: "Giặt quần áo",
        description: "Giặt và phơi quần áo của người già",
        completed: false,
      },
    ],
    optional: [
      {
        id: "O1",
        title: "Đọc báo, trò chuyện",
        description: "Dành thời gian đọc báo hoặc trò chuyện cùng người già",
        completed: false,
      },
      {
        id: "O2",
        title: "Massage nhẹ",
        description: "Massage nhẹ tay, chân để lưu thông máu",
        completed: false,
      },
    ],
  },
  
  // Notes
  notes: [
    {
      id: "N1",
      time: "07:45",
      author: "Caregiver",
      content: "Đã đến nơi, người già tỉnh táo, tinh thần tốt",
      type: "info",
    },
    {
      id: "N2",
      time: "08:15",
      author: "Caregiver",
      content: "Chỉ số huyết áp: 130/85 mmHg, Đường huyết: 6.5 mmol/L - Bình thường",
      type: "health",
    },
  ],
  
  // Special Instructions
  specialInstructions: "Bà có biến chứng tiểu đường, cần chú ý chế độ ăn nhạt, ít đường. Tránh để bà ngồi một chỗ quá lâu.",
  },
  "2": {
    id: "APT002",
    status: "pending",
    date: "2025-10-26",
    timeSlot: "08:00 - 16:00",
    duration: "8 giờ",
    packageType: "Gói Chuyên Nghiệp",
    
    elderly: {
      id: "E002",
      name: "Ông Trần Văn Hùng",
      age: 68,
      gender: "Nam",
      avatar: "https://via.placeholder.com/100",
      address: "456 Lê Văn Việt, P. Tăng Nhơn Phú A, Q.9, TP.HCM",
      phone: "0909456789",
      
      bloodType: "A+",
      healthCondition: "Đau khớp, Tim mạch",
      underlyingDiseases: ["Viêm khớp", "Tăng huyết áp nhẹ"],
      medications: [
        {
          name: "Glucosamine 1500mg",
          dosage: "1 viên",
          frequency: "1 lần/ngày (sáng)",
        },
      ],
      allergies: ["Không"],
      specialConditions: ["Cần hỗ trợ vận động nhẹ nhàng", "Tránh vận động mạnh"],
      
      independenceLevel: {
        eating: "independent",
        bathing: "assisted",
        mobility: "assisted",
        toileting: "independent",
        dressing: "assisted",
      },
      
      livingEnvironment: {
        houseType: "apartment",
        livingWith: ["Vợ"],
        accessibility: ["Có thang máy", "Tay vịn hành lang"],
      },
      
      hobbies: ["Đọc báo", "Nghe radio"],
      favoriteActivities: ["Đi dạo buổi sáng"],
      foodPreferences: ["Cơm", "Thịt hầm", "Canh rau"],
      
      emergencyContact: {
        name: "Trần Thị C",
        relationship: "Vợ",
        phone: "0912345679",
      },
    },
    
    tasks: {
      fixed: [
        {
          id: "F1",
          time: "14:00",
          title: "Đo huyết áp",
          description: "Đo và ghi chép chỉ số huyết áp",
          completed: false,
          required: true,
        },
        {
          id: "F2",
          time: "14:30",
          title: "Hỗ trợ vận động nhẹ",
          description: "Đi bộ trong nhà 15 phút",
          completed: false,
          required: true,
        },
        {
          id: "F3",
          time: "15:30",
          title: "Uống thuốc",
          description: "Nhắc nhở và hỗ trợ uống thuốc",
          completed: false,
          required: true,
        },
      ],
      flexible: [
        {
          id: "FL1",
          title: "Trò chuyện, đọc báo",
          description: "Dành thời gian trò chuyện và đọc báo cùng",
          completed: false,
        },
      ],
      optional: [
        {
          id: "O1",
          title: "Massage nhẹ tay chân",
          description: "Massage nhẹ nhàng để giảm đau khớp",
          completed: false,
        },
      ],
    },
    
    notes: [],
    
    specialInstructions: "Ông có vấn đề về khớp, cần hỗ trợ nhẹ nhàng. Tránh để ông đứng hoặc ngồi quá lâu.",
  },
  "3": {
    id: "APT003",
    status: "new",
    date: "2025-11-11",
    timeSlot: "08:00 - 12:00",
    duration: "4 giờ",
    packageType: "Gói Cơ Bản",
    // Calculate deadline: 3 days before appointment date at 23:59:59
    responseDeadline: (() => {
      const appointmentDate = new Date("2025-11-11");
      const deadline = new Date(appointmentDate);
      deadline.setDate(deadline.getDate() - 3);
      deadline.setHours(23, 59, 59, 999);
      return deadline.toISOString();
    })(),
    
    elderly: {
      id: "E003",
      name: "Bà Lê Thị Hoa",
      age: 82,
      gender: "Nữ",
      avatar: "https://via.placeholder.com/100",
      address: "789 Pasteur, P. Bến Nghé, Q.1, TP.HCM",
      phone: "0909789123",
      
      bloodType: "B+",
      healthCondition: "Suy giảm trí nhớ nhẹ",
      underlyingDiseases: ["Suy giảm trí nhớ", "Loãng xương"],
      medications: [
        {
          name: "Canxi 500mg",
          dosage: "1 viên",
          frequency: "1 lần/ngày (sáng)",
        },
      ],
      allergies: ["Không"],
      specialConditions: ["Cần nhắc nhở thường xuyên", "Theo dõi sát để tránh ngã"],
      
      independenceLevel: {
        eating: "assisted",
        bathing: "dependent",
        mobility: "assisted",
        toileting: "assisted",
        dressing: "dependent",
      },
      
      livingEnvironment: {
        houseType: "private_house",
        livingWith: ["Con gái"],
        accessibility: ["Tay vịn cầu thang", "Phòng tắm có ghế"],
      },
      
      hobbies: ["Nghe nhạc", "Xem ảnh gia đình"],
      favoriteActivities: ["Ngồi trong vườn"],
      foodPreferences: ["Cháo", "Súp", "Trái cây mềm"],
      
      emergencyContact: {
        name: "Lê Thị D",
        relationship: "Con gái",
        phone: "0912345680",
      },
    },
    
    tasks: {
      fixed: [
        {
          id: "F1",
          time: "08:00",
          title: "Hỗ trợ vệ sinh cá nhân",
          description: "Giúp đỡ tắm rửa, thay quần áo",
          completed: false,
          required: true,
        },
        {
          id: "F2",
          time: "09:00",
          title: "Chuẩn bị bữa sáng",
          description: "Cháo thịt băm, dễ nuốt",
          completed: false,
          required: true,
        },
        {
          id: "F3",
          time: "10:00",
          title: "Uống thuốc",
          description: "Nhắc nhở uống canxi",
          completed: false,
          required: true,
        },
      ],
      flexible: [
        {
          id: "FL1",
          title: "Trò chuyện, xem ảnh",
          description: "Kích thích trí nhớ qua ảnh gia đình",
          completed: false,
        },
        {
          id: "FL2",
          title: "Dọn dẹp phòng",
          description: "Lau dọn, sắp xếp đồ đạc",
          completed: false,
        },
      ],
      optional: [
        {
          id: "O1",
          title: "Ngồi trong vườn",
          description: "Đưa ra vườn hít thở không khí trong lành",
          completed: false,
        },
      ],
    },
    
    notes: [],
    
    specialInstructions: "Bà có suy giảm trí nhớ nhẹ, cần nhắc nhở nhẹ nhàng và kiên nhẫn. Theo dõi sát để tránh ngã.",
  },
  "4": {
    id: "APT004",
    status: "completed",
    date: "2025-10-20",
    timeSlot: "08:00 - 16:00",
    duration: "8 giờ",
    packageType: "Gói Chuyên Nghiệp",
    
    elderly: {
      id: "E004",
      name: "Ông Phạm Văn Đức",
      age: 70,
      gender: "Nam",
      avatar: "https://via.placeholder.com/100",
      address: "321 Nguyễn Duy Trinh, P. Bình Trưng Đông, Q.2, TP.HCM",
      phone: "0909321654",
      
      bloodType: "A+",
      healthCondition: "Huyết áp cao",
      underlyingDiseases: ["Huyết áp cao"],
      medications: [
        {
          name: "Amlodipine 5mg",
          dosage: "1 viên",
          frequency: "1 lần/ngày (sáng)",
        },
      ],
      allergies: ["Không"],
      specialConditions: ["Theo dõi huyết áp thường xuyên", "Chế độ ăn ít muối"],
      
      independenceLevel: {
        eating: "independent",
        bathing: "assisted",
        mobility: "independent",
        toileting: "independent",
        dressing: "assisted",
      },
      
      livingEnvironment: {
        houseType: "apartment",
        livingWith: ["Vợ"],
        accessibility: ["Có thang máy", "Tay vịn phòng tắm"],
      },
      
      hobbies: ["Đọc báo", "Nghe đài", "Đi bộ"],
      favoriteActivities: ["Đi bộ buổi sáng", "Đọc báo"],
      foodPreferences: ["Cơm", "Rau xào", "Cá kho"],
      
      emergencyContact: {
        name: "Phạm Thị E",
        relationship: "Vợ",
        phone: "0912345681",
      },
    },
    
    tasks: {
      fixed: [
        {
          id: "F1",
          time: "08:00",
          title: "Đo huyết áp",
          description: "Đo và ghi chép chỉ số huyết áp buổi sáng",
          completed: true,
          required: true,
        },
        {
          id: "F2",
          time: "08:30",
          title: "Hỗ trợ vệ sinh cá nhân",
          description: "Giúp đỡ tắm rửa, thay quần áo",
          completed: true,
          required: true,
        },
        {
          id: "F3",
          time: "09:00",
          title: "Chuẩn bị bữa sáng",
          description: "Cơm trắng, cá kho, rau xào",
          completed: true,
          required: true,
        },
        {
          id: "F4",
          time: "10:00",
          title: "Uống thuốc",
          description: "Nhắc nhở và hỗ trợ uống thuốc huyết áp",
          completed: true,
          required: true,
        },
        {
          id: "F5",
          time: "14:00",
          title: "Đo huyết áp",
          description: "Đo và ghi chép chỉ số huyết áp buổi chiều",
          completed: true,
          required: true,
        },
      ],
      flexible: [
        {
          id: "FL1",
          title: "Đi bộ buổi sáng",
          description: "Đi bộ nhẹ nhàng trong khu vực",
          completed: true,
        },
        {
          id: "FL2",
          title: "Đọc báo",
          description: "Hỗ trợ đọc báo và trò chuyện",
          completed: true,
        },
        {
          id: "FL3",
          title: "Dọn dẹp phòng",
          description: "Lau dọn, sắp xếp đồ đạc",
          completed: true,
        },
      ],
      optional: [
        {
          id: "O1",
          title: "Massage thư giãn",
          description: "Massage nhẹ nhàng để thư giãn",
          completed: true,
        },
      ],
    },
    
    notes: [
      {
        id: "N1",
        time: "08:15",
        author: "Caregiver",
        content: "Huyết áp sáng: 130/85 mmHg - bình thường",
        type: "info",
      },
      {
        id: "N2",
        time: "14:30",
        author: "Caregiver",
        content: "Huyết áp chiều: 135/88 mmHg - hơi cao một chút, đã nhắc nhở nghỉ ngơi",
        type: "warning",
      },
    ],
    
    specialInstructions: "Ông có huyết áp cao, cần đo huyết áp 2 lần/ngày (sáng và chiều). Chế độ ăn ít muối, tránh thức ăn mặn.",
  },
};

export default function AppointmentDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as { 
    appointmentId?: string; 
    fromScreen?: string;
    qrCodeData?: { qrCodeBase64: string; orderId: string; paymentId: string; careServiceId: string } | null;
  } | undefined;
  const appointmentId = params?.appointmentId || "1";
  const fromScreen = params?.fromScreen;
  const insets = useSafeAreaInsets();
  
  // Nhận qrCodeData từ route params (khi quay lại từ check-out screen)
  useEffect(() => {
    if (params?.qrCodeData) {
      console.log('AppointmentDetail: Received qrCodeData from params:', params.qrCodeData);
      console.log('AppointmentDetail: orderId:', params.qrCodeData.orderId);
      setQrCodeData(params.qrCodeData);
      setShowPaymentCodeModal(true);
    }
  }, [params?.qrCodeData]);
  
  // State for API data
  const [loading, setLoading] = useState(true);
  const [appointmentData, setAppointmentData] = useState<MyCareServiceData | null>(null);
  const [status, setStatus] = useState<string>('');
  const [remainingMinutes, setRemainingMinutes] = useState<number | null>(null);
  
  const [selectedTab, setSelectedTab] = useState<"tasks" | "notes">("tasks");
  
  // State for image viewer modal
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  
  // Helper to calculate remaining minutes
  const calculateRemainingMinutes = (deadline: string): number => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffMs = deadlineDate.getTime() - now.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60)));
  };
  
  // Function to fetch appointment data
  const fetchAppointment = React.useCallback(async () => {
    if (!appointmentId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await mainService.getCareServiceDetail(appointmentId);
      
      if (response.status === 'Success' && response.data) {
        const appointment = response.data as MyCareServiceData;
        setAppointmentData(appointment);
        
        // Debug: Log CI/CO data
        console.log('=== Appointment Data ===');
        console.log('workSchedule:', appointment.workSchedule);
        console.log('checkInImageUrl:', appointment.workSchedule?.checkInImageUrl);
        console.log('checkOutImageUrl:', appointment.workSchedule?.checkOutImageUrl);
        console.log('startTime:', appointment.workSchedule?.startTime);
        console.log('endTime:', appointment.workSchedule?.endTime);
        
        // Map status to Vietnamese
        const statusMap: Record<string, string> = {
          'PENDING_CAREGIVER': 'Mới',
          'CAREGIVER_APPROVED': 'Chờ thực hiện',
          'IN_PROGRESS': 'Đang thực hiện',
          'COMPLETED': 'Hoàn thành',
          'CANCELLED': 'Đã hủy',
          'EXPIRED': 'Đã hết hạn',
          'WAITING_PAYMENT': 'Chờ thanh toán',
        };
        const mappedStatus = statusMap[appointment.status] || appointment.status;
        setStatus(mappedStatus);
        
        // Calculate remaining minutes if status is Mới
        if (appointment.status === "PENDING_CAREGIVER" && appointment.caregiverResponseDeadline) {
          const minutes = calculateRemainingMinutes(appointment.caregiverResponseDeadline);
          setRemainingMinutes(minutes);
        }
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể tải thông tin lịch hẹn');
      }
    } catch (error: any) {
      console.error('Error fetching appointment:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin lịch hẹn');
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);
  
  // Load appointment from API
  useEffect(() => {
    fetchAppointment();
  }, [fetchAppointment]);
  
  // Helper to parse tasks JSON from database
  const parseTasksFromDB = (tasksJson: string | null) => {
    if (!tasksJson) return [];
    try {
      const tasks = JSON.parse(tasksJson);
      return Array.isArray(tasks) ? tasks : [];
    } catch {
      return [];
    }
  };
  
  // Create merged data object that uses database data when available, fallback to mock
  // Calculate price based on package type
  const calculatePrice = (packageType: string): number => {
    const pkgLower = packageType.toLowerCase();
    if (pkgLower.includes('cao cấp') || pkgLower.includes('cao cap')) {
      return 1100000; // Premium package
    } else if (pkgLower.includes('chuyên nghiệp') || pkgLower.includes('chuyen nghiep')) {
      return 750000; // Professional package
    } else if (pkgLower.includes('cơ bản') || pkgLower.includes('co ban')) {
      return 400000; // Basic package
    }
    return 0; // Default
  };

  const displayData = useMemo(() => {
    if (!appointmentData) {
      // Fallback to mock data if API data not loaded yet
      return appointmentsDataMap[appointmentId] || appointmentsDataMap["1"];
    }
    
    const elderly = appointmentData.elderlyProfile;
    const profileData = elderly?.profileData || {};
    const medicalConditions = profileData.medical_conditions || {};
    const independenceLevel = profileData.independence_level || {};
    const location = elderly?.location || {};
    
    // Parse location if it's a string
    let locationObj = location;
    if (typeof location === 'string') {
      try {
        locationObj = JSON.parse(location);
      } catch {
        locationObj = { address: location, latitude: 0, longitude: 0 };
      }
    }
    
    // Calculate duration from servicePackage
    const durationHours = appointmentData.servicePackage?.durationHours || 0;
    const duration = durationHours > 0 ? `${durationHours} giờ` : 'Không có';
    
    // Format time slot
    const timeSlot = appointmentData.startTime && appointmentData.endTime
      ? `${appointmentData.startTime.substring(0, 5)} - ${appointmentData.endTime.substring(0, 5)}`
      : 'Không có';
    
      // Map status từ API - luôn dùng appointmentData.status để đảm bảo chính xác
      const statusMap: Record<string, string> = {
        'PENDING_CAREGIVER': 'Mới',
        'CAREGIVER_APPROVED': 'Chờ thực hiện',
        'IN_PROGRESS': 'Đang thực hiện',
        'COMPLETED': 'Hoàn thành',
        'CANCELLED': 'Đã hủy',
        'EXPIRED': 'Đã hết hạn',
        'WAITING_PAYMENT': 'Chờ thanh toán',
      };
      const mappedStatus = statusMap[appointmentData.status] || appointmentData.status;
    
    return {
      id: appointmentData.careServiceId,
      bookingCode: appointmentData.bookingCode || '',
        status: mappedStatus,
      date: appointmentData.workDate || 'Không có',
      timeSlot: timeSlot,
      duration: duration,
      packageType: appointmentData.servicePackage?.packageName || 'Gói cơ bản',
      price: appointmentData.totalPrice || 0,
      // CI-CO information from workSchedule
      checkIn: {
        imageUrl: appointmentData.workSchedule?.checkInImageUrl || null,
        time: appointmentData.workSchedule?.startTime || null,
      },
      checkOut: {
        imageUrl: appointmentData.workSchedule?.checkOutImageUrl || null,
        time: appointmentData.workSchedule?.endTime || null,
      },
      elderly: {
        id: elderly?.elderlyProfileId || '',
        name: elderly?.fullName || 'Không có',
        age: elderly?.age || 0,
        gender: elderly?.gender === 'MALE' ? 'Nam' : elderly?.gender === 'FEMALE' ? 'Nữ' : 'Không có',
        avatar: elderly?.avatarUrl || 'https://via.placeholder.com/100',
        address: locationObj?.address || 'Chưa có địa chỉ',
        location: locationObj, // Store location object for map button
        phone: elderly?.phoneNumber || 'Không có',
        bloodType: 'Không có', // Not in API response
        healthCondition: elderly?.healthStatus || 'Không có',
        underlyingDiseases: medicalConditions.underlying_diseases || [],
        medications: medicalConditions.medications || [],
        allergies: medicalConditions.allergies || [],
        specialConditions: medicalConditions.special_conditions || [],
        independenceLevel: {
          eating: independenceLevel['ăn uống'] === 'Tự lập' ? 'independent' : independenceLevel['ăn uống'] === 'Cần hỗ trợ' ? 'assisted' : 'dependent',
          bathing: independenceLevel['tắm rửa'] === 'Tự lập' ? 'independent' : independenceLevel['tắm rửa'] === 'Cần hỗ trợ' ? 'assisted' : 'dependent',
          mobility: independenceLevel['di chuyển'] === 'Tự lập' ? 'independent' : independenceLevel['di chuyển'] === 'Cần hỗ trợ' ? 'assisted' : 'dependent',
          toileting: independenceLevel['vệ sinh'] === 'Tự lập' ? 'independent' : independenceLevel['vệ sinh'] === 'Cần hỗ trợ' ? 'assisted' : 'dependent',
          dressing: independenceLevel['mặc quần áo'] === 'Tự lập' ? 'independent' : independenceLevel['mặc quần áo'] === 'Cần hỗ trợ' ? 'assisted' : 'dependent',
        },
        livingEnvironment: {
          houseType: 'Không có',
          livingWith: [],
          accessibility: [],
        },
        hobbies: profileData.hobbies || [],
        favoriteActivities: profileData.favorite_activities || [],
        foodPreferences: profileData.favorite_food || [],
        emergencyContact: profileData.emergency_contacts?.[0] || {
          name: 'Không có',
          relationship: 'Không có',
          phone: 'Không có',
        },
      },
      tasks: {
        fixed: appointmentData.workSchedule?.workTasks?.map(task => ({
          id: task.workTaskId,
          workTaskId: task.workTaskId,
          title: task.name,
          taskName: task.name,
          description: task.description,
          status: task.status,
          completed: task.status === 'DONE',
        })) || appointmentData.servicePackage?.serviceTasks?.map(task => ({
          id: task.serviceTaskId,
          taskId: task.serviceTaskId,
          title: task.taskName,
          taskName: task.taskName,
          description: task.description,
          status: 'PENDING',
          completed: false,
        })) || [],
        flexible: [],
        optional: [],
      },
      notes: [],
      specialInstructions: elderly?.note || elderly?.healthNote || 'Không có',
      responseDeadline: appointmentData.caregiverResponseDeadline || undefined,
      careSeeker: {
        id: appointmentData.careSeekerProfile?.careSeekerProfileId || '',
        name: appointmentData.careSeekerProfile?.fullName || 'Không có',
        age: appointmentData.careSeekerProfile?.age || 0,
        gender: appointmentData.careSeekerProfile?.gender === 'MALE' ? 'Nam' : appointmentData.careSeekerProfile?.gender === 'FEMALE' ? 'Nữ' : 'Không có',
        avatar: appointmentData.careSeekerProfile?.avatarUrl || 'https://via.placeholder.com/100',
        phone: appointmentData.careSeekerProfile?.phoneNumber || 'Không có',
        location: appointmentData.careSeekerProfile?.location || {},
      },
    };
  }, [appointmentData, status, appointmentId]);
  
  const [services, setServices] = useState<any[]>([]);
  
  // Helper to map database status to Vietnamese display status
  const mapDbStatusToVietnamese = (dbStatus: string) => {
    switch (dbStatus) {
      case 'pending': return 'Mới';
      case 'confirmed': return 'Chờ thực hiện';
      case 'in-progress': return 'Đang thực hiện';
      case 'completed': return 'Hoàn thành';
      case 'cancelled':
      case 'rejected': return 'Đã hủy';
      default: return 'Mới';
    }
  };
  
  // Status is already set from API fetch above
  
  // Check if already reviewed
  const initialHasReviewed = getAppointmentHasReviewed(appointmentId);
  const [hasReviewed, setHasReviewed] = useState(initialHasReviewed);
  
  // Check if has complaint
  const hasComplained = getAppointmentHasComplained(appointmentId);
  
  // Notes state
  const [notes, setNotes] = useState<any[]>([]);
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  
  // Payment code modal state
  const [showPaymentCodeModal, setShowPaymentCodeModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<{
    qrCodeBase64: string;
    orderId: string;
  } | null>(null);
  
  // State for accept/reject modals
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  // State for cancel modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelSuccessModal, setShowCancelSuccessModal] = useState(false);
  
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

  // Check if deadline is expired (simple check, no countdown)
  const isDeadlineExpired = displayData.responseDeadline 
    ? new Date(displayData.responseDeadline).getTime() <= new Date().getTime()
    : false;

  // Format deadline message with remaining minutes
  const formatDeadlineDisplay = () => {
    if (remainingMinutes === null || remainingMinutes === undefined) {
      return "Đang tính toán thời gian...";
    }
    return `Bạn có ${remainingMinutes} phút để chấp nhận hay từ chối lịch hẹn này. Nếu quá thời gian hệ thống sẽ tự hủy lịch hẹn`;
  };

  // Helper functions for formatting
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const dayOfWeek = days[date.getDay()];
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${dayOfWeek}, ${day}/${month}/${year}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  // Setup header back button based on fromScreen param
  useEffect(() => {
    const handleBack = () => {
      if (fromScreen) {
        // Navigate to specific screen based on fromScreen param
        switch (fromScreen) {
          case "dashboard":
            (navigation.navigate as any)("Trang chủ");
            break;
          case "booking":
            (navigation.navigate as any)("Yêu cầu dịch vụ");
            break;
          case "availability":
            (navigation.navigate as any)("Quản lý lịch");
            break;
          default:
            navigation.goBack();
        }
      } else {
        // Fallback to goBack if no fromScreen param
        navigation.goBack();
      }
    };

    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={handleBack}
          style={{ marginLeft: 15 }}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={28}
            color="#fff"
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, fromScreen]);

  // Update services when appointmentId or displayData changes - Lấy từ API, không dùng mock data
  useEffect(() => {
    if (!displayData) return;
    
    // Lấy services từ displayData.tasks.fixed (từ workSchedule.workTasks hoặc servicePackage.serviceTasks)
    if (displayData.tasks && displayData.tasks.fixed && displayData.tasks.fixed.length > 0) {
      setServices(displayData.tasks.fixed);
    } else {
      // Fallback: nếu không có tasks từ API thì để mảng rỗng
      setServices([]);
    }
    
    // Don't override status here - it's already set from API fetch
    // Status đã được set từ API fetch ở useEffect đầu tiên, không cần override
    setNotes(displayData.notes || []);
  }, [appointmentId, displayData]);

  // Sync status and review status from global store when component mounts or refocuses
  // LƯU Ý: Status luôn được lấy từ API (appointmentData), KHÔNG override từ global store
  useFocusEffect(
    React.useCallback(() => {
      // Refetch data khi quay lại từ check-in hoặc check-out screen
      if (fromScreen === 'check-in' || fromScreen === 'check-out') {
        console.log('Refetching appointment data after check-in/check-out');
        fetchAppointment();
      }
      
      const syncData = () => {
        // LUÔN ưu tiên status từ API (appointmentData) - đây là source of truth
        if (appointmentData?.status) {
          const statusMap: Record<string, string> = {
            'PENDING_CAREGIVER': 'Mới',
            'CAREGIVER_APPROVED': 'Chờ thực hiện',
            'IN_PROGRESS': 'Đang thực hiện',
            'COMPLETED': 'Hoàn thành',
            'CANCELLED': 'Đã hủy',
            'EXPIRED': 'Đã hết hạn',
            'WAITING_PAYMENT': 'Chờ thanh toán',
          };
          const mappedStatus = statusMap[appointmentData.status] || appointmentData.status;
          // Luôn update status từ API, không check điều kiện
          setStatus(mappedStatus);
        }
        // KHÔNG sync từ global store vì có thể có status cũ/không chính xác
        // Global store chỉ dùng cho các thao tác local, không phải source of truth
        
        const globalHasReviewed = getAppointmentHasReviewed(appointmentId);
        setHasReviewed(globalHasReviewed);
      };
      
      syncData();
      
      // Subscribe to status changes - nhưng chỉ để refresh data, không override status từ API
      const unsubscribe = subscribeToStatusChanges(() => {
        // Khi có thay đổi, refetch từ API để lấy status mới nhất
        fetchAppointment();
      });
      
      return () => {
        unsubscribe();
      };
    }, [appointmentId, appointmentData?.status, fromScreen, fetchAppointment])
  );

  const toggleServiceComplete = async (serviceId: string) => {
    // Tìm service để lấy workTaskId
    const service = services.find(s => s.id === serviceId);
    if (!service) {
      console.error('Service not found:', serviceId);
      return;
    }

    // Kiểm tra xem có workTaskId không (từ workSchedule.workTasks)
    const workTaskId = service.workTaskId;
    if (!workTaskId) {
      console.error('workTaskId not found for service:', serviceId);
      // Nếu không có workTaskId, chỉ update local state (fallback)
      setServices((prev) =>
        prev.map((s) =>
          s.id === serviceId ? { ...s, completed: !s.completed } : s
        )
      );
      return;
    }

    try {
      // Gọi API toggle task
      const response = await mainService.toggleWorkTask(workTaskId);
      
      if (response.status === 'Success' && response.data) {
        // Update local state với status mới từ API
        setServices((prev) =>
          prev.map((s) => {
            if (s.id === serviceId) {
              const newStatus = response.data?.status || (s.completed ? 'IN_PROGRESS' : 'DONE');
              return {
                ...s,
                completed: newStatus === 'DONE',
                status: newStatus,
              };
            }
            return s;
          })
        );

        // Refresh appointment data để đồng bộ với server
        const refreshResponse = await mainService.getCareServiceDetail(appointmentId);
        if (refreshResponse.status === 'Success' && refreshResponse.data) {
          setAppointmentData(refreshResponse.data as MyCareServiceData);
        }
      } else {
        // Nếu API fail, hiển thị lỗi
        showAlert(
          "Lỗi",
          response.message || "Không thể thay đổi trạng thái task. Vui lòng thử lại.",
          [{ text: 'OK', style: 'default' }],
          { icon: 'alert-circle', iconColor: '#EF4444' }
        );
      }
    } catch (error: any) {
      console.error('Error toggling task:', error);
      showAlert(
        "Lỗi",
        error.message || "Không thể thay đổi trạng thái task. Vui lòng thử lại.",
        [{ text: 'OK', style: 'default' }],
        { icon: 'alert-circle', iconColor: '#EF4444' }
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
      case "Mới":
      case "PENDING_CAREGIVER":
        return "#3B82F6"; // Blue
      case "pending":
      case "Chờ thực hiện":
      case "CAREGIVER_APPROVED":
      case "confirmed":
        return "#10B981"; // Green
      case "in-progress":
      case "Đang thực hiện":
      case "IN_PROGRESS":
        return "#8B5CF6"; // Purple
      case "completed":
      case "Hoàn thành":
      case "COMPLETED":
        return "#10B981"; // Green
      case "cancelled":
      case "Đã hủy":
      case "CANCELLED":
        return "#EF4444"; // Red
      case "rejected":
        return "#DC2626"; // Dark Red
      case "WAITING_PAYMENT":
      case "Chờ thanh toán":
        return "#F59E0B"; // Orange
      case "EXPIRED":
      case "Đã hết hạn":
        return "#6B7280"; // Gray
      default:
        return "#6B7280";
    }
  };

  const getStatusText = (status: string) => {
    // Map status giống như trong booking.tsx
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
      case "WAITING_PAYMENT":
        return "Chờ thanh toán";
      default:
        // Nếu đã là tiếng Việt rồi (từ statusMap) thì return luôn
        return status;
    }
  };
  
  // Xử lý các action buttons
  const handleAccept = () => {
    if (isDeadlineExpired) {
      showAlert(
        "Đã quá hạn", 
        "Thời gian chấp nhận/từ chối lịch hẹn đã hết. Lịch hẹn này sẽ tự động bị hủy.",
        [{ text: 'OK', style: 'default' }],
        { icon: 'clock-alert', iconColor: '#EF4444' }
      );
      return;
    }
    setShowAcceptModal(true);
  };

  const confirmAccept = async () => {
    if (!appointmentData) return;

    try {
      setShowAcceptModal(false);
      setIsProcessing(true);
      const response = await mainService.acceptCareService(appointmentId);
      
      if (response.status === "Success") {
        // Update global store
        updateAppointmentStatus(appointmentId, "confirmed");
        
        // Refresh data từ API để lấy status mới nhất
        await fetchAppointment();
        
        showAlert(
          "Thành công", 
          "Đã chấp nhận lịch hẹn",
          [{ text: 'OK', style: 'default' }],
          { icon: 'check-circle', iconColor: '#10B981' }
        );
      } else {
        showAlert(
          "Lỗi", 
          response.message || "Không thể chấp nhận lịch hẹn",
          [{ text: 'OK', style: 'default' }],
          { icon: 'alert-circle', iconColor: '#EF4444' }
        );
      }
    } catch (error: any) {
      console.error('Error accepting appointment:', error);
      showAlert(
        "Lỗi", 
        "Có lỗi xảy ra. Vui lòng thử lại.",
        [{ text: 'OK', style: 'default' }],
        { icon: 'alert-circle', iconColor: '#EF4444' }
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = () => {
    if (isDeadlineExpired) {
      showAlert(
        "Đã quá hạn", 
        "Thời gian chấp nhận/từ chối lịch hẹn đã hết. Lịch hẹn này sẽ tự động bị hủy.",
        [{ text: 'OK', style: 'default' }],
        { icon: 'clock-alert', iconColor: '#EF4444' }
      );
      return;
    }
    setRejectReason("");
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!appointmentData) return;

    try {
      setShowRejectModal(false);
      setIsProcessing(true);
      const response = await mainService.declineCareService(appointmentId, rejectReason || undefined);
      
      if (response.status === "Success") {
        // Update global store
        updateAppointmentStatus(appointmentId, "rejected");
        
        // Refresh data từ API để lấy status mới nhất
        await fetchAppointment();
        
        showAlert(
          "Đã từ chối", 
          "Lịch hẹn đã bị từ chối",
          [{ text: 'OK', style: 'default' }],
          { icon: 'close-circle', iconColor: '#EF4444' }
        );
      } else {
        showAlert(
          "Lỗi", 
          response.message || "Không thể từ chối lịch hẹn",
          [{ text: 'OK', style: 'default' }],
          { icon: 'alert-circle', iconColor: '#EF4444' }
        );
      }
    } catch (error: any) {
      console.error('Error rejecting appointment:', error);
      showAlert(
        "Lỗi", 
        "Có lỗi xảy ra. Vui lòng thử lại.",
        [{ text: 'OK', style: 'default' }],
        { icon: 'alert-circle', iconColor: '#EF4444' }
      );
    } finally {
      setIsProcessing(false);
    }
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
      const currentStatus = globalStatus || appointmentData?.status || displayData?.status;

      // If another appointment is in-progress
      if (currentStatus === "in-progress") {
        const otherContact = displayData?.elderly?.emergencyContact;
        const otherAddress = displayData?.elderly?.address;

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
            conflictingElderlyName: displayData?.elderly?.name || "Không xác định",
            conflictingAddress: otherAddress || "Không xác định",
          };
        }
      }
    }

    return null; // No conflict
  };

  const handleStart = async () => {
    // Validate: Check if there's another in-progress appointment
    const conflict = checkStartConflict(appointmentId);
    
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
    (navigation as any).navigate("Check-in Verification", {
      appointmentId: appointmentId,
      elderlyName: displayData.elderly.name,
      address: displayData.elderly.address,
      amount: displayData.price,
      fromScreen: "appointment-detail",
      // Mock coordinates - in real app, get from appointment data
      elderlyLat: 10.7769,
      elderlyLng: 106.7009,
    });
  };

  const handleCancel = () => {
    setCancelReason("");
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!appointmentData) return;

    try {
      setShowCancelModal(false);
      setIsProcessing(true);
      const response = await mainService.declineCareService(appointmentId, cancelReason || undefined);
      
      if (response.status === "Success") {
        // Update global store
        updateAppointmentStatus(appointmentId, "cancelled");
        
        // Refresh data từ API để lấy status mới nhất
        await fetchAppointment();
        
        setShowCancelSuccessModal(true);
      } else {
        showAlert(
          "Lỗi", 
          response.message || "Không thể hủy lịch hẹn",
          [{ text: 'OK', style: 'default' }],
          { icon: 'alert-circle', iconColor: '#EF4444' }
        );
      }
    } catch (error: any) {
      console.error('Error cancelling appointment:', error);
      showAlert(
        "Lỗi", 
        "Có lỗi xảy ra. Vui lòng thử lại.",
        [{ text: 'OK', style: 'default' }],
        { icon: 'alert-circle', iconColor: '#EF4444' }
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComplete = async () => {
    // Validate: Kiểm tra tất cả dịch vụ đã hoàn thành chưa
    const incompleteServices = services.filter(service => !service.completed);
    
    if (incompleteServices.length > 0) {
      const missingServices = ["Còn thiếu các dịch vụ:"];
      incompleteServices.forEach(s => missingServices.push(`• ${s.title}`));
      
      // Hiển thị cảnh báo nhưng vẫn cho phép tiếp tục
      showAlert(
        "Chưa hoàn thành dịch vụ",
        `Bạn vẫn chưa hoàn thành một số dịch vụ:\n\n${missingServices.join("\n")}\n\nBạn có muốn tiếp tục kết thúc ca không?`,
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Xác nhận",
            style: "default",
            onPress: () => {
              // Navigate to check-out verification screen (giống như Check-in)
              (navigation as any).navigate("Check-in Verification", {
                appointmentId: appointmentId,
                elderlyName: displayData.elderly.name,
                address: displayData.elderly.address,
                amount: displayData.price,
                fromScreen: "appointment-detail",
                mode: "checkout", // Thêm mode để phân biệt CI và CO
                elderlyLat: displayData.elderly.location?.latitude,
                elderlyLng: displayData.elderly.location?.longitude,
              });
            },
          }
        ],
        { icon: 'clipboard-list-outline', iconColor: '#F59E0B' }
      );
      return;
    }
    
    // Nếu tất cả tasks đã hoàn thành, navigate đến Check-out screen
    (navigation as any).navigate("Check-in Verification", {
      appointmentId: appointmentId,
      elderlyName: displayData.elderly.name,
      address: displayData.elderly.address,
      amount: displayData.price,
      fromScreen: "appointment-detail",
      mode: "checkout", // Thêm mode để phân biệt CI và CO
      elderlyLat: displayData.elderly.location?.latitude,
      elderlyLng: displayData.elderly.location?.longitude,
    });
  };


  const handlePaymentComplete = async () => {
    const newStatus = "completed";
    setStatus(newStatus);
    updateAppointmentStatus(appointmentId, newStatus);
    
    // Refresh appointment data ngay để đồng bộ với server
    // Điều này đảm bảo user sẽ thấy status được update
    await fetchAppointment();
    
    showAlert(
      "Thành công", 
      "Công việc đã hoàn thành và thanh toán đã được xác nhận",
      [{ text: 'OK', style: 'default' }],
      { icon: 'check-circle', iconColor: '#10B981' }
    );
  };

  const handleReview = () => {
    if (hasReviewed) {
      // Đã đánh giá rồi - Xem đánh giá
      (navigation.navigate as any)("View Review", {
        appointmentId: appointmentId,
        elderlyName: displayData.elderly?.name || "Người được chăm sóc",
        fromScreen: "appointment-detail",
      });
    } else {
      // Chưa đánh giá - Đánh giá mới
      (navigation.navigate as any)("Review", {
        appointmentId: appointmentId,
        elderlyName: displayData.elderly?.name || "Người được chăm sóc",
        fromScreen: "appointment-detail",
      });
    }
  };

  const handleComplaint = () => {
    const hasComplained = getAppointmentHasComplained(appointmentId);
    const params = {
      bookingId: appointmentId,
      elderlyName: displayData.elderly?.name || "Người được chăm sóc",
      date: displayData.date,
      time: displayData.timeSlot,
      packageName: displayData.packageType,
      fromScreen: "appointment-detail",
    };
    
    if (hasComplained) {
      // Đã khiếu nại rồi - Xem khiếu nại
      (navigation.navigate as any)("Complaint", {
        ...params,
        viewMode: true,
      });
    } else {
      // Chưa khiếu nại - Tạo khiếu nại mới
      (navigation.navigate as any)("Complaint", params);
    }
  };

  const handleMessage = () => {
    // Lấy thông tin người được chăm sóc (ưu tiên) hoặc người liên hệ khẩn cấp (fallback)
    const contactName = displayData.elderly?.name || displayData.elderly?.emergencyContact?.name || "Người dùng";
    
    // Tạo avatar emoji dựa trên giới tính hoặc sử dụng emoji mặc định
    let contactAvatar = "👤"; // Default
    if (displayData.elderly?.gender === "Nam") {
      contactAvatar = "👨";
    } else if (displayData.elderly?.gender === "Nữ") {
      contactAvatar = "👩";
    }
    
    // Navigate to chat screen with contact information
    (navigation.navigate as any)("Tin nhắn", {
      clientName: contactName,
      clientAvatar: contactAvatar,
      chatName: contactName, // Fallback for chat.tsx
      chatAvatar: contactAvatar, // Fallback for chat.tsx
      fromScreen: "appointment-detail",
      appointmentId: appointmentId,
    });
  };

  // Note handlers
  const canAddNote = status === "in-progress" || status === "confirmed";

  const handleOpenNoteModal = () => {
    if (!canAddNote) {
      showAlert(
        "Không thể thêm ghi chú", 
        "Chỉ có thể thêm ghi chú khi đang thực hiện công việc",
        [{ text: 'OK', style: 'default' }],
        { icon: 'alert-circle', iconColor: '#F59E0B' }
      );
      return;
    }
    setIsNoteModalVisible(true);
  };

  const handleCloseNoteModal = () => {
    setIsNoteModalVisible(false);
    setNewNoteContent("");
  };

  const handleSaveNote = () => {
    if (newNoteContent.trim() === "") {
      showAlert(
        "Thiếu thông tin", 
        "Vui lòng nhập nội dung ghi chú",
        [{ text: 'OK', style: 'default' }],
        { icon: 'alert-circle', iconColor: '#F59E0B' }
      );
      return;
    }

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const newNote = {
      id: `N${notes.length + 1}`,
      time: timeStr,
      author: "Caregiver",
      content: newNoteContent.trim(),
      type: "info",
    };

    setNotes([newNote, ...notes]);
    handleCloseNoteModal();
    showAlert(
      "Thành công", 
      "Đã thêm ghi chú mới",
      [{ text: 'OK', style: 'default' }],
      { icon: 'check-circle', iconColor: '#10B981' }
    );
  };

  // Check if can cancel booking (more than 3 days before appointment)
  const canCancelBooking = () => {
    const appointmentDate = new Date(displayData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);
    
    const diffTime = appointmentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 3;
  };

  // Render bottom action buttons dựa trên trạng thái
  const renderBottomActions = () => {
    // Debug: log status để kiểm tra
    
    // Calculate bottom position: bottom nav (~80px) + safe area bottom
    const bottomNavHeight = 80;
    const bottomPosition = bottomNavHeight + Math.max(insets.bottom, 8) + 10;
    
    const bottomActionsStyle = [
      styles.bottomActions,
      { bottom: bottomPosition }
    ];
    
    // Nếu status rỗng hoặc không match, check trực tiếp từ appointmentData trước
    if (!status && appointmentData?.status === 'CAREGIVER_APPROVED') {
      return (
        <View style={bottomActionsStyle}>
          <TouchableOpacity 
            style={styles.actionButtonDanger}
            onPress={handleCancel}
          >
            <Ionicons name="close-circle" size={20} color="#fff" />
            <Text style={styles.actionButtonDangerText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButtonSuccess}
            onPress={handleStart}
          >
            <Ionicons name="play-circle" size={20} color="#fff" />
            <Text style={styles.actionButtonSuccessText}>Bắt đầu</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    switch (status) {
      case "Mới":
        // Yêu cầu mới: Từ chối / Chấp nhận
        return (
          <View style={bottomActionsStyle}>
            <TouchableOpacity 
              style={[
                styles.actionButtonDanger,
                isDeadlineExpired && styles.actionButtonDisabled
              ]}
              onPress={handleReject}
              disabled={isDeadlineExpired}
            >
              <Ionicons name="close-circle" size={20} color="#fff" />
              <Text style={styles.actionButtonDangerText}>Từ chối</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.actionButtonSuccess,
                isDeadlineExpired && styles.actionButtonDisabled
              ]}
              onPress={handleAccept}
              disabled={isDeadlineExpired}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.actionButtonSuccessText}>Chấp nhận</Text>
            </TouchableOpacity>
          </View>
        );
      
      case "Chờ thực hiện":
        // Chờ thực hiện: Hủy / Bắt đầu (giống booking.tsx)
        return (
          <View style={bottomActionsStyle}>
            <TouchableOpacity 
              style={styles.actionButtonDanger}
              onPress={handleCancel}
            >
              <Ionicons name="close-circle" size={20} color="#fff" />
              <Text style={styles.actionButtonDangerText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButtonSuccess}
              onPress={handleStart}
            >
              <Ionicons name="play-circle" size={20} color="#fff" />
              <Text style={styles.actionButtonSuccessText}>Bắt đầu</Text>
            </TouchableOpacity>
          </View>
        );
      
      case "Đang thực hiện":
        // Đang thực hiện: Nhắn tin + Hoàn thành (giống booking.tsx)
        return (
          <View style={bottomActionsStyle}>
            <TouchableOpacity 
              style={[styles.actionButtonSecondary, { flex: 1 }]}
              onPress={handleMessage}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#1F6FEB" />
              <Text style={styles.actionButtonSecondaryText}>Nhắn tin</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButtonSuccess, { flex: 1 }]}
              onPress={handleComplete}
            >
              <Ionicons name="checkmark-done-circle" size={20} color="#fff" />
              <Text style={styles.actionButtonSuccessText}>Hoàn thành</Text>
            </TouchableOpacity>
          </View>
        );
      
      case "Hoàn thành":
        // Hoàn thành: Khiếu nại / Đánh giá (giống booking.tsx)
        return (
          <View style={bottomActionsStyle}>
            <TouchableOpacity 
              style={styles.actionButtonDanger}
              onPress={handleComplaint}
            >
              <Ionicons name={hasComplained ? "eye" : "alert-circle-outline"} size={20} color="#fff" />
              <Text style={styles.actionButtonDangerText}>
                {hasComplained ? "Xem khiếu nại" : "Khiếu nại"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButtonPrimary}
              onPress={handleReview}
            >
              <Ionicons name={hasReviewed ? "eye" : "star"} size={20} color="#fff" />
              <Text style={styles.actionButtonPrimaryText}>
                {hasReviewed ? "Xem đánh giá" : "Đánh giá"}
              </Text>
            </TouchableOpacity>
          </View>
        );
      
      case "Đã hủy":
        // Đã hủy: Không có action buttons
        return null;
      
      default:
        // Fallback: Check appointmentData status directly
        if (appointmentData?.status === 'CAREGIVER_APPROVED') {
          return (
            <View style={bottomActionsStyle}>
              <TouchableOpacity 
                style={styles.actionButtonDanger}
                onPress={handleCancel}
              >
                <Ionicons name="close-circle" size={20} color="#fff" />
                <Text style={styles.actionButtonDangerText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButtonSuccess}
                onPress={handleStart}
              >
                <Ionicons name="play-circle" size={20} color="#fff" />
                <Text style={styles.actionButtonSuccessText}>Bắt đầu</Text>
              </TouchableOpacity>
            </View>
          );
        }
        return null;
    }
  };

  const getIndependenceColor = (level: string) => {
    switch (level) {
      case "independent": return "#10B981";
      case "assisted": return "#F59E0B";
      case "dependent": return "#EF4444";
      default: return "#6B7280";
    }
  };

  const getIndependenceText = (level: string) => {
    switch (level) {
      case "independent": return "Tự lập";
      case "assisted": return "Cần hỗ trợ";
      case "dependent": return "Phụ thuộc";
      default: return "Không rõ";
    }
  };

  const renderService = (service: any) => {
    // Chỉ cho phép tick service khi đang thực hiện VÀ task status không phải PENDING
    const isPending = service.status === 'PENDING';
    const canEditService = status === "Đang thực hiện" && !isPending;
    const isCompleted = service.completed || service.status === 'DONE';
    const isNotCompleted = !isCompleted && (service.status === 'NOT_COMPLETED' || service.status === 'IN_PROGRESS');
    const isCompletedStatus = status === "Hoàn thành" || status === "COMPLETED";
    
    return (
      <TouchableOpacity
        key={service.id}
        style={[
          styles.taskCard,
          !canEditService && styles.taskCardDisabled,
          isCompletedStatus && isCompleted && styles.taskCardCompleted,
          isCompletedStatus && isNotCompleted && styles.taskCardNotCompleted,
        ]}
        onPress={() => canEditService && toggleServiceComplete(service.id)}
        disabled={!canEditService}
        activeOpacity={canEditService ? 0.7 : 1}
      >
        <View style={styles.taskHeader}>
          <View style={styles.taskLeft}>
            <View
              style={[
                styles.checkbox,
                isCompleted && styles.checkboxCompleted,
                (!canEditService || isPending) && !isCompleted && styles.checkboxDisabled,
                isCompletedStatus && isNotCompleted && styles.checkboxNotCompleted,
              ]}
            >
              {isCompleted && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
              {isCompletedStatus && isNotCompleted && (
                <Ionicons name="close" size={16} color="#fff" />
              )}
            </View>
            <View style={styles.taskInfo}>
              <Text
                style={[
                  styles.taskTitle,
                  isCompletedStatus && isCompleted && styles.taskTitleCompletedGreen,
                  isCompletedStatus && isNotCompleted && styles.taskTitleNotCompletedRed,
                  !isCompletedStatus && service.completed && styles.taskTitleCompleted,
                  (!canEditService || isPending) && styles.textDisabled,
                ]}
              >
                {service.title}
              </Text>
              <Text
                style={[
                  styles.taskDescription,
                  isCompletedStatus && isCompleted && styles.taskDescriptionCompletedGreen,
                  isCompletedStatus && isNotCompleted && styles.taskDescriptionNotCompletedRed,
                  (!canEditService || isPending) && !isCompletedStatus && styles.textDisabled,
                ]}
              >
                {service.description}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={displayData.specialInstructions ? { paddingTop: 100, paddingBottom: 120 } : { paddingTop: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <View style={styles.statusBadgeRow}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(status) },
              ]}
            >
              <Text style={styles.statusText}>
                {displayData?.status || (appointmentData?.status ? getStatusText(appointmentData.status) : 'Không xác định')}
              </Text>
            </View>
            {hasComplained && (
              <View style={styles.complaintWarningBadge}>
                <MaterialCommunityIcons name="alert-circle" size={16} color="#EF4444" />
                <Text style={styles.complaintWarningText}>Khiếu nại</Text>
              </View>
            )}
          </View>
          <Text style={styles.appointmentId}>#{displayData.bookingCode || displayData.id}</Text>
        </View>

        {/* Deadline Display - Only for new appointments */}
        {status === "Mới" && remainingMinutes !== null && (
          <View style={[
            styles.deadlineDisplay,
            isDeadlineExpired && styles.deadlineDisplayExpired
          ]}>
            <MaterialCommunityIcons 
              name={isDeadlineExpired ? "clock-alert" : "clock-outline"} 
              size={18} 
              color={isDeadlineExpired ? "#EF4444" : "#F59E0B"} 
            />
            <Text style={[
              styles.deadlineDisplayText,
              isDeadlineExpired && styles.deadlineDisplayTextExpired
            ]}>
              {isDeadlineExpired 
                ? "Đã quá hạn phản hồi" 
                : formatDeadlineDisplay()
              }
            </Text>
          </View>
        )}

        {/* Appointment Info */}
        <View style={[styles.section, styles.firstSection]}>
          <Text style={styles.sectionTitle}>Thông tin lịch hẹn</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ngày</Text>
                <Text style={styles.infoValue}>{displayData.date}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Thời gian</Text>
                <Text style={styles.infoValue}>{displayData.timeSlot}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="package-variant" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Gói dịch vụ</Text>
                <Text style={styles.infoValue}>{displayData.packageType}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="hourglass-outline" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Thời lượng</Text>
                <Text style={styles.infoValue}>{displayData.duration}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Địa chỉ</Text>
                {displayData.elderly.address === 'Chưa có địa chỉ' ? (
                  <TouchableOpacity
                    onPress={async () => {
                      const location = displayData.elderly.location;
                      if (!location?.latitude || !location?.longitude || location.latitude === 0 || location.longitude === 0) {
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
                    }}
                    style={styles.mapButton}
                  >
                    <Text style={styles.mapButtonText}>Xem bản đồ</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.infoValue}>{displayData.elderly.address}</Text>
                )}
              </View>
            </View>
            
            {/* Check In - Check Out Section */}
            <View style={styles.divider} />
            <View style={styles.checkInOutSection}>
              <Text style={styles.checkInOutTitle}>Check In - Check Out</Text>
              
              {/* CI and CO in horizontal layout */}
              <View style={styles.checkInOutRow}>
                {/* Check In */}
                <View style={styles.checkInOutItem}>
                  <View style={styles.checkInOutHeader}>
                    <MaterialCommunityIcons name="login" size={18} color="#10B981" />
                    <Text style={styles.checkInOutLabel}>Check In</Text>
                  </View>
                  {displayData.checkIn?.imageUrl ? (
                    <View style={styles.checkInOutContent}>
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedImageUrl(displayData.checkIn.imageUrl);
                          setShowImageModal(true);
                        }}
                        activeOpacity={0.8}
                      >
                        <Image 
                          source={{ uri: displayData.checkIn.imageUrl }} 
                          style={styles.checkInOutImage}
                        />
                      </TouchableOpacity>
                      {displayData.checkIn?.time && (
                        <Text style={styles.checkInOutTime}>
                          {displayData.checkIn.time.substring(0, 5)}
                        </Text>
                      )}
                    </View>
                  ) : (
                    <Text style={styles.checkInOutPlaceholder}>Chưa CI</Text>
                  )}
                </View>
                
                {/* Check Out */}
                <View style={styles.checkInOutItem}>
                  <View style={styles.checkInOutHeader}>
                    <MaterialCommunityIcons name="logout" size={18} color="#EF4444" />
                    <Text style={styles.checkInOutLabel}>Check Out</Text>
                  </View>
                  {displayData.checkOut?.imageUrl ? (
                    <View style={styles.checkInOutContent}>
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedImageUrl(displayData.checkOut.imageUrl);
                          setShowImageModal(true);
                        }}
                        activeOpacity={0.8}
                      >
                        <Image 
                          source={{ uri: displayData.checkOut.imageUrl }} 
                          style={styles.checkInOutImage}
                        />
                      </TouchableOpacity>
                      {displayData.checkOut?.time && (
                        <Text style={styles.checkInOutTime}>
                          {displayData.checkOut.time.substring(0, 5)}
                        </Text>
                      )}
                    </View>
                  ) : (
                    <Text style={styles.checkInOutPlaceholder}>Chưa CO</Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Elderly Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin người cao tuổi</Text>
          <View style={styles.card}>
            <View style={styles.elderlyHeader}>
              <Image
                source={{ uri: displayData.elderly.avatar }}
                style={styles.avatar}
              />
              <View style={styles.elderlyInfo}>
                <Text style={styles.elderlyName}>{displayData.elderly.name}</Text>
                <Text style={styles.elderlyMeta}>
                  {displayData.elderly.age} tuổi • {displayData.elderly.gender}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#6B7280" />
              <Text style={styles.infoText}>{displayData.elderly.address}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color="#6B7280" />
              <Text style={styles.infoText}>{displayData.elderly.phone}</Text>
            </View>
            
            <View style={styles.divider} />
            
            {/* Blood Type */}
            <View style={styles.infoRow}>
              <Ionicons name="water" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nhóm máu</Text>
                <Text style={styles.infoValue}>{displayData.elderly.bloodType}</Text>
              </View>
            </View>
            
            {/* Health Conditions */}
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="medical-bag" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Bệnh nền</Text>
                {displayData.elderly.underlyingDiseases.length > 0 ? (
                  displayData.elderly.underlyingDiseases.map((disease: any, index: number) => (
                    <View key={index} style={styles.diseaseTag}>
                      <MaterialCommunityIcons name="circle-small" size={16} color="#EF4444" />
                      <Text style={styles.diseaseText}>{disease}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.infoText}>Không có</Text>
                )}
              </View>
            </View>
            
            {/* Medications */}
            <View style={styles.medicationSection}>
              <Text style={styles.subsectionTitle}>Thuốc đang sử dụng:</Text>
              {displayData.elderly.medications.length > 0 ? (
                displayData.elderly.medications.map((med: any, index: number) => (
                  <View key={index} style={styles.medicationItem}>
                    <View style={styles.medicationDot} />
                    <View style={styles.medicationDetails}>
                      <Text style={styles.medicationName}>{med.name}</Text>
                      <Text style={styles.medicationDosage}>
                        {med.dosage} - {med.frequency}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.infoText}>Không có</Text>
              )}
            </View>
            
            {/* Allergies */}
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Dị ứng</Text>
                <View style={styles.allergyContainer}>
                  {displayData.elderly.allergies.length > 0 ? (
                    displayData.elderly.allergies.map((allergy: any, index: number) => (
                      <View key={index} style={styles.allergyTag}>
                        <MaterialCommunityIcons name="alert" size={14} color="#EF4444" />
                        <Text style={styles.allergyText}>{allergy}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.infoText}>Không có</Text>
                  )}
                </View>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            {/* Independence Level */}
            <View style={styles.independenceSection}>
              <Text style={styles.subsectionTitle}>Mức độ tự lập:</Text>
              <View style={styles.independenceGrid}>
                <View style={styles.independenceItem}>
                  <Ionicons name="restaurant" size={18} color="#6B7280" />
                  <Text style={styles.independenceLabel}>Ăn uống</Text>
                  <View style={[styles.independenceBadge, { backgroundColor: getIndependenceColor(displayData.elderly.independenceLevel.eating) }]}>
                    <Text style={styles.independenceBadgeText}>{getIndependenceText(displayData.elderly.independenceLevel.eating)}</Text>
                  </View>
                </View>
                <View style={styles.independenceItem}>
                  <Ionicons name="water" size={18} color="#6B7280" />
                  <Text style={styles.independenceLabel}>Tắm rửa</Text>
                  <View style={[styles.independenceBadge, { backgroundColor: getIndependenceColor(displayData.elderly.independenceLevel.bathing) }]}>
                    <Text style={styles.independenceBadgeText}>{getIndependenceText(displayData.elderly.independenceLevel.bathing)}</Text>
                  </View>
                </View>
                <View style={styles.independenceItem}>
                  <Ionicons name="walk" size={18} color="#6B7280" />
                  <Text style={styles.independenceLabel}>Di chuyển</Text>
                  <View style={[styles.independenceBadge, { backgroundColor: getIndependenceColor(displayData.elderly.independenceLevel.mobility) }]}>
                    <Text style={styles.independenceBadgeText}>{getIndependenceText(displayData.elderly.independenceLevel.mobility)}</Text>
                  </View>
                </View>
                <View style={styles.independenceItem}>
                  <Ionicons name="shirt" size={18} color="#6B7280" />
                  <Text style={styles.independenceLabel}>Mặc đồ</Text>
                  <View style={[styles.independenceBadge, { backgroundColor: getIndependenceColor(displayData.elderly.independenceLevel.dressing) }]}>
                    <Text style={styles.independenceBadgeText}>{getIndependenceText(displayData.elderly.independenceLevel.dressing)}</Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            {/* Living Environment */}
            <View style={styles.livingEnvSection}>
              <Text style={styles.subsectionTitle}>Môi trường sống:</Text>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="home" size={18} color="#6B7280" />
                <Text style={styles.infoText}>Căn hộ chung cư</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="account-multiple" size={18} color="#6B7280" />
                <Text style={styles.infoText}>Sống cùng: {displayData.elderly.livingEnvironment.livingWith.length > 0 ? displayData.elderly.livingEnvironment.livingWith.join(", ") : "Không có"}</Text>
              </View>
              <View style={styles.accessibilityTags}>
                {displayData.elderly.livingEnvironment.accessibility.length > 0 ? (
                  displayData.elderly.livingEnvironment.accessibility.map((item: any, index: number) => (
                    <View key={index} style={styles.accessibilityTag}>
                      <MaterialCommunityIcons name="check-circle" size={14} color="#10B981" />
                      <Text style={styles.accessibilityText}>{item}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.infoText}>Không có</Text>
                )}
              </View>
            </View>
            
            <View style={styles.divider} />
            
            {/* Hobbies & Preferences */}
            <View style={styles.preferencesSection}>
              <Text style={styles.subsectionTitle}>Sở thích & Ưa thích:</Text>
              <View style={styles.hobbyTags}>
                {displayData.elderly.hobbies.length > 0 ? (
                  displayData.elderly.hobbies.map((hobby: any, index: number) => (
                    <View key={index} style={styles.hobbyTag}>
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text style={styles.hobbyText}>{hobby}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.infoText}>Không có</Text>
                )}
              </View>
              <Text style={styles.preferencesLabel}>Món ăn yêu thích:</Text>
              <View style={styles.foodTags}>
                {displayData.elderly.foodPreferences.length > 0 ? (
                  displayData.elderly.foodPreferences.map((food: any, index: number) => (
                    <View key={index} style={styles.foodTag}>
                      <Ionicons name="restaurant" size={14} color="#10B981" />
                      <Text style={styles.foodText}>{food}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.infoText}>Không có</Text>
                )}
              </View>
            </View>
            
            <View style={styles.divider} />
            <View style={styles.emergencyContact}>
              <Text style={styles.emergencyTitle}>
                <Ionicons name="warning-outline" size={16} color="#EF4444" /> Liên hệ khẩn cấp
              </Text>
              <Text style={styles.emergencyName}>
                {displayData.elderly.emergencyContact.name && displayData.elderly.emergencyContact.name !== 'Không có' && displayData.elderly.emergencyContact.relationship && displayData.elderly.emergencyContact.relationship !== 'Không có'
                  ? `${displayData.elderly.emergencyContact.name} (${displayData.elderly.emergencyContact.relationship})`
                  : displayData.elderly.emergencyContact.name || 'Không có'}
              </Text>
              <Text style={styles.emergencyPhone}>
                {displayData.elderly.emergencyContact.phone || 'Không có'}
              </Text>
            </View>
          </View>
        </View>

        {/* Care Seeker Info */}
        {displayData.careSeeker && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin người thuê</Text>
            <View style={styles.card}>
              <View style={styles.elderlyHeader}>
                <Image
                  source={{ uri: displayData.careSeeker.avatar }}
                  style={styles.avatar}
                />
                <View style={styles.elderlyInfo}>
                  <Text style={styles.elderlyName}>{displayData.careSeeker.name}</Text>
                  <Text style={styles.elderlyMeta}>
                    {displayData.careSeeker.age} tuổi • {displayData.careSeeker.gender}
                  </Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={20} color="#6B7280" />
                <Text style={styles.infoText}>{displayData.careSeeker.phone}</Text>
              </View>
              {displayData.careSeeker.location?.address && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={20} color="#6B7280" />
                    <Text style={styles.infoText}>{displayData.careSeeker.location.address}</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "tasks" && styles.tabActive]}
            onPress={() => setSelectedTab("tasks")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "tasks" && styles.tabTextActive,
              ]}
            >
              Nhiệm vụ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "notes" && styles.tabActive]}
            onPress={() => setSelectedTab("notes")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "notes" && styles.tabTextActive,
              ]}
            >
              Ghi chú
            </Text>
          </TouchableOpacity>
        </View>

        {/* Services Tab */}
        {selectedTab === "tasks" && (
          <View style={styles.section}>
            <View style={styles.taskSection}>
              <View style={styles.taskSectionHeader}>
                <MaterialCommunityIcons name="package-variant" size={20} color="#10B981" />
                <Text style={styles.taskSectionTitle}>Dịch vụ {displayData.packageType}</Text>
                <View style={styles.taskBadge}>
                  <Text style={styles.taskBadgeText}>
                    {services.filter((s) => s.completed).length}/{services.length}
                  </Text>
                </View>
              </View>
              <Text style={styles.taskSectionDesc}>
                Các dịch vụ cần thực hiện trong ca làm việc
              </Text>
              {services.map((service) => renderService(service))}
            </View>

            {/* Quick Actions - For new and confirmed appointments */}
            {(status === 'Mới' || status === 'new' || status === 'pending' || status === 'Chờ thực hiện' || status === 'confirmed') && (
              <View style={styles.quickActionsSection}>
                <View style={styles.quickActionsHeader}>
                  <MaterialCommunityIcons name="lightning-bolt" size={20} color="#F59E0B" />
                  <Text style={styles.quickActionsTitle}>Hành động nhanh</Text>
                </View>
                <View style={styles.quickActionsButtons}>
                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={async () => {
                      // Open Google Maps with full address
                      const fullAddress = `${displayData.elderly.address}, Việt Nam`;
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
                    <View style={styles.quickActionIconWrapper}>
                      <MaterialCommunityIcons name="map-marker" size={24} color="#70C1F1" />
                    </View>
                    <Text style={styles.quickActionText}>Xem bản đồ</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => {
                      // Navigate to chat
                      const contactName = displayData.elderly.emergencyContact?.name || displayData.elderly.name;
                      let contactAvatar = "👤";
                      
                      if (displayData.elderly?.gender === "Nam") {
                        contactAvatar = "👨";
                      } else if (displayData.elderly?.gender === "Nữ") {
                        contactAvatar = "👩";
                      }
                      
                      (navigation.navigate as any)("Tin nhắn", {
                        clientName: contactName,
                        clientAvatar: contactAvatar,
                        chatName: contactName,
                        chatAvatar: contactAvatar,
                        fromScreen: "appointment-detail",
                        appointmentId: appointmentId,
                      });
                    }}
                  >
                    <View style={styles.quickActionIconWrapper}>
                      <MaterialCommunityIcons name="message-text" size={24} color="#70C1F1" />
                    </View>
                    <Text style={styles.quickActionText}>Nhắn tin</Text>
          
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Notes Tab */}
        {selectedTab === "notes" && (
          <View style={styles.section}>
            <TouchableOpacity 
              style={[
                styles.addNoteButton,
                !canAddNote && styles.addNoteButtonDisabled
              ]}
              onPress={handleOpenNoteModal}
              disabled={!canAddNote}
              activeOpacity={canAddNote ? 0.7 : 1}
            >
              <Ionicons name="add-circle" size={20} color={canAddNote ? "#10B981" : "#9CA3AF"} />
              <Text style={[
                styles.addNoteText,
                !canAddNote && styles.addNoteTextDisabled
              ]}>
                {canAddNote ? "Thêm ghi chú mới" : "Chỉ có thể thêm ghi chú khi đang thực hiện"}
              </Text>
            </TouchableOpacity>

            {notes.map((note: any) => (
              <View key={note.id} style={styles.noteCard}>
                <View style={styles.noteHeader}>
                  <View style={styles.noteAuthor}>
                    <Ionicons
                      name={note.type === "health" ? "medical" : "person-circle"}
                      size={16}
                      color="#6B7280"
                    />
                    <Text style={styles.noteAuthorText}>{note.author}</Text>
                  </View>
                  <Text style={styles.noteTime}>{note.time}</Text>
                </View>
                <Text style={styles.noteContent}>{note.content}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 200 }} />

    </ScrollView>

    {/* Special Instructions Header - Sticky */}
    {displayData.specialInstructions && (
      <View style={styles.stickyHeaderContainer}>
        <View style={styles.stickyHeaderContent}>
          <Text style={styles.stickyHeaderTitle}>Lưu ý đặc biệt</Text>
          <View style={styles.stickyHeaderCard}>
            <MaterialCommunityIcons name="information" size={20} color="#F59E0B" />
            <Text style={styles.instructionsText}>
              {displayData.specialInstructions}
            </Text>
          </View>
        </View>
      </View>
    )}

    {/* Bottom Actions - Dynamic based on status */}
    {renderBottomActions()}

    {/* Bottom Navigation - No active tab for detail page */}
    <CaregiverBottomNav activeTab="jobs" />

    {/* Add Note Modal */}
    <Modal
      visible={isNoteModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCloseNoteModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Thêm ghi chú mới</Text>
            <TouchableOpacity onPress={handleCloseNoteModal}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.modalLabel}>Nội dung ghi chú</Text>
            <TextInput
              style={styles.modalTextInput}
              placeholder="Nhập nội dung ghi chú..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={newNoteContent}
              onChangeText={setNewNoteContent}
              autoFocus
            />
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.modalButtonCancel}
              onPress={handleCloseNoteModal}
            >
              <Text style={styles.modalButtonCancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButtonSave}
              onPress={handleSaveNote}
            >
              <Text style={styles.modalButtonSaveText}>Lưu ghi chú</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>

    {/* Payment Code Modal */}
    {displayData && (
      <PaymentCode
        visible={showPaymentCodeModal}
        onClose={() => {
          setShowPaymentCodeModal(false);
          setQrCodeData(null);
        }}
        onComplete={handlePaymentComplete}
        bookingId={displayData.bookingCode || displayData.id}
        amount={displayData.price || 0}
        caregiverName="Người chăm sóc" // Or get from auth context
        completedAt={new Date()}
        qrCodeBase64={qrCodeData?.qrCodeBase64}
        orderId={qrCodeData?.orderId}
        paymentId={qrCodeData?.paymentId}
        careServiceId={qrCodeData?.careServiceId || appointmentId}
      />
    )}

    {/* Image Viewer Modal */}
    <Modal
      visible={showImageModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowImageModal(false)}
    >
      <View style={styles.imageModalOverlay}>
        <TouchableOpacity
          style={styles.imageModalCloseButton}
          onPress={() => setShowImageModal(false)}
          activeOpacity={0.8}
        >
          <Ionicons name="close-circle" size={32} color="#fff" />
        </TouchableOpacity>
        {selectedImageUrl && (
          <Image
            source={{ uri: selectedImageUrl }}
            style={styles.imageModalImage}
            resizeMode="contain"
          />
        )}
      </View>
    </Modal>

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
            <Text style={styles.confirmModalHighlight}>
              {appointmentData?.elderlyProfile?.fullName || "người già"}
            </Text>?
          </Text>
          <View style={styles.confirmModalInfo}>
            <View style={styles.confirmInfoRow}>
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text style={styles.confirmInfoText}>
                {appointmentData?.workDate && formatDate(appointmentData.workDate)} • {appointmentData?.startTime} - {appointmentData?.endTime}
              </Text>
            </View>
            <View style={styles.confirmInfoRow}>
              <Ionicons name="cube-outline" size={16} color="#6B7280" />
              <Text style={styles.confirmInfoText}>{appointmentData?.servicePackage?.packageName}</Text>
            </View>
            <View style={styles.confirmInfoRow}>
              <Ionicons name="cash-outline" size={16} color="#6B7280" />
              <Text style={styles.confirmInfoText}>
                Bạn sẽ nhận: <Text style={styles.confirmEarningText}>
                  {appointmentData?.caregiverEarnings && formatPrice(appointmentData.caregiverEarnings)}
                </Text>
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
              disabled={isProcessing}
            >
              <Text style={styles.confirmAcceptButtonText}>
                {isProcessing ? "Đang xử lý..." : "Chấp nhận"}
              </Text>
            </TouchableOpacity>
          </View>
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
              onPress={confirmReject}
              disabled={isProcessing}
            >
              <Text style={styles.rejectConfirmButtonText}>
                {isProcessing ? "Đang xử lý..." : "Xác nhận"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>

    {/* Cancel Modal with Reason Input */}
    <Modal
      visible={showCancelModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowCancelModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.rejectModalContent}>
          <View style={styles.rejectIconContainer}>
            <View style={styles.rejectIconCircle}>
              <Ionicons name="close-circle" size={48} color="#EF4444" />
            </View>
          </View>
          <Text style={styles.rejectModalTitle}>Hủy lịch hẹn</Text>
          <Text style={styles.rejectModalMessage}>
            Vui lòng nhập lý do hủy (không bắt buộc):
          </Text>
          <TextInput
            style={styles.rejectReasonInput}
            placeholder="Nhập lý do hủy..."
            value={cancelReason}
            onChangeText={setCancelReason}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#9CA3AF"
          />
          <View style={styles.rejectModalButtons}>
            <TouchableOpacity
              style={styles.rejectCancelButton}
              onPress={() => {
                setShowCancelModal(false);
                setCancelReason("");
              }}
            >
              <Text style={styles.rejectCancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rejectConfirmButton}
              onPress={confirmCancel}
              disabled={isProcessing}
            >
              <Text style={styles.rejectConfirmButtonText}>
                {isProcessing ? "Đang xử lý..." : "Xác nhận"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>

    {/* Cancel Success Modal */}
    <Modal
      visible={showCancelSuccessModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowCancelSuccessModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.rejectSuccessModalContent}>
          <View style={styles.rejectSuccessIconContainer}>
            <View style={styles.rejectSuccessIconCircle}>
              <Ionicons name="checkmark-circle" size={64} color="#10B981" />
            </View>
          </View>
          <Text style={styles.rejectSuccessModalTitle}>Đã hủy lịch hẹn</Text>
          <Text style={styles.rejectSuccessModalMessage}>
            Bạn đã hủy lịch hẹn thành công.
          </Text>
          <TouchableOpacity
            style={styles.rejectSuccessModalButton}
            onPress={() => setShowCancelSuccessModal(false)}
          >
            <Text style={styles.rejectSuccessModalButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>

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
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
  },
  statusBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  complaintWarningBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  complaintWarningText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#DC2626",
  },
  appointmentId: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  firstSection: {
    marginTop: -8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "600",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  elderlyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E5E7EB",
  },
  elderlyInfo: {
    marginLeft: 12,
    flex: 1,
  },
  elderlyName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  elderlyMeta: {
    fontSize: 14,
    color: "#6B7280",
  },
  emergencyContact: {
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 8,
  },
  emergencyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
    marginBottom: 6,
  },
  emergencyName: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "600",
    marginBottom: 4,
  },
  emergencyPhone: {
    fontSize: 14,
    color: "#EF4444",
    fontWeight: "600",
  },
  instructionsCard: {
    backgroundColor: "#FFFBEB",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  instructionsText: {
    flex: 1,
    fontSize: 14,
    color: "#92400E",
    marginLeft: 8,
    lineHeight: 20,
  },
  stickyHeaderContainer: {
    position: "absolute",
    top: 0, // Thử đặt ở vị trí 0
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: "#FFFBEB",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  stickyHeaderContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    marginTop: 0,
  },
  stickyHeaderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    marginTop: 0,
    paddingTop: 0,
  },
  stickyHeaderCard: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: "#10B981",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  tabTextActive: {
    color: "#fff",
  },
  taskSection: {
    marginBottom: 24,
  },
  taskSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  taskSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 8,
    flex: 1,
  },
  taskBadge: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  quickActionsSection: {
    marginTop: 20,
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  quickActionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#92400E",
  },
  quickActionsButtons: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  quickActionSubtext: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  taskSectionDesc: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 12,
    marginLeft: 28,
  },
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  taskCardDisabled: {
    opacity: 0.6,
    backgroundColor: "#F9FAFB",
  },
  taskCardCompleted: {
    backgroundColor: "#D1FAE5",
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  taskCardNotCompleted: {
    backgroundColor: "#FEE2E2",
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  taskLeft: {
    flexDirection: "row",
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  checkboxNotCompleted: {
    backgroundColor: "#EF4444",
    borderColor: "#EF4444",
  },
  checkboxDisabled: {
    borderColor: "#E5E7EB",
    backgroundColor: "#F3F4F6",
  },
  taskInfo: {
    flex: 1,
  },
  taskTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  taskTime: {
    fontSize: 13,
    fontWeight: "600",
    color: "#10B981",
    marginLeft: 4,
  },
  requiredBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  requiredText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#EF4444",
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through",
    color: "#9CA3AF",
  },
  taskTitleCompletedGreen: {
    color: "#059669",
    fontWeight: "700",
  },
  taskTitleNotCompletedRed: {
    color: "#DC2626",
    fontWeight: "700",
  },
  taskDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  taskDescriptionCompletedGreen: {
    color: "#047857",
  },
  taskDescriptionNotCompletedRed: {
    color: "#B91C1C",
  },
  textDisabled: {
    color: "#9CA3AF",
  },
  addNoteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#10B981",
    borderStyle: "dashed",
    marginBottom: 12,
  },
  addNoteButtonDisabled: {
    backgroundColor: "#F9FAFB",
    borderColor: "#D1D5DB",
    opacity: 0.7,
  },
  addNoteText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
    marginLeft: 6,
  },
  addNoteTextDisabled: {
    color: "#9CA3AF",
  },
  noteCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  noteAuthor: {
    flexDirection: "row",
    alignItems: "center",
  },
  noteAuthorText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
    marginLeft: 6,
  },
  noteTime: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  noteContent: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
  },
  bottomActions: {
  position: "absolute",
  left: 0,
  right: 0,
  // bottom will be set dynamically in renderBottomActions based on safe area
  flexDirection: "row",
  paddingHorizontal: 16,
  paddingVertical: 12,
  backgroundColor: "#fff",
  borderTopWidth: 1,
  borderTopColor: "#E5E7EB",
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: -2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 5, // For Android
  gap: 12,
  },
  actionButtonSecondary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#10B981",
  },
  actionButtonSecondaryText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#10B981",
    marginLeft: 6,
  },
  actionButtonPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#10B981",
  },
  actionButtonPrimaryText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 6,
  },
  // New button styles
  actionButtonSuccess: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#10B981",
  },
  actionButtonSuccessText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 6,
  },
  actionButtonDanger: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#EF4444",
  },
  actionButtonDangerText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 6,
  },
  actionButtonWarning: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#F59E0B",
  },
  actionButtonWarningText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 6,
  },
  // New styles for elderly info
  diseaseTag: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  diseaseText: {
    fontSize: 13,
    color: "#1F2937",
    marginLeft: 4,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
    marginTop: 8,
  },
  medicationSection: {
    marginTop: 8,
  },
  medicationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  medicationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
    marginTop: 6,
    marginRight: 8,
  },
  medicationDetails: {
    flex: 1,
  },
  medicationName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
  },
  medicationDosage: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  allergyContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  allergyTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  allergyText: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "500",
  },
  specialConditionsSection: {
    marginTop: 8,
  },
  conditionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFBEB",
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
    gap: 6,
  },
  conditionText: {
    flex: 1,
    fontSize: 12,
    color: "#92400E",
    lineHeight: 18,
  },
  independenceSection: {
    marginTop: 8,
  },
  independenceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  independenceItem: {
    width: "48%",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  independenceLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 6,
  },
  independenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  independenceBadgeText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
  },
  livingEnvSection: {
    marginTop: 8,
  },
  accessibilityTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  accessibilityTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  accessibilityText: {
    fontSize: 12,
    color: "#065F46",
    fontWeight: "500",
  },
  preferencesSection: {
    marginTop: 8,
  },
  preferencesLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 12,
    marginBottom: 6,
  },
  hobbyTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  hobbyTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  hobbyText: {
    fontSize: 12,
    color: "#92400E",
    fontWeight: "500",
  },
  foodTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  foodTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  foodText: {
    fontSize: 12,
    color: "#065F46",
    fontWeight: "500",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "90%",
    maxWidth: 500,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  modalTextInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#1F2937",
    minHeight: 120,
    maxHeight: 200,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  modalButtonCancel: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
  },
  modalButtonCancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  modalButtonSave: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#10B981",
  },
  modalButtonSaveText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  deadlineCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    gap: 12,
  },
  deadlineCardExpired: {
    backgroundColor: "#FEE2E2",
    borderLeftColor: "#EF4444",
  },
  mapButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#2DC2D7",
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  mapButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  checkInOutSection: {
    marginTop: 8,
  },
  checkInOutTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  checkInOutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  checkInOutItem: {
    flex: 1,
    marginBottom: 8,
  },
  checkInOutHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  checkInOutLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 6,
  },
  checkInOutContent: {
    alignItems: "center",
  },
  checkInOutImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: "#F3F4F6",
  },
  checkInOutTime: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  checkInOutPlaceholder: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
    paddingVertical: 8,
    textAlign: "center",
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageModalCloseButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
  },
  imageModalImage: {
    width: "90%",
    height: "80%",
  },
  deadlineContent: {
    flex: 1,
  },
  deadlineTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 4,
  },
  deadlineTitleExpired: {
    color: "#991B1B",
  },
  deadlineTime: {
    fontSize: 13,
    color: "#92400E",
    fontWeight: "600",
  },
  deadlineTimeExpired: {
    color: "#991B1B",
  },
  deadlineWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
    gap: 6,
    width: "100%",
  },
  deadlineExpired: {
    backgroundColor: "#FEE2E2",
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 12,
    gap: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  deadlineDisplayExpired: {
    backgroundColor: "#FEE2E2",
    borderLeftColor: "#EF4444",
  },
  deadlineDisplayText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400E",
  },
  deadlineDisplayTextExpired: {
    color: "#991B1B",
  },
  // Modal styles
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
  // Cancel success modal styles (reuse reject success styles)
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

