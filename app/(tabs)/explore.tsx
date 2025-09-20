import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function ExploreScreen() {
  const features = [
    {
      id: '1',
      title: 'Tìm người chăm sóc',
      description: 'Kết nối với những người chăm sóc chuyên nghiệp, có kinh nghiệm',
      icon: 'people',
      color: '#4ECDC4',
    },
    {
      id: '2',
      title: 'Chăm sóc 24/7',
      description: 'Dịch vụ chăm sóc liên tục, đảm bảo an toàn cho người thân',
      icon: 'shield-checkmark',
      color: '#FF6B6B',
    },
    {
      id: '3',
      title: 'Theo dõi sức khỏe',
      description: 'Giám sát tình trạng sức khỏe và báo cáo định kỳ',
      icon: 'heart-pulse',
      color: '#FECA57',
    },
    {
      id: '4',
      title: 'Gia đình kết nối',
      description: 'Tạo nhóm gia đình để cùng chăm sóc người thân',
      icon: 'home',
      color: '#A8E6CF',
    },
  ];

  const testimonials = [
    {
      id: '1',
      name: 'Chị Nguyễn Thị Lan',
      role: 'Con gái',
      content: 'App này giúp tôi yên tâm hơn khi không thể ở bên mẹ 24/7. Người chăm sóc rất tận tâm.',
      rating: 5,
    },
    {
      id: '2',
      name: 'Anh Trần Văn Nam',
      role: 'Con trai',
      content: 'Dịch vụ chuyên nghiệp, giá cả hợp lý. Gia đình tôi rất hài lòng.',
      rating: 5,
    },
    {
      id: '3',
      name: 'Cô Lê Thị Bình',
      role: 'Người dùng',
      content: 'Tôi có thể theo dõi tình trạng sức khỏe của bố mẹ mọi lúc mọi nơi.',
      rating: 5,
    },
  ];

  const renderFeature = (feature: any) => (
    <View key={feature.id} style={styles.featureCard}>
      <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
        <Ionicons name={feature.icon as any} size={32} color={feature.color} />
      </View>
      <ThemedText style={styles.featureTitle}>{feature.title}</ThemedText>
      <ThemedText style={styles.featureDescription}>{feature.description}</ThemedText>
    </View>
  );

  const renderTestimonial = (testimonial: any) => (
    <View key={testimonial.id} style={styles.testimonialCard}>
      <View style={styles.testimonialHeader}>
        <View style={styles.testimonialInfo}>
          <ThemedText style={styles.testimonialName}>{testimonial.name}</ThemedText>
          <ThemedText style={styles.testimonialRole}>{testimonial.role}</ThemedText>
        </View>
        <View style={styles.ratingContainer}>
          {[...Array(testimonial.rating)].map((_, index) => (
            <Ionicons key={index} name="star" size={16} color="#FFD93D" />
          ))}
        </View>
      </View>
      <ThemedText style={styles.testimonialContent}>"{testimonial.content}"</ThemedText>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Khám phá dịch vụ</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Tìm hiểu về các tính năng và dịch vụ chăm sóc người già
        </ThemedText>
      </View>

      {/* Features Section */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Tính năng nổi bật</ThemedText>
        <View style={styles.featuresGrid}>
          {features.map(renderFeature)}
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <ThemedText style={styles.sectionTitle}>Thống kê nền tảng</ThemedText>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={24} color="#4ECDC4" />
            <ThemedText style={styles.statNumber}>1000+</ThemedText>
            <ThemedText style={styles.statLabel}>Người chăm sóc</ThemedText>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="home" size={24} color="#FF6B6B" />
            <ThemedText style={styles.statNumber}>500+</ThemedText>
            <ThemedText style={styles.statLabel}>Gia đình tin tưởng</ThemedText>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star" size={24} color="#FFD93D" />
            <ThemedText style={styles.statNumber}>4.9</ThemedText>
            <ThemedText style={styles.statLabel}>Đánh giá trung bình</ThemedText>
          </View>
        </View>
      </View>

      {/* Testimonials Section */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Khách hàng nói gì</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.testimonialsScroll}>
          {testimonials.map(renderTestimonial)}
        </ScrollView>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <View style={styles.ctaCard}>
          <Ionicons name="rocket" size={48} color="#4ECDC4" />
          <ThemedText style={styles.ctaTitle}>Sẵn sàng bắt đầu?</ThemedText>
          <ThemedText style={styles.ctaDescription}>
            Đăng ký ngay để trải nghiệm dịch vụ chăm sóc người già tốt nhất
          </ThemedText>
          <TouchableOpacity style={styles.ctaButton}>
            <ThemedText style={styles.ctaButtonText}>Đăng ký ngay</ThemedText>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: (width - 56) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
  statsSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  testimonialsScroll: {
    marginTop: 10,
  },
  testimonialCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
    width: width * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testimonialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  testimonialInfo: {
    flex: 1,
  },
  testimonialName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  testimonialRole: {
    fontSize: 14,
    color: '#6c757d',
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  testimonialContent: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  ctaSection: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  ctaCard: {
    backgroundColor: '#4ECDC4',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 12,
  },
  ctaDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  ctaButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 32,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  bottomSpacing: {
    height: 20,
  },
});
