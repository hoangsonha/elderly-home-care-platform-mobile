import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { formatCurrency } from "@/utils/currency";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Bank {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  accountNumber: string;
  accountHolder: string;
}

export default function CaregiverWithdrawScreen() {
  const navigation = useNavigation<any>();
  const [selectedAmount, setSelectedAmount] = useState<string>("");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [showAddBank, setShowAddBank] = useState(false);
  
  // Form states for adding new bank
  const [newBankName, setNewBankName] = useState<string>("");
  const [newAccountNumber, setNewAccountNumber] = useState<string>("");
  const [newAccountHolder, setNewAccountHolder] = useState<string>("");
  const [bankList, setBankList] = useState<Bank[]>([]);
  const [showBankPicker, setShowBankPicker] = useState(false);

  const availableBalance = 4500000; // Khả dụng từ payment screen
  
  // Thông tin caregiver - nên lấy từ AuthContext
  const caregiverName = "Nguyễn Văn An"; // Mock data - should come from user profile

  const predefinedAmounts = ["100,000", "500,000", "1,000,000", "2,000,000"];

  // Danh sách các ngân hàng phổ biến tại Việt Nam
  const availableBankNames = [
    "Vietcombank - Ngân hàng TMCP Ngoại thương Việt Nam",
    "Techcombank - Ngân hàng TMCP Kỹ thương Việt Nam",
    "BIDV - Ngân hàng TMCP Đầu tư và Phát triển Việt Nam",
    "Vietinbank - Ngân hàng TMCP Công thương Việt Nam",
    "Agribank - Ngân hàng Nông nghiệp và Phát triển Nông thôn",
    "ACB - Ngân hàng TMCP Á Châu",
    "MB Bank - Ngân hàng TMCP Quân đội",
    "VPBank - Ngân hàng TMCP Việt Nam Thịnh Vượng",
    "TPBank - Ngân hàng TMCP Tiên Phong",
    "Sacombank - Ngân hàng TMCP Sài Gòn Thương Tín",
    "HDBank - Ngân hàng TMCP Phát triển TP.HCM",
    "VIB - Ngân hàng TMCP Quốc tế Việt Nam",
    "SHB - Ngân hàng TMCP Sài Gòn - Hà Nội",
    "OCB - Ngân hàng TMCP Phương Đông",
    "MSB - Ngân hàng TMCP Hàng Hải",
    "VietABank - Ngân hàng TMCP Việt Á",
    "LienVietPostBank - Ngân hàng TMCP Bưu Điện Liên Việt",
    "SeABank - Ngân hàng TMCP Đông Nam Á",
    "Nam A Bank - Ngân hàng TMCP Nam Á",
    "PGBank - Ngân hàng TMCP Xăng dầu Petrolimex",
  ];

  const defaultBanks: Bank[] = [
    {
      id: "vietcombank",
      name: "Vietcombank",
      shortName: "VCB",
      icon: "VC",
      accountNumber: "1234567890",
      accountHolder: caregiverName,
    },
    {
      id: "techcombank",
      name: "Techcombank",
      shortName: "TCB",
      icon: "TC",
      accountNumber: "9876543210",
      accountHolder: caregiverName,
    },
  ];

  // Combine default banks with user-added banks
  const banks = [...defaultBanks, ...bankList];

  const handleAmountPress = (amount: string) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleWithdrawAll = () => {
    setSelectedAmount(
      availableBalance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    );
    setCustomAmount("");
  };

  const handleAddBank = () => {
    // Validate form
    if (!newBankName.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập tên ngân hàng");
      return;
    }
    if (!newAccountNumber.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập số tài khoản");
      return;
    }
    if (!newAccountHolder.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập tên chủ tài khoản");
      return;
    }

    // Validate account holder name matches caregiver name
    if (newAccountHolder.trim() !== caregiverName) {
      Alert.alert(
        "Cảnh báo",
        "Tên chủ tài khoản phải trùng khớp với tên của bạn trong hệ thống",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Tiếp tục",
            onPress: () => {
              addNewBank();
            },
          },
        ]
      );
      return;
    }

    addNewBank();
  };

  const addNewBank = () => {
    const newBank: Bank = {
      id: `custom_${Date.now()}`,
      name: newBankName.trim(),
      shortName: newBankName.trim().substring(0, 3).toUpperCase(),
      icon: newBankName.trim().substring(0, 2).toUpperCase(),
      accountNumber: newAccountNumber.trim(),
      accountHolder: newAccountHolder.trim(),
    };

    setBankList([...bankList, newBank]);
    setSelectedBank(newBank.id);
    
    // Reset form and close modal
    setNewBankName("");
    setNewAccountNumber("");
    setNewAccountHolder("");
    setShowAddBank(false);

    Alert.alert("Thành công", "Đã thêm tài khoản ngân hàng mới");
  };

  const handleConfirm = () => {
    if (!selectedAmount && !customAmount) {
      Alert.alert("Thông báo", "Vui lòng nhập số tiền muốn rút");
      return;
    }
    if (!selectedBank) {
      Alert.alert("Thông báo", "Vui lòng chọn ngân hàng nhận tiền");
      return;
    }

    const selectedBankInfo = banks.find((b) => b.id === selectedBank);
    const withdrawalAmount =
      parseInt((customAmount || selectedAmount).replace(/,/g, "")) || 0;

    Alert.alert(
      "Xác nhận rút tiền",
      `Số tiền: ${formatCurrency(withdrawalAmount, false)}₫\nNgân hàng: ${
        selectedBankInfo?.name
      }\nSố tài khoản: ${selectedBankInfo?.accountNumber}\nChủ tài khoản: ${
        selectedBankInfo?.accountHolder
      }`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          onPress: () => {
            Alert.alert(
              "Thành công",
              "Yêu cầu rút tiền đã được gửi. Tiền sẽ được chuyển vào tài khoản trong vòng 1-3 ngày làm việc.",
              [{ text: "OK", onPress: () => navigation.goBack() }]
            );
          },
        },
      ]
    );
  };

  const isConfirmDisabled =
    !selectedBank || (!selectedAmount && !customAmount);

  const transactionFee = 0; // Free
  const withdrawalAmount =
    parseInt((customAmount || selectedAmount).replace(/[,\.]/g, "")) || 0;
  const amountReceived = withdrawalAmount - transactionFee;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#5B9FD8", "#2196F3"]}
          style={[
            styles.header,
            { borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
          ]}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="cash-outline" size={36} color="white" />
            </View>
            
            <Text style={styles.headerSubtitle}>
              Số dư khả dụng: {formatCurrency(availableBalance, false)}₫
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Số tiền muốn rút</Text>

          <View style={styles.amountInputContainer}>
            <TextInput
              style={styles.amountInput}
              placeholder="Nhập số tiền"
              placeholderTextColor="#9CA3AF"
              value={customAmount || selectedAmount}
              onChangeText={(text) => {
                setCustomAmount(text);
                setSelectedAmount("");
              }}
              keyboardType="number-pad"
            />
            {customAmount && (
              <View style={styles.amountPreviewContainer}>
                <Text style={styles.amountPreviewLabel}>Số tiền bạn nhập:</Text>
                <Text style={styles.amountPreview}>
                  {formatCurrency(
                    parseInt(customAmount.replace(/[,\.]/g, "")) || 0,
                    false
                  )}
                  ₫
                </Text>
              </View>
            )}
          </View>

          <View style={styles.quickAmountContainer}>
            {predefinedAmounts.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.quickAmountButton,
                  selectedAmount === amount && styles.quickAmountButtonActive,
                ]}
                onPress={() => handleAmountPress(amount)}
              >
                <Text
                  style={[
                    styles.quickAmountText,
                    selectedAmount === amount && styles.quickAmountTextActive,
                  ]}
                >
                  +{amount}₫
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.withdrawAllButton}
            onPress={handleWithdrawAll}
          >
            <Text style={styles.withdrawAllText}>Rút tất cả</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Chọn ngân hàng nhận tiền</Text>

          <ScrollView style={styles.bankList}>
            {banks.map((bank) => (
              <TouchableOpacity
                key={bank.id}
                style={styles.bankItem}
                onPress={() => setSelectedBank(bank.id)}
              >
                <View style={styles.bankIcon}>
                  <Text style={styles.bankIconText}>{bank.icon}</Text>
                </View>
                <View style={styles.bankInfo}>
                  <Text style={styles.bankName}>{bank.name}</Text>
                  <Text style={styles.bankAccountNumber}>
                    STK: {bank.accountNumber}
                  </Text>
                  <Text style={styles.bankAccountHolder}>
                    {bank.accountHolder}
                  </Text>
                </View>
                <View
                  style={[
                    styles.radioButton,
                    selectedBank === bank.id && styles.radioButtonActive,
                  ]}
                >
                  {selectedBank === bank.id && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.addBankButton}
            onPress={() => setShowAddBank(!showAddBank)}
          >
            <Ionicons name="add-circle-outline" size={20} color="#2196F3" />
            <Text style={styles.addBankText}>
              Thêm tài khoản ngân hàng mới
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Số tiền rút</Text>
            <Text style={[styles.summaryValue, { color: "#2196F3" }]}>
              {formatCurrency(withdrawalAmount, false)}₫
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí giao dịch</Text>
            <Text style={[styles.summaryValue, { color: "#10B981" }]}>
              Miễn phí
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Số tiền nhận được</Text>
            <Text style={[styles.summaryValue, { color: "#2196F3" }]}>
              {formatCurrency(amountReceived, false)}₫
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.confirmButton,
            isConfirmDisabled && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={isConfirmDisabled}
        >
          <Text
            style={[
              styles.confirmButtonText,
              isConfirmDisabled && styles.confirmButtonTextDisabled,
            ]}
          >
            Xác nhận rút tiền
          </Text>
        </TouchableOpacity>

        <View style={styles.noteCard}>
          <View style={styles.noteHeader}>
            <Ionicons name="information-circle" size={24} color="#2196F3" />
            <Text style={styles.noteTitle}>Lưu ý khi rút tiền</Text>
          </View>
          <View style={styles.noteList}>
            <Text style={styles.noteItem}>
              • Thời gian xử lý: 1-3 ngày làm việc
            </Text>
            <Text style={styles.noteItem}>• Số tiền tối thiểu: 100.000₫</Text>
            <Text style={styles.noteItem}>
              • Số tiền tối đa: 50.000.000₫/ngày
            </Text>
            <Text style={styles.noteItem}>
              • Miễn phí giao dịch cho mọi ngân hàng
            </Text>
          </View>
        </View>
      </ScrollView>

      <CaregiverBottomNav activeTab="income" />

      {/* Modal thêm tài khoản ngân hàng */}
      <Modal
        visible={showAddBank}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddBank(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm tài khoản ngân hàng</Text>
              <TouchableOpacity
                onPress={() => setShowAddBank(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Tên ngân hàng <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.formInput}
                  onPress={() => setShowBankPicker(true)}
                >
                  <Text
                    style={[
                      styles.formInputText,
                      !newBankName && styles.placeholderText,
                    ]}
                  >
                    {newBankName || "Chọn ngân hàng"}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color="#6B7280"
                    style={styles.dropdownIcon}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Số tài khoản <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.formTextInput}
                  placeholder="Nhập số tài khoản"
                  value={newAccountNumber}
                  onChangeText={setNewAccountNumber}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Tên chủ tài khoản <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.formTextInput}
                  placeholder="Nhập tên chủ tài khoản"
                  value={newAccountHolder}
                  onChangeText={setNewAccountHolder}
                />
                <Text style={styles.formHint}>
                  Tên phải trùng khớp với tên của bạn: {caregiverName}
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowAddBank(false)}
              >
                <Text style={styles.modalCancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleAddBank}
              >
                <Text style={styles.modalConfirmButtonText}>Thêm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal chọn ngân hàng */}
      <Modal
        visible={showBankPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBankPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bankPickerContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn ngân hàng</Text>
              <TouchableOpacity
                onPress={() => setShowBankPicker(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.bankPickerList}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.bankPickerListContent}
            >
              {availableBankNames.map((bankName, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.bankPickerItem,
                    newBankName === bankName && styles.bankPickerItemActive,
                  ]}
                  onPress={() => {
                    setNewBankName(bankName);
                    setShowBankPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.bankPickerItemText,
                      newBankName === bankName &&
                        styles.bankPickerItemTextActive,
                    ]}
                  >
                    {bankName}
                  </Text>
                  {newBankName === bankName && (
                    <Ionicons name="checkmark" size={24} color="#2196F3" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    flex: 1,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    marginRight: 12,
  },
  backText: {
    fontSize: 14,
    color: "white",
    marginLeft: 4,
    fontWeight: "500",
  },
  headerContent: {
    alignItems: "center",
    marginTop: 20,
  },
  headerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  amountInputContainer: {
    marginBottom: 16,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },
  amountPreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    justifyContent: "center",
  },
  amountPreviewLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginRight: 4,
  },
  amountPreview: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
  },
  quickAmountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 8,
  },
  quickAmountButton: {
    flex: 1,
    minWidth: "22%",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  quickAmountButtonActive: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  quickAmountText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  quickAmountTextActive: {
    color: "white",
  },
  withdrawAllButton: {
    backgroundColor: "#E3F2FD",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  withdrawAllText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2196F3",
  },
  bankList: {
    maxHeight: 300,
  },
  bankItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  bankIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  bankIconText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  bankShortName: {
    fontSize: 13,
    color: "#6B7280",
  },
  bankAccountNumber: {
    fontSize: 13,
    color: "#2196F3",
    fontWeight: "600",
    marginTop: 2,
  },
  bankAccountHolder: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonActive: {
    borderColor: "#2196F3",
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2196F3",
  },
  addBankButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  addBankText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2196F3",
    marginLeft: 8,
  },
  summaryCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "700",
  },
  confirmButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    alignItems: "center",
    shadowColor: "#2196F3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonDisabled: {
    backgroundColor: "#E5E7EB",
    shadowOpacity: 0,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  confirmButtonTextDisabled: {
    color: "#9CA3AF",
  },
  noteCard: {
    backgroundColor: "#E3F2FD",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 100,
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginLeft: 8,
  },
  noteList: {
    paddingLeft: 8,
  },
  noteItem: {
    fontSize: 13,
    color: "#1E40AF",
    marginVertical: 4,
    fontWeight: "500",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  required: {
    color: "#EF4444",
  },
  formInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  formInputText: {
    fontSize: 15,
    color: "#111827",
    flex: 1,
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  dropdownIcon: {
    marginLeft: 8,
  },
  formTextInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
  formHint: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 6,
    fontStyle: "italic",
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: "#2196F3",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  // Bank Picker Modal styles
  bankPickerContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "70%",
    height: "70%",
  },
  bankPickerList: {
    flex: 1,
  },
  bankPickerListContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    paddingBottom: 20,
  },
  bankPickerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 4,
    backgroundColor: "#F9FAFB",
  },
  bankPickerItemActive: {
    backgroundColor: "#E3F2FD",
    borderWidth: 1,
    borderColor: "#2196F3",
  },
  bankPickerItemText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  bankPickerItemTextActive: {
    color: "#2196F3",
    fontWeight: "600",
  },
});
