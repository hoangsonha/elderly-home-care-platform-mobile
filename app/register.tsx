import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useErrorNotification, useSuccessNotification } from '@/contexts/NotificationContext';

export default function RegisterScreen() {
  const [step, setStep] = useState(1); // 1: form, 2: verification
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'care-seeker', // 'care-seeker' or 'caregiver'
  });
  const [passwordError, setPasswordError] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const { showSuccessTooltip } = useSuccessNotification();
  const { showErrorTooltip } = useErrorNotification();

  const validatePassword = () => {
    if (!formData.password) {
      setPasswordError('Vui lòng nhập mật khẩu');
      return false;
    }
    if (formData.password.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    if (!formData.confirmPassword) {
      setPasswordError('Vui lòng xác nhận mật khẩu');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = () => {
    if (!formData.email) {
      showErrorTooltip('Vui lòng nhập email');
      return;
    }
    
    if (!validatePassword()) {
      return;
    }
    
    // Simulate sending verification code
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      showSuccessTooltip(`Mã xác thực đã được gửi đến ${formData.email}`);
    }, 1500);
  };

  const handleVerification = () => {
    const code = verificationCode.join('');
    if (code.length !== 6) {
      showErrorTooltip('Vui lòng nhập đầy đủ mã xác thực 6 số');
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showSuccessTooltip('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
      setTimeout(() => {
        router.replace('/login');
      }, 2000);
    }, 1500);
  };

  const handlePasswordChange = (field: 'password' | 'confirmPassword', value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (passwordError) {
      setPasswordError('');
    }
  };

  const handleCodeChange = (text: string, index: number) => {
    // Handle paste - if user pastes multiple digits
    if (text.length > 1) {
      const digits = text.replace(/\D/g, '').split('').slice(0, 6);
      const newCode = ['', '', '', '', '', ''];
      
      digits.forEach((digit, i) => {
        if (i < 6) newCode[i] = digit;
      });
      
      setVerificationCode(newCode);
      
      // Focus the last filled input or the next empty one
      const nextIndex = Math.min(digits.length, 5);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex]?.focus();
      }
      return;
    }
    
    // Handle single digit input
    const newCode = [...verificationCode];
    newCode[index] = text;
    setVerificationCode(newCode);
    
    // Auto focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    // Handle backspace - go to previous input
    if (key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const resendCode = () => {
    // Clear current code and focus first input
    setVerificationCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    showSuccessTooltip(`Mã xác thực mới đã được gửi đến ${formData.email}`);
  };

  const clearCode = () => {
    setVerificationCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]}>
        <ThemedText style={[styles.stepText, step >= 1 && styles.stepTextActive]}>1</ThemedText>
      </View>
      <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
      <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]}>
        <ThemedText style={[styles.stepText, step >= 2 && styles.stepTextActive]}>2</ThemedText>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (step === 2) {
            setStep(1);
          } else {
            router.back();
          }
        }} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#667eea" />
        </TouchableOpacity>
        <ThemedText style={styles.title}>
          {step === 1 ? 'Đăng ký tài khoản' : 'Xác thực email'}
        </ThemedText>
      </View>

      <View style={styles.content}>
        {renderStepIndicator()}
        
        <ThemedText style={styles.subtitle}>
          {step === 1 
            ? 'Tham gia nền tảng chăm sóc người cao tuổi hàng đầu Việt Nam'
            : `Nhập mã xác thực 6 số đã được gửi đến ${formData.email}`
          }
        </ThemedText>

        {step === 1 ? (
          // Registration Form
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Email *</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="Nhập địa chỉ email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Mật khẩu *</ThemedText>
              <TextInput
                style={[styles.input, passwordError ? styles.inputError : null]}
                value={formData.password}
                onChangeText={(text) => handlePasswordChange('password', text)}
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                placeholderTextColor="#999"
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Xác nhận mật khẩu *</ThemedText>
              <TextInput
                style={[styles.input, passwordError ? styles.inputError : null]}
                value={formData.confirmPassword}
                onChangeText={(text) => handlePasswordChange('confirmPassword', text)}
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor="#999"
                secureTextEntry
              />
              {passwordError ? (
                <ThemedText style={styles.errorText}>{passwordError}</ThemedText>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Bạn là:</ThemedText>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setFormData({ ...formData, userType: 'care-seeker' })}
                >
                  <View style={[
                    styles.radioCircle,
                    formData.userType === 'care-seeker' && styles.radioSelected
                  ]} />
                  <ThemedText style={styles.radioText}>
                    Người cần dịch vụ chăm sóc
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setFormData({ ...formData, userType: 'caregiver' })}
                >
                  <View style={[
                    styles.radioCircle,
                    formData.userType === 'caregiver' && styles.radioSelected
                  ]} />
                  <ThemedText style={styles.radioText}>
                    Người chăm sóc chuyên nghiệp
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <ThemedText style={styles.submitButtonText}>
                {isLoading ? 'Đang gửi...' : 'Gửi mã xác thực'}
              </ThemedText>
            </TouchableOpacity>

            <ThemedText style={styles.note}>
              * Bằng cách đăng ký, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật của chúng tôi.
            </ThemedText>
          </View>
        ) : (
          // Verification Code Form
          <View style={styles.form}>
            <View style={styles.codeInputContainer}>
              {verificationCode.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { inputRefs.current[index] = ref; }}
                  style={[
                    styles.codeInput,
                    digit ? styles.codeInputFilled : null
                  ]}
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                  keyboardType="numeric"
                  maxLength={6} // Allow paste of multiple digits
                  textAlign="center"
                  autoFocus={index === 0} // Auto focus first input
                  selectTextOnFocus={true}
                />
              ))}
            </View>

            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handleVerification}
              disabled={isLoading}
            >
              <ThemedText style={styles.submitButtonText}>
                {isLoading ? 'Đang xác thực...' : 'Xác thực'}
              </ThemedText>
            </TouchableOpacity>

            <View style={styles.verificationActions}>
              <TouchableOpacity style={styles.resendButton} onPress={resendCode}>
                <ThemedText style={styles.resendButtonText}>
                  Không nhận được mã? Gửi lại
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.clearButton} onPress={clearCode}>
                <ThemedText style={styles.clearButtonText}>
                  Xóa và nhập lại
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#dc3545',
    backgroundColor: '#fff5f5',
  },
  errorText: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 4,
  },
  radioGroup: {
    marginTop: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#dee2e6',
    marginRight: 12,
  },
  radioSelected: {
    borderColor: '#667eea',
    backgroundColor: '#667eea',
  },
  radioText: {
    fontSize: 16,
    color: '#495057',
  },
  submitButton: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  note: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 18,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: '#667eea',
  },
  stepText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6c757d',
  },
  stepTextActive: {
    color: 'white',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#e9ecef',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#667eea',
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: '#dee2e6',
    borderRadius: 8,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    backgroundColor: '#fff',
  },
  codeInputFilled: {
    borderColor: '#667eea',
    backgroundColor: '#f8f9ff',
  },
  verificationActions: {
    alignItems: 'center',
    marginTop: 20,
    gap: 12,
  },
  resendButton: {
    alignItems: 'center',
  },
  resendButtonText: {
    fontSize: 14,
    color: '#667eea',
    textDecorationLine: 'underline',
  },
  clearButton: {
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    color: '#6c757d',
  },
});

