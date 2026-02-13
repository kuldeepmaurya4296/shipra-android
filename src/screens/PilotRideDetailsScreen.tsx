import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { User, MapPin, Mail, Calendar, CheckCircle, MessageCircle, PhoneCall, FileText, Home, Info, PlaneLanding } from 'lucide-react-native';
import client from '../api/client';
import { CommonActions } from '@react-navigation/native';
import { styles } from './PilotRideDetailsScreen.styles';

type Props = {
    route?: { params: { tripData: any } };
    navigation?: any;
};

export default function PilotRideDetailsScreen({ route, navigation }: Props) {
    const tripData = route?.params?.tripData || {};
    const [loading, setLoading] = useState(false);

    // Helper to check if value is meaningful
    const hasValue = (val: string) => val && val !== '-' && val.trim() !== '';

    const handleCompleteRide = async () => {
        Alert.alert(
            "Complete Flight",
            "Are you sure you want to mark this flight as completed?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Confirm Completion",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await client.post('/bookings/update-status', {
                                bookingId: tripData._id,
                                status: 'completed'
                            });
                            Alert.alert("Success", "Flight marked as completed.");
                            // Navigate to History tab
                            navigation.dispatch(
                                CommonActions.reset({
                                    index: 0,
                                    routes: [
                                        { name: 'PilotTabs', params: { screen: 'History' } },
                                    ],
                                })
                            );
                        } catch (error: any) {
                            Alert.alert("Error", error.response?.data?.message || "Failed to complete ride");
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const renderRow = (icon: any, label: string, value: string, color = colors.primary, bgColor = 'rgba(79, 70, 229, 0.1)') => {
        // Skip rendering if no value
        if (!hasValue(value)) return null;

        return (
            <View style={styles.row}>
                <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
                    {icon}
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.label}>{label}</Text>
                    <Text style={styles.value}>{value}</Text>
                </View>
            </View>
        );
    };

    // Check which sections have data
    const hasContactData = hasValue(tripData.userName) || hasValue(tripData.userEmail) || hasValue(tripData.whatsappNumber) || hasValue(tripData.callingNumber);
    const hasIdentityData = hasValue(tripData.aadharNumber) || hasValue(tripData.panNumber) || hasValue(tripData.currentAddress) || hasValue(tripData.permanentAddress);
    const hasOtherData = hasValue(tripData.otherDetails);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Close</Text>
                </TouchableOpacity>
                <View style={{ alignItems: 'center' }}>
                    <Text style={styles.title}>Customer Verified</Text>
                    <Text style={styles.subtitle}>Ride In Progress</Text>
                    <CheckCircle size={48} color={colors.success} style={{ marginTop: 16 }} />
                </View>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Contact Details - Only show if has data */}
                {hasContactData && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>PASSENGER CONTACT</Text>
                        {renderRow(<User size={20} color={colors.primary} />, 'Name', tripData.userName)}
                        {hasValue(tripData.userName) && hasValue(tripData.userEmail) && <View style={styles.divider} />}
                        {renderRow(<Mail size={20} color={colors.primary} />, 'Email', tripData.userEmail)}
                        {(hasValue(tripData.userName) || hasValue(tripData.userEmail)) && hasValue(tripData.whatsappNumber) && <View style={styles.divider} />}
                        {renderRow(<MessageCircle size={20} color="#25D366" />, 'WhatsApp', tripData.whatsappNumber, '#25D366', 'rgba(37, 211, 102, 0.1)')}
                        {(hasValue(tripData.userName) || hasValue(tripData.userEmail) || hasValue(tripData.whatsappNumber)) && hasValue(tripData.callingNumber) && <View style={styles.divider} />}
                        {renderRow(<PhoneCall size={20} color={colors.primary} />, 'Calling Number', tripData.callingNumber)}
                    </View>
                )}

                {/* Identity & Address - Only show if has data */}
                {hasIdentityData && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>IDENTITY & ADDRESS</Text>
                        {renderRow(<FileText size={20} color={colors.accent} />, 'Aadhar Number', tripData.aadharNumber, colors.accent, 'rgba(245, 158, 11, 0.1)')}
                        {hasValue(tripData.aadharNumber) && hasValue(tripData.panNumber) && <View style={styles.divider} />}
                        {renderRow(<FileText size={20} color={colors.accent} />, 'PAN Number', tripData.panNumber, colors.accent, 'rgba(245, 158, 11, 0.1)')}
                        {(hasValue(tripData.aadharNumber) || hasValue(tripData.panNumber)) && hasValue(tripData.currentAddress) && <View style={styles.divider} />}
                        {renderRow(<Home size={20} color={colors.primary} />, 'Current Address', tripData.currentAddress)}
                        {(hasValue(tripData.aadharNumber) || hasValue(tripData.panNumber) || hasValue(tripData.currentAddress)) && hasValue(tripData.permanentAddress) && <View style={styles.divider} />}
                        {renderRow(<Home size={20} color={colors.mutedForeground} />, 'Permanent Address', tripData.permanentAddress, colors.mutedForeground)}
                    </View>
                )}

                {/* Other Info - Only show if has data */}
                {hasOtherData && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>ADDITIONAL INFO</Text>
                        {renderRow(<Info size={20} color={colors.primary} />, 'Notes', tripData.otherDetails)}
                    </View>
                )}

                {/* Trip Details */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>TRIP SUMMARY</Text>

                    {renderRow(<MapPin size={20} color={colors.primary} />, 'Route', `${tripData.from} ➔ ${tripData.to}`, colors.primary, '#e0e7ff')}
                    <View style={styles.divider} />
                    {renderRow(<Calendar size={20} color={colors.primary} />, 'Date', new Date(tripData.date).toLocaleDateString(), colors.primary, '#e0e7ff')}
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
                    style={[styles.button, loading && styles.disabledButton]}
                    onPress={handleCompleteRide}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <PlaneLanding size={24} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.buttonText}>Complete Flight</Text>
                        </>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}
