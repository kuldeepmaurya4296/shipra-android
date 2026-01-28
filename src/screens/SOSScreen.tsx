import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Animated } from 'react-native';
import { colors } from '../theme/colors';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { AlertCircle, Phone, Navigation, Shield, TriangleAlert } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';

type Props = StackScreenProps<RootStackParamList, 'SOS'>;

export default function SOSScreen({ navigation, route }: Props) {
    const [pulseAnim] = useState(new Animated.Value(1));

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true })
            ])
        ).start();
    }, []);

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#7f1d1d', '#991b1b', '#b91c1c']}
                style={styles.background}
            >
                <View style={styles.content}>
                    <Animated.View style={{ transform: [{ scale: pulseAnim }], marginBottom: 24 }}>
                        <TriangleAlert size={80} color="#fff" />
                    </Animated.View>

                    <Text style={styles.title}>EMERGENCY SOS</Text>
                    <Text style={styles.subtitle}>
                        Stay calm. Help is being dispatched to your location immediately.
                    </Text>

                    <TouchableOpacity style={styles.sosButton} activeOpacity={0.8}>
                        <View style={styles.sosInnerCircle}>
                            <Text style={styles.sosText}>SOS</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.infoContainer}>
                        <Text style={styles.sectionHeader}>EMERGENCY INFORMATION</Text>

                        <View style={styles.infoCard}>
                            <View style={styles.infoRow}>
                                <Phone size={20} color="#fff" />
                                <View>
                                    <Text style={styles.infoLabel}>Emergency Contact</Text>
                                    <Text style={styles.infoValue}>+91-9876-5432-10</Text>
                                </View>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.infoRow}>
                                <Navigation size={20} color="#fff" />
                                <View>
                                    <Text style={styles.infoLabel}>Your Location</Text>
                                    <Text style={styles.infoValue}>28.7041° N, 77.1025° E</Text>
                                </View>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.infoRow}>
                                <Shield size={20} color="#fff" />
                                <View>
                                    <Text style={styles.infoLabel}>Bird ID</Text>
                                    <Text style={styles.infoValue}>Flight #42</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.instructionContainer}>
                        <Text style={styles.instructionTitle}>INSTRUCTIONS:</Text>
                        <View style={styles.instructionItem}>
                            <Text style={styles.checkIcon}>✓</Text>
                            <Text style={styles.instructionText}>Stay in your seat and remain calm</Text>
                        </View>
                        <View style={styles.instructionItem}>
                            <Text style={styles.checkIcon}>✓</Text>
                            <Text style={styles.instructionText}>Keep phone accessible</Text>
                        </View>
                        <View style={styles.instructionItem}>
                            <Text style={styles.checkIcon}>✓</Text>
                            <Text style={styles.instructionText}>Help is en route to your coordinates</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Text style={styles.backButtonText}>Back to Flight</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        padding: 24,
        paddingTop: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 2,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
    },
    sosButton: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    sosInnerCircle: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    sosText: {
        fontSize: 32,
        fontWeight: '900',
        color: '#b91c1c',
    },
    infoContainer: {
        width: '100%',
        marginBottom: 32,
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 12,
        letterSpacing: 1,
    },
    infoCard: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    infoLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
    },
    infoValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 12,
    },
    instructionContainer: {
        width: '100%',
        marginBottom: 'auto',
    },
    instructionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 12,
    },
    instructionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 12,
    },
    checkIcon: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
    instructionText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
    },
    backButton: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 30,
        marginBottom: 20,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
