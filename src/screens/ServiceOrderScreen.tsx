import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Alert, Image } from 'react-native';
import { colors } from '../theme/colors';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { ArrowLeft, Clock, Calendar, CheckCircle, Droplet, Wrench } from 'lucide-react-native';

type Props = StackScreenProps<RootStackParamList, 'ServiceOrder'>;

export default function ServiceOrderScreen({ navigation, route }: Props) {
    const { type, bookingId } = route.params;
    const isFuel = type === 'fuel';
    const title = isFuel ? 'Order Hydrogen Refuel' : 'Maintenance Request';

    const [notes, setNotes] = useState('');
    const [ordered, setOrdered] = useState(false);

    const handleOrder = () => {
        // Simulate API call
        setTimeout(() => {
            setOrdered(true);
            Alert.alert('Success', `Your ${isFuel ? 'Hydrogen' : 'Maintenance'} order has been placed. Ground crew notified.`);
        }, 1000);
    };

    if (ordered) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.successContainer}>
                    <CheckCircle size={80} color={colors.success} />
                    <Text style={styles.successTitle}>Order Confirmed</Text>
                    <Text style={styles.successText}>Ground crew is en route to your bird.</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.primaryButton}>
                        <Text style={styles.buttonText}>Return to Flight</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={styles.title}>{title}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.iconContainer}>
                    {isFuel ? (
                        <Droplet size={64} color={colors.primary} />
                    ) : (
                        <Wrench size={64} color={colors.primary} />
                    )}
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>Bird ID</Text>
                    <Text style={styles.value}>Pushpako2 (Bird #42)</Text>

                    <View style={styles.divider} />

                    <Text style={styles.label}>Current Location</Text>
                    <Text style={styles.value}>In-Transit / En-route</Text>

                    <View style={styles.divider} />

                    <Text style={styles.label}>Urgency</Text>
                    <View style={styles.chipRow}>
                        <View style={styles.chipActive}><Text style={styles.chipTextActive}>Standard</Text></View>
                        <View style={styles.chip}><Text style={styles.chipText}>Urgent</Text></View>
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Additional Notes</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="E.g., Check rotor 3 noise..."
                        multiline
                        numberOfLines={4}
                        value={notes}
                        onChangeText={setNotes}
                        textAlignVertical="top"
                    />
                </View>

                <TouchableOpacity onPress={handleOrder} style={styles.primaryButton}>
                    <Text style={styles.buttonText}>Confirm Order</Text>
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
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        paddingTop: 48,
        gap: 16,
    },
    backButton: {
        padding: 8,
        borderRadius: 50,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: colors.border,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    content: {
        padding: 24,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 24
    },
    label: {
        fontSize: 14,
        color: colors.mutedForeground,
        marginBottom: 8
    },
    value: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 16
    },
    chipRow: {
        flexDirection: 'row',
        gap: 12
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
    },
    chipActive: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.primary,
    },
    chipText: {
        color: colors.mutedForeground,
        fontWeight: '600'
    },
    chipTextActive: {
        color: '#fff',
        fontWeight: '600'
    },
    inputContainer: {
        marginBottom: 32
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        minHeight: 120
    },
    primaryButton: {
        backgroundColor: colors.primary,
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
        elevation: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    successContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 16
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.foreground,
        marginTop: 16
    },
    successText: {
        fontSize: 16,
        color: colors.mutedForeground,
        textAlign: 'center',
        marginBottom: 32
    }
});
