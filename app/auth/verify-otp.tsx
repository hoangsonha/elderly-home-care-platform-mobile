import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function VerifyOtpScreen() {
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 phút

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Xác minh OTP</Text>
      <Text style={styles.subtitle}>Mã xác minh đã gửi đến {email}</Text>

      <TextInput
        style={styles.otpInput}
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
        placeholder="------"
      />

      <Text style={styles.timer}>
        Thời gian còn lại: {formatTime(timeLeft)}
      </Text>

      <TouchableOpacity
        style={[styles.button, timeLeft === 0 && { backgroundColor: "#ccc" }]}
        disabled={timeLeft === 0}
        onPress={() =>
          router.push({
            pathname: "/auth/reset-password",
            params: { email, otp },
          })
        }
      >
        <Text style={styles.buttonText}>Xác nhận</Text>
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
