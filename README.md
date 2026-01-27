# ShipraApp ✈️

## 📱 Application Overview
ShipraApp is a premium mobile application built with **React Native** and **TypeScript**. It offers a high-end flight booking experience with a sleek, modern UI. The app is fully integrated with a Node.js/Express backend and MongoDB Atlas.

---

## ✅ Progress & Task Status

### **Phase 1: Foundation (Completed)**
- [x] Initial React Native & TypeScript Setup
- [x] Custom Navigation System (Integrated and tested)
- [x] Themed UI System (Colors, Typography, Gradients)
- [x] Vector Iconography (Lucide-react integration)

### **Phase 2: Full-Stack Integration (Completed)**
- [x] **Backend Server**: Node.js & Express.js architecture
- [x] **Database**: MongoDB Atlas cloud integration
- [x] **Authentication**: Secure Login & Registration with JWT
- [x] **User Management**: Profile viewing and updates
- [x] **Booking System**: Create and store flight bookings
- [x] **History Tracking**: Fetch and display historical trips from DB

### **Phase 3: Advanced Features (Next)**
- [ ] **Payment Integration**: Live Razorpay gateway (currently simulated)
- [ ] **Push Notifications**: Firebase Cloud Messaging (FCM)
- [ ] **Live Maps**: Interactive route visualization via Google Maps
- [ ] **Real-time Status**: Live flight tracking updates

---

## 🛠 Tech Stack (Current)

### Frontend
- **Framework**: React Native (v0.73.1)
- **Language**: TypeScript
- **Styling**: `react-native-linear-gradient`, `Native Styles`
- **Icons**: `lucide-react-native`
- **Storage**: `AsyncStorage` for session persistence

### Backend & Infrastructure
- **Runtime**: Node.js (v20+)
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)
- **Environment**: `.env` (Unified across project)

---

## 📂 Project Structure

```
ShipraApp/
├── server/             # Express.js Backend
│   ├── src/
│   │   ├── routes/     # Auth, Bookings, Users
│   │   ├── models/     # Mongoose Schemas
│   │   └── middleware/ # Auth validation
├── src/                # React Native Frontend
│   ├── api/            # Axios client configuration
│   ├── components/     # Reusable UI (NavigationBar, etc.)
│   ├── context/        # Auth State Management
│   ├── screens/        # UI Screens (Splash, Home, Booking, History, Profile)
│   └── theme/          # Color tokens and design system
├── App.tsx             # Main entry point & Navigation logic
└── .env                # Global configuration (Shared)
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js LTS
- Android Studio / Xcode
- Java 17

### 2. Setup
1. Clone the repository.
2. Install dependencies: `npm install` and `cd server && npm install`.
3. Configure `.env` with your `MONGODB_URI` and `API_URL`.
4. Run the backend: `cd server && node index.js`.
5. Run the mobile app: `npm run android` or `npm run ios`.

---

## 💻 Development Notes
- **API URL**: For Android Emulators, use `http://10.0.2.2:5000/api`.
- **Database**: Ensure your IP is whitelisted in MongoDB Atlas.

"# shipra-android"
 
