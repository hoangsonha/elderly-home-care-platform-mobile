import { Ionicons } from '@expo/vector-icons';
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { FeatureCard } from '@/components/guest/FeatureCard';
import { HeaderStats } from '@/components/guest/HeaderStats';
import { useNavigation } from '@/components/navigation/NavigationHelper';
import { ThemedText } from '@/components/themed-text';

const { width } = Dimensions.get('window');

export default function GuestHomeScreen() {
  const navigation = useNavigation();

  const handleFeaturePress = (featureId: string, featureTitle: string) => {
    switch (featureId) {
      case 'register':
        navigation.navigate('/register');
        break;
      case 'system-info':
        navigation.navigate('/system-info');
        break;
      default:
        Alert.alert('Thông báo', `Tính năng "${featureTitle}" sẽ sớm được phát triển!`);
    }
  };

  const statsData = [
    { number: '1000+', label: 'Người chăm sóc' },
    { number: '500+', label: 'Gia đình tin tưởng' },
  ];

  const features = [
    {
      id: 'blog',
      title: 'Tin tức',
      subtitle: 'Kiến thức chăm sóc',
      icon: 'library',
      backgroundColor: '#f093fb',
    },
    {
      id: 'feedback',
      title: 'Phản hồi',
      subtitle: 'Chia sẻ trải nghiệm',
      icon: 'star',
      backgroundColor: '#4facfe',
    },
    {
      id: 'system-info',
      title: 'Hệ thống',
      subtitle: 'Nền tảng AI',
      icon: 'information-circle',
      backgroundColor: '#43e97b',
    },
    {
      id: 'faqs',
      title: 'FAQ',
      subtitle: 'Câu hỏi thường gặp',
      icon: 'help-circle',
      backgroundColor: '#fa709a',
    },
    {
      id: 'support',
      title: 'Hỗ trợ',
      subtitle: 'Liên hệ 24/7',
      icon: 'headset',
      backgroundColor: '#a8edea',
    },
    {
      id: 'pricing',
      title: 'Bảng giá',
      subtitle: 'Ước tính chi phí',
      icon: 'pricetag',
      backgroundColor: '#ff9a9e',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <ThemedText style={styles.appTitle}>ELDER CARE CONNECT</ThemedText>
          <ThemedText style={styles.appSubtitle}>
            Nền tảng chăm sóc người cao tuổi ứng dụng AI
          </ThemedText>
          <HeaderStats stats={statsData} />
        </View>
      </View>

      {/* Features Grid */}
      <View style={styles.featuresContainer}>
        <ThemedText style={styles.sectionTitle}>Khám phá tính năng</ThemedText>
        
        <View style={styles.featuresGrid}>
          {features.map((feature) => (
            <FeatureCard
              key={feature.id}
              title={feature.title}
              subtitle={feature.subtitle}
              icon={feature.icon}
              backgroundColor={feature.backgroundColor}
              onPress={() => handleFeaturePress(feature.id, feature.title)}
              width={(width - 60) / 2}
            />
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <ThemedText style={styles.sectionTitle}>Hành động nhanh</ThemedText>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('/login')}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="log-in" size={20} color="white" />
              <ThemedText style={styles.buttonText}>Đăng nhập</ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => handleFeaturePress('register', 'Đăng ký tài khoản')}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="person-add" size={20} color="#667eea" />
              <ThemedText style={styles.registerButtonText}>Đăng ký</ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => handleFeaturePress('support', 'Tư vấn miễn phí')}
        >
          <Ionicons name="call" size={20} color="#667eea" />
          <ThemedText style={styles.secondaryButtonText}>
            Tư vấn miễn phí: 1900-123-456
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>
          © 2025 Elder Care Connect. Chăm sóc tận tâm, công nghệ hiện đại.
        </ThemedText>
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
    backgroundColor: '#667eea',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 30,
  },
  featuresContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  primaryButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    backgroundColor: '#667eea',
  },
  registerButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#667eea',
    gap: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 18,
  },
});