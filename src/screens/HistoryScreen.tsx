import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import NavigationBar from '../components/NavigationBar';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import client from '../api/client';
import { Plane, Calendar, MapPin, Clock } from 'lucide-react-native';
import { styles } from './HistoryScreen.styles';

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
