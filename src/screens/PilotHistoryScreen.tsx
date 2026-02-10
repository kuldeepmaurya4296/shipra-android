import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import client from '../api/client';
import { Plane, Calendar, MapPin, User, Phone, Navigation, Clock } from 'lucide-react-native';

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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        padding: 24,
        paddingTop: 48,
        paddingBottom: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 16,
        gap: 16,
        backgroundColor: '#fff',
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    activeTab: {
        backgroundColor: colors.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.mutedForeground,
    },
    activeTabText: {
        color: '#fff',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flexGrow: 1,
        padding: 16,
        paddingBottom: 100,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 60,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        color: colors.foreground,
        fontSize: 18,
        fontWeight: 'bold',
    },
    emptySubtext: {
        color: colors.mutedForeground,
        fontSize: 14,
        marginTop: 8,
    },
    bookingCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    birdInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    customerName: {
        fontWeight: 'bold',
        fontSize: 16,
        color: colors.foreground,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    cardBody: {
        gap: 12,
    },
    routeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },
    locationLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.foreground,
    },
    actionHint: {
        fontSize: 12,
        color: colors.mutedForeground,
        textAlign: 'center',
        fontStyle: 'italic',
        marginTop: 4
    },
    divider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginVertical: 4,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoCol: {
        alignItems: 'center',
    },
    infoText: {
        fontSize: 12,
        color: colors.mutedForeground,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
        marginTop: 4,
    },
});
