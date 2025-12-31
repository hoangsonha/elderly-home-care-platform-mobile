# Hướng dẫn kiểm tra thiết bị đã kết nối

## Cách 1: Dùng Expo (Khuyến nghị)

```bash
npx expo start
```

Sau đó trong terminal Expo:
- Nhấn `a` để mở trên Android device/emulator
- Nhấn `i` để mở trên iOS simulator
- Expo sẽ tự động phát hiện thiết bị đã kết nối

## Cách 2: Cài Android SDK Platform Tools (để dùng adb)

### Windows:

1. **Tải Android SDK Platform Tools:**
   - Vào: https://developer.android.com/tools/releases/platform-tools
   - Tải file ZIP cho Windows
   - Giải nén vào thư mục (ví dụ: `C:\platform-tools`)

2. **Thêm vào PATH:**
   - Mở "Environment Variables" trong Windows
   - Thêm `C:\platform-tools` vào PATH
   - Hoặc chạy trực tiếp: `C:\platform-tools\adb.exe devices`

3. **Kiểm tra thiết bị:**
   ```bash
   adb devices
   ```

### Hoặc dùng Android Studio:

1. Mở Android Studio
2. Vào **Tools > Device Manager** hoặc **View > Tool Windows > Device Manager**
3. Xem danh sách thiết bị/emulator

## Cách 3: Kiểm tra qua Android Studio

1. Mở Android Studio
2. Vào **Tools > Device Manager**
3. Xem danh sách thiết bị và emulator

## Lưu ý khi kết nối thiết bị Android:

1. **Bật USB Debugging trên thiết bị:**
   - Vào **Settings > About phone**
   - Nhấn 7 lần vào **Build number** để bật Developer options
   - Vào **Settings > Developer options**
   - Bật **USB debugging**

2. **Cho phép USB debugging:**
   - Khi kết nối lần đầu, thiết bị sẽ hiện popup "Allow USB debugging?"
   - Chọn **Allow** và đánh dấu **Always allow from this computer**

3. **Kiểm tra kết nối:**
   ```bash
   # Nếu đã cài adb
   adb devices
   
   # Hoặc dùng Expo
   npx expo start
   # Sau đó nhấn 'a' để mở trên Android
   ```

## Troubleshooting:

- **Thiết bị không hiện:** Kiểm tra USB cable, USB debugging đã bật chưa
- **Unauthorized:** Cho phép USB debugging trên thiết bị
- **Offline:** Ngắt kết nối và kết nối lại, hoặc restart adb: `adb kill-server && adb start-server`


