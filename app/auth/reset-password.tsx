import { router } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đặt mật khẩu mới</Text>

      <TextInput
        placeholder="Mật khẩu mới"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        placeholder="Xác nhận mật khẩu"
        secureTextEntry
        style={styles.input}
        value={confirm}
        onChangeText={setConfirm}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/auth/login")}
      >
        <Text style={styles.buttonText}>Hoàn tất</Text>
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
