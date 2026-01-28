# Shipra App - Visual Flow Diagrams & User Interactions

## 1️⃣ Complete Application Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SHIPRA AIR MOBILITY APP FLOW                     │
└─────────────────────────────────────────────────────────────────────┘

                            ┌──────────────┐
                            │ SPLASH SCREEN│
                            │ (Onboarding) │
                            └──────┬───────┘
                                   │ "Get Started"
                                   ▼
                            ┌──────────────┐
                            │ LOGIN SCREEN │
                            │(Google/WhatsApp)
                            └──────┬───────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼ (All Main Screens)          │
            ┌──────────────────┐                 │
            │   HOME SCREEN    │◄────────────────┘
            │ (Main Dashboard) │
            └────┬──┬──┬───────┘
                 │  │  │
        ┌────────┘  │  └─────────────────┐
        │           │                     │
        ▼           ▼                     ▼
    ┌─────────┐ ┌─────────┐        ┌──────────┐
    │ BOOKING │ │HISTORY  │        │ PROFILE  │
    │ SCREEN  │ │ SCREEN  │        │ SCREEN   │
    └────┬────┘ └─────────┘        └──────────┘
         │
         │ "Confirm Booking"
         ▼
    ┌────────────────┐
    │ RIDE STATUS    │
    │   SCREEN       │
    └────┬───────────┘
         │ "Continue to Flight"
         ▼
    ┌────────────────────┐
    │  RIDE IN PROGRESS  │
    │      SCREEN        │◄────────┐
    └────┬───────┬───────┘         │
         │       │                 │
         │       │ "SOS Button"    │
         │       │                 │
         │       ▼                 │
         │   ┌────────────┐        │
         │   │ SOS SCREEN │        │
         │   │(Emergency) │        │
         │   └──────┬─────┘        │
         │          │              │
         │          │"Back"        │
         │          └──────────────┘
         │
         │"Complete Flight"
         ▼
    ┌──────────────┐
    │ SUMMARY      │
    │ SCREEN       │
    └─────┬────────┘
          │ "Book Another"
          ▼
    ┌──────────────┐
    │ HOME SCREEN  │ (Loop back to booking)
    └──────────────┘
```

---

## 2️⃣ Screen-by-Screen Navigation Map

```
                    ┌─────────────────────────────────┐
                    │     NAVIGATION BAR (Bottom)     │
                    │  Home | History | Profile       │
                    └─────────────────────────────────┘
                                  ▲
                    ┌─────────────┼─────────────┐
                    │             │             │
              ┌─────┴────┐  ┌────┴─────┐ ┌────┴──────┐
              │   HOME   │  │ HISTORY  │ │ PROFILE   │
              │  SCREEN  │  │  SCREEN  │ │  SCREEN   │
              └─────┬────┘  └──────────┘ └───────────┘
                    │
          ┌─────────┴──────────┐
          │                    │
    ┌─────▼────┐        ┌─────▼──────┐
    │ BOOKING  │        │ SOS SCREEN │
    │ SCREEN   │        │  (from     │
    └─────┬────┘        │ Ride In    │
          │             │ Progress)  │
    ┌─────▼────────────┐ └────────────┘
    │  RIDE STATUS     │
    │    SCREEN        │
    └─────┬────────────┘
          │
    ┌─────▼──────────────┐
    │ RIDE IN PROGRESS   │
    │    SCREEN          │
    └─────┬──────────────┘
          │
    ┌─────▼───────────┐
    │  SUMMARY        │
    │  SCREEN         │
    └─────┬───────────┘
          │
          └──────────► HOME SCREEN
```

---

## 3️⃣ Component Hierarchy & State Flow

```
┌────────────────────────────────────────────────────────────────┐
│                    app/page.tsx (Root)                         │
│  State: currentScreen (splash|login|home|booking|...)          │
│  Handler: setCurrentScreen()                                   │
└────────────┬─────────────────────────────────────────────────┘
             │
             │ renderScreen() switch statement
             │
    ┌────────┴─────────────────────┬──────────────────┬──────────┐
    │                              │                  │          │
    ▼                              ▼                  ▼          ▼
┌──────────────┐            ┌──────────────┐  ┌──────────────┐ ...
│SplashScreen  │            │LoginScreen   │  │HomeScreen    │
│              │            │              │  │              │
│Props:        │            │Props:        │  │Props:        │
│onNext()      │            │onNext()      │  │onNext()      │
│              │            │              │  │              │
│State: -      │            │State: -      │  │State: -      │
└──────────────┘            └──────────────┘  └──────────────┘
     │                           │                    │
     └───────────┬───────────────┴────────────────────┘
                 │
                 ▼
        Passes to setCurrentScreen()
        
        Example Flow:
        SplashScreen.onNext() → 
        setCurrentScreen('login') → 
        Re-renders with LoginScreen
```

---

## 4️⃣ User Actions & State Transitions

```
┌─────────────────────────────────────────────────────────────┐
│              USER ACTIONS → STATE CHANGES                   │
└─────────────────────────────────────────────────────────────┘

SPLASH SCREEN
  └─ User clicks "Get Started"
     └─ setCurrentScreen('login')
        └─ Transition to: LOGIN SCREEN

LOGIN SCREEN
  ├─ User clicks "Continue with Google"
  │  └─ setCurrentScreen('home')
  │     └─ Transition to: HOME SCREEN
  │
  └─ User clicks "WhatsApp OTP Login"
     └─ setCurrentScreen('home')
        └─ Transition to: HOME SCREEN

HOME SCREEN
  ├─ User clicks "Book a Flight"
  │  └─ setCurrentScreen('booking')
  │     └─ Transition to: BOOKING SCREEN
  │
  ├─ User clicks History (nav bar)
  │  └─ setCurrentScreen('history')
  │     └─ Transition to: BOOKING HISTORY SCREEN
  │
  └─ User clicks Profile (nav bar)
     └─ setCurrentScreen('profile')
        └─ Transition to: PROFILE SCREEN

BOOKING SCREEN
  ├─ User clicks Swap Button
  │  └─ setSwapped(!swapped)
  │     └─ Local state update (location swap)
  │
  └─ User clicks "Confirm Booking"
     └─ setCurrentScreen('ride-status')
        └─ Transition to: RIDE STATUS SCREEN

RIDE STATUS SCREEN
  ├─ User clicks "Continue to Flight"
  │  └─ setCurrentScreen('ride-progress')
  │     └─ Transition to: RIDE IN PROGRESS SCREEN
  │
  └─ User clicks "Cancel Booking"
     └─ (Cancel logic - could return to home)

RIDE IN PROGRESS SCREEN
  ├─ User clicks "Complete Flight"
  │  └─ setCurrentScreen('summary')
  │     └─ Transition to: RIDE SUMMARY SCREEN
  │
  └─ User clicks "SOS / Emergency"
     └─ setShowSOS(true)
        └─ Display emergency overlay (local state)
           └─ Shows SOS SCREEN content

SOS SCREEN (Embedded Modal)
  └─ User clicks "Back to Flight"
     └─ setShowSOS(false)
        └─ Return to RIDE IN PROGRESS SCREEN

RIDE SUMMARY SCREEN
  ├─ User clicks "Download Receipt"
  │  └─ (Download action)
  │
  └─ User clicks "Book Another Flight"
     └─ setCurrentScreen('home')
        └─ Transition to: HOME SCREEN

BOOKING HISTORY SCREEN
  └─ User clicks "Download Receipt" (on any booking)
     └─ (Download action)

PROFILE SCREEN
  └─ User clicks "Logout"
     └─ onLogout() → setCurrentScreen('login')
        └─ Transition to: LOGIN SCREEN
```

---

## 5️⃣ Animation Flow Diagram

```
┌────────────────────────────────────────────────────────────┐
│         ANIMATION SEQUENCE FOR SCREEN TRANSITIONS         │
└────────────────────────────────────────────────────────────┘

AnimatePresence (Framer Motion)
├─ Current Screen
│  └─ Variants:
│     ├─ initial: opacity: 0, x: 100
│     ├─ animate: opacity: 1, x: 0
│     └─ exit: opacity: 0, x: -100
│
└─ Transition: spring, damping: 25, stiffness: 300

ELEMENT-LEVEL ANIMATIONS (Inside Screens)

Container Animations:
┌─────────────────────┐
│ containerVariants  │
├─────────────────────┤
│ hidden:             │
│  opacity: 0         │
│ visible:            │
│  opacity: 1         │
│  staggerChildren:   │
│   100-150ms delay   │
└─────────────────────┘

Item Animations (Children):
┌─────────────────────┐
│ itemVariants       │
├─────────────────────┤
│ hidden:             │
│  opacity: 0         │
│  y: 20              │
│  scale: 0.8         │
│ visible:            │
│  opacity: 1         │
│  y: 0               │
│  scale: 1           │
│ transition:         │
│  spring physics     │
│  damping: 25        │
│  stiffness: 300     │
└─────────────────────┘

Interactive Animations:

whileHover:
  scale: 1.05
  boxShadow: 0 20px 40px
  y: -4 (lift effect)

whileTap:
  scale: 0.98
  
Infinite Animations:
  ├─ rotate: 360° (continuous)
  ├─ scale: [1, 1.2, 1] (pulse)
  ├─ opacity: [0.5, 1, 0.5] (fade)
  └─ y: [0, -10, 0] (bounce)
```

---

## 6️⃣ Data Flow for Booking Process

```
┌──────────────────────────────────────────────────────────┐
│           BOOKING FLOW - DATA TRANSFORMATION             │
└──────────────────────────────────────────────────────────┘

HOME SCREEN
└─ No booking data
   │
   └─ User clicks "Book a Flight"
      │
      ▼
BOOKING SCREEN
├─ State: swapped (boolean)
├─ Display: From Location, To Location
├─ Calculate: Distance, Duration, Price
│
├─ From: Downtown Airport (static)
├─ To: City Center Terminal (or swapped)
├─ Distance: 12.5 km
├─ Time: 15 min
├─ Service Fee: ₹150
├─ Subtotal: ₹2,850
├─ Total: ₹3,000
│
└─ Pass to next screen:
   │
   ▼
RIDE STATUS SCREEN
├─ Booking confirmed
├─ Assignment: Flight #42
├─ Live tracking initiated
├─ Distance: 1.2 km
├─ Time to Arrive: 4 min
│
└─ Continue when ready:
   │
   ▼
RIDE IN PROGRESS SCREEN
├─ Flight active
├─ Altitude: 250m
├─ Speed: 95 km/h
├─ Time Remaining: 8 min
├─ Distance: 6.2 km
│
└─ Flight completes:
   │
   ▼
RIDE SUMMARY SCREEN
├─ Distance: 12.5 km
├─ Duration: 15 min
├─ Avg Speed: 92 km/h
├─ Base Fare: ₹2,850
├─ Service Fee: ₹150
├─ Total Paid: ₹3,000
└─ Add to Booking History

BOOKING HISTORY SCREEN
└─ Route: Downtown → City Center
   Date: Jan 20, 2024
   Cost: ₹3,000
   Duration: 15 min
   Distance: 12.5 km
   Status: completed
```

---

## 7️⃣ Component Composition Tree

```
App (app/page.tsx)
│
├─ Switch currentScreen
│  │
│  ├─ Case: 'splash'
│  │  └─ motion.div
│  │     └─ SplashScreen
│  │        ├─ Container (gradient background)
│  │        ├─ Logo (rotating airplane)
│  │        ├─ Title (Shipra)
│  │        ├─ Tagline
│  │        ├─ Loading Dots
│  │        └─ Get Started Button
│  │
│  ├─ Case: 'login'
│  │  └─ motion.div
│  │     └─ LoginScreen
│  │        ├─ Header
│  │        ├─ Illustration
│  │        ├─ Google Button
│  │        ├─ WhatsApp Button
│  │        ├─ Terms & Privacy
│  │        └─ Footer
│  │
│  ├─ Case: 'home'
│  │  └─ motion.div
│  │     └─ HomeScreen
│  │        ├─ Header Section
│  │        ├─ Map Placeholder
│  │        ├─ Availability Card
│  │        └─ Book Button
│  │
│  ├─ Case: 'booking'
│  │  └─ motion.div
│  │     └─ BookingScreen
│  │        ├─ Header
│  │        ├─ From Location Card
│  │        ├─ Swap Button
│  │        ├─ To Location Card
│  │        ├─ Details Card
│  │        ├─ Price Summary
│  │        └─ Confirm Button
│  │
│  ├─ Case: 'ride-status'
│  │  └─ motion.div
│  │     └─ RideStatusScreen
│  │        ├─ Header
│  │        ├─ Live Tracker
│  │        ├─ Distance Card
│  │        ├─ Time Card
│  │        ├─ Status Card
│  │        ├─ Continue Button
│  │        └─ Cancel Button
│  │
│  ├─ Case: 'ride-progress'
│  │  └─ motion.div
│  │     └─ RideInProgressScreen
│  │        ├─ Header
│  │        ├─ Live Route
│  │        ├─ Stats Grid (4 items)
│  │        ├─ Status Indicator
│  │        ├─ Complete Button
│  │        └─ SOS Button
│  │
│  ├─ Case: 'sos'
│  │  └─ motion.div
│  │     └─ SosScreen (Full page)
│  │        ├─ Alert Icon
│  │        ├─ Title
│  │        ├─ Description
│  │        ├─ SOS Button
│  │        ├─ Contact Card
│  │        ├─ Location Card
│  │        ├─ Bird ID Card
│  │        ├─ Instructions
│  │        └─ Back Button
│  │
│  ├─ Case: 'summary'
│  │  └─ motion.div
│  │     └─ RideSummaryScreen
│  │        ├─ Success Animation
│  │        ├─ Route Summary
│  │        ├─ Details Cards (3)
│  │        ├─ Cost Breakdown
│  │        ├─ Download Button
│  │        └─ Book Another Button
│  │
│  ├─ Case: 'history'
│  │  └─ motion.div
│  │     └─ BookHistoryScreen
│  │        ├─ Header
│  │        ├─ Bookings List
│  │        │  └─ Booking Card (x4)
│  │        │     ├─ Route & Date
│  │        │     ├─ Status Badge
│  │        │     ├─ Details Grid
│  │        │     └─ Receipt Button
│  │        └─ Summary Card
│  │
│  └─ Case: 'profile'
│     └─ motion.div
│        └─ ProfileScreen
│           ├─ Avatar
│           ├─ User Info
│           ├─ Stats Grid (3)
│           ├─ Menu Items (4)
│           │  ├─ Settings
│           │  ├─ Notifications
│           │  ├─ Safety & Privacy
│           │  └─ Rewards
│           └─ Logout Button
│
└─ NavigationBar
   ├─ Home Icon
   ├─ History Icon
   └─ Profile Icon
```

---

## 8️⃣ Mobile UI Layout Structure

```
┌─────────────────────────────────────┐
│         STATUS BAR (System)         │
├─────────────────────────────────────┤
│                                     │
│     SCREEN CONTENT                  │
│     (448px max width)               │
│                                     │
│     ┌─────────────────────────┐     │
│     │ Navigation Elements     │     │
│     │ Maps/Cards/Text/Buttons │     │
│     └─────────────────────────┘     │
│                                     │
│     ┌─────────────────────────┐     │
│     │ Additional Cards/Info   │     │
│     └─────────────────────────┘     │
│                                     │
│     ┌─────────────────────────┐     │
│     │ Primary CTA Button      │     │
│     └─────────────────────────┘     │
│                                     │
│  (ScrollArea if needed)             │
│                                     │
├─────────────────────────────────────┤
│    BOTTOM NAVIGATION BAR (Fixed)    │
│  Home | History | Profile           │
├─────────────────────────────────────┤
```

---

## 9️⃣ Screen Visibility & Navigation States

```
NAVIGATION BAR VISIBILITY MATRIX:

Screen                  Nav Bar Visible?
─────────────────────────────────────────
Splash                  ✗ (No)
Login                   ✗ (No)
Home                    ✓ (Yes) - Active
Booking                 ✗ (No - User is in flow)
Ride Status             ✗ (No - User is in flow)
Ride In Progress        ✗ (No - User is in flow)
SOS (Modal)             ✗ (No - Emergency state)
Summary                 ✗ (No - Completion screen)
History                 ✓ (Yes) - Active
Profile                 ✓ (Yes) - Active

NAVIGATION BAR ITEMS:

┌─────────────────────────────────────┐
│       Home      History    Profile   │
│      (House)    (Clock)     (User)   │
├─────────────────────────────────────┤

Active State:
┌─────────────────────────────────────┐
│  ◐ Home    History    Profile        │
│   Home                               │
│  [primary/10 bg]                    │
└─────────────────────────────────────┘
```

---

## 🔟 Gesture & Interaction Feedback Map

```
┌──────────────────────────────────────────────────────────────┐
│            INTERACTIVE ELEMENT FEEDBACK                      │
└──────────────────────────────────────────────────────────────┘

PRIMARY BUTTONS (Blue)
  Idle: opacity: 1, scale: 1
  Hover: scale: 1.05, shadow: 0 20px 40px
  Tap: scale: 0.98
  Active: Background filled

SECONDARY BUTTONS (Border)
  Idle: border: 2px, bg: transparent
  Hover: bg: primary/5, border: primary
  Tap: scale: 0.98
  Active: bg-color fill

EMERGENCY BUTTONS (Red)
  Idle: border: destructive, text: destructive
  Hover: bg-destructive, text: white
  Tap: scale: 0.95
  Active: Full destructive background

CARDS
  Idle: shadow: none, scale: 1
  Hover: scale: 1.02, y: -4, shadow: medium
  Tap: scale: 0.98

ICON BUTTONS
  Idle: rotate: 0
  Hover: rotate: 360° (when specified)
  Tap: scale: 0.9

INPUT-LIKE CARDS (Swappable)
  Idle: opacity: 1
  Hover: scale: 1.02, y: -4
  On Swap: fade out → swap → fade in

NAVIGATION ITEMS
  Idle: scale: 1, color: muted
  Hover: scale: 1.05
  Active: scale: 1.2, color: primary, bg: primary/10
  Tap: scale: 0.95

INFINITE ANIMATIONS
  Rotating: 360° in 8-12s (linear)
  Pulsing: scale/opacity cycle
  Bouncing: y-axis movement
  Ripple: Scale rings expanding
```

---

## 1️⃣1️⃣ Error & State Handling

```
ERROR SCENARIOS & HANDLING:

1. BOOKING ERRORS
   └─ Display: Error toast/alert
   └─ Action: Retry booking
   └─ Fallback: Return to home

2. LOCATION TRACKING ERRORS
   └─ Display: "Connection Lost" badge
   └─ Action: Auto-reconnect
   └─ Fallback: Show last known location

3. CANCELLATION CONFIRMATION
   └─ Display: Confirmation dialog (implied)
   └─ Action: Cancel or go back
   └─ Result: Return to home

LOADING STATES:

1. SPLASH SCREEN
   └─ Animated dots (loading indicator)

2. BOOKING CONFIRMATION
   └─ Button loading state (implied)

3. RIDE STATUS
   └─ Live ETA pulsing dot

4. RIDE IN PROGRESS
   └─ Animated airplane movement
   └─ Real-time stat updates

STATUS INDICATORS:

┌─────────────────┐
│  Success (Green)│
│  ✓ On Time      │
│  ✓ Safe         │
└─────────────────┘

┌─────────────────┐
│  Warning (Red)  │
│  🚨 Emergency   │
│  ⚠ Cancelled    │
└─────────────────┘

┌─────────────────┐
│  Neutral (Gray) │
│  ○ Pending      │
│  ○ Historical   │
└─────────────────┘
```

---

## 1️⃣2️⃣ Complete Journey Timeline

```
USER JOURNEY TIMELINE:

T=0s    ┌─ User Opens App
        └─ SplashScreen appears with animations
          (2-3 seconds duration for onboarding)

T=3s    ┌─ User clicks "Get Started"
        └─ Transition to LoginScreen
          Spring animation: 300ms

T=4s    ┌─ LoginScreen displayed
        └─ Google / WhatsApp options

T=5s    ┌─ User selects login method
        └─ Transition to HomeScreen
          Spring animation: 300ms

T=6s    ┌─ HomeScreen with location & availability
        └─ Navigation bar appears

T=10s   ┌─ User clicks "Book a Flight"
        └─ Transition to BookingScreen
          Spring animation: 300ms

T=11s   ┌─ BookingScreen shows route details
        └─ User can swap locations

T=13s   ┌─ User clicks "Confirm Booking"
        └─ Transition to RideStatusScreen
          Spring animation: 300ms

T=14s   ┌─ RideStatusScreen: "Your Bird is Arriving"
        └─ Live tracker shows airplane approaching

T=17s   ┌─ User clicks "Continue to Flight"
        └─ Transition to RideInProgressScreen
          Spring animation: 300ms

T=18s   ┌─ RideInProgressScreen: Flight Active
        └─ Shows real-time stats & route

T=35s   ┌─ Flight completes (simulated 15-20 min flight)
        └─ User clicks "Complete Flight"

T=36s   ┌─ Transition to RideSummaryScreen
        └─ Spring animation: 300ms

T=37s   ┌─ Summary displayed with celebration animation
        └─ Can download receipt or book another

T=40s   ┌─ User clicks "Book Another Flight"
        └─ Back to HomeScreen
          Navigation bar visible
          Booking added to history

TOTAL TIME: ~40 seconds for complete user journey
ACTUAL BOOKING TIME: 15 minutes (simulated)
```

---

This comprehensive visualization guide shows how every screen connects, animates, and transforms user interactions into meaningful experiences in the Shipra air mobility app.
