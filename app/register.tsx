import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/contexts/AuthContext";
import {
  useErrorNotification,
  useSuccessNotification,
} from "@/contexts/NotificationContext";
import { AccountService } from "@/services/account.service";

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    userType: "care-seeker",
  });

  const [otp, setOtp] = useState("");
  const [isOtpStage, setIsOtpStage] = useState(false);

  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { showSuccessTooltip } = useSuccessNotification();
  const { showErrorTooltip } = useErrorNotification();
  const { login } = useAuth();

  // -------------------------------------------------------
  // VALIDATE MẬT KHẨU
  // -------------------------------------------------------
  const validatePassword = () => {
    if (!formData.password) {
      setPasswordError("Vui lòng nhập mật khẩu");
      return false;
    }
    if (formData.password.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }
    if (!formData.confirmPassword) {
      setPasswordError("Vui lòng xác nhận mật khẩu");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không khớp");
      return false;
    }
    setPasswordError("");
    return true;
  };

  // -------------------------------------------------------
  // GỬI ĐĂNG KÝ → BACKEND TRẢ OTP
  // -------------------------------------------------------
  const handleRegister = async () => {
    if (!formData.email) {
      showErrorTooltip("Vui lòng nhập email");
      return;
    }

    if (!validatePassword()) return;

    setIsLoading(true);
    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        role: "ROLE_CAREGIVER", // tuỳ backend
      };

      await AccountService.register(payload);

      showSuccessTooltip("🎉 Mã OTP đã gửi đến email!");
      setIsOtpStage(true); // => Bật phần nhập OTP
    } catch (e: any) {
      console.log("Register error:", e);
      showErrorTooltip(e?.message || "Không thể đăng ký. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------
  // XÁC MINH OTP
  // -------------------------------------------------------
  const handleVerify = async () => {
    if (!otp) {
      showErrorTooltip("Vui lòng nhập mã OTP!");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        email: formData.email,
        verificationCode: otp,
      };

      await AccountService.verifyEmail(payload);
      showSuccessTooltip("🎉 Xác minh thành công!");

      // Auto login
      const userData = await login(formData.email, formData.password);

      if (formData.userType === "caregiver") {
        router.push("/caregiver/complete-profile");
      } else {
        router.replace("/");
      }
    } catch (e: any) {
      console.log("Verify error:", e);
      showErrorTooltip("Mã OTP không đúng hoặc đã hết hạn!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#667eea" />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Đăng ký tài khoản</ThemedText>
      </View>

      <View style={styles.content}>
        <View style={styles.form}>
          {/* ================== FORM ĐĂNG KÝ ================== */}
          {!isOtpStage && (
            <>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Email *</ThemedText>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(t) => setFormData({ ...formData, email: t })}
                  placeholder="Nhập email"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Mật khẩu *</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    passwordError ? styles.inputError : null,
                  ]}
                  value={formData.password}
                  onChangeText={(t) => {
                    setFormData({ ...formData, password: t });
                    if (passwordError) setPasswordError("");
                  }}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor="#999"
                  secureTextEntry
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>
                  Xác nhận mật khẩu *
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    passwordError ? styles.inputError : null,
                  ]}
                  value={formData.confirmPassword}
                  onChangeText={(t) => {
                    setFormData({ ...formData, confirmPassword: t });
                    if (passwordError) setPasswordError("");
                  }}
                  placeholder="Nhập lại mật khẩu"
                  placeholderTextColor="#999"
                  secureTextEntry
                />
                {passwordError && (
                  <ThemedText style={styles.errorText}>
                    {passwordError}
                  </ThemedText>
                )}
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <ThemedText style={styles.submitButtonText}>
                  {isLoading ? "Đang xử lý..." : "Đăng ký"}
                </ThemedText>
              </TouchableOpacity>
            </>
          )}

          {/* ================== FORM XÁC MINH OTP ================== */}
          {isOtpStage && (
            <>
              <ThemedText style={styles.label}>
                Nhập mã OTP đã gửi đến email {formData.email}
              </ThemedText>

              <TextInput
                style={styles.input}
                value={otp}
                onChangeText={setOtp}
                placeholder="Mã OTP"
                keyboardType="numeric"
              />

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleVerify}
                disabled={isLoading}
              >
                <ThemedText style={styles.submitButtonText}>
                  {isLoading ? "Đang xác minh..." : "Xác minh OTP"}
                </ThemedText>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  backButton: { marginRight: 15 },
  title: { fontSize: 20, fontWeight: "bold", color: "#2c3e50" },
  content: { padding: 20 },
  form: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    elevation: 2,
  },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "600", color: "#2c3e50", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  inputError: { borderColor: "#dc3545", backgroundColor: "#fff5f5" },
  errorText: { fontSize: 12, color: "#dc3545", marginTop: 4 },
  submitButton: {
    backgroundColor: "#667eea",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  submitButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
