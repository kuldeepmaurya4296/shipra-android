import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme/colors';

interface LoginScreenProps {
    onNext: () => void;
}

export default function LoginScreen({ onNext }: LoginScreenProps) {
    return (
        <LinearGradient
            colors={[colors.background, colors.background, '#f3f4f6']} // Approx background to secondary/5
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome to Shipra</Text>
                    <Text style={styles.subtitle}>Book your flight in seconds</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.illustrationContainer}>
                        <Text style={styles.illustrationEmoji}>✈️</Text>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.googleButton} onPress={onNext}>
                            <Text style={styles.buttonEmoji}>🔤</Text>
                            <Text style={styles.googleButtonText}>Continue with Google</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.whatsappButton} onPress={onNext}>
                            <Text style={styles.buttonEmoji}>💬</Text>
                            <Text style={styles.whatsappButtonText}>WhatsApp OTP Login</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.termsText}>
                        By continuing, you agree to our{' '}
                        <Text style={styles.linkText}>Terms</Text> and{' '}
                        <Text style={styles.linkText}>Privacy</Text>
                    </Text>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Premium air travel experience</Text>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        padding: 24,
        justifyContent: 'space-between',
    },
    header: {
        marginTop: 32,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: colors.foreground,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.mutedForeground,
    },
    content: {
        gap: 24,
    },
    illustrationContainer: {
        height: 160,
        backgroundColor: 'rgba(79, 70, 229, 0.1)', // primary/10
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(79, 70, 229, 0.2)',
    },
    illustrationEmoji: {
        fontSize: 60,
    },
    buttonContainer: {
        gap: 16,
    },
    googleButton: {
        width: '100%',
        paddingVertical: 16,
        paddingHorizontal: 24,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: 'rgba(79, 70, 229, 0.2)',
        borderRadius: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.foreground,
    },
    whatsappButton: {
        width: '100%',
        paddingVertical: 16,
        paddingHorizontal: 24,
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderWidth: 2,
        borderColor: colors.primary,
        borderRadius: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    whatsappButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
    },
    buttonEmoji: {
        fontSize: 20,
    },
    termsText: {
        textAlign: 'center',
        fontSize: 12,
        color: colors.mutedForeground,
        marginTop: 16,
    },
    linkText: {
        color: colors.primary,
        fontWeight: '600',
    },
    footer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    footerText: {
        color: colors.mutedForeground,
        fontSize: 14,
    },
});
