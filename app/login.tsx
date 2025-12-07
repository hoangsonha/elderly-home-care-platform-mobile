import { Colors } from "@/constants/theme";
import { API_CONFIG } from "@/constants/apiConfig";
import { useAuth } from "@/contexts/AuthContext";
import {
    useErrorNotification,
    useSuccessNotification,
} from "@/contexts/NotificationContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
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
} from "react-native";

export default function LoginScreen() {
  console.log('🟠 LoginScreen rendering...');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { showSuccessTooltip } = useSuccessNotification();
  const { showErrorTooltip } = useErrorNotification();

  const handleLogin = async () => {
    if (!email || !password) {
      showErrorTooltip("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    setIsLoading(true);
    const userData = await login(email, password);
    setIsLoading(false);

    if (!userData) {
      showErrorTooltip("Email hoặc mật khẩu không đúng");
      return;
    }

    console.log('🟠 LoginScreen: Login successful, userData:', userData);
    showSuccessTooltip("Đăng nhập thành công! Đang chuyển hướng...");

    // Đợi một chút để state update
    setTimeout(() => {
      console.log('🟠 LoginScreen: Navigating, userData.role:', userData.role);
      if (userData.role === "Caregiver") {
        // If caregiver hasn't completed profile, send them to complete-profile to continue
        if (!userData.hasCompletedProfile) {
          router.replace({
            pathname: '/caregiver/complete-profile',
            params: { email: userData.email, fullName: userData.name || '' }
          });
        } else {
          router.replace("/caregiver");
        }
      } else {
        // Care Seeker và các role khác đều đi thẳng đến dashboard
        router.replace("/careseeker/dashboard");
      }
    }, 500);
  };

  // 🧪 TEST FUNCTION: Login và navigate đến test-token screen
  const handleTestLogin = async () => {
    if (!email || !password) {
      showErrorTooltip("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    setIsLoading(true);
    try {
      // Gọi API login trực tiếp
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/accounts/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();
      setIsLoading(false);

      if (data.code === "Success") {
        showSuccessTooltip("Đăng nhập thành công!");

        // Navigate đến test token screen với token và user data
        setTimeout(() => {
          router.push({
            pathname: "/test-token",
            params: {
              token: data.token || "",
              refreshToken: data.refreshToken || "",
              accountId: data.accountId || "",
              email: data.email || "",
              roleName: data.roleName || "",
              avatarUrl: data.avatarUrl || "",
              enabled: data.enabled?.toString() || "true",
              nonLocked: data.nonLocked?.toString() || "true",
              hasProfile: data.hasProfile?.toString() || "false",
            },
          });
        }, 1000);
      } else {
        showErrorTooltip(data.message || "Đăng nhập thất bại");
      }
    } catch (error: any) {
      setIsLoading(false);
      console.error("Login error:", error);
      showErrorTooltip("Lỗi kết nối: " + (error.message || "Vui lòng thử lại"));
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Đăng Nhập</Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Chào mừng bạn quay trở lại!
        </Text>

        <View style={styles.form}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Email"
            placeholderTextColor={colors.text + "80"}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Mật khẩu"
            placeholderTextColor={colors.text + "80"}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.tint }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
            </Text>
          </TouchableOpacity>

          {/* 🧪 TEST BUTTON */}
          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: '#FF6B6B' }]}
            onPress={handleTestLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              🧪 Test Firebase Token
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={[styles.forgotPasswordText, { color: colors.tint }]}>
            Quên mật khẩu?
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1,
    padding: 10,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 48,
    opacity: 0.7,
  },
  form: {
    gap: 16,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  loginButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  testButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  forgotPassword: {
    alignItems: "center",
    marginTop: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
});
