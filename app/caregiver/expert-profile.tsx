// ExpertProfileScreen.js
import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState, useCallback } from "react";
import {
  Alert,
  ActivityIndicator,
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
import { mainService } from "@/services/main.service";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { useAuth } from "@/contexts/AuthContext";

const GENDER_OPTIONS = ["Nam", "Nữ"];

export default function ExpertProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Get params from navigation
  const routeParams = route.params as any;
  const profileFromParams = routeParams?.profile;
  const parsedProfileDataFromParams = routeParams?.parsedProfileData;
  
  // avatar & cccd images
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [cccdFrontUri, setCccdFrontUri] = useState<string | null>(null);
  const [cccdBackUri, setCccdBackUri] = useState<string | null>(null);

  // basic info (non-editable)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  // personal & contact
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [showGenderModal, setShowGenderModal] = useState(false);

  const [idNumber, setIdNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [locationData, setLocationData] = useState<any>({});

  // career
  const [yearsExp, setYearsExp] = useState("");
  const [selfIntroduction, setSelfIntroduction] = useState("");

  // Load profile data
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      
      // Nếu có params từ navigation, dùng params thay vì gọi API
      if (profileFromParams) {
        console.log('=== USING PARAMS FROM NAVIGATION ===');
        console.log('profileFromParams:', JSON.stringify(profileFromParams, null, 2));
        console.log('parsedProfileDataFromParams:', JSON.stringify(parsedProfileDataFromParams, null, 2));
        
        const profile = profileFromParams;
        
        // Basic info
        setFullName(profile.fullName || user?.name || "");
        setEmail(profile.email || user?.email || "");
        
        // Avatar
        if (profile.avatarUrl) {
          setAvatarUri(profile.avatarUrl);
        }
        
        // Personal info
        if (profile.birthDate) {
          // Format date from API (yyyy-MM-dd) to year only
          const date = new Date(profile.birthDate);
          const year = date.getFullYear();
          setDob(year.toString());
        }
        
        // Log params để debug
        console.log('=== PROFILE DATA FROM PARAMS ===');
        console.log('Full profile (from params):', JSON.stringify(profile, null, 2));
        console.log('profileData (raw):', profile.profileData);
        console.log('location (raw):', profile.location);
        
        setGender(profile.gender === 'MALE' ? 'Nam' : profile.gender === 'FEMALE' ? 'Nữ' : '');
        setPhone(profile.phoneNumber || "");
        
        // Parse location
        let locationDataParsed: any = {};
        if (profile.location) {
          try {
            locationDataParsed = typeof profile.location === 'string' 
              ? JSON.parse(profile.location) 
              : profile.location;
          } catch (e) {
            // If parse fails, use as is
            locationDataParsed = profile.location;
          }
        }
        setLocationData(locationDataParsed);
        
        // Parse profileData
        let profileData: any = {};
        if (profile.profileData) {
          try {
            profileData = typeof profile.profileData === 'string' 
              ? JSON.parse(profile.profileData) 
              : profile.profileData;
          } catch (e) {
            profileData = {};
          }
        }
        
        // Log parsed profileData
        console.log('=== PARSED PROFILE DATA ===');
        console.log('profileData:', JSON.stringify(profileData, null, 2));
        console.log('profileData keys:', Object.keys(profileData));
        
        // Career info
        setYearsExp(profileData.years_experience?.toString() || "");
        setSelfIntroduction(profile.bio || "");
        
        // CCCD images - map từ profileData
        if (profileData.citizen_id_front_image_url) {
          setCccdFrontUri(profileData.citizen_id_front_image_url);
        } else if (profileData.citizenIdFrontImage) {
          setCccdFrontUri(profileData.citizenIdFrontImage);
        }
        
        if (profileData.citizen_id_back_image_url) {
          setCccdBackUri(profileData.citizen_id_back_image_url);
        } else if (profileData.citizenIdBackImage) {
          setCccdBackUri(profileData.citizenIdBackImage);
        }
        
        // ID Number - map từ profileData
        if (profileData.citizen_id) {
          setIdNumber(profileData.citizen_id);
        } else if (profileData.idNumber || profileData.id_number) {
          setIdNumber(profileData.idNumber || profileData.id_number || "");
        }
        
        // Log all mapped fields
        console.log('=== MAPPED FIELDS ===');
        console.log('fullName:', profile.fullName);
        console.log('email:', profile.email);
        console.log('birthDate (year):', dob);
        console.log('gender:', profile.gender);
        console.log('phone:', profile.phoneNumber);
        console.log('location (latitude, longitude):', locationData.latitude, locationData.longitude);
        console.log('yearsExp:', profileData.years_experience);
        console.log('selfIntroduction (bio):', profile.bio);
        console.log('idNumber (citizen_id):', profileData.citizen_id || profileData.idNumber || profileData.id_number);
        console.log('cccdFrontUri:', profileData.citizen_id_front_image_url || profileData.citizenIdFrontImage);
        console.log('cccdBackUri:', profileData.citizen_id_back_image_url || profileData.citizenIdBackImage);
        
        setLoading(false);
        return;
      }
      
      // Nếu không có params, gọi API
      console.log('=== CALLING API (NO PARAMS) ===');
      const response = await mainService.getCaregiverProfile();
      
      if (response.status === 'Success' && response.data) {
        const profile = response.data;
        
        // Basic info
        setFullName(profile.fullName || user?.name || "");
        setEmail(profile.email || user?.email || "");
        
        // Avatar
        if (profile.avatarUrl) {
          setAvatarUri(profile.avatarUrl);
        }
        
        // Personal info
        if (profile.birthDate) {
          const date = new Date(profile.birthDate);
          const year = date.getFullYear();
          setDob(year.toString());
        }
        
        setGender(profile.gender === 'MALE' ? 'Nam' : profile.gender === 'FEMALE' ? 'Nữ' : '');
        setPhone(profile.phoneNumber || "");
        
        // Parse location
        let locationDataParsed: any = {};
        if (profile.location) {
          try {
            locationDataParsed = typeof profile.location === 'string' 
              ? JSON.parse(profile.location) 
              : profile.location;
          } catch (e) {
            locationDataParsed = profile.location;
          }
        }
        setLocationData(locationDataParsed);
        
        // Parse profileData
        let profileData: any = {};
        if (profile.profileData) {
          try {
            profileData = typeof profile.profileData === 'string' 
              ? JSON.parse(profile.profileData) 
              : profile.profileData;
          } catch (e) {
            profileData = {};
          }
        }
        
        // Career info
        setYearsExp(profileData.years_experience?.toString() || "");
        // Không cần set workPlace và education nữa
        setSelfIntroduction(profile.bio || "");
        
        // CCCD images - map từ profileData
        if (profileData.citizen_id_front_image_url) {
          setCccdFrontUri(profileData.citizen_id_front_image_url);
        } else if (profileData.citizenIdFrontImage) {
          setCccdFrontUri(profileData.citizenIdFrontImage);
        }
        
        if (profileData.citizen_id_back_image_url) {
          setCccdBackUri(profileData.citizen_id_back_image_url);
        } else if (profileData.citizenIdBackImage) {
          setCccdBackUri(profileData.citizenIdBackImage);
        }
        
        // ID Number - map từ profileData
        if (profileData.citizen_id) {
          setIdNumber(profileData.citizen_id);
        } else if (profileData.idNumber || profileData.id_number) {
          setIdNumber(profileData.idNumber || profileData.id_number || "");
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert("Lỗi", "Không thể tải thông tin hồ sơ");
    } finally {
      setLoading(false);
    }
  }, [user, profileFromParams, parsedProfileDataFromParams]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={{ marginTop: 12, color: '#6B7280' }}>Đang tải thông tin...</Text>
        </View>
        <CaregiverBottomNav activeTab="profile" />
      </SafeAreaView>
    );
  }

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
      yearsExp,
      selfIntroduction,
      avatarUri,
      cccdFrontUri, // Read-only
      cccdBackUri, // Read-only
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
              <Text style={styles.label}>Năm sinh</Text>
              <TextInput
                placeholder="yyyy"
                value={dob}
                onChangeText={setDob}
                keyboardType="numeric"
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

          <Text style={[styles.label, { marginTop: 8 }]}>Tọa độ</Text>
          <TextInput
            value={locationData.latitude && locationData.longitude 
              ? `${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}`
              : "Chưa có tọa độ"}
            placeholder="Tọa độ"
            style={[styles.input, styles.disabledInput]}
            editable={false}
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
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Số năm kinh nghiệm</Text>
              <TextInput
                value={yearsExp}
                onChangeText={setYearsExp}
                placeholder="0"
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
          </View>

          <Text style={[styles.label, { marginTop: 8 }]}>
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
