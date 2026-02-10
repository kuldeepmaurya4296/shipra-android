export const BHOPAL_COORDS = { latitude: 23.2599, longitude: 77.4126 };

export const KNOWN_LOCATIONS: Record<string, { latitude: number; longitude: number }> = {
    'Bhopal': BHOPAL_COORDS,
    'Indore': { latitude: 22.7196, longitude: 75.8577 },
    'Jabalpur': { latitude: 23.1815, longitude: 79.9864 },
    'Gwalior': { latitude: 26.2183, longitude: 78.1828 },
    'Ujjain': { latitude: 23.1765, longitude: 75.7885 },
    'Vidisha': { latitude: 23.5251, longitude: 77.8081 },
    'Sehore': { latitude: 23.2032, longitude: 77.0844 },
    'Raisen': { latitude: 23.3347, longitude: 77.7918 },
};

export const getCoordinatesForStation = (station: any) => {
    if (station.latitude && station.longitude) {
        return { latitude: station.latitude, longitude: station.longitude };
    }
    if (station.location && station.location.lat && station.location.lng) {
        return { latitude: station.location.lat, longitude: station.location.lng };
    }
    // Fallback based on name/city
    const key = station.name || station.city;
    if (KNOWN_LOCATIONS[key]) {
        return KNOWN_LOCATIONS[key];
    }
    // Default fallback slightly offset from Bhopal to show on map
    return {
        latitude: BHOPAL_COORDS.latitude + (Math.random() - 0.5) * 0.1,
        longitude: BHOPAL_COORDS.longitude + (Math.random() - 0.5) * 0.1
    };
};

export const getBirdLocation = (bird: any) => {
    if (bird.location && bird.location.lat && bird.location.lng) {
        return { latitude: bird.location.lat, longitude: bird.location.lng };
    }
    if (bird.currentLocation && bird.currentLocation.latitude) {
        return bird.currentLocation;
    }
    // Default fallback slightly offset from Bhopal
    return {
        latitude: BHOPAL_COORDS.latitude + (Math.random() - 0.5) * 0.05,
        longitude: BHOPAL_COORDS.longitude + (Math.random() - 0.5) * 0.05
    };
};

export const getDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
};
