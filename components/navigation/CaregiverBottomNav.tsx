import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CaregiverBottomNavProps {
  activeTab?: "home" | "jobs" | "schedule" | "income" | "profile";
}

export default function CaregiverBottomNav({ activeTab }: CaregiverBottomNavProps) {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity 
        style={[styles.navItem, activeTab === "home" && styles.navItemActive]}
        onPress={() => navigation.navigate("Trang chủ")}
      >
        <View style={[styles.iconContainer, activeTab === "home" && styles.iconContainerActive]}>
          <MaterialCommunityIcons 
            name="home" 
            size={24} 
            color={activeTab === "home" ? "#2196F3" : "#78909C"} 
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
            color={activeTab === "jobs" ? "#2196F3" : "#78909C"} 
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
            color={activeTab === "schedule" ? "#2196F3" : "#78909C"} 
          />
        </View>
        <Text style={activeTab === "schedule" ? styles.navLabelActive : styles.navLabel}>Lịch</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.navItem, activeTab === "income" && styles.navItemActive]}
        onPress={() => navigation.navigate("Thanh toán")}
      >
        <View style={[styles.iconContainer, activeTab === "income" && styles.iconContainerActive]}>
          <MaterialCommunityIcons 
            name="cash" 
            size={24} 
            color={activeTab === "income" ? "#2196F3" : "#78909C"} 
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
            color={activeTab === "profile" ? "#2196F3" : "#78909C"} 
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
    borderTopWidth: 1,
    borderTopColor: "#E3F2FD",
    paddingVertical: 8,
    paddingHorizontal: 4,
    paddingBottom: 20,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: "#2196F3",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
  },
  navItemActive: {
    transform: [{ scale: 1.05 }],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: -2,
  },
  iconContainerActive: {
    backgroundColor: "#E3F2FD",
  },
  navLabel: {
    fontSize: 11,
    color: "#78909C",
    fontWeight: "500",
  },
  navLabelActive: {
    fontSize: 11,
    color: "#2196F3",
    fontWeight: "700",
  },
});
