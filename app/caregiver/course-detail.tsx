import { useRoute } from "@react-navigation/native";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";

export default function CourseDetail() {
  const route = useRoute();
  const { id } = route.params as { id: string };

  // Giả lập data (bạn có thể fetch API sau này)
  const course = {
    id,
    title: "Chăm sóc người cao tuổi cơ bản",
    duration: "4 giờ",
    documents: 12,
    level: "Cơ bản",
    description:
      "Những kiến thức nền tảng về nhu cầu, dinh dưỡng, vận động và giao tiếp với người cao tuổi trong sinh hoạt hằng ngày.",
    learnings: [
      "Nắm vững nguyên tắc an toàn khi hỗ trợ sinh hoạt hằng ngày",
      "Nhận biết sớm dấu hiệu rủi ro và cách xử lý ban đầu",
      "Thực hành giao tiếp trấn an và tôn trọng người cao tuổi",
    ],
    instructor: {
      name: "BS. Nguyễn Minh Anh",
      title: "Chuyên gia Lão khoa",
      bio: "Chuyên gia với nhiều năm kinh nghiệm trong lĩnh vực lão khoa và chăm sóc người cao tuổi.",
    },
    contents: [
      {
        section: "Tổng quan & an toàn",
        lessons: [
          { title: "Giới thiệu vai trò caregiver", time: "10m" },
          { title: "Nguyên tắc an toàn tại nhà", time: "18m" },
        ],
      },
    ],
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Tiêu đề */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.backText}>← Quay lại danh sách</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{course.title}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>⏱ {course.duration}</Text>
          <Text style={styles.metaText}>📄 {course.documents} tài liệu</Text>
          <Text style={styles.metaText}>🎯 {course.level}</Text>
        </View>
        <Text style={styles.description}>{course.description}</Text>

        <TouchableOpacity style={styles.startButton}>
          <Text style={styles.startText}>Bắt đầu học</Text>
        </TouchableOpacity>
      </View>

      {/* Học được gì */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bạn sẽ học được</Text>
        {course.learnings.map((item, index) => (
          <View key={index} style={styles.learningItem}>
            <Icon name="check-square" color="#2ecc71" size={18} />
            <Text style={styles.learningText}>{item}</Text>
          </View>
        ))}
      </View>

      {/* Giảng viên */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Giảng viên</Text>
        <View style={styles.teacherCard}>
          <View style={styles.avatar}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>MA</Text>
          </View>
          <View>
            <Text style={styles.teacherName}>{course.instructor.name}</Text>
            <Text style={styles.teacherTitle}>{course.instructor.title}</Text>
            <Text style={styles.teacherBio}>{course.instructor.bio}</Text>
          </View>
        </View>
      </View>

      {/* Nội dung khóa học */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nội dung khóa học</Text>
        {course.contents.map((section, index) => (
          <View key={index} style={styles.lessonSection}>
            <Text style={styles.lessonSectionTitle}>{section.section}</Text>
            {section.lessons.map((lesson, i) => (
              <View key={i} style={styles.lessonItem}>
                <Icon name="play-circle" size={16} color="#1F6FEB" />
                <Text style={styles.lessonText}>
                  {lesson.title} — {lesson.time}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* Hỗ trợ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hỗ trợ</Text>
        <Text style={styles.supportText}>
          Gặp vấn đề khi học? Liên hệ hỗ trợ để được giúp đỡ kịp thời.
        </Text>
        <TouchableOpacity>
          <Text style={styles.supportLink}>Liên hệ hỗ trợ</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 },
  backText: { color: "#1F6FEB", marginBottom: 10 },
  header: { marginTop: 12, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  metaRow: { flexDirection: "row", gap: 12, marginBottom: 8 },
  metaText: { color: "#666", fontSize: 13 },
  description: { color: "#444", lineHeight: 20, marginBottom: 12 },
  startButton: {
    backgroundColor: "#1F6FEB",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  startText: { color: "#fff", fontWeight: "700" },

  section: {
    backgroundColor: "#fafafa",
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  learningItem: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  learningText: { marginLeft: 8, color: "#333" },

  teacherCard: { flexDirection: "row", gap: 12, alignItems: "center" },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#1F6FEB",
    alignItems: "center",
    justifyContent: "center",
  },
  teacherName: { fontWeight: "700" },
  teacherTitle: { color: "#555", fontSize: 13 },
  teacherBio: { color: "#666", fontSize: 12, marginTop: 4, width: "90%" },

  lessonSection: { marginBottom: 10 },
  lessonSectionTitle: {
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 6,
  },
  lessonItem: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  lessonText: { marginLeft: 8, color: "#444", fontSize: 13 },

  supportText: { color: "#444", fontSize: 13 },
  supportLink: { color: "#1F6FEB", marginTop: 4, fontWeight: "500" },
});
