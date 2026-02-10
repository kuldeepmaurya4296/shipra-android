import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { MapPin } from 'lucide-react-native';
import { colors } from '../theme/colors';

interface DummyMapProps {
    style?: ViewStyle;
    children?: React.ReactNode;
    // Accept other props to swallow them
    [key: string]: any;
}

export default function DummyMap({ style, children, ...props }: DummyMapProps) {
    return (
        <View style={[styles.container, style]}>
            <LinearGradient
                colors={['#e0f2fe', '#f0f9ff']}
                style={StyleSheet.absoluteFill}
            />

            {/* Grid lines to look like a map */}
            <View style={styles.gridContainer}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <View key={`v-${i}`} style={[styles.gridLineVertical, { left: `${(i + 1) * 20}%` }]} />
                ))}
                {Array.from({ length: 5 }).map((_, i) => (
                    <View key={`h-${i}`} style={[styles.gridLineHorizontal, { top: `${(i + 1) * 20}%` }]} />
                ))}
            </View>

            {/* Dummy River/Road */}
            <View style={styles.river} />

            {/* Central Marker */}
            <View style={styles.centerParams}>
                <MapPin size={32} color={colors.primary} fill="rgba(79, 70, 229, 0.2)" />
                <Text style={styles.label}>Map View</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f3f4f6',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    gridContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    gridLineVertical: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    gridLineHorizontal: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    river: {
        position: 'absolute',
        width: '120%',
        height: 40,
        backgroundColor: '#bae6fd',
        transform: [{ rotate: '-15deg' }],
        top: '40%',
    },
    centerParams: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.8)',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        // backdropFilter removed as it is not supported in React Native ViewStyle
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.primary,
        marginTop: 4,
    }
});
