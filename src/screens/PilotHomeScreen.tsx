import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { colors } from '../theme/colors';
import LinearGradient from 'react-native-linear-gradient';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import client from '../api/client';

export default function PilotHomeScreen() {
    const navigation = useNavigation();
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerifyRide = async () => {
        if (otp.length < 4) {
            Alert.alert('Error', 'Please enter a valid OTP');
            return;
        }

        setLoading(true);
        try {
            // Call Backend API to verify
            const response = await client.post('/bookings/verify-otp', { otp });
            const booking = response.data;

            if (booking) {
                Alert.alert('Success', 'Ride Verified!');
                setOtp('');

                // Map backend data to screen params
                const tripData = {
                    ...booking,
                    userName: booking.userId?.name || 'Guest User',
                    userEmail: booking.userId?.email,
                    userPhone: booking.userId?.phone,
                };

                // @ts-ignore
                navigation.navigate('PilotRideDetails', { tripData });
            }
        } catch (error: any) {
            console.error('Verify API Error:', error);
            if (error.response) {
                Alert.alert('Verification Failed', error.response.data.message || 'Invalid OTP');
            } else {
                Alert.alert('Error', 'Network Error. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={[colors.background, colors.background, '#f3f4f6']}
            style={styles.container}
        >
            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.content}
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Pilot Dashboard</Text>
                        <Text style={styles.subtitle}>Enter Customer OTP to Start Ride</Text>
                    </View>

                    <View style={styles.card}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter 4-digit OTP"
                            keyboardType="number-pad"
                            maxLength={4}
                            value={otp}
                            onChangeText={setOtp}
                            placeholderTextColor={colors.mutedForeground}
                            textAlign="center"
                        />

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleVerifyRide}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Verify & Start Ride</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.foreground,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.mutedForeground,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    input: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.foreground,
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
        marginBottom: 32,
        paddingBottom: 8,
        letterSpacing: 8,
    },
    button: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
