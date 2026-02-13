import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import LinearGradient from 'react-native-linear-gradient';
import { styles } from './PilotOtpScreen.styles';

type Props = StackScreenProps<RootStackParamList, 'PilotOtp'>;

export default function PilotOtpScreen({ route, navigation }: Props) {
    const { email } = route.params;
    const { pilotLogin } = useAuth();
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        if (otp.length < 6) {
            Alert.alert('Error', 'Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            await pilotLogin(email);
        } catch (error) {
            Alert.alert('Error', 'Verification failed');
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
                    style={{ flex: 1, padding: 24, justifyContent: 'center' }}
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Verification</Text>
                        <Text style={styles.subtitle}>Enter the OTP sent to your registered number</Text>
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="Enter 6-digit OTP"
                        keyboardType="number-pad"
                        maxLength={6}
                        value={otp}
                        onChangeText={setOtp}
                        placeholderTextColor={colors.mutedForeground}
                    />

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleVerify}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Verify & Login</Text>
                        )}
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
}
