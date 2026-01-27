import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, TextInput, Alert } from 'react-native';
import { MapPin, Zap, PlaneTakeoff, PlaneLanding, Search } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme/colors';

import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import NavigationBar from '../components/NavigationBar';

type Props = StackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [fromLocation, setFromLocation] = useState('Downtown Airport');
    const [toLocation, setToLocation] = useState('');

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleBookFlight = () => {
        if (!toLocation) {
            Alert.alert('Selection Required', 'Please enter your destination.');
            return;
        }
        navigation.navigate('Booking', { from: fromLocation, to: toLocation });
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['rgba(79, 70, 229, 0.15)', 'transparent']}
                style={styles.header}
            >
                <Animated.View style={{ opacity: fadeAnim }}>
                    <Text style={styles.greeting}>Shipra Fly ✈️</Text>
                    <View style={styles.locationContainer}>
                        <MapPin size={14} color={colors.primary} />
                        <Text style={styles.locationText}>Ready for takeoff from {fromLocation}</Text>
                    </View>
                </Animated.View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Search / Route Selection Card */}
                <Animated.View style={[styles.searchCard, { opacity: fadeAnim }]}>
                    <Text style={styles.cardTitle}>Plan Your Route</Text>

                    <View style={styles.inputGroup}>
                        <View style={styles.inputWrapper}>
                            <PlaneTakeoff size={20} color={colors.primary} />
                            <TextInput
                                style={styles.input}
                                placeholder="From"
                                value={fromLocation}
                                onChangeText={setFromLocation}
                                placeholderTextColor={colors.mutedForeground}
                            />
                        </View>

                        <View style={styles.routeLine}>
                            <View style={styles.verticalLine} />
                        </View>

                        <View style={styles.inputWrapper}>
                            <PlaneLanding size={20} color={colors.accent} />
                            <TextInput
                                style={styles.input}
                                placeholder="Where to?"
                                value={toLocation}
                                onChangeText={setToLocation}
                                placeholderTextColor={colors.mutedForeground}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.bookButton}
                        onPress={handleBookFlight}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.bookButtonText}>Search Available Birds</Text>
                        <Search size={18} color="#fff" />
                    </TouchableOpacity>
                </Animated.View>

                {/* Map Visualization Placeholder */}
                <Animated.View style={[styles.mapCard, { opacity: fadeAnim }]}>
                    <LinearGradient
                        colors={['rgba(79, 70, 229, 0.05)', 'rgba(99, 102, 241, 0.1)']}
                        style={styles.mapGradient}
                    >
                        <View style={styles.mapContent}>
                            <Text style={styles.mapLabel}>Direct Fly Perspective</Text>
                            <View style={styles.routeViz}>
                                <View style={styles.dot} />
                                <View style={styles.dashedLine} />
                                <PlaneTakeoff size={24} color={colors.primary} style={styles.planeIcon} />
                                <View style={styles.dashedLine} />
                                <View style={[styles.dot, { backgroundColor: colors.accent }]} />
                            </View>
                            <Text style={styles.routeText}>
                                {fromLocation} ➔ {toLocation || '...'}
                            </Text>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Status Card */}
                <Animated.View style={[styles.birdCard, { opacity: fadeAnim }]}>
                    <View style={styles.birdContent}>
                        <View style={styles.birdHeader}>
                            <Text style={styles.birdTitle}>Eco-Bird Status</Text>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>Active</Text>
                            </View>
                        </View>
                        <View style={styles.birdInfoRow}>
                            <Zap size={20} color={colors.accent} />
                            <Text style={styles.birdName}>Hybrid Air-Glide Ready</Text>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>

            <NavigationBar
                currentScreen="home"
                onNavigate={(screen) => {
                    if (screen === 'home') navigation.navigate('Home');
                    if (screen === 'history') navigation.navigate('History');
                    if (screen === 'profile') navigation.navigate('Profile');
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        padding: 24,
        paddingTop: 60,
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    locationText: {
        fontSize: 14,
        color: colors.mutedForeground,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    searchCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.foreground,
        marginBottom: 20,
    },
    inputGroup: {
        gap: 0,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: colors.border,
    },
    input: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: colors.foreground,
    },
    routeLine: {
        height: 20,
        marginLeft: 26,
    },
    verticalLine: {
        width: 2,
        height: '100%',
        backgroundColor: colors.primary,
        opacity: 0.3,
    },
    bookButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginTop: 24,
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    mapCard: {
        height: 200,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
        marginBottom: 20,
    },
    mapGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapContent: {
        alignItems: 'center',
        gap: 16,
    },
    mapLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.mutedForeground,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    routeViz: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary,
    },
    dashedLine: {
        width: 40,
        height: 1,
        backgroundColor: colors.primary,
        opacity: 0.3,
    },
    planeIcon: {
        transform: [{ rotate: '45deg' }],
    },
    routeText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.foreground,
    },
    birdCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 16,
    },
    birdContent: {
        gap: 12,
    },
    birdHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    birdTitle: {
        fontWeight: 'bold',
        color: colors.mutedForeground,
        fontSize: 14,
    },
    badge: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        color: colors.success,
        fontSize: 10,
        fontWeight: 'bold',
    },
    birdInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    birdName: {
        fontWeight: '600',
        color: colors.foreground,
    },
});
