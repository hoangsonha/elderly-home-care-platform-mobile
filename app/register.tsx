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

import { OTPInput } from "@/components/auth/OTPInput";
import { RoleSelector, RoleType } from "@/components/auth/RoleSelector";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/contexts/AuthContext";
import {
  useErrorNotification,
  useSuccessNotification,
} from "@/contexts/NotificationContext";
import { AccountService } from "@/services/account.service";
import { saveToken } from "@/services/apiClient";
import { isFailedResponse, isSuccessResponse, parseApiError } from "@/utils/errorHandler";

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [otp, setOtp] = useState("");
  const [isOtpStage, setIsOtpStage] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingCode, setIsResendingCode] = useState(false);
  const [otpKey, setOtpKey] = useState(0); // Key để reset OTP input

  const { showSuccessTooltip } = useSuccessNotification();
  const { showErrorTooltip, showError } = useErrorNotification();
  const { setUserDirect } = useAuth();

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
  // GỬI ĐĂNG KÝ
  // -------------------------------------------------------
  const handleRegister = async () => {
    if (!formData.email) {
      showErrorTooltip("Vui lòng nhập email");
      return;
    }

    if (!selectedRole) {
      showErrorTooltip("Vui lòng chọn vai trò");
      return;
    }

    if (!validatePassword()) return;

    setIsLoading(true);
    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        role: selectedRole,
      };

      const response = await AccountService.register(payload);

      // Kiểm tra response
      if (isFailedResponse(response)) {
        const errorMessage = parseApiError(response.message || response);
        showError("Đăng ký thất bại", errorMessage);
        return;
      }

      if (isSuccessResponse(response)) {
        showSuccessTooltip("Mã xác minh đã được gửi đến email của bạn!");
        setIsOtpStage(true);
      } else {
        showErrorTooltip("Đã xảy ra lỗi. Vui lòng thử lại!");
      }
    } catch (error: any) {
      console.log("Register error:", error);
      const errorMessage = parseApiError(error);
      showError("Đăng ký thất bại", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------
  // GỬI LẠI MÃ CODE
  // -------------------------------------------------------
  const handleResendCode = async () => {
    if (!formData.email) {
      showErrorTooltip("Email không hợp lệ");
      return;
    }

    setIsResendingCode(true);
    try {
      const response = await AccountService.resendCode({
        email: formData.email,
      });

      if (isFailedResponse(response)) {
        const errorMessage = parseApiError(response.message || response);
        showError("Gửi lại mã thất bại", errorMessage);
        return;
      }

      if (isSuccessResponse(response)) {
        showSuccessTooltip("Mã xác minh mới đã được gửi!");
      } else {
        showErrorTooltip("Đã xảy ra lỗi. Vui lòng thử lại!");
      }
    } catch (error: any) {
      console.log("Resend code error:", error);
      const errorMessage = parseApiError(error);
      showError("Gửi lại mã thất bại", errorMessage);
    } finally {
      setIsResendingCode(false);
    }
  };

  // -------------------------------------------------------
  // XÁC MINH OTP
  // -------------------------------------------------------
  const handleVerify = async (code: string) => {
    if (!code || code.length !== 6) {
      showErrorTooltip("Vui lòng nhập đầy đủ 6 chữ số!");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        email: formData.email,
        verificationCode: code,
      };

      const response = await AccountService.verifyEmail(payload);

      // Kiểm tra response
      if (isFailedResponse(response) || !response.token) {
        const errorMessage = parseApiError(response.message || response);
        showError("Xác minh thất bại", errorMessage);
        return;
      }

      // Lưu token
      await saveToken(response.token, response.refreshToken);

      // Tạo user data từ response
      const userData = {
        id: response.accountId,
        email: response.email,
        name: response.profile?.fullName,
        phone: response.profile?.phoneNumber,
        avatar: response.avatarUrl || response.profile?.avatarUrl,
        role: response.roleName,
        token: response.token,
        refreshToken: response.refreshToken,
        hasCompletedProfile: response.hasProfile ?? false,
        status: undefined,
      };

      // Set user vào context
      setUserDirect(userData);

      showSuccessTooltip("Xác minh thành công!");

      // Điều hướng theo role
      setTimeout(() => {
        if (response.roleName === "ROLE_CAREGIVER") {
          if (!response.hasProfile) {
            router.replace("/caregiver/complete-profile");
          } else {
            router.replace("/caregiver");
          }
        } else {
          router.replace("/careseeker/dashboard");
        }
      }, 600);
    } catch (error: any) {
      console.log("Verify error:", error);
      const errorMessage = parseApiError(error);
      showError("Xác minh thất bại", errorMessage);
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
                  autoCapitalize="none"
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

              <RoleSelector
                selectedRole={selectedRole}
                onSelectRole={setSelectedRole}
              />

              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
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
              <View style={styles.otpHeader}>
                <ThemedText style={styles.otpTitle}>
                  Nhập mã xác minh
                </ThemedText>
                <ThemedText style={styles.otpDescription}>
                  Chúng tôi đã gửi mã xác minh 6 chữ số đến email{" "}
                  <ThemedText style={styles.emailHighlight}>
                    {formData.email}
                  </ThemedText>
                </ThemedText>
                <ThemedText style={styles.otpWarning}>
                  Mã chỉ có hiệu lực trong 5 phút
                </ThemedText>
              </View>

              <OTPInput
                key={otpKey}
                length={6}
                onComplete={handleVerify}
                onCodeChange={setOtp}
              />

              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.clearButton]}
                  onPress={() => {
                    setOtp("");
                    setOtpKey((prev) => prev + 1); // Reset OTP input
                  }}
                >
                  <Ionicons name="refresh" size={18} color="#667eea" />
                  <ThemedText style={styles.actionButtonText}>Xóa</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.resendButton,
                    isResendingCode && styles.actionButtonDisabled,
                  ]}
                  onPress={handleResendCode}
                  disabled={isResendingCode}
                >
                  <Ionicons
                    name="mail"
                    size={18}
                    color={isResendingCode ? "#999" : "#667eea"}
                  />
                  <ThemedText
                    style={[
                      styles.actionButtonText,
                      isResendingCode && styles.actionButtonTextDisabled,
                    ]}
                  >
                    {isResendingCode ? "Đang gửi..." : "Gửi lại mã"}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.backToFormButton}
                onPress={() => setIsOtpStage(false)}
              >
                <ThemedText style={styles.backToFormButtonText}>
                  Quay lại
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
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
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
  submitButtonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  submitButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  otpHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  otpTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  otpDescription: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 8,
  },
  otpWarning: {
    fontSize: 12,
    color: "#ff9800",
    textAlign: "center",
    fontWeight: "500",
    marginTop: 4,
  },
  emailHighlight: {
    fontWeight: "600",
    color: "#667eea",
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#667eea",
    backgroundColor: "#fff",
  },
  clearButton: {
    borderColor: "#dee2e6",
    backgroundColor: "#f8f9fa",
  },
  resendButton: {
    borderColor: "#667eea",
    backgroundColor: "#f0f4ff",
  },
  actionButtonDisabled: {
    borderColor: "#dee2e6",
    backgroundColor: "#f8f9fa",
    opacity: 0.6,
  },
  actionButtonText: {
    color: "#667eea",
    fontSize: 14,
    fontWeight: "600",
  },
  actionButtonTextDisabled: {
    color: "#999",
  },
  backToFormButton: {
    marginTop: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#dee2e6",
    backgroundColor: "#f8f9fa",
  },
  backToFormButtonText: {
    color: "#6c757d",
    fontSize: 14,
    fontWeight: "600",
  },
});
