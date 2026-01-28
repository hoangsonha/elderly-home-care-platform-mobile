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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    
    // Kiểm tra độ dài tối thiểu 8 ký tự
    if (formData.password.length < 8) {
      setPasswordError("Mật khẩu phải có ít nhất 8 ký tự");
      return false;
    }
    
    // Kiểm tra có ít nhất 1 chữ hoa
    if (!/[A-Z]/.test(formData.password)) {
      setPasswordError("Mật khẩu phải có ít nhất 1 chữ hoa");
      return false;
    }
    
    // Kiểm tra có ít nhất 1 chữ thường
    if (!/[a-z]/.test(formData.password)) {
      setPasswordError("Mật khẩu phải có ít nhất 1 chữ thường");
      return false;
    }
    
    // Kiểm tra có ít nhất 1 số
    if (!/[0-9]/.test(formData.password)) {
      setPasswordError("Mật khẩu phải có ít nhất 1 số");
      return false;
    }
    
    // Kiểm tra có ít nhất 1 ký tự đặc biệt
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
      setPasswordError("Mật khẩu phải có ít nhất 1 ký tự đặc biệt");
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

      // Register device token for push notifications after verification
      try {
        const { NotificationService } = await import("@/services/notification.service");
        await NotificationService.initialize();
        await NotificationService.registerToken(response.token);
      } catch (notificationError) {
        // Log error but don't block registration
        console.error("Failed to register notification token:", notificationError);
      }

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
          // Care Seeker
          if (!response.hasProfile) {
            router.replace("/careseeker/complete-profile");
          } else {
            router.replace("/careseeker/dashboard");
          }
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Đăng ký tài khoản</ThemedText>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.form}>
            {/* ================== FORM ĐĂNG KÝ ================== */}
            {!isOtpStage && (
              <>
                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>
                    Email <ThemedText style={styles.required}>*</ThemedText>
                  </ThemedText>
                  <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={20} color="#68C2E8" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={formData.email}
                      onChangeText={(t) => setFormData({ ...formData, email: t })}
                      placeholder="Nhập email của bạn"
                      placeholderTextColor="#adb5bd"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>
                    Mật khẩu <ThemedText style={styles.required}>*</ThemedText>
                  </ThemedText>
                  <View style={[styles.inputContainer, passwordError ? styles.inputError : null]}>
                    <Ionicons name="lock-closed-outline" size={20} color="#68C2E8" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={formData.password}
                      onChangeText={(t) => {
                        setFormData({ ...formData, password: t });
                        if (passwordError) setPasswordError("");
                      }}
                      placeholder="Nhập mật khẩu"
                      placeholderTextColor="#adb5bd"
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                        size={20}
                        color="#6c757d"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password Input */}
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>
                    Xác nhận mật khẩu <ThemedText style={styles.required}>*</ThemedText>
                  </ThemedText>
                  <View style={[styles.inputContainer, passwordError ? styles.inputError : null]}>
                    <Ionicons name="lock-closed-outline" size={20} color="#68C2E8" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={formData.confirmPassword}
                      onChangeText={(t) => {
                        setFormData({ ...formData, confirmPassword: t });
                        if (passwordError) setPasswordError("");
                      }}
                      placeholder="Nhập lại mật khẩu"
                      placeholderTextColor="#adb5bd"
                      secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeIcon}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                        size={20}
                        color="#6c757d"
                      />
                    </TouchableOpacity>
                  </View>
                  {passwordError && (
                    <View style={styles.errorContainer}>
                      <Ionicons name="alert-circle" size={14} color="#dc3545" />
                      <ThemedText style={styles.errorText}>
                        {passwordError}
                      </ThemedText>
                    </View>
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
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <Ionicons name="hourglass-outline" size={20} color="#fff" />
                      <ThemedText style={styles.submitButtonText}>
                        Đang xử lý...
                      </ThemedText>
                    </View>
                  ) : (
                    <ThemedText style={styles.submitButtonText}>Đăng ký</ThemedText>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* ================== FORM XÁC MINH OTP ================== */}
            {isOtpStage && (
              <>
                <View style={styles.otpHeader}>
                  <View style={styles.otpIconContainer}>
                    <Ionicons name="mail-open-outline" size={48} color="#68C2E8" />
                  </View>
                  <ThemedText style={styles.otpTitle}>
                    Nhập mã xác minh
                  </ThemedText>
                  <ThemedText style={styles.otpDescription}>
                    Chúng tôi đã gửi mã xác minh 6 chữ số đến email{" "}
                    <ThemedText style={styles.emailHighlight}>
                      {formData.email}
                    </ThemedText>
                  </ThemedText>
                  <View style={styles.warningBox}>
                    <Ionicons name="time-outline" size={16} color="#ff9800" />
                    <ThemedText style={styles.otpWarning}>
                      Mã chỉ có hiệu lực trong 5 phút
                    </ThemedText>
                  </View>
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
                      setOtpKey((prev) => prev + 1);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="refresh-outline" size={20} color="#6c757d" />
                    <ThemedText style={styles.clearButtonText}>Xóa</ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      styles.resendButton,
                      isResendingCode && styles.actionButtonDisabled,
                    ]}
                    onPress={handleResendCode}
                    disabled={isResendingCode}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={isResendingCode ? "#adb5bd" : "#68C2E8"}
                    />
                    <ThemedText
                      style={[
                        styles.resendButtonText,
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
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back-outline" size={18} color="#6c757d" />
                  <ThemedText style={styles.backToFormButtonText}>
                    Quay lại
                  </ThemedText>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#68C2E8',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  backButton: { 
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { 
    fontSize: 26, 
    fontWeight: "bold", 
    color: "#fff",
  },
  scrollView: { 
    flex: 1,
  },
  content: { 
    padding: 20,
    paddingTop: 24,
  },
  form: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: { 
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 10,
  },
  required: {
    color: "#dc3545",
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: "#e1e8ed",
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#2c3e50",
    paddingRight: 10,
  },
  eyeIcon: {
    padding: 4,
  },
  inputError: { 
    borderColor: "#dc3545", 
    backgroundColor: "#fff5f5",
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  errorText: { 
    fontSize: 13, 
    color: "#dc3545",
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#68C2E8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 16,
    shadowColor: "#68C2E8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#adb5bd',
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: { 
    color: "white", 
    fontSize: 17, 
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  // OTP Styles
  otpHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  otpIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F6FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  otpTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 12,
  },
  otpDescription: {
    fontSize: 15,
    color: "#6c757d",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff9e6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  otpWarning: {
    fontSize: 13,
    color: "#ff9800",
    fontWeight: "600",
  },
  emailHighlight: {
    fontWeight: "700",
    color: "#68C2E8",
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  clearButton: {
    borderColor: "#dee2e6",
    backgroundColor: "#f8f9fa",
  },
  clearButtonText: {
    color: "#6c757d",
    fontSize: 15,
    fontWeight: "600",
  },
  resendButton: {
    borderColor: "#68C2E8",
    backgroundColor: '#E8F6FB',
  },
  resendButtonText: {
    color: "#68C2E8",
    fontSize: 15,
    fontWeight: "600",
  },
  actionButtonDisabled: {
    borderColor: "#dee2e6",
    backgroundColor: "#f8f9fa",
    opacity: 0.5,
  },
  actionButtonTextDisabled: {
    color: "#adb5bd",
  },
  backToFormButton: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#dee2e6",
    backgroundColor: "#fff",
    flexDirection: 'row',
    gap: 6,
  },
  backToFormButtonText: {
    color: "#6c757d",
    fontSize: 15,
    fontWeight: "600",
  },
});
