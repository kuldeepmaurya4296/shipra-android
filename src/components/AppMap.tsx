import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, PermissionsAndroid, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import Geolocation from 'react-native-geolocation-service';

interface Coordinates {
    latitude: number;
    longitude: number;
}

interface Station {
    _id: string;
    name: string;
    city: string;
    latitude?: number;
    longitude?: number;
}

interface Bird {
    _id: string;
    name?: string;
    currentLocation?: Coordinates;
    status: 'active' | 'maintenance' | 'charging';
}

interface AppMapProps {
    stations?: Station[];
    birds?: Bird[];
    showUserLocation?: boolean;
    routeStart?: Coordinates;
    routeEnd?: Coordinates;
    style?: any;
    interactive?: boolean;
}

const LEAFLET_HTML = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
    <style>
        body { padding: 0; margin: 0; }
        #map { width: 100%; height: 100vh; }
        .custom-icon {
            text-align: center;
            color: white;
            font-weight: bold;
            font-size: 10px;
            line-height: 24px;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        // Initialize map
        var map = L.map('map', { zoomControl: false }).setView([23.2599, 77.4126], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        var markers = {
            stations: [],
            birds: [],
            user: null,
            routeStart: null,
            routeEnd: null
        };
        var routePolyline = null;

        // Icons
        var stationIcon = L.divIcon({
            className: 'custom-icon',
            html: '<div style="background-color: #4f46e5; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });

        var birdIcon = L.divIcon({
            className: 'custom-icon',
            html: '<div style="background-color: #10b981; width: 18px; height: 18px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.4);"></div>',
            iconSize: [18, 18],
            iconAnchor: [9, 9]
        });

        var userIcon = L.divIcon({
            className: 'custom-icon',
            html: '<div style="background-color: #3b82f6; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2), 0 2px 4px rgba(0,0,0,0.2);"></div>',
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });

        var startIcon = L.divIcon({
            className: 'custom-icon',
            html: '<div style="background-color: #4f46e5; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px;">A</div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        var endIcon = L.divIcon({
            className: 'custom-icon',
            html: '<div style="background-color: #f59e0b; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 3px 6px rgba(16, 185, 129, 0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px;">B</div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        // Handle updates from RN
        window.updateMap = function(data) {
            try {
                var payload = JSON.parse(data);
                
                // Clear existing markers
                markers.stations.forEach(m => map.removeLayer(m));
                markers.birds.forEach(m => map.removeLayer(m));
                markers.stations = [];
                markers.birds = [];
                
                if (markers.user) map.removeLayer(markers.user);
                if (markers.routeStart) map.removeLayer(markers.routeStart);
                if (markers.routeEnd) map.removeLayer(markers.routeEnd);
                if (routePolyline) map.removeLayer(routePolyline);

                // Add User Location
                if (payload.userLocation) {
                    markers.user = L.marker([payload.userLocation.latitude, payload.userLocation.longitude], {icon: userIcon, zIndexOffset: 1000}).addTo(map);
                }

                // Add Stations
                if (payload.stations) {
                    payload.stations.forEach(st => {
                        if (st.latitude && st.longitude) {
                            var m = L.marker([st.latitude, st.longitude], {icon: stationIcon})
                                .bindPopup("<b>" + st.name + "</b><br>" + st.city)
                                .addTo(map);
                            markers.stations.push(m);
                        }
                    });
                }

                // Add Birds
                if (payload.birds) {
                    payload.birds.forEach(bird => {
                        if (bird.currentLocation) {
                            var m = L.marker([bird.currentLocation.latitude, bird.currentLocation.longitude], {icon: birdIcon})
                                .bindPopup("<b>" + (bird.name || 'Bird') + "</b><br>Status: " + bird.status)
                                .addTo(map);
                            markers.birds.push(m);
                        }
                    });
                }

                // Route
                var latlngs = [];
                if (payload.routeStart) {
                    var start = [payload.routeStart.latitude, payload.routeStart.longitude];
                    markers.routeStart = L.marker(start, {icon: startIcon, zIndexOffset: 2000}).addTo(map);
                    latlngs.push(start);
                }
                if (payload.routeEnd) {
                    var end = [payload.routeEnd.latitude, payload.routeEnd.longitude];
                    markers.routeEnd = L.marker(end, {icon: endIcon, zIndexOffset: 2000}).addTo(map);
                    latlngs.push(end);
                }

                if (latlngs.length === 2) {
                    // Create more "aviation" style line (curved or dashed)
                    // For now, nice thick indigo line with a glow effect
                    routePolyline = L.polyline(latlngs, {
                        color: '#4f46e5',
                        weight: 6,
                        opacity: 0.8,
                        dashArray: '10, 10',
                        lineCap: 'round'
                    }).addTo(map);
                    
                    map.fitBounds(routePolyline.getBounds(), {padding: [50, 50]});
                } else if (payload.userLocation) {
                     map.setView([payload.userLocation.latitude, payload.userLocation.longitude], 12);
                }

            } catch (e) {
                // console.error(e);
            }
        };

        // Listen for messages (if on Android/iOS specific webview bridge is used differently, handle it)
        document.addEventListener("message", function(event) {
            window.updateMap(event.data);
        });
        window.addEventListener("message", function(event) {
            window.updateMap(event.data);
        });

        // Signal ready
        if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage("READY");
        }
    </script>
</body>
</html>
`;

export default function AppMap({ stations = [], birds = [], showUserLocation = true, routeStart, routeEnd, style }: AppMapProps) {
    const webViewRef = useRef<WebView>(null);
    const [userLoc, setUserLoc] = useState<Coordinates | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);

    useEffect(() => {
        const requestLocationPermission = async () => {
            if (Platform.OS === 'android') {
                try {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                        {
                            title: "Location Permission",
                            message: "Shipra App needs access to your location to show available birds nearby.",
                            buttonNeutral: "Ask Me Later",
                            buttonNegative: "Cancel",
                            buttonPositive: "OK"
                        }
                    );
                    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                        startWatching();
                    } else {
                        console.log("Location permission denied");
                    }
                } catch (err) {
                    console.warn(err);
                }
            } else {
                // iOS handles permission via Geolocation request
                Geolocation.requestAuthorization('whenInUse').then((res) => {
                    if (res === 'granted') startWatching();
                });
            }
        };

        let watchId: number | null = null;

        const startWatching = () => {
            watchId = Geolocation.watchPosition(
                (position) => {
                    setUserLoc({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    console.log(error.code, error.message);
                },
                { enableHighAccuracy: true, distanceFilter: 10, interval: 5000, fastestInterval: 2000 }
            );
        };

        if (showUserLocation) {
            requestLocationPermission();
        }

        return () => {
            if (watchId !== null) {
                Geolocation.clearWatch(watchId);
            }
        };
    }, [showUserLocation]);

    useEffect(() => {
        if (isMapReady && webViewRef.current) {
            const payload = {
                stations,
                birds,
                userLocation: userLoc,
                routeStart,
                routeEnd
            };
            webViewRef.current.postMessage(JSON.stringify(payload));
        }
    }, [stations, birds, userLoc, routeStart, routeEnd, isMapReady]);

    return (
        <View style={[styles.container, style]}>
            <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html: LEAFLET_HTML }}
                onMessage={(event) => {
                    if (event.nativeEvent.data === "READY") {
                        setIsMapReady(true);
                    }
                }}
                style={{ flex: 1 }}
                scrollEnabled={false}
                nestedScrollEnabled={true}
            />
            {(!isMapReady) && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="small" color="#4f46e5" />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        backgroundColor: '#f3f4f6',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
    }
});
