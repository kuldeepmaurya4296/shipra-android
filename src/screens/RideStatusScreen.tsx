import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { Clock, MapPin, Navigation } from 'lucide-react-native';
import AppMap from '../components/AppMap';
import { getBirdLocation } from '../utils/mapUtils';
import client from '../api/client';
import { styles } from './RideStatusScreen.styles';

type Props = StackScreenProps<RootStackParamList, 'RideStatus'>;

export default function RideStatusScreen({ navigation, route }: Props) {
    const { bookingId, otp, initialData } = route.params;
    const [booking, setBooking] = useState<any>(initialData || null);
    const [statusScale] = useState(new Animated.Value(1));

    // Poll for status change (confirmed -> ongoing)
    useEffect(() => {
        let active = true;

        const fetchStatus = async () => {
            try {
                // Optimized: Fetch only the current booking
                const res = await client.get(`/bookings/${bookingId}`);
                const currentBooking = res.data;

                if (active && currentBooking) {
                    setBooking(currentBooking);
                    if (currentBooking.status === 'ongoing') {
                        navigation.replace('RideInProgress', { bookingId });
                    }
                }
            } catch (e) {
                console.log('[RideStatus] Polling error:', e);
            }
        };

        fetchStatus(); // Initial check
        const interval = setInterval(fetchStatus, 3000); // Check every 3 seconds

        return () => {
            active = false;
            clearInterval(interval);
        };
    }, [bookingId, navigation]);

    // Simulate pulsing animation for the status indicator
    useEffect(() => {
        if (otp) {
            // Simulate sending OTP
            console.log(`[OTP SYSTEM] OTP Generated: ${otp}`);
        }

        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(statusScale, { toValue: 1.2, duration: 800, useNativeDriver: true }),
                Animated.timing(statusScale, { toValue: 1, duration: 800, useNativeDriver: true })
            ])
        );
        pulse.start();

        return () => pulse.stop();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Your Bird is Arriving</Text>
                <Text style={styles.headerSubtitle}>{booking?.birdId?.name || 'Bird #42'} assigned</Text>
            </View>

            {/* Tracker Map Area */}
            <View style={styles.mapContainer}>
                <AppMap
                    style={StyleSheet.absoluteFillObject}
                    showUserLocation={true}
                    routeStart={booking?.birdId ? getBirdLocation(booking.birdId) : undefined}
                    routeEnd={booking?.fromCoords || undefined}
                    birds={booking?.birdId ? [{ ...booking.birdId, currentLocation: getBirdLocation(booking.birdId), status: 'active' }] : []}
                />
                <Text style={styles.mapLabel}>LIVE TRACKING</Text>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Distance from You</Text>
                    <View style={styles.statValueRow}>
                        <MapPin size={18} color={colors.primary} />
                        <Text style={styles.statValue}>1.2 km</Text>
                    </View>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Time to Arrive</Text>
                    <View style={styles.statValueRow}>
                        <Clock size={18} color={colors.primary} />
                        <Text style={styles.statValue}>4 mins</Text>
                    </View>
                </View>
            </View>

            <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Status</Text>
                <View style={styles.statusBadge}>
                    <Animated.View style={[styles.statusDot, { transform: [{ scale: statusScale }] }]} />
                    <Text style={styles.statusText}>Live • On Time</Text>
                </View>
            </View>

            <View style={styles.actionContainer}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => navigation.navigate('RideInProgress', { bookingId })}
                >
                    <Text style={styles.primaryButtonText}>Continue to Bird</Text>
                    <Navigation size={20} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Text style={styles.secondaryButtonText}>Cancel Booking</Text>
                </TouchableOpacity>
            </View>
            {otp && (
                <View style={styles.otpContainer}>
                    <Text style={styles.otpLabel}>RIDE OTP</Text>
                    <Text style={styles.otpValue}>{otp}</Text>
                    <Text style={styles.otpHint}>Sent to Email & WhatsApp</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

// Styles have been moved to RideStatusScreen.styles.ts
