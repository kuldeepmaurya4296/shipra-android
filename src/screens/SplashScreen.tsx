import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

type Props = StackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 8000,
                    useNativeDriver: true,
                })
            ),
        ]).start();
    }, []);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.container}
        >
            <View style={styles.content}>
                <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Image
                        source={require('../assets/logo.png')}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                </Animated.View>

                <Animated.Text style={[styles.title, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    Shipra
                </Animated.Text>

                <Animated.Text style={[styles.subtitle, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    Future of Air Mobility
                </Animated.Text>

                <Animated.View style={[styles.gifContainer, { opacity: fadeAnim }]}>
                    <Image
                        source={require('../assets/360.gif')}
                        style={styles.gifStyle}
                        resizeMode="contain"
                    />
                </Animated.View>

                <View style={styles.dots}>
                    {[0, 1, 2].map((i) => (
                        <View key={i} style={styles.dot} />
                    ))}
                </View>

                <Animated.View style={{ width: '100%', opacity: fadeAnim, alignItems: 'center' }}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate('Login', {})}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.buttonText}>Get Started</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.pilotButton}
                        onPress={() => navigation.navigate('Login', { userType: 'pilot' })}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.pilotButtonText}>Login as Pilot</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        width: '100%',
    },
    logoContainer: {
        marginBottom: 24,
        alignItems: 'center',
    },
    logoImage: {
        width: 120,
        height: 120,
    },
    gifContainer: {
        marginBottom: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gifStyle: {
        width: 280,
        height: 160,
    },
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 20,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginBottom: 64,
        fontWeight: '300',
        letterSpacing: 1,
    },
    dots: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 96,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.accent,
    },
    button: {
        width: '100%',
        paddingVertical: 16,
        paddingHorizontal: 24,
        backgroundColor: colors.accent,
        borderRadius: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    buttonText: {
        color: colors.accentForeground,
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    pilotButton: {
        marginTop: 20,
        padding: 10,
    },
    pilotButtonText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
});
