import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated,
    TextInput, Alert, Dimensions, Image, ActivityIndicator, Platform,
    PermissionsAndroid, Switch, KeyboardAvoidingView, StatusBar,
} from 'react-native';
import {
    MapPin, Search, Navigation as NavigationIcon, LocateFixed,
    Plane, Ruler, Clock, ChevronRight, User, Phone, X, Edit3,
    ArrowRight, Zap, Shield, Users,
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import Geolocation from 'react-native-geolocation-service';
import { colors } from '../theme/colors';
import AppMap from '../components/AppMap';
import { getBirdLocation } from '../utils/mapUtils';
import {
    reverseGeocode, searchPlaces, getAirDistanceKm, optimizeRoute,
    calculateFare, calculateTravelTime, GeocodedAddress,
} from '../utils/locationUtils';

import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import NavigationBar from '../components/NavigationBar';
import client from '../api/client';

type Props = StackScreenProps<RootStackParamList, 'Home'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen({ navigation }: Props) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // ─── Pickup State ───
    const [pickupAddress, setPickupAddress] = useState<string>('');
    const [pickupCoords, setPickupCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [isPickupFromGPS, setIsPickupFromGPS] = useState(true);
    const [isEditingPickup, setIsEditingPickup] = useState(false);
    const [pickupSearchText, setPickupSearchText] = useState('');
    const [pickupSuggestions, setPickupSuggestions] = useState<GeocodedAddress[]>([]);
    const [isLoadingPickup, setIsLoadingPickup] = useState(true);

    // ─── Drop State ───
    const [dropAddress, setDropAddress] = useState<string>('');
    const [dropCoords, setDropCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [dropSearchText, setDropSearchText] = useState('');
    const [dropSuggestions, setDropSuggestions] = useState<GeocodedAddress[]>([]);
    const [isSearchingDrop, setIsSearchingDrop] = useState(false);
    const [showDropSearch, setShowDropSearch] = useState(false);

    // ─── Stops State ───
    const [stops, setStops] = useState<{ id: string; address: string; coords: { latitude: number; longitude: number } | null; searchText: string; suggestions: GeocodedAddress[] }[]>([]);
    const stopSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ─── Fare Estimate ───
    const [estimatedDistance, setEstimatedDistance] = useState<number>(0);
    const [estimatedFare, setEstimatedFare] = useState<number>(0);
    const [estimatedTime, setEstimatedTime] = useState<number>(0);

    // ─── Birds & Data ───
    const [birds, setBirds] = useState<any[]>([]);
    const [birdsForMap, setBirdsForMap] = useState<any[]>([]);
    const [nearestBird, setNearestBird] = useState<any>(null);
    const [loadingBirds, setLoadingBirds] = useState(true);

    // ─── Book for Someone Else ───


    // ─── Search debounce ───
    const pickupSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dropSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const locationWatchId = useRef<number | null>(null);
    const hasReceivedGPS = useRef(false);

    // Helper: set pickup from GPS coordinates
    const setPickupFromCoords = useCallback(async (latitude: number, longitude: number) => {
        if (hasReceivedGPS.current) return; // only set once automatically
        hasReceivedGPS.current = true;

        setPickupCoords({ latitude, longitude });

        // Reverse geocode to get address
        try {
            const address = await reverseGeocode(latitude, longitude);
            if (address) {
                setPickupAddress(address.shortName);
            } else {
                setPickupAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            }
        } catch (e) {
            setPickupAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
        setIsLoadingPickup(false);
        setIsPickupFromGPS(true);
    }, []);

    // ═══════════════════════════════════
    // STEP 1: Auto-detect GPS Location
    // Uses watchPosition (more reliable on Android than getCurrentPosition)
    // ═══════════════════════════════════
    useEffect(() => {
        const startLocationWatch = async () => {
            await new Promise(resolve => setTimeout(() => resolve(true), 1000));
            try {
                if (Platform.OS === 'android') {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                        {
                            title: 'Location Permission',
                            message: 'Shipra Fly needs your location to set your pickup point.',
                            buttonNeutral: 'Ask Me Later',
                            buttonNegative: 'Cancel',
                            buttonPositive: 'Allow',
                        }
                    );
                    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                        console.log('[GPS] Permission denied');
                        setIsLoadingPickup(false);
                        setIsPickupFromGPS(false);
                        return;
                    }
                }

                // Use watchPosition – it's much more reliable on Android
                locationWatchId.current = Geolocation.watchPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        console.log('[GPS] Got position:', latitude, longitude);
                        setPickupFromCoords(latitude, longitude);

                        // Stop watching once we have a good fix
                        if (locationWatchId.current !== null) {
                            Geolocation.clearWatch(locationWatchId.current);
                            locationWatchId.current = null;
                        }
                    },
                    (error) => {
                        console.log('[GPS] watchPosition error:', error.code, error.message);
                        // Don't give up yet — try getCurrentPosition as fallback
                        Geolocation.getCurrentPosition(
                            (position) => {
                                const { latitude, longitude } = position.coords;
                                console.log('[GPS] Fallback getCurrentPosition:', latitude, longitude);
                                setPickupFromCoords(latitude, longitude);
                            },
                            (fallbackError) => {
                                console.log('[GPS] Fallback also failed:', fallbackError.message);
                                // Final fallback: try low accuracy
                                Geolocation.getCurrentPosition(
                                    (position) => {
                                        const { latitude, longitude } = position.coords;
                                        console.log('[GPS] Low accuracy fallback:', latitude, longitude);
                                        setPickupFromCoords(latitude, longitude);
                                    },
                                    (finalError) => {
                                        console.log('[GPS] All methods failed:', finalError.message);
                                        if (!hasReceivedGPS.current) {
                                            setIsLoadingPickup(false);
                                            setIsPickupFromGPS(false);
                                        }
                                    },
                                    { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 }
                                );
                            },
                            { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
                        );
                    },
                    {
                        enableHighAccuracy: true,
                        distanceFilter: 0,
                        interval: 3000,
                        fastestInterval: 1500,
                        forceRequestLocation: true,
                        showLocationDialog: true,
                    }
                );

                // Safety timeout: if nothing comes in 12 seconds, stop loading
                setTimeout(() => {
                    if (!hasReceivedGPS.current) {
                        console.log('[GPS] Timeout - no location received after 12s');
                        setIsLoadingPickup(false);
                        setIsPickupFromGPS(false);
                    }
                }, 12000);

            } catch (err) {
                console.error('[Location] Permission error:', err);
                setIsLoadingPickup(false);
            }
        };

        startLocationWatch();

        return () => {
            if (locationWatchId.current !== null) {
                Geolocation.clearWatch(locationWatchId.current);
            }
        };
    }, []);

    // ═══════════════════════════════════
    // STEP 2: Fetch Birds
    // ═══════════════════════════════════
    const fetchBirds = useCallback(async () => {
        try {
            const response = await client.get('/birds');
            setBirds(response.data);
        } catch (error) {
            console.error('[Birds] Failed to fetch:', error);
        } finally {
            setLoadingBirds(false);
        }
    }, []);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start();

        // Pulse animation for GPS dot
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.3, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            ])
        ).start();

        fetchBirds();
        const interval = setInterval(fetchBirds, 15000);
        return () => clearInterval(interval);
    }, []);

    // ═══════════════════════════════════
    // STEP 3: Calculate fare when both locations set
    // ═══════════════════════════════════
    useEffect(() => {
        if (pickupCoords && dropCoords) {
            let totalDist = 0;
            let currents = pickupCoords;

            const validStops = stops.filter(s => s.coords !== null);
            validStops.forEach(stop => {
                totalDist += getAirDistanceKm(
                    currents.latitude, currents.longitude,
                    stop.coords!.latitude, stop.coords!.longitude
                );
                currents = stop.coords!;
            });

            totalDist += getAirDistanceKm(
                currents.latitude, currents.longitude,
                dropCoords.latitude, dropCoords.longitude
            );

            setEstimatedDistance(parseFloat(totalDist.toFixed(1)));
            setEstimatedFare(calculateFare(totalDist));
            setEstimatedTime(calculateTravelTime(totalDist));
        }
    }, [pickupCoords, dropCoords, stops]);

    // ═══════════════════════════════════
    // STEP 4: Calculate Nearby Birds & Map Data
    // ═══════════════════════════════════
    useEffect(() => {
        if (pickupCoords && birds.length > 0) {
            // Calculate distance & ETA for all birds
            const processedBirds = birds.map(bird => {
                const birdLoc = getBirdLocation(bird);
                // Calculate distance from pickup (or drop if booked? usually pickup for availability)
                const birdDist = getAirDistanceKm(
                    pickupCoords.latitude, pickupCoords.longitude,
                    birdLoc.latitude, birdLoc.longitude
                );
                // Calculate ETA (travel time)
                const etaMin = calculateTravelTime(birdDist);

                return {
                    ...bird,
                    currentLocation: birdLoc,
                    distFromPickup: birdDist,
                    distance: `${birdDist.toFixed(1)} km`,
                    eta: `${etaMin} min`,
                    status: bird.status || 'Active'
                };
            });

            // Filter: limit to 30km radius
            const nearbyBirds = processedBirds.filter(b => b.distFromPickup <= 30);

            // Sort: nearest first
            nearbyBirds.sort((a, b) => a.distFromPickup - b.distFromPickup);

            // Set state for map (show all nearby birds)
            setBirdsForMap(nearbyBirds);

            // Set nearest bird for booking assignment
            setNearestBird(nearbyBirds.length > 0 ? nearbyBirds[0] : null);
        } else if (birds.length > 0) {
            // Fallback: if no pickup set, show top 5 birds just to populate map
            const fallbackBirds = birds.slice(0, 5).map(b => ({
                ...b,
                currentLocation: getBirdLocation(b),
                status: b.status || 'Active'
            }));
            setBirdsForMap(fallbackBirds);
            setNearestBird(null);
        }
    }, [pickupCoords, dropCoords, birds]);

    // ═══════════════════════════════════
    // HANDLERS
    // ═══════════════════════════════════
    const handlePickupSearch = (text: string) => {
        setPickupSearchText(text);
        if (pickupSearchTimeout.current) clearTimeout(pickupSearchTimeout.current);
        if (text.length < 3) {
            setPickupSuggestions([]);
            return;
        }
        pickupSearchTimeout.current = setTimeout(async () => {
            const results = await searchPlaces(text);
            setPickupSuggestions(results);
        }, 500);
    };

    const handleDropSearch = (text: string) => {
        setDropSearchText(text);
        if (dropSearchTimeout.current) clearTimeout(dropSearchTimeout.current);
        if (text.length < 3) {
            setDropSuggestions([]);
            return;
        }
        setIsSearchingDrop(true);
        dropSearchTimeout.current = setTimeout(async () => {
            const results = await searchPlaces(text);
            setDropSuggestions(results);
            setIsSearchingDrop(false);
        }, 500);
    };

    const handleSelectPickup = (place: GeocodedAddress) => {
        setPickupAddress(place.shortName);
        setPickupCoords({ latitude: place.latitude, longitude: place.longitude });
        setIsEditingPickup(false);
        setPickupSearchText('');
        setPickupSuggestions([]);
        setIsPickupFromGPS(false);
    };

    const handleSelectDrop = (place: GeocodedAddress) => {
        setDropAddress(place.shortName);
        setDropCoords({ latitude: place.latitude, longitude: place.longitude });
        setShowDropSearch(false);
        setDropSearchText('');
        setDropSuggestions([]);
    };

    const handleAddStop = () => {
        if (stops.length >= 3) {
            Alert.alert('Limit Reached', 'You can add up to 3 intermediate stops.');
            return;
        }
        setStops([...stops, { id: Date.now().toString(), address: '', coords: null, searchText: '', suggestions: [] }]);
    };

    const handleRemoveStop = (index: number) => {
        const newStops = [...stops];
        newStops.splice(index, 1);
        setStops(newStops);
    };

    const handleStopSearch = (text: string, index: number) => {
        const newStops = [...stops];
        newStops[index].searchText = text;
        setStops(newStops);

        if (stopSearchTimeout.current) clearTimeout(stopSearchTimeout.current);
        if (text.length < 3) {
            newStops[index].suggestions = [];
            setStops(newStops);
            return;
        }

        stopSearchTimeout.current = setTimeout(async () => {
            const results = await searchPlaces(text);
            setStops(prev => {
                const updated = [...prev];
                if (updated[index]) updated[index].suggestions = results;
                return updated;
            });
        }, 500);
    };

    const handleSelectStop = (place: GeocodedAddress, index: number) => {
        setStops(prev => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                address: place.shortName,
                coords: { latitude: place.latitude, longitude: place.longitude },
                searchText: '',
                suggestions: []
            };
            return updated;
        });
    };

    const handleOptimizeRoute = () => {
        if (!pickupCoords || !dropCoords) {
            Alert.alert('Locations Missing', 'Please set pickup and drop locations first.');
            return;
        }
        const validStops = stops.filter(s => s.coords !== null);
        if (validStops.length === 0) return;

        const stopsForOpt = validStops.map(s => ({ ...s.coords!, id: s.id }));
        const { sortedIndices, totalDistance } = optimizeRoute(pickupCoords, stopsForOpt, dropCoords);

        const reorderedStops = sortedIndices.map(i => validStops[i]);
        setStops(reorderedStops);

        Alert.alert('Route Optimized', `Route reordered for minimal distance: ${totalDistance.toFixed(1)} km`);
    };

    const handleResetToGPS = () => {
        setIsLoadingPickup(true);
        setIsEditingPickup(false);
        hasReceivedGPS.current = false; // allow re-detection

        // Try watchPosition first (most reliable on Android)
        const resetWatchId = Geolocation.watchPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                Geolocation.clearWatch(resetWatchId);
                setPickupCoords({ latitude, longitude });
                try {
                    const address = await reverseGeocode(latitude, longitude);
                    setPickupAddress(address ? address.shortName : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                } catch {
                    setPickupAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                }
                setIsLoadingPickup(false);
                setIsPickupFromGPS(true);
                hasReceivedGPS.current = true;
            },
            (error) => {
                console.log('[GPS Reset] watchPosition failed, trying getCurrentPosition');
                Geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        setPickupCoords({ latitude, longitude });
                        try {
                            const address = await reverseGeocode(latitude, longitude);
                            setPickupAddress(address ? address.shortName : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                        } catch {
                            setPickupAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                        }
                        setIsLoadingPickup(false);
                        setIsPickupFromGPS(true);
                        hasReceivedGPS.current = true;
                    },
                    () => {
                        Alert.alert('GPS Error', 'Could not detect your location. Please enter manually.');
                        setIsLoadingPickup(false);
                    },
                    { enableHighAccuracy: false, timeout: 15000, maximumAge: 30000 }
                );
            },
            {
                enableHighAccuracy: true,
                distanceFilter: 0,
                interval: 2000,
                fastestInterval: 1000,
                forceRequestLocation: true,
                showLocationDialog: true,
            }
        );

        // Safety timeout
        setTimeout(() => {
            Geolocation.clearWatch(resetWatchId);
            if (!hasReceivedGPS.current) {
                setIsLoadingPickup(false);
            }
        }, 10000);
    };

    // Backup: receive location from AppMap's onLocationUpdate callback
    const handleMapLocationUpdate = useCallback(async (coords: { latitude: number; longitude: number }) => {
        // Only use as backup if we haven't gotten GPS yet
        if (!hasReceivedGPS.current && isLoadingPickup) {
            console.log('[GPS] Received location from AppMap backup:', coords.latitude, coords.longitude);
            hasReceivedGPS.current = true;
            setPickupCoords(coords);
            try {
                const address = await reverseGeocode(coords.latitude, coords.longitude);
                setPickupAddress(address ? address.shortName : `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
            } catch {
                setPickupAddress(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
            }
            setIsLoadingPickup(false);
            setIsPickupFromGPS(true);
        }
    }, [isLoadingPickup]);

    const handleSetDropToCurrentLocation = () => {
        Geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setDropCoords({ latitude, longitude });
                try {
                    const address = await reverseGeocode(latitude, longitude);
                    setDropAddress(address ? address.shortName : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                    setShowDropSearch(false);
                } catch {
                    setDropAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                    setShowDropSearch(false);
                }
            },
            (error) => {
                console.log(error);
                Alert.alert('Error', 'Could not detect current location.');
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    const handleConfirmBooking = () => {
        if (!pickupCoords) {
            Alert.alert('Pickup Required', 'Please set your pickup location.');
            return;
        }
        if (!dropCoords) {
            Alert.alert('Drop Required', 'Please enter your drop/destination location.');
            return;
        }
        if (estimatedDistance < 0.1) {
            Alert.alert('Invalid Route', 'Pickup and drop locations are too close or the same.');
            return;
        }


        navigation.navigate('Booking', {
            from: pickupAddress,
            to: dropAddress,
            fromCoords: pickupCoords,
            toCoords: dropCoords,
            stops: stops.filter(s => s.coords !== null).map(s => ({ address: s.address, coords: s.coords! })),

        });
    };

    // ═══════════════════════════════════
    // RENDER
    // ═══════════════════════════════════
    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* ─── Header ─── */}
            <LinearGradient
                colors={['rgba(79, 70, 229, 0.12)', 'rgba(79, 70, 229, 0.02)', 'transparent']}
                style={styles.header}
            >
                <Animated.View style={{ opacity: fadeAnim }}>
                    <View style={styles.brandHeader}>
                        <Image source={require('../assets/logo.png')} style={styles.headerLogo} />
                        <View>
                            <Text style={styles.greeting}>Shipra Fly</Text>
                            <Text style={styles.tagline}>Your Bird, Your Way</Text>
                        </View>
                    </View>
                </Animated.View>
            </LinearGradient>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* ─── Pickup Location Card ─── */}
                <Animated.View style={[styles.locationCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <View style={styles.locationCardHeader}>
                        <View style={styles.cardHeaderLeft}>
                            <View style={styles.pickupDot}>
                                <Animated.View style={[styles.pickupDotInner, { transform: [{ scale: pulseAnim }] }]} />
                                <View style={styles.pickupDotCore} />
                            </View>
                            <Text style={styles.locationLabel}>PICKUP</Text>
                        </View>
                        {pickupAddress && !isEditingPickup && (
                            <View style={styles.pickupActions}>
                                {!isPickupFromGPS && (
                                    <TouchableOpacity style={styles.gpsBtn} onPress={handleResetToGPS}>
                                        <LocateFixed size={14} color={colors.primary} />
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditingPickup(true)}>
                                    <Edit3 size={14} color={colors.mutedForeground} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {isLoadingPickup ? (
                        <View style={styles.loadingRow}>
                            <ActivityIndicator size="small" color={colors.primary} />
                            <Text style={styles.loadingText}>Detecting your location...</Text>
                        </View>
                    ) : isEditingPickup ? (
                        <View style={{ zIndex: 30 }}>
                            <View style={styles.searchInputWrapper}>
                                <Search size={16} color={colors.mutedForeground} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search pickup location..."
                                    value={pickupSearchText}
                                    onChangeText={handlePickupSearch}
                                    autoFocus
                                    placeholderTextColor={colors.mutedForeground}
                                />
                                <TouchableOpacity onPress={() => { setIsEditingPickup(false); setPickupSearchText(''); setPickupSuggestions([]); }}>
                                    <X size={18} color={colors.mutedForeground} />
                                </TouchableOpacity>
                            </View>
                            {pickupSuggestions.length > 0 && (
                                <View style={styles.suggestionsBox}>
                                    {pickupSuggestions.map((place, index) => (
                                        <TouchableOpacity
                                            key={`pickup-${index}`}
                                            style={styles.suggestionItem}
                                            onPress={() => handleSelectPickup(place)}
                                        >
                                            <View style={styles.suggestionIcon}>
                                                <MapPin size={14} color={colors.primary} />
                                            </View>
                                            <View style={styles.suggestionTextContainer}>
                                                <Text style={styles.suggestionTitle} numberOfLines={1}>{place.shortName}</Text>
                                                <Text style={styles.suggestionSub} numberOfLines={1}>{place.city}{place.state ? `, ${place.state}` : ''}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                            {/* GPS Reset Button */}
                            <TouchableOpacity style={styles.useGPSButton} onPress={handleResetToGPS}>
                                <LocateFixed size={16} color={colors.primary} />
                                <Text style={styles.useGPSText}>Use Current Location</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View>
                            <TouchableOpacity style={styles.locationDisplay} onPress={() => setIsEditingPickup(true)}>
                                <View style={styles.locationDisplayContent}>
                                    <Text style={styles.locationAddress} numberOfLines={2}>
                                        {pickupAddress || 'Tap to set pickup location'}
                                    </Text>
                                    {isPickupFromGPS && (
                                        <View style={styles.gpsBadge}>
                                            <LocateFixed size={10} color={colors.success} />
                                            <Text style={styles.gpsBadgeText}>GPS</Text>
                                        </View>
                                    )}
                                </View>
                                <ChevronRight size={18} color={colors.mutedForeground} />
                            </TouchableOpacity>
                            {!isPickupFromGPS && (
                                <TouchableOpacity style={styles.useGPSButton} onPress={handleResetToGPS}>
                                    <LocateFixed size={16} color={colors.primary} />
                                    <Text style={styles.useGPSText}>Use Current Location</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* ─── Stops List ─── */}
                    {stops.length > 0 && stops.map((stop, index) => (
                        <View key={stop.id} style={{ zIndex: 10 + index }}>
                            <View style={styles.connector}>
                                <View style={styles.connectorDot} />
                                <View style={styles.connectorDot} />
                            </View>

                            <View style={styles.stopRow}>
                                <View style={styles.stopDot} />
                                <View style={{ flex: 1 }}>
                                    <View style={styles.stopInputWrapper}>
                                        <MapPin size={14} color={colors.primary} />
                                        <TextInput
                                            style={styles.stopInput}
                                            placeholder={`Stop ${index + 1}`}
                                            value={stop.searchText || stop.address}
                                            onChangeText={(text) => handleStopSearch(text, index)}
                                        />
                                        <TouchableOpacity onPress={() => handleRemoveStop(index)}>
                                            <X size={16} color={colors.mutedForeground} />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Suggestions */}
                                    {stop.suggestions.length > 0 && (
                                        <View style={[styles.suggestionsBox, { top: 44 }]}>
                                            {stop.suggestions.map((place, idx) => (
                                                <TouchableOpacity
                                                    key={`s-${index}-${idx}`}
                                                    style={styles.suggestionItem}
                                                    onPress={() => handleSelectStop(place, index)}
                                                >
                                                    <View style={styles.suggestionIcon}>
                                                        <MapPin size={14} color={colors.primary} />
                                                    </View>
                                                    <View style={styles.suggestionTextContainer}>
                                                        <Text style={styles.suggestionTitle} numberOfLines={1}>{place.shortName}</Text>
                                                        <Text style={styles.suggestionSub} numberOfLines={1}>{place.city}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>
                    ))}

                    <View style={styles.connector}>
                        <View style={styles.connectorDot} />
                        <View style={styles.connectorDot} />
                        <View style={styles.connectorDot} />
                    </View>

                    {/* Add Stop & Optimize Actions */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.addStopBtn} onPress={handleAddStop}>
                            <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>+</Text>
                            </View>
                            <Text style={styles.addStopText}>Add Stop</Text>
                        </TouchableOpacity>

                        {stops.length > 0 && (
                            <TouchableOpacity style={styles.optimizeBtn} onPress={handleOptimizeRoute}>
                                <Zap size={12} color={colors.primary} />
                                <Text style={styles.optimizeText}>Optimize Route</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* ─── Drop Location ─── */}
                    <View style={styles.locationCardHeader}>
                        <View style={styles.cardHeaderLeft}>
                            <View style={styles.dropDot} />
                            <Text style={styles.locationLabel}>DROP</Text>
                        </View>
                        {dropAddress && (
                            <TouchableOpacity onPress={() => { setDropAddress(''); setDropCoords(null); setShowDropSearch(true); }}>
                                <X size={16} color={colors.mutedForeground} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {!dropAddress || showDropSearch ? (
                        <View style={{ zIndex: 20 }}>
                            <View style={styles.searchInputWrapper}>
                                <Search size={16} color={colors.mutedForeground} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Where are you going?"
                                    value={dropSearchText}
                                    onChangeText={handleDropSearch}
                                    autoFocus={showDropSearch}
                                    placeholderTextColor={colors.mutedForeground}
                                />
                                {isSearchingDrop && <ActivityIndicator size="small" color={colors.primary} />}
                            </View>
                            {dropSuggestions.length > 0 && (
                                <View style={styles.suggestionsBox}>
                                    {dropSuggestions.map((place, index) => (
                                        <TouchableOpacity
                                            key={`drop-${index}`}
                                            style={styles.suggestionItem}
                                            onPress={() => handleSelectDrop(place)}
                                        >
                                            <View style={styles.suggestionIcon}>
                                                <MapPin size={14} color={colors.accent} />
                                            </View>
                                            <View style={styles.suggestionTextContainer}>
                                                <Text style={styles.suggestionTitle} numberOfLines={1}>{place.shortName}</Text>
                                                <Text style={styles.suggestionSub} numberOfLines={1}>{place.city}{place.state ? `, ${place.state}` : ''}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                            {!isPickupFromGPS && (
                                <TouchableOpacity style={styles.useGPSButton} onPress={handleSetDropToCurrentLocation}>
                                    <LocateFixed size={16} color={colors.primary} />
                                    <Text style={styles.useGPSText}>Set Drop to Current Location</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.locationDisplay} onPress={() => setShowDropSearch(true)}>
                            <View style={styles.locationDisplayContent}>
                                <Text style={styles.locationAddress} numberOfLines={2}>{dropAddress}</Text>
                            </View>
                            <ChevronRight size={18} color={colors.mutedForeground} />
                        </TouchableOpacity>
                    )}
                </Animated.View>

                {/* ─── Map Visualization ─── */}
                <Animated.View style={[styles.mapCard, { opacity: fadeAnim }]}>
                    <AppMap
                        style={StyleSheet.absoluteFillObject}
                        showUserLocation={true}
                        routeStart={pickupCoords || undefined}
                        routeEnd={dropCoords || undefined}
                        waypoints={stops.map(s => s.coords).filter((c): c is { latitude: number; longitude: number } => c !== null)}
                        birds={birdsForMap}
                        stations={[]}
                        onLocationUpdate={(coords) => {
                            // Backup strategy: if main GPS failed/is loading, use map location
                            handleMapLocationUpdate(coords);

                            // If already using GPS mode, keep location synced live
                            if (isPickupFromGPS && !isEditingPickup && hasReceivedGPS.current) {
                                setPickupCoords(coords);
                            }
                        }}
                    />
                    {pickupCoords && dropCoords && (
                        <View style={styles.mapOverlayBadge}>
                            <Ruler size={12} color="#fff" />
                            <Text style={styles.mapOverlayText}>{estimatedDistance} km (air)</Text>
                        </View>
                    )}
                </Animated.View>

                {/* ─── Fare Estimate Card ─── */}
                {pickupCoords && dropCoords && estimatedDistance > 0 && (
                    <Animated.View style={[styles.fareCard, { opacity: fadeAnim }]}>
                        <View style={styles.fareHeader}>
                            <View style={styles.fareHeaderLeft}>
                                <Plane size={20} color={colors.primary} />
                                <Text style={styles.fareTitle}>Bird Fare Estimate</Text>
                            </View>
                            <View style={styles.fareAmountContainer}>
                                <Text style={styles.fareCurrency}>₹</Text>
                                <Text style={styles.fareAmount}>{estimatedFare.toLocaleString()}</Text>
                            </View>
                        </View>

                        <View style={styles.fareStats}>
                            <View style={styles.fareStat}>
                                <Ruler size={16} color={colors.primary} />
                                <Text style={styles.fareStatValue}>{estimatedDistance} km</Text>
                                <Text style={styles.fareStatLabel}>Air Distance</Text>
                            </View>
                            <View style={styles.fareStatDivider} />
                            <View style={styles.fareStat}>
                                <Clock size={16} color={colors.primary} />
                                <Text style={styles.fareStatValue}>
                                    {estimatedTime >= 60
                                        ? `${Math.floor(estimatedTime / 60)}h ${estimatedTime % 60}m`
                                        : `${estimatedTime} min`}
                                </Text>
                                <Text style={styles.fareStatLabel}>Est. Time</Text>
                            </View>
                            <View style={styles.fareStatDivider} />
                            <View style={styles.fareStat}>
                                <Zap size={16} color={colors.primary} />
                                <Text style={styles.fareStatValue}>~100</Text>
                                <Text style={styles.fareStatLabel}>km/h Avg</Text>
                            </View>
                        </View>

                        {nearestBird && (
                            <View style={styles.nearestBirdRow}>
                                <View style={styles.nearestBirdIcon}>
                                    <Plane size={14} color="#fff" />
                                </View>
                                <View style={styles.nearestBirdInfo}>
                                    <Text style={styles.nearestBirdName}>{nearestBird.name || 'Bird'}</Text>
                                    <Text style={styles.nearestBirdDist}>
                                        {nearestBird.distFromPickup?.toFixed(1)} km from pickup • Nearest available
                                    </Text>
                                </View>
                            </View>
                        )}

                        <View style={styles.fareNoteRow}>
                            <Shield size={12} color={colors.mutedForeground} />
                            <Text style={styles.fareNote}>Distance is measured as straight-line (air displacement)</Text>
                        </View>
                    </Animated.View>
                )}

                {/* ─── Book for Someone Else ─── */}


                {/* ─── Book Bird Button ─── */}
                {/* ─── Book Bird Button ─── */}
                <TouchableOpacity
                    style={[
                        styles.bookButton,
                        (!pickupCoords || !dropCoords || estimatedFare <= 0) && styles.bookButtonDisabled,
                    ]}
                    onPress={handleConfirmBooking}
                    activeOpacity={0.85}
                    disabled={!pickupCoords || !dropCoords || estimatedFare <= 0}
                >
                    <LinearGradient
                        colors={
                            pickupCoords && dropCoords && estimatedFare > 0
                                ? [colors.primary, '#6366f1']
                                : ['#c7c7cc', '#a8a8ad']
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.bookButtonGradient}
                    >
                        <Text style={styles.bookButtonText}>
                            {pickupCoords && dropCoords && estimatedFare > 0
                                ? `Book Bird • ₹${estimatedFare.toLocaleString()}`
                                : 'Set Pickup & Drop to Book'}
                        </Text>
                        <ArrowRight size={20} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>

                {/* ─── Eco Bird Status ─── */}
                <Animated.View style={[styles.birdCard, { opacity: fadeAnim }]}>
                    <View style={styles.birdContent}>
                        <View style={styles.birdHeader}>
                            <View>
                                <Text style={styles.birdTitle}>Eco-Bird Fleet</Text>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>
                                        {birdsForMap.length} birds within 30km
                                    </Text>
                                </View>
                            </View>
                            <Image
                                source={require('../assets/360.gif')}
                                style={{ width: 60, height: 40 }}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={styles.birdInfoRow}>
                            <Zap size={20} color={colors.accent} />
                            <Text style={styles.birdName}>
                                {nearestBird
                                    ? `Nearest: ${nearestBird.distance} • ETA ${nearestBird.eta}`
                                    : 'Scanning availability...'}
                            </Text>
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

// ═══════════════════════════════════════
// STYLES
// ═══════════════════════════════════════
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 52,
        paddingBottom: 16,
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
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    tagline: {
        fontSize: 12,
        color: colors.mutedForeground,
        marginTop: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },

    // ─── Location Card ───
    locationCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
    },
    locationCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    pickupDot: {
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickupDotInner: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
    },
    pickupDotCore: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.success,
    },
    dropDot: {
        width: 12,
        height: 12,
        borderRadius: 3,
        backgroundColor: '#ef4444',
        marginLeft: 4,
    },
    locationLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.mutedForeground,
        letterSpacing: 1.5,
    },
    pickupActions: {
        flexDirection: 'row',
        gap: 8,
    },
    gpsBtn: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(79, 70, 229, 0.08)',
    },
    editBtn: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
    },

    // Loading
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 14,
        paddingHorizontal: 4,
    },
    loadingText: {
        fontSize: 14,
        color: colors.mutedForeground,
    },

    // Location Display
    locationDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    locationDisplayContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    locationAddress: {
        fontSize: 15,
        color: colors.foreground,
        fontWeight: '500',
        flex: 1,
    },
    gpsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
    },
    gpsBadgeText: {
        fontSize: 9,
        fontWeight: '700',
        color: colors.success,
        letterSpacing: 0.5,
    },

    // Search
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 50,
        borderWidth: 1.5,
        borderColor: colors.primary,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: colors.foreground,
    },
    suggestionsBox: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: colors.border,
        borderTopWidth: 0,
        borderBottomLeftRadius: 14,
        borderBottomRightRadius: 14,
        maxHeight: 220,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
        gap: 10,
    },
    suggestionIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#f5f3ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    suggestionTextContainer: {
        flex: 1,
    },
    suggestionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.foreground,
    },
    suggestionSub: {
        fontSize: 11,
        color: colors.mutedForeground,
        marginTop: 2,
    },
    useGPSButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 4,
    },
    useGPSText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },

    // Connector
    connector: {
        alignItems: 'flex-start',
        paddingLeft: 8,
        gap: 4,
        marginVertical: 6,
    },
    connectorDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: colors.mutedForeground,
        opacity: 0.4,
    },

    // ─── Map ───
    mapCard: {
        height: 220,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
        marginBottom: 16,
        position: 'relative',
    },
    mapOverlayBadge: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    mapOverlayText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },

    // ─── Fare Card ───
    fareCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 16,
        elevation: 3,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
    },
    fareHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
    },
    fareHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    fareTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.foreground,
    },
    fareAmountContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    fareCurrency: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primary,
        marginTop: 2,
    },
    fareAmount: {
        fontSize: 26,
        fontWeight: 'bold',
        color: colors.primary,
    },
    fareStats: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 14,
        marginBottom: 14,
    },
    fareStat: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    fareStatValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    fareStatLabel: {
        fontSize: 10,
        color: colors.mutedForeground,
    },
    fareStatDivider: {
        width: 1,
        backgroundColor: colors.border,
        marginHorizontal: 4,
    },
    nearestBirdRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'rgba(16, 185, 129, 0.06)',
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
    },
    nearestBirdIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: colors.success,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nearestBirdInfo: {
        flex: 1,
    },
    nearestBirdName: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.foreground,
    },
    nearestBirdDist: {
        fontSize: 11,
        color: colors.mutedForeground,
        marginTop: 1,
    },
    fareNoteRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    fareNote: {
        fontSize: 11,
        color: colors.mutedForeground,
        fontStyle: 'italic',
    },

    // ─── Book for Others ───


    // ─── Book Button ───
    bookButton: {
        marginBottom: 16,
        borderRadius: 18,
        overflow: 'hidden',
        elevation: 6,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    bookButtonDisabled: {
        elevation: 2,
        shadowOpacity: 0.1,
    },
    bookButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 10,
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: 'bold',
    },

    // ─── Bird Status ───
    birdCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 16,
        marginBottom: 20,
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
        marginTop: 4,
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
    // Stops
    stopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    stopDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#8b5cf6', marginRight: 12, marginLeft: 6 },
    stopInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 8, paddingHorizontal: 10, height: 40, borderWidth: 1, borderColor: colors.border },
    stopInput: { flex: 1, fontSize: 13, color: colors.foreground, marginLeft: 8 },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4, marginTop: 4 },
    addStopBtn: { flexDirection: 'row', alignItems: 'center' },
    addStopText: { fontSize: 12, color: colors.primary, fontWeight: 'bold', marginLeft: 6 },
    optimizeBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eef2ff', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    optimizeText: { fontSize: 11, color: colors.primary, fontWeight: 'bold', marginLeft: 6 },
});
