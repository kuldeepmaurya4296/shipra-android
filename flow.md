# SHIPRA AIR MOBILITY APP - PRODUCT REQUIREMENTS DOCUMENT

## EXECUTIVE SUMMARY
Shipra is a mobile application for booking aerial taxi services (air mobility). Users can book birds, track their journey in real-time, access booking history, and manage their profile - all with integrated emergency SOS capabilities.

---

# PART 1: APPLICATION FLOW OVERVIEW

## Complete User Journey Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SHIPRA APP USER FLOW                            │
└─────────────────────────────────────────────────────────────────────┘

                          ENTRY POINT
                              │
                              ▼
                    ┌──────────────────┐
                    │  SPLASH SCREEN   │ (Onboarding)
                    │  - App Welcome   │
                    │  - Get Started   │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  LOGIN SCREEN    │ (Authentication)
                    │ - Google Sign-in │
                    │ - WhatsApp OTP   │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  HOME SCREEN     │ (Main Dashboard)
                    │ - Show Avialbty  │
                    │ - Book Button    │
                    └─────┬──────┬─────┘
                          │      │
           ┌──────────────┴──┬───┴────────────┐
           │                 │                │
           ▼                 ▼                ▼
    ┌────────────┐    ┌─────────────┐   ┌──────────┐
    │  BOOKING   │    │  HISTORY    │   │ PROFILE  │
    │  SCREEN    │    │  SCREEN     │   │ SCREEN   │
    │ -Route     │    │ -Past Trips │   │ -Account │
    │ -Details   │    │ -Receipts   │   │ -Settings│
    │ -Pricing   │    │ -Stats      │   │ -Logout  │
    └────┬───────┘    └─────────────┘   └──────────┘
         │
         ▼
    ┌────────────────┐
    │ RIDE STATUS    │ (Tracking Arrival)
    │ - Bird #42   │
    │ - 4 min away   │
    │ - 1.2 km dist  │
    └────┬───────────┘
         │
         ▼
    ┌────────────────────┐
    │ RIDE IN PROGRESS   │ (Active Bird)
    │ - Real-time Stats  │
    │ - 8 min remaining  │
    │ - ⚠️ SOS Button    │
    └────┬──────────┬────┘
         │          │
         │          └──────────┐
         │                     │
         ▼                     ▼
    ┌─────────┐         ┌──────────┐
    │ SUMMARY │         │ SOS PAGE │
    │ SCREEN  │         │ -EMERGENCY│
    │ -Receipt│         │ -Contacts│
    │ -Again? │         │ -Status  │
    └────┬────┘         └──────────┘
         │
         └──────────────────────┬──────────┐
                                │          │
                                ▼          │
                         (Back to HOME)   │
                                          │
                          (From SOS)──────┘
```

---

# PART 2: DETAILED SCREEN SPECIFICATIONS

## SCREEN 1: SPLASH SCREEN
**Entry Point** | **First-Time Experience**

### Purpose
- App introduction and onboarding
- Brand presentation
- Transition to login

### Screen Content & Layout
```
┌─────────────────────────┐
│                         │
│    GRADIENT BACKGROUND  │
│      (Blue Primary)     │
│                         │
│        ✈️ ICON          │ (Animated, Rotating)
│    (Airplane Emoji)     │
│                         │
│      "Shipra"           │ (App Name - Bold, Large)
│                         │
│ "Future of Air Mobility"│ (Tagline - Smaller Text)
│                         │
│    • • • (Loading)      │ (3 Animated Dots)
│                         │
│    ┌─────────────────┐  │
│    │ Get Started     │  │ (Button - Blue)
│    └─────────────────┘  │
│                         │
└─────────────────────────┘
```

### Mandatory Content
- ✓ Animated airplane icon
- ✓ App name "Shipra"
- ✓ Tagline/subtitle
- ✓ Loading animation
- ✓ "Get Started" call-to-action button

### User Actions
| Action | Target | Result |
|--------|--------|--------|
| Tap "Get Started" | LOGIN SCREEN | Navigate to login |

### Visual States
- **Default**: Animated gradient background, pulsing elements
- **Button Hover**: Scale up, add shadow glow

### Navigation Path
```
SPLASH SCREEN → (Get Started) → LOGIN SCREEN
```

---

## SCREEN 2: LOGIN SCREEN
**Authentication** | **Entry Gate**

### Purpose
- User authentication (new or returning)
- Two login method options
- Privacy agreement acknowledgment

### Screen Content & Layout
```
┌─────────────────────────┐
│                         │
│  "Welcome to Shipra"    │ (Heading)
│                         │
│"Book your bird        │ (Subheading)
│ in seconds"             │
│                         │
│   ┌─────────────────┐   │
│   │  Airplane Emoji │   │ (Illustration/Icon)
│   │  in Gradient    │   │
│   │     Box         │   │
│   └─────────────────┘   │
│                         │
│ ┌───────────────────┐   │
│ │ 🔤 Sign in with   │   │ (White/Gray Button)
│ │ Google            │   │
│ └───────────────────┘   │
│                         │
│ ┌───────────────────┐   │
│ │ 💬 Login with     │   │ (Primary Blue Button)
│ │ WhatsApp          │   │
│ └───────────────────┘   │
│                         │
│ Terms & Privacy Links   │ (Small Text, Blue)
│ (Underlined)            │
│                         │
│ "Premium air travel"    │ (Footer Text - Muted)
│ "experience"            │
│                         │
└─────────────────────────┘
```

### Mandatory Content
- ✓ Welcome message/heading
- ✓ Subheading text
- ✓ Google sign-in button
- ✓ WhatsApp OTP login button
- ✓ Terms & Privacy links
- ✓ Footer tagline

### User Actions
| Action | Target | Result |
|--------|--------|--------|
| Tap Google button | HOME SCREEN | Authenticate & navigate |
| Tap WhatsApp button | HOME SCREEN | Authenticate & navigate |
| Tap Terms link | External | Open terms page |
| Tap Privacy link | External | Open privacy page |

### Visual States
- **Google Button**: White/light background, hover scale
- **WhatsApp Button**: Primary blue, hover shadow
- **Links**: Underlined, color change on hover

### Navigation Path
```
LOGIN SCREEN → (Google/WhatsApp) → HOME SCREEN
```

---

## SCREEN 3: HOME SCREEN
**Main Dashboard** | **Central Hub** | **After Login**

### Purpose
- Show available birds/services
- Display user location
- Main entry point for booking
- Access to other features via bottom nav

### Screen Content & Layout
```
┌─────────────────────────┐
│ Hey, Traveler!          │ (Greeting)
│ 📍 Downtown Airport     │ (Location with icon)
├─────────────────────────┤
│                         │
│    ┌───────────────┐    │
│    │  MAP AREA     │    │ (Live Location Map)
│    │  🗺️            │    │
│    │ (Animated)    │    │
│    │ 🔴 (Marker)   │    │
│    └───────────────┘    │
│                         │
├─────────────────────────┤
│ ┌──────────────────┐   │
│ │ Nearest Bird     │   │ (Availability Card)
│ │ Available        │   │
│ │                  │   │
│ │ ✈️ Bird #42      │   │
│ │ Ready | ⚡       │   │
│ │                  │   │
│ │ 2.3 km away      │   │
│ │ 4 min             │   │
│ └──────────────────┘   │
│                         │
│ ┌──────────────────┐   │
│ │ Book a Bird    │   │ (Primary Button)
│ └──────────────────┘   │
│                         │
└─────────────────────────┘
```

### Mandatory Content
- ✓ Greeting message ("Hey, Traveler!")
- ✓ Current location display with icon
- ✓ Live map area with pulsing animation
- ✓ Availability card showing nearest aircraft
- ✓ Aircraft ID (e.g., "Bird #42")
- ✓ Distance and time estimate
- ✓ "Book a Bird" button

### User Actions
| Action | Target | Result |
|--------|--------|--------|
| Tap "Book a Bird" | BOOKING SCREEN | Navigate to booking |
| Tap Home icon (bottom nav) | HOME SCREEN | Refresh/stay |
| Tap History icon (bottom nav) | HISTORY SCREEN | View past bookings |
| Tap Profile icon (bottom nav) | PROFILE SCREEN | View profile |

### Visual States
- **Map Area**: Pulsing circles (ripple effect), hover zoom effect
- **Availability Card**: Hover lift effect, animated icon
- **Button**: Hover scale, shadow glow

### Navigation Path
```
HOME SCREEN → Book a Bird → BOOKING SCREEN
HOME SCREEN → History → HISTORY SCREEN
HOME SCREEN → Profile → PROFILE SCREEN
```

---

## SCREEN 4: BOOKING SCREEN
**Bird Selection & Confirmation** | **Route Planning**

### Purpose
- User selects departure and arrival locations
- Shows trip details and pricing
- Confirms booking

### Screen Content & Layout
```
┌─────────────────────────┐
│ Book Your Bird        │ (Header)
│ Select your route       │ (Subheader)
│                         │
├─────────────────────────┤
│ From:                   │
│ ┌─────────────────────┐ │
│ │ 📍 Downtown Airport │ │ (From Location)
│ │    (Fixed)          │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ ⇄ (Swap Button)     │ │ (Rotates on click)
│ └─────────────────────┘ │
│                         │
│ To:                     │
│ ┌─────────────────────┐ │
│ │ 📍 City Center      │ │ (To Location)
│ │    Terminal         │ │ (or Swapped)
│ └─────────────────────┘ │
│                         │
├─────────────────────────┤
│ Trip Details:           │
│                         │
│ Distance: 12.5 km       │ (Metric 1)
│ Est. Time: 15 minutes   │ (Metric 2)
│ Service Fee: ₹150       │ (Metric 3)
│                         │
├─────────────────────────┤
│ Price Breakdown:        │
│                         │
│ Subtotal: ₹2,850        │
│ ⚡ Total: ₹3,000        │ (Animated)
│                         │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ Confirm Booking     │ │ (Primary Button)
│ └─────────────────────┘ │
│                         │
└─────────────────────────┘
```

### Mandatory Content
- ✓ Heading: "Book Your Bird"
- ✓ From location (default: Downtown Airport)
- ✓ To location
- ✓ Swap button to interchange locations
- ✓ Trip details (distance, time, fees)
- ✓ Price breakdown (subtotal, total)
- ✓ "Confirm Booking" button

### User Actions
| Action | Target | Result |
|--------|--------|--------|
| Tap Swap button | Local State | Swap from/to locations |
| Tap "Confirm Booking" | RIDE STATUS SCREEN | Book bird & navigate |
| Back (system) | HOME SCREEN | Cancel booking |

### Visual States
- **Location Cards**: Hover lift effect
- **Swap Button**: Rotate 180° on click, hover color
- **Price Section**: Pulsing animation for total amount
- **Confirm Button**: Hover scale, shadow

### Navigation Path
```
HOME SCREEN → BOOKING SCREEN → Confirm → RIDE STATUS SCREEN
BOOKING SCREEN → (Back) → HOME SCREEN
```

---

## SCREEN 5: RIDE STATUS SCREEN
**Tracking Arrival** | **Bird Assignment**

### Purpose
- Show aircraft approaching user
- Real-time distance and time tracking
- Allow user to continue to bird or cancel booking

### Screen Content & Layout
```
┌─────────────────────────┐
│ Your Bird is Arriving   │ (Header)
│ Bird #42 assigned     │ (Subheader)
│                         │
├─────────────────────────┤
│   ┌────────────────┐   │
│   │ TRACKER MAP    │   │ (Live Tracking)
│   │    ✈️ (bounce) │   │ (Animated plane)
│   │  • Live Track  │   │
│   │ 🟢 (top-right) │   │ (ETA marker)
│   └────────────────┘   │
│                         │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ Distance from You   │ │ (Stat 1)
│ │    1.2 km           │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Time to Arrive      │ │ (Stat 2)
│ │    4 minutes        │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Status              │ │ (Stat 3)
│ │ Live • On Time 🟢   │ │ (Pulsing indicator)
│ └─────────────────────┘ │
│                         │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ Continue to Bird  │ │ (Primary Button)
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Cancel Booking      │ │ (Secondary Button)
│ └─────────────────────┘ │
│                         │
└─────────────────────────┘
```

### Mandatory Content
- ✓ Header: "Your Bird is Arriving"
- ✓ Bird assignment info (Bird #42)
- ✓ Live tracker map with animated airplane
- ✓ Distance metric (1.2 km)
- ✓ Time to arrival metric (4 minutes)
- ✓ Status badge with pulsing indicator
- ✓ "Continue to Bird" button
- ✓ "Cancel Booking" button

### User Actions
| Action | Target | Result |
|--------|--------|--------|
| Tap "Continue to Bird" | RIDE IN PROGRESS SCREEN | Start active bird tracking |
| Tap "Cancel Booking" | HOME SCREEN | Cancel & return home |
| System monitoring | (Auto-update) | Real-time distance/time updates |

### Visual States
- **Tracker Map**: Bouncing airplane, pulsing circles
- **Status Indicator**: Green pulsing dot
- **Cards**: Hover lift effect
- **Buttons**: Hover scale, primary/secondary styles

### Navigation Path
```
BOOKING SCREEN → RIDE STATUS SCREEN → Continue → RIDE IN PROGRESS SCREEN
RIDE STATUS SCREEN → Cancel → HOME SCREEN
```

---

## SCREEN 6: RIDE IN PROGRESS SCREEN
**Active Bird Monitoring** | **Real-Time Tracking**

### Purpose
- Monitor active bird with live statistics
- Show estimated time remaining
- Provide emergency SOS option
- Allow bird completion

### Screen Content & Layout
```
┌─────────────────────────┐
│ Bird in Progress      │ (Header)
│ Bird #42 • Altitude:    │ (Subheader)
│ 250m                    │
│                         │
├─────────────────────────┤
│   ┌────────────────┐   │
│   │ LIVE ROUTE     │   │ (Route Visualization)
│   │  ✈️ → Moving   │   │ (Animated path)
│   │ (Gradient BG)  │   │
│   └────────────────┘   │
│                         │
├─────────────────────────┤
│ BIRD STATISTICS:      │
│                         │
│ ┌──────────┬──────────┐ │
│ │ Time     │ Speed    │ │ (2x2 Grid)
│ │ Remaining│          │ │
│ │ 8 min    │ 95 km/h  │ │
│ └──────────┴──────────┘ │
│                         │
│ ┌──────────┬──────────┐ │
│ │ Distance │ Altitude │ │
│ │ 6.2 km   │ 250 m    │ │
│ └──────────┴──────────┘ │
│                         │
├─────────────────────────┤
│ Status: Safe 🟢         │ (Status Badge)
│ All systems operational │
│                         │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ Complete Bird     │ │ (Primary Button)
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ 🚨 SOS / Emergency  │ │ (Emergency Button)
│ └─────────────────────┘ │
│                         │
└─────────────────────────┘
```

### Mandatory Content
- ✓ Header: "Bird in Progress"
- ✓ Bird ID and altitude info
- ✓ Live route visualization with moving airplane
- ✓ Statistics grid (4 metrics):
  - Time remaining
  - Current speed
  - Distance remaining
  - Current altitude
- ✓ Status indicator (Safe/Normal)
- ✓ "Complete Bird" button
- ✓ "🚨 SOS / Emergency" button (red)

### User Actions
| Action | Target | Result |
|--------|--------|--------|
| Tap "Complete Bird" | RIDE SUMMARY SCREEN | End bird & show summary |
| Tap "SOS / Emergency" | SOS SCREEN or MODAL | Show emergency interface |
| System monitoring | (Auto-update) | Real-time stats updates |

### Visual States
- **Route Animation**: Airplane moves along path
- **Status Badge**: Green pulsing indicator
- **Stats Cards**: Hover lift effect
- **SOS Button**: Red background, prominent
- **Complete Button**: Blue/primary styling

### Emergency Feature
When SOS button is tapped, one of two things happens:
1. **Modal Overlay**: Red emergency overlay appears over current screen
2. **Full Screen**: Navigate to full SOS screen

### Navigation Path
```
RIDE STATUS SCREEN → RIDE IN PROGRESS SCREEN → Complete → RIDE SUMMARY SCREEN
RIDE IN PROGRESS SCREEN → SOS → SOS SCREEN (or MODAL)
```

---

## SCREEN 7: SOS SCREEN
**Emergency Mode** | **Safety Response**

### Purpose
- Emergency alert system
- Dispatch emergency services
- Provide critical information during emergency
- Contact information display

### Screen Content & Layout
```
┌─────────────────────────┐
│                         │
│  RED BACKGROUND         │ (Destructive color alert)
│  WITH GRADIENT          │
│                         │
│      🚨 (Bouncing)      │ (Alarm emoji - animated)
│                         │
│  "EMERGENCY SOS"        │ (Large heading)
│                         │
│ "Stay calm. Help is     │ (Instructions)
│  being dispatched to    │
│  your location          │
│  immediately."          │
│                         │
├─────────────────────────┤
│                         │
│   ┌────────────────┐   │
│   │   SOS BUTTON   │   │ (Large - 128x128px)
│   │      SOS       │   │ (White bg, red text)
│   │  (Click active)│   │
│   └────────────────┘   │
│                         │
├─────────────────────────┤
│ EMERGENCY INFORMATION:  │
│                         │
│ ┌─────────────────────┐ │
│ │ Emergency Contact   │ │ (Card 1)
│ │ +91-XXXX-XXXX-01    │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Your Location       │ │ (Card 2)
│ │ 28.7041° N,         │ │
│ │ 77.1025° E          │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Bird ID             │ │ (Card 3)
│ │ Bird #42          │ │
│ └─────────────────────┘ │
│                         │
├─────────────────────────┤
│ EMERGENCY INSTRUCTIONS: │
│                         │
│ ✓ Stay in seat & calm   │ (Checklist item 1)
│ ✓ Keep phone accessible │ (Checklist item 2)
│ ✓ Help en route         │ (Checklist item 3)
│                         │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ Back to Bird      │ │ (Secondary Button)
│ └─────────────────────┘ │
│                         │
└─────────────────────────┘
```

### Mandatory Content
- ✓ Red alert background
- ✓ Animated alarm emoji
- ✓ "EMERGENCY SOS" heading
- ✓ Calming instructions text
- ✓ Large SOS button (interactive)
- ✓ Emergency contact number
- ✓ User location (GPS coordinates)
- ✓ Aircraft/bird ID
- ✓ Emergency instructions checklist (3 items)
- ✓ "Back to Bird" button to exit emergency mode

### User Actions
| Action | Target | Result |
|--------|--------|--------|
| Tap SOS button | (Dispatch Service) | Send emergency alert |
| Tap "Back to Bird" | RIDE IN PROGRESS SCREEN | Return to normal bird view |
| (Auto-action) | (Emergency Services) | Services dispatched immediately |

### Visual States
- **Background**: Red gradient, full screen
- **SOS Button**: Large, clickable, scale feedback
- **Information Cards**: White/10 background, white/20 borders
- **Instructions**: Checkmark style with clear hierarchy

### Navigation Path
```
RIDE IN PROGRESS SCREEN → SOS Button → SOS SCREEN
SOS SCREEN → "Back to Bird" → RIDE IN PROGRESS SCREEN
```

---

## SCREEN 8: RIDE SUMMARY SCREEN
**Trip Completion** | **Receipt & Confirmation**

### Purpose
- Celebrate successful trip completion
- Show trip summary and pricing
- Allow receipt download
- Provide option to book again

### Screen Content & Layout
```
┌─────────────────────────┐
│                         │
│    ┌──────────────┐    │
│    │   ✓ Check    │    │ (Success icon in circle)
│    │    (Bounce)  │    │ (Animated)
│    └──────────────┘    │
│                         │
│ "Bird Completed!"     │ (Large heading)
│                         │
│ "Thank you for flying   │ (Subheading)
│  with Shipra"           │
│                         │
├─────────────────────────┤
│                         │
│ ┌─────────────────────┐ │
│ │ Downtown Airport    │ │ (Route summary)
│ │      → (arrow)      │ │
│ │ City Center Terminal │ │
│ └─────────────────────┘ │
│                         │
├─────────────────────────┤
│ TRIP DETAILS:           │
│                         │
│ ┌─────────────────────┐ │
│ │ Distance Traveled   │ │ (Metric 1)
│ │    12.5 km          │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Bird Duration     │ │ (Metric 2)
│ │    15 minutes       │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Average Speed       │ │ (Metric 3)
│ │    92 km/h          │ │
│ └─────────────────────┘ │
│                         │
├─────────────────────────┤
│ COST BREAKDOWN:         │
│                         │
│ Base Fare: ₹2,850       │
│ Service Fee: ₹150       │
│                         │
│ ⚡ Total Paid: ₹3,000   │ (Highlighted/Pulsing)
│                         │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ 📥 Download Receipt │ │ (Secondary Button)
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Book Another Bird │ │ (Primary Button)
│ └─────────────────────┘ │
│                         │
└─────────────────────────┘
```

### Mandatory Content
- ✓ Success checkmark icon (animated bounce)
- ✓ "Bird Completed!" heading
- ✓ Thank you message
- ✓ Route summary (From → To)
- ✓ Trip details (3 metrics):
  - Distance traveled
  - Bird duration
  - Average speed
- ✓ Cost breakdown:
  - Base fare
  - Service fee
  - Total paid amount
- ✓ "Download Receipt" button
- ✓ "Book Another Bird" button

### User Actions
| Action | Target | Result |
|--------|--------|--------|
| Tap "Download Receipt" | (Download) | Download PDF/image receipt |
| Tap "Book Another Bird" | HOME SCREEN | Return to home dashboard |
| (View only) | N/A | Display trip confirmation |

### Visual States
- **Checkmark**: Bouncing animation on load
- **Details Cards**: Hover lift effect
- **Total Amount**: Pulsing animation
- **Buttons**: Primary/secondary styling with hover effects

### Navigation Path
```
RIDE IN PROGRESS SCREEN → Complete → RIDE SUMMARY SCREEN
RIDE SUMMARY SCREEN → "Book Another" → HOME SCREEN
```

---

## SCREEN 9: BOOKING HISTORY SCREEN
**Past Trips & Bookings** | **Travel History**

### Purpose
- Display all past bird bookings
- Show trip details and receipts
- Allow receipt downloads
- Display travel statistics

### Screen Content & Layout
```
┌─────────────────────────┐
│ Booking History         │ (Header)
│ View all your past      │ (Subheader)
│ birds                 │
│                         │
├─────────────────────────┤
│                         │
│ ┌─────────────────────┐ │
│ │ Downtown → Airport  │ │ (Booking 1)
│ │ Jan 20, 2024        │ │
│ │ ✓ Completed         │ │
│ │                     │ │
│ │ ⏱️ 12 min          │ │
│ │ 📍 8.5 km          │ │
│ │ 💵 $45.99          │ │
│ │                     │ │
│ │ 📥 Download Receipt │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Airport → Convention│ │ (Booking 2)
│ │ Jan 18, 2024        │ │
│ │ ✓ Completed         │ │
│ │                     │ │
│ │ ⏱️ 10 min          │ │
│ │ 📍 7.2 km          │ │
│ │ 💵 $38.50          │ │
│ │                     │ │
│ │ 📥 Download Receipt │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Hotel → Downtown    │ │ (Booking 3)
│ │ Jan 16, 2024        │ │
│ │ ✓ Completed         │ │
│ │                     │ │
│ │ ⏱️ 14 min          │ │
│ │ 📍 9.8 km          │ │
│ │ 💵 $52.00          │ │
│ │                     │ │
│ │ 📥 Download Receipt │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Downtown → Harbor   │ │ (Booking 4)
│ │ Jan 14, 2024        │ │
│ │ ✓ Completed         │ │
│ │                     │ │
│ │ ⏱️ 9 min           │ │
│ │ 📍 6.5 km          │ │
│ │ 💵 $35.75          │ │
│ │                     │ │
│ │ 📥 Download Receipt │ │
│ └─────────────────────┘ │
│                         │
├─────────────────────────┤
│ SUMMARY:                │
│ Total Birds: 12       │ (Stat 1)
│ Total Spent: $524.24    │ (Stat 2)
│                         │
└─────────────────────────┘
```

### Mandatory Content
- ✓ Header: "Booking History"
- ✓ Subheader: "View all your past birds"
- ✓ Multiple booking cards (at least 4) with:
  - Route (From → To)
  - Date
  - Status badge
  - Duration
  - Distance
  - Cost
  - Download receipt option
- ✓ Summary section:
  - Total birds count
  - Total amount spent

### User Actions
| Action | Target | Result |
|--------|--------|--------|
| Tap "Download Receipt" | (Download) | Download receipt for that booking |
| Tap booking card | (Optional) | View detailed trip info (future feature) |
| Tap History icon (bottom nav) | HISTORY SCREEN | Refresh/stay |
| Swipe/Scroll | (Auto-scroll) | View more bookings |

### Visual States
- **Booking Cards**: Hover lift and scale effect
- **Download Button**: Hover color change
- **Icons**: Rotate on hover
- **Cards**: Animated entrance with stagger

### Navigation Path
```
HOME SCREEN → History (bottom nav) → BOOKING HISTORY SCREEN
BOOKING HISTORY SCREEN → Download Receipt → (Receipt file)
```

---

## SCREEN 10: PROFILE SCREEN
**User Account & Settings** | **Account Management**

### Purpose
- Display user profile information
- Show user statistics
- Provide access to settings and preferences
- Account logout

### Screen Content & Layout
```
┌─────────────────────────┐
│                         │
│    ┌──────────────┐    │
│    │  SA           │    │ (Avatar - Initials)
│    │ (Gradient)   │    │ (Circular badge)
│    └──────────────┘    │
│                         │
│ Sarah Anderson          │ (Name)
│ sarah.anderson@         │ (Email)
│ example.com             │
│                         │
├─────────────────────────┤
│                         │
│ STATISTICS:             │
│                         │
│ ┌──────────┬──────────┐ │
│ │ Birds  │ Rating   │ │ (3-column grid)
│ │    12    │   4.8 ⭐ │ │
│ └──────────┴──────────┘ │
│                          │
│ ┌──────────┐            │
│ │ Status   │            │
│ │  Gold    │            │
│ └──────────┘            │
│                         │
├─────────────────────────┤
│ SETTINGS & PREFERENCES: │
│                         │
│ ⚙️ Settings             │ (Menu item 1)
│ App preferences &       │
│ profile                 │
│ →                       │
│                         │
│ 🔔 Notifications        │ (Menu item 2)
│ Manage alerts &         │
│ updates                 │
│ →                       │
│                         │
│ 🛡️ Safety & Privacy     │ (Menu item 3)
│ Security settings       │
│ →                       │
│                         │
│ 🏆 Rewards              │ (Menu item 4)
│ Loyalty points &        │
│ offers                  │
│ →                       │
│                         │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ 🚪 Logout           │ │ (Logout Button - Red)
│ └─────────────────────┘ │
│                         │
└─────────────────────────┘
```

### Mandatory Content
- ✓ User avatar (circular with initials)
- ✓ User name
- ✓ User email
- ✓ User statistics (3 stats):
  - Total birds
  - Rating
  - Membership status
- ✓ Menu items (4 options):
  - Settings (with description)
  - Notifications (with description)
  - Safety & Privacy (with description)
  - Rewards (with description)
- ✓ Logout button (red/destructive)

### User Actions
| Action | Target | Result |
|--------|--------|--------|
| Tap Settings | SETTINGS PAGE (future) | Open app settings |
| Tap Notifications | NOTIFICATIONS PAGE (future) | Manage notifications |
| Tap Safety & Privacy | PRIVACY PAGE (future) | Security settings |
| Tap Rewards | REWARDS PAGE (future) | View loyalty points |
| Tap Logout | LOGIN SCREEN | Logout & return to login |
| Tap Profile icon (bottom nav) | PROFILE SCREEN | Refresh/stay |

### Visual States
- **Avatar**: Hover scale(1.1)
- **Menu Items**: Hover right translation, background color fill
- **Icons**: Rotate on hover
- **Logout Button**: Red background, hover shadow
- **All Elements**: Animated entrance on load

### Navigation Path
```
HOME SCREEN → Profile (bottom nav) → PROFILE SCREEN
PROFILE SCREEN → Settings → (Settings page)
PROFILE SCREEN → Logout → LOGIN SCREEN
```

---

# PART 3: NAVIGATION ARCHITECTURE

## Bottom Navigation Bar
**Visibility**: Only visible on HOME, HISTORY, PROFILE screens
**Hidden**: During SPLASH, LOGIN, BOOKING, RIDE STATUS, RIDE IN PROGRESS, SUMMARY, SOS screens

### Navigation Items
```
┌─────────────────────────────────────┐
│  🏠        🕐        👤            │
│  HOME    HISTORY   PROFILE         │
│                                    │
│  (Active item: larger, colored)    │
└─────────────────────────────────────┘
```

| Icon | Label | Destination | Active State |
|------|-------|-------------|--------------|
| 🏠 | Home | HOME SCREEN | Highlighted blue |
| 🕐 | History | BOOKING HISTORY SCREEN | Highlighted blue |
| 👤 | Profile | PROFILE SCREEN | Highlighted blue |

---

# PART 4: COMPLETE NAVIGATION FLOW MAP

## All Screen Transitions

```
SPLASH SCREEN
    └─→ Get Started → LOGIN SCREEN

LOGIN SCREEN
    ├─→ Google Sign-in → HOME SCREEN
    └─→ WhatsApp Login → HOME SCREEN

HOME SCREEN (Navigation Hub)
    ├─→ Book a Bird → BOOKING SCREEN
    ├─→ History (nav) → BOOKING HISTORY SCREEN
    └─→ Profile (nav) → PROFILE SCREEN

BOOKING SCREEN
    ├─→ Confirm Booking → RIDE STATUS SCREEN
    └─→ Back/Cancel → HOME SCREEN

RIDE STATUS SCREEN
    ├─→ Continue to Bird → RIDE IN PROGRESS SCREEN
    └─→ Cancel Booking → HOME SCREEN

RIDE IN PROGRESS SCREEN
    ├─→ Complete Bird → RIDE SUMMARY SCREEN
    ├─→ SOS/Emergency → SOS SCREEN
    └─→ (Back to Bird from SOS) → RIDE IN PROGRESS SCREEN

RIDE SUMMARY SCREEN
    ├─→ Book Another Bird → HOME SCREEN
    └─→ Download Receipt → (Receipt file)

BOOKING HISTORY SCREEN
    ├─→ Download Receipt → (Receipt file)
    ├─→ Home (nav) → HOME SCREEN
    └─→ Profile (nav) → PROFILE SCREEN

PROFILE SCREEN
    ├─→ Logout → LOGIN SCREEN
    ├─→ Settings → (Future: SETTINGS PAGE)
    ├─→ Notifications → (Future: NOTIFICATIONS PAGE)
    ├─→ Safety & Privacy → (Future: PRIVACY PAGE)
    ├─→ Rewards → (Future: REWARDS PAGE)
    ├─→ Home (nav) → HOME SCREEN
    └─→ History (nav) → BOOKING HISTORY SCREEN

SOS SCREEN (Full Page)
    └─→ Back to Bird → RIDE IN PROGRESS SCREEN
```

---

# PART 5: DATA & INFORMATION REQUIREMENTS

## Information Displayed on Each Screen

### Home Screen Data
- User greeting name (e.g., "Traveler")
- Current location name
- Nearest available aircraft info:
  - Aircraft ID (e.g., "Bird #42")
  - Distance (e.g., "2.3 km")
  - Time estimate (e.g., "4 min")
  - Status (Ready)

### Booking Screen Data
- From location (editable selection)
- To location (editable selection)
- Distance between locations (e.g., "12.5 km")
- Estimated bird time (e.g., "15 minutes")
- Service fee (e.g., "₹150")
- Base fare/subtotal (e.g., "₹2,850")
- Total price (e.g., "₹3,000")

### Ride Status Screen Data
- Bird ID assignment (e.g., "Bird #42")
- Distance from user (e.g., "1.2 km")
- Time to arrival (e.g., "4 minutes")
- Current status (Live, On Time, etc.)

### Ride In Progress Screen Data
- Bird ID and altitude (e.g., "Bird #42 • 250m")
- Time remaining (e.g., "8 min")
- Current speed (e.g., "95 km/h")
- Distance remaining (e.g., "6.2 km")
- Current altitude (e.g., "250 m")
- Overall bird status (Safe, Operational, etc.)

### Ride Summary Screen Data
- Route summary (From → To)
- Distance traveled (e.g., "12.5 km")
- Duration (e.g., "15 minutes")
- Average speed (e.g., "92 km/h")
- Base fare (e.g., "₹2,850")
- Service fee (e.g., "₹150")
- Total paid (e.g., "₹3,000")

### SOS Screen Data
- Emergency contact number
- User's GPS coordinates
- Aircraft/Bird ID
- Emergency status message

### Booking History Screen Data
For each booking:
- Route (From → To)
- Date of booking
- Status (Completed, Cancelled, etc.)
- Duration
- Distance
- Cost
- Receipt availability

### Profile Screen Data
- User name
- User email
- Total birds completed
- User rating
- Membership status/tier
- Menu options for settings

---

# PART 6: CRITICAL MANDATORY FEATURES

## Must-Have Functionality

### 1. Authentication
- ✓ Google sign-in option
- ✓ WhatsApp OTP login option
- ✓ Successful login → HOME SCREEN

### 2. Booking System
- ✓ From/To location selection
- ✓ Swap locations functionality
- ✓ Real-time price calculation
- ✓ Trip details display
- ✓ Booking confirmation

### 3. Bird Tracking
- ✓ Real-time distance updates
- ✓ Time to arrival updates
- ✓ Live route visualization
- ✓ Bird statistics display

### 4. Emergency System
- ✓ Easy SOS button access
- ✓ Emergency contact display
- ✓ Location sharing
- ✓ Emergency instructions

### 5. User Management
- ✓ Profile viewing
- ✓ Booking history display
- ✓ Receipt download capability
- ✓ Account logout

### 6. Navigation
- ✓ Bottom navigation bar (Home, History, Profile)
- ✓ Proper screen transitions
- ✓ Back navigation support

### 7. Visual Feedback
- ✓ Animated transitions between screens
- ✓ Hover effects on interactive elements
- ✓ Status indicators (success, warning, error)
- ✓ Loading states

---

# PART 7: USER JOURNEY SCENARIOS

## Complete User Flows

### Scenario 1: New User - First Bird Booking
```
Step 1: User opens app → SPLASH SCREEN (welcome animation)
Step 2: User taps "Get Started" → LOGIN SCREEN
Step 3: User signs in with Google/WhatsApp → HOME SCREEN
Step 4: User views available birds and taps "Book a Bird" → BOOKING SCREEN
Step 5: User confirms booking → RIDE STATUS SCREEN (tracking begins)
Step 6: User taps "Continue to Bird" → RIDE IN PROGRESS SCREEN
Step 7: User monitors real-time bird data
Step 8: User taps "Complete Bird" → RIDE SUMMARY SCREEN
Step 9: User downloads receipt and taps "Book Another Bird" → HOME SCREEN
```

### Scenario 2: Emergency During Bird
```
Step 1: User is on RIDE IN PROGRESS SCREEN
Step 2: User taps "SOS / Emergency" button
Step 3: SOS modal or full screen appears with red alert
Step 4: Emergency services are alerted
Step 5: User sees emergency contact, location, and instructions
Step 6: User taps "Back to Bird" → Returns to RIDE IN PROGRESS SCREEN
```

### Scenario 3: View Booking History & Download Receipt
```
Step 1: User is on HOME SCREEN
Step 2: User taps History icon (bottom nav) → BOOKING HISTORY SCREEN
Step 3: User sees list of past bookings
Step 4: User taps "Download Receipt" on a booking → Receipt downloads
Step 5: User can return to HOME or tap Profile icon → PROFILE SCREEN
```

### Scenario 4: Manage Profile & Logout
```
Step 1: User is on HOME SCREEN
Step 2: User taps Profile icon (bottom nav) → PROFILE SCREEN
Step 3: User views profile info and statistics
Step 4: User can tap Settings/Notifications/Safety/Rewards (future features)
Step 5: User taps "Logout" button → LOGIN SCREEN (session ends)
```

---

# PART 8: SUMMARY TABLE

## All 10 Screens at a Glance

| # | Screen Name | Purpose | Key Actions | Next Screen(s) |
|---|------------|---------|-------------|----------------|
| 1 | Splash | Onboarding & branding | Get Started | Login |
| 2 | Login | User authentication | Google/WhatsApp sign-in | Home |
| 3 | Home | Main dashboard & booking hub | Book bird / History / Profile | Booking / History / Profile |
| 4 | Booking | Route selection & pricing | Swap locations / Confirm | Ride Status |
| 5 | Ride Status | Arrival tracking | Continue / Cancel | Ride In Progress / Home |
| 6 | Ride In Progress | Active bird monitoring | Complete / SOS | Ride Summary / SOS |
| 7 | SOS | Emergency response | Report emergency / Back | Ride In Progress |
| 8 | Ride Summary | Trip completion & receipt | Download / Book Another | Home |
| 9 | Booking History | Past trips review | Download Receipt | Home / Profile |
| 10 | Profile | Account management | Settings / Logout | Settings (future) / Login |

---

# PART 9: DESIGN SPECIFICATIONS (Visual)

## Screen Layout Constraints
- **Device**: Mobile (Mobile-first design)
- **Max Width**: ~448px (typical mobile width)
- **Orientation**: Portrait
- **Safe Areas**: Consideration for notches and bottom nav

## Color Usage

### Semantic Colors
- **Primary (Blue)**: Main actions, buttons, active states
- **Accent (Orange)**: Highlights, CTAs, emphasis
- **Success (Green)**: Status confirmations, success badges
- **Destructive (Red)**: Emergency alerts, danger states, logout
- **Background**: Light mode (white), dark mode (dark gray)
- **Foreground**: Text colors (black/white based on mode)
- **Muted**: Secondary text, disabled states
- **Card**: Card/container backgrounds

## Typography

### Heading Hierarchy
- **Screen Title**: Large, bold (24-48px)
- **Section Heading**: Medium, bold (18-24px)
- **Body Text**: Regular (14-18px)
- **Caption**: Small, muted (12-14px)

### Font Families
- **Headings**: Bold weight
- **Body**: Regular weight
- **Emphasis**: Can use accent colors or weight

---

# CONCLUSION

This document provides a complete product requirements overview of the Shipra air mobility application, including:

1. **10 interactive screens** with detailed content specifications
2. **Complete navigation paths** showing all screen transitions
3. **User journeys** for common scenarios
4. **Mandatory data and features** required for functionality
5. **Visual and interaction specifications** for each screen
6. **Information architecture** and data requirements

All information is presented from a **user-perspective** and **product-focused** lens, without technical implementation details.
