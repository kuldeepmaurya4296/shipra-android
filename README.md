# ShipraApp

## 📱 Application Overview
ShipraApp is a modern mobile application built with **React Native** and **TypeScript**. It provides a seamless user experience for booking and managing services. The application currently features a custom navigation system and a polished UI using vector graphics and linear gradients.

---

## 🛠 Tech Stack

### Current Stack (Frontend)
- **Framework**: React Native (v0.83.1)
- **Language**: TypeScript
- **UI & Styling**:
  - `react-native-linear-gradient` (Gradient backgrounds)
  - `react-native-svg` (Vector graphics)
  - `lucide-react-native` (Iconography)
- **Navigation**: Custom State-based Navigation (Lightweight, non-library approach)
- **State Management**: React Hooks (`useState`)

### Future Stack (Backend & Infrastructure)
- **Backend Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas (Cloud Database)
- **Authentication**: JWT (JSON Web Tokens) or OAuth 2.0
- **API Architecture**: RESTful APIs

---

## 💻 System Configuration & Requirements (Windows)

To successfully run and develop this application, your system must meet the following requirements:

### Hardware
- **OS**: Windows 10 or 11 (64-bit)
- **RAM**: Minimum 8GB (16GB recommended for running Emulators smoothly)
- **Disk Space**: At least 10GB free space (for Android Studio, SDKs, and Node modules)
- **Virtualization**: Enabled in BIOS (VT-x or AMD-V) for Android Emulator support.

### Software Prerequisites
1.  **Node.js**: LTS Version (v20.x or newer recommended).
2.  **Java Development Kit (JDK)**: OpenJDK 17 (Required for React Native 0.73+).
3.  **Android Studio**: Latest Stable Version (Koala or newer).

---

## ⚙️ Development Environment Setup (Detailed)

Follow these steps strictly to configure your environment for Android development.

### 1. Install Dependencies
- **Node.js**: Download and install from [nodejs.org](https://nodejs.org/).
- **JDK 17**: Recommend using Chocolatey or downloading Microsoft Build of OpenJDK.
  ```powershell
  # If using Chocolatey
  choco install -y openjdk17
  ```

### 2. Android Studio Configuration
Download and install Android Studio. During installation, ensure the following components are selected:
- **Android SDK**
- **Android SDK Platform**
- **Android Virtual Device**

#### SDK Manager Setup
Open Android Studio -> **Settings** -> **Languages & Frameworks** -> **Android SDK**:

**Include the following SDK Platforms:**
- [x] Android 14.0 ("UpsideDownCake") (API Level 34)
- [x] Android 15.0 ("VanillaIceCream") (API Level 35) (Optional, but good for future proofing)

**Include the following SDK Tools:**
- [x] **Android SDK Build-Tools** (Expand and select `34.0.0` or `35.0.0`)
- [x] **Android SDK Command-line Tools (latest)**
- [x] **Android Emulator**
- [x] **Android SDK Platform-Tools**

### 3. Environment Variables (Critical)
You must set these User Environment Variables for the build tools to find the SDK.

1.  Open **Edit the system environment variables**.
2.  Click **Environment Variables...**.
3.  Under **User variables**:
    -   **New Variable**: `ANDROID_HOME`
    -   **Value**: `%LOCALAPPDATA%\Android\Sdk` (Typically: `C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk`)
4.  Under **User variables** -> select **Path** -> **Edit**:
    -   Add: `%ANDROID_HOME%\platform-tools`
    -   Add: `%ANDROID_HOME%\emulator`
    -   Add: `%ANDROID_HOME%\cmdline-tools\latest\bin` (if available)

### 4. Setup Java Home
1.  Under **System variables**:
    -   **New Variable**: `JAVA_HOME`
    -   **Value**: Path to your JDK installation (e.g., `C:\Program Files\Microsoft\jdk-17.0.x.x`)

---

## 🚀 Running the Application

### 1. Installation
Install the project dependencies using npm:
```bash
npm install
```

### 2. Start Metro Bundler
Start the JavaScript bundler in a dedicated terminal:
```bash
npm start
```

### 3. Run on Android
Launch the application on a connected device or emulator:
```bash
npm run android
```

> **Note**: Ensure an Android Emulator is running OR a physical device is connected with "USB Debugging" enabled.

---

## 📂 Project Structure

```
ShipraApp/
├── android/            # Native Android project files
├── ios/                # Native iOS project files
├── src/
│   ├── components/     # Reusable UI components (NavigationBar, etc.)
│   ├── screens/        # Application screens (Splash, Login, Home)
│   └── assets/         # Static assets (images, fonts)
├── App.tsx             # Main entry point & Navigation logic
├── package.json        # Dependencies and scripts
└── README.md           # Project documentation
```
