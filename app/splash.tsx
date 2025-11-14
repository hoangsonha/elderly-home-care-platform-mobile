import { approveCaregiver, deleteUserByEmail, getDatabase } from '@/services/database.service';
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  const [dbModalVisible, setDbModalVisible] = useState(false);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [dbData, setDbData] = useState<Record<string, any[]>>({});
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [approveUserName, setApproveUserName] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  // Fetch DB data helper (load all tables and rows)
  const fetchDbData = async () => {
    setDbError(null);
    try {
      const db = await getDatabase();
      if (!db) throw new Error('SQLite not available on this platform');

      // Get all user-defined tables
      const tablesRes = await db.getAllAsync<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
      );

      const tables = tablesRes?.map((r: any) => r.name) || [];
      const data: Record<string, any[]> = {};

      for (const t of tables) {
        try {
          // Try to select all rows; if table has created_at, order by it
          let rows = [] as any[];
          try {
            rows = await db.getAllAsync(`SELECT * FROM ${t} ORDER BY created_at DESC`);
          } catch {
            // Fallback to simple select if ordering fails
            rows = await db.getAllAsync(`SELECT * FROM ${t}`);
          }
          data[t] = rows || [];
        } catch (inner) {
          console.warn('Failed to read table', t, inner);
          data[t] = [];
        }
      }

      setDbData(data);
      // set selected table to first one if not selected
      if (!selectedTable && Object.keys(data).length > 0) setSelectedTable(Object.keys(data)[0]);
    } catch (err: any) {
      console.warn('DB fetch error', err);
      setDbError(String(err?.message || err));
    }
  };

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
                  index !== featureItems.length - 1 && { marginBottom: 10 },
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
          <TouchableOpacity
            style={styles.dbButton}
            onPress={async () => {
              setDbModalVisible(true);
              setDbLoading(true);
              setDbError(null);
              try {
                await fetchDbData();
              } finally {
                setDbLoading(false);
              }
            }}
          >
            <Text style={styles.dbButtonText}>Xem SQLite DB</Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.caption}>
          © 2025 Elder Care Connect. All rights reserved.
        </Text>
      </ScrollView>
      <Modal
        visible={dbModalVisible}
        animationType="slide"
        onRequestClose={() => setDbModalVisible(false)}
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>SQLite Database</Text>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <TouchableOpacity onPress={() => fetchDbData()}>
                <Text style={[styles.modalClose, { color: '#2c3e50' }]}>Tải lại</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setDbModalVisible(false)}>
                <Text style={styles.modalClose}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>

          {dbLoading ? (
            <View style={styles.modalBodyCenter}>
              <ActivityIndicator size="large" color="#68C2E8" />
              <Text style={{ marginTop: 12 }}>Đang tải dữ liệu...</Text>
            </View>
          ) : dbError ? (
            <View style={styles.modalBodyCenter}>
              <Text style={{ color: 'red' }}>{dbError}</Text>
            </View>
          ) : (
            <View style={styles.modalBody}>
              {/* Table selector */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }} contentContainerStyle={{ paddingHorizontal: 8 }}>
                {Object.keys(dbData).length === 0 ? (
                  <Text style={styles.emptyText}>Không có bảng dữ liệu</Text>
                ) : (
                  Object.keys(dbData).map((table) => (
                    <TouchableOpacity
                      key={table}
                      style={[
                        styles.tableButton,
                        selectedTable === table && styles.tableButtonSelected,
                      ]}
                      onPress={() => setSelectedTable(table)}
                    >
                      <Text style={[styles.tableButtonText, selectedTable === table && { color: '#FFFFFF' }]}>{table}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>

              {/* Selected table info */}
              {selectedTable ? (
                <View style={{ marginBottom: 8 }}>
                  <Text style={styles.sectionHeading}>{selectedTable} · {dbData[selectedTable]?.length ?? 0} hàng</Text>
                </View>
              ) : null}

              {/* Single FlatList to render the selected table rows */}
              {selectedTable ? (
                <>
                  {selectedTable === 'users' && (
                    <>
                      <View style={{ marginBottom: 12 }}>
                        <Text style={{ marginBottom: 8, fontWeight: '600' }}>Xóa user theo email</Text>
                        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                          <TextInput
                            value={deleteEmail}
                            onChangeText={setDeleteEmail}
                            placeholder="nhập email (ví dụ: c12@gmail.com)"
                            style={{ flex: 1, borderWidth: 1, borderColor: '#E6F2F9', borderRadius: 8, paddingHorizontal: 12, height: 44, backgroundColor: '#fff' }}
                            autoCapitalize="none"
                          />
                          <TouchableOpacity
                            style={{ paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#EF4444', borderRadius: 8 }}
                            onPress={async () => {
                              if (!deleteEmail) {
                                Alert.alert('Lỗi', 'Vui lòng nhập email cần xóa');
                                return;
                              }
                              Alert.alert(
                                'Xác nhận',
                                `Bạn có chắc muốn xóa user với email: ${deleteEmail}?`,
                                [
                                  { text: 'Hủy', style: 'cancel' },
                                  {
                                    text: 'Xóa',
                                    style: 'destructive',
                                    onPress: async () => {
                                      setIsDeleting(true);
                                      try {
                                        await deleteUserByEmail(deleteEmail);
                                        await fetchDbData();
                                        setDeleteEmail('');
                                        Alert.alert('Thành công', 'Đã xóa user nếu tồn tại');
                                      } catch (err) {
                                        console.warn('Delete user error', err);
                                        Alert.alert('Lỗi', 'Xóa user thất bại. Kiểm tra console để biết chi tiết.');
                                      } finally {
                                        setIsDeleting(false);
                                      }
                                    }
                                  }
                                ]
                              );
                            }}
                            disabled={isDeleting}
                          >
                            <Text style={{ color: '#fff', fontWeight: '700' }}>{isDeleting ? 'Đang xóa...' : 'Xóa'}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={{ marginBottom: 12 }}>
                        <Text style={{ marginBottom: 8, fontWeight: '600' }}>Duyệt profile Caregiver</Text>
                        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                          <TextInput
                            value={approveUserName}
                            onChangeText={setApproveUserName}
                            placeholder="Nhập tên (ví dụ: Trần Anh Tử)"
                            style={{ flex: 1, borderWidth: 1, borderColor: '#E6F2F9', borderRadius: 8, paddingHorizontal: 12, height: 44, backgroundColor: '#fff' }}
                          />
                          <TouchableOpacity
                            style={{ paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#10B981', borderRadius: 8 }}
                            onPress={async () => {
                              if (!approveUserName) {
                                Alert.alert('Lỗi', 'Vui lòng nhập tên người dùng');
                                return;
                              }
                              Alert.alert(
                                'Xác nhận',
                                `Duyệt profile cho: ${approveUserName}?`,
                                [
                                  { text: 'Hủy', style: 'cancel' },
                                  {
                                    text: 'Duyệt',
                                    onPress: async () => {
                                      setIsApproving(true);
                                      try {
                                        const result = await approveCaregiver(approveUserName);
                                        await fetchDbData();
                                        setApproveUserName('');
                                        Alert.alert('Thành công', `Đã duyệt profile cho ${result.userName}`);
                                      } catch (err: any) {
                                        console.error('Approve caregiver error', err);
                                        Alert.alert('Lỗi', err?.message || 'Duyệt profile thất bại');
                                      } finally {
                                        setIsApproving(false);
                                      }
                                    }
                                  }
                                ]
                              );
                            }}
                            disabled={isApproving}
                          >
                            <Text style={{ color: '#fff', fontWeight: '700' }}>{isApproving ? 'Đang duyệt...' : 'Duyệt'}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </>
                  )}

                  <FlatList
                    data={dbData[selectedTable] || []}
                    keyExtractor={(item, idx) => (item.id ? String(item.id) : String(idx))}
                    nestedScrollEnabled={true}
                    style={styles.list}
                    renderItem={({ item }) => (
                      <View style={styles.row}>
                        <Text style={styles.rowTitle}>{item.name ?? item.id ?? JSON.stringify(item)}</Text>
                        <Text style={styles.rowMeta}>{Object.keys(item).filter(k => k !== 'name' && k !== 'id').slice(0,3).map(k => `${k}: ${String(item[k])}`).join(' · ')}</Text>
                      </View>
                    )}
                    ListEmptyComponent={<Text style={styles.emptyText}>Bảng này rỗng</Text>}
                  />
                </>
              ) : (
                <Text style={styles.emptyText}>Chọn một bảng để xem chi tiết</Text>
              )}
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F9FD",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroWrapper: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  heroCard: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#5AB9E0",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  heroGradient: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 30,
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255, 255, 255, 0.85)",
    marginBottom: 20,
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
    fontSize: 18,
    fontWeight: "700",
  },
  statLabel: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },
  contentCard: {
    marginHorizontal: 24,
    marginTop: -24,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#A6D8EE",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  contentHeading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#12394A",
  },
  contentDescription: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: "#5B7C8E",
  },
  featureList: {
    marginTop: 16,
  },
  featureCard: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#F7FBFF",
    alignItems: "flex-start",
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(104, 194, 232, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#12394A",
    marginBottom: 3,
  },
  featureDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: "#5B7C8E",
  },
  actions: {
    marginTop: 20,
    marginHorizontal: 24,
  },
  primaryButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#68C2E8",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#68C2E8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#68C2E8",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonText: {
    color: "#12394A",
    fontSize: 16,
    fontWeight: "600",
  },
  caption: {
    marginTop: 16,
    textAlign: "center",
    color: "#7A96A6",
    fontSize: 11,
  },
  dbButton: {
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#68C2E8',
  },
  dbButtonText: {
    color: '#68C2E8',
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F7FBFF',
  },
  modalHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E6F2F9',
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#12394A',
  },
  modalClose: {
    color: '#68C2E8',
    fontWeight: '600',
  },
  modalBodyCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#12394A',
    marginTop: 8,
    marginBottom: 8,
  },
  row: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F6FA',
  },
  rowTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#12394A',
  },
  rowMeta: {
    fontSize: 12,
    color: '#5B7C8E',
    marginTop: 4,
  },
  emptyText: {
    paddingVertical: 12,
    color: '#7A96A6',
  },
  list: {
    maxHeight: 260,
    marginBottom: 12,
  },
  tableButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6F2F9',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 6,
  },
  tableButtonSelected: {
    backgroundColor: '#68C2E8',
    borderColor: '#68C2E8',
  },
  tableButtonText: {
    color: '#12394A',
    fontWeight: '700',
  },
});
