import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Animated, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { Plane, Navigation, Activity, ArrowRight, ShieldAlert, CheckCircle, Lock, Unlock, Droplet, Wrench } from 'lucide-react-native';
import AppMap from '../components/AppMap';
import { getCoordinatesForStation, getBirdLocation } from '../utils/mapUtils';
import client from '../api/client';

type Props = StackScreenProps<RootStackParamList, 'RideInProgress'>;

export default function RideInProgressScreen({ navigation, route }: Props) {
    const { bookingId } = route.params;
    const [bookingDetails, setBookingDetails] = useState<any>(null);
    const planeAnim = useRef(new Animated.Value(0)).current;

    const [acTemp, setAcTemp] = useState(24);
    const [isLocked, setIsLocked] = useState(true);

    const increaseTemp = () => setAcTemp(prev => Math.min(prev + 1, 30));
    const decreaseTemp = () => setAcTemp(prev => Math.max(prev - 1, 16));

    useEffect(() => {
        let active = true;

        const fetchStatus = async () => {
            try {
                const response = await client.get(`/bookings/${bookingId}`);
                const booking = response.data;

                if (booking) {
                    setBookingDetails(booking);
                    if (booking.status === 'completed') {
                        navigation.replace('RideReceipt', { booking });
                    }
                }
            } catch (error) {
                console.error("Error fetching booking status:", error);
            }
        };

        // Initial fetch
        fetchStatus();

        // Polling interval
        const interval = setInterval(() => {
            if (active) fetchStatus();
        }, 3000);

        // Mock plane movement across screen
        Animated.loop(
            Animated.timing(planeAnim, {
                toValue: 1,
                duration: 10000,
                useNativeDriver: true,
            })
        ).start();

        return () => {
            active = false;
            clearInterval(interval);
        };
    }, [bookingId, navigation]);

    const handleSOS = () => {
        navigation.navigate('SOS', { bookingId });
    };

    const planeTranslateX = planeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-100, 300], // Adjust based on screen width
    });

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Bird in Progress</Text>
                <Text style={styles.headerSubtitle}>
                    {bookingDetails ? `Bird ${bookingDetails.birdId?.name || bookingDetails.birdNumber}` : 'Bird #42'} • Altitude: 250m
                </Text>
            </View>

            <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
            >
                {/* Live Route Visualization */}
                <View style={styles.routeContainer}>
                    <AppMap
                        style={StyleSheet.absoluteFillObject}
                        routeStart={bookingDetails?.fromCoords || (bookingDetails?.fromLocation ? getCoordinatesForStation({ name: bookingDetails.fromLocation }) : undefined)}
                        routeEnd={bookingDetails?.toCoords || (bookingDetails?.toLocation ? getCoordinatesForStation({ name: bookingDetails.toLocation }) : undefined)}
                        birds={bookingDetails?.birdId ? [{ ...bookingDetails.birdId, currentLocation: getBirdLocation(bookingDetails.birdId), status: 'active' }] : []}
                        showUserLocation={true}
                    />
                </View>

                {/* Bird Statistics */}
                <Text style={styles.sectionLabel}>BIRD STATISTICS</Text>
                <View style={styles.gridContainer}>
                    <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Status</Text>
                        <Text style={[styles.gridValue, { color: colors.success }]}>
                            {bookingDetails?.status?.toUpperCase() || 'ONGOING'}
                        </Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Speed</Text>
                        <Text style={styles.gridValue}>95 km/h</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Distance</Text>
                        <Text style={styles.gridValue}>6.2 km</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Altitude</Text>
                        <Text style={styles.gridValue}>250 m</Text>
                    </View>
                </View>

                {/* Cabin Controls */}
                <Text style={styles.sectionLabel}>CABIN CONTROLS</Text>
                <View style={styles.controlsRow}>
                    {/* AC Control */}
                    <View style={styles.controlCard}>
                        <Text style={styles.controlTitle}>Cabin Temp</Text>
                        <View style={styles.tempControl}>
                            <TouchableOpacity onPress={decreaseTemp} style={styles.tempBtn}>
                                <Text style={styles.tempBtnText}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.tempValue}>{acTemp}{'\u00B0'}C</Text>
                            <TouchableOpacity onPress={increaseTemp} style={styles.tempBtn}>
                                <Text style={styles.tempBtnText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Lock Control */}
                    <View style={styles.controlCard}>
                        <Text style={styles.controlTitle}>Door Lock</Text>
                        <TouchableOpacity
                            style={[styles.lockBtn, isLocked ? styles.locked : styles.unlocked]}
                            onPress={() => setIsLocked(!isLocked)}
                        >
                            {isLocked ? (
                                <Lock size={24} color="#fff" />
                            ) : (
                                <Unlock size={24} color={colors.foreground} />
                            )}
                            <Text style={[styles.lockText, isLocked && { color: '#fff' }]}>
                                {isLocked ? 'Locked' : 'Unlocked'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Bird Services */}
                <Text style={styles.sectionLabel}>BIRD SERVICES</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.serviceList} contentContainerStyle={{ gap: 12, paddingHorizontal: 24 }}>
                    <TouchableOpacity style={styles.serviceItem} onPress={() => navigation.navigate('Diagnosis', { bookingId })}>
                        <View style={[styles.serviceIcon, { backgroundColor: '#e0f2fe' }]}>
                            <Activity size={24} color="#0284c7" />
                        </View>
                        <Text style={styles.serviceLabel}>Diagnosis</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.serviceItem} onPress={() => navigation.navigate('ServiceOrder', { type: 'maintenance', bookingId })}>
                        <View style={[styles.serviceIcon, { backgroundColor: '#fef3c7' }]}>
                            <Wrench size={24} color="#d97706" />
                        </View>
                        <Text style={styles.serviceLabel}>Maintenance</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.serviceItem} onPress={() => navigation.navigate('ServiceOrder', { type: 'fuel', bookingId })}>
                        <View style={[styles.serviceIcon, { backgroundColor: '#dcfce7' }]}>
                            <Droplet size={24} color="#16a34a" />
                        </View>
                        <Text style={styles.serviceLabel}>Hydrogen</Text>
                    </TouchableOpacity>
                </ScrollView>
            </ScrollView>

            <View style={styles.actionContainer}>
                {/* User cannot complete ride manually anymore */}
                <TouchableOpacity
                    style={styles.sosButton}
                    onPress={handleSOS}
                >
                    <ShieldAlert size={20} color="#fff" />
                    <Text style={styles.buttonText}>SOS / Emergency</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 16,
    },
    header: {
        padding: 24,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    headerSubtitle: {
        fontSize: 14,
        color: colors.mutedForeground,
        marginTop: 4,
    },
    routeContainer: {
        height: 180,
        marginHorizontal: 24,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 24,
        elevation: 4,
    },
    skyBackground: {
        flex: 1,
        justifyContent: 'center',
    },
    cloud: {
        position: 'absolute',
        top: 40,
        right: 50,
        width: 80,
        height: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
    },
    sectionLabel: {
        marginLeft: 24,
        marginBottom: 12,
        marginTop: 24,
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.mutedForeground,
        letterSpacing: 1,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 24,
        gap: 16,
    },
    gridItem: {
        width: '47%', // roughly half - gap
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
    },
    gridLabel: {
        fontSize: 12,
        color: colors.mutedForeground,
        marginBottom: 8,
    },
    gridValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    controlsRow: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        gap: 16
    },
    controlCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center'
    },
    controlTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.mutedForeground,
        marginBottom: 12
    },
    tempControl: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    tempBtn: {
        width: 32,
        height: 32,
        backgroundColor: '#f3f4f6',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center'
    },
    tempBtnText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.foreground
    },
    tempValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.foreground
    },
    lockBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 30,
        gap: 8,
        width: '100%',
        justifyContent: 'center'
    },
    locked: {
        backgroundColor: '#ef4444'
    },
    unlocked: {
        backgroundColor: '#f3f4f6'
    },
    lockText: {
        fontWeight: 'bold',
        color: colors.foreground
    },
    serviceList: {
        marginBottom: 20
    },
    serviceItem: {
        alignItems: 'center',
        gap: 8,
        width: 80
    },
    serviceIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center'
    },
    serviceLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: colors.foreground
    },
    actionContainer: {
        padding: 24,
        paddingTop: 12,
        gap: 16,
    },
    completeButton: {
        backgroundColor: colors.primary,
        paddingVertical: 18,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    sosButton: {
        backgroundColor: '#ef4444',
        paddingVertical: 18,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
