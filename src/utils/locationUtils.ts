/**
 * Location utilities for geocoding using Nominatim (free OpenStreetMap API).
 * No API keys required.
 */

export interface GeocodedAddress {
    displayName: string;
    shortName: string;
    latitude: number;
    longitude: number;
    city?: string;
    state?: string;
    country?: string;
}

/**
 * Reverse geocode coordinates to a human-readable address.
 */
export const reverseGeocode = async (
    latitude: number,
    longitude: number
): Promise<GeocodedAddress | null> => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'ShipraFlyApp/1.0',
                    'Accept-Language': 'en',
                },
            }
        );
        const data = await response.json();

        if (data && data.display_name) {
            const address = data.address || {};

            // Build a more precise address including house number, building, and street
            const parts = [
                address.house_number,
                address.building,
                address.road || address.pedestrian || address.street,
                address.suburb || address.neighbourhood || address.residential,
                address.city || address.town || address.village,
                address.state,
                address.postcode
            ].filter(Boolean);

            // Create a formatted string, fallback to display_name if parts are too few
            const formattedAddress = parts.length > 2
                ? parts.join(', ')
                : data.display_name;

            return {
                displayName: data.display_name,
                shortName: formattedAddress, // Now holds the exact/precise address
                latitude,
                longitude,
                city: address.city || address.town || address.village,
                state: address.state,
                country: address.country,
            };
        }
        return null;
    } catch (error) {
        console.error('[ReverseGeocode] Error:', error);
        return null;
    }
};

/**
 * Search for places by query string (forward geocoding).
 */
export const searchPlaces = async (
    query: string,
    limit: number = 5
): Promise<GeocodedAddress[]> => {
    try {
        if (!query || query.length < 3) return [];

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=${limit}&addressdetails=1&countrycodes=in`,
            {
                headers: {
                    'User-Agent': 'ShipraFlyApp/1.0',
                    'Accept-Language': 'en',
                },
            }
        );
        const data = await response.json();

        if (Array.isArray(data)) {
            return data.map((item: any) => {
                const address = item.address || {};

                const parts = [
                    address.house_number,
                    address.building,
                    address.road || address.pedestrian || address.street,
                    address.suburb || address.neighbourhood || address.residential,
                    address.city || address.town || address.village,
                    address.state,
                    address.postcode
                ].filter(Boolean);

                const formattedAddress = parts.length > 2
                    ? parts.join(', ')
                    : item.display_name;

                return {
                    displayName: item.display_name,
                    shortName: formattedAddress, // Exact address
                    latitude: parseFloat(item.lat),
                    longitude: parseFloat(item.lon),
                    city: address.city || address.town || address.village,
                    state: address.state,
                    country: address.country,
                };
            });
        }
        return [];
    } catch (error) {
        console.error('[SearchPlaces] Error:', error);
        return [];
    }
};

/**
 * Calculate straight-line (air displacement) distance between two coordinates.
 * Uses the Haversine formula - returns distance in kilometers.
 */
export const getAirDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
};

/**
 * Estimate travel time based on air distance.
 * Average bird speed: ~100 km/h + 4 min buffer (takeoff & landing)
 */
export const calculateTravelTime = (distanceKm: number): number => {
    const avgSpeedKmHr = 100;
    const bufferMinutes = 4; // takeoff + landing
    const travelMinutes = (distanceKm / avgSpeedKmHr) * 60;
    return Math.ceil(travelMinutes + bufferMinutes);
};

/**
 * Estimate fare based on travel time.
 * Rate: ₹2000 per 15 minutes of traveling time.
 */
export const calculateFare = (distanceKm: number): number => {
    const timeInMinutes = calculateTravelTime(distanceKm);

    // ₹2000 per 15 mins
    const fare = (timeInMinutes / 15) * 2000;

    return Math.ceil(fare / 10) * 10; // Round up to nearest 10
};

/**
 * Optimize route using Nearest Neighbor algorithm.
 * Returns the sorted order of intermediate stops to minimize total air distance.
 * Start -> Nearest Stop -> Next Nearest -> ... -> End
 */
export const optimizeRoute = (
    start: { latitude: number; longitude: number },
    stops: Array<{ latitude: number; longitude: number; id: string }>,
    end: { latitude: number; longitude: number }
): { sortedIndices: number[]; totalDistance: number } => {
    if (!stops || stops.length === 0) {
        const dist = getAirDistanceKm(start.latitude, start.longitude, end.latitude, end.longitude);
        return { sortedIndices: [], totalDistance: dist };
    }

    // Simple nearest neighbor or permutation (since N is small, permutation is best for < 5 stops)
    // But let's stick to Nearest Neighbor greedy for simplicity and speed
    const remaining = stops.map((s, i) => ({ ...s, originalIndex: i }));
    const sortedIndices: number[] = [];
    let current = start;
    let totalDistance = 0;

    while (remaining.length > 0) {
        let nearestIdx = -1;
        let minInfo = Infinity;

        for (let i = 0; i < remaining.length; i++) {
            const d = getAirDistanceKm(current.latitude, current.longitude, remaining[i].latitude, remaining[i].longitude);
            if (d < minInfo) {
                minInfo = d;
                nearestIdx = i;
            }
        }

        const nextStop = remaining[nearestIdx];
        totalDistance += minInfo;
        sortedIndices.push(nextStop.originalIndex);
        current = nextStop;
        remaining.splice(nearestIdx, 1);
    }

    // Add final leg to destination
    totalDistance += getAirDistanceKm(current.latitude, current.longitude, end.latitude, end.longitude);

    return { sortedIndices, totalDistance };
};
