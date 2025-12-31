# Hướng dẫn Build Development Build để dùng Map

## ⚠️ Vấn đề

**Expo Go không hỗ trợ `react-native-maps`** vì đây là native module tùy chỉnh. Để dùng map, bạn cần **Development Build** (custom native build).

## ✅ Giải pháp: Build Development Build

### Cách 1: Build Local (Khuyến nghị cho test nhanh)

Đã có folder `android/` rồi, chỉ cần build:

```bash
# Build và chạy trên Android device/emulator
npx expo run:android

# Hoặc build và chạy trên iOS (cần macOS)
npx expo run:ios
```

Lệnh này sẽ:
1. Build native app với `react-native-maps` được tích hợp
2. Cài đặt app lên thiết bị/emulator
3. Tự động start Metro bundler
4. App sẽ chạy với map đầy đủ

### Cách 2: Build APK để cài thủ công

```bash
# Build APK debug
cd android
./gradlew assembleDebug

# APK sẽ ở: android/app/build/outputs/apk/debug/app-debug.apk
# Copy APK này vào thiết bị và cài đặt
```

### Cách 3: EAS Build (Cloud build - không cần Android Studio)

```bash
# Cài EAS CLI
npm install -g eas-cli

# Đăng nhập
eas login

# Cấu hình
eas build:configure

# Build development build
eas build --profile development --platform android
```

## 📱 Sau khi build xong

1. **Cài app lên thiết bị** (nếu build APK)
2. **Chạy Metro bundler:**
   ```bash
   npx expo start --dev-client
   ```
3. **Mở app trên thiết bị** - app sẽ tự động kết nối với Metro

## 🔄 Workflow Development

1. **Lần đầu:** Build development build (mất 5-10 phút)
2. **Các lần sau:** Chỉ cần chạy `npx expo start --dev-client` và mở app
3. **Khi thay đổi native code:** Build lại

## 💡 LocationPickerModal đã có Fallback

`LocationPickerModal` đã được thiết kế để:
- ✅ **Có map** (khi dùng development build): Hiển thị map tương tác
- ✅ **Không có map** (khi dùng Expo Go): Hiển thị fallback UI với:
  - Lấy vị trí hiện tại
  - Nhập tọa độ thủ công
  - Mở bản đồ bên ngoài

## 🚀 Quick Start

```bash
# 1. Đảm bảo đã thay Google Maps API key trong:
#    - android/app/src/main/AndroidManifest.xml
#    - app.json

# 2. Kết nối thiết bị Android hoặc mở emulator

# 3. Build và chạy
npx expo run:android

# 4. App sẽ tự động mở với map đầy đủ!
```

## 📝 Lưu ý

- **Development build** khác với **Expo Go**
- Development build là app riêng của bạn, có thể dùng native modules
- Sau khi build lần đầu, chỉ cần start Metro để develop
- Mỗi khi thêm native module mới, cần build lại


