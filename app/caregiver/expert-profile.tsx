// ExpertProfileScreen.js
import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const GENDER_OPTIONS = ["Nam", "Nữ"];
const EDUCATION_OPTIONS = [
  "Trung học cơ sở",
  "Trung học phổ thông",
  "Cao đẳng",
  "Đại học",
  "Sau đại học",
];

export default function ExpertProfileScreen() {
  const navigation = useNavigation<any>();
  
  // avatar & cccd images
  const [avatarUri, setAvatarUri] = useState(null);
  const [cccdFrontUri, setCccdFrontUri] = useState("https://via.placeholder.com/300x200?text=CCCD+Front"); // Mock data - will be replaced by API
  const [cccdBackUri, setCccdBackUri] = useState("https://via.placeholder.com/300x200?text=CCCD+Back"); // Mock data - will be replaced by API

  // basic info (non-editable)
  const [fullName] = useState("Lê Văn C"); // Not editable
  const [email, setEmail] = useState("caregiver2@gmail.com");

  // personal & contact
  const [dob, setDob] = useState(""); // mm/dd/yyyy
  const [gender, setGender] = useState("");
  const [showGenderModal, setShowGenderModal] = useState(false);

  const [idNumber] = useState("079203012345"); // Not editable - mock data
  const [phone, setPhone] = useState("");
  const [permanentAddress] = useState("123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM"); // Not editable - mock data
  const [temporaryAddress, setTemporaryAddress] = useState("");

  // career
  const [yearsExp, setYearsExp] = useState("0");
  const [workPlace, setWorkPlace] = useState("");
  const [education, setEducation] = useState("");
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [universityDegreeUri, setUniversityDegreeUri] = useState("https://via.placeholder.com/400x300?text=University+Degree"); // Mock data for university degree
  const [selfIntroduction, setSelfIntroduction] = useState("");

  // request permission for image picker
  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Quyền truy cập",
            "Cần quyền truy cập thư viện ảnh để tải lên ảnh."
          );
        }
      }
    })();
  }, []);

  const pickImage = async (setter) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.cancelled) {
        setter(result.uri);
      }
    } catch (err) {
      console.warn("ImagePicker error:", err);
    }
  };

  const takePhoto = async (setter) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Quyền camera", "Cần quyền camera để chụp ảnh.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });
      if (!result.cancelled) {
        setter(result.uri);
      }
    } catch (err) {
      console.warn("Camera error:", err);
    }
  };

  const onSave = () => {
    // TODO: call API to save profile
    const payload = {
      fullName, // Read-only
      email,
      dob,
      gender,
      idNumber, // Read-only
      phone,
      permanentAddress, // Read-only
      temporaryAddress,
      yearsExp,
      workPlace,
      education,
      selfIntroduction,
      avatarUri,
      cccdFrontUri, // Read-only
      cccdBackUri, // Read-only
      universityDegreeUri: education === "Đại học" || education === "Sau đại học" ? universityDegreeUri : null,
    };
    console.log("Save payload:", payload);
    Alert.alert("Lưu hồ sơ", "Thông tin đã được lưu (demo).");
  };

  const renderModalList = (data, onSelect) => (
    <FlatList
      data={data}
      keyExtractor={(i) => i}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.optionItem}
          onPress={() => {
            onSelect(item);
          }}
        >
          <Text style={styles.optionText}>{item}</Text>
        </TouchableOpacity>
      )}
      ItemSeparatorComponent={() => (
        <View style={{ height: 1, backgroundColor: "#eee" }} />
      )}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Avatar section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Ảnh đại diện</Text>
          <View style={styles.avatarRow}>
            <View style={styles.avatarWrapper}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderText}>Ảnh</Text>
                </View>
              )}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => pickImage(setAvatarUri)}
              >
                <Text style={styles.primaryBtnText}>Chọn ảnh mới</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.ghostBtn, { marginTop: 10 }]}
                onPress={() => takePhoto(setAvatarUri)}
              >
                <Text style={styles.ghostBtnText}>Chụp ảnh</Text>
              </TouchableOpacity>

              <Text style={styles.smallNote}>
                Chấp nhận: JPG, PNG (tối đa 5MB)
              </Text>
            </View>
          </View>
        </View>

        {/* 1. Basic info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>1. Thông tin cơ bản</Text>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Họ tên</Text>
              <TextInput
                value={fullName}
                placeholder="Họ tên"
                style={[styles.input, styles.disabledInput]}
                editable={false}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                keyboardType="email-address"
                style={styles.input}
              />
            </View>
          </View>
        </View>

        {/* 2. Personal info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            2. Thông tin cá nhân & liên hệ
          </Text>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Ngày sinh</Text>
              <TextInput
                placeholder="mm/dd/yyyy"
                value={dob}
                onChangeText={setDob}
                style={styles.input}
              />
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>Giới tính</Text>
              <TouchableOpacity
                style={[styles.input, { justifyContent: "center" }]}
                onPress={() => setShowGenderModal(true)}
              >
                <Text style={{ color: gender ? "#000" : "#9CA3AF" }}>
                  {gender || "Chọn giới tính"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Số CMND/CCCD</Text>
              <TextInput
                value={idNumber}
                placeholder="Số CMND/CCCD"
                style={[styles.input, styles.disabledInput]}
                editable={false}
              />
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>Số điện thoại</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="0123456789"
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>
          </View>

          <Text style={[styles.label, { marginTop: 8 }]}>
            Địa chỉ thường trú
          </Text>
          <TextInput
            value={permanentAddress}
            placeholder="Địa chỉ thường trú"
            style={[styles.input, { height: 80 }, styles.disabledInput]}
            multiline
            editable={false}
          />

          <Text style={[styles.label, { marginTop: 8 }]}>Địa chỉ tạm trú</Text>
          <TextInput
            value={temporaryAddress}
            onChangeText={setTemporaryAddress}
            placeholder="Địa chỉ tạm trú"
            style={[styles.input, { height: 80 }]}
            multiline
          />
        </View>

        {/* CCCD images */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Ảnh CCCD/CMND</Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={styles.cccdBlock}>
              <Text style={styles.smallLabel}>Ảnh CCCD mặt trước</Text>
              <View style={styles.cccdPicker}>
                {cccdFrontUri ? (
                  <Image
                    source={{ uri: cccdFrontUri }}
                    style={styles.cccdPreview}
                  />
                ) : (
                  <Text style={styles.cccdPlaceholder}>
                    Chưa có ảnh CCCD mặt trước
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.cccdBlock}>
              <Text style={styles.smallLabel}>Ảnh CCCD mặt sau</Text>
              <View style={styles.cccdPicker}>
                {cccdBackUri ? (
                  <Image
                    source={{ uri: cccdBackUri }}
                    style={styles.cccdPreview}
                  />
                ) : (
                  <Text style={styles.cccdPlaceholder}>
                    Chưa có ảnh CCCD mặt sau
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* 3. Career info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>3. Thông tin nghề nghiệp</Text>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Số năm kinh nghiệm</Text>
              <TextInput
                value={yearsExp}
                onChangeText={setYearsExp}
                placeholder="0"
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>Nơi từng làm việc</Text>
              <TextInput
                value={workPlace}
                onChangeText={setWorkPlace}
                placeholder="Nơi từng làm việc"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Học vấn</Text>
              <TouchableOpacity
                style={[styles.input, { justifyContent: "center" }]}
                onPress={() => setShowEducationModal(true)}
              >
                <Text style={{ color: education ? "#000" : "#9CA3AF" }}>
                  {education || "Chọn trình độ"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ width: 12 }} />
          </View>

          {/* University Degree Image - only for Đại học and Sau đại học */}
          {(education === "Đại học" || education === "Sau đại học") && (
            <>
              <Text style={[styles.label, { marginTop: 8 }]}>
                Bằng đại học
              </Text>
              <View style={styles.degreeImageContainer}>
                {universityDegreeUri ? (
                  <Image
                    source={{ uri: universityDegreeUri }}
                    style={styles.degreeImage}
                  />
                ) : (
                  <Text style={styles.cccdPlaceholder}>
                    Chưa có ảnh bằng đại học
                  </Text>
                )}
              </View>
            </>
          )}

          <Text style={[styles.label, { marginTop: 8 }]}>
            Chứng chỉ và kỹ năng
          </Text>
          <TouchableOpacity
            style={styles.linkCard}
            onPress={() => navigation.navigate("Chứng chỉ và kỹ năng")}
          >
            <View style={styles.linkCardContent}>
              <MaterialCommunityIcons name="certificate" size={20} color="#2563EB" />
              <Text style={styles.linkCardText}>
                Quản lý chứng chỉ và kỹ năng
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          <Text style={[styles.label, { marginTop: 12 }]}>
            Giới thiệu bản thân
          </Text>
          <TextInput
            value={selfIntroduction}
            onChangeText={setSelfIntroduction}
            placeholder="Viết một đoạn ngắn giới thiệu về bản thân, kinh nghiệm và điểm mạnh của bạn..."
            style={[styles.input, { height: 100, textAlignVertical: "top", paddingTop: 10 }]}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Actions */}
        <View
          style={{
            paddingHorizontal: 16,
            marginTop: 16,
            marginBottom: 20,
            alignItems: "flex-end",
          }}
        >
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: "#10B981", paddingHorizontal: 32 }]}
            onPress={onSave}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Lưu</Text>
          </TouchableOpacity>
        </View>

        {/* Gender modal */}
        <Modal visible={showGenderModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Chọn giới tính</Text>
              {renderModalList(GENDER_OPTIONS, (val) => {
                setGender(val);
                setShowGenderModal(false);
              })}
              <TouchableOpacity
                onPress={() => setShowGenderModal(false)}
                style={styles.modalClose}
              >
                <Text style={{ color: "#2563EB", fontWeight: "700" }}>
                  Đóng
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Education modal */}
        <Modal visible={showEducationModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Chọn trình độ</Text>
              {renderModalList(EDUCATION_OPTIONS, (val) => {
                setEducation(val);
                setShowEducationModal(false);
              })}
              <TouchableOpacity
                onPress={() => setShowEducationModal(false)}
                style={styles.modalClose}
              >
                <Text style={{ color: "#2563EB", fontWeight: "700" }}>
                  Đóng
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
      
      {/* Bottom Navigation */}
      <CaregiverBottomNav activeTab="profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  sectionCard: {
    backgroundColor: "#fff",
    margin: 12,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EEF2F7",
  },
  sectionTitle: {
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 12,
    color: "#0F172A",
  },

  avatarRow: { flexDirection: "row", alignItems: "center" },
  avatarWrapper: {
    width: 84,
    height: 84,
    borderRadius: 42,
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: { width: 84, height: 84, resizeMode: "cover" },
  avatarPlaceholder: {
    width: 84,
    height: 84,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPlaceholderText: { color: "#94A3B8" },

  primaryBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  ghostBtn: {
    backgroundColor: "#F8FAFC",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E6EEF8",
  },
  ghostBtnText: { color: "#334155", fontWeight: "600" },
  smallNote: { marginTop: 8, color: "#9CA3AF", fontSize: 12 },

  row: { flexDirection: "row", marginBottom: 10 },
  label: { marginBottom: 6, color: "#334155", fontWeight: "600" },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E6EEF8",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 44,
  },
  disabledInput: {
    backgroundColor: "#F9FAFB",
    color: "#9CA3AF",
  },
  disabledNote: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "400",
  },
  linkCard: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  linkCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  linkCardText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  degreeImageContainer: {
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E6EEF8",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FCFCFD",
    overflow: "hidden",
  },
  degreeImage: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
  },

  cccdBlock: { width: "48%" },
  cccdPicker: {
    height: 110,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E6EEF8",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FCFCFD",
  },
  cccdPreview: {
    width: "100%",
    height: 110,
    borderRadius: 8,
    resizeMode: "cover",
  },
  cccdPlaceholder: {
    color: "#94A3B8",
    textAlign: "center",
    paddingHorizontal: 6,
  },
  cccdActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  ghostBtnSmall: {
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E6EEF8",
  },
  ghostBtnTextSmall: { color: "#334155", fontSize: 12 },

  noteBox: {
    marginTop: 10,
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E6EEF8",
    color: "#64748B",
  },

  smallLabel: { color: "#475569", fontWeight: "700", marginBottom: 6 },

  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: "50%",
  },
  modalTitle: { fontWeight: "700", fontSize: 16, marginBottom: 8 },
  optionItem: { paddingVertical: 12 },
  optionText: { fontSize: 15 },
  modalClose: { marginTop: 12, alignItems: "center" },

  // small helpers
  sectionLabel: { fontWeight: "700", marginTop: 12 },
});
