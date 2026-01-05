# Hướng dẫn Setup Firebase FCM

## ⚠️ Lưu ý quan trọng

**File `google-services.json` KHÔNG được commit lên Git** (đã được ignore). Mỗi developer cần có file riêng của mình.

## Các bước setup cho Developer mới

### 1. Lấy file `google-services.json`

Có 2 cách:

#### Cách 1: Từ Firebase Console (Khuyến nghị)
1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project: `swp391-f046d`
3. Vào **Project Settings** (⚙️) > **Your apps**
4. Tìm app Android với package name: `com.capstoneproject.app`
5. Click **Download google-services.json**
6. Đặt file vào **root project** (cùng cấp với `app.json`)

#### Cách 2: Xin từ team lead
- Xin file `google-services.json` từ team lead hoặc người đã setup Firebase
- Đặt file vào **root project** (cùng cấp với `app.json`)

### 2. Cấu hình Android SDK (nếu chưa có)

Tạo file `android/local.properties` với nội dung:

```properties
sdk.dir=C\:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk
```

**Lưu ý**: Thay `YOUR_USERNAME` bằng username Windows của bạn.

Hoặc nếu Android SDK ở vị trí khác, thay đường dẫn tương ứng.

### 3. Build app

```bash
# Xóa build cũ (nếu có)
npx expo prebuild --clean

# Build và chạy
npx expo run:android
```

## Package Name

App đang dùng package name: **`com.capstoneproject.app`**

Nếu bạn tạo Firebase app mới, cần dùng package name này.

## Troubleshooting

### Lỗi: "File google-services.json is locked"
- Đóng Android Studio
- Đóng tất cả terminal đang chạy Gradle
- Thử lại `prebuild --clean`

### Lỗi: "No matching client found for package name"
- Kiểm tra package name trong `app.json` phải là `com.capstoneproject.app`
- Kiểm tra package name trong `google-services.json` phải khớp
- Nếu không khớp, cần thêm app mới trong Firebase Console với package name đúng

### Lỗi: "SDK location not found"
- Tạo file `android/local.properties` với đường dẫn Android SDK
- File này cũng không được commit (đã ignore)

## Cấu trúc file

```
capstone-project/
├── app.json
├── google-services.json          ← Đặt file ở đây (KHÔNG commit)
├── android/
│   ├── local.properties          ← Tự tạo (KHÔNG commit)
│   └── app/
│       └── google-services.json  ← Tự động copy từ root khi build
└── ...
```

## Lưu ý

- ✅ File `google-services.json` ở root sẽ được tự động copy vào `android/app/` khi build
- ✅ Cả 2 file (`google-services.json` và `local.properties`) đều đã được ignore trong `.gitignore`
- ✅ Mỗi developer cần setup riêng vì:
  - `google-services.json`: Có thể khác nhau tùy Firebase project
  - `local.properties`: Đường dẫn Android SDK khác nhau trên mỗi máy
