import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingsScreen() {
  // Notification Settings
  const [pushNotifications, setPushNotifications] = useState(true);

  // Privacy Settings
  const [showPhone, setShowPhone] = useState(false);
  const [showEmail, setShowEmail] = useState(true);

  // Security Settings
  const [biometricLogin, setBiometricLogin] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Notifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <MaterialCommunityIcons name="bell" size={20} color="#1F2937" />
            <Text style={styles.sectionTitle}>Thông báo</Text>
          </View>
          
          <View style={styles.settingCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Thông báo đẩy</Text>
                <Text style={styles.settingDesc}>Nhận thông báo trên thiết bị</Text>
              </View>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: "#D1D5DB", true: "#34D399" }}
                thumbColor={pushNotifications ? "#10B981" : "#f4f3f4"}
              />
            </View>

          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <MaterialCommunityIcons name="lock" size={20} color="#1F2937" />
            <Text style={styles.sectionTitle}>Quyền riêng tư</Text>
          </View>
          
          <View style={styles.settingCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Hiển thị số điện thoại</Text>
                <Text style={styles.settingDesc}>Cho phép xem số điện thoại</Text>
              </View>
              <Switch
                value={showPhone}
                onValueChange={setShowPhone}
                trackColor={{ false: "#D1D5DB", true: "#34D399" }}
                thumbColor={showPhone ? "#10B981" : "#f4f3f4"}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Hiển thị email</Text>
                <Text style={styles.settingDesc}>Cho phép xem địa chỉ email</Text>
              </View>
              <Switch
                value={showEmail}
                onValueChange={setShowEmail}
                trackColor={{ false: "#D1D5DB", true: "#34D399" }}
                thumbColor={showEmail ? "#10B981" : "#f4f3f4"}
              />
            </View>
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <MaterialCommunityIcons name="shield-check" size={20} color="#1F2937" />
            <Text style={styles.sectionTitle}>Bảo mật</Text>
          </View>
          
          <View style={styles.settingCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Đăng nhập sinh trắc học</Text>
                <Text style={styles.settingDesc}>Dùng vân tay/Face ID</Text>
              </View>
              <Switch
                value={biometricLogin}
                onValueChange={setBiometricLogin}
                trackColor={{ false: "#D1D5DB", true: "#34D399" }}
                thumbColor={biometricLogin ? "#10B981" : "#f4f3f4"}
              />
            </View>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Đổi mật khẩu</Text>
                <Text style={styles.settingDesc}>Cập nhật mật khẩu mới</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <MaterialCommunityIcons name="cog" size={20} color="#1F2937" />
            <Text style={styles.sectionTitle}>Ứng dụng</Text>
          </View>
          
          <View style={styles.settingCard}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Phiên bản</Text>
                <Text style={styles.settingDesc}>v1.0.0</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <MaterialCommunityIcons name="alert" size={20} color="#EF4444" />
            <Text style={[styles.sectionTitle, { color: "#EF4444" }]}>Vùng nguy hiểm</Text>
          </View>
          
          <View style={styles.settingCard}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, styles.dangerText]}>Xóa bộ nhớ cache</Text>
                <Text style={styles.settingDesc}>Giải phóng dung lượng</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#EF4444" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, styles.dangerText]}>Xóa tài khoản</Text>
                <Text style={styles.settingDesc}>Xóa vĩnh viễn tài khoản</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <CaregiverBottomNav activeTab="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  settingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 13,
    color: "#6B7280",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginLeft: 16,
  },
  dangerText: {
    color: "#EF4444",
  },
});
