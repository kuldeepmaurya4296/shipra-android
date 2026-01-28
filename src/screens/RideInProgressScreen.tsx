import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Animated } from 'react-native';
import { colors } from '../theme/colors';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { Plane, Navigation, Activity, ArrowRight, ShieldAlert, CheckCircle } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';

type Props = StackScreenProps<RootStackParamList, 'RideInProgress'>;

export default function RideInProgressScreen({ navigation, route }: Props) {
    const { bookingId } = route.params;
    const [timeLeft, setTimeLeft] = useState(8); // Start at 8 min
    const planeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Mock countdown
        const interval = setInterval(() => {
            setTimeLeft(prev => Math.max(0, prev - 1));
        }, 60000); // Reduce every minute (speed up for demo?)

        // Mock plane movement across screen
        Animated.loop(
            Animated.timing(planeAnim, {
                toValue: 1,
                duration: 10000,
                useNativeDriver: true,
            })
        ).start();

        return () => clearInterval(interval);
    }, []);

    const handleSOS = () => {
        navigation.navigate('SOS', { bookingId });
    };

    const handleComplete = () => {
        navigation.navigate('RideSummary', { bookingId });
    };

    const planeTranslateX = planeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-100, 300], // Adjust based on screen width
    });

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Flight in Progress</Text>
                <Text style={styles.headerSubtitle}>Bird #42 • Altitude: 250m</Text>
            </View>

            {/* Live Route Visualization */}
            <View style={styles.routeContainer}>
                <LinearGradient
                    colors={['#1e1b4b', '#312e81']} // Deep blue sky colors
                    style={styles.skyBackground}
                >
                    <View style={styles.cloud} />
                    <View style={[styles.cloud, { top: 80, right: 20, width: 60 }]} />
                    <View style={[styles.cloud, { top: 120, left: 40, width: 40 }]} />

                    <Animated.View style={{ transform: [{ translateX: planeTranslateX }] }}>
                        <Plane size={48} color="#fff" style={{ transform: [{ rotate: '15deg' }] }} />
                    </Animated.View>
                </LinearGradient>
            </View>

            {/* Flight Statistics */}
            <Text style={styles.sectionLabel}>FLIGHT STATISTICS</Text>
            <View style={styles.gridContainer}>
                <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>Time Remaining</Text>
                    <Text style={styles.gridValue}>{timeLeft} min</Text>
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

            <View style={styles.statusBanner}>
                <CheckCircle size={20} color={colors.success} />
                <View>
                    <Text style={styles.statusTitle}>Status: Safe</Text>
                    <Text style={styles.statusDesc}>All systems operational</Text>
                </View>
            </View>

            <View style={styles.actionContainer}>
                <TouchableOpacity
                    style={styles.completeButton}
                    onPress={handleComplete}
                >
                    <Text style={styles.buttonText}>Complete Flight</Text>
                    <ArrowRight size={20} color="#fff" />
                </TouchableOpacity>

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
        marginBottom: 16,
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
    statusBanner: {
        margin: 24,
        padding: 16,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statusTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.success,
    },
    statusDesc: {
        fontSize: 12,
        color: colors.foreground,
    },
    actionContainer: {
        marginTop: 'auto',
        padding: 24,
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
