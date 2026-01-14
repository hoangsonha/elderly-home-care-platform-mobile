import { Ionicons } from "@expo/vector-icons";
import { useSuccessNotification, useErrorNotification } from "@/contexts/NotificationContext";
import { AccountService } from "@/services/account.service";
import { removeToken } from "@/services/apiClient";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

export default function ResetPasswordScreen() {
  const { email, otp } = useLocalSearchParams<{
    email: string;
    otp: string;
  }>();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const { showSuccessTooltip } = useSuccessNotification();
  const { showErrorTooltip } = useErrorNotification();
  
  const handleReset = async () => {
    if (!password) {
      setPasswordError("Vui lòng nhập mật khẩu mới");
      return;
    }
    if (password.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (password !== confirm) {
      setPasswordError("Mật khẩu xác nhận không khớp");
      return;
    }
    setPasswordError("");

    try {
      setLoading(true);
      await AccountService.forgotPasswordReset({
        email,
        code: otp,
        newPassword: password,
      });
      showSuccessTooltip("Đổi mật khẩu thành công!");
      await removeToken();
      router.replace("/login");
    } catch (e) {
      console.log("Reset password error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#2c3e50" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="key-outline" size={64} color="#68C2E8" />
            </View>
            <Text style={styles.title}>Đặt mật khẩu mới</Text>
            <Text style={styles.subtitle}>
              Tạo mật khẩu mới cho tài khoản của bạn
            </Text>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <View style={[styles.inputContainer, passwordError ? styles.inputError : null]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#68C2E8" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Mật khẩu mới"
                    placeholderTextColor="#adb5bd"
                    secureTextEntry
                    style={styles.input}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (passwordError) setPasswordError("");
                    }}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={[styles.inputContainer, passwordError ? styles.inputError : null]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#68C2E8" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Xác nhận mật khẩu"
                    placeholderTextColor="#adb5bd"
                    secureTextEntry
                    style={styles.input}
                    value={confirm}
                    onChangeText={(text) => {
                      setConfirm(text);
                      if (passwordError) setPasswordError("");
                    }}
                  />
                </View>
                {passwordError && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={14} color="#dc3545" />
                    <Text style={styles.errorText}>{passwordError}</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleReset}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <Ionicons name="hourglass-outline" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Đang xử lý...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Hoàn tất</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F6FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: '#2c3e50',
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 32,
    color: "#6c757d",
    fontSize: 15,
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 16,
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
  button: {
    backgroundColor: '#68C2E8',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: "#68C2E8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#adb5bd',
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 17,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
