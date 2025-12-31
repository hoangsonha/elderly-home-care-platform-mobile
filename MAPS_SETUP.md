# Hướng dẫn cấu hình Google Maps

## Đã hoàn thành

### 1. ✅ Cài đặt react-native-maps
```bash
npm install react-native-maps
```

### 2. ✅ Tạo folder android/ios
```bash
npx expo prebuild --clean
```

### 3. ✅ Bỏ ignore android và ios trong .gitignore
Đã comment out `/ios` và `/android` trong `.gitignore`

### 4. ✅ Cấu hình Android
Đã thêm Google Maps API key vào `android/app/src/main/AndroidManifest.xml`:
```xml
<meta-data android:name="com.google.android.geo.API_KEY" android:value="YOUR_GOOGLE_MAPS_API_KEY"/>
```

### 5. ✅ Cấu hình app.json
Đã thêm plugin `react-native-maps` và cấu hình Google Maps API key trong `app.json`

## Cần làm tiếp

### 1. Lấy Google Maps API Key
1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Bật các API sau:
   - **Maps SDK for Android** (cho Android)
   - **Maps SDK for iOS** (cho iOS)
4. Tạo API Key:
   - Vào "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy API key

### 2. Thay thế API Key
Thay `YOUR_GOOGLE_MAPS_API_KEY` bằng API key thực tế ở các vị trí sau:

#### Android:
- `android/app/src/main/AndroidManifest.xml` (dòng 23)
- `app.json` > `android.config.googleMaps.apiKey`
- `app.json` > `plugins[2][1].googleMapsApiKey`

#### iOS (khi có folder ios):
- `ios/YourApp/Info.plist` - Thêm key sau:
```xml
<key>GMSApiKey</key>
<string>YOUR_GOOGLE_MAPS_API_KEY</string>
```
- `app.json` > `ios.config.googleMapsApiKey`
- `app.json` > `plugins[2][1].googleMapsApiKey`

### 3. Cấu hình iOS (khi cần)
Khi build trên macOS hoặc cần test iOS:
```bash
npx expo prebuild --platform ios
```

Sau đó thêm vào `ios/YourApp/Info.plist`:
```xml
<key>GMSApiKey</key>
<string>YOUR_GOOGLE_MAPS_API_KEY</string>
```

## Kiểm tra

Sau khi thay API key, chạy:
```bash
# Android
npx expo run:android

# iOS (trên macOS)
npx expo run:ios
```

## Lưu ý

- **Source code chung**: Code JavaScript/TypeScript trong `app/`, `components/` là chung cho cả iOS và Android
- **Native config**: Chỉ cấu hình native (AndroidManifest.xml, Info.plist) là khác nhau
- **API Key**: Cần API key riêng cho Android và iOS (hoặc dùng chung nếu cấu hình đúng)


