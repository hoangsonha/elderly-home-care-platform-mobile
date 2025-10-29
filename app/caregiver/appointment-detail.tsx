import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Mock data
const appointmentData = {
  id: "APT001",
  status: "confirmed", // confirmed, in-progress, completed
  date: "2024-01-15",
  timeSlot: "08:00 - 12:00",
  duration: "4 giờ",
  packageType: "Gói Chuyên sâu",
  
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
};

export default function AppointmentDetailScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<"tasks" | "notes">("tasks");
  const [tasks, setTasks] = useState(appointmentData.tasks);

  const toggleTaskComplete = (category: "fixed" | "flexible" | "optional", taskId: string) => {
    setTasks((prev) => ({
      ...prev,
      [category]: prev[category].map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ),
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "#10B981";
      case "in-progress":
        return "#F59E0B";
      case "completed":
        return "#6B7280";
      default:
        return "#6B7280";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Đã xác nhận";
      case "in-progress":
        return "Đang thực hiện";
      case "completed":
        return "Hoàn thành";
      default:
        return status;
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

  const renderTask = (
    task: any,
    category: "fixed" | "flexible" | "optional",
    showTime: boolean = false
  ) => (
    <TouchableOpacity
      key={task.id}
      style={styles.taskCard}
      onPress={() => toggleTaskComplete(category, task.id)}
    >
      <View style={styles.taskHeader}>
        <View style={styles.taskLeft}>
          <View
            style={[
              styles.checkbox,
              task.completed && styles.checkboxCompleted,
            ]}
          >
            {task.completed && (
              <Ionicons name="checkmark" size={16} color="#fff" />
            )}
          </View>
          <View style={styles.taskInfo}>
            {showTime && (
              <View style={styles.taskTimeContainer}>
                <Ionicons name="time-outline" size={14} color="#10B981" />
                <Text style={styles.taskTime}>{task.time}</Text>
                {task.required && (
                  <View style={styles.requiredBadge}>
                    <Text style={styles.requiredText}>Bắt buộc</Text>
                  </View>
                )}
              </View>
            )}
            <Text
              style={[
                styles.taskTitle,
                task.completed && styles.taskTitleCompleted,
              ]}
            >
              {task.title}
            </Text>
            <Text style={styles.taskDescription}>{task.description}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết lịch hẹn</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(appointmentData.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {getStatusText(appointmentData.status)}
            </Text>
          </View>
          <Text style={styles.appointmentId}>#{appointmentData.id}</Text>
        </View>

        {/* Appointment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin lịch hẹn</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ngày</Text>
                <Text style={styles.infoValue}>{appointmentData.date}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Thời gian</Text>
                <Text style={styles.infoValue}>{appointmentData.timeSlot}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="package-variant" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Gói dịch vụ</Text>
                <Text style={styles.infoValue}>{appointmentData.packageType}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="hourglass-outline" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Thời lượng</Text>
                <Text style={styles.infoValue}>{appointmentData.duration}</Text>
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
                source={{ uri: appointmentData.elderly.avatar }}
                style={styles.avatar}
              />
              <View style={styles.elderlyInfo}>
                <Text style={styles.elderlyName}>{appointmentData.elderly.name}</Text>
                <Text style={styles.elderlyMeta}>
                  {appointmentData.elderly.age} tuổi • {appointmentData.elderly.gender}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#6B7280" />
              <Text style={styles.infoText}>{appointmentData.elderly.address}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color="#6B7280" />
              <Text style={styles.infoText}>{appointmentData.elderly.phone}</Text>
            </View>
            
            <View style={styles.divider} />
            
            {/* Blood Type */}
            <View style={styles.infoRow}>
              <Ionicons name="water" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nhóm máu</Text>
                <Text style={styles.infoValue}>{appointmentData.elderly.bloodType}</Text>
              </View>
            </View>
            
            {/* Health Conditions */}
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="medical-bag" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Bệnh nền</Text>
                {appointmentData.elderly.underlyingDiseases.map((disease, index) => (
                  <View key={index} style={styles.diseaseTag}>
                    <MaterialCommunityIcons name="circle-small" size={16} color="#EF4444" />
                    <Text style={styles.diseaseText}>{disease}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            {/* Medications */}
            <View style={styles.medicationSection}>
              <Text style={styles.subsectionTitle}>Thuốc đang sử dụng:</Text>
              {appointmentData.elderly.medications.map((med, index) => (
                <View key={index} style={styles.medicationItem}>
                  <View style={styles.medicationDot} />
                  <View style={styles.medicationDetails}>
                    <Text style={styles.medicationName}>{med.name}</Text>
                    <Text style={styles.medicationDosage}>
                      {med.dosage} - {med.frequency}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
            
            {/* Allergies */}
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Dị ứng</Text>
                <View style={styles.allergyContainer}>
                  {appointmentData.elderly.allergies.map((allergy, index) => (
                    <View key={index} style={styles.allergyTag}>
                      <MaterialCommunityIcons name="alert" size={14} color="#EF4444" />
                      <Text style={styles.allergyText}>{allergy}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
            
            {/* Special Conditions */}
            <View style={styles.specialConditionsSection}>
              <Text style={styles.subsectionTitle}>Lưu ý đặc biệt:</Text>
              {appointmentData.elderly.specialConditions.map((condition, index) => (
                <View key={index} style={styles.conditionItem}>
                  <MaterialCommunityIcons name="information" size={16} color="#F59E0B" />
                  <Text style={styles.conditionText}>{condition}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.divider} />
            
            {/* Independence Level */}
            <View style={styles.independenceSection}>
              <Text style={styles.subsectionTitle}>Mức độ tự lập:</Text>
              <View style={styles.independenceGrid}>
                <View style={styles.independenceItem}>
                  <Ionicons name="restaurant" size={18} color="#6B7280" />
                  <Text style={styles.independenceLabel}>Ăn uống</Text>
                  <View style={[styles.independenceBadge, { backgroundColor: getIndependenceColor(appointmentData.elderly.independenceLevel.eating) }]}>
                    <Text style={styles.independenceBadgeText}>{getIndependenceText(appointmentData.elderly.independenceLevel.eating)}</Text>
                  </View>
                </View>
                <View style={styles.independenceItem}>
                  <Ionicons name="water" size={18} color="#6B7280" />
                  <Text style={styles.independenceLabel}>Tắm rửa</Text>
                  <View style={[styles.independenceBadge, { backgroundColor: getIndependenceColor(appointmentData.elderly.independenceLevel.bathing) }]}>
                    <Text style={styles.independenceBadgeText}>{getIndependenceText(appointmentData.elderly.independenceLevel.bathing)}</Text>
                  </View>
                </View>
                <View style={styles.independenceItem}>
                  <Ionicons name="walk" size={18} color="#6B7280" />
                  <Text style={styles.independenceLabel}>Di chuyển</Text>
                  <View style={[styles.independenceBadge, { backgroundColor: getIndependenceColor(appointmentData.elderly.independenceLevel.mobility) }]}>
                    <Text style={styles.independenceBadgeText}>{getIndependenceText(appointmentData.elderly.independenceLevel.mobility)}</Text>
                  </View>
                </View>
                <View style={styles.independenceItem}>
                  <Ionicons name="shirt" size={18} color="#6B7280" />
                  <Text style={styles.independenceLabel}>Mặc đồ</Text>
                  <View style={[styles.independenceBadge, { backgroundColor: getIndependenceColor(appointmentData.elderly.independenceLevel.dressing) }]}>
                    <Text style={styles.independenceBadgeText}>{getIndependenceText(appointmentData.elderly.independenceLevel.dressing)}</Text>
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
                <Text style={styles.infoText}>Sống cùng: {appointmentData.elderly.livingEnvironment.livingWith.join(", ")}</Text>
              </View>
              <View style={styles.accessibilityTags}>
                {appointmentData.elderly.livingEnvironment.accessibility.map((item, index) => (
                  <View key={index} style={styles.accessibilityTag}>
                    <MaterialCommunityIcons name="check-circle" size={14} color="#10B981" />
                    <Text style={styles.accessibilityText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.divider} />
            
            {/* Hobbies & Preferences */}
            <View style={styles.preferencesSection}>
              <Text style={styles.subsectionTitle}>Sở thích & Ưa thích:</Text>
              <View style={styles.hobbyTags}>
                {appointmentData.elderly.hobbies.map((hobby, index) => (
                  <View key={index} style={styles.hobbyTag}>
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text style={styles.hobbyText}>{hobby}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.preferencesLabel}>Món ăn yêu thích:</Text>
              <View style={styles.foodTags}>
                {appointmentData.elderly.foodPreferences.map((food, index) => (
                  <View key={index} style={styles.foodTag}>
                    <Ionicons name="restaurant" size={14} color="#10B981" />
                    <Text style={styles.foodText}>{food}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.divider} />
            <View style={styles.emergencyContact}>
              <Text style={styles.emergencyTitle}>
                <Ionicons name="warning-outline" size={16} color="#EF4444" /> Liên hệ khẩn cấp
              </Text>
              <Text style={styles.emergencyName}>
                {appointmentData.elderly.emergencyContact.name} ({appointmentData.elderly.emergencyContact.relationship})
              </Text>
              <Text style={styles.emergencyPhone}>
                {appointmentData.elderly.emergencyContact.phone}
              </Text>
            </View>
          </View>
        </View>

        {/* Special Instructions */}
        {appointmentData.specialInstructions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lưu ý đặc biệt</Text>
            <View style={styles.instructionsCard}>
              <MaterialCommunityIcons name="information" size={20} color="#F59E0B" />
              <Text style={styles.instructionsText}>
                {appointmentData.specialInstructions}
              </Text>
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

        {/* Tasks Tab */}
        {selectedTab === "tasks" && (
          <View style={styles.section}>
            {/* Fixed Tasks */}
            <View style={styles.taskSection}>
              <View style={styles.taskSectionHeader}>
                <MaterialCommunityIcons name="clock-alert" size={20} color="#EF4444" />
                <Text style={styles.taskSectionTitle}>Nhiệm vụ cố định</Text>
                <View style={styles.taskBadge}>
                  <Text style={styles.taskBadgeText}>
                    {tasks.fixed.filter((t) => t.completed).length}/{tasks.fixed.length}
                  </Text>
                </View>
              </View>
              <Text style={styles.taskSectionDesc}>
                Cần thực hiện đúng thời gian quy định
              </Text>
              {tasks.fixed.map((task) => renderTask(task, "fixed", true))}
            </View>

            {/* Flexible Tasks */}
            <View style={styles.taskSection}>
              <View style={styles.taskSectionHeader}>
                <MaterialCommunityIcons name="clock-check" size={20} color="#10B981" />
                <Text style={styles.taskSectionTitle}>Nhiệm vụ linh hoạt</Text>
                <View style={styles.taskBadge}>
                  <Text style={styles.taskBadgeText}>
                    {tasks.flexible.filter((t) => t.completed).length}/{tasks.flexible.length}
                  </Text>
                </View>
              </View>
              <Text style={styles.taskSectionDesc}>
                Thực hiện trong ca, không bắt buộc đúng giờ
              </Text>
              {tasks.flexible.map((task) => renderTask(task, "flexible"))}
            </View>

            {/* Optional Tasks */}
            <View style={styles.taskSection}>
              <View style={styles.taskSectionHeader}>
                <MaterialCommunityIcons name="clock-outline" size={20} color="#6B7280" />
                <Text style={styles.taskSectionTitle}>Nhiệm vụ tùy chọn</Text>
                <View style={styles.taskBadge}>
                  <Text style={styles.taskBadgeText}>
                    {tasks.optional.filter((t) => t.completed).length}/{tasks.optional.length}
                  </Text>
                </View>
              </View>
              <Text style={styles.taskSectionDesc}>
                Có thể thực hiện nếu có thời gian
              </Text>
              {tasks.optional.map((task) => renderTask(task, "optional"))}
            </View>
          </View>
        )}

        {/* Notes Tab */}
        {selectedTab === "notes" && (
          <View style={styles.section}>
            <TouchableOpacity style={styles.addNoteButton}>
              <Ionicons name="add-circle" size={20} color="#10B981" />
              <Text style={styles.addNoteText}>Thêm ghi chú mới</Text>
            </TouchableOpacity>

            {appointmentData.notes.map((note) => (
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

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.actionButtonSecondary}>
          <Ionicons name="chatbubble-outline" size={20} color="#10B981" />
          <Text style={styles.actionButtonSecondaryText}>Nhắn tin</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButtonPrimary}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.actionButtonPrimaryText}>Hoàn thành ca</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  moreButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  appointmentId: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
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
    borderRadius: 8,
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
  taskDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
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
  addNoteText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
    marginLeft: 6,
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
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
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
});
