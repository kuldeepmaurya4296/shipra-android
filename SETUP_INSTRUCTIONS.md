# ShipraApp Platform Instructions (Updated)

To complete the setup for this mobile application, please follow these instructions carefully:

## 1. Backend Server Setup
The Express.js backend is located in the `/server` directory.

- **DNS/Network Error**: If you see `MongoDB Connection Error: ECONNREFUSED`, it is a network issue. Ensure your IP is whitelisted in MongoDB Atlas -> Network Access.
- **API URL Configuration**:
  - Open `.env` in the root folder.
  - If using **Android Emulator**: `API_URL=http://10.0.2.2:5000/api`
  - If using **Physical Device**: `API_URL=http://YOUR_COMPUTER_IP:5000/api` (e.g., `192.168.1.5`)
  - If using **iOS Simulator**: `API_URL=http://localhost:5000/api`
- **Run Server**:
  ```powershell
  cd server
  npm install
  node index.js
  ```

## 2. Dependencies
Ensure you have installed all new dependencies in the mobile app root:
```powershell
npm install
```

## 3. Account Creation
The **Registration Screen** is now fully functional. 
1. Open the app.
2. Go to the **Login Screen**.
3. Click **"Register"** in the footer.
4. Create an account. This will save the user to your MongoDB and log you in automatically.

## 4. Features Integration
- **Booking History**: Automatically fetches your bookings from the database.
- **Confirm Bird**: Saves a new booking to the database and shows a success alert.
- **Auth Persistence**: The app remembers your login even after restart (using AsyncStorage).

## 5. Third-Party Setup
- **Razorpay**: Keys are in `.env`. Ready for `react-native-razorpay` integration.
- **Firebase**: Native SDKs require `google-services.json` (Android) and `GoogleService-Info.plist` (iOS).

If you encounter any build errors, ensure your Android SDK is correctly configured as per the README.md.
