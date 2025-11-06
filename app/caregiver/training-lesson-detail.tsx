import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { isLessonCompleted, markLessonCompleted, setCurrentLesson } from "@/data/trainingStore";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
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

export default function TrainingLessonDetail() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as {
    courseId?: string;
    courseTitle?: string;
    allModules?: Module[];
    currentModuleId?: string;
    currentLessonIndex?: number;
  } | undefined;

  // Get current lesson and all modules
  const allModules = params?.allModules || [];
  const currentModuleId = params?.currentModuleId || "1";
  const currentLessonIndex = params?.currentLessonIndex ?? 0;

  // Initialize completed state from store
  const [isCompleted, setIsCompleted] = useState(() => {
    if (params?.courseId && currentModuleId && currentLessonIndex !== undefined) {
      return isLessonCompleted(params.courseId, currentModuleId, currentLessonIndex);
    }
    return false;
  });

  // Set current lesson and sync completed status when component mounts or params change
  useEffect(() => {
    if (params?.courseId && currentModuleId && currentLessonIndex !== undefined) {
      setCurrentLesson(params.courseId, currentModuleId, currentLessonIndex);
      // Sync completed status from store
      const completed = isLessonCompleted(params.courseId, currentModuleId, currentLessonIndex);
      setIsCompleted(completed);
    }
  }, [params?.courseId, currentModuleId, currentLessonIndex]);

  // Sync completed status when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (params?.courseId && currentModuleId && currentLessonIndex !== undefined) {
        const completed = isLessonCompleted(params.courseId, currentModuleId, currentLessonIndex);
        setIsCompleted(completed);
      }
    }, [params?.courseId, currentModuleId, currentLessonIndex])
  );

  const currentModule = allModules.find((m) => m.id === currentModuleId);
  const currentLesson = currentModule?.lessons[currentLessonIndex];

  // Calculate next lesson
  const getNextLesson = () => {
    if (!currentModule || !currentLesson) return null;

    // Check if there's a next lesson in the same module
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      return {
        moduleId: currentModuleId,
        lessonIndex: currentLessonIndex + 1,
      };
    }

    // Find next module with lessons
    const currentModuleIndex = allModules.findIndex((m) => m.id === currentModuleId);
    for (let i = currentModuleIndex + 1; i < allModules.length; i++) {
      if (allModules[i].lessons.length > 0) {
        return {
          moduleId: allModules[i].id,
          lessonIndex: 0,
        };
      }
    }

    return null; // No next lesson
  };

  const nextLesson = getNextLesson();

  // Mock lesson content based on lesson title
  const getLessonContent = (lessonTitle: string) => {
    const contentMap: { [key: string]: any } = {
      "Vai trò và trách nhiệm của người chăm sóc": {
        content: "Bài học về vai trò quan trọng và các trách nhiệm cơ bản của người chăm sóc người cao tuổi.",
        learningObjectives: [
          "Hiểu rõ các khái niệm cơ bản",
          "Áp dụng kiến thức vào thực tế",
          "Phát triển kỹ năng chuyên nghiệp",
        ],
      },
      "Hiểu về quá trình lão hóa": {
        content: "Tìm hiểu về các thay đổi sinh lý và tâm lý trong quá trình lão hóa, giúp người chăm sóc hiểu rõ hơn về người cao tuổi.",
        learningObjectives: [
          "Nhận biết các thay đổi sinh lý",
          "Hiểu về thay đổi tâm lý",
          "Áp dụng kiến thức trong chăm sóc",
        ],
      },
      "Giao tiếp hiệu quả với người cao tuổi": {
        content: "Học các kỹ thuật giao tiếp hiệu quả, lắng nghe và thấu hiểu người cao tuổi.",
        learningObjectives: [
          "Kỹ năng lắng nghe tích cực",
          "Giao tiếp không lời",
          "Xây dựng mối quan hệ tin cậy",
        ],
      },
      "Nguyên tắc an toàn cơ bản": {
        content: "Nắm vững các nguyên tắc an toàn cơ bản khi chăm sóc người cao tuổi tại nhà.",
        learningObjectives: [
          "Phòng ngừa tai nạn",
          "Xử lý tình huống khẩn cấp",
          "Tạo môi trường an toàn",
        ],
      },
      "Vệ sinh cá nhân": {
        content: "Học các kỹ năng hỗ trợ người cao tuổi trong việc vệ sinh cá nhân một cách an toàn và tôn trọng.",
        learningObjectives: [
          "Kỹ thuật hỗ trợ tắm rửa",
          "Vệ sinh răng miệng",
          "Chăm sóc da",
        ],
      },
      "Phòng ngừa té ngã": {
        content: "Hiểu về các nguy cơ té ngã và cách phòng ngừa hiệu quả cho người cao tuổi.",
        learningObjectives: [
          "Nhận biết nguy cơ",
          "Cải thiện môi trường",
          "Tăng cường sức khỏe",
        ],
      },
      "Hỗ trợ ăn uống": {
        content: "Học cách hỗ trợ người cao tuổi trong việc ăn uống, đảm bảo dinh dưỡng và an toàn.",
        learningObjectives: [
          "Chuẩn bị bữa ăn phù hợp",
          "Kỹ thuật hỗ trợ ăn uống",
          "Xử lý khó nuốt",
        ],
      },
      "Hỗ trợ vận động": {
        content: "Tìm hiểu cách hỗ trợ người cao tuổi vận động an toàn và hiệu quả.",
        learningObjectives: [
          "Kỹ thuật hỗ trợ đi lại",
          "Bài tập phù hợp",
          "Sử dụng dụng cụ hỗ trợ",
        ],
      },
      "Chăm sóc giấc ngủ": {
        content: "Học cách giúp người cao tuổi có giấc ngủ chất lượng và đủ thời gian.",
        learningObjectives: [
          "Tạo môi trường ngủ tốt",
          "Thói quen ngủ lành mạnh",
          "Xử lý rối loạn giấc ngủ",
        ],
      },
    };

    return (
      contentMap[lessonTitle] || {
        content: "Nội dung bài học về chăm sóc người cao tuổi.",
        learningObjectives: [
          "Hiểu rõ các khái niệm cơ bản",
          "Áp dụng kiến thức vào thực tế",
          "Phát triển kỹ năng chuyên nghiệp",
        ],
      }
    );
  };

  const lessonContent = currentLesson
    ? getLessonContent(currentLesson.title)
    : {
        content: "Nội dung bài học về chăm sóc người cao tuổi.",
        learningObjectives: [
          "Hiểu rõ các khái niệm cơ bản",
          "Áp dụng kiến thức vào thực tế",
          "Phát triển kỹ năng chuyên nghiệp",
        ],
      };

  const lesson = {
    courseTitle: params?.courseTitle || "Chăm Sóc Cơ Bản Người Cao Tuổi",
    moduleTitle: currentModule?.title || "Module 1: Giới Thiệu Về Chăm Sóc Người Cao Tuổi",
    title: currentLesson?.title || "Vai trò và trách nhiệm của người chăm sóc",
    duration: currentLesson?.duration || "15 phút",
    content: lessonContent.content,
    learningObjectives: lessonContent.learningObjectives,
    referenceMaterials:
      "Các tài liệu bổ sung sẽ được cung cấp trong phần tải xuống.",
  };

  const handleMarkComplete = () => {
    setIsCompleted(true);
    
    // Mark lesson as completed in store
    if (params?.courseId && currentModuleId && currentLessonIndex !== undefined) {
      markLessonCompleted(params.courseId, currentModuleId, currentLessonIndex);
    }
    
    // TODO: Call API to mark lesson as completed
  };

  const handleNextLesson = () => {
    // Check completion status directly from store to ensure accuracy
    const isLessonCompletedInStore = params?.courseId && currentModuleId !== undefined && currentLessonIndex !== undefined
      ? isLessonCompleted(params.courseId, currentModuleId, currentLessonIndex)
      : false;

    // Allow navigation if either state or store indicates completion
    if (!isLessonCompletedInStore && !isCompleted) {
      Alert.alert(
        "Hoàn thành bài học",
        "Vui lòng nhấn 'Đánh dấu hoàn thành' trước khi sang bài tiếp theo."
      );
      return;
    }
    
    if (!nextLesson) {
      // No next lesson, go back to course detail
      navigation.navigate("Chi tiết khóa học", { id: params?.courseId || "1" });
      return;
    }

    const nextModule = allModules.find((m) => m.id === nextLesson.moduleId);
    const nextLessonData = nextModule?.lessons[nextLesson.lessonIndex];

    if (nextLessonData) {
      // Use navigate instead of replace to ensure navigation works
      navigation.navigate("Chi tiết bài học", {
        courseId: params?.courseId,
        courseTitle: params?.courseTitle,
        allModules: allModules,
        currentModuleId: nextLesson.moduleId,
        currentLessonIndex: nextLesson.lessonIndex,
      });
    } else {
      Alert.alert("Lỗi", "Không tìm thấy bài học tiếp theo.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Lesson Info Card */}
        <View style={styles.lessonInfoCard}>
          <Text style={styles.moduleTitle}>{lesson.moduleTitle}</Text>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <Text style={styles.lessonDuration}>{lesson.duration}</Text>
        </View>

        {/* Video Player Section */}
        <View style={styles.videoPlayerContainer}>
          <TouchableOpacity style={styles.playButtonContainer} activeOpacity={0.8}>
            <View style={styles.playButton}>
              <Ionicons name="play" size={32} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.videoLabel}>Video bài giảng</Text>
        </View>

        {/* Content Section */}
        <View style={styles.contentCard}>
          {/* Nội dung bài học */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nội dung bài học</Text>
            <Text style={styles.sectionText}>{lesson.content}</Text>
          </View>

          {/* Mục tiêu học tập */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mục tiêu học tập</Text>
            {lesson.learningObjectives.map((objective: string, index: number) => (
              <View key={index} style={styles.objectiveItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.objectiveText}>{objective}</Text>
              </View>
            ))}
          </View>

          {/* Tài liệu tham khảo */}
          {/* <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tài liệu tham khảo</Text>
            <Text style={styles.sectionText}>{lesson.referenceMaterials}</Text>
          </View> */}

          {/* Đánh dấu hoàn thành Button */}
          <TouchableOpacity
            style={[
              styles.completeButton,
              isCompleted && styles.completeButtonCompleted,
            ]}
            onPress={handleMarkComplete}
            activeOpacity={0.8}
            disabled={isCompleted}
          >
            <Ionicons
              name={isCompleted ? "checkmark-circle" : "checkmark-circle-outline"}
              size={20}
              color="#fff"
            />
            <Text style={styles.completeButtonText}>
              {isCompleted ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Next Lesson Button - Outside content card */}
        {nextLesson && (() => {
          // Check completion status directly from store
          const isLessonCompletedInStore = params?.courseId && currentModuleId !== undefined && currentLessonIndex !== undefined
            ? isLessonCompleted(params.courseId, currentModuleId, currentLessonIndex)
            : false;
          const isButtonEnabled = isCompleted || isLessonCompletedInStore;
          
          return (
            <View style={styles.nextButtonWrapper}>
              <TouchableOpacity
                style={[styles.nextButton, !isButtonEnabled && styles.nextButtonDisabled]}
                onPress={handleNextLesson}
                activeOpacity={0.8}
                disabled={!isButtonEnabled}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={[styles.nextButtonText, !isButtonEnabled && styles.nextButtonTextDisabled]}>Bài tiếp theo</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          );
        })()}

        {/* Bottom spacing for bottom nav */}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  lessonInfoCard: {
    backgroundColor: "#F3F4F6",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
  },
  moduleTitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 8,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  lessonDuration: {
    fontSize: 14,
    color: "#6B7280",
  },
  videoPlayerContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  playButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  videoLabel: {
    marginTop: 16,
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "500",
  },
  contentCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 22,
  },
  objectiveItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#8B5CF6",
    marginTop: 7,
    marginRight: 12,
  },
  objectiveText: {
    flex: 1,
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 22,
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#8B5CF6",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  completeButtonCompleted: {
    backgroundColor: "#10B981",
  },
  completeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  nextButtonWrapper: {
    alignItems: "flex-end",
    marginTop: 16,
    paddingHorizontal: 16,
    width: "100%",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  nextButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  nextButtonTextDisabled: {
    color: "#F9FAFB",
  },
});

