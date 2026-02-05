import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { User, MapPin, Phone, Mail, Calendar, CheckCircle } from 'lucide-react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

// We need to extend type locally since PilotRideDetails is inside PilotNavigator but uses root params structurally
type Props = {
    route?: { params: { tripData: any } };
    navigation?: any;
};

export default function PilotRideDetailsScreen({ route, navigation }: Props) {
    const tripData = route?.params?.tripData || {};

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Customer Verified</Text>
                <Text style={styles.subtitle}>Ready for Takeoff</Text>
                <CheckCircle size={48} color={colors.success} style={{ marginTop: 16 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Passenger Details */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>PASSENGER DETAILS</Text>

                    <View style={styles.row}>
                        <View style={styles.iconBox}>
                            <User size={20} color={colors.primary} />
                        </View>
                        <View>
                            <Text style={styles.label}>Name</Text>
                            <Text style={styles.value}>{tripData.userName || 'Shipra User'}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <View style={styles.iconBox}>
                            <Phone size={20} color={colors.primary} />
                        </View>
                        <View>
                            <Text style={styles.label}>Phone</Text>
                            <Text style={styles.value}>{tripData.userPhone || '+91 91919 19191'}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <View style={styles.iconBox}>
                            <Mail size={20} color={colors.primary} />
                        </View>
                        <View>
                            <Text style={styles.label}>Email</Text>
                            <Text style={styles.value}>{tripData.userEmail || 'user@shipra.com'}</Text>
                        </View>
                    </View>
                </View>

                {/* Trip Details */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>TRIP SUMMARY</Text>

                    <View style={styles.row}>
                        <View style={[styles.iconBox, { backgroundColor: '#e0e7ff' }]}>
                            <MapPin size={20} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Route</Text>
                            <Text style={styles.value}>{tripData.from} ➔ {tripData.to}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <View style={[styles.iconBox, { backgroundColor: '#e0e7ff' }]}>
                            <Calendar size={20} color={colors.primary} />
                        </View>
                        <View>
                            <Text style={styles.label}>Date</Text>
                            <Text style={styles.value}>{new Date(tripData.date).toLocaleDateString()}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <View style={[styles.iconBox, { backgroundColor: '#ecfccb' }]}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.success }}>₹</Text>
                        </View>
                        <View>
                            <Text style={styles.label}>Fare Paid</Text>
                            <Text style={styles.value}>₹ {tripData.amount}</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => Alert.alert('System', 'Flight Sequence Initiated!')}
                >
                    <Text style={styles.buttonText}>Initiate Flight Sequence</Text>
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
        padding: 32,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    subtitle: {
        fontSize: 16,
        color: colors.mutedForeground,
        marginTop: 4,
    },
    content: {
        padding: 24,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: colors.border,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.mutedForeground,
        marginBottom: 20,
        letterSpacing: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    label: {
        fontSize: 12,
        color: colors.mutedForeground,
        marginBottom: 2,
    },
    value: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.foreground,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 16,
        marginLeft: 56, // indent past icon
    },
    button: {
        backgroundColor: colors.primary,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
