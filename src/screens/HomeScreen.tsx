import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView, Animated,
    TextInput, Alert, Dimensions, Image, ActivityIndicator, Platform,
    PermissionsAndroid, StatusBar, Modal, FlatList,
} from 'react-native';
import {
    MapPin, Search, LocateFixed,
    Plane, Ruler, Clock, ChevronRight, X, Edit3,
    ArrowRight, Zap, Shield,
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
import { styles } from './HomeScreen.styles';
import { API_URL } from '@env';

type Props = StackScreenProps<RootStackParamList, 'Home'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen({ navigation }: Props) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // ─── Search Modal State ───
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [searchType, setSearchType] = useState<'pickup' | 'drop' | 'stop' | null>(null);
    const [activeStopIndex, setActiveStopIndex] = useState<number | null>(null);
    const [searchText, setSearchText] = useState('');
    const [suggestions, setSuggestions] = useState<GeocodedAddress[]>([]);
    const [isSearching, setIsSearching] = useState(false);

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
    const [verbiports, setVerbiports] = useState<any[]>([]);
    const [loadingVerbiports, setLoadingVerbiports] = useState(true);

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
    const fetchBirds = useCallback(async (retryCount = 0) => {
        try {
            const response = await client.get('/birds');
            const fetchedBirds = response.data;
            setBirds(fetchedBirds);

            if (!pickupCoords) {
                const fallbackBirds = fetchedBirds.slice(0, 5).map((b: any) => ({
                    ...b,
                    currentLocation: getBirdLocation(b),
                    status: b.status || 'Active'
                }));
                setBirdsForMap(fallbackBirds);
                return;
            }

            const processedBirds = fetchedBirds.map((b: any) => {
                const loc = getBirdLocation(b);
                const dist = getAirDistanceKm(
                    pickupCoords.latitude,
                    pickupCoords.longitude,
                    loc.latitude,
                    loc.longitude
                );
                return {
                    ...b,
                    currentLocation: loc,
                    distFromPickup: parseFloat(dist.toFixed(1)),
                    status: b.status || 'Active'
                };
            });

            const nearbyBirds = processedBirds.filter((b: any) => b.distFromPickup <= 30);
            nearbyBirds.sort((a: any, b: any) => a.distFromPickup - b.distFromPickup);
            setBirdsForMap(nearbyBirds);
            setNearestBird(nearbyBirds.length > 0 ? nearbyBirds[0] : null);
        } catch (error: any) {
            console.error('[Birds] Failed to fetch:', error.message);
            if (retryCount < 2) {
                setTimeout(() => fetchBirds(retryCount + 1), 3000);
            }
        } finally {
            setLoadingBirds(false);
        }
    }, [pickupCoords]);

    const fetchVerbiports = useCallback(async (retryCount = 0) => {
        try {
            console.log(`[Verbiports] Fetching from: ${API_URL}/verbiports (Attempt ${retryCount + 1})`);
            const response = await client.get('/verbiports');
            setVerbiports(response.data);
            console.log(`[Verbiports] Successfully fetched ${response.data.length} verbiports`);
        } catch (error: any) {
            console.error('[Verbiports] Failed to fetch:', error.message);
            if (retryCount < 2) {
                console.log('[Verbiports] Retrying in 2 seconds...');
                setTimeout(() => fetchVerbiports(retryCount + 1), 2000);
            }
        } finally {
            setLoadingVerbiports(false);
        }
    }, [API_URL]);

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
        fetchVerbiports();
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

        // Check if input is "latitude, longitude" or "latitude longitude"
        const coordMatch = text.match(/^([-+]?\d{1,3}\.?\d*)[,\s]+([-+]?\d{1,3}\.?\d*)$/);
        if (coordMatch) {
            const lat = parseFloat(coordMatch[1]);
            const lng = parseFloat(coordMatch[2]);
            if (!isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
                // Show immediate coordinate suggestion
                const coordSuggestion = {
                    shortName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                    displayName: `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                    latitude: lat,
                    longitude: lng,
                    city: 'Custom Point',
                    state: ''
                };
                setPickupSuggestions([coordSuggestion]);

                // Try to get address if network available
                pickupSearchTimeout.current = setTimeout(async () => {
                    const result = await reverseGeocode(lat, lng);
                    if (result) {
                        setPickupSuggestions([result]);
                    }
                }, 800);
                return;
            }
        }

        // Filter verbiports locally first
        if (text.length > 0) {
            const matchedVerbiports = verbiports.filter(s =>
                s.name.toLowerCase().includes(text.toLowerCase())
            ).map(s => ({
                shortName: s.name,
                displayName: s.name,
                latitude: s.location.lat,
                longitude: s.location.lng,
                city: 'Verbiport',
                state: ''
            }));

            if (matchedVerbiports.length > 0) {
                setPickupSuggestions(matchedVerbiports);
            }
        }

        if (text.length < 3) {
            if (text.length === 0) setPickupSuggestions([]);
            return;
        }

        pickupSearchTimeout.current = setTimeout(async () => {
            const results = await searchPlaces(text);
            // Combine with verbiports if not already matched
            setPickupSuggestions(prev => {
                const combined = [...prev];
                results.forEach(r => {
                    if (!combined.find(c => c.shortName === r.shortName)) {
                        combined.push(r);
                    }
                });
                return combined;
            });
        }, 500);
    };

    const handleDropSearch = (text: string) => {
        setDropSearchText(text);
        if (dropSearchTimeout.current) clearTimeout(dropSearchTimeout.current);

        // Check if input is "latitude, longitude" or "latitude longitude"
        const coordMatch = text.match(/^([-+]?\d{1,3}\.?\d*)[,\s]+([-+]?\d{1,3}\.?\d*)$/);
        if (coordMatch) {
            const lat = parseFloat(coordMatch[1]);
            const lng = parseFloat(coordMatch[2]);
            if (!isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
                // Show immediate coordinate suggestion
                const coordSuggestion = {
                    shortName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                    displayName: `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                    latitude: lat,
                    longitude: lng,
                    city: 'Custom Point',
                    state: ''
                };
                setDropSuggestions([coordSuggestion]);

                // Try to get address if network available
                dropSearchTimeout.current = setTimeout(async () => {
                    const result = await reverseGeocode(lat, lng);
                    if (result) {
                        setDropSuggestions([result]);
                    }
                }, 800);
                return;
            }
        }

        // Filter verbiports locally first
        if (text.length > 0) {
            const matchedVerbiports = verbiports.filter(s =>
                s.name.toLowerCase().includes(text.toLowerCase())
            ).map(s => ({
                shortName: s.name,
                displayName: s.name,
                latitude: s.location.lat,
                longitude: s.location.lng,
                city: 'Verbiport',
                state: ''
            }));

            if (matchedVerbiports.length > 0) {
                setDropSuggestions(matchedVerbiports);
            }
        }

        if (text.length < 3) {
            if (text.length === 0) setDropSuggestions([]);
            return;
        }

        setIsSearchingDrop(true);
        dropSearchTimeout.current = setTimeout(async () => {
            const results = await searchPlaces(text);
            setDropSuggestions(prev => {
                const combined = [...prev];
                results.forEach(r => {
                    if (!combined.find(c => c.shortName === r.shortName)) {
                        combined.push(r);
                    }
                });
                return combined;
            });
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

        // Check if input is "latitude, longitude"
        const coordMatch = text.match(/^([-+]?\d{1,2}\.?\d*),\s*([-+]?\d{1,3}\.?\d*)$/);
        if (coordMatch) {
            const lat = parseFloat(coordMatch[1]);
            const lng = parseFloat(coordMatch[2]);
            if (!isNaN(lat) && !isNaN(lng)) {
                stopSearchTimeout.current = setTimeout(async () => {
                    const result = await reverseGeocode(lat, lng);
                    if (result) {
                        setStops(prev => {
                            const updated = [...prev];
                            if (updated[index]) updated[index].suggestions = [result];
                            return updated;
                        });
                    }
                }, 800);
                return;
            }
        }

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

    // ═══════════════════════════════════
    // SEARCH MODAL HANDLERS
    // ═══════════════════════════════════

    const handleOpenSearch = (type: 'pickup' | 'drop' | 'stop', index: number | null = null) => {
        setSearchType(type);
        setActiveStopIndex(index);
        setSearchText('');
        setSuggestions([]);
        setSearchModalVisible(true);
        // Pre-populate with verbiports initially?
        // setSuggestions(verbiports.map(v => ({ ...v, shortName: v.name, displayName: v.name, latitude: v.location.lat, longitude: v.location.lng, city: 'Verbiport' })));
    };

    const handleCloseSearch = () => {
        setSearchModalVisible(false);
        setSearchType(null);
        setActiveStopIndex(null);
    };

    const handleSearchInput = (text: string) => {
        setSearchText(text);
        if (pickupSearchTimeout.current) clearTimeout(pickupSearchTimeout.current);

        // Check coordinates
        const coordMatch = text.match(/^([-+]?\d{1,3}\.?\d*)[,\s]+([-+]?\d{1,3}\.?\d*)$/);
        if (coordMatch) {
            const lat = parseFloat(coordMatch[1]);
            const lng = parseFloat(coordMatch[2]);
            if (!isNaN(lat) && !isNaN(lng)) {
                setSuggestions([{
                    shortName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                    displayName: `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                    latitude: lat,
                    longitude: lng,
                    city: 'Custom Point',
                    state: '',
                    country: ''
                }]);
                return;
            }
        }

        // Local Verbiports Filter
        let localResults: GeocodedAddress[] = [];
        if (text.length > 0) {
            localResults = verbiports.filter(s =>
                s.name.toLowerCase().includes(text.toLowerCase())
            ).map(s => ({
                shortName: s.name,
                displayName: s.name,
                latitude: s.location.lat,
                longitude: s.location.lng,
                city: 'Verbiport',
                state: '',
                country: 'India'
            }));
        }

        if (text.length < 3) {
            setSuggestions(localResults);
            return;
        }

        setIsSearching(true);
        pickupSearchTimeout.current = setTimeout(async () => {
            try {
                const results = await searchPlaces(text);
                // Merge distinct results
                const combined = [...localResults];
                results.forEach(r => {
                    if (!combined.find(c => c.shortName === r.shortName)) {
                        combined.push(r);
                    }
                });
                setSuggestions(combined);
            } catch (e) {
                console.warn(e);
                setSuggestions(localResults);
            } finally {
                setIsSearching(false);
            }
        }, 500);
    };

    const handleSelectResult = (place: GeocodedAddress) => {
        if (searchType === 'pickup') {
            handleSelectPickup(place);
        } else if (searchType === 'drop') {
            handleSelectDrop(place);
        } else if (searchType === 'stop' && activeStopIndex !== null) {
            handleSelectStop(place, activeStopIndex);
        }
        handleCloseSearch();
    };

    const handleSetCurrentLocation = () => {
        // Logic for "Use Current Location" button in modal
        setIsLoadingPickup(true);
        Geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const coords = { latitude, longitude };
                let addressName = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                try {
                    const address = await reverseGeocode(latitude, longitude);
                    if (address) addressName = address.shortName;
                } catch { }

                const place: GeocodedAddress = {
                    shortName: addressName,
                    displayName: 'Current Location',
                    latitude,
                    longitude,
                    city: 'Current Location',
                    state: '',
                    country: ''
                };
                handleSelectResult(place);
                setIsLoadingPickup(false);
            },
            (error) => {
                Alert.alert('Error', 'Could not get current location');
                setIsLoadingPickup(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    }

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
                        {pickupAddress && (
                            <View style={styles.pickupActions}>
                                {!isPickupFromGPS && (
                                    <TouchableOpacity style={styles.gpsBtn} onPress={handleResetToGPS}>
                                        <LocateFixed size={14} color={colors.primary} />
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity style={styles.editBtn} onPress={() => handleOpenSearch('pickup')}>
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
                    ) : (
                        <View>
                            <TouchableOpacity style={styles.locationDisplay} onPress={() => handleOpenSearch('pickup')}>
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
                                        <TouchableOpacity
                                            style={[styles.stopInput, { justifyContent: 'center' }]}
                                            onPress={() => handleOpenSearch('stop', index)}
                                        >
                                            <Text style={{ color: stop.address ? colors.foreground : colors.mutedForeground }} numberOfLines={1}>
                                                {stop.address || `Stop ${index + 1}`}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleRemoveStop(index)}>
                                            <X size={16} color={colors.mutedForeground} />
                                        </TouchableOpacity>
                                    </View>
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
                            <TouchableOpacity onPress={() => handleOpenSearch('drop')}>
                                <Edit3 size={14} color={colors.mutedForeground} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View>
                        <TouchableOpacity style={styles.locationDisplay} onPress={() => handleOpenSearch('drop')}>
                            <View style={styles.locationDisplayContent}>
                                <Text style={[styles.locationAddress, !dropAddress && { color: colors.mutedForeground }]} numberOfLines={2}>
                                    {dropAddress || 'Where are you going?'}
                                </Text>
                            </View>
                            <ChevronRight size={18} color={colors.mutedForeground} />
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* ─── Map Visualization ─── */}
                <Animated.View style={[styles.mapCard, { opacity: fadeAnim }]}>
                    <AppMap
                        style={{ ...styles.mapCard, height: '100%', marginBottom: 0, borderRadius: 0 }}
                        showUserLocation={true}
                        routeStart={pickupCoords || undefined}
                        routeEnd={dropCoords || undefined}
                        waypoints={stops.map(s => s.coords).filter((c): c is { latitude: number; longitude: number } => c !== null)}
                        birds={birdsForMap}
                        verbiports={[]}
                        onLocationUpdate={(coords) => {
                            // Backup strategy: if main GPS failed/is loading, use map location
                            handleMapLocationUpdate(coords);

                            // If already using GPS mode, keep location synced live
                            if (isPickupFromGPS && !isEditingPickup && hasReceivedGPS.current) {
                                setPickupCoords(coords);
                            }
                        }}
                        onMapPress={async (coords) => {
                            // Reverse geocode to get address
                            let locationName = `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
                            try {
                                const address = await reverseGeocode(coords.latitude, coords.longitude);
                                if (address) locationName = address.shortName;
                            } catch (e) {
                                // keep coordinate string
                            }

                            if (isEditingPickup) {
                                setPickupCoords(coords);
                                setPickupAddress(locationName);
                                setIsEditingPickup(false);
                                setIsPickupFromGPS(false);
                            } else {
                                // Default to setting drop
                                setDropCoords(coords);
                                setDropAddress(locationName);
                                setShowDropSearch(false);
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

            {/* ─── Search Modal ─── */}
            <Modal
                visible={searchModalVisible}
                animationType="slide"
                transparent={false}
                onRequestClose={handleCloseSearch}
                statusBarTranslucent={true}
            >
                <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 50 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f1f1' }}>
                        <TouchableOpacity onPress={handleCloseSearch} style={{ marginRight: 12 }}>
                            <ArrowRight size={24} color={colors.foreground} style={{ transform: [{ rotate: '180deg' }] }} />
                        </TouchableOpacity>
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 8, paddingHorizontal: 12, height: 44 }}>
                            <Search size={18} color={colors.mutedForeground} />
                            <TextInput
                                style={{ flex: 1, marginLeft: 8, fontSize: 16, color: colors.foreground }}
                                placeholder={searchType === 'pickup' ? "Search pickup location" : searchType === 'drop' ? "Search destination" : "Search stop"}
                                value={searchText}
                                onChangeText={handleSearchInput}
                                autoFocus
                                placeholderTextColor={colors.mutedForeground}
                            />
                            {searchText.length > 0 && (
                                <TouchableOpacity onPress={() => handleSearchInput('')}>
                                    <X size={18} color={colors.mutedForeground} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Quick Options */}
                    {!isSearching && searchText.length === 0 && (
                        <View>
                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f1f1' }} onPress={handleSetCurrentLocation}>
                                <LocateFixed size={20} color={colors.primary} />
                                <Text style={{ marginLeft: 12, fontSize: 16, fontWeight: '500', color: colors.primary }}>Use Current Location</Text>
                            </TouchableOpacity>

                            <Text style={{ margin: 16, marginBottom: 8, fontSize: 13, fontWeight: '600', color: colors.mutedForeground, letterSpacing: 0.5 }}>SUGGESTED VERBIPORTS</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                                {verbiports.map((s, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={styles.verbiportChip}
                                        onPress={() => handleSelectResult({
                                            shortName: s.name,
                                            displayName: s.name,
                                            latitude: s.location.lat,
                                            longitude: s.location.lng,
                                            city: 'Verbiport',
                                            state: '',
                                            country: 'India'
                                        })}
                                    >
                                        <Plane size={14} color={colors.primary} />
                                        <Text style={styles.verbiportChipText}>{s.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Suggestions List */}
                    <FlatList
                        data={suggestions}
                        keyExtractor={(item, index) => `${index}`}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ paddingBottom: 24 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' }}
                                onPress={() => handleSelectResult(item)}
                            >
                                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                    <MapPin size={16} color={colors.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 15, fontWeight: '600', color: colors.foreground }}>{item.shortName}</Text>
                                    <Text style={{ fontSize: 13, color: colors.mutedForeground, marginTop: 2 }}>{item.displayName || item.city}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={() => (
                            isSearching ? (
                                <View style={{ padding: 20, alignItems: 'center' }}>
                                    <ActivityIndicator size="small" color={colors.primary} />
                                    <Text style={{ marginTop: 12, color: colors.mutedForeground }}>Searching places...</Text>
                                </View>
                            ) : searchText.length > 2 && suggestions.length === 0 ? (
                                <View style={{ padding: 20, alignItems: 'center' }}>
                                    <Text style={{ color: colors.mutedForeground }}>No results found</Text>
                                </View>
                            ) : null
                        )}
                    />
                </View>
            </Modal>
        </View>
    );
}
