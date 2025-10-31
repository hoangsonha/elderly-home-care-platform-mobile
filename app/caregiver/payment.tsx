import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

// Mock data for transactions
const transactionsData = [
  {
    id: "1",
    name: "Bà Nguyễn Thị Lan - Gói Cao Cấp",
    date: "25/10/2025",
    time: "8:00-12:00",
    amount: 1100000,
    status: "pending", // pending, completed, withdrawn, refunded
    statusText: "Chờ xử lí",
    icon: "timer-sand",
    iconColor: "#F59E0B",
    iconBg: "#FEF3C7",
    remaining: "18 giờ 30 phút",
  },
  {
    id: "2",
    name: "Ông Trần Văn Hùng - Gói Tiêu Chuẩn",
    date: "23/10/2025",
    time: "14:00-17:00",
    amount: 750000,
    status: "completed",
    statusText: "Đã vào ví",
    icon: "check-circle",
    iconColor: "#10B981",
    iconBg: "#D1FAE5",
  },
  {
    id: "3",
    name: "Bà Mai Thị Hương - Gói Cơ Bản",
    date: "24/10/2025",
    time: "8:00-12:00",
    amount: 400000,
    status: "pending",
    statusText: "Chờ xử lí",
    icon: "timer-sand",
    iconColor: "#F59E0B",
    iconBg: "#FEF3C7",
    remaining: "10 giờ 15 phút",
  },
  {
    id: "4",
    name: "Rút để trả lương nhân viên",
    date: "22/10/2025",
    time: "Công ty Elder Care",
    amount: -1500000,
    status: "withdrawn",
    statusText: "Đã rút",
    icon: "bank-transfer-out",
    iconColor: "#F59E0B",
    iconBg: "#FEF3C7",
  },
  {
    id: "5",
    name: "Bà Phạm Thị Lan - Gói Cao Cấp",
    date: "20/10/2025",
    time: "8:00-12:00",
    amount: 1100000,
    status: "completed",
    statusText: "Đã vào ví",
    icon: "check-circle",
    iconColor: "#10B981",
    iconBg: "#D1FAE5",
  },
  {
    id: "6",
    name: "Ông Lê Văn Sơn - Gói Tiêu Chuẩn",
    date: "25/10/2025",
    time: "14:00-17:00",
    amount: 750000,
    status: "pending",
    statusText: "Chờ xử lí",
    icon: "timer-sand",
    iconColor: "#F59E0B",
    iconBg: "#FEF3C7",
    remaining: "20 giờ 45 phút",
  },
  {
    id: "8",
    name: "Ông Nguyễn Văn Minh - Gói Cao Cấp",
    date: "21/10/2025",
    time: "8:00-12:00",
    amount: 1100000,
    status: "completed",
    statusText: "Đã vào ví",
    icon: "check-circle",
    iconColor: "#10B981",
    iconBg: "#D1FAE5",
  },
  {
    id: "7",
    name: "Hoàn tiền - Khiếu nại",
    date: "18/10/2025",
    time: "Ông Nguyễn Văn B - Gói Tiêu Chuẩn",
    amount: -750000,
    status: "refunded",
    statusText: "Hoàn tiền",
    icon: "close-circle",
    iconColor: "#EF4444",
    iconBg: "#FEE2E2",
  },
];

export default function PaymentScreen() {
  // Calculate totals
  // Completed: 750k + 1,100k + 1,100k = 2,950k
  // Rút: -1,500k, Hoàn tiền: -750k
  // Khả dụng = 2,950k - 1,500k - 750k = 700k
  // Pending: 1,100k + 400k + 750k = 2,250k
  const totalBalance = 2950000; // Tổng = Khả dụng + Pending
  const availableBalance = 700000; // Đã vào ví - Rút - Hoàn tiền
  const pendingBalance = 2250000; // Đang chờ xử lí

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(Math.abs(amount)) + 'đ';
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <MaterialCommunityIcons name="wallet" size={20} color="#F59E0B" />
            <Text style={styles.balanceLabel}>Tổng số dư</Text>
          </View>
          <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)}</Text>
          
          <View style={styles.balanceDetails}>
            <View style={styles.balanceDetailItem}>
              <View style={styles.balanceDetailIcon}>
                <MaterialCommunityIcons name="circle" size={12} color="#10B981" />
              </View>
              <View>
                <Text style={styles.balanceDetailLabel}>Khả dụng</Text>
                <Text style={styles.balanceDetailValue}>{formatCurrency(availableBalance)}</Text>
              </View>
            </View>
            
            <View style={styles.balanceDetailItem}>
              <View style={styles.balanceDetailIcon}>
                <MaterialCommunityIcons name="timer-sand" size={12} color="#F59E0B" />
              </View>
              <View>
                <Text style={styles.balanceDetailLabel}>Chờ xử lí</Text>
                <Text style={styles.balanceDetailValue}>{formatCurrency(pendingBalance)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Button - Only Withdraw */}
        {/* <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.withdrawButton}
            onPress={() => navigation.navigate("Rút tiền")}
          >
            <MaterialCommunityIcons name="cash-multiple" size={20} color="#FFFFFF" />
            <Text style={styles.withdrawButtonText}>Rút tiền</Text>
          </TouchableOpacity>
        </View> */}

        {/* Transaction History */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={20} color="#1E293B" />
            <Text style={styles.historyTitle}>Lịch sử giao dịch</Text>
          </View>

          {transactionsData.map((transaction) => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={[styles.transactionIcon, { backgroundColor: transaction.iconBg }]}>
                <MaterialCommunityIcons 
                  name={transaction.icon as any} 
                  size={24} 
                  color={transaction.iconColor} 
                />
              </View>

              <View style={styles.transactionInfo}>
                <Text style={styles.transactionName}>{transaction.name}</Text>
                <Text style={styles.transactionDateTime}>
                  {transaction.date} · {transaction.time}
                </Text>
                {transaction.remaining && (
                  <View style={styles.remainingBadge}>
                    <MaterialCommunityIcons name="clock-alert-outline" size={12} color="#DC2626" />
                    <Text style={styles.remainingText}>Còn {transaction.remaining}</Text>
                  </View>
                )}
              </View>

              <View style={styles.transactionRight}>
                <Text style={[
                  styles.transactionAmount,
                  transaction.amount > 0 ? styles.amountPositive : styles.amountNegative
                ]}>
                  {transaction.amount > 0 ? '+' : '-'}{formatCurrency(transaction.amount)}
                </Text>
                <Text style={[
                  styles.transactionStatus,
                  transaction.status === 'completed' && styles.statusCompleted,
                  transaction.status === 'pending' && styles.statusPending,
                  transaction.status === 'withdrawn' && styles.statusWithdrawn,
                  transaction.status === 'refunded' && styles.statusRefunded,
                ]}>
                  {transaction.statusText}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <CaregiverBottomNav activeTab="income" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#5B9FD8",
  },
  scrollView: {
    flex: 1,
  },
  balanceCard: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2196F3",
    marginBottom: 16,
  },
  balanceDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  balanceDetailItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  balanceDetailIcon: {
    width: 8,
    height: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  balanceDetailLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 2,
  },
  balanceDetailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  actionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  withdrawButton: {
    backgroundColor: "#5B9FD8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  withdrawButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  historySection: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 100,
    minHeight: 400,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  transactionDateTime: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
  },
  remainingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  remainingText: {
    fontSize: 11,
    color: "#DC2626",
    fontWeight: "500",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  amountPositive: {
    color: "#10B981",
  },
  amountNegative: {
    color: "#EF4444",
  },
  transactionStatus: {
    fontSize: 12,
    fontWeight: "500",
  },
  statusCompleted: {
    color: "#64748B",
  },
  statusPending: {
    color: "#F59E0B",
  },
  statusWithdrawn: {
    color: "#64748B",
  },
  statusRefunded: {
    color: "#64748B",
  },
});

