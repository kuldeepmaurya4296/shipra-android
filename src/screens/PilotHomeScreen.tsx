import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { colors } from '../theme/colors';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import client from '../api/client';
import { styles } from './PilotHomeScreen.styles';

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
            const tripData = {
                ...booking,
                // Map backend user fields to tripData fields
                userName: booking.userId?.name || 'Guest User',
                userEmail: booking.userId?.email,
                userPhone: booking.userId?.phone,

                // Map specific detailed fields for pilot view
                whatsappNumber: booking.whatsappNumber || booking.userId?.whatsappNumber || '-',
                callingNumber: booking.callingNumber || booking.userId?.callingNumber || '-',
                aadharNumber: booking.aadharNumber || booking.userId?.aadharNumber || '-',
                panNumber: booking.panNumber || booking.userId?.panNumber || '-',
                currentAddress: booking.currentAddress || booking.userId?.currentAddress || '-',
                permanentAddress: booking.permanentAddress || booking.userId?.permanentAddress || '-',
                otherDetails: booking.otherDetails || booking.userId?.otherDetails || '-'
            };

            if (booking) {
                Alert.alert('Success', 'Ride Verified!');
                setOtp('');

                // @ts-ignore
                navigation.navigate('PilotRideDetails', { tripData });
            }
        } catch (error: any) {
            console.error('Verify API Error:', error);
            if (error.response) {
                Alert.alert('Verification Failed', error.response.data.message || 'Invalid OTP');
            } else {
                Alert.alert('Error', 'Network Error or Invalid OTP');
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
                            placeholder="Enter OTP"
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
