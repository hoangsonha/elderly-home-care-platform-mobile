import { router } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quên mật khẩu</Text>
      <Text style={styles.subtitle}>
        Nhập email đã đăng ký để nhận mã xác minh
      </Text>

      <TextInput
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push({
            pathname: "/auth/verify-otp",
            params: { email },
          })
        }
      >
        <Text style={styles.buttonText}>Gửi mã OTP</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 24,
    color: "#666",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  otpInput: {
    letterSpacing: 10,
    fontSize: 22,
    textAlign: "center",
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  timer: {
    textAlign: "center",
    marginBottom: 20,
    color: "#e53e3e",
  },
  button: {
    backgroundColor: "#667eea",
    padding: 16,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },
});
