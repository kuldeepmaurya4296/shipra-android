import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView, Alert, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, ScrollView, ToastAndroid } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme/colors';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Phone, KeyRound, ArrowLeft } from 'lucide-react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { GOOGLE_CLIENT_ID } from '@env';

type Props = StackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation, route }: Props) {
    const { login, socialLogin, requestOtp, loginWithOtp, pilotLogin } = useAuth();
    const { userType } = route.params || {};

    // Email Login State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // WhatsApp/OTP State
    const [isWhatsAppLogin, setIsWhatsAppLogin] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        try {
            GoogleSignin.configure({
                webClientId: GOOGLE_CLIENT_ID,
                offlineAccess: true
            });
        } catch (e) {
            console.error('Google Signin configure error', e);
        }
    }, []);

    const showToast = (message: string) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            Alert.alert('Notice', message);
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        if (userType === 'pilot') {
            setLoading(true);
            try {
                await pilotLogin(email, password);
            } catch (e: any) {
                const msg = e.response?.data?.message || 'Pilot Login Failed';
                Alert.alert('Error', msg);
            } finally {
                setLoading(false);
            }
            return;
        }

        setLoading(true);
        try {
            await login(email, password);
            showToast('Login Successful!');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };



    const handleSendOtp = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            Alert.alert('Error', 'Please enter a valid phone number');
            return;
        }
        setLoading(true);
        try {
            await requestOtp(phoneNumber);
            setOtpSent(true);
            showToast('OTP sent to your WhatsApp number');
        } catch (error: any) {
            setOtpSent(false); // Ensure we don't proceed if it failed
            const message = error.response?.data?.message || error.message || 'Failed to send OTP. Please try again.';
            console.error('sendOtp error:', error.response?.data || error);
            Alert.alert('Unable to Send OTP', message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length < 6) {
            Alert.alert('Error', 'Please enter a valid 6-digit OTP');
            return;
        }
        setLoading(true);
        try {
            await loginWithOtp(phoneNumber, otp);
            showToast('Login Successful!');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Invalid OTP. Please check and try again.';
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();

            // Check if data exists (handling new response structure)
            if (userInfo.data) {
                const { idToken, user } = userInfo.data;
                await socialLogin(user.email, user.name || 'Google User', 'google');
            } else {
                throw new Error('No user data returned from Google Sign-In');
            }
        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // user cancelled the login flow
            } else if (error.code === statusCodes.IN_PROGRESS) {
                // operation (e.g. sign in) is in progress already
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                Alert.alert('Error', 'Play Services not available');
            } else {
                console.error(error);
                Alert.alert('Error', 'Google Sign-In failed: ' + error.message);
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
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.header}>
                            {isWhatsAppLogin && (
                                <TouchableOpacity onPress={() => setIsWhatsAppLogin(false)} style={{ marginBottom: 16 }}>
                                    <ArrowLeft size={24} color={colors.foreground} />
                                </TouchableOpacity>
                            )}
                            <Text style={styles.title}>
                                {isWhatsAppLogin
                                    ? 'WhatsApp Login'
                                    : userType === 'pilot'
                                        ? 'Pilot Sign In'
                                        : 'Welcome Back'
                                }
                            </Text>
                            <Text style={styles.subtitle}>
                                {isWhatsAppLogin
                                    ? 'Enter your number to receive an OTP'
                                    : userType === 'pilot'
                                        ? 'Enter your pilot credentials'
                                        : 'Sign in to continue your journey'
                                }
                            </Text>
                        </View>

                        <View style={styles.illustrationContainer}>
                            <Image
                                source={require('../assets/logo.png')}
                                style={{ width: 100, height: 100, resizeMode: 'contain' }}
                            />
                        </View>

                        <View style={styles.form}>
                            {!isWhatsAppLogin ? (
                                <>
                                    <View style={styles.inputContainer}>
                                        <Mail size={20} color={colors.mutedForeground} style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Email Address"
                                            value={email}
                                            onChangeText={setEmail}
                                            autoCapitalize="none"
                                            keyboardType="email-address"
                                            placeholderTextColor={colors.mutedForeground}
                                        />
                                    </View>

                                    <View style={styles.inputContainer}>
                                        <Lock size={20} color={colors.mutedForeground} style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Password"
                                            value={password}
                                            onChangeText={setPassword}
                                            secureTextEntry
                                            placeholderTextColor={colors.mutedForeground}
                                        />
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.loginButton, loading && styles.disabledButton]}
                                        onPress={handleLogin}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <Text style={styles.loginButtonText}>Login</Text>
                                        )}
                                    </TouchableOpacity>
                                </>
                            ) : (
                                // WhatsApp Login Form
                                <>
                                    <View style={styles.inputContainer}>
                                        <Phone size={20} color={colors.mutedForeground} style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="WhatsApp Number"
                                            value={phoneNumber}
                                            onChangeText={setPhoneNumber}
                                            keyboardType="phone-pad"
                                            placeholderTextColor={colors.mutedForeground}
                                            editable={!otpSent}
                                        />
                                    </View>

                                    {otpSent && (
                                        <View style={styles.inputContainer}>
                                            <KeyRound size={20} color={colors.mutedForeground} style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Enter 6-digit OTP"
                                                value={otp}
                                                onChangeText={setOtp}
                                                keyboardType="number-pad"
                                                placeholderTextColor={colors.mutedForeground}
                                                maxLength={6}
                                            />
                                        </View>
                                    )}

                                    {!otpSent ? (
                                        <TouchableOpacity
                                            style={[styles.loginButton, loading && styles.disabledButton]}
                                            onPress={handleSendOtp}
                                            disabled={loading}
                                        >
                                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Send OTP</Text>}
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            style={[styles.loginButton, loading && styles.disabledButton]}
                                            onPress={handleVerifyOtp}
                                            disabled={loading}
                                        >
                                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Verify & Login</Text>}
                                        </TouchableOpacity>
                                    )}
                                </>
                            )}
                        </View>

                        {(!isWhatsAppLogin && userType !== 'pilot') && (
                            <>
                                <View style={styles.socialSeparator}>
                                    <View style={styles.separatorLine} />
                                    <Text style={styles.separatorText}>OR CONTINUE WITH</Text>
                                    <View style={styles.separatorLine} />
                                </View>

                                <View style={styles.socialButtons}>
                                    <TouchableOpacity
                                        style={styles.socialButton}
                                        onPress={handleGoogleLogin}
                                        disabled={loading}
                                    >
                                        <Text style={styles.buttonEmoji}>🔤</Text>
                                        <Text style={styles.socialButtonText}>Google</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.socialButton}
                                        onPress={() => setIsWhatsAppLogin(true)}
                                        disabled={loading}
                                    >
                                        <Text style={styles.buttonEmoji}>💬</Text>
                                        <Text style={styles.socialButtonText}>WhatsApp</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}

                        {userType !== 'pilot' && (
                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Don't have an account? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                    <Text style={styles.linkText}>Register</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
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
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },
    header: {
        marginTop: 40,
        marginBottom: 32,
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
    illustrationContainer: {
        height: 120,
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        borderWidth: 1,
        borderColor: 'rgba(79, 70, 229, 0.2)',
    },
    illustrationEmoji: {
        fontSize: 48,
    },
    form: {
        gap: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: colors.foreground,
    },
    loginButton: {
        backgroundColor: colors.primary,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    disabledButton: {
        opacity: 0.7,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    socialSeparator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 32,
        gap: 12,
    },
    separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
    },
    separatorText: {
        fontSize: 10,
        color: colors.mutedForeground,
        fontWeight: '600',
        letterSpacing: 1,
    },
    socialButtons: {
        flexDirection: 'row',
        gap: 16,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        height: 48,
        gap: 8,
    },
    buttonEmoji: {
        fontSize: 16,
    },
    socialButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.foreground,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 40,
    },
    footerText: {
        color: colors.mutedForeground,
        fontSize: 14,
    },
    linkText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: 'bold',
    },
});
