import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CaregiverBottomNavProps {
  activeTab?: "home" | "jobs" | "schedule" | "income" | "profile";
}

export default function CaregiverBottomNav({ activeTab }: CaregiverBottomNavProps) {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.bottomNav,
      { paddingBottom: Math.max(insets.bottom, 8) + 12 } // Tự động điều chỉnh theo safe area
    ]}>
      <TouchableOpacity
        style={[styles.navItem, activeTab === "home" && styles.navItemActive]}
        onPress={() => navigation.navigate("Trang chủ")}
      >
        <View style={[styles.iconContainer, activeTab === "home" && styles.iconContainerActive]}>
          <MaterialCommunityIcons
            name="home"
            size={24}
            color={activeTab === "home" ? "#FFFFFF" : "#9CA3AF"}
          />
        </View>
        <Text style={activeTab === "home" ? styles.navLabelActive : styles.navLabel}>Trang chủ</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeTab === "jobs" && styles.navItemActive]}
        onPress={() => navigation.navigate("Yêu cầu dịch vụ")}
      >
        <View style={[styles.iconContainer, activeTab === "jobs" && styles.iconContainerActive]}>
          <MaterialCommunityIcons
            name="clipboard-text"
            size={24}
            color={activeTab === "jobs" ? "#FFFFFF" : "#9CA3AF"}
          />
        </View>
        <Text style={activeTab === "jobs" ? styles.navLabelActive : styles.navLabel}>Yêu cầu</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeTab === "schedule" && styles.navItemActive]}
        onPress={() => navigation.navigate("Quản lý lịch")}
      >
        <View style={[styles.iconContainer, activeTab === "schedule" && styles.iconContainerActive]}>
          <MaterialCommunityIcons
            name="calendar-month"
            size={24}
            color={activeTab === "schedule" ? "#FFFFFF" : "#9CA3AF"}
          />
        </View>
        <Text style={activeTab === "schedule" ? styles.navLabelActive : styles.navLabel}>Lịch</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeTab === "income" && styles.navItemActive]}
        onPress={() => navigation.navigate("Thu nhập")}
      >
        <View style={[styles.iconContainer, activeTab === "income" && styles.iconContainerActive]}>
          <MaterialCommunityIcons
            name="cash"
            size={24}
            color={activeTab === "income" ? "#FFFFFF" : "#9CA3AF"}
          />
        </View>
        <Text style={activeTab === "income" ? styles.navLabelActive : styles.navLabel}>Thu nhập</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeTab === "profile" && styles.navItemActive]}
        onPress={() => navigation.navigate("Cá nhân")}
      >
        <View style={[styles.iconContainer, activeTab === "profile" && styles.iconContainerActive]}>
          <MaterialCommunityIcons
            name="account"
            size={24}
            color={activeTab === "profile" ? "#FFFFFF" : "#9CA3AF"}
          />
        </View>
        <Text style={activeTab === "profile" ? styles.navLabelActive : styles.navLabel}>Cá nhân</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0,
    paddingVertical: 8,
    paddingHorizontal: 8,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 2,
  },
  navItemActive: {
    transform: [{ scale: 1.05 }],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
    overflow: 'hidden',
  },
  iconContainerActive: {
    backgroundColor: "#68C2E8",
    borderRadius: 24,
    shadowColor: "#68C2E8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  navLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  navLabelActive: {
    fontSize: 11,
    color: "#68C2E8",
    fontWeight: "700",
  },
});
