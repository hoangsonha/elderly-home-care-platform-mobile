import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';

export default function SystemInfoScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#667eea" />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Giới thiệu hệ thống</ThemedText>
      </View>

      <View style={styles.content}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="heart" size={60} color="#667eea" />
          </View>
          <ThemedText style={styles.heroTitle}>
            ELDER CARE CONNECT
          </ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Nền tảng kết nối dịch vụ chăm sóc người cao tuổi tại nhà ứng dụng trí tuệ nhân tạo
          </ThemedText>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            🤖 Công nghệ AI tiên tiến
          </ThemedText>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#28a745" />
              <ThemedText style={styles.featureText}>
                Hệ thống gợi ý người chăm sóc thông minh
              </ThemedText>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#28a745" />
              <ThemedText style={styles.featureText}>
                Phân tích nhu cầu chăm sóc cá nhân hóa
              </ThemedText>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#28a745" />
              <ThemedText style={styles.featureText}>
                Theo dõi chất lượng dịch vụ tự động
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Process Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            📋 Quy trình hoạt động
          </ThemedText>
          <View style={styles.processSteps}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>1</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>Đăng ký & Xác thực</ThemedText>
                <ThemedText style={styles.stepDescription}>
                  Tạo hồ sơ và xác thực thông tin qua hệ thống bảo mật cao
                </ThemedText>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>2</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>Phân tích AI</ThemedText>
                <ThemedText style={styles.stepDescription}>
                  AI phân tích nhu cầu và gợi ý người chăm sóc phù hợp nhất
                </ThemedText>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>3</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>Kết nối & Theo dõi</ThemedText>
                <ThemedText style={styles.stepDescription}>
                  Kết nối trực tiếp và theo dõi chất lượng dịch vụ 24/7
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Benefits Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            ✨ Lợi ích vượt trội
          </ThemedText>
          <View style={styles.benefitGrid}>
            <View style={styles.benefitCard}>
              <Ionicons name="shield-checkmark" size={30} color="#667eea" />
              <ThemedText style={styles.benefitTitle}>An toàn</ThemedText>
              <ThemedText style={styles.benefitText}>
                Xác thực nghiêm ngặt người chăm sóc
              </ThemedText>
            </View>
            <View style={styles.benefitCard}>
              <Ionicons name="time" size={30} color="#667eea" />
              <ThemedText style={styles.benefitTitle}>Tiện lợi</ThemedText>
              <ThemedText style={styles.benefitText}>
                Đặt lịch và quản lý dễ dàng
              </ThemedText>
            </View>
            <View style={styles.benefitCard}>
              <Ionicons name="analytics" size={30} color="#667eea" />
              <ThemedText style={styles.benefitTitle}>Thông minh</ThemedText>
              <ThemedText style={styles.benefitText}>
                AI gợi ý tối ưu nhất
              </ThemedText>
            </View>
            <View style={styles.benefitCard}>
              <Ionicons name="people" size={30} color="#667eea" />
              <ThemedText style={styles.benefitTitle}>Đáng tin</ThemedText>
              <ThemedText style={styles.benefitText}>
                Hàng nghìn gia đình tin tưởng
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  content: {
    padding: 20,
  },
  heroSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#495057',
    flex: 1,
  },
  processSteps: {
    gap: 20,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  benefitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  benefitCard: {
    width: '47%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 8,
    marginBottom: 4,
  },
  benefitText: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 16,
  },
});

