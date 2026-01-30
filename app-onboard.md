# 🏗️ How to Create a Robust React Native + Node.js App from Scratch

This guide explains how to initialize a **new** application with the exact same scalable architecture as the *Shipra* project. This setup separates the mobile frontend (React Native CLI) from the backend (Node.js/Express) within a single repository structure.

---

## 🚀 Step 1: Initialize the React Native App

We use the **React Native CLI** (not Expo Go) because it gives us full control over native modules (`android/` and `ios/` folders), enabling features like background tasks, advanced maps, and native payments.

1.  **Run the Init Command**:
    Open your terminal in the folder where you want your project to live.
    ```bash
    npx @react-native-community/cli@latest init MyAppName --version 0.76.0
    ```
    *(Note: Replacing `MyAppName` with your desired name).*

2.  **Select TypeScript**:
    When asked if you want to use TypeScript during initialization, select **YES**. This generates `App.tsx` instead of `App.js`.

---

## 📂 Step 2: Create the Folder Structure

By default, React Native puts everything in the root. We want a clean `src/` structure.

### 1. Create the `src` Directory
Inside your new project folder (`cd MyAppName`), run:
```bash
mkdir src
cd src
mkdir api components context screens theme types
cd ..
```

*   **`api/`**: For Axios instances and API calls.
*   **`components/`**: Reusable UI elements (Buttons, Inputs).
*   **`context/`**: Global state (User authentication).
*   **`screens/`**: Full page views (Login, Home).
*   **`theme/`**: Colors and font constants.
*   **`types/`**: TypeScript interfaces.

### 2. Create the Backend Server
We will host the backend code inside a `server` folder in the root, keeping frontend and backend together (Monorepo-style).

```bash
mkdir server
cd server
npm init -y
```
This creates a `package.json` specifically for the backend.

---

## 📦 Step 3: Install Essential Dependencies

### Frontend (React Native) Libraries
Install these in the **root** folder:

1.  **Navigation** (Essential for moving between screens):
    ```bash
    npm install @react-navigation/native @react-navigation/stack react-native-screens react-native-safe-area-context react-native-gesture-handler
    ```
2.  **Network & Storage**:
    ```bash
    npm install axios @react-native-async-storage/async-storage
    ```
3.  **Environment Variables**:
    ```bash
    npm install react-native-dotenv
    ```

### Backend (Node.js) Libraries
Install these in the **server** folder:

```bash
cd server
npm install express mongoose dotenv cors nodemon
```
*   `express`: Web framework.
*   `mongoose`: Database handling.
*   `cors`: Allows the app to talk to the server.

---

## ⚙️ Step 4: Configuration & Coding

### 1. Setup the Backend Entry Point (`server/index.js`)
Create a file `server/index.js`:
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: '../.env' }); // Share .env with root

const app = express();
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => res.send('Server is running!'));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### 2. Setup the Frontend Entry Point (`App.tsx`)
Replace the default `App.tsx` content to use React Navigation:

```tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from './src/screens/HomeScreen'; // You need to create this

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
         <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### 3. Setup TypeScript
Create a file `src/types/navigation.d.ts` to define your screens:
```ts
export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
};
```

---

## 📱 Step 5: Handling Native Platforms (Android/iOS)

This is the standard "React Native CLI" workflow:

### To Run on Android:
1.  Open Android Studio.
2.  Open the `android` folder inside your project.
3.  Let Gradle sync (it downloads necessary SDKs).
4.  Run:
    ```bash
    npm run android
    ```

### To Make an APK:
1.  **Debug APK** (Initial testing):
    ```bash
    cd android
    ./gradlew assembleDebug
    ```
    Output: `android/app/build/outputs/apk/debug/`

---

## ❓ Why This Structure?

*   **Scalability**: Logic (`src/api`) is separated from UI (`src/screens`).
*   **Maintainability**: Backend and Frontend share one repository but have separate dependencies.
*   **Type Safety**: TypeScript prevents common bugs like passing default data to screens.

This completes the setup! You now have a production-ready application structure identical to the Shipra project.
