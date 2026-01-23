import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function IncomeDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const params = route.params as { year?: string; month?: string; monthData?: string } | undefined;
  const year = params?.year ? parseInt(params.year) : new Date().getFullYear();
  const month = params?.month ? parseInt(params.month) : new Date().getMonth() + 1;
  const monthDataParam = params?.monthData;

  // Parse month data
  let monthData: {
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
  } | null = null;

  if (monthDataParam) {
    try {
      monthData = JSON.parse(monthDataParam);
    } catch (e) {
      console.error('Error parsing monthData:', e);
    }
  }

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

  if (!monthData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết tháng {month}/{year}</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy dữ liệu</Text>
        </View>
        <CaregiverBottomNav activeTab="income" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết tháng {month}/{year}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Balance Card - Tổng thu nhập */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <MaterialCommunityIcons name="wallet" size={20} color="#F59E0B" />
            <Text style={styles.balanceLabel}>Tổng thu nhập</Text>
          </View>
          <Text style={styles.balanceAmount}>
            {formatCurrency(monthData.totalEarnings)}
          </Text>
          
          <View style={styles.balanceDetails}>
            <View style={styles.balanceDetailItem}>
              <View style={styles.balanceDetailIcon}>
                <MaterialCommunityIcons name="calendar-check" size={12} color="#3B82F6" />
              </View>
              <View>
                <Text style={styles.balanceDetailLabel}>Số booking</Text>
                <Text style={styles.balanceDetailValue}>
                  {monthData.totalBookings}
                </Text>
              </View>
            </View>
            
            <View style={styles.balanceDetailItem}>
              <View style={styles.balanceDetailIcon}>
                <MaterialCommunityIcons name="circle" size={12} color={getStatusColor(monthData.status)} />
              </View>
              <View>
                <Text style={styles.balanceDetailLabel}>Trạng thái</Text>
                <Text style={[styles.balanceDetailValue, { color: getStatusColor(monthData.status) }]}>
                  {getStatusText(monthData.status)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Chi tiết thu nhập Section */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={20} color="#1E293B" />
            <Text style={styles.historyTitle}>Chi tiết thu nhập</Text>
          </View>

          {!monthData.payoutDetails || monthData.payoutDetails.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="clipboard-text-off-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyStateText}>Chưa có thanh toán trong tháng này</Text>
            </View>
          ) : (
            monthData.payoutDetails.map((payout) => (
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
          )}
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
  header: {
    backgroundColor: '#5B9FD8',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FFFFFF',
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
    color: "#64748B",
    marginTop: 4,
    fontStyle: "italic",
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
});
