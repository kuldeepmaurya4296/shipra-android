import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import client from '../api/client';
import { Plane, Calendar, User, Navigation } from 'lucide-react-native';
import { styles } from './PilotHistoryScreen.styles';

interface Booking {
    _id: string;
    birdNumber: string;
    from: string;
    to: string;
    date: string;
    status: string;
    amount: number;
    userId: {
        name: string;
        phone: string;
        whatsappNumber?: string;
    };
    birdId?: { name: string, model: string };
}

export default function PilotHistoryScreen({ navigation }: any) {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'schedule' | 'history'>('schedule');

    const fetchBookings = async () => {
        try {
            const response = await client.get('/bookings/pilot-history');
            setBookings(response.data);
        } catch (error) {
            console.error('Failed to fetch bookings', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchBookings();

        // Listen for focus events
        const unsubscribe = navigation.addListener('focus', () => {
            fetchBookings();
        });

        return unsubscribe;
    }, [navigation]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookings();
    };

    const filteredBookings = bookings.filter(b => {
        if (activeTab === 'schedule') {
            return b.status === 'confirmed' || b.status === 'ongoing';
        } else {
            return b.status === 'completed' || b.status === 'cancelled';
        }
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ongoing': return colors.primary;
            case 'confirmed': return colors.success;
            case 'completed': return colors.accent;
            case 'cancelled': return '#ef4444';
            default: return colors.mutedForeground;
        }
    };

    const renderBookingItem = (item: Booking) => (
        <TouchableOpacity
            key={item._id}
            style={styles.bookingCard}
            onPress={() => {
                if (item.status === 'ongoing') {
                    const tripData = {
                        ...item,
                        userName: item.userId?.name,
                        userPhone: item.userId?.phone,
                        userEmail: (item.userId as any)?.email,
                        whatsappNumber: item.userId?.whatsappNumber,
                        callingNumber: (item.userId as any)?.callingNumber || (item as any).callingNumber,
                        aadharNumber: (item.userId as any)?.aadharNumber || (item as any).aadharNumber,
                        panNumber: (item.userId as any)?.panNumber || (item as any).panNumber,
                        currentAddress: (item.userId as any)?.currentAddress || (item as any).currentAddress,
                        permanentAddress: (item.userId as any)?.permanentAddress || (item as any).permanentAddress,
                        otherDetails: (item.userId as any)?.otherDetails || (item as any).otherDetails,
                    };
                    navigation.navigate('PilotRideDetails', { tripData });
                } else if (item.status === 'confirmed') {
                    // Navigate to home to enter OTP? Or just show details
                    // Ideally, we could navigate to Home with pre-filled details but Home is tab based.
                    navigation.navigate('Home');
                } else if (item.status === 'completed') {
                    navigation.navigate('RideReceipt', { booking: item });
                }
            }}
        >
            <View style={styles.cardHeader}>
                <View style={styles.birdInfo}>
                    <User size={16} color={colors.primary} />
                    <Text style={styles.customerName}>{item.userId?.name || 'Guest'}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.routeRow}>
                    <Text style={styles.locationLabel}>{item.from}</Text>
                    <Navigation size={16} color={colors.mutedForeground} />
                    <Text style={styles.locationLabel}>{item.to}</Text>
                </View>

                {item.status === 'confirmed' && (
                    <Text style={styles.actionHint}>Tap to switch to Home Scanner</Text>
                )}
                {item.status === 'ongoing' && (
                    <Text style={[styles.actionHint, { color: colors.primary }]}>Ride In Progress - Tap for Controls</Text>
                )}

                <View style={styles.divider} />

                <View style={styles.footerRow}>
                    <View style={styles.infoCol}>
                        <Calendar size={14} color={colors.mutedForeground} style={{ marginBottom: 4 }} />
                        <Text style={styles.infoText}>{new Date(item.date).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.infoCol}>
                        <Plane size={14} color={colors.mutedForeground} style={{ marginBottom: 4 }} />
                        <Text style={styles.infoText}>
                            {item.birdId ? item.birdId.name : item.birdNumber}
                        </Text>
                    </View>
                    <View style={styles.infoCol}>
                        <Text style={styles.price}>₹{item.amount}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Flights</Text>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'schedule' && styles.activeTab]}
                    onPress={() => setActiveTab('schedule')}
                >
                    <Text style={[styles.tabText, activeTab === 'schedule' && styles.activeTabText]}>Schedule</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'history' && styles.activeTab]}
                    onPress={() => setActiveTab('history')}
                >
                    <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>History</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.content}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {filteredBookings.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyEmoji}>👨‍✈️</Text>
                            <Text style={styles.emptyText}>No {activeTab} flights</Text>
                            <Text style={styles.emptySubtext}>
                                {activeTab === 'schedule'
                                    ? 'Assigned flights will appear here'
                                    : 'Completed flight history will appear here'}
                            </Text>
                        </View>
                    ) : (
                        filteredBookings.map(renderBookingItem)
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
