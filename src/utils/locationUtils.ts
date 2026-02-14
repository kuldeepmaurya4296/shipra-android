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
const cache: { [key: string]: GeocodedAddress } = {};

/**
 * Reverse geocode coordinates to a human-readable address.
 */
export const reverseGeocode = async (
    latitude: number,
    longitude: number
): Promise<GeocodedAddress | null> => {
    // Round coordinates to 4 decimal places (~11m precision) to increase cache hits
    const lat = Number(latitude.toFixed(4));
    const lon = Number(longitude.toFixed(4));
    const cacheKey = `${lat},${lon}`;

    if (cache[cacheKey]) {
        console.log('[ReverseGeocode] Returning cached result for:', cacheKey);
        return cache[cacheKey];
    }

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'ShipraFlyApp/1.0 (kuldeepmaurya4296@gmail.com)', // Specific User-Agent required by Nominatim
                    'Accept-Language': 'en',
                },
            }
        );

        if (!response.ok) {
            const errText = await response.text();
            console.error('[ReverseGeocode] HTTP Error:', response.status, errText);
            return null;
        }

        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('[ReverseGeocode] JSON Parse Error. Response:', text);
            return null;
        }

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

            const result = {
                displayName: data.display_name,
                shortName: formattedAddress, // Now holds the exact/precise address
                latitude,
                longitude,
                city: address.city || address.town || address.village,
                state: address.state,
                country: address.country,
            };

            // Store in cache
            const lat = Number(latitude.toFixed(4));
            const lon = Number(longitude.toFixed(4));
            const cacheKey = `${lat},${lon}`;
            cache[cacheKey] = result;

            return result;
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

        if (!response.ok) {
            console.error('[SearchPlaces] HTTP Error:', response.status);
            return [];
        }

        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('[SearchPlaces] JSON Parse Error. Response:', text);
            return [];
        }

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

/**
 * Find nearest verbiport from a given point within a radius (default 50km).
 */
export const findNearestVerbiport = (
    coords: { latitude: number; longitude: number },
    verbiports: any[],
    radiusKm: number = 50
): any | null => {
    let nearest: any = null;
    let minDist = Infinity;

    verbiports.forEach(vp => {
        const dist = getAirDistanceKm(
            coords.latitude,
            coords.longitude,
            vp.location.lat,
            vp.location.lng
        );
        if (dist <= radiusKm && dist < minDist) {
            minDist = dist;
            nearest = vp;
        }
    });

    if (nearest) {
        return { ...(nearest as any), distance: minDist };
    }
    return null;
};

/**
 * Fetch real road route coordinates using OSRM (Open Source Routing Machine).
 * Returns an array of [latitude, longitude] points.
 */
export const getRoadRoute = async (
    start: { latitude: number; longitude: number },
    end: { latitude: number; longitude: number }
): Promise<Array<{ latitude: number; longitude: number }> | null> => {
    try {
        const response = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`,
            {
                headers: {
                    'User-Agent': 'ShipraFlyApp/1.0',
                },
            }
        );

        if (!response.ok) {
            console.error('[RoadRoute] HTTP Error:', response.status);
            return null;
        }

        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
            const coordinates = data.routes[0].geometry.coordinates;
            // OSRM returns [longitude, latitude], we need {latitude, longitude}
            return coordinates.map((coord: [number, number]) => ({
                latitude: coord[1],
                longitude: coord[0],
            }));
        }
        return null;
    } catch (error) {
        console.error('[RoadRoute] Error:', error);
        return null;
    }
};
