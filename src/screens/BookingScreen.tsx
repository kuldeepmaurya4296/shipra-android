import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert,
    ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useAuth } from '../context/AuthContext';
import {
    ArrowLeft, Clock, CreditCard, Ruler, Zap, Plane,
    Shield, User, Navigation, RefreshCw
} from 'lucide-react-native';
import client from '../api/client';
import AppMap from '../components/AppMap';
import { getBirdLocation } from '../utils/mapUtils';
import { getAirDistanceKm, calculateFare, calculateTravelTime } from '../utils/locationUtils';
import { RAZORPAY_KEY_ID } from '@env';
import RazorpayCheckout from 'react-native-razorpay';

type Props = StackScreenProps<RootStackParamList, 'Booking'>;

type BookingState = 'idle' | 'processing_payment' | 'processing_booking' | 'success' | 'failed_booking';

export default function BookingScreen({ route, navigation }: Props) {
    const { from, to, fromCoords, toCoords, stops } = route.params;
    const { user } = useAuth();

    // UI State
    const [bookingState, setBookingState] = useState<BookingState>('idle');
    const [loadingData, setLoadingData] = useState(true);

    // Data State
    const [birds, setBirds] = useState<any[]>([]);
    const [assignedBird, setAssignedBird] = useState<any>(null);
    const [paymentData, setPaymentData] = useState<any>(null);

    // Context State
    const [distance, setDistance] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const [fare, setFare] = useState<number>(0);
    const [fromCoord, setFromCoord] = useState<{ latitude: number; longitude: number } | null>(fromCoords || null);
    const [toCoord, setToCoord] = useState<{ latitude: number; longitude: number } | null>(toCoords || null);

    useEffect(() => {
        initializeBooking();
    }, []);

    const initializeBooking = async () => {
        try {
            setLoadingData(true);
            const birdsRes = await client.get('/birds');
            const allBirds = birdsRes.data;
            setBirds(allBirds);

            let calculatedDistance = 0;
            let finalFrom = fromCoord;
            let finalTo = toCoord;

            // Strategy 1: Use provided coordinates (Air Distance)
            if (fromCoords && toCoords) {
                if (stops && stops.length > 0) {
                    // Multi-stop distance
                    let total = 0;
                    let curr = fromCoords;
                    stops.forEach((s: any) => {
                        total += getAirDistanceKm(curr.latitude, curr.longitude, s.coords.latitude, s.coords.longitude);
                        curr = s.coords;
                    });
                    total += getAirDistanceKm(curr.latitude, curr.longitude, toCoords.latitude, toCoords.longitude);
                    calculatedDistance = total;
                } else {
                    // Direct distance
                    calculatedDistance = getAirDistanceKm(
                        fromCoords.latitude, fromCoords.longitude,
                        toCoords.latitude, toCoords.longitude
                    );
                }
            }
            // Strategy 2: Fallback to stations (Legacy)
            else {
                try {
                    const stationsRes = await client.get('/stations');
                    const fromStation = stationsRes.data.find((s: any) => s.name === from);
                    const toStation = stationsRes.data.find((s: any) => s.name === to);

                    if (fromStation?.location && toStation?.location) {
                        finalFrom = { latitude: fromStation.location.lat, longitude: fromStation.location.lng };
                        finalTo = { latitude: toStation.location.lat, longitude: toStation.location.lng };
                        setFromCoord(finalFrom);
                        setToCoord(finalTo);

                        calculatedDistance = getAirDistanceKm(
                            finalFrom.latitude, finalFrom.longitude,
                            finalTo.latitude, finalTo.longitude
                        );
                    }
                } catch (e) {
                    console.warn('Station fallback failed', e);
                }
            }

            if (calculatedDistance > 0) {
                const dist = parseFloat(calculatedDistance.toFixed(2));
                setDistance(dist);
                setDuration(calculateTravelTime(dist));
                setFare(calculateFare(dist));

                // Assign Bird
                if (allBirds.length > 0 && finalFrom) {
                    const sortedBirds = allBirds.map((bird: any) => {
                        const loc = getBirdLocation(bird);
                        return {
                            ...bird,
                            distFromPickup: getAirDistanceKm(finalFrom!.latitude, finalFrom!.longitude, loc.latitude, loc.longitude)
                        };
                    }).sort((a: any, b: any) => a.distFromPickup - b.distFromPickup);

                    // Prefer active OR available birds
                    const bestBird = sortedBirds.find((b: any) => b.status === 'active' || !b.status) || sortedBirds[0];
                    setAssignedBird(bestBird);
                }
            }
        } catch (error) {
            console.error('Booking init failed:', error);
            Alert.alert('Error', 'Could not load booking details. Please try again.');
            navigation.goBack();
        } finally {
            setLoadingData(false);
        }
    };

    /**
     * Validates user and booking requirements before payment
     */
    const validateRequirements = (): boolean => {
        if (!assignedBird) {
            Alert.alert('No Bird Available', 'We could not assign a bird for this route at the moment.');
            return false;
        }

        const email = user?.email;
        const phone = user?.whatsappNumber || user?.phone;

        if (!email || !phone) {
            Alert.alert(
                'Profile Incomplete',
                'Please add your Email and WhatsApp number in your profile to proceed.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Go to Profile', onPress: () => navigation.navigate('Profile') },
                ]
            );
            return false;
        }
        return true;
    };

    /**
     * Step 1: Initiate Payment
     */
    const handleInitiatePayment = async () => {
        if (!validateRequirements()) return;

        setBookingState('processing_payment');

        const userEmail = user?.email || 'user@shipra.com';
        const userContact = user?.whatsappNumber || user?.phone || '';

        const options = {
            description: `Shipra Flight: ${from} to ${to}`,
            image: 'https://i.imgur.com/3g7nmJC.png',
            currency: 'INR',
            key: RAZORPAY_KEY_ID,
            amount: fare * 100, // Amount in paise
            name: 'Shipra Air Mobility',
            prefill: {
                email: userEmail,
                contact: userContact.replace(/\D/g, ''), // Clean phone
                name: user?.name || 'Guest',
            },
            theme: { color: colors.primary },
        };

        try {
            const data = await RazorpayCheckout.open(options);
            console.log('[Payment] Success:', data);

            // SAVE PAYMENT DATA IMMEDIATELY
            setPaymentData(data);

            // Proceed to Step 2
            handleCreateBooking(data);
        } catch (error: any) {
            console.log('[Payment] Error/Cancel:', error);
            setBookingState('idle');
            if (error.code && error.description) {
                Alert.alert('Payment Failed', error.description);
            }
        }
    };

    /**
     * Step 2: Create Booking on Backend
     */
    /**
     * Step 2: Create Booking on Backend (with Auto-Retry)
     */
    const handleCreateBooking = async (pData: any) => {
        setBookingState('processing_booking');

        let attempts = 0;
        const maxAttempts = 3;

        // Prepare payload once
        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
        const userPhone = (user?.whatsappNumber || user?.phone || '').replace(/\D/g, '');


        const payload = {
            birdNumber: `${assignedBird.model || 'Bird'}-${Math.floor(100 + Math.random() * 900)}`,
            from: from,
            to: to,
            fromCoords: fromCoord,
            toCoords: toCoord,
            date: new Date().toISOString(),
            amount: Number(fare),
            distance: Number(distance),
            distanceType: 'air_displacement',
            status: 'confirmed',
            birdId: assignedBird._id,
            paymentId: pData.razorpay_payment_id,
            otp: otpCode,
            phone: userPhone,
            whatsappNumber: userPhone,
            email: user?.email,

        };

        const tryCreate = async () => {
            attempts++;
            try {
                console.log(`[Booking] Attempt ${attempts}...`);
                const response = await client.post('/bookings', payload);
                console.log('[Booking] Created:', response.data);

                // Non-blocking storage save
                saveTripToStorage(payload, response.data).catch(e => console.warn('Bg Storage Error', e));
                setBookingState('success');

                // Immediate navigation - removed blocking Alert
                navigation.replace('RideStatus', { bookingId: response.data._id, otp: otpCode, initialData: response.data });
                return true;
            } catch (error: any) {
                console.error(`[Booking] Attempt ${attempts} Failed:`, error.message);

                if (attempts < maxAttempts) {
                    // Retry after delay
                    setTimeout(tryCreate, 2000);
                } else {
                    // Final failure
                    setBookingState('failed_booking');
                    const errMsg = error.response?.data?.message || 'Network error occurred while saving your booking.';
                    Alert.alert(
                        'Booking Creation Failed',
                        `Payment was successful, but we couldn't create the booking record after multiple attempts.\n\nError: ${errMsg}\n\nPlease tap "Retry Booking" to try again.`,
                        [{ text: 'OK' }]
                    );
                }
                return false;
            }
        };

        // Start first attempt
        tryCreate();
    };

    const saveTripToStorage = async (payload: any, responseData: any) => {
        try {
            const tripData = {
                ...payload,
                _id: responseData._id,
                userName: user?.name,
                userEmail: user?.email,
                userPhone: payload.phone,
                // Add backup fields
                whatsappNumber: user?.whatsappNumber || payload.phone,
                aadharNumber: user?.aadharNumber || '-',
                panNumber: user?.panNumber || '-',
                currentAddress: user?.currentAddress || '-',
            };
            await AsyncStorage.setItem('current_trip_data', JSON.stringify(tripData));
        } catch (e) {
            console.warn('Failed to save trip locally', e);
        }
    };

    const handleRetry = () => {
        if (paymentData) {
            handleCreateBooking(paymentData);
        } else {
            Alert.alert('Error', 'No payment data found to retry. Please start over.');
            setBookingState('idle');
        }
    };

    if (loadingData) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Preparing flight plan...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} disabled={bookingState !== 'idle' && bookingState !== 'failed_booking'}>
                    <ArrowLeft size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={styles.title}>Confirm Booking</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* ─── Map Visualization ─── */}
                <View style={styles.mapCard}>
                    {fromCoord && toCoord ? (
                        <AppMap
                            style={StyleSheet.absoluteFillObject}
                            routeStart={fromCoord}
                            routeEnd={toCoord}
                            waypoints={stops ? stops.map((s: any) => s.coords) : []}
                            birds={assignedBird ? [{ ...assignedBird, currentLocation: getBirdLocation(assignedBird) }] : []}
                            stations={[]}
                        />
                    ) : (
                        <View style={styles.mapLoading}>
                            <ActivityIndicator size="large" color={colors.primary} />
                        </View>
                    )}
                </View>

                {/* ─── Warning Banner if Failed ─── */}
                {bookingState === 'failed_booking' && (
                    <View style={styles.errorBanner}>
                        <Shield size={20} color="#991b1b" />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.errorTitle}>Action Required</Text>
                            <Text style={styles.errorText}>Payment successful, but booking failed. Please retry to avoid losing your slot.</Text>
                        </View>
                    </View>
                )}

                {/* ─── Route & Stats ─── */}
                <View style={styles.card}>
                    {stops && stops.length > 0 ? (
                        <View style={styles.timelineContainer}>
                            {/* Pickup */}
                            <View style={styles.timelineItem}>
                                <View style={styles.timelineDotStart} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>PICKUP</Text>
                                    <Text style={styles.addressText}>{from}</Text>
                                </View>
                            </View>
                            {/* Stops */}
                            {stops.map((stop: any, idx: number) => (
                                <View key={idx} style={styles.timelineItem}>
                                    <View style={styles.timelineDotStop} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.label}>STOP {idx + 1}</Text>
                                        <Text style={styles.addressText}>{stop.address}</Text>
                                    </View>
                                </View>
                            ))}
                            {/* Drop */}
                            <View style={styles.timelineItem}>
                                <View style={styles.timelineDotEnd} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>DROP</Text>
                                    <Text style={styles.addressText}>{to}</Text>
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.routeRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>PICKUP</Text>
                                <Text style={styles.addressText} numberOfLines={3}>{from}</Text>
                            </View>
                            <View style={styles.routeArrow}>
                                <Plane size={16} color={colors.primary} style={{ transform: [{ rotate: '90deg' }] }} />
                            </View>
                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                <Text style={styles.label}>DROP</Text>
                                <Text style={[styles.addressText, { textAlign: 'right' }]} numberOfLines={3}>{to}</Text>
                            </View>
                        </View>
                    )}
                    <View style={styles.divider} />
                    <View style={styles.statsContainer}>
                        <View style={styles.stat}>
                            <Ruler size={16} color={colors.mutedForeground} />
                            <Text style={styles.statVal}>{distance} km</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.stat}>
                            <Clock size={16} color={colors.mutedForeground} />
                            <Text style={styles.statVal}>{duration >= 60 ? `${Math.floor(duration / 60)}h ${duration % 60}m` : `${duration} min`}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.stat}>
                            <Zap size={16} color={colors.mutedForeground} />
                            <Text style={styles.statVal}>~100 km/h</Text>
                        </View>
                    </View>
                </View>

                {/* ─── Assigned Bird ─── */}
                {assignedBird && (
                    <View style={styles.birdCard}>
                        <View style={styles.birdIcon}>
                            <Plane size={24} color="#fff" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.birdName}>{assignedBird.model || 'Eco-Bird'}</Text>
                            <Text style={styles.birdStatus}>Nearest Available • {assignedBird.distFromPickup?.toFixed(1)} km away</Text>
                        </View>
                    </View>
                )}

                {/* ─── Passenger ─── */}


                {/* ─── Pricing ─── */}
                <View style={styles.priceCard}>
                    <Text style={styles.priceLabel}>TOTAL FARE</Text>
                    <Text style={styles.priceVal}>₹{fare.toLocaleString()}</Text>
                </View>

            </ScrollView>

            {/* ─── Action Button ─── */}
            <View style={styles.footer}>
                <View style={styles.paymentMethod}>
                    <CreditCard size={18} color={colors.primary} />
                    <Text style={styles.paymentMethodText}>Razorpay Secure</Text>
                </View>

                {bookingState === 'failed_booking' ? (
                    <TouchableOpacity
                        style={[styles.payButton, styles.retryButton]}
                        onPress={handleRetry}
                        activeOpacity={0.8}
                    >
                        <RefreshCw size={20} color="#fff" />
                        <Text style={styles.payButtonText}>Retry Create Booking</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.payButton, (!assignedBird || bookingState !== 'idle') && styles.disabledBtn]}
                        onPress={handleInitiatePayment}
                        disabled={!assignedBird || bookingState !== 'idle'}
                        activeOpacity={0.8}
                    >
                        {bookingState === 'processing_payment' || bookingState === 'processing_booking' ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.payButtonText}>Pay & Book</Text>
                                <Navigation size={20} color="#fff" />
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadingText: { fontSize: 16, color: colors.mutedForeground },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 40, gap: 16 },
    backButton: { padding: 8, borderRadius: 50, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
    title: { fontSize: 20, fontWeight: 'bold', color: colors.foreground },
    content: { padding: 20, paddingBottom: 100 },

    // Cards
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 16 },
    mapCard: { height: 200, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, marginBottom: 16, backgroundColor: '#e2e8f0' },
    mapLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Error Banner
    errorBanner: { flexDirection: 'row', backgroundColor: '#fee2e2', borderRadius: 12, padding: 12, marginBottom: 16, gap: 12, alignItems: 'center', borderWidth: 1, borderColor: '#fca5a5' },
    errorTitle: { fontWeight: 'bold', color: '#991b1b', fontSize: 14 },
    errorText: { color: '#7f1d1d', fontSize: 12, marginTop: 2 },

    // Route
    routeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
    routeArrow: { justifyContent: 'center', alignItems: 'center', paddingTop: 12 },
    label: { fontSize: 10, fontWeight: 'bold', color: colors.mutedForeground, marginBottom: 4 },
    addressText: { fontSize: 14, fontWeight: '600', color: colors.foreground, maxWidth: 140 },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },

    // Stats
    statsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
    stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statVal: { fontSize: 14, fontWeight: '600', color: colors.foreground },
    statDivider: { width: 1, height: 20, backgroundColor: colors.border },

    // Bird
    birdCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ecfdf5', padding: 16, borderRadius: 16, marginBottom: 16, gap: 16, borderWidth: 1, borderColor: '#d1fae5' },
    birdIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.success, justifyContent: 'center', alignItems: 'center' },
    birdName: { fontSize: 16, fontWeight: 'bold', color: '#065f46' },
    birdStatus: { fontSize: 12, color: '#047857' },

    // Passenger


    // Pricing
    priceCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 20 },
    priceLabel: { fontSize: 14, color: colors.mutedForeground, fontWeight: '600' },
    priceVal: { fontSize: 24, fontWeight: 'bold', color: colors.primary },

    // Footer
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.border },
    paymentMethod: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, justifyContent: 'center' },
    paymentMethodText: { fontSize: 12, color: colors.mutedForeground },
    payButton: { backgroundColor: colors.primary, borderRadius: 16, padding: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    payButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    disabledBtn: { opacity: 0.5, backgroundColor: '#9ca3af' },
    retryButton: { backgroundColor: '#ea580c' },

    // Timeline
    timelineContainer: { gap: 16, paddingLeft: 4, paddingVertical: 4 },
    timelineItem: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
    timelineDotStart: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary, marginTop: 4 },
    timelineDotStop: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#8b5cf6', marginTop: 5, borderWidth: 1, borderColor: '#fff', elevation: 2 },
    timelineDotEnd: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.accent, marginTop: 4 },
});
