# Shipra Android Application Analysis

## 1. Project Overview
**Shipra App** is an Urban Air Mobility (UAM) booking platform allowing users to book "Birds" (eVTOLs) for travel between stations. The app currently consists of a React Native (CLI) frontend and an Express/MongoDB backend.

## 2. Feature Analysis

| Feature | Status | Details |
| :--- | :--- | :--- |
| **Authentication** | ⚠️ Partial | • Email/Password Login & Register work.<br>• **Google/Social Login:** Mocked in backend (`/social-login`). Frontend implementation exists but backend just creates a user with a random password.<br>• **WhatsApp OTP:** Mocked. Backend logs a code to console; does not send real SMS/WhatsApp message. |
| **Home/Map** | ✅ Working | • Displays Google Map.<br>• Fetches Stations and Birds from backend (`/stations`, `/birds`).<br>• Selection of "From" and "To" works. |
| **Booking Flow** | ✅ Working | • Route visualization (Polyline) works.<br>• Fare calculation (incl. 15min logic + 4min overhead) works.<br>• **Razorpay Integration:** Implemented on frontend (Test Mode). Payment ID is passed to backend.<br>• **Booking Creation:** Works (`POST /bookings`). |
| **Payment** | ⚠️ Incomplete | • Frontend successfully processes test payments.<br>• **Critical Gap:** Backend **does NOT verify** the `paymentId` with Razorpay. It trusts whatever the frontend sends. |
| **Ride Tracking** | ⚠️ Simulation | • **Ride In Progress:** Purely frontend simulation (timer, animated plane, mock visuals). No real-time websocket/location stream from backend.<br>• **Controls:** AC, Lock, etc., are local state only. No backend persistence. |
| **Services** | ❌ Mock Only | • **Diagnosis:** Simulated delay (2s) on frontend. No backend log.<br>• **Maintenance/Fuel:** "Order" button shows success alert but **does not make an API call**. No backend route exists for service orders. |
| **Profile/History** | ⚠️ Partial | • `HistoryScreen` likely fetches `/bookings`.<br>• Profile update (`PUT /me`) exists in backend but needs verification of frontend integration. |

## 3. API Status & Gaps

### Working APIs
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/stations`
- `GET /api/birds`
- `GET /api/bookings` (User history)
- `POST /api/bookings` (Create booking)
- `GET /api/users/me`

### Missing / Broken APIs
- **Payment Verification:** Need an endpoint (or update `POST /bookings`) to verify `razorpay_signature` using `RAZORPAY_KEY_SECRET`.
- **Service Orders:** No endpoints for `POST /services/maintenance` or `POST /services/fuel`.
- **Real-time Ride State:** No WebSocket or polling mechanism to sync ride status (e.g., if user kills app and restarts, does the ride state persist? Currently likely handled by local nav state or simple "confirmed" status in DB without granularity).
- **Social Auth:** Real implementation needed (Firebase or Passport.js) instead of mock.

## 4. Application Flow Current State

1.  **Splash** -> **Login** (Email/Pass or Mock Social).
2.  **Home**:
    *   User sees map with Birds/Stations.
    *   Selects Route (From -> To).
    *   **"Book Flight"** -> Navigates to **Booking**.
3.  **Booking**:
    *   Review Route, auto-selected Bird, calculated Fare.
    *   **"Pay & Reserve"** -> Razorpay Native Modal (Test).
    *   **Success** -> Calls API -> Navigates to **RideStatus**.
4.  **RideStatus**:
    *   Shows "Driver on way" (Mock UI).
    *   Auto-navigates (or user click) to **RideInProgress**.
5.  **RideInProgress**:
    *   Shows flying plane (Animation).
    *   Shows Cabin Controls (AC/Lock - Local only).
    *   **Services**: Can click Diagnosis/Maintenance (Mock alerts).
    *   **"Complete Flight"** -> **RideSummary**.

## 5. Improvement List (Prioritized)

### Critical (Must Fix for robustness)
1.  **Backend Payment Verification**: Modify `POST /bookings` to verify the Razorpay signature to prevent fraud.
2.  **Service Order Backend**: Create `ServiceRequest` model and routes (`POST /services`) to actually store maintenance/fuel requests.
3.  **Persist Ride State**: The app relies heavily on navigation state. If the app crashes during a ride, the user might lose the "In Progress" screen. The Backend `Booking` model should have granular statuses (`confirmed` -> `in_progress` -> `completed`) and the App should check this on launch.

### Important (Feature Completeness)
4.  **Real Social Login**: Integrate Firebase Auth or standard OAuth2 for real Google/WhatsApp sign-ins.
5.  **Driver/Bird Simulation**: Instead of purely client-side timers, the backend should perhaps manage the "flight duration" so time left is consistent across devices.
6.  **Profile Integration**: Ensure Profile screen actually updates user data (`PUT /me`).

### Polishing
7.  **Error Handling**: Better error messages for API failures (currently generic alerts).
8.  **Loading States**: Add skeletons or better loaders during data fetch.

## 6. Conclusion
The application has a solid "Happy Path" demo. The UI is rich and the core booking flow works with test payments. However, it essentially functions as a high-fidelity prototype in many areas (Services, Ride State, Social Auth) rather than a production-ready system. The backend is minimal and trusts the client too much.
