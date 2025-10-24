import React, { useState } from "react";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Checkbox } from "react-native-paper";

const transactionsReceived = [
  {
    id: "#TX1008",
    type: "Thanh toán lịch hẹn",
    booking: "BK003",
    time: "2025-09-16 13:30",
    amount: 480000,
  },
  {
    id: "#TX1007",
    type: "Thanh toán lịch hẹn",
    booking: "BK002",
    time: "2025-09-15 17:45",
    amount: 330000,
  },
  {
    id: "#TX1006",
    type: "Rút tiền",
    booking: "—",
    time: "2025-09-10 09:10",
    amount: -500000,
  },
];

const transactionsUpcoming = [
  {
    id: "#TX1012",
    type: "Thanh toán dự kiến",
    booking: "BK007",
    time: "2025-09-22 18:00",
    amount: 360000,
  },
  {
    id: "#TX1013",
    type: "Thanh toán dự kiến",
    booking: "BK008",
    time: "2025-09-23 14:30",
    amount: 440000,
  },
];

export default function PaymentScreen() {
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [note, setNote] = useState("");
  const [checked, setChecked] = useState(false);

  return (
    <ScrollView style={styles.container}>
      {/* Info Section */}
      <View style={styles.infoSection}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Số dư khả dụng</Text>
          <Text style={styles.infoValue}>2.400.000 ₫</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Đã rút trong tháng</Text>
          <Text style={styles.infoValue}>500.000 ₫</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Lần rút gần nhất</Text>
          <Text style={styles.infoValue}>2025-09-10</Text>
        </View>
      </View>

      {/* Withdraw Form */}
      <View style={styles.formSection}>
        <TextInput
          style={styles.input}
          placeholder="Nhập số tiền (tối thiểu 100,000đ)"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <TextInput
          style={styles.input}
          placeholder="Ngân hàng (VD: Vietcombank, ACB...)"
          value={bank}
          onChangeText={setBank}
        />
        <TextInput
          style={styles.input}
          placeholder="Số tài khoản"
          keyboardType="numeric"
          value={accountNumber}
          onChangeText={setAccountNumber}
        />
        <TextInput
          style={styles.input}
          placeholder="Chủ tài khoản"
          value={accountName}
          onChangeText={setAccountName}
        />
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Ghi chú (tùy chọn)"
          multiline
          value={note}
          onChangeText={setNote}
        />
        <View style={styles.checkboxContainer}>
          <Checkbox
            status={checked ? "checked" : "unchecked"}
            onPress={() => setChecked(!checked)}
          />
          <Text>Tôi xác nhận các thông tin là chính xác</Text>
        </View>
        <TouchableOpacity
          style={[styles.button, !checked && { backgroundColor: "#ccc" }]}
          disabled={!checked}
        >
          <Text style={styles.buttonText}>Gửi yêu cầu rút tiền</Text>
        </TouchableOpacity>
      </View>

      {/* Transactions Received */}
      <View style={styles.transactionSection}>
        <Text style={styles.sectionTitle}>Giao dịch đã nhận</Text>
        {transactionsReceived.map((tx) => (
          <View key={tx.id} style={styles.transactionRow}>
            <Text style={styles.txId}>{tx.id}</Text>
            <Text>{tx.type}</Text>
            <Text>{tx.time}</Text>
            <Text style={{ color: tx.amount < 0 ? "red" : "green" }}>
              {tx.amount.toLocaleString()} ₫
            </Text>
          </View>
        ))}
      </View>

      {/* Transactions Upcoming */}
      <View style={styles.transactionSection}>
        <Text style={styles.sectionTitle}>Giao dịch sắp nhận</Text>
        {transactionsUpcoming.map((tx) => (
          <View key={tx.id} style={styles.transactionRow}>
            <Text style={styles.txId}>{tx.id}</Text>
            <Text>{tx.type}</Text>
            <Text>{tx.time}</Text>
            <Text style={{ color: "green" }}>
              {tx.amount.toLocaleString()} ₫
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    paddingVertical: 48,
  },
  infoSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  infoBox: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    alignItems: "center",
  },
  infoLabel: { fontSize: 12, color: "#888", marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: "bold", color: "#333" },
  formSection: { marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#0a74da",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  transactionSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  txId: { fontWeight: "bold" },
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
import { Checkbox } from "react-native-paper";
const transactionsReceived = [
  {
    id: "#TX1008",
    type: "Thanh toán lịch hẹn",
    booking: "BK003",
    time: "2025-09-16 13:30",
    amount: 480000,
  },
  {
    id: "#TX1007",
    type: "Thanh toán lịch hẹn",
    booking: "BK002",
    time: "2025-09-15 17:45",
    amount: 330000,
  },
  {
    id: "#TX1006",
    type: "Rút tiền",
    booking: "—",
    time: "2025-09-10 09:10",
    amount: -500000,
  },
const transactionsUpcoming = [
  {
    id: "#TX1012",
    type: "Thanh toán dự kiến",
    booking: "BK007",
    time: "2025-09-22 18:00",
    amount: 360000,
  },
  {
    id: "#TX1013",
    type: "Thanh toán dự kiến",
    booking: "BK008",
    time: "2025-09-23 14:30",
    amount: 440000,
  },
];
export default function PaymentScreen() {
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [note, setNote] = useState("");
  const [checked, setChecked] = useState(false);
    <ScrollView style={styles.container}>
      {/* Info Section */}
      <View style={styles.infoSection}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Số dư khả dụng</Text>
          <Text style={styles.infoValue}>2.400.000 ₫</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Đã rút trong tháng</Text>
          <Text style={styles.infoValue}>500.000 ₫</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Lần rút gần nhất</Text>
          <Text style={styles.infoValue}>2025-09-10</Text>
        </View>
      </View>
      {/* Withdraw Form */}
      <View style={styles.formSection}>
        <TextInput
          style={styles.input}
          placeholder="Nhập số tiền (tối thiểu 100,000đ)"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <TextInput
          style={styles.input}
          placeholder="Ngân hàng (VD: Vietcombank, ACB...)"
          value={bank}
          onChangeText={setBank}
        />
        <TextInput
          style={styles.input}
          placeholder="Số tài khoản"
          keyboardType="numeric"
          value={accountNumber}
          onChangeText={setAccountNumber}
        />
        <TextInput
          style={styles.input}
          placeholder="Chủ tài khoản"
          value={accountName}
          onChangeText={setAccountName}
        />
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Ghi chú (tùy chọn)"
          multiline
          value={note}
          onChangeText={setNote}
        />
        <View style={styles.checkboxContainer}>
          <Checkbox
            status={checked ? "checked" : "unchecked"}
            onPress={() => setChecked(!checked)}
          />
          <Text>Tôi xác nhận các thông tin là chính xác</Text>
        <TouchableOpacity
          style={[styles.button, !checked && { backgroundColor: "#ccc" }]}
          disabled={!checked}
        >
          <Text style={styles.buttonText}>Gửi yêu cầu rút tiền</Text>
        </TouchableOpacity>
      </View>
      {/* Transactions Received */}
      <View style={styles.transactionSection}>
        <Text style={styles.sectionTitle}>Giao dịch đã nhận</Text>
        {transactionsReceived.map((tx) => (
          <View key={tx.id} style={styles.transactionRow}>
            <Text style={styles.txId}>{tx.id}</Text>
            <Text>{tx.type}</Text>
            <Text>{tx.time}</Text>
            <Text style={{ color: tx.amount < 0 ? "red" : "green" }}>
              {tx.amount.toLocaleString()} ₫
      </View>
      {/* Transactions Upcoming */}
      <View style={styles.transactionSection}>
        <Text style={styles.sectionTitle}>Giao dịch sắp nhận</Text>
        {transactionsUpcoming.map((tx) => (
          <View key={tx.id} style={styles.transactionRow}>
            <Text style={styles.txId}>{tx.id}</Text>
            <Text>{tx.type}</Text>
            <Text>{tx.time}</Text>
            <Text style={{ color: "green" }}>
              {tx.amount.toLocaleString()} ₫
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 48,
  infoSection: {
    marginBottom: 16,
  },
  infoBox: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  infoLabel: { fontSize: 12, color: "#888", marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: "bold", color: "#333" },
  formSection: { marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#0a74da",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  transactionSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  txId: { fontWeight: "bold" },
});
