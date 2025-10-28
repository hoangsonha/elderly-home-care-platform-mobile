import { ThemedText } from '@/components/themed-text';
import { formatCurrency } from '@/utils/currency';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Transaction {
  id: string;
  type: 'topup' | 'payment' | 'withdraw' | 'refund';
  amount: number;
  description: string;
  date: string;
  time: string;
  status: 'completed' | 'pending' | 'failed';
  transactionId: string;
  recipient?: string;
}

export default function TransactionHistory() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'all' | 'topup' | 'payment' | 'withdraw' | 'refund'>('all');

  // Mock transactions data
  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'payment',
      amount: 500000,
      description: 'Thanh toán cho Nguyễn Thị Lan',
      date: '25/10/2025',
      time: '14:30',
      status: 'completed',
      transactionId: 'PAY001234',
      recipient: 'Nguyễn Thị Lan',
    },
    {
      id: '2',
      type: 'topup',
      amount: 1000000,
      description: 'Nạp tiền qua Momo',
      date: '24/10/2025',
      time: '16:45',
      status: 'completed',
      transactionId: 'TOP001233',
    },
    {
      id: '3',
      type: 'payment',
      amount: 500000,
      description: 'Thanh toán cho Trần Văn Minh',
      date: '23/10/2025',
      time: '18:00',
      status: 'completed',
      transactionId: 'PAY001232',
      recipient: 'Trần Văn Minh',
    },
    {
      id: '4',
      type: 'topup',
      amount: 500000,
      description: 'Nạp tiền qua thẻ ngân hàng',
      date: '22/10/2025',
      time: '10:15',
      status: 'completed',
      transactionId: 'TOP001231',
    },
    {
      id: '5',
      type: 'withdraw',
      amount: 300000,
      description: 'Rút tiền về tài khoản ngân hàng',
      date: '21/10/2025',
      time: '09:00',
      status: 'completed',
      transactionId: 'WIT001230',
    },
    {
      id: '6',
      type: 'refund',
      amount: 200000,
      description: 'Hoàn tiền từ hủy dịch vụ',
      date: '20/10/2025',
      time: '15:30',
      status: 'completed',
      transactionId: 'REF001229',
    },
  ];

  const filteredTransactions = transactions.filter(t => 
    activeTab === 'all' || t.type === activeTab
  );

  // Calculate totals from all transactions
  const totalTopup = 1500000; // Sample data from image
  const totalPayment = 1000000; // Sample data from image
  const totalWithdraw = 0; // Sample data from image

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'topup': return 'arrow-down-circle';
      case 'payment': return 'arrow-up-circle';
      case 'withdraw': return 'log-out';
      case 'refund': return 'return-down-back';
      default: return 'cash';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'topup': return '#27AE60';
      case 'payment': return '#E74C3C';
      case 'withdraw': return '#E74C3C';
      case 'refund': return '#27AE60';
      default: return '#3498DB';
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const icon = getTransactionIcon(item.type);
    const color = getTransactionColor(item.type);
    const isPositive = item.type === 'topup' || item.type === 'refund';

    return (
      <TouchableOpacity 
        style={styles.transactionItem}
        onPress={() => router.push({
          pathname: '/transaction-detail' as any,
          params: {
            transactionId: item.id,
            type: item.type,
            amount: item.amount.toString(),
            description: item.description,
            date: item.date,
            time: item.time,
            status: item.status,
            transactionIdCode: item.transactionId,
            recipient: item.recipient || '',
          }
        })}
      >
        <View style={[styles.transactionIconContainer, { backgroundColor: color }]}>
          <Ionicons name={icon as any} size={24} color="white" />
        </View>
        <View style={styles.transactionContent}>
          <View style={styles.transactionTop}>
            <ThemedText style={styles.transactionDescription}>
              {item.description}
            </ThemedText>
            <ThemedText 
              style={[
                styles.transactionAmount,
                { color: item.type === 'topup' || item.type === 'refund' ? '#27AE60' : '#E74C3C' }
              ]}
            >
              {isPositive ? '+' : ''}{formatCurrency(Math.abs(item.amount), false)}đ
            </ThemedText>
          </View>
          <View style={styles.transactionBottom}>
            <ThemedText style={styles.transactionDate}>
              {item.date} • {item.time}
            </ThemedText>
            <View style={styles.transactionIdContainer}>
              <Ionicons name="document-text" size={14} color="#9CA3AF" />
              <ThemedText style={styles.transactionId}>Mã GD: {item.transactionId || 'N/A'}</ThemedText>
            </View>
          </View>
          <View style={styles.transactionStatusBadge}>
            <View style={[styles.statusDot, { backgroundColor: item.status === 'completed' ? '#27AE60' : item.status === 'pending' ? '#F39C12' : '#E74C3C' }]} />
            <ThemedText style={[styles.transactionStatusText, { color: item.status === 'completed' ? '#27AE60' : item.status === 'pending' ? '#F39C12' : '#E74C3C' }]}>
              {item.status === 'completed' ? 'Thành công' : item.status === 'pending' ? 'Đang xử lý' : 'Thất bại'}
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
          <View style={styles.headerIconContainer}>
            <Ionicons name="time" size={32} color="white" />
          </View>
          <ThemedText style={styles.headerTitle}>Lịch sử giao dịch</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Theo dõi toàn bộ giao dịch của bạn</ThemedText>
        </View>
      </LinearGradient>

      <View style={styles.filterContainer}>
        <View style={styles.filterContent}>
          <TouchableOpacity
            style={[styles.filterTab, activeTab === 'all' && styles.filterTabActive]}
            onPress={() => setActiveTab('all')}
          >
            <View style={styles.filterTabContent}>
              <Ionicons 
                name="time" 
                size={20} 
                color={activeTab === 'all' ? 'white' : '#9CA3AF'} 
              />
              <ThemedText 
                style={[
                  styles.filterTabText, 
                  activeTab === 'all' && styles.filterTabTextActive
                ]}
              >
                Tất cả
              </ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, activeTab === 'topup' && styles.filterTabActive]}
            onPress={() => setActiveTab('topup')}
          >
            <View style={styles.filterTabContent}>
              <Ionicons 
                name="arrow-down-circle" 
                size={20} 
                color={activeTab === 'topup' ? 'white' : '#9CA3AF'} 
              />
              <ThemedText 
                style={[
                  styles.filterTabText, 
                  activeTab === 'topup' && styles.filterTabTextActive
                ]}
              >
                Nạp
              </ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, activeTab === 'payment' && styles.filterTabActive]}
            onPress={() => setActiveTab('payment')}
          >
            <View style={styles.filterTabContent}>
              <Ionicons 
                name="arrow-up-circle" 
                size={20} 
                color={activeTab === 'payment' ? 'white' : '#9CA3AF'} 
              />
              <ThemedText 
                style={[
                  styles.filterTabText, 
                  activeTab === 'payment' && styles.filterTabTextActive
                ]}
              >
                Chi
              </ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, activeTab === 'withdraw' && styles.filterTabActive]}
            onPress={() => setActiveTab('withdraw')}
          >
            <View style={styles.filterTabContent}>
              <Ionicons 
                name="log-out" 
                size={20} 
                color={activeTab === 'withdraw' ? 'white' : '#9CA3AF'} 
              />
              <ThemedText 
                style={[
                  styles.filterTabText, 
                  activeTab === 'withdraw' && styles.filterTabTextActive
                ]}
              >
                Rút
              </ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, activeTab === 'refund' && styles.filterTabActive]}
            onPress={() => setActiveTab('refund')}
          >
            <View style={styles.filterTabContent}>
              <Ionicons 
                name="return-down-back" 
                size={20} 
                color={activeTab === 'refund' ? 'white' : '#9CA3AF'} 
              />
              <ThemedText 
                style={[
                  styles.filterTabText, 
                  activeTab === 'refund' && styles.filterTabTextActive
                ]}
              >
                Hoàn
              </ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <ThemedText style={styles.summaryLabel}>Tổng nạp</ThemedText>
            <ThemedText style={[styles.summaryValue, { color: '#27AE60' }]}>
              {formatCurrency(totalTopup, false)}đ
            </ThemedText>
          </View>

          <View style={styles.summaryCard}>
            <ThemedText style={styles.summaryLabel}>Tổng chi</ThemedText>
            <ThemedText style={[styles.summaryValue, { color: '#E74C3C' }]}>
              {formatCurrency(totalPayment, false)}đ
            </ThemedText>
          </View>

          <View style={styles.summaryCard}>
            <ThemedText style={styles.summaryLabel}>Tổng rút</ThemedText>
            <ThemedText style={[styles.summaryValue, { color: '#E74C3C' }]}>
              {formatCurrency(totalWithdraw, false)}đ
            </ThemedText>
          </View>
        </View>
      </View>

      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingBottom: 24,
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
    marginTop: 12,
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  filterContainer: {
    backgroundColor: 'white',
    marginTop: -16,
    marginHorizontal: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  filterContent: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: 'space-between',
  },
  filterTab: {
    flex: 1,
    height: 68,
    borderRadius: 20,
    marginHorizontal: 3,
    backgroundColor: 'transparent',
  },
  filterTabActive: {
    backgroundColor: '#A855F7',
  },
  filterTabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 6,
    textAlign: 'center',
  },
  filterTabTextActive: {
    color: 'white',
  },
  summaryContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  listContent: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  transactionItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionContent: {
    flex: 1,
  },
  transactionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  transactionDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  transactionBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  transactionIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionId: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  transactionStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  transactionStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
