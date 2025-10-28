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

export default function TopUpScreen() {
  const [selectedAmount, setSelectedAmount] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');

  const predefinedAmounts = [
    '100.000',
    '200.000',
    '500.000',
    '1.000.000',
    '2.000.000',
    '5.000.000',
  ];

  const paymentMethods = [
    {
      id: 'momo',
      name: 'MoMo',
      icon: 'wallet',
      popular: true,
      free: true,
    },
    {
      id: 'vnpay',
      name: 'VNPay',
      icon: 'card',
      popular: true,
      free: true,
    },
    {
      id: 'zalopay',
      name: 'ZaloPay',
      icon: 'cash',
      free: true,
    },
    {
      id: 'bank',
      name: 'Chuyển khoản',
      icon: 'business',
      free: true,
    },
  ];

  const handleAmountPress = (amount: string) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleConfirm = () => {
    if (!selectedAmount && !customAmount) {
      Alert.alert('Thông báo', 'Vui lòng chọn hoặc nhập số tiền cần nạp');
      return;
    }
    if (!selectedPaymentMethod) {
      Alert.alert('Thông báo', 'Vui lòng chọn phương thức thanh toán');
      return;
    }

    const amount = customAmount || selectedAmount;
    Alert.alert(
      'Thành công',
      `Đã nạp ${amount}₫ vào ví thành công!`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const isConfirmDisabled = !selectedPaymentMethod || (!selectedAmount && !customAmount);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#4CAF50', '#27AE60']}
          style={styles.header}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
            <ThemedText style={styles.backText}>Quay lại</ThemedText>
          </TouchableOpacity>

          <View style={styles.headerIconContainer}>
            <View style={styles.headerIcon}>
              <Ionicons name="add" size={36} color="#4CAF50" />
            </View>
          </View>

          <ThemedText style={styles.headerTitle}>Nạp tiền vào ví</ThemedText>
        </LinearGradient>
        {/* Amount Selection Card */}
        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>Chọn số tiền</ThemedText>
          
          <View style={styles.amountGrid}>
            {predefinedAmounts.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.amountButton,
                  selectedAmount === amount && styles.amountButtonSelected
                ]}
                onPress={() => handleAmountPress(amount)}
              >
                <ThemedText style={[
                  styles.amountText,
                  selectedAmount === amount && styles.amountTextSelected
                ]}>
                  {amount}₫
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.customInput}
            value={customAmount}
            onChangeText={(text) => {
              setCustomAmount(text);
              setSelectedAmount('');
            }}
            placeholder="Hoặc nhập số tiền khác"
            keyboardType="numeric"
            placeholderTextColor="#9E9E9E"
          />
          
          {customAmount && !isNaN(Number(customAmount.replace(/\./g, ''))) && (
            <View style={styles.formattedAmountContainer}>
              <ThemedText style={styles.formattedAmountLabel}>Số tiền:</ThemedText>
              <ThemedText style={styles.formattedAmountValue}>
                {formatCurrency(Number(customAmount.replace(/\./g, '')), true)}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Payment Methods Card */}
        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>Phương thức thanh toán</ThemedText>
          
          <View style={styles.paymentMethods}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethod,
                  selectedPaymentMethod === method.id && styles.paymentMethodSelected
                ]}
                onPress={() => setSelectedPaymentMethod(method.id)}
              >
                <View style={styles.paymentMethodLeft}>
                  <View style={[
                    styles.paymentMethodIcon,
                    method.id === 'momo' && styles.iconMomo,
                    method.id === 'vnpay' && styles.iconVnpay,
                    method.id === 'zalopay' && styles.iconZalopay,
                    method.id === 'bank' && styles.iconBank,
                  ]}>
                    <Ionicons 
                      name={method.icon as any} 
                      size={24} 
                      color={method.id === 'momo' ? '#A239CA' : method.id === 'vnpay' ? '#FFB800' : method.id === 'zalopay' ? '#2CAAE4' : '#7B2CBF'} 
                    />
                  </View>
                  
                  <View style={styles.paymentMethodInfo}>
                    <View style={styles.paymentMethodNameRow}>
                      <ThemedText style={styles.paymentMethodName}>{method.name}</ThemedText>
                      {method.popular && (
                        <View style={styles.popularBadge}>
                          <ThemedText style={styles.popularText}>Phổ biến</ThemedText>
                        </View>
                      )}
                    </View>
                    <ThemedText style={styles.paymentMethodFree}>
                      Miễn phí
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.radioButton}>
                  {selectedPaymentMethod === method.id && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Important Notes */}
          <View style={styles.notesContainer}>
            <Ionicons name="information-circle" size={20} color="#2196F3" />
            <View style={styles.notesContent}>
              <ThemedText style={styles.notesTitle}>Lưu ý quan trọng</ThemedText>
              <ThemedText style={styles.noteItem}>
                • Giao dịch được xử lý ngay lập tức
              </ThemedText>
              <ThemedText style={styles.noteItem}>
                • Số tiền tối thiểu: 50,000₫
              </ThemedText>
              <ThemedText style={styles.noteItem}>
                • Số tiền tối đa: 50,000,000đ/lần
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Confirm Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.confirmButton, isConfirmDisabled && styles.confirmButtonDisabled]}
            onPress={handleConfirm}
            disabled={isConfirmDisabled}
          >
            <LinearGradient
              colors={isConfirmDisabled ? ['#CCCCCC', '#AAAAAA'] : ['#4CAF50', '#27AE60']}
              style={styles.confirmButtonGradient}
            >
              <ThemedText style={styles.confirmButtonText}>
                Xác nhận nạp tiền
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <SimpleNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: -30,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 8,
  },
  headerIconContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginBottom: 20,
    zIndex: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  amountButton: {
    width: '31%',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountButtonSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8F4',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  amountTextSelected: {
    color: '#4CAF50',
  },
  customInput: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#2C3E50',
    marginTop: 16,
  },
  formattedAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F1F8F4',
    borderRadius: 8,
    gap: 8,
  },
  formattedAmountLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  formattedAmountValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#27AE60',
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: 'white',
  },
  paymentMethodSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8F4',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconMomo: {
    backgroundColor: '#FFF1FF',
  },
  iconVnpay: {
    backgroundColor: '#FFF9E6',
  },
  iconZalopay: {
    backgroundColor: '#E6F7FF',
  },
  iconBank: {
    backgroundColor: '#F3E5F9',
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginRight: 8,
  },
  popularBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  paymentMethodFree: {
    fontSize: 14,
    color: '#4CAF50',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  notesContainer: {
    flexDirection: 'row',
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
  },
  notesContent: {
    flex: 1,
    marginLeft: 12,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 8,
  },
  noteItem: {
    fontSize: 13,
    color: '#6C757D',
    marginBottom: 4,
  },
  bottomSpacing: {
    height: 100,
  },
  footer: {
    paddingHorizontal: 0,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  confirmButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});

