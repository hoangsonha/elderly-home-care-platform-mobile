import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import {
  useErrorNotification,
  useSuccessNotification,
} from "@/contexts/NotificationContext";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const { showSuccessTooltip } = useSuccessNotification();
  const { showErrorTooltip } = useErrorNotification();

  const handleLogin = async () => {
    if (!email || !password) {
      showErrorTooltip("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    setIsLoading(true);

    try {
      // Gọi login trong AuthContext
      const user = await login(email, password);

      setIsLoading(false);

      if (!user) {
        showErrorTooltip("Email hoặc mật khẩu không đúng");
        return;
      }

      showSuccessTooltip("Đăng nhập thành công!");

      // Điều hướng theo role
      setTimeout(() => {
        if (user.role === "Caregiver" || user.role === "ROLE_CAREGIVER") {
          if (!user.hasCompletedProfile) {
            router.replace({
              pathname: "/caregiver/complete-profile",
              params: {
                email: user.email,
                accountId: user.id,
              },
            });
          } else {
            router.replace("/caregiver");
          }
        } else {
          // Care Seeker
          if (!user.hasCompletedProfile) {
            router.replace("/careseeker/complete-profile");
          } else {
            router.replace("/careseeker/dashboard");
          }
        }
      }, 600);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      showErrorTooltip("Đăng nhập thất bại");
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
            <View style={styles.iconContainer}>
              <Ionicons name="heart-circle" size={64} color="#68C2E8" />
            </View>
            <Text style={styles.title}>Đăng Nhập</Text>
            <Text style={styles.subtitle}>
              Chào mừng bạn quay trở lại!
            </Text>
          </View>

          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#68C2E8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#adb5bd"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#68C2E8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Mật khẩu"
                  placeholderTextColor="#adb5bd"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Ionicons name="hourglass-outline" size={20} color="#fff" />
                  <Text style={styles.loginButtonText}>Đang đăng nhập...</Text>
                </View>
              ) : (
                <Text style={styles.loginButtonText}>Đăng Nhập</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => router.push("/auth/forgot-password")}
          >
            <Text style={styles.forgotPasswordText}>
              Quên mật khẩu?
            </Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              Chưa có tài khoản?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text style={styles.registerLink}>
                Đăng ký ngay
              </Text>
            </TouchableOpacity>
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
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: '#6c757d',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
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
  loginButton: {
    backgroundColor: '#68C2E8',
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#68C2E8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonDisabled: {
    backgroundColor: '#adb5bd',
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
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
  forgotPassword: {
    alignItems: "center",
    marginTop: 16,
  },
  forgotPasswordText: {
    fontSize: 15,
    color: '#68C2E8',
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  registerText: {
    fontSize: 15,
    color: '#6c757d',
  },
  registerLink: {
    fontSize: 15,
    fontWeight: "700",
    color: '#68C2E8',
  },
});
