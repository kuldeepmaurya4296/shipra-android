import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Animated } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { Phone, Navigation, Shield, TriangleAlert } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { styles } from './SOSScreen.styles';

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
                                    <Text style={styles.infoValue}>Bird #42</Text>
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
                        <Text style={styles.backButtonText}>Back to Bird</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}
