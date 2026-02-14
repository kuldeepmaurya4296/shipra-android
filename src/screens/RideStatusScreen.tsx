import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Animated, StyleSheet, ActivityIndicator } from 'react-native';
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

    // Fetch booking on mount
    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const res = await client.get(`/bookings/${bookingId}`);
                setBooking(res.data);
            } catch (e) {
                console.log('[RideStatus] Fetch error:', e);
            }
        };
        if (!initialData) fetchBooking();
    }, [bookingId]);

    // Track user location
    useEffect(() => {
        watchIdRef.current = Geolocation.watchPosition(
            (position) => {
                const coords = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
                setUserLocation(coords);
            },
            (error) => console.log('[RideStatus] Geo error:', error),
            { enableHighAccuracy: true, distanceFilter: 10, interval: 5000 }
        );

        return () => {
            if (watchIdRef.current !== null) Geolocation.clearWatch(watchIdRef.current);
        };
    }, []);

    // Update road route and stats
    useEffect(() => {
        if (!userLocation || !booking?.fromCoords) return;

        const updateRoute = async () => {
            try {
                const pickupVP = booking.pickupVerbiport || booking.fromCoords;
                if (!pickupVP || !userLocation) return;

                const path = await getRoadRoute(userLocation, pickupVP);

                if (path && path.length > 0) {
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
                    const dist = getAirDistanceKm(userLocation.latitude, userLocation.longitude, pickupVP.latitude, pickupVP.longitude);
                    setDistanceKm(Number(dist.toFixed(1)));
                    setTimeMins(Math.ceil((dist / 30) * 60));
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
                        routeEnd={booking?.pickupVerbiport || booking?.fromCoords}
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
                    style={styles.primaryButton}
                    onPress={handleContinue}
                >
                    <Text style={styles.primaryButtonText}>Continue to Bird</Text>
                    <ArrowRight size={20} color="#fff" />
                </TouchableOpacity>

                {!isContinuing && (
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
