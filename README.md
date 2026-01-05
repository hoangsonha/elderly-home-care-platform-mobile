# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## 🚀 Setup cho Developer mới

### 1. Clone và cài đặt dependencies

```bash
git clone <repository-url>
cd capstone-project
npm install
```

### 2. Setup Firebase (Bắt buộc)

**File `google-services.json` KHÔNG được commit lên Git** (đã ignore). Mỗi developer cần có file riêng.

Xem hướng dẫn chi tiết trong [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

**Tóm tắt:**
- Lấy file `google-services.json` từ Firebase Console hoặc xin từ team lead
- Đặt file vào **root project** (cùng cấp với `app.json`)
- Package name phải là: `com.capstoneproject.app`

### 3. Setup Android SDK

Tạo file `android/local.properties` (file này cũng không được commit):

```properties
sdk.dir=C\:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk
```

Thay `YOUR_USERNAME` bằng username Windows của bạn.

### 4. Build và chạy app

```bash
# Build development build (lần đầu)
npx expo run:android

# Hoặc chạy Metro bundler (các lần sau)
npx expo start --dev-client
```

## 📱 Development

### Start the app

```bash
npx expo start
```

### Choose 2 option to complete

   a. Android Virtual Emulator
   
   ```bash
   Press 'a'
   ```

      or

   b. Open in Physical Device

   ```bash
   Scan the QR in your phone with Expo
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
