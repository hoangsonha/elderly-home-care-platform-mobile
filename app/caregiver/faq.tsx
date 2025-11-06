import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: "1",
    question: "Khi nào lương của lịch hẹn được cộng vào số dư của tôi?",
    answer: "Lương của bạn sẽ được cộng vào số dư sau 24 giờ kể từ khi lịch hẹn được hoàn thành. Hệ thống sẽ tự động xử lý thanh toán và bạn sẽ nhận được thông báo khi số dư được cập nhật.",
    category: "Thanh toán",
  },
  {
    id: "2",
    question: "Khi nào đơn khiếu nại của tôi được giải quyết?",
    answer: "Đơn khiếu nại của bạn sẽ được xem xét trong vòng 24-48 giờ làm việc. Bạn sẽ nhận được thông báo qua ứng dụng và email khi có kết quả. Trong một số trường hợp phức tạp, thời gian có thể kéo dài hơn, nhưng chúng tôi sẽ luôn cập nhật tiến trình cho bạn.",
    category: "Khiếu nại",
  },
  {
    id: "3",
    question: "Làm thế nào để hủy lịch hẹn?",
    answer: "Bạn có thể hủy lịch hẹn trong vòng 3 ngày trước ngày thực hiện. Vào trang chi tiết lịch hẹn và nhấn nút 'Hủy'. Lưu ý: Nếu hủy sau thời hạn này, bạn có thể bị ảnh hưởng đến đánh giá và uy tín của mình.",
    category: "Lịch hẹn",
  },
  {
    id: "4",
    question: "Tôi có thể bắt đầu nhiều lịch hẹn cùng lúc không?",
    answer: "Không, bạn chỉ có thể bắt đầu một lịch hẹn tại một thời điểm. Tuy nhiên, nếu các lịch hẹn có cùng người đặt (liên hệ khẩn cấp) và cùng địa chỉ, bạn có thể bắt đầu lịch hẹn mới mà không cần hoàn thành lịch hẹn hiện tại.",
    category: "Lịch hẹn",
  },
  {
    id: "5",
    question: "Làm sao để rút tiền từ số dư?",
    answer: "Bạn có thể rút tiền từ số dư vào trang 'Thanh toán' trong ứng dụng. Chọn phương thức rút tiền (chuyển khoản ngân hàng hoặc ví điện tử), nhập số tiền và xác nhận. Tiền sẽ được chuyển trong vòng 1-3 ngày làm việc.",
    category: "Thanh toán",
  },
  {
    id: "6",
    question: "Đánh giá của tôi có ảnh hưởng đến việc nhận lịch hẹn không?",
    answer: "Có, đánh giá từ người dùng là một trong những yếu tố quan trọng để hệ thống đề xuất lịch hẹn cho bạn. Đánh giá cao sẽ giúp bạn nhận được nhiều lịch hẹn hơn và có cơ hội nhận các gói dịch vụ cao cấp.",
    category: "Đánh giá",
  },
  {
    id: "7",
    question: "Tôi có thể từ chối lịch hẹn sau khi đã chấp nhận không?",
    answer: "Có, bạn có thể từ chối lịch hẹn trước khi bắt đầu thực hiện. Tuy nhiên, việc từ chối thường xuyên có thể ảnh hưởng đến đánh giá và uy tín của bạn. Nếu bạn đã bắt đầu lịch hẹn, bạn cần hoàn thành hoặc liên hệ với bộ phận hỗ trợ để được hỗ trợ.",
    category: "Lịch hẹn",
  },
  {
    id: "8",
    question: "Làm thế nào để cập nhật thông tin cá nhân?",
    answer: "Bạn có thể cập nhật thông tin cá nhân trong phần 'Cài đặt' hoặc 'Hồ sơ' của ứng dụng. Các thông tin như số điện thoại, địa chỉ, ngân hàng có thể được cập nhật bất cứ lúc nào.",
    category: "Tài khoản",
  },
  {
    id: "9",
    question: "Phí hoa hồng là bao nhiêu?",
    answer: "Phí hoa hồng được tính dựa trên gói dịch vụ: Gói Cơ bản (10%), Gói Chuyên nghiệp (12%), Gói Cao cấp (15%). Phí này đã được khấu trừ trước khi lương được cộng vào số dư của bạn.",
    category: "Thanh toán",
  },
  {
    id: "10",
    question: "Tôi có thể xem lại lịch sử lịch hẹn đã hoàn thành không?",
    answer: "Có, bạn có thể xem lại tất cả lịch hẹn đã hoàn thành trong tab 'Hoàn thành' ở trang 'Yêu cầu dịch vụ'. Tại đây, bạn có thể xem lại thông tin chi tiết, đánh giá, và khiếu nại (nếu có).",
    category: "Lịch hẹn",
  },
  {
    id: "11",
    question: "Làm sao để tôi biết được yêu cầu đặc biệt của người già?",
    answer: "Khi bạn nhận lịch hẹn, tất cả thông tin về yêu cầu đặc biệt, bệnh nền, thuốc, và dị ứng sẽ được hiển thị trong trang chi tiết lịch hẹn. Bạn nên đọc kỹ phần 'Lưu ý đặc biệt' trước khi bắt đầu công việc.",
    category: "Lịch hẹn",
  },
  {
    id: "12",
    question: "Tôi có thể liên hệ với gia đình người già trong quá trình thực hiện không?",
    answer: "Có, bạn có thể sử dụng tính năng 'Nhắn tin' trong trang chi tiết lịch hẹn để liên hệ với gia đình. Thông tin liên hệ khẩn cấp cũng được hiển thị trong phần thông tin người cao tuổi.",
    category: "Giao tiếp",
  },
  {
    id: "13",
    question: "Nếu tôi gặp sự cố khẩn cấp trong quá trình thực hiện, tôi nên làm gì?",
    answer: "Trong trường hợp khẩn cấp, bạn nên: 1) Gọi ngay số điện thoại liên hệ khẩn cấp của gia đình, 2) Gọi 115 nếu cần hỗ trợ y tế, 3) Ghi chú sự cố trong phần 'Ghi chú' của lịch hẹn, 4) Liên hệ với bộ phận hỗ trợ của chúng tôi ngay sau đó.",
    category: "Khẩn cấp",
  },
  {
    id: "14",
    question: "Tôi có thể đánh giá lại người dùng sau khi hoàn thành lịch hẹn không?",
    answer: "Hiện tại, chỉ có người dùng mới có thể đánh giá caregiver. Tuy nhiên, bạn có thể khiếu nại nếu gặp phải hành vi không phù hợp từ phía người dùng hoặc gia đình.",
    category: "Đánh giá",
  },
  {
    id: "15",
    question: "Làm sao để tăng xếp hạng và uy tín của tôi?",
    answer: "Để tăng xếp hạng và uy tín, bạn nên: hoàn thành tốt các nhiệm vụ, đến đúng giờ, giao tiếp tốt với gia đình, cập nhật ghi chú đầy đủ, và nhận được đánh giá tích cực từ người dùng. Hệ thống sẽ tự động tính toán và cập nhật xếp hạng của bạn.",
    category: "Uy tín",
  },
];

const categories = [
  "Tất cả",
  "Lịch hẹn",
  "Thanh toán",
  "Khiếu nại",
  "Đánh giá",
  "Tài khoản",
  "Giao tiếp",
  "Khẩn cấp",
  "Uy tín",
];

export default function FAQScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFAQs = faqData.filter((faq) => {
    const matchesCategory =
      selectedCategory === "Tất cả" || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm câu hỏi..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* FAQ List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredFAQs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="help-circle-outline"
              size={64}
              color="#D1D5DB"
            />
            <Text style={styles.emptyText}>
              Không tìm thấy câu hỏi nào
            </Text>
            <Text style={styles.emptySubtext}>
              Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác
            </Text>
          </View>
        ) : (
          filteredFAQs.map((faq) => (
            <View key={faq.id} style={styles.faqCard}>
              <TouchableOpacity
                style={styles.faqHeader}
                onPress={() => toggleItem(faq.id)}
                activeOpacity={0.7}
              >
                <View style={styles.faqQuestionContainer}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{faq.category}</Text>
                  </View>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                </View>
                <Ionicons
                  name={
                    expandedItems.includes(faq.id)
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={24}
                  color="#6B7280"
                />
              </TouchableOpacity>
              {expandedItems.includes(faq.id) && (
                <View style={styles.faqAnswerContainer}>
                  <View style={styles.answerLine} />
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))
        )}
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
    padding: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  categoryScroll: {
    maxHeight: 50,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: "#70C1F1",
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  categoryTextActive: {
    color: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  faqCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden",
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: 16,
  },
  faqQuestionContainer: {
    flex: 1,
    marginRight: 12,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2563EB",
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    lineHeight: 22,
  },
  faqAnswerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  answerLine: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 12,
  },
  faqAnswer: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    paddingHorizontal: 32,
  },
});

