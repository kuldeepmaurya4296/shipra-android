import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { ArrowLeft, Clock, MapPin, Calendar, CreditCard, Plane } from 'lucide-react-native';
import client from '../api/client';

type Props = StackScreenProps<RootStackParamList, 'Booking'>;

export default function BookingScreen({ route, navigation }: Props) {
    const { from, to } = route.params;
    const [loading, setLoading] = useState(false);

    const handleConfirmBooking = async () => {
        setLoading(true);
        try {
            const bookingData = {
                flightNumber: "SH-" + Math.floor(1000 + Math.random() * 9000),
                from: from,
                to: to,
                date: new Date().toISOString(),
                amount: 1500,
                status: 'confirmed'
            };

            await client.post('/bookings', bookingData);

            Alert.alert(
                'Success',
                'Your flight has been booked successfully!',
                [{ text: 'View History', onPress: () => navigation.navigate('History') }]
            );
        } catch (error: any) {
            console.error('Booking failed', error);
            Alert.alert('Error', 'Failed to confirm booking. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={styles.title}>Confirm Flight</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Route Visualization Card */}
                <View style={styles.routeCard}>
                    <View style={styles.flightLine}>
                        <View style={styles.point} />
                        <View style={styles.dashedLine} />
                        <Plane size={20} color={colors.primary} style={{ transform: [{ rotate: '90deg' }] }} />
                        <View style={styles.dashedLine} />
                        <View style={[styles.point, { backgroundColor: colors.accent }]} />
                    </View>
                    <View style={styles.routeNames}>
                        <View style={styles.cityInfo}>
                            <Text style={styles.cityCode}>{from.substring(0, 3).toUpperCase()}</Text>
                            <Text style={styles.cityName}>{from}</Text>
                        </View>
                        <View style={[styles.cityInfo, { alignItems: 'flex-end' }]}>
                            <Text style={styles.cityCode}>{to.substring(0, 3).toUpperCase()}</Text>
                            <Text style={styles.cityName}>{to}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Journey Details</Text>
                    <View style={styles.row}>
                        <MapPin size={20} color={colors.primary} />
                        <View>
                            <Text style={styles.label}>Departure</Text>
                            <Text style={styles.value}>{from}</Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <MapPin size={20} color={colors.accent} />
                        <View>
                            <Text style={styles.label}>Destination</Text>
                            <Text style={styles.value}>{to}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Schedule & Fare</Text>
                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <Calendar size={18} color={colors.mutedForeground} />
                            <Text style={styles.infoText}>{new Date().toLocaleDateString()}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Clock size={18} color={colors.mutedForeground} />
                            <Text style={styles.infoText}>14:30 PM</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Bird Fare</Text>
                        <Text style={styles.priceValue}>₹1,500</Text>
                    </View>
                </View>

                <View style={styles.paymentCard}>
                    <CreditCard size={20} color={colors.primary} />
                    <View>
                        <Text style={styles.paymentTitle}>Payment Provider</Text>
                        <Text style={styles.paymentText}>Razorpay Secured Gateway</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.confirmButton, loading && styles.disabledButton]}
                    onPress={handleConfirmBooking}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.confirmButtonText}>Pay & Reserve My Bird</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        paddingTop: 60,
        gap: 16,
    },
    backButton: {
        padding: 8,
        borderRadius: 50,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: colors.border,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    content: {
        padding: 24,
        paddingBottom: 40,
    },
    routeCard: {
        backgroundColor: colors.primary,
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
    },
    flightLine: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    point: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#fff',
    },
    dashedLine: {
        flex: 1,
        height: 1,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
        borderStyle: 'dashed',
        marginHorizontal: 10,
    },
    routeNames: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cityInfo: {
        gap: 4,
    },
    cityCode: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    cityName: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 20,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.mutedForeground,
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        color: colors.mutedForeground,
    },
    value: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.foreground,
    },
    infoGrid: {
        flexDirection: 'row',
        gap: 16,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 12,
        flex: 1,
    },
    infoText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.foreground,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 16,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: 16,
        color: colors.foreground,
    },
    priceValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    paymentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 32,
    },
    paymentTitle: {
        fontSize: 12,
        color: colors.mutedForeground,
    },
    paymentText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primary,
    },
    confirmButton: {
        backgroundColor: colors.primary,
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
        elevation: 4,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    disabledButton: {
        opacity: 0.7,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
