import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Animated, StyleSheet, ActivityIndicator, Platform, PermissionsAndroid, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { Clock, MapPin, Navigation, ArrowRight, ShieldAlert } from 'lucide-react-native';
import AppMap from '../components/AppMap';
import Geolocation from 'react-native-geolocation-service';
import { getRoadRoute, getAirDistanceKm } from '../utils/locationUtils';
import client from '../api/client';
import { styles } from './RideStatusScreen.styles';

type Props = StackScreenProps<RootStackParamList, 'RideStatus'>;

export default function RideStatusScreen({ navigation, route }: Props) {
    const { bookingId, otp, initialData } = route.params;
    const [booking, setBooking] = useState<any>(initialData || null);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [roadPath, setRoadPath] = useState<any[]>([]);
    const [distanceKm, setDistanceKm] = useState<number>(0);
    const [timeMins, setTimeMins] = useState<number>(0);
    const [isContinuing, setIsContinuing] = useState(false);
    const [statusScale] = useState(new Animated.Value(1));

    const watchIdRef = useRef<number | null>(null);

    // Fetch booking on mount & Poll for status changes
    useEffect(() => {
        let active = true;
        const fetchBooking = async () => {
            try {
                const res = await client.get(`/bookings/${bookingId}`);
                const data = res.data;
                if (!active) return;

                setBooking(data);

                // If ride is cancelled (e.g. by pilot or other), notify and return Home
                if (data.status === 'cancelled') {
                    Alert.alert("Ride Cancelled", "This ride has been cancelled.");
                    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
                }
            } catch (e) {
                console.log('[RideStatus] Fetch error:', e);
            }
        };

        fetchBooking();
        const interval = setInterval(fetchBooking, 5000);

        return () => {
            active = false;
            clearInterval(interval);
        };
    }, [bookingId, navigation]);

    // Track user location
    useEffect(() => {
        const startTracking = async () => {
            if (Platform.OS === 'android') {
                try {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                    );
                    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                        console.log('[RideStatus] Location permission denied');
                        return;
                    }
                } catch (err) {
                    console.warn(err);
                }
            }

            const success = (position: any) => {
                const coords = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
                console.log('[RideStatus] Location update:', coords);
                setUserLocation(coords);
            };

            const error = (err: any) => {
                console.log('[RideStatus] Geo error:', err);
                // Fallback: try with high accuracy false if it failed
                Geolocation.getCurrentPosition(
                    success,
                    (e) => console.log('[RideStatus] Final Geo error:', e),
                    { enableHighAccuracy: false, timeout: 15000 }
                );
            };

            // Initial kickstart to avoid waiting for watch interval
            Geolocation.getCurrentPosition(
                success,
                (e) => console.log('[RideStatus] Initial Geo error:', e),
                { enableHighAccuracy: false, timeout: 10000 }
            );

            watchIdRef.current = Geolocation.watchPosition(
                success,
                error,
                {
                    enableHighAccuracy: true,
                    distanceFilter: 10,
                    interval: 2000, // Faster interval initially
                    fastestInterval: 1000,
                    forceRequestLocation: true
                }
            );
        };

        startTracking();

        return () => {
            if (watchIdRef.current !== null) Geolocation.clearWatch(watchIdRef.current);
        };
    }, []);

    // Update road route and stats
    useEffect(() => {
        if (!userLocation || !booking) return;

        const updateRoute = async () => {
            try {
                // Determine target: pickup verbiport or fromCoords
                const pickupVP = booking.pickupVerbiport || booking.fromCoords;
                if (!pickupVP || !userLocation) {
                    console.log('[RideStatus] Missing data for route:', { pickupVP, userLocation });
                    return;
                }

                console.log('[RideStatus] Calculating route to:', pickupVP.name || 'Verbiport', pickupVP.latitude, pickupVP.longitude);

                const path = await getRoadRoute(userLocation, pickupVP);

                if (path && path.length > 0) {
                    console.log('[RideStatus] Road route found, points:', path.length);
                    setRoadPath(path);

                    // Calculate distance from path accurately
                    let totalDist = 0;
                    for (let i = 0; i < path.length - 1; i++) {
                        const d = getAirDistanceKm(path[i].latitude, path[i].longitude, path[i + 1].latitude, path[i + 1].longitude);
                        if (!isNaN(d)) totalDist += d;
                    }

                    if (totalDist > 0) {
                        setDistanceKm(Number(totalDist.toFixed(1)));
                        setTimeMins(Math.ceil((totalDist / 30) * 60)); // Assume 30km/h city speed
                    }
                } else {
                    // Fallback to straight line
                    console.log('[RideStatus] No road route found, using straight line');
                    const dist = getAirDistanceKm(userLocation.latitude, userLocation.longitude, pickupVP.latitude, pickupVP.longitude);
                    setDistanceKm(Number(dist.toFixed(1)));
                    setTimeMins(Math.ceil((dist / 30) * 60));
                    setRoadPath([{ latitude: userLocation.latitude, longitude: userLocation.longitude }, pickupVP]);
                }
            } catch (err) {
                console.error('[RideStatus] Route update error:', err);
            }
        };

        const timeout = setTimeout(updateRoute, 1000);
        return () => clearTimeout(timeout);
    }, [userLocation, booking]);

    // Pulsing animation
    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(statusScale, { toValue: 1.2, duration: 800, useNativeDriver: true }),
                Animated.timing(statusScale, { toValue: 1, duration: 800, useNativeDriver: true })
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    const handleContinue = () => {
        setIsContinuing(true);
        // Navigate to in-progress screen where status polling will take over
        navigation.navigate('RideInProgress', { bookingId });
    };

    const handleCancel = useCallback(() => {
        navigation.navigate('CancellationPolicy', { bookingId });
    }, [bookingId, navigation]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Reach Your Verbiport</Text>
                <Text style={styles.headerSubtitle}>Follow the road route to start your flight</Text>
            </View>

            {/* Tracker Map Area */}
            <View style={styles.mapContainer}>
                {userLocation && (
                    <AppMap
                        style={StyleSheet.absoluteFillObject}
                        showUserLocation={true}
                        routeStart={userLocation}
                        pickupVerbiport={booking?.pickupVerbiport || (booking?.fromCoords ? { ...booking.fromCoords, name: 'Pickup Point' } : undefined)}
                        pickupPath={roadPath}
                        lockInteraction={false}
                    />
                )}
                {!userLocation && (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' }}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={{ marginTop: 10, color: colors.mutedForeground }}>Locating you...</Text>
                    </View>
                )}
                <Text style={styles.mapLabel}>ROAD ROUTE TO VERBIPORT</Text>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Distance to Go</Text>
                    <View style={styles.statValueRow}>
                        <MapPin size={18} color={colors.primary} />
                        <Text style={styles.statValue}>{distanceKm} km</Text>
                    </View>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Est. Arrival Time</Text>
                    <View style={styles.statValueRow}>
                        <Clock size={18} color={colors.primary} />
                        <Text style={styles.statValue}>{timeMins} mins</Text>
                    </View>
                </View>
            </View>

            <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Navigation</Text>
                <View style={styles.statusBadge}>
                    <Animated.View style={[styles.statusDot, { transform: [{ scale: statusScale }] }]} />
                    <Text style={styles.statusText}>Optimal Route Found</Text>
                </View>
            </View>

            <View style={styles.actionContainer}>
                <TouchableOpacity
                    style={[
                        styles.primaryButton,
                        booking?.status !== 'ongoing' && { opacity: 0.5, backgroundColor: '#9ca3af' }
                    ]}
                    onPress={handleContinue}
                    disabled={booking?.status !== 'ongoing' || isContinuing}
                >
                    <Text style={styles.primaryButtonText}>
                        {booking?.status === 'ongoing' ? 'Continue to Bird' : 'Waiting for Pilot to Verify...'}
                    </Text>
                    <ArrowRight size={20} color="#fff" />
                </TouchableOpacity>

                {!isContinuing && booking?.status !== 'ongoing' && (
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={handleCancel}
                    >
                        <ShieldAlert size={18} color={colors.error || '#ef4444'} style={{ marginRight: 6 }} />
                        <Text style={[styles.secondaryButtonText, { color: colors.error || '#ef4444' }]}>Cancel Booking</Text>
                    </TouchableOpacity>
                )}
            </View>

            {otp && (
                <View style={styles.otpContainer}>
                    <Text style={styles.otpLabel}>FLIGHT OTP</Text>
                    <Text style={styles.otpValue}>{otp}</Text>
                    <Text style={styles.otpHint}>Share with Pilot at Verbiport</Text>
                </View>
            )}
        </SafeAreaView>
    );
}
