import { Ionicons } from "@expo/vector-icons";
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
  ScrollView,
  KeyboardAvoidingView,
  Platform,
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
              <Ionicons name="mail-open-outline" size={64} color="#68C2E8" />
            </View>
            <Text style={styles.title}>Xác minh OTP</Text>
            <Text style={styles.subtitle}>
              Nhập mã OTP 6 chữ số đã được gửi đến email{"\n"}
              <Text style={styles.emailText}>{email}</Text>
            </Text>

            <View style={styles.form}>
              <View style={styles.otpInputContainer}>
                <TextInput
                  style={styles.otpInput}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="000000"
                  placeholderTextColor="#dee2e6"
                />
              </View>

              {timeLeft > 0 && (
                <View style={styles.timerContainer}>
                  <Ionicons name="time-outline" size={16} color="#ff9800" />
                  <Text style={styles.timer}>
                    Mã hết hiệu lực sau: {formatTime(timeLeft)}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.button, (loading || timeLeft === 0) && styles.buttonDisabled]}
                onPress={handleVerify}
                disabled={loading || timeLeft === 0}
                activeOpacity={0.8}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <Ionicons name="hourglass-outline" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Đang xác minh...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Xác nhận</Text>
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
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  emailText: {
    color: '#68C2E8',
    fontWeight: '600',
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
  otpInputContainer: {
    marginBottom: 16,
  },
  otpInput: {
    letterSpacing: 16,
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: "center",
    borderWidth: 1.5,
    borderColor: "#e1e8ed",
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    padding: 20,
    color: '#2c3e50',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff9e6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  timer: {
    color: "#ff9800",
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#68C2E8',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
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
