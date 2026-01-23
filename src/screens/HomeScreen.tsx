import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { MapPin, Zap } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme/colors';

interface HomeScreenProps {
    onNext: () => void;
}

export default function HomeScreen({ onNext }: HomeScreenProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['rgba(79, 70, 229, 0.1)', 'transparent']}
                style={styles.header}
            >
                <Animated.View style={{ opacity: fadeAnim }}>
                    <Text style={styles.greeting}>Hey, Traveler!</Text>
                    <View style={styles.locationContainer}>
                        <MapPin size={14} color={colors.primary} />
                        <Text style={styles.locationText}>Current Location: Downtown Airport</Text>
                    </View>
                </Animated.View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Animated.View style={[styles.mapCard, { opacity: fadeAnim }]}>
                    <LinearGradient
                        colors={['rgba(79, 70, 229, 0.05)', 'rgba(99, 102, 241, 0.1)', 'rgba(79, 70, 229, 0.05)']}
                        style={styles.mapGradient}
                    >
                        <View style={styles.mapContent}>
                            <View style={styles.emojiContainer}>
                                <Text style={styles.emoji}>🗺️</Text>
                            </View>
                            <Text style={styles.mapText}>Live Location Map</Text>

                            <View style={styles.marker} />
                        </View>
                    </LinearGradient>
                </Animated.View>

                <Animated.View style={[styles.birdCard, { opacity: fadeAnim }]}>
                    <LinearGradient
                        colors={['rgba(79, 70, 229, 0.05)', 'rgba(245, 158, 11, 0.05)']}
                        style={styles.birdContent}
                    >
                        <View style={styles.birdHeader}>
                            <Text style={styles.birdTitle}>Nearest Bird Available</Text>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>Ready</Text>
                            </View>
                        </View>

                        <View style={styles.birdInfoRow}>
                            <View style={styles.birdIconContainer}>
                                <Text style={styles.birdIcon}>✈</Text>
                            </View>
                            <View style={styles.birdDetails}>
                                <Text style={styles.birdName}>Bird #42</Text>
                                <Text style={styles.birdMeta}>2.3 km away • 4 min</Text>
                            </View>
                            <Zap size={18} color={colors.accent} />
                        </View>
                    </LinearGradient>
                </Animated.View>

                <TouchableOpacity
                    style={styles.bookButton}
                    onPress={onNext}
                    activeOpacity={0.9}
                >
                    <Text style={styles.bookButtonText}>Book a Flight</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingBottom: 80, // Space for navigation bar
    },
    header: {
        padding: 24,
        paddingTop: 48,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.foreground,
        marginBottom: 4,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    locationText: {
        fontSize: 14,
        color: colors.mutedForeground,
    },
    scrollContent: {
        padding: 16,
    },
    mapCard: {
        height: 300,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'rgba(79, 70, 229, 0.2)',
        overflow: 'hidden',
        marginBottom: 16,
    },
    mapGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapContent: {
        alignItems: 'center',
    },
    emojiContainer: {
        marginBottom: 12,
    },
    emoji: {
        fontSize: 48,
    },
    mapText: {
        fontSize: 14,
        color: colors.mutedForeground,
    },
    marker: {
        position: 'absolute',
        bottom: -80,
        left: -80,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: colors.primary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    birdCard: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(79, 70, 229, 0.2)',
        overflow: 'hidden',
        marginBottom: 16,
    },
    birdContent: {
        padding: 16,
    },
    birdHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    birdTitle: {
        fontWeight: '600',
        color: colors.foreground,
    },
    badge: {
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: colors.success,
        fontSize: 12,
        fontWeight: '600',
    },
    birdInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    birdIconContainer: {
        width: 48,
        height: 48,
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    birdIcon: {
        fontSize: 20,
    },
    birdDetails: {
        flex: 1,
    },
    birdName: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.foreground,
    },
    birdMeta: {
        fontSize: 12,
        color: colors.mutedForeground,
    },
    bookButton: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 50,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        marginTop: 8,
    },
    bookButtonText: {
        color: colors.primaryForeground,
        fontSize: 16,
        fontWeight: '600',
    },
});
