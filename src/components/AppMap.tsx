import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { View, ActivityIndicator, ViewStyle, StyleProp, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import Geolocation from 'react-native-geolocation-service';
import { colors } from '../theme/colors';
import { styles } from './AppMap.styles';

interface Coords {
    latitude: number;
    longitude: number;
}

interface VerbiportMarker extends Coords {
    name?: string;
    [key: string]: any;
}

interface BirdMarker {
    _id?: string;
    name?: string;
    model?: string;
    currentLocation?: Coords;
    status?: string;
    [key: string]: any;
}

interface AppMapProps {
    style?: StyleProp<ViewStyle>;
    showUserLocation?: boolean;
    routeStart?: Coords;
    routeEnd?: Coords;
    pickupVerbiport?: Coords & { name?: string };
    dropVerbiport?: Coords & { name?: string };
    airDistance?: number;
    pickupPath?: Coords[];
    dropPath?: Coords[];
    waypoints?: Coords[];
    birds?: BirdMarker[];
    verbiports?: VerbiportMarker[];
    onLocationUpdate?: (coords: Coords) => void;
    onMapPress?: (coords: Coords) => void;
    onFullScreenPress?: () => void;
    lockInteraction?: boolean;
}

const BHOPAL_COORDS = { latitude: 23.2599, longitude: 77.4126 };

export default function AppMap({
    style,
    showUserLocation = false,
    routeStart,
    routeEnd,
    pickupVerbiport,
    dropVerbiport,
    airDistance,
    pickupPath = [],
    dropPath = [],
    waypoints = [],
    birds = [],
    verbiports = [],
    onLocationUpdate,
    onMapPress,
    onFullScreenPress,
    lockInteraction = false,
}: AppMapProps) {
    const webViewRef = useRef<WebView>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<Coords | null>(null);

    // Get user location
    useEffect(() => {
        if (!showUserLocation) return;

        const watchId = Geolocation.watchPosition(
            (position) => {
                const coords = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
                setUserLocation(coords);
                onLocationUpdate?.(coords);
            },
            (error) => {
                console.log('[AppMap] Location error:', error.message);
            },
            {
                enableHighAccuracy: true,
                distanceFilter: 10,
                interval: 5000,
                fastestInterval: 2000,
            }
        );

        return () => Geolocation.clearWatch(watchId);
    }, [showUserLocation]);

    // Send data updates to the WebView map
    useEffect(() => {
        if (!webViewRef.current) return;

        const mapData = {
            type: 'UPDATE_MAP',
            userLocation,
            routeStart: routeStart || null,
            routeEnd: routeEnd || null,
            pickupVerbiport: pickupVerbiport || null,
            dropVerbiport: dropVerbiport || null,
            airDistance: airDistance || 0,
            pickupPath,
            dropPath,
            waypoints,
            lockInteraction,
            birds: birds.map(b => ({
                id: b._id,
                name: b.name || b.model || 'Bird',
                lat: b.currentLocation?.latitude,
                lng: b.currentLocation?.longitude,
                status: b.status || 'active',
            })).filter(b => b.lat && b.lng),
            verbiports: verbiports.map(v => ({
                name: v.name || 'Verbiport',
                lat: v.latitude,
                lng: v.longitude,
            })).filter(v => v.lat && v.lng),
        };

        webViewRef.current.postMessage(JSON.stringify(mapData));
    }, [userLocation, routeStart, routeEnd, pickupVerbiport, dropVerbiport,
        airDistance, pickupPath, dropPath, waypoints, birds, verbiports, lockInteraction]);

    const handleMessage = useCallback((event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'MAP_PRESS' && onMapPress) {
                onMapPress({ latitude: data.lat, longitude: data.lng });
            } else if (data.type === 'MAP_READY') {
                setIsLoading(false);
            } else if (data.type === 'FULL_SCREEN_PRESS' && onFullScreenPress) {
                onFullScreenPress();
            }
        } catch (e) {
            // ignore parse errors
        }
    }, [onMapPress, onFullScreenPress]);

    // Fallback for loading state
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    const initialCenter = useRef(routeStart || userLocation || BHOPAL_COORDS).current;

    const htmlContent = useMemo(() => generateMapHTML(initialCenter), []);

    return (
        <View style={[styles.container, style]}>
            <WebView
                ref={webViewRef}
                source={{ html: htmlContent }}
                style={{ flex: 1, backgroundColor: '#f3f4f6' }}
                onMessage={handleMessage}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                scrollEnabled={false}
                nestedScrollEnabled={true}
                originWhitelist={['*']}
                onLoadEnd={() => {
                    // Send initial data after load
                    setTimeout(() => {
                        const mapData = {
                            type: 'UPDATE_MAP',
                            userLocation: userLocation || null,
                            routeStart: routeStart || null,
                            routeEnd: routeEnd || null,
                            pickupVerbiport: pickupVerbiport || null,
                            dropVerbiport: dropVerbiport || null,
                            airDistance: airDistance || 0,
                            pickupPath: pickupPath || [],
                            dropPath: dropPath || [],
                            waypoints: waypoints || [],
                            lockInteraction,
                            birds: (birds || []).map(b => ({
                                id: b._id,
                                name: b.name || b.model || 'Bird',
                                lat: b.currentLocation?.latitude,
                                lng: b.currentLocation?.longitude,
                                status: b.status || 'active',
                            })).filter(b => b.lat && b.lng),
                            verbiports: (verbiports || []).map(v => ({
                                name: v.name || 'Verbiport',
                                lat: v.latitude,
                                lng: v.longitude,
                            })).filter(v => v.lat && v.lng),
                        };
                        webViewRef.current?.postMessage(JSON.stringify(mapData));
                    }, 500);
                }}
            />
            {!isLoading && onFullScreenPress && (
                <View style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
                    <TouchableOpacity
                        style={{
                            backgroundColor: 'white',
                            padding: 8,
                            borderRadius: 8,
                            elevation: 4,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                        }}
                        onPress={onFullScreenPress}
                    >
                        <View style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ width: 18, height: 18, borderWidth: 2, borderColor: colors.primary, borderRadius: 2 }} />
                            <View style={{ position: 'absolute', width: 6, height: 6, backgroundColor: 'white', top: -2, right: -2 }} />
                            <View style={{ position: 'absolute', width: 6, height: 6, backgroundColor: 'white', bottom: -2, left: -2 }} />
                        </View>
                    </TouchableOpacity>
                </View>
            )}
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            )}
        </View>
    );
}

function generateMapHTML(center: Coords): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #map { width: 100%; height: 100%; }
        .user-marker {
            width: 16px; height: 16px;
            background: #4f46e5;
            border: 3px solid #fff;
            border-radius: 50%;
            box-shadow: 0 0 8px rgba(79,70,229,0.5);
        }
        .user-pulse {
            width: 40px; height: 40px;
            background: rgba(79,70,229,0.15);
            border-radius: 50%;
            position: absolute;
            top: -12px; left: -12px;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { transform: scale(0.5); opacity: 1; }
            100% { transform: scale(1.5); opacity: 0; }
        }
        .pickup-marker {
            width: 14px; height: 14px;
            background: #10b981;
            border: 3px solid #fff;
            border-radius: 50%;
            box-shadow: 0 0 6px rgba(16,185,129,0.5);
        }
        .drop-marker {
            width: 14px; height: 14px;
            background: #ef4444;
            border: 3px solid #fff;
            border-radius: 50%;
            box-shadow: 0 0 6px rgba(239,68,68,0.5);
        }
        .verbiport-icon {
            width: 28px; height: 28px;
            background: #6366f1;
            border: 2px solid #fff;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 12px;
            font-weight: bold;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        .bird-icon {
            width: 24px; height: 24px;
            background: #f59e0b;
            border: 2px solid #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .waypoint-marker {
            width: 12px; height: 12px;
            background: #8b5cf6;
            border: 2px solid #fff;
            border-radius: 50%;
            box-shadow: 0 0 4px rgba(139,92,246,0.5);
        }
        .vp-route-marker {
            width: 20px; height: 20px;
            background: #6366f1;
            border: 3px solid #fff;
            border-radius: 4px;
            box-shadow: 0 0 6px rgba(99,102,241,0.5);
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        var map = L.map('map', {
            center: [${center.latitude}, ${center.longitude}],
            zoom: 12,
            zoomControl: true,
            attributionControl: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
        }).addTo(map);

        // Layer groups for easy clearing
        var userLayer = L.layerGroup().addTo(map);
        var markersLayer = L.layerGroup().addTo(map);
        var routeLayer = L.layerGroup().addTo(map);
        var birdsLayer = L.layerGroup().addTo(map);
        var verbiportsLayer = L.layerGroup().addTo(map);

        // Map click handler
        map.on('click', function(e) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'MAP_PRESS',
                lat: e.latlng.lat,
                lng: e.latlng.lng
            }));
        });

        // Notify ready
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_READY' }));

        // Helper: create icon
        function createDivIcon(className, size) {
            return L.divIcon({
                className: '',
                html: '<div class="' + className + '"></div>',
                iconSize: [size, size],
                iconAnchor: [size/2, size/2]
            });
        }

        function createUserIcon() {
            return L.divIcon({
                className: '',
                html: '<div style="position:relative"><div class="user-pulse"></div><div class="user-marker"></div></div>',
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            });
        }

        function createVerbiportIcon(name) {
            return L.divIcon({
                className: '',
                html: '<div class="verbiport-icon">V</div>',
                iconSize: [28, 28],
                iconAnchor: [14, 14]
            });
        }

        function createBirdIcon() {
            return L.divIcon({
                className: '',
                html: '<div class="bird-icon">✈</div>',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });
        }

        var firstUpdate = true;
        var initialRadiusSet = false;

        // Listen for data from React Native
        document.addEventListener('message', handleMessage);
        window.addEventListener('message', handleMessage);

        function handleMessage(event) {
            try {
                var data = JSON.parse(event.data);
                if (data.type !== 'UPDATE_MAP') return;

                // Clear layers
                userLayer.clearLayers();
                markersLayer.clearLayers();
                routeLayer.clearLayers();
                birdsLayer.clearLayers();
                verbiportsLayer.clearLayers();

                var bounds = [];

                // User location
                if (data.userLocation) {
                    var ul = [data.userLocation.latitude, data.userLocation.longitude];
                    L.marker(ul, { icon: createUserIcon() })
                        .bindPopup('Your Location')
                        .addTo(userLayer);
                    bounds.push(ul);
                }

                // Route start (pickup)
                if (data.routeStart) {
                    var rs = [data.routeStart.latitude, data.routeStart.longitude];
                    L.marker(rs, { icon: createDivIcon('pickup-marker', 14) })
                        .bindPopup('Pickup')
                        .addTo(markersLayer);
                    bounds.push(rs);
                }

                // Route end (drop)
                if (data.routeEnd) {
                    var re = [data.routeEnd.latitude, data.routeEnd.longitude];
                    L.marker(re, { icon: createDivIcon('drop-marker', 14) })
                        .bindPopup('Drop-off')
                        .addTo(markersLayer);
                    bounds.push(re);
                }

                // Pickup Verbiport
                if (data.pickupVerbiport) {
                    var pv = [data.pickupVerbiport.latitude, data.pickupVerbiport.longitude];
                    L.marker(pv, { icon: createDivIcon('vp-route-marker', 20) })
                        .bindPopup('Pickup Verbiport' + (data.pickupVerbiport.name ? ': ' + data.pickupVerbiport.name : ''))
                        .addTo(markersLayer);
                    bounds.push(pv);
                }

                // Drop Verbiport
                if (data.dropVerbiport) {
                    var dv = [data.dropVerbiport.latitude, data.dropVerbiport.longitude];
                    L.marker(dv, { icon: createDivIcon('vp-route-marker', 20) })
                        .bindPopup('Drop Verbiport' + (data.dropVerbiport.name ? ': ' + data.dropVerbiport.name : ''))
                        .addTo(markersLayer);
                    bounds.push(dv);
                }

                // Waypoints
                if (data.waypoints && data.waypoints.length > 0) {
                    data.waypoints.forEach(function(wp, i) {
                        if (wp) {
                            var wl = [wp.latitude, wp.longitude];
                            L.marker(wl, { icon: createDivIcon('waypoint-marker', 12) })
                                .bindPopup('Stop ' + (i + 1))
                                .addTo(markersLayer);
                            bounds.push(wl);
                        }
                    });
                }

                // Road path: Pickup to Pickup Verbiport
                if (data.pickupPath && data.pickupPath.length > 1) {
                    var ppCoords = data.pickupPath.map(function(p) { return [p.latitude, p.longitude]; });
                    L.polyline(ppCoords, { color: '#10b981', weight: 4, opacity: 0.8, dashArray: '8,6' }).addTo(routeLayer);
                }

                // Air route
                if (data.pickupVerbiport && data.dropVerbiport) {
                    var airPath = [[data.pickupVerbiport.latitude, data.pickupVerbiport.longitude]];
                    if (data.waypoints && data.waypoints.length > 0) {
                        data.waypoints.forEach(function(wp) {
                            if (wp) airPath.push([wp.latitude, wp.longitude]);
                        });
                    }
                    airPath.push([data.dropVerbiport.latitude, data.dropVerbiport.longitude]);
                    L.polyline(airPath, { color: '#4f46e5', weight: 3, opacity: 0.9 }).addTo(routeLayer);
                } else if (data.routeStart && data.routeEnd) {
                    L.polyline([
                        [data.routeStart.latitude, data.routeStart.longitude],
                        [data.routeEnd.latitude, data.routeEnd.longitude]
                    ], { color: '#4f46e5', weight: 3, opacity: 0.7, dashArray: '10,8' }).addTo(routeLayer);
                }

                // Road path: Drop Verbiport to Drop
                if (data.dropPath && data.dropPath.length > 1) {
                    var dpCoords = data.dropPath.map(function(p) { return [p.latitude, p.longitude]; });
                    L.polyline(dpCoords, { color: '#ef4444', weight: 4, opacity: 0.8, dashArray: '8,6' }).addTo(routeLayer);
                }

                // Birds
                if (data.birds && data.birds.length > 0) {
                    data.birds.forEach(function(bird) {
                        if (bird.lat && bird.lng) {
                            var bl = [bird.lat, bird.lng];
                            L.marker(bl, { icon: createBirdIcon() })
                                .bindPopup(bird.name + (bird.status ? ' (' + bird.status + ')' : ''))
                                .addTo(birdsLayer);
                        }
                    });
                }

                // Verbiports
                if (data.verbiports && data.verbiports.length > 0) {
                    data.verbiports.forEach(function(vp) {
                        if (vp.lat && vp.lng) {
                            L.marker([vp.lat, vp.lng], { icon: createVerbiportIcon(vp.name) })
                                .bindPopup(vp.name || 'Verbiport')
                                .addTo(verbiportsLayer);
                        }
                    });
                }

                if (bounds.length > 1 && firstUpdate) {
                    map.fitBounds(bounds, { padding: [40, 40] });
                    firstUpdate = false;
                } else if (bounds.length === 1 && !initialRadiusSet) {
                    // Show 60km radius initially around user location
                    var circle = L.circle(bounds[0], { radius: 60000 });
                    map.fitBounds(circle.getBounds());
                    initialRadiusSet = true;
                    firstUpdate = false;
                }

            } catch (e) {
                // ignore
            }
        }
    </script>
</body>
</html>
`;
}
