import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Clock, MapPin, Calendar, CreditCard, Ruler, Zap, Plane } from 'lucide-react-native';
import client from '../api/client';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { RAZORPAY_KEY_ID } from '@env';
import RazorpayCheckout from 'react-native-razorpay';

type Props = StackScreenProps<RootStackParamList, 'Booking'>;

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

export default function BookingScreen({ route, navigation }: Props) {
    const { from, to } = route.params;
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [birds, setBirds] = useState<any[]>([]);
    const [selectedBird, setSelectedBird] = useState<any>(null);
    const [stations, setStations] = useState<any[]>([]);

    // Route state
    const [distance, setDistance] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0); // in minutes
    const [fare, setFare] = useState<number>(0);

    // Map Coords
    const [fromCoord, setFromCoord] = useState<any>(null);
    const [toCoord, setToCoord] = useState<any>(null);
    const mapRef = useRef<MapView>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [birdsRes, stationsRes] = await Promise.all([
                client.get('/birds'),
                client.get('/stations')
            ]);

            setBirds(birdsRes.data);
            setStations(stationsRes.data);

            if (birdsRes.data.length > 0) {
                setSelectedBird(birdsRes.data[0]);
            }

            // Find coordinates
            const fromStation = stationsRes.data.find((s: any) => s.name === from);
            const toStation = stationsRes.data.find((s: any) => s.name === to);

            if (fromStation?.location && toStation?.location) {
                setFromCoord({
                    latitude: fromStation.location.lat,
                    longitude: fromStation.location.lng
                });
                setToCoord({
                    latitude: toStation.location.lat,
                    longitude: toStation.location.lng
                });

                // Calculate Distance
                const dist = getDistanceFromLatLonInKm(
                    fromStation.location.lat,
                    fromStation.location.lng,
                    toStation.location.lat,
                    toStation.location.lng
                );

                setDistance(parseFloat(dist.toFixed(2)));

                // Calculate Time (Speed ~100 km/h average)
                // 100 km/h = 1.666 km/min
                // Calculate Time (Speed ~100 km/h average)
                // 100 km/h = 1.666 km/min
                const travelTime = (dist / 100) * 60;
                const totalDuration = Math.ceil(travelTime + 4); // +2 min Takeoff, +2 min Landing
                setDuration(totalDuration);

                // Calculate Fare: 2000 per 15 min block
                const calculatedFare = Math.ceil(totalDuration / 15) * 2000;
                setFare(calculatedFare);

                // Fit map
                setTimeout(() => {
                    mapRef.current?.fitToCoordinates([
                        { latitude: fromStation.location.lat, longitude: fromStation.location.lng },
                        { latitude: toStation.location.lat, longitude: toStation.location.lng }
                    ], {
                        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                        animated: true
                    });
                }, 500);
            }

        } catch (error) {
            console.error('Failed to fetch data', error);
            Alert.alert('Error', 'Failed to load route details');
        }
    };

    const handleConfirmBooking = async () => {
        if (!selectedBird) {
            Alert.alert('Error', 'Please select a bird.');
            return;
        }

        // Validate user profile - must have email and whatsapp number for OTP delivery
        const userEmail = user?.email;
        const userWhatsApp = user?.whatsappNumber || user?.phone;

        if (!userEmail || !userWhatsApp) {
            Alert.alert(
                'Complete Your Profile',
                'To receive your booking OTP, please add your email address and WhatsApp number in your profile.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Go to Profile',
                        onPress: () => navigation.navigate('Profile')
                    }
                ]
            );
            return;
        }

        setLoading(true);

        const options = {
            description: 'Bird Booking #' + Math.floor(1000 + Math.random() * 9000),
            image: 'https://i.imgur.com/3g7nmJC.png', // Shipra placeholder
            currency: 'INR',
            key: RAZORPAY_KEY_ID,
            amount: fare * 100, // Amount in paise
            name: 'Shipra Air Mobility',
            prefill: {
                email: userEmail,
                contact: userWhatsApp.replace(/\D/g, ''), // Strip non-digits
                name: user?.name || 'Shipra User'
            },
            theme: { color: colors.primary }
        };

        try {
            const data = await RazorpayCheckout.open(options);
            // alert(`Payment ID: ${data.razorpay_payment_id}`); // Optional debug

            // Payment Success: Create Booking
            const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

            const bookingData = {
                birdNumber: selectedBird.model + "-" + Math.floor(100 + Math.random() * 900),
                from: from,
                to: to,
                date: new Date().toISOString(),
                amount: fare,
                status: 'confirmed',
                birdId: selectedBird._id,
                paymentId: data.razorpay_payment_id,
                otp: otpCode, // Store OTP in booking object
                phone: userWhatsApp,
                whatsappNumber: userWhatsApp // Explicitly send whatsapp number
            };

            const response = await client.post('/bookings', bookingData);

            // Store trip data for Pilot simulation
            const tripData = {
                ...bookingData,
                _id: response.data._id,
                userName: user?.name || 'Shipra User',
                userEmail: userEmail,
                userPhone: userWhatsApp,
                // New Fields
                whatsappNumber: user?.whatsappNumber || user?.phone || '-',
                callingNumber: user?.callingNumber || user?.phone || '-',
                aadharNumber: user?.aadharNumber || '-',
                panNumber: user?.panNumber || '-',
                currentAddress: user?.currentAddress || '-',
                permanentAddress: user?.permanentAddress || '-',
                otherDetails: user?.otherDetails || '-'
            };
            await AsyncStorage.setItem('current_trip_data', JSON.stringify(tripData));

            // OTP Sent Confirmation
            Alert.alert(
                'Booking Confirmed',
                `OTP ${otpCode} has been sent to:\n📧 ${userEmail}\n📱 WhatsApp: ${userWhatsApp}`
            );

            navigation.navigate('RideStatus', { bookingId: response.data._id, otp: otpCode });

        } catch (error: any) {
            console.error('Payment/Booking failed', error);
            if (error.code && error.description) {
                Alert.alert('Payment Failed', error.description);
            } else if (error.response?.data?.profileIncomplete) {
                // Handle profile incomplete error from server
                Alert.alert(
                    'Profile Incomplete',
                    error.response.data.message,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Go to Profile', onPress: () => navigation.navigate('Profile') }
                    ]
                );
            } else {
                Alert.alert('Error', error.response?.data?.message || 'Booking creation failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={styles.title}>Confirm Bird</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Map Route Visualization */}
                <View style={styles.mapCard}>
                    {fromCoord && toCoord ? (
                        <MapView
                            ref={mapRef}
                            provider={PROVIDER_GOOGLE}
                            style={StyleSheet.absoluteFillObject}
                            initialRegion={{
                                latitude: (fromCoord.latitude + toCoord.latitude) / 2,
                                longitude: (fromCoord.longitude + toCoord.longitude) / 2,
                                latitudeDelta: Math.abs(fromCoord.latitude - toCoord.latitude) * 2,
                                longitudeDelta: Math.abs(fromCoord.longitude - toCoord.longitude) * 2,
                            }}
                        >
                            {/* Route Line */}
                            <Polyline
                                coordinates={[fromCoord, toCoord]}
                                strokeWidth={4}
                                strokeColor={colors.primary}
                                lineDashPattern={[1]}
                            />

                            {/* Start/End Markers */}
                            <Marker coordinate={fromCoord} title={from} description="Departure">
                                <View style={styles.markerBadge}><Text style={styles.markerText}>A</Text></View>
                            </Marker>
                            <Marker coordinate={toCoord} title={to} description="Destination">
                                <View style={[styles.markerBadge, { backgroundColor: colors.accent }]}><Text style={styles.markerText}>B</Text></View>
                            </Marker>

                            {/* Bird Markers */}
                            {birds.map((bird, index) => (
                                bird.location && (
                                    <Marker
                                        key={`bird-${index}`}
                                        coordinate={{
                                            latitude: bird.location.lat,
                                            longitude: bird.location.lng
                                        }}
                                        title={bird.name}
                                        description={bird.model}
                                        opacity={selectedBird?._id === bird._id ? 1 : 0.6}
                                        zIndex={selectedBird?._id === bird._id ? 10 : 1}
                                    >
                                        <View style={[
                                            styles.birdMarker,
                                            selectedBird?._id === bird._id && styles.selectedBirdMarker
                                        ]}>
                                            <Plane
                                                size={selectedBird?._id === bird._id ? 20 : 16}
                                                color="#fff"
                                                style={{ transform: [{ rotate: '-45deg' }] }}
                                            />
                                        </View>
                                    </Marker>
                                )
                            ))}
                        </MapView>
                    ) : (
                        <View style={styles.mapLoading}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={{ marginTop: 8, color: colors.mutedForeground }}>Loading Route...</Text>
                        </View>
                    )}
                </View>

                {/* Journey Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Ruler size={18} color={colors.primary} />
                        <Text style={styles.statValue}>{distance} km</Text>
                        <Text style={styles.statLabel}>Distance</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Clock size={18} color={colors.primary} />
                        <Text style={styles.statValue}>
                            {duration >= 60
                                ? `${Math.floor(duration / 60)} h ${duration % 60} min`
                                : `${duration} min`}
                        </Text>
                        <Text style={styles.statLabel}>Est. Time</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Zap size={18} color={colors.primary} />
                        <Text style={styles.statValue}>~100 km/h</Text>
                        <Text style={styles.statLabel}>Avg Speed</Text>
                    </View>
                </View>

                {/* Bird Selection */}
                <View style={[styles.card, { marginTop: 20 }]}>
                    <Text style={styles.cardTitle}>Select Your Bird</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {birds.map((bird) => (
                            <TouchableOpacity
                                key={bird._id}
                                style={{
                                    backgroundColor: selectedBird?._id === bird._id ? colors.primary : '#f3f4f6',
                                    padding: 16,
                                    borderRadius: 16,
                                    marginRight: 12,
                                    width: 140,
                                    borderWidth: 1,
                                    borderColor: selectedBird?._id === bird._id ? colors.primary : 'transparent',
                                }}
                                onPress={() => setSelectedBird(bird)}
                            >
                                <Text style={{
                                    color: selectedBird?._id === bird._id ? '#fff' : colors.foreground,
                                    fontWeight: 'bold',
                                    marginBottom: 4
                                }}>{bird.name}</Text>
                                <Text style={{
                                    color: selectedBird?._id === bird._id ? 'rgba(255,255,255,0.8)' : colors.mutedForeground,
                                    fontSize: 12
                                }}>{bird.model}</Text>
                                <Text style={{
                                    color: selectedBird?._id === bird._id ? 'rgba(255,255,255,0.8)' : colors.mutedForeground,
                                    fontSize: 10,
                                    marginTop: 8
                                }}>{bird.range} Range</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Fare Breakdown */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Fare Breakdown</Text>

                    <View style={styles.row}>
                        <Text style={styles.label}>Total Duration</Text>
                        <Text style={styles.value}>
                            {duration >= 60
                                ? `${Math.floor(duration / 60)} h ${duration % 60} min`
                                : `${duration} min`}
                        </Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Total Amount</Text>
                        <Text style={styles.priceValue}>
                            ₹{fare.toLocaleString()}
                        </Text>
                    </View>
                </View>

                <View style={styles.paymentCard}>
                    <CreditCard size={20} color={colors.primary} />
                    <View>
                        <Text style={styles.paymentTitle}>Payment Provider</Text>
                        <Text style={styles.paymentText}>Razorpay Secured Gateway</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.confirmButton, (loading || !selectedBird) && styles.disabledButton]}
                    onPress={handleConfirmBooking}
                    disabled={loading || !selectedBird}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.confirmButtonText}>Pay & Reserve My Bird</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        paddingTop: 60,
        gap: 16,
    },
    backButton: {
        padding: 8,
        borderRadius: 50,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: colors.border,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    content: {
        padding: 24,
        paddingBottom: 40,
    },
    mapCard: {
        height: 250,
        backgroundColor: '#e2e8f0',
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    mapLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    markerBadge: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff'
    },
    markerText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14
    },
    birdMarker: {
        backgroundColor: colors.success,
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    selectedBirdMarker: {
        backgroundColor: colors.primary,
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: colors.border,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
        gap: 4
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.foreground
    },
    statLabel: {
        fontSize: 12,
        color: colors.mutedForeground
    },
    statDivider: {
        width: 1,
        height: '100%',
        backgroundColor: colors.border
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 20,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.mutedForeground,
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Changed to space-between for fare breakdown
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        color: colors.mutedForeground,
    },
    value: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.foreground,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 12,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    priceValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.primary,
    },
    paymentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 32,
    },
    paymentTitle: {
        fontSize: 12,
        color: colors.mutedForeground,
    },
    paymentText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primary,
    },
    confirmButton: {
        backgroundColor: colors.primary,
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
        elevation: 4,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    disabledButton: {
        opacity: 0.7,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
