import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { ArrowLeft, ShieldAlert, CheckCircle2, XCircle, Info } from 'lucide-react-native';
import client from '../api/client';

type Props = StackScreenProps<RootStackParamList, 'CancellationPolicy'>;

interface PolicyRule {
    type: 'check' | 'cross' | 'info';
    text: string;
}

interface PolicyData {
    title: string;
    description: string;
    rules: PolicyRule[];
}

export default function CancellationPolicyScreen({ navigation, route }: Props) {
    const { bookingId } = route.params;
    const [policy, setPolicy] = useState<PolicyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const res = await client.get('/policies');
                setPolicy(res.data);
            } catch (e) {
                console.error('[Policy] Fetch error:', e);
                // Fallback policy if API fails
                setPolicy({
                    title: 'Cancellation & Refund Policy',
                    description: 'Shipra Air Mobility provides a structured refund system.',
                    rules: [
                        { type: 'check', text: 'Full refund for cancellations made within 1 minute of booking.' },
                        { type: 'cross', text: 'No refund after takeoff.' }
                    ]
                });
            } finally {
                setLoading(false);
            }
        };
        fetchPolicy();
    }, []);

    const handleConfirmCancel = async () => {
        Alert.alert(
            "Confirm Cancellation",
            "Are you sure you want to cancel this booking? This action cannot be undone.",
            [
                { text: "No, Keep Booking", style: "cancel" },
                {
                    text: "Yes, Cancel",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setIsCancelling(true);
                            await client.patch(`/bookings/${bookingId}`, { status: 'cancelled' });
                            Alert.alert("Success", "Your booking has been cancelled.");
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Home' }],
                            });
                        } catch (e) {
                            console.error('[Cancellation] Error:', e);
                            Alert.alert("Error", "Failed to cancel booking. Please try again.");
                        } finally {
                            setIsCancelling(false);
                        }
                    }
                }
            ]
        );
    };

    const renderIcon = (type: string) => {
        switch (type) {
            case 'cross': return <XCircle size={18} color={colors.error} />;
            case 'info': return <Info size={18} color={colors.primary} />;
            default: return <CheckCircle2 size={18} color={colors.primary} />;
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={styles.title}>{policy?.title || 'Policy'}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.policyCard}>
                    <ShieldAlert size={48} color={colors.warning} style={styles.policyIcon} />
                    <Text style={styles.policyTitle}>Important Notice</Text>
                    <Text style={styles.policyDescription}>
                        {policy?.description}
                    </Text>
                </View>

                <View style={styles.rulesContainer}>
                    {policy?.rules.map((rule, index) => (
                        <View key={index} style={styles.ruleItem}>
                            {renderIcon(rule.type)}
                            <Text style={styles.ruleText}>{rule.text}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.securityNote}>
                    <Text style={styles.noteTitle}>Security Protocol</Text>
                    <Text style={styles.noteText}>
                        Each flight involves precise scheduling. Cancellations affect the efficiency of our air mobility network.
                    </Text>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleConfirmCancel}
                    disabled={isCancelling}
                >
                    {isCancelling ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.cancelButtonText}>Cancel This Booking</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.backFooterButton}
                    onPress={() => navigation.goBack()}
                    disabled={isCancelling}
                >
                    <Text style={styles.backFooterButtonText}>Back to Map</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backButton: {
        marginRight: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.foreground,
    },
    content: {
        padding: 20,
    },
    policyCard: {
        alignItems: 'center',
        backgroundColor: '#fff8f1',
        padding: 25,
        borderRadius: 20,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#fed7aa',
    },
    policyIcon: {
        marginBottom: 15,
    },
    policyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#9a3412',
        marginBottom: 10,
    },
    policyDescription: {
        fontSize: 14,
        color: '#c2410c',
        textAlign: 'center',
        lineHeight: 20,
    },
    rulesContainer: {
        gap: 15,
        marginBottom: 30,
    },
    ruleItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        backgroundColor: '#f8fafc',
        padding: 16,
        borderRadius: 12,
    },
    ruleText: {
        flex: 1,
        fontSize: 14,
        color: colors.foreground,
        lineHeight: 20,
    },
    securityNote: {
        backgroundColor: '#f1f5f9',
        padding: 20,
        borderRadius: 12,
    },
    noteTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.foreground,
        marginBottom: 8,
    },
    noteText: {
        fontSize: 14,
        color: colors.mutedForeground,
        lineHeight: 20,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        gap: 12,
    },
    cancelButton: {
        backgroundColor: colors.error,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    backFooterButton: {
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    backFooterButtonText: {
        color: colors.mutedForeground,
        fontSize: 16,
        fontWeight: '600',
    },
});
