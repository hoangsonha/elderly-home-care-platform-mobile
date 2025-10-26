import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CertificatesScreen() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [form, setForm] = useState({
    name: "",
    date: "",
    organization: "",
    type: "",
    image: null,
  });

  const handleAdd = () => {
    if (!form.name || !form.date) return;
    setCertificates([...certificates, form]);
    setModalVisible(false);
    setForm({ name: "", date: "", organization: "", type: "", image: null });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Chứng chỉ & Kỹ năng</Text>
      <Text style={styles.subHeader}>
        Quản lý chứng chỉ đã được duyệt. Chứng chỉ mới sẽ chờ admin xét duyệt.
      </Text>

      {/* Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialCommunityIcons
              name="certificate-outline"
              size={22}
              color="#009688"
            />
            <Text style={styles.cardTitle}> Chứng chỉ</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <MaterialCommunityIcons name="plus" size={18} color="#fff" />
            <Text style={styles.addText}>Thêm</Text>
          </TouchableOpacity>
        </View>

        {certificates.length === 0 ? (
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons
              name="certificate-outline"
              size={40}
              color="#80CBC4"
            />
            <Text style={styles.emptyText}>Chưa có chứng chỉ nào</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text style={styles.linkText}>Thêm chứng chỉ đầu tiên</Text>
            </TouchableOpacity>
          </View>
        ) : (
          certificates.map((c, i) => (
            <View key={i} style={styles.item}>
              <Text style={styles.itemText}>{c.name}</Text>
              <Text style={styles.itemSub}>{c.organization}</Text>
            </View>
          ))
        )}
      </View>

      {/* Modal thêm chứng chỉ */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Thêm chứng chỉ mới</Text>

            <TextInput
              placeholder="Tên chứng chỉ"
              value={form.name}
              onChangeText={(t) => setForm({ ...form, name: t })}
              style={styles.input}
            />
            <TextInput
              placeholder="Ngày cấp (mm/dd/yyyy)"
              value={form.date}
              onChangeText={(t) => setForm({ ...form, date: t })}
              style={styles.input}
            />
            <TextInput
              placeholder="Tổ chức cấp chứng chỉ"
              value={form.organization}
              onChangeText={(t) => setForm({ ...form, organization: t })}
              style={styles.input}
            />
            <TextInput
              placeholder="Loại chứng chỉ"
              value={form.type}
              onChangeText={(t) => setForm({ ...form, type: t })}
              style={styles.input}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
                <Text style={{ color: "#fff" }}>Lưu</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: "#ccc" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FC", padding: 16 },
  header: { fontSize: 22, fontWeight: "700", color: "#000" },
  subHeader: { fontSize: 14, color: "#555", marginBottom: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#333" },
  addButton: {
    backgroundColor: "#009688",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addText: { color: "#fff", fontWeight: "600", marginLeft: 4 },
  emptyBox: {
    alignItems: "center",
    marginTop: 20,
  },
  emptyText: { color: "#555", marginTop: 8 },
  linkText: { color: "#00796B", fontWeight: "600", marginTop: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  saveBtn: {
    backgroundColor: "#4ECDC4",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  item: {
    backgroundColor: "#E0F2F1",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  itemText: { fontWeight: "600", color: "#004D40" },
  itemSub: { color: "#555", fontSize: 13 },
});
