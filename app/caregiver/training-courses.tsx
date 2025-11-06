import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Course {
  id: string;
  title: string;
  description: string;
  category: "Cơ bản" | "Trung cấp" | "Nâng cao";
  participants: number;
  duration: string; // "8 tuần", "6 tuần", "4 tuần"
  instructor: string;
  image: string; // Image URI
}

const courses: Course[] = [
  {
    id: "1",
    title: "Chăm Sóc Cơ Bản Người Cao Tuổi",
    description: "Học các kỹ năng chăm sóc cơ bản, an toàn và hiệu quả cho người cao tuổi tại nhà và cơ sở y tế.",
    category: "Cơ bản",
    participants: 1254,
    duration: "8 tuần",
    instructor: "BS. Nguyễn Thị Mai",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=200&fit=crop",
  },
  {
    id: "2",
    title: "Dinh Dưỡng Cho Người Cao Tuổi",
    description: "Kiến thức chuyên sâu về dinh dưỡng, lập thực đơn và chế biến món ăn phù hợp cho người cao tuổi.",
    category: "Trung cấp",
    participants: 892,
    duration: "6 tuần",
    instructor: "TS. Trần Văn Hùng",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=200&fit=crop",
  },
  {
    id: "3",
    title: "Chăm Sóc Sức Khỏe Tinh Thần",
    description: "Hỗ trợ sức khỏe tinh thần, phòng ngừa trầm cảm và các vấn đề tâm lý ở người cao tuổi.",
    category: "Nâng cao",
    participants: 645,
    duration: "4 tuần",
    instructor: "ThS. Lê Thị Hoa",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=200&fit=crop",
  },
];

export default function TrainingCoursesMobile({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Cơ bản":
        return "#10B981";
      case "Trung cấp":
        return "#10B981";
      case "Nâng cao":
        return "#10B981";
      default:
        return "#10B981";
    }
  };

  const renderCourseCard = ({ item }: { item: Course }) => (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={() => navigation.navigate("Chi tiết khóa học", { id: item.id })}
      activeOpacity={0.7}
    >
      {/* Course Image */}
      <View style={styles.courseImageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.courseImage}
          resizeMode="cover"
        />
      </View>

      {/* Course Content */}
      <View style={styles.courseContent}>
        {/* Category Tag */}
        <View style={styles.courseHeader}>
          <View style={[styles.categoryTag, { backgroundColor: getCategoryColor(item.category) }]}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>

        {/* Course Title */}
        <Text style={styles.courseTitle}>{item.title}</Text>

        {/* Course Description */}
        <Text style={styles.courseDescription} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Participants and Duration */}
        <View style={styles.courseMeta}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="account-group" size={16} color="#6B7280" />
            <Text style={styles.metaText}>{item.participants.toLocaleString()}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text style={styles.metaText}>{item.duration}</Text>
          </View>
        </View>

        {/* Instructor */}
        <Text style={styles.instructorText}>{item.instructor}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={["#2563EB", "#10B981"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.heroSection}
        >
          <Text style={styles.heroTitle}>
            Đào Tạo Chăm Sóc{"\n"}Người Cao Tuổi
          </Text>
          <Text style={styles.heroSubtitle}>
            Học các kỹ năng chuyên nghiệp từ các chuyên gia hàng đầu
          </Text>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm khóa học..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </LinearGradient>

        {/* Featured Courses Section */}
        <View style={styles.featuredSection}>
          <Text style={styles.sectionTitle}>Khóa Học Nổi Bật</Text>
          <Text style={styles.sectionSubtitle}>
            Khám phá các khóa học được đánh giá cao nhất
          </Text>

          <FlatList
            data={filteredCourses}
            renderItem={renderCourseCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.coursesList}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <CaregiverBottomNav activeTab="profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroSection: {
    paddingTop: Platform.OS === "android" ? 20 : 40,
    paddingBottom: 32,
    paddingHorizontal: 16,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 36,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 16,
    opacity: 0.95,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
    padding: 0,
  },
  featuredSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
  },
  coursesList: {
    gap: 16,
  },
  courseCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  courseImageContainer: {
    width: "100%",
    height: 200,
    backgroundColor: "#E5E7EB",
  },
  courseImage: {
    width: "100%",
    height: "100%",
  },
  courseContent: {
    padding: 16,
  },
  courseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    lineHeight: 24,
  },
  courseDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 12,
  },
  courseMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: "#6B7280",
  },
  instructorText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 4,
  },
});
