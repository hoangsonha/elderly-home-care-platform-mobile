import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { SimpleNavBar } from '@/components/navigation/SimpleNavBar';
import { ThemedText } from '@/components/themed-text';
import { formatCurrency } from '@/utils/currency';

export const options = {
  headerShown: false,
};

interface Bank {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  colors: string[];
}

export default function WithdrawScreen() {
  const [selectedAmount, setSelectedAmount] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [showAddBank, setShowAddBank] = useState(false);

  const availableBalance = 2450000;

  const predefinedAmounts = [
    '100.000',
    '500.000',
    '1.000.000',
  ];

  const banks: Bank[] = [
    {
      id: 'vietcombank',
      name: 'Vietcombank',
      shortName: 'VCB',
      icon: 'VC',
      colors: ['#1877F2', '#42A5F5'],
    },
    {
      id: 'techcombank',
      name: 'Techcombank',
      shortName: 'TCB',
      icon: 'TC',
      colors: ['#F39C12', '#F5B041'],
    },
    {
      id: 'bidv',
      name: 'BIDV',
      shortName: 'BIDV',
      icon: 'BI',
      colors: ['#E74C3C', '#EC7063'],
    },
    {
      id: 'vietinbank',
      name: 'Vietinbank',
      shortName: 'CTB',
      icon: 'VB',
      colors: ['#9B59B6', '#AF7AC5'],
    },
    {
      id: 'agribank',
      name: 'Agribank',
      shortName: 'AGB',
      icon: 'AB',
      colors: ['#27AE60', '#52BE80'],
    },
  ];

  const handleAmountPress = (amount: string) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleWithdrawAll = () => {
    setSelectedAmount(availableBalance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
    setCustomAmount('');
  };

  const handleConfirm = () => {
    if (!selectedAmount && !customAmount) {
      Alert.alert('Thông báo', 'Vui lòng nhập số tiền muốn rút');
      return;
    }
    if (!selectedBank) {
      Alert.alert('Thông báo', 'Vui lòng chọn ngân hàng nhận tiền');
      return;
    }

    const selectedBankInfo = banks.find(b => b.id === selectedBank);
    const withdrawalAmount = parseInt((customAmount || selectedAmount).replace(/,/g, '')) || 0;

    Alert.alert(
      'Xác nhận rút tiền',
      `Số tiền: ${formatCurrency(withdrawalAmount, false)}₫\nNgân hàng nhận: ${selectedBankInfo?.name}\nSố tài khoản: ${selectedBankInfo?.shortName}`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xác nhận', 
          onPress: () => {
            Alert.alert(
              'Thành công',
              'Yêu cầu rút tiền đã được gửi. Tiền sẽ được chuyển vào tài khoản trong vòng 1-3 ngày làm việc.',
              [{ text: 'OK', onPress: () => router.back() }]
            );
          }
        },
      ]
    );
  };

  const isConfirmDisabled = !selectedBank || (!selectedAmount && !customAmount);

  const transactionFee = 0; // Free
  const withdrawalAmount = parseInt((customAmount || selectedAmount).replace(/,/g, '')) || 0;
  const amountReceived = withdrawalAmount - transactionFee;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#FF9800', '#FF5722']}
          style={[styles.header, { borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }]}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
            <ThemedText style={styles.backText}>Quay lại</ThemedText>
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="arrow-up" size={36} color="white" />
            </View>
            <ThemedText style={styles.headerTitle}>Rút tiền về tài khoản</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Số dư khả dụng: {formatCurrency(availableBalance, false)}₫
            </ThemedText>
          </View>
        </LinearGradient>

        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>Số tiền muốn rút</ThemedText>

          <View style={styles.amountInputContainer}>
            <TextInput
              style={styles.amountInput}
              placeholder="Nhập số tiền"
              placeholderTextColor="#9CA3AF"
              value={customAmount || selectedAmount}
              onChangeText={(text) => {
                setCustomAmount(text);
                setSelectedAmount('');
              }}
              keyboardType="number-pad"
            />
            {customAmount && (
              <View style={styles.amountPreviewContainer}>
                <ThemedText style={styles.amountPreviewLabel}>Số tiền bạn nhập:</ThemedText>
                <ThemedText style={styles.amountPreview}>
                  {formatCurrency(parseInt(customAmount.replace(/,/g, '')) || 0, false)}₫
                </ThemedText>
              </View>
            )}
          </View>

          <View style={styles.quickAmountContainer}>
            {predefinedAmounts.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.quickAmountButton,
                  selectedAmount === amount && styles.quickAmountButtonActive
                ]}
                onPress={() => handleAmountPress(amount)}
              >
                <ThemedText style={[
                  styles.quickAmountText,
                  selectedAmount === amount && styles.quickAmountTextActive
                ]}>
                  +{amount}₫
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            style={styles.withdrawAllButton}
            onPress={handleWithdrawAll}
          >
            <ThemedText style={styles.withdrawAllText}>Rút tất cả</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>Chọn ngân hàng nhận tiền</ThemedText>

          <ScrollView style={styles.bankList}>
            {banks.map((bank) => (
              <TouchableOpacity
                key={bank.id}
                style={styles.bankItem}
                onPress={() => setSelectedBank(bank.id)}
              >
                <View style={styles.bankIcon}>
                  <ThemedText style={styles.bankIconText}>{bank.icon}</ThemedText>
                </View>
                <View style={styles.bankInfo}>
                  <ThemedText style={styles.bankName}>{bank.name}</ThemedText>
                  <ThemedText style={styles.bankShortName}>{bank.shortName}</ThemedText>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedBank === bank.id && styles.radioButtonActive
                ]}>
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
            <Ionicons name="add-circle-outline" size={20} color="#1877F2" />
            <ThemedText style={styles.addBankText}>
              Thêm tài khoản ngân hàng mới
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Số tiền rút</ThemedText>
            <ThemedText style={[styles.summaryValue, { color: '#FF9800' }]}>
              {formatCurrency(withdrawalAmount, false)}₫
            </ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Phí giao dịch</ThemedText>
            <ThemedText style={[styles.summaryValue, { color: '#27AE60' }]}>
              Miễn phí
            </ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Số tiền nhận được</ThemedText>
            <ThemedText style={[styles.summaryValue, { color: '#FF9800' }]}>
              {formatCurrency(amountReceived, false)}₫
            </ThemedText>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.confirmButton, isConfirmDisabled && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={isConfirmDisabled}
        >
          <ThemedText style={[styles.confirmButtonText, isConfirmDisabled && styles.confirmButtonTextDisabled]}>
            Xác nhận rút tiền
          </ThemedText>
        </TouchableOpacity>

        <View style={styles.noteCard}>
          <View style={styles.noteHeader}>
            <Ionicons name="information-circle" size={24} color="#FF9800" />
            <ThemedText style={styles.noteTitle}>Lưu ý khi rút tiền</ThemedText>
          </View>
          <View style={styles.noteList}>
            <ThemedText style={styles.noteItem}>• Thời gian xử lý: 1-3 ngày làm việc</ThemedText>
            <ThemedText style={styles.noteItem}>• Số tiền tối thiểu: 50.000₫</ThemedText>
            <ThemedText style={styles.noteItem}>• Số tiền tối đa: 50.000.000₫/ngày</ThemedText>
            <ThemedText style={styles.noteItem}>• Miễn phí giao dịch cho mọi ngân hàng</ThemedText>
          </View>
        </View>
      </ScrollView>

      <View style={styles.navBarContainer}>
        <SimpleNavBar />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  backText: {
    fontSize: 14,
    color: 'white',
    marginLeft: 4,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  headerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  amountInputContainer: {
    marginBottom: 16,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  amountPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    justifyContent: 'center',
  },
  amountPreviewLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginRight: 4,
  },
  amountPreview: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  quickAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickAmountButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  quickAmountButtonActive: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  quickAmountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  quickAmountTextActive: {
    color: 'white',
  },
  withdrawAllButton: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  withdrawAllText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF9800',
  },
  bankList: {
    maxHeight: 300,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  bankIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bankIconText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  bankShortName: {
    fontSize: 13,
    color: '#6B7280',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonActive: {
    borderColor: '#1877F2',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1877F2',
  },
  addBankButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  addBankText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1877F2',
    marginLeft: 8,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  confirmButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    alignItems: 'center',
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  confirmButtonTextDisabled: {
    color: '#9CA3AF',
  },
  noteCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 100,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  noteList: {
    paddingLeft: 8,
  },
  noteItem: {
    fontSize: 13,
    color: '#E74C3C',
    marginVertical: 4,
    fontWeight: '500',
  },
  navBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

