import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Types
interface MenuItem {
  id: string;
  icon: string;
  iconBg: string;
  title: string;
  subtitle?: string;
  badge?: string;
  isRed?: boolean;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

// Menu items data
const profileSections: MenuSection[] = [
  {
    title: "HỒ SƠ CHUYÊN NGHIỆP",
    items: [
      {
        id: "personal-info",
        icon: "account-circle",
        iconBg: "#E3F2FD",
        title: "Hồ sơ cá nhân",
        subtitle: "Thông tin cá nhân và liên hệ",
      },
      {
        id: "certificates",
        icon: "certificate",
        iconBg: "#FFF9E6",
        title: "Chứng chỉ & Bằng cấp",
        subtitle: "Quản lý chứng chỉ hành nghề",
      }
    ],
  },
  {
    title: "PHÁT TRIỂN NGHỀ NGHIỆP",
    items: [
      {
        id: "training",
        icon: "school",
        iconBg: "#FFF3E0",
        title: "Đào tạo",
        subtitle: "Khóa học và chứng chỉ",
      },
      {
        id: "reviews",
        icon: "star",
        iconBg: "#E1F5FE",
        title: "Đánh giá từ khách hàng",
        subtitle: "Xem đánh giá và phản hồi",
      },
    ],
  },
  {
    title: "HỖ TRỢ & CÀI ĐẶT",
    items: [
      {
        id: "support",
        icon: "lifebuoy",
        iconBg: "#FCE4EC",
        title: "Khiếu nại & Hỗ trợ",
        subtitle: "Báo cáo vấn đề và nhận trợ giúp",
      },
      {
        id: "settings",
        icon: "cog",
        iconBg: "#E8EAF6",
        title: "Cài đặt",
        subtitle: "Thông báo, bảo mật và quyền riêng tư",
      },
      {
        id: "logout",
        icon: "logout",
        iconBg: "#FFEBEE",
        title: "Đăng xuất",
        subtitle: "",
        isRed: true,
      },
    ],
  },
];

export default function PersonalScreen() {
  const navigation = useNavigation<any>();
  const { logout } = useAuth();

  const handleMenuPress = (itemId: string) => {
    console.log("Menu item pressed:", itemId);
    
    switch (itemId) {
      case "personal-info":
        navigation.navigate("Hồ sơ của bạn");
        break;
      case "certificates":
        navigation.navigate("Chứng chỉ và kỹ năng");
        break;
      case "training":
        navigation.navigate("Đào tạo");
        break;
      case "support":
        navigation.navigate("Câu hỏi thường gặp");
        break;
      case "settings":
        navigation.navigate("Cài đặt");
        break;
      case "logout":
        Alert.alert(
          "Xác nhận đăng xuất",
          "Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?",
          [
            { text: "Hủy", style: "cancel" },
            {
              text: "Đăng xuất",
              style: "destructive",
              onPress: () => {
                logout();
                router.replace("/(tabs)");
              },
            },
          ]
        );
        break;
      default:
        console.log("Menu item not implemented:", itemId);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons 
                name="account" 
                size={48} 
                color="#90A4AE" 
              />
            </View>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedIcon}>✓</Text>
            </View>
          </View>

          <Text style={styles.profileName}>Trần Văn Nam</Text>
          <Text style={styles.profileRole}>Người chăm sóc</Text>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.ratingScore}>4.9</Text>
            <Text style={styles.ratingCount}>(128 đánh giá)</Text>
          </View>

          {/* Verified Badge */}
          <View style={styles.verifiedTag}>
            <Text style={styles.verifiedText}>✓ Đã xác minh</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Lịch hẹn</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>8.5M</Text>
              <Text style={styles.statLabel}>Thu nhập</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>95%</Text>
              <Text style={styles.statLabel}>Hoàn thành</Text>
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        {profileSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  itemIndex === section.items.length - 1 && styles.menuItemLast,
                ]}
                onPress={() => handleMenuPress(item.id)}
              >
                <View style={styles.menuItemContent}>
                  <View style={[styles.menuIcon, { backgroundColor: item.iconBg }]}>
                    <MaterialCommunityIcons 
                      name={item.icon as any} 
                      size={24} 
                      color={item.isRed ? "#EF4444" : "#6B7280"} 
                    />
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text
                      style={[
                        styles.menuTitle,
                        item.isRed && styles.menuTitleRed,
                      ]}
                    >
                      {item.title}
                    </Text>
                    {item.subtitle && (
                      <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                    )}
                  </View>
                  {item.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                  <Text style={styles.menuArrow}>›</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Bottom spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <CaregiverBottomNav activeTab="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Profile Card
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    margin: 16,
    marginTop: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#CFD8DC",
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  verifiedIcon: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },

  // Rating
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  star: {
    fontSize: 18,
    marginHorizontal: 2,
  },
  ratingScore: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 8,
  },
  ratingCount: {
    fontSize: 13,
    color: "#6B7280",
    marginLeft: 4,
  },

  // Verified Tag
  verifiedTag: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 20,
  },
  verifiedText: {
    fontSize: 13,
    color: "#059669",
    fontWeight: "600",
  },

  // Stats
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3B82F6",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
  },

  // Menu Sections
  menuSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  menuItem: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  menuItemLast: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  menuTitleRed: {
    color: "#EF4444",
  },
  menuSubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  badge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#DC2626",
  },
  menuArrow: {
    fontSize: 24,
    color: "#D1D5DB",
    fontWeight: "300",
  },
});
