import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ProfileSetupScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { updateProfile, user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Check if user already has completed profile
  useEffect(() => {
    if (user?.hasCompletedProfile) {
      // User already has profile, redirect to dashboard
      router.replace('/dashboard');
    } else if (user?.name) {
      // Pre-fill form with existing data if any
      setName(user.name);
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setDateOfBirth(user.dateOfBirth || '');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    // Validate all required fields
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ và tên');
      return;
    }
    
    if (!phone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return;
    }
    
    if (!dateOfBirth.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập ngày sinh');
      return;
    }
    
    if (!address.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        dateOfBirth: dateOfBirth.trim(),
        hasCompletedProfile: true,
      });

      Alert.alert(
        'Thành công',
        'Thông tin cá nhân đã được lưu thành công! Chào mừng bạn đến với Elder Care Connect.',
        [
          {
            text: 'Tiếp tục',
            onPress: () => router.replace('/dashboard'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi lưu thông tin');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Thiết lập thông tin cá nhân
          </Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            Chào {user?.email}! Vui lòng điền đầy đủ thông tin cá nhân để tiếp tục
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Họ và tên *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Nhập họ và tên của bạn"
              placeholderTextColor={colors.text + '80'}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Số điện thoại *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Nhập số điện thoại"
              placeholderTextColor={colors.text + '80'}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Ngày sinh *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={colors.text + '80'}
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Địa chỉ *
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Nhập địa chỉ của bạn"
              placeholderTextColor={colors.text + '80'}
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.tint }]}
            onPress={handleSaveProfile}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Đang lưu...' : 'Hoàn thành'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  form: {
    flex: 1,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 32,
  },
  saveButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    opacity: 0.7,
  },
});
