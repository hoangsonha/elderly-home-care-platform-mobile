import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { mainService } from "@/services/main.service";

// Mock data for transactions
const transactionsData = [
  {
    id: "1",
    name: "Bà Nguyễn Thị Lan - Gói Cao Cấp",
    date: "20/11/2025",
    time: "8:00-12:00",
    amount: 1100000, // Tổng tiền booking
    actualAmount: 935000, // Tiền thực nhận (85% sau trừ phí)
    platformFee: 165000, // Phí nền tảng 15%
    status: "completed",
    statusText: "Đã vào ví",
    icon: "check-circle",
    iconColor: "#10B981",
    iconBg: "#D1FAE5",
    completedAt: "18/11/2025 12:00",
  },
  {
    id: "2",
    name: "Ông Trần Văn Hùng - Gói Tiêu Chuẩn",
    date: "19/11/2025",
    time: "14:00-17:00",
    amount: 750000,
    actualAmount: 637500,
    platformFee: 112500,
    status: "completed",
    statusText: "Đã vào ví",
    icon: "check-circle",
    iconColor: "#10B981",
    iconBg: "#D1FAE5",
    completedAt: "17/11/2025 17:00",
  },
  {
    id: "3",
    name: "Bà Mai Thị Hương - Gói Cơ Bản",
    date: "20/11/2025",
    time: "8:00-12:00",
    amount: 400000,
    actualAmount: 340000,
    platformFee: 60000,
    status: "pending",
    statusText: "Chờ 24h",
    icon: "timer-sand",
    iconColor: "#F59E0B",
    iconBg: "#FEF3C7",
    completedAt: "19/11/2025 12:00",
    remaining: "4 giờ 30 phút",
  },
  {
    id: "4",
    name: "Ông Lê Văn Sơn - Gói Tiêu Chuẩn",
    date: "18/11/2025",
    time: "14:00-17:00",
    amount: 750000,
    actualAmount: 637500,
    platformFee: 112500,
    status: "completed",
    statusText: "Đã vào ví",
    icon: "check-circle",
    iconColor: "#10B981",
    iconBg: "#D1FAE5",
    completedAt: "16/11/2025 17:00",
  },
  {
    id: "5",
    name: "Bà Phạm Thị Lan - Gói Cao Cấp",
    date: "17/11/2025",
    time: "8:00-12:00",
    amount: 1100000,
    actualAmount: 935000,
    platformFee: 165000,
    status: "completed",
    statusText: "Đã vào ví",
    icon: "check-circle",
    iconColor: "#10B981",
    iconBg: "#D1FAE5",
    completedAt: "15/11/2025 12:00",
  },
  {
    id: "6",
    name: "Hoàn tiền - Khiếu nại",
    date: "16/11/2025",
    time: "Ông Nguyễn Văn B - Gói Tiêu Chuẩn",
    amount: -750000,
    actualAmount: -637500,
    platformFee: 0,
    status: "refunded",
    statusText: "Hoàn tiền",
    icon: "close-circle",
    iconColor: "#EF4444",
    iconBg: "#FEE2E2",
  },
  {
    id: "7",
    name: "Ông Nguyễn Văn Minh - Gói Cao Cấp",
    date: "15/11/2025",
    time: "8:00-12:00",
    amount: 1100000,
    actualAmount: 935000,
    platformFee: 165000,
    status: "completed",
    statusText: "Đã vào ví",
    icon: "check-circle",
    iconColor: "#10B981",
    iconBg: "#D1FAE5",
    completedAt: "13/11/2025 12:00",
  },
  {
    id: "8",
    name: "Bà Võ Thị Kim - Gói Cơ Bản",
    date: "14/11/2025",
    time: "8:00-12:00",
    amount: 400000,
    actualAmount: 340000,
    platformFee: 60000,
    status: "completed",
    statusText: "Đã vào ví",
    icon: "check-circle",
    iconColor: "#10B981",
    iconBg: "#D1FAE5",
    completedAt: "12/11/2025 12:00",
  },
  {
    id: "9",
    name: "Ông Đặng Văn Tú - Gói Tiêu Chuẩn",
    date: "13/11/2025",
    time: "14:00-17:00",
    amount: 750000,
    actualAmount: 637500,
    platformFee: 112500,
    status: "completed",
    statusText: "Đã vào ví",
    icon: "check-circle",
    iconColor: "#10B981",
    iconBg: "#D1FAE5",
    completedAt: "11/11/2025 17:00",
  },
  {
    id: "10",
    name: "Bà Hoàng Thị Mai - Gói Cao Cấp",
    date: "12/11/2025",
    time: "8:00-12:00",
    amount: 1100000,
    actualAmount: 935000,
    platformFee: 165000,
    status: "completed",
    statusText: "Đã vào ví",
    icon: "check-circle",
    iconColor: "#10B981",
    iconBg: "#D1FAE5",
    completedAt: "10/11/2025 12:00",
  },
  {
    id: "11",
    name: "Ông Phan Văn Long - Gói Cơ Bản",
    date: "11/11/2025",
    time: "8:00-12:00",
    amount: 400000,
    actualAmount: 340000,
    platformFee: 60000,
    status: "completed",
    statusText: "Đã vào ví",
    icon: "check-circle",
    iconColor: "#10B981",
    iconBg: "#D1FAE5",
    completedAt: "09/11/2025 12:00",
  },
  {
    id: "12",
    name: "Bà Ngô Thị Hoa - Gói Tiêu Chuẩn",
    date: "10/11/2025",
    time: "14:00-17:00",
    amount: 750000,
    actualAmount: 637500,
    platformFee: 112500,
    status: "completed",
    statusText: "Đã vào ví",
    icon: "check-circle",
    iconColor: "#10B981",
    iconBg: "#D1FAE5",
    completedAt: "08/11/2025 17:00",
  },
  {
    id: "13",
    name: "Ông Lý Văn Dũng - Gói Cao Cấp",
    date: "09/11/2025",
    time: "8:00-12:00",
    amount: 1100000,
    actualAmount: 935000,
    platformFee: 165000,
    status: "completed",
    statusText: "Đã vào ví",
    icon: "check-circle",
    iconColor: "#10B981",
    iconBg: "#D1FAE5",
    completedAt: "07/11/2025 12:00",
  },
  {
    id: "14",
    name: "Bà Trương Thị Bích - Gói Cơ Bản",
    date: "08/11/2025",
    time: "8:00-12:00",
    amount: 400000,
    actualAmount: 340000,
    platformFee: 60000,
    status: "completed",
    statusText: "Đã vào ví",
    icon: "check-circle",
    iconColor: "#10B981",
    iconBg: "#D1FAE5",
    completedAt: "06/11/2025 12:00",
  },
  {
    id: "15",
    name: "Ông Vũ Văn Thành - Gói Tiêu Chuẩn",
    date: "07/11/2025",
    time: "14:00-17:00",
    amount: 750000,
    actualAmount: 637500,
    platformFee: 112500,
    status: "completed",
    statusText: "Đã vào ví",
    icon: "check-circle",
    iconColor: "#10B981",
    iconBg: "#D1FAE5",
    completedAt: "05/11/2025 17:00",
  },
  {
    id: "16",
    name: "Bà Đinh Thị Ngọc - Gói Cao Cấp",
    date: "06/11/2025",
    time: "8:00-12:00",
    amount: 1100000,
    actualAmount: 935000,
    platformFee: 165000,
    status: "completed",
    statusText: "Đã vào ví",
    icon: "check-circle",
    iconColor: "#10B981",
    iconBg: "#D1FAE5",
    completedAt: "04/11/2025 12:00",
  },
  {
    id: "17",
    name: "Hoàn tiền - Khiếu nại",
    date: "05/11/2025",
    time: "Bà Cao Thị Xuân - Gói Cơ Bản",
    amount: -400000,
    actualAmount: -340000,
    platformFee: 0,
    status: "refunded",
    statusText: "Hoàn tiền",
    icon: "close-circle",
    iconColor: "#EF4444",
    iconBg: "#FEE2E2",
  },
  {
    id: "18",
    name: "Ông Dương Văn Phú - Gói Tiêu Chuẩn",
    date: "04/11/2025",
    time: "14:00-17:00",
    amount: 750000,
    actualAmount: 637500,
    platformFee: 112500,
    status: "completed",
    statusText: "Đã vào ví",
    icon: "check-circle",
    iconColor: "#10B981",
    iconBg: "#D1FAE5",
    completedAt: "02/11/2025 17:00",
  },
  {
    id: "19",
    name: "Bà Lương Thị Yến - Gói Cao Cấp",
    date: "03/11/2025",
    time: "8:00-12:00",
    amount: 1100000,
    actualAmount: 935000,
    platformFee: 165000,
    status: "completed",
    statusText: "Đã vào ví",
    icon: "check-circle",
    iconColor: "#10B981",
    iconBg: "#D1FAE5",
    completedAt: "01/11/2025 12:00",
  },
  {
    id: "20",
    name: "Ông Bùi Văn Hải - Gói Cơ Bản",
    date: "02/11/2025",
    time: "8:00-12:00",
    amount: 400000,
    actualAmount: 340000,
    platformFee: 60000,
    status: "completed",
    statusText: "Đã vào ví",
    icon: "check-circle",
    iconColor: "#10B981",
    iconBg: "#D1FAE5",
    completedAt: "31/10/2025 12:00",
  },
];

export default function PaymentScreen() {
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<{
    year: number;
    month: number;
    totalEarnings: number;
    totalBookings: number;
    totalServiceAmount: number;
    status: string;
    batchCode: string;
    payoutBatchId: string;
    payoutDetails: Array<{
      payoutId: string;
      payoutCode: string;
      caregiverEarnings: number;
      totalAmount: number;
      systemRevenue: number;
      systemFeePercentage: number;
      serviceDate: string;
      status: string;
      includedAt: string;
      paidAt: string | null;
      careServiceId: string;
      bookingCode: string;
      workDate: string;
      payoutBatchId: string;
      batchCode: string;
    }>;
  } | null>(null);
  const [incomeData, setIncomeData] = useState<{
    totalEarnings: number;
    incomeByMonth: Array<{
      year: number;
      month: number;
      totalEarnings: number;
      totalBookings: number;
      totalServiceAmount: number;
      status: string;
      batchCode: string;
      payoutBatchId: string;
      payoutDetails: Array<{
        payoutId: string;
        payoutCode: string;
        caregiverEarnings: number;
        totalAmount: number;
        systemRevenue: number;
        systemFeePercentage: number;
        serviceDate: string;
        status: string;
        includedAt: string;
        paidAt: string | null;
        careServiceId: string;
        bookingCode: string;
        workDate: string;
        payoutBatchId: string;
        batchCode: string;
      }>;
    }>;
  } | null>(null);

  // Fetch income data from API
  useEffect(() => {
    const fetchIncome = async () => {
      try {
        setLoading(true);
        const response = await mainService.getCaregiverIncome();
        if (response.status === 'Success' && response.data) {
          setIncomeData(response.data);
        }
      } catch (error) {
        console.error('Error fetching income:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncome();
  }, []);

  // Get current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentYear = currentDate.getFullYear();

  // Parse date string "YYYY-MM-DD" to Date object
  const parseDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Format date from "YYYY-MM-DD" to "DD/MM/YYYY"
  const formatDate = (dateStr: string): string => {
    const date = parseDate(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Get current month income data
  const currentMonthIncome = useMemo(() => {
    if (!incomeData) return null;
    return incomeData.incomeByMonth.find(
      item => item.year === currentYear && item.month === currentMonth
    );
  }, [incomeData, currentMonth, currentYear]);



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(Math.abs(amount)) + 'đ';
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Đã thanh toán';
      case 'PENDING': return 'Chờ xử lý';
      case 'PROCESSING': return 'Đang xử lý';
      case 'FAILED': return 'Thất bại';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '#10B981';
      case 'PENDING': return '#F59E0B';
      case 'PROCESSING': return '#3B82F6';
      case 'FAILED': return '#EF4444';
      default: return '#64748B';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'check-circle';
      case 'PENDING': return 'timer-sand';
      case 'PROCESSING': return 'clock-outline';
      case 'FAILED': return 'close-circle';
      default: return 'help-circle';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5B9FD8" />
          <Text style={styles.loadingText}>Đang tải thông tin thu nhập...</Text>
        </View>
        <CaregiverBottomNav activeTab="income" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <MaterialCommunityIcons name="wallet" size={20} color="#F59E0B" />
            <Text style={styles.balanceLabel}>Tổng thu nhập</Text>
          </View>
          <Text style={styles.balanceAmount}>
            {incomeData ? formatCurrency(incomeData.totalEarnings) : formatCurrency(0)}
          </Text>
          
          {currentMonthIncome && (
            <View style={styles.balanceDetails}>
              <View style={styles.balanceDetailItem}>
                <View style={styles.balanceDetailIcon}>
                  <MaterialCommunityIcons name="circle" size={12} color="#10B981" />
                </View>
                <View>
                  <Text style={styles.balanceDetailLabel}>Tháng này</Text>
                  <Text style={styles.balanceDetailValue}>
                    {formatCurrency(currentMonthIncome.totalEarnings)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.balanceDetailItem}>
                <View style={styles.balanceDetailIcon}>
                  <MaterialCommunityIcons name="calendar" size={12} color="#3B82F6" />
                </View>
                <View>
                  <Text style={styles.balanceDetailLabel}>Số booking</Text>
                  <Text style={styles.balanceDetailValue}>
                    {currentMonthIncome.totalBookings}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Income by Month Section or Month Detail */}
        {incomeData && incomeData.incomeByMonth.length > 0 && (
          <View style={styles.historySection}>
            {selectedMonth ? (
              // Show month detail
              <>
                <View style={styles.historyHeader}>
                  <TouchableOpacity
                    onPress={() => setSelectedMonth(null)}
                    style={styles.backButtonInSection}
                  >
                    <MaterialCommunityIcons name="arrow-left" size={20} color="#1E293B" />
                  </TouchableOpacity>
                  <Text style={styles.historyTitle}>Chi tiết thu nhập</Text>
                  <View style={styles.placeholder} />
                </View>

                {/* Month Summary */}
                <View style={styles.monthCard}>
                  <View style={styles.monthHeader}>
                    <Text style={styles.monthTitle}>
                      Tháng {selectedMonth.month}/{selectedMonth.year}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedMonth.status) + '20' }]}>
                      <Text style={[styles.statusBadgeText, { color: getStatusColor(selectedMonth.status) }]}>
                        {getStatusText(selectedMonth.status)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.monthDetails}>
                    <View style={styles.monthDetailRow}>
                      <Text style={styles.monthDetailLabel}>Thu nhập:</Text>
                      <Text style={styles.monthDetailValue}>
                        {formatCurrency(selectedMonth.totalEarnings)}
                      </Text>
                    </View>
                    <View style={styles.monthDetailRow}>
                      <Text style={styles.monthDetailLabel}>Số booking:</Text>
                      <Text style={styles.monthDetailValue}>{selectedMonth.totalBookings}</Text>
                    </View>
                  </View>
                </View>

                {/* Payout Details */}
                {selectedMonth.payoutDetails && selectedMonth.payoutDetails.length > 0 ? (
                  selectedMonth.payoutDetails.map((payout) => (
                    <View key={payout.payoutId} style={styles.transactionCard}>
                      <View style={[styles.transactionIcon, { 
                        backgroundColor: getStatusColor(payout.status) + '20' 
                      }]}>
                        <MaterialCommunityIcons 
                          name={getStatusIcon(payout.status) as any} 
                          size={24} 
                          color={getStatusColor(payout.status)} 
                        />
                      </View>

                      <View style={styles.transactionInfo}>
                        <Text style={styles.transactionName}>
                          Booking: {payout.bookingCode}
                        </Text>
                        <Text style={styles.transactionDateTime}>
                          {formatDate(payout.serviceDate)} · {payout.workDate && formatDate(payout.workDate)}
                        </Text>
                        <View style={styles.amountBreakdown}>
                          <Text style={styles.amountBreakdownText}>
                            Tổng: {formatCurrency(payout.totalAmount)} · 
                            Phí hệ thống ({payout.systemFeePercentage}%): {formatCurrency(payout.systemRevenue)}
                          </Text>
                        </View>
                        {payout.paidAt && (
                          <Text style={styles.paidAtText}>
                            Đã thanh toán: {new Date(payout.paidAt).toLocaleString('vi-VN')}
                          </Text>
                        )}
                      </View>

                      <View style={styles.transactionRight}>
                        <Text style={[styles.transactionAmount, styles.amountPositive]}>
                          +{formatCurrency(payout.caregiverEarnings)}
                        </Text>
                        <Text style={[
                          styles.transactionStatus,
                          { color: getStatusColor(payout.status) }
                        ]}>
                          {getStatusText(payout.status)}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="clipboard-text-off-outline" size={48} color="#CBD5E1" />
                    <Text style={styles.emptyStateText}>Chưa có thanh toán trong tháng này</Text>
                  </View>
                )}
              </>
            ) : (
              // Show month list
              <>
                <View style={styles.historyHeader}>
                  <MaterialCommunityIcons name="calendar-month" size={20} color="#1E293B" />
                  <Text style={styles.historyTitle}>Thu nhập theo tháng</Text>
                </View>

                {incomeData.incomeByMonth.map((monthIncome, index) => (
                  <View key={index} style={styles.monthCard}>
                    <View style={styles.monthHeader}>
                      <Text style={styles.monthTitle}>
                        Tháng {monthIncome.month}/{monthIncome.year}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(monthIncome.status) + '20' }]}>
                        <Text style={[styles.statusBadgeText, { color: getStatusColor(monthIncome.status) }]}>
                          {getStatusText(monthIncome.status)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.monthDetails}>
                      <View style={styles.monthDetailRow}>
                        <Text style={styles.monthDetailLabel}>Thu nhập:</Text>
                        <Text style={styles.monthDetailValue}>
                          {formatCurrency(monthIncome.totalEarnings)}
                        </Text>
                      </View>
                      <View style={styles.monthDetailRow}>
                        <Text style={styles.monthDetailLabel}>Số booking:</Text>
                        <Text style={styles.monthDetailValue}>{monthIncome.totalBookings}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.viewDetailButton}
                      onPress={() => {
                        setSelectedMonth(monthIncome);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.viewDetailButtonText}>Xem chi tiết</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}
          </View>
        )}

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
  amountBreakdown: {
    marginTop: 4,
  },
  amountBreakdownText: {
    fontSize: 11,
    color: "#64748B",
    fontStyle: "italic",
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
    color: "#EF4444",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#5B9FD8',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#FFFFFF',
  },
  monthCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    position: 'relative',
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  monthDetails: {
    gap: 8,
  },
  monthDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthDetailLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  monthDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  viewDetailButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#5B9FD8',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDetailButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  backButtonInSection: {
    padding: 4,
    marginRight: 8,
  },
  placeholder: {
    width: 28,
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
  amountBreakdown: {
    marginTop: 4,
  },
  amountBreakdownText: {
    fontSize: 11,
    color: "#64748B",
    fontStyle: "italic",
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
  transactionStatus: {
    fontSize: 12,
    fontWeight: "500",
  },
  paidAtText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    fontStyle: 'italic',
  },
});

