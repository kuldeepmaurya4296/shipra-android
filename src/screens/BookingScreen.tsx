import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView, Alert,
    ActivityIndicator, StyleSheet, Modal, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useAuth } from '../context/AuthContext';
import {
    ArrowLeft, Clock, CreditCard, Ruler, Zap, Plane,
    Shield, Navigation, RefreshCw, X
} from 'lucide-react-native';
import client from '../api/client';
import AppMap from '../components/AppMap';
import { getBirdLocation } from '../utils/mapUtils';
import { getAirDistanceKm, calculateFare, calculateTravelTime, findNearestVerbiport, getRoadRoute } from '../utils/locationUtils';
import { RAZORPAY_KEY_ID } from '@env';
import RazorpayCheckout from 'react-native-razorpay';
import { styles } from './BookingScreen.styles';

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
    const [pickupVerbiport, setPickupVerbiport] = useState<{ latitude: number; longitude: number; name: string } | null>(null);
    const [dropVerbiport, setDropVerbiport] = useState<{ latitude: number; longitude: number; name: string } | null>(null);
    const [pickupPath, setPickupPath] = useState<any[]>([]);
    const [dropPath, setDropPath] = useState<any[]>([]);
    const [isMapFullScreen, setIsMapFullScreen] = useState(false);

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
            let vports = [];

            try {
                const verbiportsRes = await client.get('/verbiports');
                vports = verbiportsRes.data;
            } catch (e) {
                console.warn('Verbiports fetch failed', e);
            }

            // Strategy: 4-Point Routing
            if (fromCoords && toCoords && vports.length > 0) {
                const nearestPickup = findNearestVerbiport(fromCoords, vports, 50);
                const nearestDrop = findNearestVerbiport(toCoords, vports, 50);

                if (nearestPickup && nearestDrop) {
                    const pVP = { latitude: nearestPickup.location.lat, longitude: nearestPickup.location.lng, name: nearestPickup.name };
                    const dVP = { latitude: nearestDrop.location.lat, longitude: nearestDrop.location.lng, name: nearestDrop.name };
                    setPickupVerbiport(pVP);
                    setDropVerbiport(dVP);

                    // Fetch road routes for map
                    try {
                        const [pPath, dPath] = await Promise.all([
                            getRoadRoute(fromCoords, pVP),
                            getRoadRoute(dVP, toCoords)
                        ]);
                        setPickupPath(pPath || []);
                        setDropPath(dPath || []);
                    } catch (e) {
                        console.log('Error fetching road routes:', e);
                    }

                    // Air segment (P2 -> Stops -> P3)
                    let totalAir = 0;
                    let curr = pVP;

                    if (stops && stops.length > 0) {
                        stops.forEach((s: any) => {
                            totalAir += getAirDistanceKm(curr.latitude, curr.longitude, s.coords.latitude, s.coords.longitude);
                            curr = { ...s.coords, name: s.address };
                        });
                    }

                    totalAir += getAirDistanceKm(curr.latitude, curr.longitude, dVP.latitude, dVP.longitude);
                    calculatedDistance = totalAir;

                    // Destination for bird assignment is the pickup verbiport? No, usually bird needs to be at P1 or P2. 
                    // Let's assume bird assignment is based on distance to pickup verbiport.
                    finalFrom = pVP;
                } else {
                    // Fallback: direct air distance
                    calculatedDistance = getAirDistanceKm(fromCoords.latitude, fromCoords.longitude, toCoords.latitude, toCoords.longitude);
                }
            } else if (fromCoords && toCoords) {
                calculatedDistance = getAirDistanceKm(fromCoords.latitude, fromCoords.longitude, toCoords.latitude, toCoords.longitude);
            }

            if (calculatedDistance > 0) {
                const dist = parseFloat(calculatedDistance.toFixed(2));
                setDistance(dist);
                setDuration(calculateTravelTime(dist) + 20); // 20 min road buffer
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
            pickupVerbiport: pickupVerbiport,
            dropVerbiport: dropVerbiport,
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
                <View style={[styles.mapCard, { backgroundColor: '#f8fafc' }]}>
                    {fromCoord && toCoord ? (
                        <AppMap
                            style={StyleSheet.absoluteFillObject}
                            showUserLocation={false}
                            routeStart={fromCoord}
                            routeEnd={toCoord}
                            pickupVerbiport={pickupVerbiport || undefined}
                            dropVerbiport={dropVerbiport || undefined}
                            pickupPath={pickupPath}
                            dropPath={dropPath}
                            waypoints={stops ? stops.map((s: any) => s.coords) : []}
                            birds={[]}
                            verbiports={[]}
                            onFullScreenPress={() => setIsMapFullScreen(true)}
                            lockInteraction={true}
                        />
                    ) : (
                        <View style={styles.mapLoading}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={{ marginTop: 10, color: colors.mutedForeground, fontSize: 12 }}>Calculating Route...</Text>
                        </View>
                    )}
                </View>

                {/* ─── Full Screen Map Modal ─── */}
                <Modal
                    visible={isMapFullScreen}
                    animationType="fade"
                    onRequestClose={() => setIsMapFullScreen(false)}
                >
                    <View style={{ flex: 1, backgroundColor: '#000' }}>
                        <AppMap
                            style={{ flex: 1 }}
                            showUserLocation={false}
                            routeStart={fromCoord || undefined}
                            routeEnd={toCoord || undefined}
                            pickupVerbiport={pickupVerbiport || undefined}
                            dropVerbiport={dropVerbiport || undefined}
                            pickupPath={pickupPath}
                            dropPath={dropPath}
                            waypoints={stops ? stops.map((s: any) => s.coords) : []}
                            birds={[]}
                            verbiports={[]}
                            lockInteraction={true}
                        />

                        {/* Overlay Controls */}
                        <TouchableOpacity
                            style={{
                                position: 'absolute',
                                top: Platform.OS === 'android' ? 40 : 60,
                                right: 20, // Moved to right
                                backgroundColor: 'white',
                                padding: 12,
                                borderRadius: 30,
                                elevation: 5,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.25,
                                shadowRadius: 3.84,
                                zIndex: 1000,
                            }}
                            onPress={() => setIsMapFullScreen(false)}
                        >
                            <X size={24} color={colors.foreground} />
                        </TouchableOpacity>

                        {distance > 0 && (
                            <View style={{
                                position: 'absolute',
                                bottom: 30,
                                right: 20,
                                backgroundColor: colors.primary,
                                paddingHorizontal: 16,
                                paddingVertical: 10,
                                borderRadius: 12,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 6
                            }}>
                                <Ruler size={14} color="#fff" />
                                <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>{distance} km (Air)</Text>
                            </View>
                        )}
                    </View>
                </Modal>

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
                            <Ruler size={16} color={colors.primary} />
                            <Text style={styles.statVal}>{distance} km (Air)</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.stat}>
                            <Clock size={16} color={colors.primary} />
                            <Text style={styles.statVal}>{duration >= 60 ? `${Math.floor(duration / 60)}h ${duration % 60}m` : `${duration} min`}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.stat}>
                            <Zap size={16} color={colors.primary} />
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

// Styles have been moved to BookingScreen.styles.ts
