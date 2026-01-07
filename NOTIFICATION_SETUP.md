# Hướng dẫn Setup Push Notification

## Tổng quan

App đã được tích hợp push notification với 2 API:
- `POST /api/v1/notifications/tokens`: Đăng ký device token (gọi sau khi login)
- `DELETE /api/v1/notifications/tokens`: Xóa device token (gọi khi logout)

## Cách hoạt động

1. **Sau khi login**: Tự động đăng ký device token với BE
2. **Khi logout**: Tự động xóa device token khỏi BE
3. **Notification channel**: Đã setup channel với ID `care_service_channel` cho Android

## Lưu ý về Firebase FCM Token

Hiện tại service đang dùng **Expo Push Token**. Nếu BE yêu cầu **Firebase FCM Token** trực tiếp, cần:

### Option 1: Dùng Expo Push Token (Hiện tại - Đơn giản hơn)
- Expo Push Token hoạt động với Expo managed workflow
- Không cần setup Firebase
- Token sẽ có format: `ExponentPushToken[...]`

### Option 2: Dùng Firebase FCM Token (Cần setup Firebase)
1. **Cài đặt packages:**
   ```bash
   npm install @react-native-firebase/app @react-native-firebase/messaging
   ```

2. **Setup Firebase Project:**
   - Tạo Firebase project tại https://console.firebase.google.com
   - Thêm Android app với package name: `com.anonymous.capstoneproject`
   - Download `google-services.json` và đặt vào `android/app/`
   - Thêm iOS app và download `GoogleService-Info.plist` vào `ios/`

3. **Cập nhật notification.service.ts:**
   - Thay `getDeviceToken()` để dùng Firebase:
   ```typescript
   import messaging from '@react-native-firebase/messaging';
   
   async function getDeviceToken(): Promise<string | null> {
     try {
       const token = await messaging().getToken();
       return token;
     } catch (error) {
       console.error("Error getting FCM token:", error);
       return null;
     }
   }
   ```

4. **Cập nhật app.json:**
   - Thêm Firebase plugin vào `plugins` array

## Cấu hình hiện tại

- **Notification Channel ID**: `care_service_channel` (Android)
- **Device Type**: Tự động detect (Android/IOS/Web)
- **Device Name**: Tự động lấy từ thiết bị

## Testing

Để test notification:
1. Login vào app
2. Kiểm tra console log: `✅ Device token registered successfully`
3. Kiểm tra BE có nhận được token không



