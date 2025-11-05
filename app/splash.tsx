import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const featureItems = [
  {
    icon: "heart-circle",
    title: "Chăm sóc cá nhân hóa",
    description:
      "Kết nối điều dưỡng phù hợp với nhu cầu và lịch trình của gia đình bạn.",
  },
  {
    icon: "calendar",
    title: "Giám sát minh bạch",
    description:
      "Theo dõi tiến trình, lịch hẹn và thông tin sức khỏe được cập nhật liên tục.",
  },
  {
    icon: "chatbubbles",
    title: "Hỗ trợ 24/7",
    description:
      "Liên hệ đội ngũ hỗ trợ hoặc trò chuyện cùng người chăm sóc bất cứ lúc nào.",
  },
];

const stats = [
  { value: "500+", label: "Chuyên gia chăm sóc" },
  { value: "1.5K", label: "Gia đình tin dùng" },
  { value: "24/7", label: "Giám sát & hỗ trợ" },
];

export default function SplashScreen() {
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroTranslate = useRef(new Animated.Value(16)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(heroTranslate, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 500,
      delay: 200,
      useNativeDriver: true,
    }).start();
  }, [contentOpacity, heroOpacity, heroTranslate]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroWrapper}>
          <Animated.View
            style={[
              styles.heroCard,
              {
                opacity: heroOpacity,
                transform: [{ translateY: heroTranslate }],
              },
            ]}
          >
            <LinearGradient
              colors={["#68C2E8", "#5AB9E0"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <View style={styles.logoBadge}>
                <Ionicons name="heart" size={36} color="#FFFFFF" />
              </View>

              <Text style={styles.heroTitle}>
                Chăm sóc tận tâm cho người thân yêu
              </Text>
              <Text style={styles.heroSubtitle}>
                Nền tảng quản lý chăm sóc người cao tuổi hiện đại, đồng bộ với
                toàn bộ hệ thống Elder Care Connect.
              </Text>

              <View style={styles.statRow}>
                {stats.map((item) => (
                  <View key={item.label} style={styles.statItem}>
                    <Text style={styles.statValue}>{item.value}</Text>
                    <Text style={styles.statLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </Animated.View>
        </View>

        <Animated.View style={[styles.contentCard, { opacity: contentOpacity }]}>
          <Text style={styles.contentHeading}>Trải nghiệm liền mạch</Text>
          <Text style={styles.contentDescription}>
            Mọi tiện ích từ đặt lịch, theo dõi, đến tương tác đều được thiết kế
            thống nhất, giúp gia đình bạn dễ dàng quản lý và an tâm hơn mỗi ngày.
          </Text>

          <View style={styles.featureList}>
            {featureItems.map((feature, index) => (
              <View
                key={feature.title}
                style={[
                  styles.featureCard,
                  index !== featureItems.length - 1 && { marginBottom: 16 },
                ]}
              >
                <View style={styles.featureIcon}>
                  <Ionicons
                    name={feature.icon as keyof typeof Ionicons.glyphMap}
                    size={22}
                    color="#68C2E8"
                  />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>
                    {feature.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View style={[styles.actions, { opacity: contentOpacity }]}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.primaryButtonText}>Đăng nhập</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/register")}
          >
            <Text style={styles.secondaryButtonText}>Tạo tài khoản mới</Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.caption}>
          © 2025 Elder Care Connect. All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F9FD",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroWrapper: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  heroCard: {
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#5AB9E0",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
  },
  heroGradient: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 34,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(255, 255, 255, 0.85)",
    marginBottom: 28,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  statLabel: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
  },
  contentCard: {
    marginHorizontal: 24,
    marginTop: -32,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#A6D8EE",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
  },
  contentHeading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#12394A",
  },
  contentDescription: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#5B7C8E",
  },
  featureList: {
    marginTop: 24,
  },
  featureCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#F7FBFF",
    alignItems: "flex-start",
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(104, 194, 232, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#12394A",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: "#5B7C8E",
  },
  actions: {
    marginTop: 32,
    marginHorizontal: 24,
  },
  primaryButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: "#68C2E8",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#68C2E8",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 14,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#68C2E8",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonText: {
    color: "#12394A",
    fontSize: 16,
    fontWeight: "600",
  },
  caption: {
    marginTop: 28,
    textAlign: "center",
    color: "#7A96A6",
    fontSize: 12,
  },
});
