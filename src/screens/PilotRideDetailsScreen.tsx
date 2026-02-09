import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { User, MapPin, Mail, Calendar, CheckCircle, MessageCircle, PhoneCall, FileText, Home, Info } from 'lucide-react-native';

type Props = {
    route?: { params: { tripData: any } };
    navigation?: any;
};

export default function PilotRideDetailsScreen({ route, navigation }: Props) {
    const tripData = route?.params?.tripData || {};

    // Helper to check if value is meaningful
    const hasValue = (val: string) => val && val !== '-' && val.trim() !== '';

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

    // Helper to render divider only if previous item was rendered
    const renderDividerIf = (condition: boolean) => condition ? <View style={styles.divider} /> : null;

    // Check which sections have data
    const hasContactData = hasValue(tripData.userName) || hasValue(tripData.userEmail) || hasValue(tripData.whatsappNumber) || hasValue(tripData.callingNumber);
    const hasIdentityData = hasValue(tripData.aadharNumber) || hasValue(tripData.panNumber) || hasValue(tripData.currentAddress) || hasValue(tripData.permanentAddress);
    const hasOtherData = hasValue(tripData.otherDetails);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Customer Verified</Text>
                <Text style={styles.subtitle}>Ready for Takeoff</Text>
                <CheckCircle size={48} color={colors.success} style={{ marginTop: 16 }} />
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
