import React from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
const { width } = Dimensions.get("window");
const CARD_MARGIN = 12;
const CARD_WIDTH = Math.min(420, width - CARD_MARGIN * 2);

const data = [
  {
    id: "1",
    title: "Chăm sóc người cao tuổi cơ bản",
    desc: "Những kiến thức nền tảng về nhu cầu, dinh dưỡng, vận động và giao tiếp với người cao tuổi trong sinh hoạt hằng ngày.",
    docs: 12,
    duration: "4 giờ",
  },
  {
    id: "2",
    title: "Hỗ trợ di chuyển & an toàn",
    desc: "Kỹ thuật nâng đỡ, phòng ngừa té ngã, sử dụng dụng cụ hỗ trợ đúng cách nhằm đảm bảo an toàn cho người thân.",
    docs: 8,
    duration: "2.5 giờ",
  },
  {
    id: "3",
    title: "Chăm sóc người sa sút trí tuệ",
    desc: "Phương pháp tương tác, trấn an, thiết lập môi trường sống phù hợp và xử lý tình huống thường gặp với người sa sút trí tuệ.",
    docs: 15,
    duration: "5 giờ",
  },
  {
    id: "4",
    title: "Sơ cứu cơ bản",
    desc: "Nhận biết dấu hiệu nguy cấp, quy trình sơ cứu ban đầu và thời điểm cần liên hệ cơ sở y tế để hỗ trợ kịp thời.",
    docs: 10,
    duration: "3 giờ",
  },
];

export default function TrainingCoursesMobile({ navigation }: any) {
  const renderCard = ({ item }: { item: (typeof data)[0] }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={3} ellipsizeMode="tail">
          {item.desc}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Icon name="folder" size={14} />
            <Text style={styles.metaText}>{` ${item.docs} tài liệu`}</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="clock" size={14} />
            <Text style={styles.metaText}>{` ${item.duration}`}</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.button}
          onPress={() =>
            navigation.navigate("Chi tiết khóa học", { id: item.id })
          }
        >
          <Text style={styles.buttonText}>Xem chi tiết</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>
          Tham khảo các khóa học chuyên môn để nâng cao kỹ năng chăm sóc người
          cao tuổi.
        </Text>
      </View>

      <FlatList
        data={data}
        renderItem={renderCard}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 18 : 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
  },
  list: {
    paddingHorizontal: 12,
    paddingBottom: 40,
  },
  card: {
    width: CARD_WIDTH,
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginVertical: 10,
    // Shadow - iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    // Elevation - Android
    elevation: 3,
    overflow: "hidden",
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 13,
    color: "#444",
    lineHeight: 18,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: "#444",
  },
  button: {
    backgroundColor: "#1F6FEB",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
