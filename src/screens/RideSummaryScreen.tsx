import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { colors } from '../theme/colors';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { Check, Download, ArrowRight } from 'lucide-react-native';

type Props = StackScreenProps<RootStackParamList, 'RideSummary'>;

export default function RideSummaryScreen({ navigation }: Props) {
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true
        }).start();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.successContainer}>
                    <Animated.View style={[styles.checkCircle, { transform: [{ scale: scaleAnim }] }]}>
                        <Check size={48} color="#fff" />
                    </Animated.View>
                    <Text style={styles.title}>Flight Completed!</Text>
                    <Text style={styles.subtitle}>Thank you for flying with Shipra</Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.routeRow}>
                        <Text style={styles.location}>Downtown Airport</Text>
                        <ArrowRight size={16} color={colors.mutedForeground} />
                        <Text style={styles.location}>City Center Terminal</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>TRIP DETAILS</Text>
                <View style={styles.detailsCard}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Distance Traveled</Text>
                        <Text style={styles.detailValue}>12.5 km</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Flight Duration</Text>
                        <Text style={styles.detailValue}>15 mins</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Average Speed</Text>
                        <Text style={styles.detailValue}>92 km/h</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>COST BREAKDOWN</Text>
                <View style={styles.costCard}>
                    <View style={styles.costRow}>
                        <Text style={styles.costLabel}>Base Fare</Text>
                        <Text style={styles.costValue}>₹2,850</Text>
                    </View>
                    <View style={styles.costRow}>
                        <Text style={styles.costLabel}>Service Fee</Text>
                        <Text style={styles.costValue}>₹150</Text>
                    </View>
                    <View style={[styles.divider, { marginVertical: 12 }]} />
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Paid</Text>
                        <Text style={styles.totalValue}>₹3,000</Text>
                    </View>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity style={styles.outlineButton}>
                        <Download size={20} color={colors.primary} />
                        <Text style={styles.outlineButtonText}>Download Receipt</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => navigation.navigate('Home')}
                    >
                        <Text style={styles.primaryButtonText}>Book Another Flight</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: 24,
        paddingTop: 40,
    },
    successContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    checkCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.success,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: colors.success,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.foreground,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.mutedForeground,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
    },
    routeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    location: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.mutedForeground,
        marginBottom: 12,
        letterSpacing: 1,
    },
    detailsCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: colors.border,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 14,
        color: colors.mutedForeground,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.foreground,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 16,
    },
    costCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: colors.border,
    },
    costRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    costLabel: {
        fontSize: 14,
        color: colors.mutedForeground,
    },
    costValue: {
        fontSize: 14,
        color: colors.foreground,
        fontWeight: '500',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    actions: {
        gap: 16,
    },
    outlineButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.primary,
        gap: 8,
    },
    outlineButtonText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    primaryButton: {
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 20,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
