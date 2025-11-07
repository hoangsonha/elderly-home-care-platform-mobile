import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { getCurrentLesson, getFirstIncompleteLesson, isLessonCompleted } from "@/data/trainingStore";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Lesson {
  title: string;
  duration: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export default function TrainingCourseDetail() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { id } = route.params as { id: string };
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(["1"]));

  // Giả lập data (bạn có thể fetch API sau này)
  const course = {
    id,
    title: "Chăm Sóc Cơ Bản Người Cao Tuổi",
    category: "Cơ bản",
    rating: 4.8,
    participants: 1254,
    duration: "8 tuần",
    lessons: 9,
    description:
      "Học các kỹ năng chăm sóc cơ bản, an toàn và hiệu quả cho người cao tuổi tại nhà và cơ sở y tế.",
    instructor: "BS. Nguyễn Thị Mai",
    modules: [
      {
        id: "1",
        title: "Module 1: Giới Thiệu Về Chăm Sóc Người Cao Tuổi",
        description: "Tổng quan về chăm sóc người cao tuổi và vai trò của người chăm sóc",
        lessons: [
          { title: "Vai trò và trách nhiệm của người chăm sóc", duration: "15 phút" },
          { title: "Hiểu về quá trình lão hóa", duration: "20 phút" },
          { title: "Giao tiếp hiệu quả với người cao tuổi", duration: "18 phút" },
        ],
      },
      {
        id: "2",
        title: "Module 2: An Toàn Và Vệ Sinh",
        description: "Các nguyên tắc an toàn và vệ sinh trong chăm sóc người cao tuổi",
        lessons: [
          { title: "Nguyên tắc an toàn cơ bản", duration: "12 phút" },
          { title: "Vệ sinh cá nhân", duration: "15 phút" },
          { title: "Phòng ngừa té ngã", duration: "18 phút" },
        ],
      },
      {
        id: "3",
        title: "Module 3: Chăm Sóc Hàng Ngày",
        description: "Kỹ năng chăm sóc sinh hoạt hàng ngày",
        lessons: [
          { title: "Hỗ trợ ăn uống", duration: "10 phút" },
          { title: "Hỗ trợ vận động", duration: "15 phút" },
          { title: "Chăm sóc giấc ngủ", duration: "12 phút" },
        ],
      },
    ] as Module[],
  };

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const totalModules = course.modules.length;
  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);

  const handleEnroll = () => {
    // Tìm bài học chưa hoàn thành đầu tiên
    let targetLesson = getFirstIncompleteLesson(course.id, course.modules);
    
    // Nếu không tìm thấy bài chưa hoàn thành, kiểm tra bài học hiện tại
    if (!targetLesson) {
      const currentLesson = getCurrentLesson(course.id);
      // Nếu có bài học hiện tại và chưa hoàn thành, dùng bài đó
      if (currentLesson && !isLessonCompleted(course.id, currentLesson.moduleId, currentLesson.lessonIndex)) {
        targetLesson = currentLesson;
      } else {
        // Nếu tất cả đã hoàn thành hoặc không có bài hiện tại, lấy bài đầu tiên
        targetLesson = {
          moduleId: course.modules[0].id,
          lessonIndex: 0,
        };
      }
    }
    
    const targetModule = course.modules.find((m) => m.id === targetLesson.moduleId);
    const targetLessonData = targetModule?.lessons[targetLesson.lessonIndex];
    
    if (targetLessonData) {
      navigation.navigate("Chi tiết bài học", {
        courseId: course.id,
        courseTitle: course.title,
        allModules: course.modules,
        currentModuleId: targetLesson.moduleId,
        currentLessonIndex: targetLesson.lessonIndex,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with Gradient */}
        <LinearGradient
          colors={["#6366F1", "#10B981"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.heroSection}
        >
          {/* Category Tag */}
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{course.category}</Text>
          </View>

          {/* Course Title */}
          <Text style={styles.heroTitle}>{course.title}</Text>

          {/* Course Description */}
          <Text style={styles.heroDescription}>{course.description}</Text>

          {/* Meta Information */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="account-group" size={18} color="#fff" />
              <Text style={styles.metaText}>{course.participants.toLocaleString()}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={18} color="#fff" />
              <Text style={styles.metaText}>{course.duration}</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="book-open-variant" size={18} color="#fff" />
              <Text style={styles.metaText}>{course.lessons} bài</Text>
            </View>
          </View>

          {/* Instructor */}
          <Text style={styles.instructorText}>Giảng viên: {course.instructor}</Text>
        </LinearGradient>

        {/* Course Content Section */}
        <View style={styles.contentSection}>
          <Text style={styles.contentTitle}>Nội dung khóa học</Text>
          <Text style={styles.contentSummary}>
            {totalModules} modules • {totalLessons} bài học
          </Text>

          {/* Modules List */}
          {course.modules.map((module) => {
            const isExpanded = expandedModules.has(module.id);
            return (
              <TouchableOpacity
                key={module.id}
                style={styles.moduleCard}
                onPress={() => toggleModule(module.id)}
                activeOpacity={0.7}
              >
                <View style={styles.moduleHeader}>
                  <View style={styles.moduleHeaderContent}>
                    <Text style={styles.moduleTitle}>{module.title}</Text>
                    <Text style={styles.moduleDescription}>{module.description}</Text>
                    <Text style={styles.moduleLessonCount}>
                      {module.lessons.length} bài học
                    </Text>
                  </View>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#4B5563"
                  />
                </View>

                {/* Lessons List (when expanded) */}
                {isExpanded && (
                  <View style={styles.lessonsList}>
                    {module.lessons.map((lesson, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.lessonItem}
                        onPress={() =>
                          navigation.navigate("Chi tiết bài học", {
                            courseId: course.id,
                            courseTitle: course.title,
                            allModules: course.modules,
                            currentModuleId: module.id,
                            currentLessonIndex: index,
                          })
                        }
                        activeOpacity={0.7}
                      >
                        <View style={styles.playIconContainer}>
                          <Ionicons name="play-circle" size={24} color="#6366F1" />
                        </View>
                        <View style={styles.lessonContent}>
                          <Text style={styles.lessonTitle}>{lesson.title}</Text>
                          <View style={styles.lessonDuration}>
                            <Ionicons name="time-outline" size={14} color="#6B7280" />
                            <Text style={styles.lessonDurationText}>{lesson.duration}</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bottom spacing for button */}
        <View style={{ height: 180 }} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.enrollButton} activeOpacity={0.8} onPress={handleEnroll}>
          <Text style={styles.enrollButtonText}>VÀO HỌC</Text>
        </TouchableOpacity>
      </View>

      <CaregiverBottomNav activeTab="profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroSection: {
    paddingTop: Platform.OS === "android" ? 20 : 40,
    paddingBottom: 32,
    paddingHorizontal: 16,
    position: "relative",
  },
  categoryTag: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  categoryText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
    lineHeight: 32,
  },
  heroDescription: {
    fontSize: 14,
    color: "#fff",
    lineHeight: 20,
    marginBottom: 20,
    opacity: 0.95,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingVertical: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  instructorText: {
    fontSize: 13,
    color: "#fff",
    opacity: 0.9,
  },
  contentSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  contentSummary: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
  },
  moduleCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
    overflow: "hidden",
  },
  moduleHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: 16,
  },
  moduleHeaderContent: {
    flex: 1,
    marginRight: 12,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  moduleDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 6,
    lineHeight: 20,
  },
  moduleLessonCount: {
    fontSize: 13,
    color: "#6B7280",
  },
  lessonsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  lessonItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  playIconContainer: {
    marginRight: 12,
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: 4,
  },
  lessonDuration: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  lessonDurationText: {
    fontSize: 12,
    color: "#6B7280",
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 90,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  enrollButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  enrollButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
