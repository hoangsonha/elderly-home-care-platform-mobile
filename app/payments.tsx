import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";

interface Service {
  id: string;
  name: string;
  caregiverName: string;
  caregiverAvatar: string;
  elderlyName: string;
  familyName: string;
  startDate: string;
  endDate?: string;
  status: "completed" | "cancelled";
}

interface Payment {
  id: string;
  serviceId: string;
  type: "salary";
  amount: number;
  currency: string;
  date?: string;
  dueDate?: string;
  status: "completed" | "cancelled";
  method: "bank_transfer" | "credit_card" | "wallet";
  description: string;
  transactionId?: string;
  elderlyName?: string;
  familyName?: string;
  caregiverName?: string;
  caregiverAvatar?: string;
}

interface WalletInfo {
  balance: number;
  currency: string;
  lastUpdated: string;
}

const mockServices: Service[] = [
  {
    id: "1",
    name: "Thuê Người chăm sóc",
    caregiverName: "Nguyễn Thị Lan",
    caregiverAvatar: "https://via.placeholder.com/50",
    elderlyName: "Ông Nguyễn Văn A",
    familyName: "Gia đình A",
    startDate: "01/12/2024",
    status: "completed",
  },
  {
    id: "2",
    name: "Thuê Người chăm sóc",
    caregiverName: "Trần Văn Nam",
    caregiverAvatar: "https://via.placeholder.com/50",
    elderlyName: "Bà Lê Thị B",
    familyName: "Gia đình B",
    startDate: "15/11/2024",
    endDate: "30/11/2024",
    status: "completed",
  },
  {
    id: "3",
    name: "Thuê Người chăm sóc",
    caregiverName: "Phạm Thị Hoa",
    caregiverAvatar: "https://via.placeholder.com/50",
    elderlyName: "Ông Trần Văn C",
    familyName: "Gia đình C",
    startDate: "01/10/2024",
    status: "cancelled",
  },
];

const mockPayments: Payment[] = [
  // Service 1 - Hoàn thành
  {
    id: "1",
    serviceId: "1",
    type: "salary",
    amount: 2400000,
    currency: "VND",
    date: "20/12/2024",
    status: "completed",
    method: "bank_transfer",
    description: "Lương ngày 20/12/2024",
    transactionId: "TXN123456789",
    elderlyName: "Ông Nguyễn Văn A",
    familyName: "Gia đình A",
    caregiverName: "Nguyễn Thị Lan",
    caregiverAvatar: "https://via.placeholder.com/50",
  },
  // Service 2 - Hoàn thành
  {
    id: "5",
    serviceId: "2",
    type: "salary",
    amount: 1800000,
    currency: "VND",
    date: "30/11/2024",
    status: "completed",
    method: "credit_card",
    description: "Lương ngày 30/11/2024",
    transactionId: "TXN123456791",
    elderlyName: "Bà Lê Thị B",
    familyName: "Gia đình B",
    caregiverName: "Trần Văn Nam",
    caregiverAvatar: "https://via.placeholder.com/50",
  },
  // Service 3 - Đã hủy
  {
    id: "9",
    serviceId: "3",
    type: "salary",
    amount: 2000000,
    currency: "VND",
    dueDate: "15/01/2025",
    status: "cancelled",
    method: "wallet",
    description: "Lương ngày 15/10/2024",
    elderlyName: "Ông Trần Văn C",
    familyName: "Gia đình C",
    caregiverName: "Phạm Thị Hoa",
    caregiverAvatar: "https://via.placeholder.com/50",
  },
];

const mockWalletInfo: WalletInfo = {
  balance: 8800000, // 15,000,000 - 2,400,000 - 1,800,000 - 2,000,000 = 8,800,000
  currency: "VND",
  lastUpdated: "23/10/2024 15:30",
};

export default function PaymentsScreen() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const handleServicePress = (service: Service) => {
    setSelectedService(service);
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case "bank_transfer":
        return "Chuyển khoản";
      case "credit_card":
        return "Thẻ tín dụng";
      case "wallet":
        return "Ví điện tử";
      default:
        return "Không xác định";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#27AE60";
      case "cancelled":
        return "#E74C3C";
      default:
        return "#95A5A6";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Đã thanh toán";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  const renderService = ({ item }: { item: Service }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => handleServicePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.serviceCardHeader}>
        <Image
          source={{ uri: item.caregiverAvatar }}
          style={styles.serviceCardAvatar}
        />
        <View style={styles.serviceInfo}>
          <ThemedText style={styles.serviceName}>{item.name}</ThemedText>
          <ThemedText style={styles.serviceDescription}>
            Dịch vụ chăm sóc người cao tuổi
          </ThemedText>
        </View>
        <View style={styles.serviceArrow}>
          <Ionicons name="chevron-forward" size={20} color="#6C757D" />
        </View>
      </View>

      <View style={styles.serviceCardBody}>
        <View style={styles.serviceDetailRow}>
          <View style={styles.serviceDetailItem}>
            <Ionicons name="person-circle" size={16} color="#3498DB" />
            <ThemedText style={styles.serviceDetailLabel}>
              Người chăm sóc:
            </ThemedText>
            <ThemedText style={styles.serviceDetailText}>
              {item.caregiverName}
            </ThemedText>
          </View>
        </View>
        <View style={styles.serviceDetailRow}>
          <View style={styles.serviceDetailItem}>
            <Ionicons name="heart" size={16} color="#E74C3C" />
            <ThemedText style={styles.serviceDetailLabel}>
              Người già:
            </ThemedText>
            <ThemedText style={styles.serviceDetailText}>
              {item.elderlyName}
            </ThemedText>
          </View>
        </View>
        <View style={styles.serviceStatusRow}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <ThemedText style={styles.paymentStatusText}>
              {getStatusText(item.status)}
            </ThemedText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPayment = ({ item }: { item: Payment }) => (
    <TouchableOpacity
      style={styles.paymentCard}
      onPress={() => {}}
      activeOpacity={0.7}
    >
      <View style={styles.paymentHeader}>
        <View style={styles.paymentAvatarContainer}>
          <Image
            source={{ uri: "https://via.placeholder.com/40" }}
            style={styles.paymentAvatar}
          />
          <View style={styles.paymentInfo}>
            <ThemedText style={styles.paymentType}>Lương</ThemedText>
            <ThemedText style={styles.paymentDescription}>
              {item.description}
            </ThemedText>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <ThemedText style={styles.paymentStatusText}>
            {getStatusText(item.status)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.paymentDetails}>
        <View style={styles.amountRow}>
          <ThemedText style={styles.amountLabel}>Số tiền:</ThemedText>
          <ThemedText style={styles.amountValue}>
            {item.amount.toLocaleString("vi-VN")} {item.currency}
          </ThemedText>
        </View>
        <View style={styles.dateRow}>
          <ThemedText style={styles.dateLabel}>
            {item.date ? "Ngày thanh toán:" : "Hạn thanh toán:"}
          </ThemedText>
          <ThemedText style={styles.dateValue}>
            {item.date || item.dueDate}
          </ThemedText>
        </View>
        <View style={styles.methodRow}>
          <ThemedText style={styles.methodLabel}>Phương thức:</ThemedText>
          <ThemedText style={styles.methodValue}>
            {getPaymentMethodText(item.method)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.descriptionContainer}>
        <ThemedText style={styles.descriptionText}>
          {item.description}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <ThemedText style={styles.headerTitle}>Thanh toán</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Quản lý thanh toán dịch vụ
          </ThemedText>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {selectedService ? (
          <View style={styles.serviceDetailContainer}>
            {/* Service Info */}
            <View style={styles.selectedServiceCard}>
              <View style={styles.serviceHeader}>
                <Image
                  source={{ uri: selectedService.caregiverAvatar }}
                  style={styles.avatar}
                />
                <View style={styles.serviceInfo}>
                  <ThemedText style={styles.serviceName}>
                    {selectedService.name || "N/A"}
                  </ThemedText>
                  <ThemedText style={styles.caregiverName}>
                    {selectedService.caregiverName || "N/A"}
                  </ThemedText>
                  <ThemedText style={styles.elderlyName}>
                    Chăm sóc: {selectedService.elderlyName || "N/A"}
                  </ThemedText>
                  <ThemedText style={styles.statusText}>
                    Trạng thái:{" "}
                    {selectedService.status === "completed"
                      ? "Đã thanh toán"
                      : "Đã hủy"}
                  </ThemedText>
                  <ThemedText style={styles.startDate}>
                    Ngày bắt đầu: {selectedService.startDate || "N/A"}
                  </ThemedText>
                  {selectedService.endDate && (
                    <ThemedText style={styles.endDate}>
                      Ngày kết thúc: {selectedService.endDate}
                    </ThemedText>
                  )}
                </View>
              </View>
            </View>

            {/* Wallet Info */}
            <View style={styles.walletInfoContainer}>
              <ThemedText style={styles.walletTitle}>Thông tin ví</ThemedText>

              <View style={styles.walletCard}>
                <View style={styles.walletBalanceRow}>
                  <ThemedText style={styles.walletBalanceLabel}>
                    Số dư sau thanh toán:
                  </ThemedText>
                  <ThemedText style={styles.walletBalanceValue}>
                    {mockWalletInfo.balance.toLocaleString("vi-VN")}{" "}
                    {mockWalletInfo.currency}
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Payments List */}
            <FlatList
              data={mockPayments.filter(
                (payment) => payment.serviceId === selectedService.id
              )}
              renderItem={renderPayment}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          </View>
        ) : (
          <View style={styles.servicesContainer}>
            <View style={styles.servicesTitleContainer}>
              <ThemedText style={styles.servicesTitle}>
                Chọn 1 dịch vụ để xem
              </ThemedText>
              <ThemedText style={styles.servicesSubtitle}>
                Thanh toán và lịch sử giao dịch
              </ThemedText>
            </View>
            <FlatList
              data={mockServices}
              renderItem={renderService}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    paddingBottom: 100,
  },
  header: {
    backgroundColor: "#27AE60",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  filterButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  servicesContainer: {
    flex: 1,
  },
  servicesTitleContainer: {
    backgroundColor: "#F7F9FC",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  servicesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  servicesSubtitle: {
    fontSize: 14,
    color: "#6C757D",
  },
  serviceDetailContainer: {
    flex: 1,
  },
  selectedServiceCard: {
    backgroundColor: "white",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  serviceHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  serviceCard: {
    backgroundColor: "white",
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#F8F9FA",
  },
  serviceCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  serviceCardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  serviceInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 12,
    color: "#2C3E50",
    fontWeight: "600",
    marginBottom: 4,
  },
  startDate: {
    fontSize: 12,
    color: "#6C757D",
    marginBottom: 2,
  },
  endDate: {
    fontSize: 12,
    color: "#6C757D",
  },
  caregiverName: {
    fontSize: 14,
    color: "#3498DB",
    marginBottom: 4,
  },
  elderlyName: {
    fontSize: 12,
    color: "#E74C3C",
    marginBottom: 4,
  },
  familyName: {
    fontSize: 12,
    color: "#6C757D",
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: "#6C757D",
  },
  serviceArrow: {
    padding: 4,
  },
  serviceCardBody: {
    gap: 8,
  },
  serviceDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  serviceDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  serviceDetailLabel: {
    fontSize: 14,
    color: "#6C757D",
    marginLeft: 8,
    marginRight: 4,
    fontWeight: "500",
  },
  serviceDetailText: {
    fontSize: 14,
    color: "#2C3E50",
    flex: 1,
  },
  serviceStatusRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 8,
  },
  paymentType: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  paymentDescription: {
    fontSize: 14,
    color: "#6C757D",
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 14,
    color: "#6C757D",
  },
  amountValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: "#6C757D",
  },
  dateValue: {
    fontSize: 14,
    color: "#2C3E50",
  },
  methodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  methodLabel: {
    fontSize: 14,
    color: "#6C757D",
  },
  methodValue: {
    fontSize: 14,
    color: "#2C3E50",
  },
  listContainer: {
    padding: 8,
  },
  paymentCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  paymentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  paymentAvatarContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 80,
    alignItems: "center",
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  paymentDetails: {
    marginBottom: 12,
  },
  descriptionContainer: {
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#27AE60",
  },
  descriptionText: {
    fontSize: 14,
    color: "#495057",
  },
  walletInfoContainer: {
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  walletTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 12,
  },
  walletCard: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#27AE60",
  },
  walletBalanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  walletBalanceLabel: {
    fontSize: 16,
    color: "#6C757D",
    fontWeight: "500",
  },
  walletBalanceValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#27AE60",
  },
});
