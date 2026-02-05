import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, TextInput, Alert, Dimensions, Image } from 'react-native';
import { MapPin, Zap, PlaneTakeoff, PlaneLanding, Search, Navigation as NavigationIcon, LocateFixed } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme/colors';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import NavigationBar from '../components/NavigationBar';
import client from '../api/client';

type Props = StackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [fromLocation, setFromLocation] = useState('Bhopal');
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

    const mapRef = useRef<MapView>(null);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();

        fetchData();
    }, []);

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
        if (!toLocation) {
            Alert.alert('Selection Required', 'Please enter your destination.');
            return;
        }
        navigation.navigate('Booking', { from: fromLocation, to: toLocation });
    };

    const handleCheckNearbyBirds = () => {
        if (birds.length > 0 && mapRef.current) {
            // Calculate bounding box for all birds
            const coords = birds.map(b => ({
                latitude: b.location ? b.location.lat : 23.2599,
                longitude: b.location ? b.location.lng : 77.4126
            }));

            mapRef.current.fitToCoordinates(coords, {
                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                animated: true,
            });
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
                        <Text style={styles.locationText}>Ready for takeoff from {fromLocation}</Text>
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
                                <PlaneTakeoff size={20} color={colors.primary} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="From"
                                    value={fromLocation}
                                    onChangeText={(text) => {
                                        setFromLocation(text);
                                        filterStations(text, 'from');
                                    }}
                                    onFocus={() => filterStations(fromLocation, 'from')}
                                    placeholderTextColor={colors.mutedForeground}
                                />
                            </View>
                            {showFromSuggestions && filteredFromStations.length > 0 && (
                                <View style={styles.suggestionsContainer}>
                                    {filteredFromStations.map((station) => (
                                        <TouchableOpacity
                                            key={station._id}
                                            style={styles.suggestionItem}
                                            onPress={() => handleSelectStation(station.name, 'from')}
                                        >
                                            <Text style={styles.suggestionText}>{station.name} ({station.city})</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        <View style={styles.routeLine}>
                            <View style={styles.verticalLine} />
                        </View>

                        <View style={{ zIndex: 10 }}>
                            <View style={styles.inputWrapper}>
                                <PlaneLanding size={20} color={colors.accent} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Where to?"
                                    value={toLocation}
                                    onChangeText={(text) => {
                                        setToLocation(text);
                                        filterStations(text, 'to');
                                    }}
                                    onFocus={() => filterStations(toLocation, 'to')}
                                    placeholderTextColor={colors.mutedForeground}
                                />
                            </View>
                            {showToSuggestions && filteredToStations.length > 0 && (
                                <View style={styles.suggestionsContainer}>
                                    {filteredToStations.map((station) => (
                                        <TouchableOpacity
                                            key={station._id}
                                            style={styles.suggestionItem}
                                            onPress={() => handleSelectStation(station.name, 'to')}
                                        >
                                            <Text style={styles.suggestionText}>{station.name} ({station.city})</Text>
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
                    <MapView
                        ref={mapRef}
                        provider={PROVIDER_GOOGLE}
                        style={StyleSheet.absoluteFillObject}
                        region={region}
                    >
                        {/* Render Stations */}
                        {stations.map((station, index) => (
                            station.location && (
                                <Marker
                                    key={`station-${index}`}
                                    coordinate={{
                                        latitude: station.location.lat,
                                        longitude: station.location.lng
                                    }}
                                    title={station.name}
                                    pinColor="blue"
                                >
                                    <View style={styles.markerContainer}>
                                        <MapPin size={24} color={colors.primary} fill="white" />
                                    </View>
                                </Marker>
                            )
                        ))}

                        {/* Render Birds */}
                        {birds.map((bird, index) => (
                            bird.location && (
                                <Marker
                                    key={`bird-${index}`}
                                    coordinate={{
                                        latitude: bird.location.lat,
                                        longitude: bird.location.lng
                                    }}
                                    title={bird.name}
                                    description={`Status: ${bird.status}`}
                                >
                                    <View style={styles.birdMarkerContainer}>
                                        <NavigationIcon size={20} color="#fff" style={{ transform: [{ rotate: '-45deg' }] }} />
                                    </View>
                                </Marker>
                            )
                        ))}
                    </MapView>

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
