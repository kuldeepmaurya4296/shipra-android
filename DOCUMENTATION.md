# 🛩️ SHIPRA - Complete Application Documentation

## Urban Air Mobility Platform for Intercity Travel

---

# 📖 TABLE OF CONTENTS

1. [About Shipra](#about-shipra)
2. [Vision & Mission](#vision--mission)
3. [Key Features](#key-features)
4. [Service Coverage](#service-coverage)
5. [Application Architecture](#application-architecture)
6. [Technology Stack](#technology-stack)
7. [User Flow & Journey](#user-flow--journey)
8. [Screen-by-Screen Guide](#screen-by-screen-guide)
9. [Backend API Reference](#backend-api-reference)
10. [Database Schema](#database-schema)
11. [Safety & Emergency Systems](#safety--emergency-systems)
12. [Pricing Structure](#pricing-structure)
13. [Future Roadmap](#future-roadmap)
14. [Getting Started](#getting-started)

---

# 🎯 ABOUT SHIPRA

## What is Shipra?

**Shipra** is a cutting-edge **Urban Air Mobility (UAM)** platform that revolutionizes intercity travel through electric Vertical Takeoff and Landing (eVTOL) aircraft, affectionately called **"Birds"**. The platform enables passengers to book aerial taxi services for **intercity journeys of up to 500 kilometers**, bypassing traditional road congestion and dramatically reducing travel times.

## The Problem We Solve

Traditional intercity travel faces significant challenges:
- 🚗 **Road Congestion**: Hours spent in traffic for inter-city commutes
- 🚆 **Limited Rail Options**: Fixed schedules and routes
- ✈️ **Airport Hassles**: Long check-in times for commercial flights
- ⏰ **Time Waste**: Valuable hours lost in transit

## The Shipra Solution

Shipra offers a revolutionary alternative:
- ⚡ **Speed**: Travel up to 500km in under an hour
- 📍 **Point-to-Point**: Direct routes between stations
- 📱 **On-Demand**: Book a bird in seconds
- 🌱 **Eco-Friendly**: Electric propulsion with zero emissions
- 💺 **Premium Experience**: Comfortable, private air travel

---

# 🚀 VISION & MISSION

## Our Vision
> *"To make intercity air travel as accessible and convenient as booking a cab, transforming how India connects its cities."*

## Our Mission
- **Democratize Air Travel**: Make aerial transportation affordable for everyday intercity travel
- **Reduce Travel Time**: Cut intercity journey times by up to 80%
- **Sustainable Mobility**: Pioneer carbon-neutral transportation solutions
- **Safety First**: Maintain the highest safety standards in aviation

## The Name "Shipra"
Shipra (शिप्रा) is named after the sacred Shipra River in Madhya Pradesh, India - symbolizing flow, journey, and connecting destinations. Just as the river connects cities, Shipra connects people through the air.

---

# ✨ KEY FEATURES

## Core Functionality

### 1. **Smart Booking System**
- Real-time bird availability
- Dynamic route selection
- Instant fare calculation
- Multiple payment options
- Razorpay integration

### 2. **Live Tracking**
- Real-time GPS tracking
- Distance and ETA updates
- Flight status monitoring
- Route visualization on map

### 3. **Premium Experience**
- In-flight cabin controls (AC, Lighting)
- Comfortable seating
- Scenic aerial views
- Professional pilots

### 4. **Safety Systems**
- Emergency SOS button
- Real-time location sharing
- Direct emergency contact
- Safety instruction guides

### 5. **User Management**
- Secure authentication (Google/WhatsApp)
- Profile customization
- Booking history
- Digital receipts

---

# 🗺️ SERVICE COVERAGE

## Current Coverage Area

### Initial Service Radius: **Up to 500 Kilometers**

Shipra initially operates within a **500km service radius**, targeting intercity routes in major metropolitan regions. This coverage enables:

| Distance Range | Typical Time | Example Routes |
|----------------|--------------|----------------|
| 0-100 km | 15-25 min | Mumbai ↔ Pune |
| 100-250 km | 25-45 min | Delhi ↔ Jaipur |
| 250-400 km | 45-70 min | Bangalore ↔ Chennai |
| 400-500 km | 70-90 min | Ahmedabad ↔ Mumbai |

### Station Network
- **Vertiports**: Dedicated takeoff/landing stations
- **Strategic Locations**: Near airports, business districts, and city centers
- **Expanding Network**: New stations added progressively

## Future Expansion

```
Phase 1 (Current): Up to 500 km
    └─ Major metro connections or initial testing and trails for next phases

Phase 2 (Planned): Up to 800 km
    └─ Regional hub connectivity

Phase 3 (Future): Up to 1200 km
    └─ Cross-regional flights

Phase 4 (Vision): Pan-India Network
    └─ Nationwide connectivity
```

---

# 🏗️ APPLICATION ARCHITECTURE

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        SHIPRA PLATFORM                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐         ┌──────────────────┐             │
│  │  MOBILE APP      │ ←────→  │  BACKEND SERVER  │             │
│  │  (React Native)  │  REST   │  (Node.js)       │             │
│  │                  │  API    │                  │             │
│  └──────────────────┘         └────────┬─────────┘             │
│                                        │                        │
│                                        ▼                        │
│                               ┌──────────────────┐             │
│                               │  DATABASE        │             │
│                               │  (MongoDB Atlas) │             │
│                               └──────────────────┘             │
│                                                                  │
│  ┌──────────────────┐         ┌──────────────────┐             │
│  │  PAYMENT         │         │  MAPS            │             │
│  │  (Razorpay)      │         │  (Google Maps)   │             │
│  └──────────────────┘         └──────────────────┘             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
shipra-android/
├── 📱 Mobile Application (React Native)
│   ├── src/
│   │   ├── api/           # API client configuration
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # Auth state management
│   │   ├── screens/       # Application screens
│   │   │   ├── SplashScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── BookingScreen.tsx
│   │   │   ├── RideStatusScreen.tsx
│   │   │   ├── RideInProgressScreen.tsx
│   │   │   ├── RideSummaryScreen.tsx
│   │   │   ├── HistoryScreen.tsx
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── SOSScreen.tsx
│   │   │   ├── DiagnosisScreen.tsx
│   │   │   └── ServiceOrderScreen.tsx
│   │   ├── theme/         # Design system & colors
│   │   └── types/         # TypeScript definitions
│   └── App.tsx            # Main entry point
│
├── 🖥️ Backend Server (Node.js/Express)
│   └── server/
│       ├── src/
│       │   ├── models/    # Database schemas
│       │   │   ├── User.js
│       │   │   ├── Bird.js
│       │   │   ├── Station.js
│       │   │   └── Booking.js
│       │   ├── routes/    # API endpoints
│       │   │   ├── auth.js
│       │   │   ├── users.js
│       │   │   ├── birds.js
│       │   │   ├── stations.js
│       │   │   └── bookings.js
│       │   └── middleware/
│       │       └── auth.js
│       ├── index.js       # Server entry
│       └── seed.js        # Database seeder
│
├── 📄 Documentation Files
│   ├── README.md
│   ├── PROJECT_ANALYSIS.md
│   ├── flow.md (PRD)
│   └── DOCUMENTATION.md (This file)
│
└── ⚙️ Configuration
    ├── .env               # Environment variables
    ├── package.json       # Dependencies
    └── app.json           # App configuration
```

---

# 💻 TECHNOLOGY STACK

## Frontend (Mobile Application)

| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.73.1 | Cross-platform mobile framework |
| TypeScript | Latest | Type-safe JavaScript |
| React Native Maps | Latest | Google Maps integration |
| AsyncStorage | Latest | Local data persistence |
| Lucide React Native | Latest | Premium icon library |
| Linear Gradient | Latest | UI gradient effects |
| Razorpay SDK | Latest | Payment processing |

## Backend (Server)

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20+ LTS | JavaScript runtime |
| Express.js | Latest | Web framework |
| MongoDB | Atlas | Cloud database |
| Mongoose | Latest | ODM for MongoDB |
| JWT | Latest | Token authentication |
| bcrypt | Latest | Password hashing |
| dotenv | Latest | Environment config |

## External Services

| Service | Purpose |
|---------|---------|
| MongoDB Atlas | Cloud database hosting |
| Google Maps API | Map visualization & location services |
| Razorpay | Payment gateway (Test mode) |

---

# 🔄 USER FLOW & JOURNEY

## Complete User Journey

```
                            ╔═══════════════════════════════╗
                            ║     USER OPENS SHIPRA APP     ║
                            ╚═══════════════╦═══════════════╝
                                            ▼
                            ┌───────────────────────────────┐
                            │        SPLASH SCREEN          │
                            │   "Future of Air Mobility"    │
                            │      [Get Started] →          │
                            └───────────────╬───────────────┘
                                            ▼
                            ┌───────────────────────────────┐
                            │        LOGIN SCREEN           │
                            │  ┌─────────────────────────┐  │
                            │  │ 🔵 Sign in with Google  │  │
                            │  └─────────────────────────┘  │
                            │  ┌─────────────────────────┐  │
                            │  │ 💬 Login with WhatsApp  │  │
                            │  └─────────────────────────┘  │
                            └───────────────╬───────────────┘
                                            ▼
                ╔═══════════════════════════════════════════════════════╗
                ║                   HOME SCREEN (Hub)                    ║
                ║  ┌─────────────────────────────────────────────────┐  ║
                ║  │ 📍 Your Location: [Current Station]             │  ║
                ║  │                                                  │  ║
                ║  │     🗺️ [Interactive Map with Birds]              │  ║
                ║  │                                                  │  ║
                ║  │ ✈️ Nearest Bird: Bird #42 | 2.3km | 4 min       │  ║
                ║  │                                                  │  ║
                ║  │         [🛩️ Book a Bird]                        │  ║
                ║  └─────────────────────────────────────────────────┘  ║
                ╠═══════════════════════════════════════════════════════╣
                ║     [🏠 Home]     [📜 History]     [👤 Profile]       ║
                ╚════════════╦══════════════╩══════════════╬════════════╝
                             │                              │
           ┌─────────────────┘                              └─────────────────┐
           ▼                                                                   ▼
┌─────────────────────┐                                       ┌─────────────────────┐
│   BOOKING SCREEN    │                                       │   HISTORY SCREEN    │
│                     │                                       │                     │
│ From: [Station A]   │                                       │ Past Bookings:      │
│       ⇄             │                                       │ • Route 1 ✓ ₹3,000  │
│ To:   [Station B]   │                                       │ • Route 2 ✓ ₹2,500  │
│                     │                                       │ • Route 3 ✓ ₹4,200  │
│ Distance: 125 km    │                                       │                     │
│ Time: 25 min        │                                       │ [Download Receipt]  │
│ Total: ₹4,500       │                                       └─────────────────────┘
│                     │
│ [Confirm Booking] → │
└──────────╬──────────┘
           ▼
┌─────────────────────┐
│  RIDE STATUS SCREEN │
│                     │
│  🛩️ Bird #42        │
│  Arriving in: 4 min │
│  Distance: 1.2 km   │
│                     │
│ [Continue] [Cancel] │
└──────────╬──────────┘
           ▼
┌─────────────────────────────────┐
│    RIDE IN PROGRESS SCREEN      │
│                                 │
│  ✈️ ───────────────→ 🏁        │
│                                 │
│  ┌──────────┬────────────────┐ │
│  │ Time: 18m│ Speed: 320km/h │ │
│  │ Dist: 85k│ Alt: 250m      │ │
│  └──────────┴────────────────┘ │
│                                 │
│  Status: 🟢 Safe & On Route    │
│                                 │
│  [Complete Bird]  [🚨 SOS]     │
└───────────────╬─────────────────┘
                ▼
┌─────────────────────────────────┐
│      RIDE SUMMARY SCREEN        │
│                                 │
│        ✅ Bird Completed!       │
│                                 │
│  Station A → Station B          │
│                                 │
│  Distance: 125 km               │
│  Duration: 25 minutes           │
│  Speed: 300 km/h (avg)          │
│                                 │
│  Base Fare: ₹4,200              │
│  Service Fee: ₹300              │
│  ───────────────────            │
│  Total Paid: ₹4,500             │
│                                 │
│  [📥 Receipt] [Book Another]    │
└─────────────────────────────────┘
```

---

# 📱 SCREEN-BY-SCREEN GUIDE

## 1. Splash Screen
**Purpose**: App introduction and brand presentation

**Features**:
- Animated Shipra logo
- Tagline: "Future of Air Mobility"
- "Get Started" CTA button
- Gradient background animation

---

## 2. Login Screen
**Purpose**: User authentication

**Authentication Methods**:
| Method | Status | Details |
|--------|--------|---------|
| Google Sign-in | ⚠️ Mocked | OAuth integration pending |
| WhatsApp OTP | ⚠️ Mocked | SMS gateway pending |
| Email/Password | ✅ Working | Full implementation |

---

## 3. Home Screen
**Purpose**: Main dashboard and booking hub

**Features**:
- Real-time location display
- Interactive Google Map
- Available birds display
- Station markers
- "Book a Bird" CTA

---

## 4. Booking Screen
**Purpose**: Route selection and fare confirmation

**Booking Flow**:
1. Select departure station (From)
2. Select arrival station (To)
3. View trip details:
   - Distance (up to 500 km)
   - Estimated time
   - Service fee
4. Review total price
5. Confirm booking

**Fare Calculation**:
```
Base Rate: ₹15/km (for first 100 km)
          ₹12/km (101-300 km)
          ₹10/km (301-500 km)

Service Fee: ₹150 (fixed)
Platform Fee: 2.5% of base fare
```

---

## 5. Ride Status Screen
**Purpose**: Track approaching bird

**Live Information**:
- Bird ID assignment
- Distance from user (real-time)
- ETA countdown
- Status indicator (On Time / Delayed)

---

## 6. Ride In Progress Screen
**Purpose**: Active flight monitoring

**Live Statistics**:
| Metric | Update Frequency |
|--------|------------------|
| Time Remaining | Every second |
| Current Speed | Every 5 seconds |
| Distance Remaining | Every 10 seconds |
| Altitude | Every 5 seconds |
| Status | Real-time |

**Cabin Controls** (Simulated):
- AC On/Off
- Lighting controls
- Lock status

---

## 7. SOS Screen
**Purpose**: Emergency response system

**Emergency Features**:
- Large SOS activation button
- Emergency contact display
- GPS coordinates sharing
- Safety instructions
- Direct return option

---

## 8. Ride Summary Screen
**Purpose**: Trip completion and receipt

**Summary Details**:
- Route information
- Trip metrics (distance, time, speed)
- Cost breakdown
- Receipt download
- "Book Another" option

---

## 9. History Screen
**Purpose**: Past bookings management

**Features**:
- Chronological booking list
- Trip details per booking
- Status indicators
- Receipt downloads
- Travel statistics

---

## 10. Profile Screen
**Purpose**: User account management

**Profile Sections**:
- User avatar and info
- Travel statistics
- Settings menu
- Notifications
- Safety & Privacy
- Rewards program
- Logout option

---

# 🔌 BACKEND API REFERENCE

## Authentication APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Create new user account |
| `/api/auth/login` | POST | Authenticate user |
| `/api/auth/social-login` | POST | Social authentication (mocked) |
| `/api/auth/send-otp` | POST | Send WhatsApp OTP (mocked) |
| `/api/auth/verify-otp` | POST | Verify OTP |

## User APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users/me` | GET | Get current user profile |
| `/api/users/me` | PUT | Update user profile |

## Station APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stations` | GET | List all stations |
| `/api/stations/:id` | GET | Get station details |

## Bird APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/birds` | GET | List available birds |
| `/api/birds/:id` | GET | Get bird details |
| `/api/birds/nearby` | GET | Find birds near location |

## Booking APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/bookings` | GET | Get user's bookings |
| `/api/bookings` | POST | Create new booking |
| `/api/bookings/:id` | GET | Get booking details |

---

# 🗄️ DATABASE SCHEMA

## Collections Overview

### 1. Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  avatar: String,
  membershipTier: String, // "Silver" | "Gold" | "Platinum"
  totalFlights: Number,
  rating: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Birds Collection
```javascript
{
  _id: ObjectId,
  birdId: String,        // e.g., "BIRD-042"
  name: String,          // e.g., "Bird #42"
  status: String,        // "available" | "in-flight" | "maintenance"
  currentStation: ObjectId (ref: Station),
  capacity: Number,      // Passenger capacity
  maxRange: Number,      // Maximum range in km
  maxSpeed: Number,      // Maximum speed in km/h
  batteryLevel: Number,  // 0-100
  lastMaintenance: Date,
  createdAt: Date
}
```

### 3. Stations Collection
```javascript
{
  _id: ObjectId,
  name: String,
  code: String,          // e.g., "DEL-CBD"
  city: String,
  address: String,
  location: {
    type: "Point",
    coordinates: [Number, Number] // [longitude, latitude]
  },
  facilities: [String],
  operatingHours: {
    open: String,
    close: String
  },
  isActive: Boolean,
  createdAt: Date
}
```

### 4. Bookings Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  bird: ObjectId (ref: Bird),
  fromStation: ObjectId (ref: Station),
  toStation: ObjectId (ref: Station),
  distance: Number,      // in km
  duration: Number,      // in minutes
  fare: {
    baseFare: Number,
    serviceFee: Number,
    taxes: Number,
    total: Number
  },
  paymentId: String,     // Razorpay payment ID
  status: String,        // "confirmed" | "in-progress" | "completed" | "cancelled"
  bookingDate: Date,
  flightDate: Date,
  completedAt: Date,
  createdAt: Date
}
```

---

# 🆘 SAFETY & EMERGENCY SYSTEMS

## SOS System Overview

Shipra prioritizes passenger safety with comprehensive emergency protocols:

### Emergency Response Flow
```
┌─────────────────────────────────────────────────────────────────┐
│                    EMERGENCY ACTIVATION                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   1. User taps SOS button during flight                         │
│              │                                                   │
│              ▼                                                   │
│   2. System captures:                                            │
│      • GPS coordinates                                           │
│      • Bird ID and status                                        │
│      • User information                                          │
│      • Flight details                                            │
│              │                                                   │
│              ▼                                                   │
│   3. Alerts dispatched to:                                       │
│      • Shipra Control Center                                     │
│      • Emergency services (112)                                  │
│      • Nearby stations                                           │
│      • Registered emergency contacts                             │
│              │                                                   │
│              ▼                                                   │
│   4. User receives:                                              │
│      • Emergency contact numbers                                 │
│      • Current location coordinates                              │
│      • Safety instructions                                       │
│      • Confirmation of alert dispatch                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Safety Features
| Feature | Description |
|---------|-------------|
| One-Touch SOS | Prominent emergency button on flight screen |
| Location Sharing | Real-time GPS broadcast |
| Emergency Contacts | Quick-dial to emergency services |
| Safety Checklist | On-screen instructions during emergency |
| Flight Data | Automatic transmission of flight parameters |

---

# 💰 PRICING STRUCTURE

## Fare Components

### Distance-Based Pricing
| Distance Slab | Rate per km | Example |
|--------------|-------------|---------|
| 0-100 km | ₹15/km | 50 km = ₹750 |
| 101-300 km | ₹12/km | 200 km = ₹2,640* |
| 301-500 km | ₹10/km | 400 km = ₹4,540* |

*Calculated with tiered pricing

### Fixed Fees
| Fee Type | Amount |
|----------|--------|
| Service Fee | ₹150 |
| Platform Fee | 2.5% of base fare |
| Insurance | Included |

### Example Calculations

**Short Trip (80 km)**:
```
Base Fare: 80 × ₹15 = ₹1,200
Service Fee: ₹150
Platform Fee: ₹30
─────────────────────────
Total: ₹1,380
```

**Long Trip (350 km)**:
```
First 100 km: 100 × ₹15 = ₹1,500
Next 200 km: 200 × ₹12 = ₹2,400
Last 50 km: 50 × ₹10 = ₹500
Service Fee: ₹150
Platform Fee: ₹110
─────────────────────────
Total: ₹4,660
```

---

# 🔮 FUTURE ROADMAP

## Upcoming Features

### Phase 2.0 - Enhanced Experience
- [ ] Real Google/WhatsApp OAuth integration
- [ ] Live payment verification (Razorpay)
- [ ] Push notifications (Firebase)
- [ ] In-app chat support
- [ ] Loyalty rewards program

### Phase 2.5 - Operational Excellence
- [ ] Real-time weather integration
- [ ] Dynamic pricing based on demand
- [ ] Multi-passenger bookings
- [ ] Corporate accounts
- [ ] Subscription plans

### Phase 3.0 - Extended Coverage
- [ ] 800 km service radius
- [ ] New city coverage
- [ ] Airport partnerships
- [ ] Hotel integrations
- [ ] Inter-state routes

### Phase 4.0 - Innovation
- [ ] Autonomous flight support
- [ ] Voice booking assistant
- [ ] AR navigation
- [ ] Carbon offset tracking
- [ ] Blockchain receipts

---

# 🚀 GETTING STARTED

## Prerequisites
- Node.js v20+ LTS
- Android Studio / Xcode
- Java 17
- MongoDB Atlas account
- Google Maps API key

## Installation Steps

### 1. Clone Repository
```bash
git clone https://github.com/your-repo/shipra-android.git
cd shipra-android
```

### 2. Install Dependencies
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd server
npm install
cd ..
```

### 3. Configure Environment
Create `.env` file in root:
```env
# API Configuration
API_URL=http://10.0.2.2:5000/api

# MongoDB
MONGODB_URI=mongodb+srv://your-connection-string

# JWT
JWT_SECRET=your-jwt-secret

# Google Maps
GOOGLE_MAPS_API_KEY=your-google-maps-key

# Razorpay (Test Mode)
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=your-secret
```

### 4. Seed Database
```bash
cd server
node seed.js
```

### 5. Start Backend Server
```bash
cd server
node index.js
```

### 6. Run Mobile App
```bash
# Android
npm run android

# iOS
npm run ios
```

---

# 📞 SUPPORT & CONTACT

## Technical Support
- **Email**: support@shipra.in
- **Phone**: 1800-XXX-XXXX

## Emergency Contacts
- **SOS Helpline**: Available in-app
- **Control Center**: 24/7 monitoring

---

# 📋 DOCUMENT INFORMATION

| Attribute | Details |
|-----------|---------|
| Version | 1.0.0 |
| Last Updated | January 2026 |
| Author | Shipra Development Team |
| Status | Active Development |

---

*© 2026 Shipra Air Mobility. All rights reserved.*

*This documentation is confidential and intended for internal use and authorized partners only.*
