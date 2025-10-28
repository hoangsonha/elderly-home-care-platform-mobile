import { ThemedText } from '@/components/themed-text';
import { formatCurrency } from '@/utils/currency';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TransactionDetail() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const {
    transactionId,
    type,
    amount,
    description,
    date,
    time,
    status,
    transactionIdCode,
    recipient,
  } = params;

  const transactionAmount = parseInt(amount as string);
  const isPositive = type === 'topup' || type === 'refund';
  const color = type === 'topup' || type === 'refund' ? '#27AE60' : '#E74C3C';

  // Mock balance before transaction (for demo)
  const balanceBefore = 2000000;
  const balanceAfter = isPositive ? balanceBefore + transactionAmount : balanceBefore - transactionAmount;

  // Mock booking code for payment and refund transactions
  const bookingCode = (type === 'payment' || type === 'refund') ? 'BK' + Math.random().toString(36).substr(2, 9).toUpperCase() : null;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'topup': return 'arrow-down-circle';
      case 'payment': return 'arrow-up-circle';
      case 'withdraw': return 'log-out';
      case 'refund': return 'return-down-back';
      default: return 'cash';
    }
  };

  const getStatusInfo = () => {
    if (status === 'completed') {
      return { text: 'Thành công', color: '#27AE60' };
    } else if (status === 'pending') {
      return { text: 'Đang xử lý', color: '#F39C12' };
    } else {
      return { text: 'Thất bại', color: '#E74C3C' };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent />
      <LinearGradient
        colors={['#A855F7', '#EC4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
          <ThemedText style={styles.backText}>Quay lại</ThemedText>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={[styles.headerIconContainer, { backgroundColor: color }]}>
            <Ionicons name={getTransactionIcon(type as string) as any} size={40} color="white" />
          </View>
          <ThemedText style={styles.headerTitle}>Chi tiết giao dịch</ThemedText>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.amountCard}>
          <ThemedText style={styles.amountLabel}>Số tiền</ThemedText>
          <ThemedText style={[styles.amountValue, { color: color }]}>
            {isPositive ? '+' : ''}{formatCurrency(Math.abs(transactionAmount), false)}đ
          </ThemedText>
        </View>

        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <View style={styles.detailLabelContainer}>
              <Ionicons name="document-text" size={18} color="#6B7280" />
              <ThemedText style={styles.detailLabel}>Mô tả</ThemedText>
            </View>
            <ThemedText style={styles.detailValue}>{description}</ThemedText>
          </View>

          {recipient && (
            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <Ionicons name="person" size={18} color="#6B7280" />
                <ThemedText style={styles.detailLabel}>Người nhận</ThemedText>
              </View>
              <ThemedText style={styles.detailValue}>{recipient}</ThemedText>
            </View>
          )}

          <View style={styles.detailRow}>
            <View style={styles.detailLabelContainer}>
              <Ionicons name="time" size={18} color="#6B7280" />
              <ThemedText style={styles.detailLabel}>Thời gian</ThemedText>
            </View>
            <ThemedText style={styles.detailValue}>{date} • {time}</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLabelContainer}>
              <Ionicons name="finger-print" size={18} color="#6B7280" />
              <ThemedText style={styles.detailLabel}>Mã giao dịch</ThemedText>
            </View>
            <ThemedText style={styles.detailValue}>{transactionIdCode}</ThemedText>
          </View>

          {bookingCode && (
            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <Ionicons name="calendar" size={18} color="#6B7280" />
                <ThemedText style={styles.detailLabel}>Mã booking</ThemedText>
              </View>
              <ThemedText style={styles.detailValue}>{bookingCode}</ThemedText>
            </View>
          )}

          <View style={styles.detailRow}>
            <View style={styles.detailLabelContainer}>
              <Ionicons name="wallet" size={18} color="#6B7280" />
              <ThemedText style={styles.detailLabel}>Tài khoản ví</ThemedText>
            </View>
            <ThemedText style={styles.detailValue}>Ví Capstone</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLabelContainer}>
              <Ionicons name="checkmark-circle" size={18} color="#6B7280" />
              <ThemedText style={styles.detailLabel}>Trạng thái</ThemedText>
            </View>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
              <ThemedText style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.text}
              </ThemedText>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLabelContainer}>
              <Ionicons name="cash" size={18} color="#6B7280" />
              <ThemedText style={styles.detailLabel}>Số dư sau giao dịch</ThemedText>
            </View>
            <ThemedText style={[styles.detailValue, { color: '#27AE60', fontWeight: '700' }]}>
              {formatCurrency(Math.abs(balanceAfter), false)}đ
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingBottom: 30,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  amountCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  amountLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  detailCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  detailRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 8,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

