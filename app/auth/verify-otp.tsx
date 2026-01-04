import {
  useErrorNotification,
  useSuccessNotification,
} from "@/contexts/NotificationContext";
import { AccountService } from "@/services/account.service";
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
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(600);
  const [loading, setLoading] = useState(false);
  const { showSuccessTooltip } = useSuccessNotification();
  const { showErrorTooltip } = useErrorNotification();
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVerify = async () => {
    try {
      setLoading(true);
      await AccountService.forgotPasswordVerifyCode({
        email,
        code: otp,
      });
      showSuccessTooltip("Xác minh thành công!");
      router.push({
        pathname: "/auth/reset-password",
        params: { email, otp },
      });
    } catch (e) {
      showErrorTooltip("Mã OTP không hợp lệ");
      console.log("Verify OTP error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Xác minh OTP</Text>

      <TextInput
        style={styles.otpInput}
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleVerify}
        disabled={loading || timeLeft === 0}
      >
        <Text style={styles.buttonText}>
          {loading ? "Đang xác minh..." : "Xác nhận"}
        </Text>
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
