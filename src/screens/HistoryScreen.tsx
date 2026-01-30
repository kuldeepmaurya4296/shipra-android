import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { colors } from '../theme/colors';
import NavigationBar from '../components/NavigationBar';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import client from '../api/client';
import { Plane, Calendar, MapPin } from 'lucide-react-native';

type Props = StackScreenProps<RootStackParamList, 'History'>;

interface Booking {
    _id: string;
    birdNumber: string;
    from: string;
    to: string;
    date: string;
    status: string;
    amount: number;
}

export default function HistoryScreen({ navigation }: Props) {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

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

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Your Trips</Text>
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
                    {bookings.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyEmoji}>🎫</Text>
                            <Text style={styles.emptyText}>No bookings found</Text>
                            <Text style={styles.emptySubtext}>Your future trips will appear here</Text>
                        </View>
                    ) : (
                        bookings.map((item) => (
                            <View key={item._id} style={styles.bookingCard}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.birdInfo}>
                                        <Plane size={16} color={colors.primary} />
                                        <Text style={styles.birdNumber}>{item.birdNumber}</Text>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: item.status === 'confirmed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)' }]}>
                                        <Text style={[styles.statusText, { color: item.status === 'confirmed' ? colors.success : colors.accent }]}>
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
                                        <Text style={styles.price}>₹{item.amount}</Text>
                                    </View>
                                </View>
                            </View>
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
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.foreground,
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
