import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const dummyPayments = [
  { id: 1, service: "Chăm sóc người già - 1 giờ", amount: 150000 },
  { id: 2, service: "Tư vấn sức khỏe - 30 phút", amount: 80000 },
  { id: 3, service: "Hỗ trợ ăn uống - 1 ngày", amount: 120000 },
];

export default function PaymentsScreen() {
  const total = dummyPayments.reduce((sum, p) => sum + p.amount, 0);

  const handlePay = () => {
    Alert.alert("Thanh toán", "Chức năng thanh toán đang phát triển 🚧");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F9FC", paddingBottom: 100 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <Text style={styles.title}>Thanh toán</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tổng tiền:</Text>
          <Text style={styles.amount}>{total.toLocaleString("vi-VN")} ₫</Text>
        </View>

        <Text style={styles.sectionTitle}>Danh sách dịch vụ:</Text>
        {dummyPayments.map((p) => (
          <View key={p.id} style={styles.paymentItem}>
            <Text style={styles.paymentService}>{p.service}</Text>
            <Text style={styles.paymentAmount}>
              {p.amount.toLocaleString("vi-VN")} ₫
            </Text>
          </View>
        ))}

        <TouchableOpacity style={styles.payButton} onPress={handlePay}>
          <Text style={styles.payButtonText}>Thanh toán</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "700", marginBottom: 16, color: "#222" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#4ECDC4",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  amount: { color: "#fff", fontSize: 24, fontWeight: "700", marginTop: 8 },
  paymentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  paymentService: { fontSize: 16 },
  paymentAmount: { fontSize: 16, fontWeight: "600" },
  payButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 24,
    alignItems: "center",
  },
  payButtonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
