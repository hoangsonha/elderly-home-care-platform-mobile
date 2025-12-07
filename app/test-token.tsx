import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { API_CONFIG } from '@/constants/apiConfig';

// Dynamic import for Firebase
let messaging: any = null;
try {
  messaging = require('@react-native-firebase/messaging').default;
} catch (e) {
  console.log('Firebase not available');
}

export default function TestTokenScreen() {
  const params = useLocalSearchParams();
  const authToken = params.token as string || '';
  
  const [fcmToken, setFcmToken] = useState('');
  const [loadingToken, setLoadingToken] = useState(false);
  const [loadingTest, setLoadingTest] = useState(false);
  const [deviceName, setDeviceName] = useState('');

  // Fallback for Firebase if not available (e.g., in Expo Go)
  const isFirebaseAvailable = messaging && messaging()._nativeModule;

  useEffect(() => {
    // Lấy device name
    const name = Platform.OS === 'android' 
      ? `Android Device` 
      : Platform.OS === 'ios' 
        ? `iOS Device` 
        : 'Unknown Device';
    setDeviceName(name);
  }, []);

  const getDeviceToken = async () => {
    if (!isFirebaseAvailable) {
      Alert.alert('Firebase Not Available', 'Firebase native module is not loaded. This feature requires a development build, not Expo Go.');
      return;
    }

    try {
      setLoadingToken(true);
      
      // Request permission (iOS)
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          Alert.alert('Permission Denied', 'Notification permission is required');
          setLoadingToken(false);
          return;
        }
      }

      // Get FCM token
      const token = await messaging().getToken();
      
      console.log('🔥🔥🔥 FCM TOKEN:');
      console.log(token);
      console.log('🔥🔥🔥');
      
      setFcmToken(token);
      
      Alert.alert(
        'Token Ready!',
        'FCM token đã được lấy thành công. Check console để xem full token.',
        [{ text: 'OK' }]
      );
      
    } catch (error: any) {
      console.error('Error getting FCM token:', error);
      Alert.alert('Error', error?.message || 'Failed to get FCM token');
    } finally {
      setLoadingToken(false);
    }
  };

  const testNotificationAPI = async () => {
    if (!fcmToken) {
      Alert.alert('Warning', 'Vui lòng lấy Device Token trước!');
      return;
    }

    if (!authToken) {
      Alert.alert('Error', 'Không có authentication token!');
      return;
    }

    try {
      setLoadingTest(true);

      const deviceType = Platform.OS === 'ios' ? 'IOS' : 'ANDROID';
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/notifications/tokens`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          fcmToken: fcmToken,
          deviceType: deviceType,
          deviceName: deviceName,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        Alert.alert(
          'Success!',
          'Device token đã được đăng ký thành công!',
          [{ text: 'OK' }]
        );
        console.log('✅ Notification token registered:', data);
      } else {
        Alert.alert(
          'Error',
          data.message || 'Failed to register device token'
        );
        console.error('❌ Error response:', data);
      }
    } catch (error: any) {
      console.error('Error testing notification API:', error);
      Alert.alert(
        'Error',
        'Lỗi kết nối: ' + (error.message || 'Vui lòng thử lại')
      );
    } finally {
      setLoadingTest(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔥 Firebase Token Test</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* User Info */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>📋 User Info</Text>
          <Text style={styles.infoText}>Email: {params.email || 'N/A'}</Text>
          <Text style={styles.infoText}>Role: {params.roleName || 'N/A'}</Text>
          <Text style={styles.infoText}>Device: {deviceName}</Text>
          <Text style={styles.infoText}>Platform: {Platform.OS.toUpperCase()}</Text>
        </View>

        {/* FCM Token Display */}
        <View style={styles.tokenCard}>
          <Text style={styles.cardTitle}>🔑 FCM Token</Text>
          <ScrollView style={styles.tokenScrollView} nestedScrollEnabled>
            <Text style={styles.tokenText} selectable>
              {fcmToken || (isFirebaseAvailable ? 'Chưa có token. Nhấn "Get Device Token" để lấy token.' : 'Firebase không khả dụng. Cần development build.')}
            </Text>
          </ScrollView>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.deviceTokenButton, (loadingToken || !isFirebaseAvailable) && styles.buttonDisabled]}
            onPress={getDeviceToken}
            disabled={loadingToken || !isFirebaseAvailable}
          >
            {loadingToken ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>📱 Get Device Token</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.testButton, (loadingTest || !fcmToken) && styles.buttonDisabled]}
            onPress={testNotificationAPI}
            disabled={loadingTest || !fcmToken}
          >
            {loadingTest ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>🧪 Test API</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>📝 Hướng Dẫn</Text>
          <Text style={styles.instructionsText}>
            1. Nhấn "Get Device Token" để lấy FCM token từ Firebase{'\n'}
            2. Token sẽ hiển thị ở trên và trong console{'\n'}
            3. Nhấn "Test API" để đăng ký token với backend{'\n'}
            4. Check console để xem chi tiết logs
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#68C2E8',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#12394A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tokenCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#12394A',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#5B7C8E',
    marginBottom: 8,
  },
  tokenScrollView: {
    maxHeight: 150,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
  },
  tokenText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 16,
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  deviceTokenButton: {
    backgroundColor: '#68C2E8',
  },
  testButton: {
    backgroundColor: '#4CAF50',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  instructionsCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
});

