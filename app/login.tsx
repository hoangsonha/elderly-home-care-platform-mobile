import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import {
  useErrorNotification,
  useSuccessNotification,
} from "@/contexts/NotificationContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
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
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
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
        </View>

        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => router.push("/auth/forgot-password")}
        >
          <Text style={[styles.forgotPasswordText, { color: colors.tint }]}>
            Quên mật khẩu?
          </Text>
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={[styles.registerText, { color: colors.text }]}>
            Chưa có tài khoản?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={[styles.registerLink, { color: colors.tint }]}>
              Đăng ký ngay
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },
  registerText: {
    fontSize: 14,
    opacity: 0.7,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: "600",
  },
});
