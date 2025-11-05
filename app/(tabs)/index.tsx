import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { FeatureCard } from '@/components/guest/FeatureCard';
import { HeaderStats } from '@/components/guest/HeaderStats';
import { useNavigation } from '@/components/navigation/NavigationHelper';
import { ThemedText } from '@/components/themed-text';

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
    { number: '500+', label: 'Chuyên gia chăm sóc' },
    { number: '1.5K', label: 'Gia đình tin dùng' },
    { number: '24/7', label: 'Giám sát & hỗ trợ' },
  ];

  const features = [
    {
      id: 'blog',
      title: 'Tin tức',
      subtitle: 'Kiến thức chăm sóc',
      icon: 'newspaper',
      colors: ['#68C2E8', '#5AB9E0'],
    },
    {
      id: 'feedback',
      title: 'Phản hồi',
      subtitle: 'Chia sẻ trải nghiệm',
      icon: 'star',
      colors: ['#FFB648', '#FFA726'],
    },
    {
      id: 'system-info',
      title: 'Hệ thống',
      subtitle: 'Nền tảng AI',
      icon: 'sparkles',
      colors: ['#8B5CF6', '#7C3AED'],
    },
    {
      id: 'faqs',
      title: 'FAQ',
      subtitle: 'Câu hỏi thường gặp',
      icon: 'help-circle',
      colors: ['#F093FB', '#F5576C'],
    },
    {
      id: 'support',
      title: 'Hỗ trợ',
      subtitle: 'Liên hệ 24/7',
      icon: 'headset',
      colors: ['#43E97B', '#38F9D7'],
    },
    {
      id: 'pricing',
      title: 'Bảng giá',
      subtitle: 'Ước tính chi phí',
      icon: 'pricetag',
      colors: ['#FA709A', '#FEE140'],
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <LinearGradient
        colors={['#68C2E8', '#5AB9E0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.logoBadge}>
            <Ionicons name="heart" size={32} color="#FFFFFF" />
          </View>
          <ThemedText style={styles.appTitle}>ELDER CARE CONNECT</ThemedText>
          <ThemedText style={styles.appSubtitle}>
            Nền tảng chăm sóc người cao tuổi ứng dụng AI
          </ThemedText>
          <HeaderStats stats={statsData} />
        </View>
      </LinearGradient>

      {/* Features Grid */}
      <View style={styles.featuresContainer}>
        <ThemedText style={styles.sectionTitle}>Khám phá tính năng</ThemedText>
        
        <View style={styles.featuresGrid}>
          <View style={styles.featureRow}>
            {features.slice(0, 3).map((feature) => (
              <FeatureCard
                key={feature.id}
                title={feature.title}
                subtitle={feature.subtitle}
                icon={feature.icon}
                colors={feature.colors}
                onPress={() => handleFeaturePress(feature.id, feature.title)}
              />
            ))}
          </View>
          
          <View style={styles.featureRow}>
            {features.slice(3, 6).map((feature) => (
              <FeatureCard
                key={feature.id}
                title={feature.title}
                subtitle={feature.subtitle}
                icon={feature.icon}
                colors={feature.colors}
                onPress={() => handleFeaturePress(feature.id, feature.title)}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <ThemedText style={styles.sectionTitle}>Bắt đầu ngay</ThemedText>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('/login')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#68C2E8', '#5AB9E0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Ionicons name="log-in" size={20} color="white" />
              <ThemedText style={styles.buttonText}>Đăng nhập</ThemedText>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => handleFeaturePress('register', 'Đăng ký tài khoản')}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="person-add" size={20} color="#68C2E8" />
              <ThemedText style={styles.registerButtonText}>Đăng ký</ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => handleFeaturePress('support', 'Tư vấn miễn phí')}
          activeOpacity={0.8}
        >
          <View style={styles.supportContent}>
            <View style={styles.supportIcon}>
              <Ionicons name="call" size={18} color="#68C2E8" />
            </View>
            <View style={styles.supportTextContainer}>
              <ThemedText style={styles.supportLabel}>Hotline hỗ trợ</ThemedText>
              <ThemedText style={styles.supportNumber}>1900-123-456</ThemedText>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>
          © 2025 Elder Care Connect
        </ThemedText>
        <ThemedText style={styles.footerSubtext}>
          Chăm sóc tận tâm, công nghệ hiện đại
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F9FD',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 36,
    paddingHorizontal: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  featuresContainer: {
    paddingTop: 28,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    color: '#12394A',
  },
  featuresGrid: {
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#68C2E8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  registerButton: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#68C2E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#68C2E8',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E0EDF5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  supportContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(104, 194, 232, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  supportTextContainer: {
    flex: 1,
  },
  supportLabel: {
    fontSize: 12,
    color: '#5B7C8E',
    marginBottom: 2,
  },
  supportNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#12394A',
  },
  footer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#7A96A6',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#9BADB8',
    textAlign: 'center',
  },
});