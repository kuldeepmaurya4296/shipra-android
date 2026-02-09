import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import NavigationBar from '../components/NavigationBar';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import client from '../api/client';
import { Plane, Calendar, MapPin, Clock } from 'lucide-react-native';

type Props = StackScreenProps<RootStackParamList, 'History'>;

interface Booking {
    _id: string;
    birdNumber: string;
    from: string;
    to: string;
    date: string;
    status: string;
    amount: number;
    otp?: string;
    birdId?: { name: string, model: string };
}

export default function HistoryScreen({ navigation }: Props) {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

    const fetchBookings = async () => {
        try {
            const response = await client.get('/bookings');
            setBookings(response.data);
        } catch (error) {
            console.error('Failed to fetch bookings', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookings();
    };

    const filteredBookings = bookings.filter(b => {
        if (activeTab === 'upcoming') {
            return b.status === 'confirmed' || b.status === 'ongoing';
        } else {
            return b.status === 'completed' || b.status === 'cancelled';
        }
    });

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Your Trips</Text>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
                    onPress={() => setActiveTab('upcoming')}
                >
                    <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>Upcoming</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'past' && styles.activeTab]}
                    onPress={() => setActiveTab('past')}
                >
                    <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>Past</Text>
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
                            <Text style={styles.emptyEmoji}>{activeTab === 'upcoming' ? '🛫' : 'history'}</Text>
                            <Text style={styles.emptyText}>No {activeTab} bookings</Text>
                            <Text style={styles.emptySubtext}>
                                {activeTab === 'upcoming'
                                    ? 'Your future trips will appear here'
                                    : 'Your completed trips will appear here'}
                            </Text>
                        </View>
                    ) : (
                        filteredBookings.map((item) => (
                            <TouchableOpacity
                                key={item._id}
                                style={styles.bookingCard}
                                onPress={() => {
                                    if (item.status === 'confirmed') {
                                        navigation.navigate('RideStatus', { bookingId: item._id, otp: item.otp });
                                    } else if (item.status === 'ongoing') {
                                        navigation.navigate('RideInProgress', { bookingId: item._id });
                                    } else if (item.status === 'completed') {
                                        navigation.navigate('RideReceipt', { booking: item });
                                    }
                                }}
                                disabled={item.status === 'cancelled'}
                            >
                                <View style={styles.cardHeader}>
                                    <View style={styles.birdInfo}>
                                        <Plane size={16} color={colors.primary} />
                                        <Text style={styles.birdNumber}>
                                            {item.birdId ? `${item.birdId.name}` : item.birdNumber}
                                        </Text>
                                    </View>
                                    <View style={[styles.statusBadge, {
                                        backgroundColor: item.status === 'confirmed' ? 'rgba(16, 185, 129, 0.1)' :
                                            item.status === 'ongoing' ? 'rgba(79, 70, 229, 0.1)' :
                                                'rgba(245, 158, 11, 0.1)'
                                    }]}>
                                        <Text style={[styles.statusText, {
                                            color: item.status === 'confirmed' ? colors.success :
                                                item.status === 'ongoing' ? colors.primary :
                                                    colors.accent
                                        }]}>
                                            {item.status.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.cardBody}>
                                    <View style={styles.routeRow}>
                                        <View style={styles.stop}>
                                            <MapPin size={12} color={colors.mutedForeground} />
                                            <Text style={styles.locationLabel}>{item.from || 'Downtown Airport'}</Text>
                                        </View>
                                        <View style={styles.line} />
                                        <View style={styles.stop}>
                                            <MapPin size={12} color={colors.mutedForeground} />
                                            <Text style={styles.locationLabel}>{item.to}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.footerRow}>
                                        <View style={styles.dateInfo}>
                                            <Calendar size={14} color={colors.mutedForeground} />
                                            <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString()}</Text>
                                        </View>
                                        {item.status === 'ongoing' && (
                                            <View style={styles.dateInfo}>
                                                <Clock size={14} color={colors.primary} />
                                                <Text style={[styles.dateText, { color: colors.primary, fontWeight: 'bold' }]}>In Progress</Text>
                                            </View>
                                        )}
                                        <Text style={styles.price}>₹{item.amount}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            )}

            <NavigationBar
                currentScreen="history"
                onNavigate={(screen) => {
                    if (screen === 'home') navigation.navigate('Home');
                    if (screen === 'history') navigation.navigate('History');
                    if (screen === 'profile') navigation.navigate('Profile');
                }}
            />
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
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginBottom: 16,
        gap: 16,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: colors.border,
    },
    activeTab: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
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
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    birdInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    birdNumber: {
        fontWeight: 'bold',
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
        gap: 16,
    },
    routeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    stop: {
        alignItems: 'center',
        flex: 1,
    },
    locationLabel: {
        fontSize: 12,
        color: colors.foreground,
        marginTop: 4,
        textAlign: 'center',
    },
    line: {
        height: 1,
        flex: 0.5,
        backgroundColor: colors.border,
        marginHorizontal: 8,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateText: {
        fontSize: 12,
        color: colors.mutedForeground,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
    },
});
