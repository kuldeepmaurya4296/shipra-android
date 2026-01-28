import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Animated } from 'react-native';
import { colors } from '../theme/colors';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { Plane, Clock, MapPin, Navigation, Info } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';

type Props = StackScreenProps<RootStackParamList, 'RideStatus'>;

export default function RideStatusScreen({ navigation, route }: Props) {
    const { bookingId } = route.params;
    const [statusScale] = useState(new Animated.Value(1));

    // Simulate pulsing animation for the status indicator
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(statusScale, { toValue: 1.2, duration: 800, useNativeDriver: true }),
                Animated.timing(statusScale, { toValue: 1, duration: 800, useNativeDriver: true })
            ])
        ).start();
    }, []);

    // Simulate "arrived" content after a few seconds or allow instant continue
    // For this flow we assume the user tracks it and then decides to continue

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Your Bird is Arriving</Text>
                <Text style={styles.headerSubtitle}>Flight #42 assigned</Text>
            </View>

            {/* Tracker Map Area */}
            <View style={styles.mapContainer}>
                <LinearGradient
                    colors={['rgba(79, 70, 229, 0.05)', 'rgba(99, 102, 241, 0.1)']}
                    style={styles.mapBackground}
                >
                    <View style={styles.trackerPath}>
                        <View style={styles.pathLine} />
                        <View style={styles.trackerIconContainer}>
                            <Plane size={32} color={colors.primary} style={{ transform: [{ rotate: '45deg' }] }} />
                        </View>
                        <View style={styles.destinationDot} />
                    </View>
                    <Text style={styles.mapLabel}>LIVE TRACKING</Text>
                </LinearGradient>
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
                <View style={[styles.statusBadge, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                    <Animated.View style={[styles.statusDot, { transform: [{ scale: statusScale }] }]} />
                    <Text style={styles.statusText}>Live • On Time</Text>
                </View>
            </View>

            <View style={styles.actionContainer}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => navigation.navigate('RideInProgress', { bookingId })}
                >
                    <Text style={styles.primaryButtonText}>Continue to Flight</Text>
                    <Navigation size={20} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Text style={styles.secondaryButtonText}>Cancel Booking</Text>
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
    header: {
        padding: 24,
        paddingTop: 48,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.foreground,
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: colors.mutedForeground,
    },
    mapContainer: {
        height: 250,
        margin: 24,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
    },
    mapBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    trackerPath: {
        width: '70%',
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pathLine: {
        position: 'absolute',
        width: '100%',
        height: 2,
        backgroundColor: colors.primary,
        opacity: 0.3,
        borderStyle: 'dashed', // Note: style needs borderRadius not borderStyle for Views, creating mock dashed line
    },
    trackerIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    destinationDot: {
        position: 'absolute',
        right: 0,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: colors.success,
        borderWidth: 2,
        borderColor: '#fff',
    },
    mapLabel: {
        position: 'absolute',
        bottom: 16,
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.primary,
        letterSpacing: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        overflow: 'hidden',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        gap: 16,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        elevation: 2,
    },
    statLabel: {
        fontSize: 12,
        color: colors.mutedForeground,
        marginBottom: 8,
    },
    statValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    statusRow: {
        paddingHorizontal: 24,
        marginBottom: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        marginHorizontal: 24,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    statusLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.foreground,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 8,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.success,
    },
    statusText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.success,
    },
    actionContainer: {
        padding: 24,
        marginTop: 'auto',
        gap: 16,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 20,
        gap: 12,
        elevation: 4,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    secondaryButton: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    secondaryButtonText: {
        color: colors.mutedForeground,
        fontSize: 16,
        fontWeight: '600',
    },
});
