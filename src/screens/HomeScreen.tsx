import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, TextInput, Alert, Dimensions, Image } from 'react-native';
import { MapPin, Zap, PlaneTakeoff, PlaneLanding, Search, Navigation as NavigationIcon, LocateFixed } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme/colors';
import AppMap from '../components/AppMap';
import { getCoordinatesForStation, getBirdLocation } from '../utils/mapUtils';

import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import NavigationBar from '../components/NavigationBar';
import client from '../api/client';

type Props = StackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [fromLocation, setFromLocation] = useState('');
    const [toLocation, setToLocation] = useState('');
    const [stations, setStations] = useState<any[]>([]);
    const [birds, setBirds] = useState<any[]>([]);
    const [loadingStations, setLoadingStations] = useState(true);

    const [filteredFromStations, setFilteredFromStations] = useState<any[]>([]);
    const [filteredToStations, setFilteredToStations] = useState<any[]>([]);
    const [showFromSuggestions, setShowFromSuggestions] = useState(false);
    const [showToSuggestions, setShowToSuggestions] = useState(false);

    // Default region (Bhopal)
    const [region, setRegion] = useState({
        latitude: 23.2599,
        longitude: 77.4126,
        latitudeDelta: 0.2,
        longitudeDelta: 0.2,
    });

    // Map Ref removed


    const fetchData = async () => {
        try {
            const [stationsRes, birdsRes] = await Promise.all([
                client.get('/stations'),
                client.get('/birds')
            ]);
            setStations(stationsRes.data);
            setBirds(birdsRes.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoadingStations(false);
        }
    };

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();

        fetchData();
        const interval = setInterval(fetchData, 10000); // Update every 10s
        return () => clearInterval(interval);
    }, []);

    const filterStations = (text: string, type: 'from' | 'to') => {
        if (!text) {
            if (type === 'from') {
                setFilteredFromStations([]);
                setShowFromSuggestions(false);
            } else {
                setFilteredToStations([]);
                setShowToSuggestions(false);
            }
            return;
        }

        const filtered = stations.filter(station =>
            station.name.toLowerCase().includes(text.toLowerCase()) ||
            station.city.toLowerCase().includes(text.toLowerCase())
        );

        if (type === 'from') {
            setFilteredFromStations(filtered);
            setShowFromSuggestions(true);
        } else {
            setFilteredToStations(filtered);
            setShowToSuggestions(true);
        }
    };

    const handleSelectStation = (stationName: string, type: 'from' | 'to') => {
        if (type === 'from') {
            setFromLocation(stationName);
            setShowFromSuggestions(false);
        } else {
            setToLocation(stationName);
            setShowToSuggestions(false);
        }
    };

    const handleBookBird = () => {
        if (!fromLocation || !toLocation) {
            Alert.alert('Selection Required', 'Please enter both departing and destination stations.');
            return;
        }
        if (fromLocation === toLocation) {
            Alert.alert('Invalid Route', 'Origin and destination cannot be the same.');
            return;
        }
        navigation.navigate('Booking', { from: fromLocation, to: toLocation });
    };

    const handleSwapLocations = () => {
        const temp = fromLocation;
        setFromLocation(toLocation);
        setToLocation(temp);
    };

    const handleCheckNearbyBirds = () => {
        if (birds.length > 0) {
            Alert.alert('Nearby Birds', `Found ${birds.length} active birds in your area.`);
        } else {
            Alert.alert('No Birds Found', 'No active birds available nearby.');
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['rgba(79, 70, 229, 0.15)', 'transparent']}
                style={styles.header}
            >
                <Animated.View style={{ opacity: fadeAnim }}>
                    <View style={styles.brandHeader}>
                        <Image source={require('../assets/logo.png')} style={styles.headerLogo} />
                        <Text style={styles.greeting}>Shipra Fly</Text>
                    </View>
                    <View style={styles.locationContainer}>
                        <MapPin size={14} color={colors.primary} />
                        <Text style={styles.locationText}>
                            {fromLocation && toLocation
                                ? `Routing: ${fromLocation} to ${toLocation}`
                                : fromLocation
                                    ? `Ready to fly from ${fromLocation}`
                                    : 'Where are you flying from?'}
                        </Text>
                    </View>
                </Animated.View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {/* Search / Route Selection Card */}
                <Animated.View style={[styles.searchCard, { opacity: fadeAnim }]}>
                    <Text style={styles.cardTitle}>Plan Your Route</Text>

                    <View style={styles.inputGroup}>
                        <View style={{ zIndex: 20 }}>
                            <View style={styles.inputWrapper}>
                                <View style={styles.indicatorOuter}>
                                    <View style={[styles.indicatorInner, { backgroundColor: colors.primary }]} />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter origin station"
                                    value={fromLocation}
                                    onChangeText={(text) => {
                                        setFromLocation(text);
                                        filterStations(text, 'from');
                                    }}
                                    onFocus={() => filterStations(fromLocation, 'from')}
                                    placeholderTextColor={colors.mutedForeground}
                                />
                                {fromLocation ? (
                                    <TouchableOpacity onPress={() => { setFromLocation(''); filterStations('', 'from'); }}>
                                        <Text style={{ color: colors.mutedForeground, marginRight: 8 }}>✕</Text>
                                    </TouchableOpacity>
                                ) : null}
                            </View>
                            {showFromSuggestions && filteredFromStations.length > 0 && (
                                <View style={styles.suggestionsContainer}>
                                    {filteredFromStations.map((station) => (
                                        <TouchableOpacity
                                            key={station._id}
                                            style={styles.suggestionItem}
                                            onPress={() => handleSelectStation(station.name, 'from')}
                                        >
                                            <View style={styles.suggestionIcon}>
                                                <MapPin size={16} color={colors.mutedForeground} />
                                            </View>
                                            <View>
                                                <Text style={styles.suggestionText}>{station.name}</Text>
                                                <Text style={styles.suggestionSubtext}>{station.city}, India</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        <View style={styles.routeConnector}>
                            <View style={styles.verticalConnector} />
                            <TouchableOpacity
                                style={styles.swapButton}
                                onPress={handleSwapLocations}
                                activeOpacity={0.7}
                            >
                                <Animated.View>
                                    <View style={styles.swapIconContainer}>
                                        <NavigationIcon size={16} color={colors.primary} />
                                    </View>
                                </Animated.View>
                            </TouchableOpacity>
                        </View>

                        <View style={{ zIndex: 10 }}>
                            <View style={styles.inputWrapper}>
                                <View style={styles.indicatorOuter}>
                                    <View style={[styles.indicatorInner, { backgroundColor: colors.accent }]} />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter destination station"
                                    value={toLocation}
                                    onChangeText={(text) => {
                                        setToLocation(text);
                                        filterStations(text, 'to');
                                    }}
                                    onFocus={() => filterStations(toLocation, 'to')}
                                    placeholderTextColor={colors.mutedForeground}
                                />
                                {toLocation ? (
                                    <TouchableOpacity onPress={() => { setToLocation(''); filterStations('', 'to'); }}>
                                        <Text style={{ color: colors.mutedForeground, marginRight: 8 }}>✕</Text>
                                    </TouchableOpacity>
                                ) : null}
                            </View>
                            {showToSuggestions && filteredToStations.length > 0 && (
                                <View style={styles.suggestionsContainer}>
                                    {filteredToStations.map((station) => (
                                        <TouchableOpacity
                                            key={station._id}
                                            style={styles.suggestionItem}
                                            onPress={() => handleSelectStation(station.name, 'to')}
                                        >
                                            <View style={styles.suggestionIcon}>
                                                <MapPin size={16} color={colors.mutedForeground} />
                                            </View>
                                            <View>
                                                <Text style={styles.suggestionText}>{station.name}</Text>
                                                <Text style={styles.suggestionSubtext}>{station.city}, India</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Station Chips */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }} keyboardShouldPersistTaps="handled">
                        {stations.map((station) => (
                            <TouchableOpacity
                                key={station._id}
                                style={{
                                    backgroundColor: toLocation === station.name ? colors.primary : '#f3f4f6',
                                    paddingHorizontal: 12,
                                    paddingVertical: 8,
                                    borderRadius: 16,
                                    marginRight: 8,
                                }}
                                onPress={() => setToLocation(station.name)}
                            >
                                <Text style={{
                                    color: toLocation === station.name ? '#fff' : colors.foreground,
                                    fontSize: 12,
                                    fontWeight: '600'
                                }}>
                                    {station.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <TouchableOpacity
                        style={styles.bookButton}
                        onPress={handleBookBird}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.bookButtonText}>Search Available Birds</Text>
                        <Search size={18} color="#fff" />
                    </TouchableOpacity>
                </Animated.View>

                {/* Map Visualization */}
                <Animated.View style={[styles.mapCard, { opacity: fadeAnim }]}>
                    <AppMap
                        style={StyleSheet.absoluteFillObject}
                        stations={stations.map(s => ({ ...s, ...getCoordinatesForStation(s) }))}
                        birds={birds.map(b => ({ ...b, currentLocation: getBirdLocation(b) }))}
                        routeStart={fromLocation ? stations.find(s => s.name === fromLocation) ? getCoordinatesForStation(stations.find(s => s.name === fromLocation)) : undefined : undefined}
                        routeEnd={toLocation ? stations.find(s => s.name === toLocation) ? getCoordinatesForStation(stations.find(s => s.name === toLocation)) : undefined : undefined}
                    />

                    {/* Map Overlay Controls */}
                    <View style={styles.mapControls}>
                        <TouchableOpacity style={styles.mapBtn} onPress={handleCheckNearbyBirds}>
                            <LocateFixed size={20} color={colors.primary} />
                            <Text style={styles.mapBtnText}>Check Nearby Birds</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Status Card */}
                <Animated.View style={[styles.birdCard, { opacity: fadeAnim }]}>
                    <View style={styles.birdContent}>
                        <View style={styles.birdHeader}>
                            <View>
                                <Text style={styles.birdTitle}>Eco-Bird Status</Text>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>Active</Text>
                                </View>
                            </View>
                            {/* Visual of the bird */}
                            <Image
                                source={require('../assets/360.gif')}
                                style={{ width: 60, height: 40 }}
                                resizeMode="contain"
                            />
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
    brandHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerLogo: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
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
    routeConnector: {
        height: 30,
        marginLeft: 26,
        justifyContent: 'center',
    },
    verticalConnector: {
        width: 1,
        height: '100%',
        backgroundColor: colors.border,
        position: 'absolute',
        left: 0,
    },
    swapButton: {
        position: 'absolute',
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    swapIconContainer: {
        transform: [{ rotate: '90deg' }],
    },
    indicatorOuter: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 1.5,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    indicatorInner: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    suggestionIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    suggestionSubtext: {
        fontSize: 12,
        color: colors.mutedForeground,
        marginTop: 2,
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
        height: 300,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
        marginBottom: 20,
        position: 'relative',
    },
    mapControls: {
        position: 'absolute',
        bottom: 16,
        right: 16,
    },
    mapBtn: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    mapBtnText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.primary,
    },
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    birdMarkerContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.success,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
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
    suggestionsContainer: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: colors.border,
        borderTopWidth: 0,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        maxHeight: 200,
        position: 'absolute',
        top: 54, // Adjust based on input height
        left: 0,
        right: 0,
        zIndex: 1000,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    suggestionItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    suggestionText: {
        fontSize: 14,
        color: colors.foreground,
    },
});
