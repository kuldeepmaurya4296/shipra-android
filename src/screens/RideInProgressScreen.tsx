import React, { useEffect, useState, useRef } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Animated, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { Activity, ShieldAlert, Lock, Unlock, Droplet, Wrench } from 'lucide-react-native';
import AppMap from '../components/AppMap';
import { getCoordinatesForVerbiport, getBirdLocation } from '../utils/mapUtils';
import client from '../api/client';
import { styles } from './RideInProgressScreen.styles';

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
                        routeStart={bookingDetails?.fromCoords || (bookingDetails?.fromLocation ? getCoordinatesForVerbiport({ name: bookingDetails.fromLocation }) : undefined)}
                        routeEnd={bookingDetails?.toCoords || (bookingDetails?.toLocation ? getCoordinatesForVerbiport({ name: bookingDetails.toLocation }) : undefined)}
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
